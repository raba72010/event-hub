"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, User, Calendar, Clock, MapPin, ArrowRight, Star, X, Edit, Search, Filter, Trash2, History, Users, Check } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"
import { UserSidebar } from "@/components/user-sidebar"
import { EventDetailModal } from "@/components/event-detail-modal"
import { cn } from "@/lib/utils"
import type { Event } from "@/types/event"

export default function ProWebinarHub() {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // 🔍 NEW: Store user's registrations
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set())

  // 🔍 Search & Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // 1. AUTH LOGIC + ADMIN CHECK + FETCH REGISTRATIONS
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsSignedIn(!!session)
      setUserEmail(session?.user?.email || null)

      if (session?.user) {
        // Check Admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profile?.role === 'admin') setIsAdmin(true)

        // Fetch User Registrations
        const { data: registrations } = await supabase
          .from('registrations')
          .select('event_id')
          .eq('user_id', session.user.id)
        
        if (registrations) {
           const ids = new Set(registrations.map((r: any) => r.event_id))
           setRegisteredEventIds(ids)
        }
      }
    }
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session)
      setUserEmail(session?.user?.email || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // 2. DATA FETCHING
  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("start_time", { ascending: true })

        if (error) { setIsLoading(false); return }

        const mappedEvents: Event[] = (data || []).map((row: any) => {
          const startTime = row.start_time ? new Date(row.start_time) : null
          const date = startTime ? startTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : row.date || ""
          const time = startTime ? startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : row.time || ""
          
          let tags: string[] = []
          if (row.tags) {
             if (typeof row.tags === "string") { try { tags = JSON.parse(row.tags) } catch { tags = row.tags.split(",").map((t: string) => t.trim()) } }
             else if (Array.isArray(row.tags)) { tags = row.tags }
          }
          
          let speakers: Event["speakers"] = []
          if (row.speakers) {
             if (typeof row.speakers === "string") { try { speakers = JSON.parse(row.speakers) } catch { } }
             else if (Array.isArray(row.speakers)) { speakers = row.speakers }
          }
          if (speakers.length === 0 && row.speaker_name) {
              speakers = [{ name: row.speaker_name, title: row.speaker_title || "", company: row.speaker_company, avatarUrl: row.speaker_avatar_url }]
          }

          return {
            id: row.id?.toString() || "",
            title: row.title || "",
            category: row.category || "General",
            date, time, duration: row.duration || "",
            location: row.location || "Virtual",
            level: row.level,
            status: row.status === "past" ? "on-demand" : "upcoming", 
            description: row.description || "",
            summary: row.summary,
            resources: row.resources || [],
            image: row.image,
            tags, speakers,
          }
        })
        setEvents(mappedEvents)
      } catch (error) { console.error(error) } 
      finally { setIsLoading(false) }
    }
    fetchEvents()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    try {
        const { error } = await supabase.from("events").delete().eq("id", eventId)
        if (error) throw error
        setEvents(prev => prev.filter(e => e.id !== eventId))
        alert("Event deleted.")
    } catch (error: any) {
        alert("Error deleting event: " + error.message)
    }
  }

  // 🔍 Filter Logic
  const categories = ["All", ...Array.from(new Set(events.map(e => e.category)))]
  
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // ✂️ SPLIT EVENTS
  const upcomingEvents = filteredEvents.filter(e => e.status !== "on-demand")
  const pastEvents = filteredEvents.filter(e => e.status === "on-demand")

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          
          {/* LOGO SECTION */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="SPC Logo" 
              className="h-10 w-10 object-contain rounded-full bg-white"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} 
            />
            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold">SPC</div>
            
            <div className="flex flex-col">
               <span className="text-sm font-bold leading-none text-slate-900">SPC</span>
               <span className="text-[10px] font-medium text-slate-500">Sudanese Professionals Club</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isSignedIn ? (
              <>
                {isAdmin && <Link href="/admin"><Button variant="ghost" className="text-indigo-600 font-medium">Admin Dashboard</Button></Link>}
                <Link href="/profile"><Button variant="ghost" className="text-slate-600 hover:text-slate-900"><User className="h-4 w-4 mr-2" />My Profile</Button></Link>
                <div className="h-6 w-px bg-slate-200" />
                <Button onClick={handleLogout} variant="outline" size="sm" className="border-slate-300">Sign Out</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost">Log in</Button></Link>
                <Link href="/login?view=sign_up"><Button className="bg-slate-900 hover:bg-slate-800 text-white">Join Now</Button></Link>
              </>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild className="md:hidden"><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white"><UserSidebar isSignedIn={isSignedIn} userEmail={userEmail} /></SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* HERO SECTION */}
      {!isSignedIn && (
        <section className="relative overflow-hidden bg-slate-900 py-20 md:py-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full max-w-7xl opacity-20 pointer-events-none">
             <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-emerald-500 blur-[100px]" />
             <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-red-500 blur-[100px]" />
          </div>

          <div className="container relative mx-auto px-4 text-center md:px-6">
            <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm font-medium text-slate-300 mb-6">
              <Star className="mr-2 h-3.5 w-3.5 text-yellow-500" /> Connecting Professionals Since 2024
            </div>
            <h1 className="mx-auto max-w-5xl text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl leading-tight">
               نادي المحترفين السودانيين <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-red-400">
                Sudanese Professionals Club
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
               Empowering professionals, fostering innovation, and building a stronger community through knowledge sharing.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-full" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
                Explore Activities
              </Button>
              <Link href="/login?view=sign_up">
                <Button size="lg" variant="outline" className="h-12 px-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full">
                   Join Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-12 md:px-6">
        
        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
               {isSignedIn ? "Welcome Back, Professional" : "Upcoming Activities"}
            </h2>
            <p className="text-slate-500 mt-1">
               {isSignedIn ? "Here are the latest workshops tailored for you." : "Join our upcoming sessions and events."}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search activities..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
             </div>
             <div className="relative">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-4 pr-8 py-2 w-full sm:w-auto rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none cursor-pointer"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
             </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
           <div className="flex justify-center py-20"><p className="text-slate-400 animate-pulse">Loading SPC events...</p></div>
        ) : (
          <div className="space-y-16">
            
            {/* --- UPCOMING EVENTS GRID --- */}
            <div>
              {upcomingEvents.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isAdmin={isAdmin} 
                      isRegistered={registeredEventIds.has(event.id)}
                      router={router} 
                      onDelete={handleDelete} 
                      onSelect={() => setSelectedEvent(event)} 
                    />
                  ))}
                </div>
              ) : (
                 (pastEvents.length === 0 || searchQuery !== "") && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                      <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No upcoming activities found</h3>
                      <p className="text-gray-500">Try adjusting your search or check back later.</p>
                      <Button variant="ghost" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }} className="mt-2 text-emerald-600">Clear filters</Button>
                    </div>
                 )
              )}
            </div>

            {/* --- PAST EVENTS GRID --- */}
            {pastEvents.length > 0 && (
              <div className="relative">
                 <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Past Events</h2>
                    <div className="h-px flex-1 bg-slate-200" />
                 </div>
                 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-80 hover:opacity-100 transition-opacity">
                    {pastEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        isAdmin={isAdmin} 
                        isRegistered={registeredEventIds.has(event.id)}
                        router={router} 
                        onDelete={handleDelete} 
                        onSelect={() => setSelectedEvent(event)} 
                        isPast={true}
                      />
                    ))}
                 </div>
              </div>
            )}

          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
             <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">SPC</div>
             <span className="font-bold text-slate-900">Sudanese Professionals Club</span>
           </div>
           <p className="text-sm text-slate-500">© 2025 SPC. All rights reserved.</p>
        </div>
      </footer>

      {selectedEvent && <EventDetailModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} isSignedIn={isSignedIn} />}
    </div>
  )
}

