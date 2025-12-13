"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Upload, Calendar, MapPin, 
  User, Tag, Type, Loader2, LayoutDashboard, Image as ImageIcon, Save, Grid, CheckCircle2, Link as LinkIcon, Plus, Trash2 
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// 1. Standard categories
const PREDEFINED_CATEGORIES = [
  "Design",
  "Engineering",
  "Product Management",
  "Marketing",
  "Data Science",
  "Business",
  "Sales"
]

// 2. Stock Images
const STOCK_IMAGES = [
  { id: "code", label: "Coding", url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1000&q=80" },
  { id: "design", label: "Abstract Design", url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=80" },
  { id: "meeting", label: "Business Meeting", url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80" },
  { id: "conf", label: "Conference", url: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1000&q=80" },
  { id: "laptop", label: "Workplace", url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80" },
  { id: "neon", label: "Cyberpunk", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80" },
  { id: "data", label: "Data & Charts", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80" },
  { id: "team", label: "Teamwork", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" },
]

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // UI States
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [imageMode, setImageMode] = useState<"upload" | "stock">("upload")

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    duration: "",
    speakerName: "",
    speakerTitle: "",
    speakerCompany: "",
    tags: "",
    category: "",
    location: "",
    level: "Beginner",
    status: "upcoming",
  })
  
  // Resources State (NEW)
  const [resources, setResources] = useState<{ title: string, url: string }[]>([])

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)

  // 1. Check Auth & Fetch Event
  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push("/login"); return }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile?.role !== "admin") { router.push("/"); return }
        setIsAuthorized(true)

        // Fetch Event Details
        const { data: event, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single()

        if (error || !event) {
          alert("Event not found")
          router.push("/admin")
          return
        }

        // Populate Form
        const dateObj = new Date(event.start_time)
        const dateStr = dateObj.toISOString().split('T')[0]
        const timeStr = dateObj.toTimeString().slice(0, 5)

        let tagsStr = ""
        if (Array.isArray(event.tags)) tagsStr = event.tags.join(", ")
        else if (typeof event.tags === "string") tagsStr = event.tags

        const speaker = event.speakers && event.speakers[0] ? event.speakers[0] : { name: "", title: "", company: "" }

        const category = event.category || PREDEFINED_CATEGORIES[0]
        if (!PREDEFINED_CATEGORIES.includes(category)) {
           setIsCustomCategory(true)
        }
        
        // Populate Resources
        if (event.resources && Array.isArray(event.resources)) {
            setResources(event.resources)
        }

        setFormData({
            title: event.title || "",
            description: event.description || "",
            startDate: dateStr,
            startTime: timeStr,
            duration: event.duration?.toString().replace(" minutes", "") || "",
            speakerName: speaker.name || event.speaker_name || "",
            speakerTitle: speaker.title || event.speaker_title || "",
            speakerCompany: speaker.company || event.speaker_company || "",
            tags: tagsStr,
            category: category,
            location: event.location || "",
            level: event.level || "Beginner",
            status: event.status || "upcoming"
        })

        if (event.image) {
            setCurrentImageUrl(event.image)
            setImagePreview(event.image)
        }

      } catch (error) {
        console.error("Error loading event:", error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [eventId, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleStockSelect = (url: string) => {
    setImageFile(null)
    setImagePreview(url)
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === "custom") {
      setIsCustomCategory(true)
      setFormData({ ...formData, category: "" })
    } else {
      setIsCustomCategory(false)
      setFormData({ ...formData, category: value })
    }
  }

  // Resource Handlers
  const addResource = () => {
    setResources([...resources, { title: "", url: "" }])
  }
  
  const removeResource = (index: number) => {
    const newRes = [...resources]
    newRes.splice(index, 1)
    setResources(newRes)
  }

  const updateResource = (index: number, field: "title" | "url", value: string) => {
    const newRes = [...resources]
    newRes[index][field] = value
    setResources(newRes)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = currentImageUrl

      // 1. Handle Image
      if (imageMode === "stock" && imagePreview !== currentImageUrl) {
         imageUrl = imagePreview
      } else if (imageMode === "upload" && imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("event-images")
          .getPublicUrl(fileName)
          
        imageUrl = publicUrl
      }

      // 2. Prepare Data
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(t => t.length > 0)
      const speakersArray = [{
        name: formData.speakerName,
        title: formData.speakerTitle,
        company: formData.speakerCompany || undefined,
      }]

      // 3. Update DB
      const { error: updateError } = await supabase
        .from("events")
        .update({
            title: formData.title,
            description: formData.description,
            start_time: startDateTime.toISOString(),
            duration: parseInt(formData.duration) || 0,
            category: formData.category,
            location: formData.location,
            level: formData.level,
            status: formData.status,
            tags: tagsArray,
            speakers: speakersArray,
            speaker_name: formData.speakerName,
            speaker_title: formData.speakerTitle,
            speaker_company: formData.speakerCompany || null,
            image: imageUrl,
            summary: formData.description.substring(0, 150) + "...",
            resources: resources, // Save the resources array!
        })
        .eq('id', eventId)

      if (updateError) throw updateError

      alert("Event updated successfully!")
      router.push("/")
      
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
  }

  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-white">
                <LayoutDashboard className="h-4 w-4" />
             </div>
             <h1 className="text-lg font-bold text-slate-900">Edit Event</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1: Details */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-amber-600">
                  <Type className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Event Details</h3>
               </div>
               <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-200 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea required rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-200 outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      {!isCustomCategory ? (
                        <select
                          value={PREDEFINED_CATEGORIES.includes(formData.category) ? formData.category : "custom"}
                          onChange={handleCategoryChange}
                          className="w-full border p-2 rounded bg-white"
                        >
                          {PREDEFINED_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="custom" className="font-bold text-amber-600">+ Custom...</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                           <input
                             required
                             type="text"
                             value={formData.category}
                             onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                             className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-200 outline-none"
                           />
                           <Button type="button" variant="outline" size="icon" onClick={() => setIsCustomCategory(false)}><ArrowLeft className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tags</label>
                      <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-200 outline-none" />
                    </div>
                 </div>
               </div>
            </div>

            {/* Card 2: Resources (NEW) */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-amber-600">
                      <LinkIcon className="h-5 w-5" />
                      <h3 className="font-semibold text-gray-900">Resources & Links</h3>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addResource}>
                     <Plus className="h-4 w-4 mr-2" /> Add Link
                  </Button>
               </div>
               
               <div className="space-y-3">
                  {resources.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4 border border-dashed rounded-lg">
                      No resources added yet. Add slides, recordings, or PDF links.
                    </p>
                  ) : (
                    resources.map((res, i) => (
                      <div key={i} className="flex gap-2 items-start">
                         <div className="flex-1 space-y-2">
                            <input 
                              type="text" 
                              placeholder="Title (e.g. Slide Deck)" 
                              value={res.title}
                              onChange={(e) => updateResource(i, "title", e.target.value)}
                              className="w-full text-sm border p-2 rounded"
                            />
                            <input 
                              type="text" 
                              placeholder="URL (https://...)" 
                              value={res.url}
                              onChange={(e) => updateResource(i, "url", e.target.value)}
                              className="w-full text-sm border p-2 rounded bg-gray-50"
                            />
                         </div>
                         <Button type="button" size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => removeResource(i)}>
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    ))
                  )}
               </div>
            </div>

            {/* Card 3: Time & Place */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-amber-600">
                  <Calendar className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Time & Place</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-1">Duration (min)</label>
                     <input required type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-1">Location</label>
                     <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
               </div>
            </div>

             {/* Card 4: Speaker */}
             <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-amber-600">
                  <User className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Speaker</h3>
               </div>
               <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input required type="text" value={formData.speakerName} onChange={e => setFormData({...formData, speakerName: e.target.value})} className="w-full border p-2 rounded" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input required type="text" value={formData.speakerTitle} onChange={e => setFormData({...formData, speakerTitle: e.target.value})} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Company</label>
                        <input type="text" value={formData.speakerCompany} onChange={e => setFormData({...formData, speakerCompany: e.target.value})} className="w-full border p-2 rounded" />
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Card 5: Poster */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-amber-600">
                     <ImageIcon className="h-5 w-5" />
                     <h3 className="font-semibold text-gray-900">Event Poster</h3>
                  </div>
                   <div className="flex bg-gray-100 rounded-lg p-1">
                     <button type="button" onClick={() => setImageMode("upload")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", imageMode === "upload" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}>Upload</button>
                     <button type="button" onClick={() => setImageMode("stock")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", imageMode === "stock" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}>Stock</button>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="relative h-48 rounded border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                     {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <p className="text-gray-400">No Image Selected</p>}
                     {imageMode === "upload" && <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />}
                  </div>
                  {imageMode === "stock" && (
                    <div className="grid grid-cols-2 gap-2 mt-4 max-h-48 overflow-y-auto pr-1">
                      {STOCK_IMAGES.map((img) => (
                        <div key={img.id} onClick={() => handleStockSelect(img.url)} className={cn("relative aspect-video cursor-pointer rounded-md overflow-hidden border-2 transition-all hover:opacity-90", imagePreview === img.url ? "border-amber-600 ring-2 ring-amber-200" : "border-transparent")}>
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                          {imagePreview === img.url && <div className="absolute inset-0 bg-amber-900/20 flex items-center justify-center"><CheckCircle2 className="text-white h-6 w-6 drop-shadow-md" /></div>}
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border p-2 rounded bg-white">
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                </select>
            </div>

            <Button type="submit" size="lg" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
               {isSubmitting ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Update Event</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}