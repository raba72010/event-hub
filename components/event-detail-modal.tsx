"use client"

import { useEffect, useState, type ReactNode } from "react"
import { CalendarClock, Clock, MapPin, X, Heart } from "lucide-react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import type { Event } from "@/types/event"
import { supabase } from "@/lib/supabase"
import { toggleFavorite, isEventFavorited } from "@/lib/favorites"
import { toggleRegistration, isEventRegistered } from "@/lib/registrations"
import { cn } from "@/lib/utils"

interface EventDetailModalProps {
  event: Event
  isOpen: boolean
  isSignedIn: boolean
  onClose: () => void
}

export function EventDetailModal({ event, isOpen, isSignedIn, onClose }: EventDetailModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isOpen) return

    // Get current user and check favorite/registration status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null)
      if (user) {
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
  }, [isOpen, event.id])

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

  const handleRegister = async () => {
    if (!userId) {
      alert("Please sign in to register for events")
      return
    }

    try {
      const newState = await toggleRegistration(event.id, userId)
      setIsRegistered(newState)
    } catch (error) {
      console.error("Error toggling registration:", error)
      alert("Failed to update registration. Please try again.")
    }
  }

  useEffect(() => {
    if (!isOpen) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 active:scale-95"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid gap-6 p-6 md:grid-cols-[1fr_0.6fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-700">{event.category}</p>
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
            <h3 className="text-2xl font-semibold text-gray-900">{event.title}</h3>
            <p className="text-sm text-gray-600">{event.description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <Info icon={<CalendarClock className="h-4 w-4" />} label={`${event.date} · ${event.time}`} />
              <Info icon={<Clock className="h-4 w-4" />} label={event.duration} />
              <Info icon={<MapPin className="h-4 w-4" />} label={event.location} />
            </div>

            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Speakers</span>
              <span className="text-xs uppercase tracking-[0.12em] text-gray-500">Live Q&A</span>
            </div>
            <div className="space-y-3">
              {event.speakers.map((speaker) => (
                <div key={speaker.name} className="flex items-center gap-3 rounded-lg bg-white p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white">
                    {speaker.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{speaker.name}</p>
                    <p className="text-gray-600">
                      {speaker.title}
                      {speaker.company ? ` · ${speaker.company}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 text-sm text-gray-600">
              Recording and slides will be emailed to all registrants.
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                size="lg"
                variant={isRegistered ? "secondary" : "default"}
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isRegistered ? "You are going!" : isSignedIn ? "Save my spot" : "Register free"}
              </Button>
              <Button variant="outline" size="lg" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
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

