"use client"

import { useState, useEffect } from "react"
import { FeaturedEventHero } from "@/components/featured-event-hero"
import { EventTabs } from "@/components/event-tabs"
import { UserSidebar } from "@/components/user-sidebar"
import { EventDetailModal } from "@/components/event-detail-modal"
import { Button } from "@/components/ui/button"
import { Menu, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"
import type { Event } from "@/types/event"

export default function ProWebinarHub() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session)
      setUserEmail(session?.user?.email || null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session)
      setUserEmail(session?.user?.email || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase.from("events").select("*")

        if (error) {
          console.error("Error fetching events:", error)
          setIsLoading(false)
          return
        }

        // Map database columns to Event type
        const mappedEvents: Event[] = (data || []).map((row: any) => {
          // Parse start_time to extract date and time
          const startTime = row.start_time ? new Date(row.start_time) : null
          const date = startTime
            ? startTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : row.date || ""
          const time = startTime
            ? startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
            : row.time || ""

          // Parse tags (could be JSON array or comma-separated string)
          let tags: string[] = []
          if (row.tags) {
            if (typeof row.tags === "string") {
              try {
                tags = JSON.parse(row.tags)
              } catch {
                tags = row.tags.split(",").map((t: string) => t.trim())
              }
            } else if (Array.isArray(row.tags)) {
              tags = row.tags
            }
          }

          // Parse speakers (could be JSON array or single object)
          let speakers: Event["speakers"] = []
          if (row.speakers) {
            if (typeof row.speakers === "string") {
              try {
                speakers = JSON.parse(row.speakers)
              } catch {
                // If parsing fails, try to construct from individual columns
                if (row.speaker_name) {
                  speakers = [
                    {
                      name: row.speaker_name,
                      title: row.speaker_title || "",
                      company: row.speaker_company,
                      avatarUrl: row.speaker_avatar_url,
                    },
                  ]
                }
              }
            } else if (Array.isArray(row.speakers)) {
              speakers = row.speakers
            } else if (row.speaker_name) {
              // Single speaker from columns
              speakers = [
                {
                  name: row.speaker_name,
                  title: row.speaker_title || "",
                  company: row.speaker_company,
                  avatarUrl: row.speaker_avatar_url,
                },
              ]
            }
          } else if (row.speaker_name) {
            // Fallback to individual columns
            speakers = [
              {
                name: row.speaker_name,
                title: row.speaker_title || "",
                company: row.speaker_company,
                avatarUrl: row.speaker_avatar_url,
              },
            ]
          }

          // Map status: 'past' -> 'on-demand', 'upcoming' -> 'upcoming'
          const status = row.status === "past" ? "on-demand" : row.status === "upcoming" ? "upcoming" : "upcoming"

          return {
            id: row.id?.toString() || "",
            title: row.title || "",
            category: row.category || "",
            date,
            time,
            duration: row.duration || "",
            location: row.location || "",
            level: row.level,
            status: status as Event["status"],
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

  // Filter events by status
  const upcomingEvents = events.filter((e) => e.status === "upcoming")
  const pastEvents = events.filter((e) => e.status === "on-demand")
  const allEvents = [...upcomingEvents, ...pastEvents]
  const featuredEvent = upcomingEvents[0] || pastEvents[0] || null

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
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              onClick={() => {
                if (isSignedIn) {
                  // TODO: Navigate to profile page
                } else {
                  window.location.href = "/login"
                }
              }}
            >
              <User className="h-4 w-4 mr-2" />
              {isSignedIn ? userEmail || "Profile" : "Sign In"}
            </Button>

            {/* Mobile Menu - Hamburger */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <UserSidebar isSignedIn={isSignedIn} userEmail={userEmail} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <main className="flex-1 space-y-8">
              <FeaturedEventHero event={featuredEvent} onSelectEvent={setSelectedEvent} />
              <EventTabs events={allEvents} onSelectEvent={setSelectedEvent} />
            </main>

            {/* Sidebar - Desktop Only (hidden on mobile) */}
            <aside className="hidden lg:block lg:w-80">
              <div className="sticky top-24">
                <UserSidebar isSignedIn={isSignedIn} userEmail={userEmail} />
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
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
