"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Upload, Calendar, MapPin, 
  User, Tag, Type, Loader2, LayoutDashboard, Image as ImageIcon 
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { UserSidebar } from "@/components/user-sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  
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

      let imageUrl: string | null = null

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
      {/* ---------------- HEADER ---------------- */}
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
          
          {/* ---------------- LEFT COLUMN (Main Info) ---------------- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1: Basic Info */}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        required
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        placeholder="e.g. Design, Engineering"
                      />
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

            {/* Card 2: Date & Location */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-indigo-600">
                  <Calendar className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Time & Place</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      required
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      required
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                       <input
                         type="text"
                         value={formData.location}
                         onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                         className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                         placeholder="Virtual / Zoom Link"
                       />
                    </div>
                  </div>
               </div>
            </div>

            {/* Card 3: Speaker Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-indigo-600">
                  <User className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Speaker Profile</h3>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                   <input
                     required
                     type="text"
                     value={formData.speakerName}
                     onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                     className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                     placeholder="Jane Doe"
                   />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                       <input
                         required
                         type="text"
                         value={formData.speakerTitle}
                         onChange={(e) => setFormData({ ...formData, speakerTitle: e.target.value })}
                         className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                         placeholder="Senior Engineer"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                       <input
                         type="text"
                         value={formData.speakerCompany}
                         onChange={(e) => setFormData({ ...formData, speakerCompany: e.target.value })}
                         className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                         placeholder="Acme Corp"
                       />
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* ---------------- RIGHT COLUMN (Media & Status) ---------------- */}
          <div className="space-y-6">
            
            {/* Card 4: Event Poster */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-indigo-600">
                  <ImageIcon className="h-5 w-5" />
                  <h3 className="font-semibold text-gray-900">Event Poster</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden group">
                     {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                           <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-indigo-500" />
                           <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                        </div>
                     )}
                     <input 
                       type="file" 
                       accept="image/*" 
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       onChange={handleImageChange}
                     />
                  </div>
                  <p className="text-xs text-gray-500 text-center">Recommended: 1200x600px (JPG, PNG)</p>
               </div>
            </div>

            {/* Card 5: Settings */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
               <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
               
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past (On-Demand)</option>
                    </select>
                  </div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
               <Button 
                 type="submit" 
                 size="lg" 
                 className="w-full bg-slate-900 hover:bg-slate-800"
                 disabled={isSubmitting}
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                   </>
                 ) : (
                   "Publish Event"
                 )}
               </Button>
               <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/")}>
                 Cancel
               </Button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}