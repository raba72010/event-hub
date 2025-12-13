"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Upload, Calendar, MapPin, 
  User, Tag, Type, Loader2, LayoutDashboard, Image as ImageIcon, Grid, CheckCircle2 
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// 1. Define standard categories
const PREDEFINED_CATEGORIES = [
  "Design",
  "Engineering",
  "Product Management",
  "Marketing",
  "Data Science",
  "Business",
  "Sales"
]

// 2. Define High-Quality Stock Images
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

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  
  // New state for toggling between Upload and Stock
  const [imageMode, setImageMode] = useState<"upload" | "stock">("upload")

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
    category: PREDEFINED_CATEGORIES[0],
    location: "",
    level: "Beginner",
    status: "upcoming",
  })
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/login")
          return
        }
        
        setUserEmail(user.email || null)

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError || profile?.role !== "admin") {
          router.push("/")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("Error checking admin access:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle clicking a stock image
  const handleStockSelect = (url: string) => {
    setImageFile(null) // Clear file input
    setImagePreview(url) // Set the stock URL as the preview
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("You must be logged in")
        setIsSubmitting(false)
        return
      }

      let imageUrl = imagePreview // Default to whatever is shown in preview (Stock or Upload)

      // If they uploaded a NEW file, we must upload it to Supabase Storage
      if (imageMode === "upload" && imageFile) {
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

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(t => t.length > 0)
      
      const speakersArray = [{
        name: formData.speakerName,
        title: formData.speakerTitle,
        company: formData.speakerCompany || undefined,
      }]

      const { error: insertError } = await supabase.from("events").insert({
        title: formData.title,
        description: formData.description,
        start_time: startDateTime.toISOString(),
        duration: parseInt(formData.duration) || 0,
        category: formData.category,
        location: formData.location || "Virtual webinar",
        level: formData.level,
        status: formData.status,
        tags: tagsArray,
        speakers: speakersArray,
        speaker_name: formData.speakerName,
        speaker_title: formData.speakerTitle,
        speaker_company: formData.speakerCompany || null,
        image: imageUrl,
        summary: formData.description.substring(0, 150) + "...",
      })

      if (insertError) throw insertError

      alert("Event created successfully!")
      router.push("/")
      
    } catch (error: any) {
      console.error("Error:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white">
                <LayoutDashboard className="h-4 w-4" />
             </div>
             <h1 className="text-lg font-bold text-slate-900">Admin Studio</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded-full">
               {userEmail}
            </span>
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Exit
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Create New Event</h2>
          <p className="text-slate-500">Fill in the details below to publish a new workshop.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1: Details */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-indigo-600">
                  <Type className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Event Details</h3>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                   <input
                     required
                     type="text"
                     value={formData.title}
                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                     className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                     placeholder="e.g. Advanced React Patterns"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                   <textarea
                     required
                     rows={5}
                     value={formData.description}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                     className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                     placeholder="What will attendees learn?"
                   />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      {!isCustomCategory ? (
                        <select
                          value={formData.category}
                          onChange={handleCategoryChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white cursor-pointer"
                        >
                          {PREDEFINED_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="custom" className="font-bold text-indigo-600">+ Add New Category...</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                           <input
                             required
                             autoFocus
                             type="text"
                             value={formData.category}
                             onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                             className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none animate-in fade-in"
                             placeholder="Type new category..."
                           />
                           <Button type="button" variant="outline" onClick={() => { setIsCustomCategory(false); setFormData({ ...formData, category: PREDEFINED_CATEGORIES[0] }) }}>Cancel</Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                          placeholder="react, css, ux"
                        />
                      </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Card 2: Time & Place */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-indigo-600">
                  <Calendar className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Time & Place</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input required type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input required type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input required type="number" min="1" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="60" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                       <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="Virtual / Zoom Link" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Card 3: Speaker */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-indigo-600">
                  <User className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Speaker Profile</h3>
               </div>
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                   <input required type="text" value={formData.speakerName} onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="Jane Doe" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                       <input required type="text" value={formData.speakerTitle} onChange={(e) => setFormData({ ...formData, speakerTitle: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="Senior Engineer" />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                       <input type="text" value={formData.speakerCompany} onChange={(e) => setFormData({ ...formData, speakerCompany: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="Acme Corp" />
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Card 4: Event Poster (UPDATED WITH TABS) */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                     <ImageIcon className="h-5 w-5" />
                     <h3 className="font-semibold text-gray-900">Event Poster</h3>
                  </div>
                  {/* Toggle Switch */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                     <button
                       type="button"
                       onClick={() => setImageMode("upload")}
                       className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", imageMode === "upload" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}
                     >
                       Upload
                     </button>
                     <button
                       type="button"
                       onClick={() => setImageMode("stock")}
                       className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", imageMode === "stock" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}
                     >
                       Stock
                     </button>
                  </div>
               </div>
               
               <div className="space-y-4">
                  {/* PREVIEW BOX */}
                  <div className="relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
                     {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                           {imageMode === "upload" ? <Upload className="w-8 h-8 mb-3 text-gray-400" /> : <Grid className="w-8 h-8 mb-3 text-gray-400" />}
                           <p className="mb-2 text-sm text-gray-500">
                             {imageMode === "upload" ? "Click to upload image" : "Select from grid below"}
                           </p>
                        </div>
                     )}
                     
                     {/* Hidden File Input (Only active if mode is Upload) */}
                     {imageMode === "upload" && (
                       <input 
                         type="file" 
                         accept="image/*" 
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         onChange={handleImageChange}
                       />
                     )}
                  </div>

                  {/* STOCK GRID (Only visible if mode is Stock) */}
                  {imageMode === "stock" && (
                    <div className="grid grid-cols-2 gap-2 mt-4 max-h-48 overflow-y-auto pr-1">
                      {STOCK_IMAGES.map((img) => (
                        <div 
                          key={img.id} 
                          onClick={() => handleStockSelect(img.url)}
                          className={cn(
                            "relative aspect-video cursor-pointer rounded-md overflow-hidden border-2 transition-all hover:opacity-90",
                            imagePreview === img.url ? "border-indigo-600 ring-2 ring-indigo-200" : "border-transparent"
                          )}
                        >
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                          {imagePreview === img.url && (
                             <div className="absolute inset-0 bg-indigo-900/20 flex items-center justify-center">
                                <CheckCircle2 className="text-white h-6 w-6 drop-shadow-md" />
                             </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                             <p className="text-[10px] text-white text-center font-medium">{img.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 text-center">
                    {imageMode === "upload" ? "Recommended: 1200x600px (JPG, PNG)" : "High quality images from Unsplash"}
                  </p>
               </div>
            </div>

            {/* Card 5: Settings */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                    <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white">
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past (On-Demand)</option>
                    </select>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-3">
               <Button type="submit" size="lg" className="w-full bg-slate-900 hover:bg-slate-800" disabled={isSubmitting}>
                 {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : "Publish Event"}
               </Button>
               <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/")}>Cancel</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}