function EventCard({ event, isAdmin, isRegistered, router, onDelete, onSelect, isPast = false }: any) {
  return (
    <div 
      onClick={onSelect} 
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white border shadow-sm transition-all cursor-pointer",
        isPast ? "border-slate-100 grayscale-[0.3] hover:grayscale-0" : "border-slate-200 hover:shadow-xl hover:-translate-y-1"
      )}
    >
      {isAdmin && (
        <div className="absolute top-3 right-3 z-20 flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); router.push(`/admin/attendees/${event.id}`) }}
              className="p-2 bg-white/90 rounded-full hover:bg-blue-50 text-blue-600 shadow-sm border border-blue-100 transition-colors"
              title="View Attendees"
            >
              <Users className="h-4 w-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); router.push(`/admin/edit/${event.id}`) }}
              className="p-2 bg-white/90 rounded-full hover:bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100 transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(event.id) }}
              className="p-2 bg-white/90 rounded-full hover:bg-red-50 text-red-600 shadow-sm border border-red-100 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
        </div>
      )}

      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
         {event.image ? (
           <img src={event.image} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
         ) : (
           <div className="h-full w-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white/50 text-4xl font-bold">{event.title.charAt(0)}</div>
         )}
         <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
           {isPast ? "Past Event" : event.category}
         </div>
      </div>
      
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 mb-3">
           {isPast ? <History className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
           {event.date} • {event.time}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{event.description}</p>
        
        <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mb-5">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
             {event.speakers && event.speakers[0]?.avatarUrl ? <img src={event.speakers[0].avatarUrl} className="h-full w-full object-cover" /> : <User className="h-4 w-4 text-slate-500" />}
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-900">{event.speakers?.[0]?.name || "Guest Speaker"}</p>
          </div>
        </div>
        
        {/* 👇 UPDATED BUTTON LOGIC */}
        {isRegistered ? (
          <Button 
            variant="outline"
            className="w-full rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-default"
          >
            <Check className="mr-2 h-4 w-4" /> Registered
          </Button>
        ) : (
          <Button 
            variant={isPast ? "outline" : "default"}
            className={cn("w-full rounded-lg transition-colors", !isPast && "bg-slate-900 hover:bg-slate-800 text-white group-hover:bg-emerald-600")}
          >
            {isPast ? "View Details" : "Register Now"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}