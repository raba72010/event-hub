"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { EventDetailModal } from "@/components/event-detail-modal"
import { EventCard } from "@/components/event-card"
import type { Event } from "@/types/event"
import { useTranslation } from "@/lib/i18n-context"
import { Loader2 } from "lucide-react"

export default function FavoritesPage() {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return }
      setUserId(user.id)
    })
  }, [router])

  useEffect(() => {
    async function fetchFavoritedEvents() {
      if (!userId) return
      try {
        const { data: favorites, error: favError } = await supabase.from("favorites").select("event_id").eq("user_id", userId)
        if (favError || !favorites || favorites.length === 0) { setIsLoading(false); return }

        const eventIds = favorites.map((f) => f.event_id.toString())
        const { data: eventsData, error: eventsError } = await supabase.from("events").select("*").in("id", eventIds)
        if (eventsError) { setIsLoading(false); return }

        const mappedEvents: Event[] = (eventsData || []).map((row: any) => {
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
            category: row.category || "",
            date, time,
            duration: row.duration || "",
            location: row.location || "",
            level: row.level,
            status: (row.status === "past" ? "on-demand" : "upcoming") as Event["status"],
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

  return (
    <div className="min-h-screen bg-slate-50" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{t("favorites.title")}</h2>
          <p className="text-sm text-gray-600 mt-1">{t("favorites.subtitle")}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-6 w-6 text-emerald-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-gray-200 bg-white">
            <p className="text-gray-600 text-center">{t("favorites.empty")}</p>
            <Button className="mt-4" onClick={() => router.push("/")}>{t("favorites.browse")}</Button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onSelectEvent={setSelectedEvent} />
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} isSignedIn={true} />
      )}
    </div>
  )
}
