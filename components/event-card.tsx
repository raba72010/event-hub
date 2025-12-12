"use client"

import { type ReactNode, useState, useEffect } from "react"
import { CalendarClock, Clock, Play, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Event } from "@/types/event"
import { supabase } from "@/lib/supabase"
import { toggleFavorite, isEventFavorited } from "@/lib/favorites"

interface EventCardProps {
  event: Event
  onSelectEvent: (event: Event) => void
  showFavorite?: boolean
}

export function EventCard({ event, onSelectEvent, showFavorite = true }: EventCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!showFavorite) return

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null)
      if (user) {
        isEventFavorited(event.id, user.id).then(setIsFavorited)
      }
    })
  }, [event.id, showFavorite])

  const handleFavorite = async () => {
    if (!userId) {
      alert("Please sign in to favorite events")
      return
    }

    try {
      const newState = await toggleFavorite(event.id, userId)
      setIsFavorited(newState)
    } catch (error) {
      console.error("Error toggling favorite:", error)
      alert("Failed to update favorite. Please try again.")
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1 flex-1">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-700">{event.category}</p>
          <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          {showFavorite && (
            <button
              onClick={handleFavorite}
              className="inline-flex items-center justify-center rounded-full p-1.5 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={cn("h-4 w-4 transition-colors", isFavorited ? "fill-red-500 text-red-500" : "")}
              />
            </button>
          )}
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {event.level ?? "All levels"}
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{event.summary ?? event.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <Info icon={<CalendarClock className="h-4 w-4" />} label={`${event.date} · ${event.time}`} />
        <Info icon={<Clock className="h-4 w-4" />} label={event.duration} />
        <Info icon={<Play className="h-4 w-4" />} label={event.status === "on-demand" ? "Recording" : "Live"} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {event.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {event.speakers.map((speaker, index) => (
            <span key={speaker.name}>
              {speaker.name}
              {index < event.speakers.length - 1 && ", "}
            </span>
          ))}
        </div>
        <Button size="sm" onClick={() => onSelectEvent(event)}>
          View details
        </Button>
      </div>
    </article>
  )
}

function Info({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700">
      {icon}
      <span>{label}</span>
    </span>
  )
}

