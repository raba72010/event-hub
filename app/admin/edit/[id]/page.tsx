"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Upload, Calendar, MapPin, 
  User, Tag, Type, Loader2, LayoutDashboard, Image as ImageIcon, Save
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// Helper to unwrap params in Next.js 13+
export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params)
  const eventId = resolvedParams.id

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)

  // 1. Check Auth & Fetch Event Data
  useEffect(() => {
    async function init() {
      try {
        // A. Check Admin Status
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push("/login"); return }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile?.role !== "admin") { router.push("/"); return }
        setIsAuthorized(true)

        // B. Fetch Event Details
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

        // C. Populate Form
        const dateObj = new Date(event.start_time)
        const dateStr = dateObj.toISOString().split('T')[0]
        const timeStr = dateObj.toTimeString().slice(0, 5) // HH:MM

        // Handle tags (array or string)
        let tagsStr = ""
        if (Array.isArray(event.tags)) tagsStr = event.tags.join(", ")
        else if (typeof event.tags === "string") tagsStr = event.tags

        // Handle speakers (take first one)
        const speaker = event.speakers && event.speakers[0] ? event.speakers[0] : { name: "", title: "", company: "" }

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
            category: event.category || "",
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = currentImageUrl

      // Upload new image if selected
      if (imageFile) {
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

      // Prepare Data
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(t => t.length > 0)
      const speakersArray = [{
        name: formData.speakerName,
        title: formData.speakerTitle,
        company: formData.speakerCompany || undefined,
      }]

      // Update Database
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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
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
            {/* Details */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-amber-600">
                  <Type className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Event Details</h3>
               </div>
               <div className="space-y-4">
                 <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded" placeholder="Title" />
                 <textarea required rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded" placeholder="Description" />
                 <div className="grid grid-cols-2 gap-4">
                    <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border p-2 rounded" placeholder="Category" />
                    <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full border p-2 rounded" placeholder="Tags" />
                 </div>
               </div>
            </div>

            {/* Time */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-amber-600">
                  <Calendar className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Time & Place</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border p-2 rounded" />
                  <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border p-2 rounded" />
                  <input required type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full border p-2 rounded" placeholder="Duration (min)" />
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border p-2 rounded" placeholder="Location" />
               </div>
            </div>

             {/* Speaker */}
             <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-amber-600">
                  <User className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Speaker</h3>
               </div>
               <div className="space-y-4">
                 <input required type="text" value={formData.speakerName} onChange={e => setFormData({...formData, speakerName: e.target.value})} className="w-full border p-2 rounded" placeholder="Name" />
                 <div className="grid grid-cols-2 gap-4">
                    <input required type="text" value={formData.speakerTitle} onChange={e => setFormData({...formData, speakerTitle: e.target.value})} className="w-full border p-2 rounded" placeholder="Job Title" />
                    <input type="text" value={formData.speakerCompany} onChange={e => setFormData({...formData, speakerCompany: e.target.value})} className="w-full border p-2 rounded" placeholder="Company" />
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <h3 className="font-semibold text-gray-900 mb-4">Event Poster</h3>
               <div className="relative h-48 rounded border-2 border-dashed flex items-center justify-center overflow-hidden">
                  {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <p className="text-gray-400">Upload Image</p>}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
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