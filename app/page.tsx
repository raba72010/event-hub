"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, User, Calendar, Clock, MapPin, ArrowRight, Star, X, Edit } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"
import { UserSidebar } from "@/components/user-sidebar"
import { EventDetailModal } from "@/components/event-detail-modal"
import type { Event } from "@/types/event"

export default function ProWebinarHub() {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 1. AUTH LOGIC + ADMIN CHECK
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsSignedIn(!!session)
      setUserEmail(session?.user?.email || null)

      if (session?.user) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profile?.role === 'admin') {
          setIsAdmin(true)
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

  // 2. DATA FETCHING LOGIC
  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("start_time", { ascending: true })

        if (error) {
          console.error("Error fetching events:", error)
          setIsLoading(false)
          return
        }

        const mappedEvents: Event[] = (data || []).map((row: any) => {
          const startTime = row.start_time ? new Date(row.start_time) : null
          const date = startTime
            ? startTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : row.date || ""
          const time = startTime
            ? startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
            : row.time || ""

          let tags: string[] = []
          if (row.tags) {
            if (typeof row.tags === "string") {
              try { tags = JSON.parse(row.tags) } catch { tags = row.tags.split(",").map((t: string) => t.trim()) }
            } else if (Array.isArray(row.tags)) { tags = row.tags }
          }

          let speakers: Event["speakers"] = []
          if (row.speakers) {
            if (typeof row.speakers === "string") {
              try { speakers = JSON.parse(row.speakers) } catch { /* fallback */ }
            } else if (Array.isArray(row.speakers)) { speakers = row.speakers }
          } 
          if (speakers.length === 0 && row.speaker_name) {
             speakers = [{
                name: row.speaker_name,
                title: row.speaker_title || "",
                company: row.speaker_company,
                avatarUrl: row.speaker_avatar_url,
              }]
          }

          return {
            id: row.id?.toString() || "",
            title: row.title || "",
            category: row.category || "General",
            date,
            time,
            duration: row.duration || "",
            location: row.location || "Virtual",
            level: row.level,
            status: row.status === "past" ? "on-demand" : "upcoming",
            description: row.description || "",
            summary: row.summary,
            image: row.image,
            tags,
            speakers,
          }
        })

        setEvents(mappedEvents)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">E</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">EventHub</span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isSignedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-indigo-600 font-medium">Admin Dashboard</Button>
                  </Link>
                )}
                {/* 👇 UPDATED: Link to Profile Page */}
                <Link href="/profile">
                  <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                </Link>
                <div className="h-6 w-px bg-slate-200" />
                <Button onClick={handleLogout} variant="outline" size="sm" className="border-slate-300">Sign Out</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost">Log in</Button></Link>
                <Link href="/login?view=sign_up"><Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Get Started</Button></Link>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white">
              <UserSidebar isSignedIn={isSignedIn} userEmail={userEmail} />
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-900 py-20 md:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full max-w-7xl opacity-20 pointer-events-none">
           <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-indigo-500 blur-[100px]" />
           <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-purple-500 blur-[100px]" />
        </div>

        <div className="container relative mx-auto px-4 text-center md:px-6">
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-6">
            <Star className="mr-2 h-3.5 w-3.5" /> New Events Added Weekly
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            Discover World-Class <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Workshops & Events</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">Join expert-led sessions on Design, Coding, and Product.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-full">Explore Events</Button>
            {isAdmin && (
              <Link href="/admin">
                 <Button size="lg" variant="outline" className="h-12 px-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full">Host an Event</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* EVENTS GRID */}
      <section className="container mx-auto px-4 py-20 md:px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Upcoming Events</h2>
          <span className="text-sm font-medium text-slate-500">{events.length} events available</span>
        </div>

        {isLoading ? (
           <div className="flex justify-center py-20"><p className="text-slate-400 animate-pulse">Loading amazing events...</p></div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div 
                key={event.id}
                onClick={() => setSelectedEvent(event)} 
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              >
                {/* ADMIN EDIT BUTTON */}
                {isAdmin && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation() // Don't open modal
                      router.push(`/admin/edit/${event.id}`)
                    }}
                    className="absolute top-3 right-3 z-20 p-2 bg-white/90 rounded-full hover:bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100 transition-colors"
                    title="Edit Event"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}

                {/* Event Image */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                   {event.image ? (
                     <img src={event.image} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   ) : (
                     <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white/50 text-4xl font-bold">
                       {event.title.charAt(0)}
                     </div>
                   )}
                   <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
                     {event.category}
                   </div>
                </div>

                {/* Event Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    {event.date} • {event.time}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{event.description}</p>
                  <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mb-5">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                       {event.speakers && event.speakers[0]?.avatarUrl ? (
                         <img src={event.speakers[0].avatarUrl} alt="" className="h-full w-full object-cover" />
                       ) : (
                         <User className="h-4 w-4 text-slate-500" />
                       )}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">{event.speakers?.[0]?.name || "Guest Speaker"}</p>
                      <p className="text-xs text-slate-500">{event.speakers?.[0]?.company || "Presenter"}</p>
                    </div>
                  </div>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg group-hover:bg-indigo-600 transition-colors">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2"><div className="h-6 w-6 rounded bg-slate-900" /><span className="font-bold text-slate-900">EventHub</span></div>
           <p className="text-sm text-slate-500">© 2025 EventHub Inc. All rights reserved.</p>
        </div>
      </footer>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isSignedIn={isSignedIn}
        />
      )}
    </div>
  )
}