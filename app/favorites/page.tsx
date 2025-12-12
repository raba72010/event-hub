"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"
import { UserSidebar } from "@/components/user-sidebar"
import { EventDetailModal } from "@/components/event-detail-modal"
import { EventCard } from "@/components/event-card"
import type { Event } from "@/types/event"

export default function FavoritesPage() {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Check auth and redirect if not logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login")
        return
      }
      setUserId(user.id)
    })
  }, [router])

  useEffect(() => {
    async function fetchFavoritedEvents() {
      if (!userId) return

      try {
        // Get favorited event IDs
        const { data: favorites, error: favError } = await supabase
          .from("favorites")
          .select("event_id")
          .eq("user_id", userId)

        if (favError) {
          console.error("Error fetching favorites:", favError)
          setIsLoading(false)
          return
        }

        if (!favorites || favorites.length === 0) {
          setEvents([])
          setIsLoading(false)
          return
        }

        const eventIds = favorites.map((f) => f.event_id.toString())

        // Fetch the actual events
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .in("id", eventIds)

        if (eventsError) {
          console.error("Error fetching events:", eventsError)
          setIsLoading(false)
          return
        }

        // Map database columns to Event type
        const mappedEvents: Event[] = (eventsData || []).map((row: any) => {
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
              try {
                tags = JSON.parse(row.tags)
              } catch {
                tags = row.tags.split(",").map((t: string) => t.trim())
              }
            } else if (Array.isArray(row.tags)) {
              tags = row.tags
            }
          }

          let speakers: Event["speakers"] = []
          if (row.speakers) {
            if (typeof row.speakers === "string") {
              try {
                speakers = JSON.parse(row.speakers)
              } catch {
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
            speakers = [
              {
                name: row.speaker_name,
                title: row.speaker_title || "",
                company: row.speaker_company,
                avatarUrl: row.speaker_avatar_url,
              },
            ]
          }

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
        console.error("Error fetching favorited events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavoritedEvents()
  }, [userId])

  const isSignedIn = !!userId

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
              {isSignedIn ? "Profile" : "Sign In"}
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
          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Saved Sessions</h2>
              <p className="text-sm text-gray-600 mt-1">Events you've favorited</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-600">Loading your saved sessions...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-gray-200 bg-white">
                <p className="text-gray-600 text-center">You haven't saved any sessions yet.</p>
                <Button className="mt-4" onClick={() => router.push("/")}>
                  Browse Events
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} onSelectEvent={setSelectedEvent} />
                ))}
              </div>
            )}
          </main>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:w-80">
            <div className="sticky top-24">
              <UserSidebar />
            </div>
          </aside>
        </div>
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

