"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  User, Mail, Building, Briefcase, 
  Calendar, MapPin, Clock, Heart, Ticket, 
  LogOut, Loader2, ArrowLeft, Save
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"tickets" | "favorites" | "settings">("tickets")
  
  // Data States
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({})
  const [registrations, setRegistrations] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)

      // 1. Fetch Profile Details
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      setProfile(profileData || { full_name: "", company: "", title: "" })

      // 2. Fetch Registrations (and join with events)
      const { data: regData } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .eq("user_id", user.id)
      
      // Filter out any where event might be null (deleted events)
      setRegistrations((regData || []).filter(r => r.events))

      // 3. Fetch Favorites
      const { data: favData } = await supabase
        .from("favorites")
        .select("*, events(*)")
        .eq("user_id", user.id)

      setFavorites((favData || []).filter(f => f.events))
      
      setIsLoading(false)
    }

    init()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updates = {
        id: user.id,
        full_name: profile.full_name,
        company: profile.company,
        title: profile.title,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").upsert(updates)
      if (error) throw error
      alert("Profile updated!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">E</div>
             <Link href="/" className="text-xl font-bold text-slate-900">EventHub</Link>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR (Profile Card) */}
          <aside className="w-full md:w-72 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
               <div className="h-24 w-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 mb-4">
                  {profile.full_name ? profile.full_name.charAt(0) : user.email.charAt(0)}
               </div>
               <h2 className="text-xl font-bold text-gray-900">{profile.full_name || "User"}</h2>
               <p className="text-sm text-gray-500 mb-6">{user.email}</p>
               
               <div className="flex flex-col gap-2">
                 <button 
                   onClick={() => setActiveTab("tickets")}
                   className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "tickets" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
                 >
                   <Ticket className="h-4 w-4" /> My Tickets
                 </button>
                 <button 
                   onClick={() => setActiveTab("favorites")}
                   className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "favorites" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
                 >
                   <Heart className="h-4 w-4" /> Saved Events
                 </button>
                 <button 
                   onClick={() => setActiveTab("settings")}
                   className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "settings" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
                 >
                   <User className="h-4 w-4" /> Edit Profile
                 </button>
               </div>

               <div className="mt-6 pt-6 border-t border-gray-100">
                 <button onClick={handleSignOut} className="flex items-center justify-center gap-2 w-full text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <LogOut className="h-4 w-4" /> Sign Out
                 </button>
               </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1">
            
            {/* TAB: TICKETS */}
            {activeTab === "tickets" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
                {registrations.length === 0 ? (
                  <EmptyState title="No tickets yet" message="You haven't registered for any events." />
                ) : (
                  <div className="grid gap-4">
                    {registrations.map(({ events: event }) => (
                      <EventRow key={event.id} event={event} type="ticket" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: FAVORITES */}
            {activeTab === "favorites" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900">Saved Events</h2>
                {favorites.length === 0 ? (
                  <EmptyState title="No favorites" message="Events you save will appear here." />
                ) : (
                  <div className="grid gap-4">
                    {favorites.map(({ events: event }) => (
                      <EventRow key={event.id} event={event} type="favorite" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          value={profile.full_name || ""} 
                          onChange={e => setProfile({...profile, full_name: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          value={profile.title || ""} 
                          onChange={e => setProfile({...profile, title: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="e.g. Product Designer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          value={profile.company || ""} 
                          onChange={e => setProfile({...profile, company: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="e.g. Acme Corp"
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}

// Sub-components for clean code
function EmptyState({ title, message }: { title: string, message: string }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
      <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <User className="h-6 w-6 text-gray-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

function EventRow({ event, type }: { event: any, type: "ticket" | "favorite" }) {
  const router = useRouter()
  // Format date
  const date = new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div 
      onClick={() => router.push('/')} // Ideally this opens the modal, but for now we go home
      className="group flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Image */}
      <div className="h-32 md:h-24 w-full md:w-40 bg-slate-100 rounded-lg overflow-hidden shrink-0">
        {event.image ? (
          <img src={event.image} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-2xl">
            {event.title.charAt(0)}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1">
         <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mb-2 inline-block">
              {type === "ticket" ? "Registered" : "Favorite"}
            </span>
            <span className="text-xs text-gray-400">{event.category}</span>
         </div>
         <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
         <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {date}</div>
            <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {time}</div>
            <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location || "Virtual"}</div>
         </div>
      </div>
    </div>
  )
}