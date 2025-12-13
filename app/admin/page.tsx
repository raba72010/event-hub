"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, User, ArrowLeft } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"
import { UserSidebar } from "@/components/user-sidebar"

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
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
    level: "",
    status: "upcoming",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        // First, get the current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/login")
          setIsLoading(false)
          return
        }

        // Then, fetch the profile to check role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          router.push("/")
          setIsLoading(false)
          return
        }

        if (profile?.role !== "admin") {
          router.push("/")
          setIsLoading(false)
          return
        }

        setIsAdmin(true)
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking admin access:", error)
        setIsLoading(false)
        router.push("/")
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("You must be logged in to create events")
        setIsSubmitting(false)
        return
      }

      let imageUrl: string | null = null

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = fileName

        const { error: uploadError } = await supabase.storage.from("event-images").upload(filePath, imageFile)

        if (uploadError) {
          console.error("FULL SUPABASE ERROR:", uploadError)
          alert(`Failed to upload image: ${uploadError.message || "Unknown error"}`)
          setIsSubmitting(false)
          return
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("event-images").getPublicUrl(filePath)
        imageUrl = publicUrl
      }

      // Combine date and time into start_time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const startTimeISO = startDateTime.toISOString()

      // Parse tags (comma-separated string to array)
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      // Create speakers array
      const speakersArray = [
        {
          name: formData.speakerName,
          title: formData.speakerTitle,
          company: formData.speakerCompany || undefined,
        },
      ]

      // Insert event into database
      const { error: insertError } = await supabase.from("events").insert({
        title: formData.title,
        description: formData.description,
        start_time: startTimeISO,
        // ----------------------------------------------------
        // 👇 THIS IS THE FIX: Ensure it sends a NUMBER, not a STRING
        duration: parseInt(formData.duration), 
        // ----------------------------------------------------
        category: formData.category,
        location: formData.location || "Virtual webinar",
        level: formData.level || null,
        status: formData.status,
        tags: tagsArray,
        speakers: speakersArray,
        speaker_name: formData.speakerName,
        speaker_title: formData.speakerTitle,
        speaker_company: formData.speakerCompany || null,
        image: imageUrl || null,
        summary: formData.description.substring(0, 150) + (formData.description.length > 150 ? "..." : ""),
      })

      if (insertError) {
        console.error("FULL SUPABASE ERROR:", insertError)
        alert(`Failed to create event: ${insertError.message || "Unknown error"}`)
        setIsSubmitting(false)
        return
      }

      // Reset form
      setFormData({
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
        level: "",
        status: "upcoming",
      })
      setImageFile(null)
      setImagePreview(null)
      alert("Event created successfully!")
    } catch (error: any) {
      console.error("FULL SUPABASE ERROR:", error)
      const errorMessage = error?.message || error?.error?.message || "An unknown error occurred"
      alert(`Error creating event: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
              <div className="h-5 w-5 rounded-sm bg-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">ProWebinar Hub</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden md:flex" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <UserSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h2>
              <p className="text-sm text-gray-600 mt-1">Create and manage events</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                  placeholder="e.g., Design Masterclass 2025"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                  placeholder="Describe the event..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    id="duration"
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                    placeholder="90"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    id="category"
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                    placeholder="e.g., UX Strategy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                    placeholder="Virtual webinar"
                  />
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                  >
                    <option value="">All levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>

              <div>
                <label htmlFor="speakerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Speaker Name *
                </label>
                <input
                  id="speakerName"
                  type="text"
                  required
                  value={formData.speakerName}
                  onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                  placeholder="e.g., Jane Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="speakerTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Speaker Role *
                  </label>
                  <input
                    id="speakerTitle"
                    type="text"
                    required
                    value={formData.speakerTitle}
                    onChange={(e) => setFormData({ ...formData, speakerTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                    placeholder="e.g., Director of Product Design"
                  />
                </div>

                <div>
                  <label htmlFor="speakerCompany" className="block text-sm font-medium text-gray-700 mb-2">
                    Speaker Company
                  </label>
                  <input
                    id="speakerCompany"
                    type="text"
                    value={formData.speakerCompany}
                    onChange={(e) => setFormData({ ...formData, speakerCompany: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                    placeholder="e.g., Acme Corp"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                  placeholder="e.g., Product Design, Research, Conversion"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Poster
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-gray-900"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="max-w-xs rounded-lg border border-gray-200" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Event"}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => router.push("/")}>
                  Cancel
                </Button>
              </div>
            </form>
          </main>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:w-80">
            <div className="sticky top-24">
              <UserSidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}