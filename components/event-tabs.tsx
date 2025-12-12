"use client"

import { useMemo, useState, type ReactNode } from "react"
import { CalendarClock, Clock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Event } from "@/types/event"

interface EventTabsProps {
  events: Event[]
  onSelectEvent: (event: Event) => void
}

const tabs = [
  { id: "upcoming", label: "Upcoming", description: "Live events you can join next." },
  { id: "on-demand", label: "On demand", description: "Watch recordings anytime." },
]

export function EventTabs({ events, onSelectEvent }: EventTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>(tabs[0].id)

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        if (activeTab === "upcoming") return event.status === "upcoming"
        return event.status === "on-demand"
      }),
    [activeTab, events],
  )

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Events</h3>
          <p className="text-sm text-gray-600">Pick a session to see the full agenda.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95",
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        {tabs.find((tab) => tab.id === activeTab)?.description}
      </p>

      <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-2">
        {filteredEvents.map((event) => (
          <article
            key={event.id}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-700">{event.category}</p>
                <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {event.level ?? "All levels"}
              </span>
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
        ))}
      </div>
    </section>
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

