"use client"

import { type ReactNode, useState, useEffect } from "react"
import { CalendarClock, Clock, MapPin, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Event } from "@/types/event"
import { cn } from "@/lib/utils"
import { generateICS, downloadICS } from "@/lib/calendar"
import { supabase } from "@/lib/supabase"
import { toggleFavorite, isEventFavorited } from "@/lib/favorites"
import { toggleRegistration, isEventRegistered } from "@/lib/registrations"

interface FeaturedEventHeroProps {
  event: Event | null
  onSelectEvent: (event: Event) => void
}

export function FeaturedEventHero({ event, onSelectEvent }: FeaturedEventHeroProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null)
      if (user && event) {
        // Check favorite and registration status
        Promise.all([
          isEventFavorited(event.id, user.id),
          isEventRegistered(event.id, user.id),
        ]).then(([favorited, registered]) => {
          setIsFavorited(favorited)
          setIsRegistered(registered)
          setIsLoading(false)
        })
      } else {
        setIsLoading(false)
      }
    })
  }, [event])

  const handleFavorite = async () => {
    if (!userId) {
      alert("Please sign in to favorite events")
      return
    }

    try {
      const newState = await toggleFavorite(event!.id, userId)
      setIsFavorited(newState)
    } catch (error) {
      console.error("Error toggling favorite:", error)
      alert("Failed to update favorite. Please try again.")
    }
  }

  const handleRegister = async () => {
    if (!userId) {
      alert("Please sign in to register for events")
      return
    }

    try {
      const newState = await toggleRegistration(event!.id, userId)
      setIsRegistered(newState)
    } catch (error) {
      console.error("Error toggling registration:", error)
      alert("Failed to update registration. Please try again.")
    }
  }

  if (!event) return null
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Featured event</p>
            <button
              onClick={handleFavorite}
              className="inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={cn("h-5 w-5 transition-colors", isFavorited ? "fill-red-500 text-red-500" : "")}
              />
            </button>
          </div>
          <h2 className="text-3xl font-semibold leading-tight text-gray-900 md:text-4xl">{event.title}</h2>
          <p className="text-base text-gray-600 md:text-lg">{event.summary ?? event.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <InfoPill icon={<CalendarClock className="h-4 w-4" />} label={`${event.date} · ${event.time}`} />
            <InfoPill icon={<Clock className="h-4 w-4" />} label={event.duration} />
            <InfoPill icon={<MapPin className="h-4 w-4" />} label={event.location} />
          </div>

          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => onSelectEvent(event)}>
              View details
            </Button>
            <Button
              size="lg"
              variant={isRegistered ? "secondary" : "default"}
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isRegistered ? "You are going!" : "Register free"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => {
                try {
                  const icsContent = generateICS(event)
                  const filename = `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`
                  downloadICS(icsContent, filename)
                } catch (error) {
                  console.error("Error generating calendar file:", error)
                  alert("Unable to generate calendar file. Please try again.")
                }
              }}
            >
              <CalendarClock className="h-4 w-4" />
              Add to calendar
            </Button>
          </div>

          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">What you'll learn</p>
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-gray-600 md:grid-cols-2">
              <li>Patterns to reduce friction in critical flows</li>
              <li>How to validate interaction changes with research</li>
              <li>Communication frameworks for exec alignment</li>
              <li>Benchmarks from top-performing SaaS teams</li>
            </ul>
          </div>
        </div>

        <div className="relative flex items-stretch bg-gradient-to-br from-slate-50 via-gray-50 to-transparent">
          <div className="absolute inset-6 rounded-3xl border border-slate-200 bg-slate-100 blur-3xl" />
          <div className="relative m-6 flex flex-1 flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white">Live session</span>
              <span className="text-xs uppercase tracking-[0.15em] text-gray-500">Seats filling</span>
            </div>
            <div className="space-y-3">
              {event.speakers.map((speaker) => (
                <SpeakerCard key={speaker.name} name={speaker.name} title={speaker.title} company={speaker.company} />
              ))}
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Recording and resources will be shared with all registrants.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
      {icon}
      <span>{label}</span>
    </span>
  )
}

function SpeakerCard({ name, title, company }: { name: string; title: string; company?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white",
        )}
      >
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>
      <div className="flex flex-col text-sm">
        <span className="font-semibold text-gray-900">{name}</span>
        <span className="text-gray-600">{title + (company ? ` · ${company}` : "")}</span>
      </div>
    </div>
  )
}

