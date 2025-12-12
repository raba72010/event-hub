"use client"

import { useEffect, useState, type ReactNode } from "react"
import { CalendarClock, Clock, MapPin, X } from "lucide-react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import type { Event } from "@/types/event"

interface EventDetailModalProps {
  event: Event
  isOpen: boolean
  isSignedIn: boolean
  onClose: () => void
}

export function EventDetailModal({ event, isOpen, isSignedIn, onClose }: EventDetailModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
            <p className="text-xs uppercase tracking-[0.15em] text-slate-700">{event.category}</p>
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
              <Button className="flex-1" size="lg">
                {isSignedIn ? "Save my spot" : "Register free"}
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

