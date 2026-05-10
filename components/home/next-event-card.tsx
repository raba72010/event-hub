"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n-context"
import { Calendar, Clock, MapPin, ArrowRight, ArrowLeft, User } from "lucide-react"
import type { Event } from "@/types/event"

interface NextEventCardProps {
  event: Event
  isSignedIn: boolean
  isRegistered: boolean
  onSelect: (event: Event) => void
}

export function NextEventCard({ event, isSignedIn, isRegistered, onSelect }: NextEventCardProps) {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"
  const Arrow = isRtl ? ArrowLeft : ArrowRight
  const speaker = event.speakers?.[0]

  return (
    <section className="relative -mt-12 z-10 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <article className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
          <div className="grid md:grid-cols-[1fr_1.2fr]">
            {/* IMAGE / GRADIENT */}
            <div className="relative h-56 md:h-auto bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-900 overflow-hidden">
              {event.image ? (
                <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-7xl font-bold text-white/20">{event.title.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
              <div className="absolute top-4 start-4">
                <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  {t("home.next_event.eyebrow")}
                </span>
              </div>
            </div>

            {/* DETAILS */}
            <div className="flex flex-col justify-between p-6 md:p-8">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1">{event.category}</span>
                  {event.level && <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 normal-case font-medium">{event.level}</span>}
                </div>

                <h2 className="mt-4 text-2xl md:text-3xl font-bold leading-tight text-slate-900 dark:text-slate-100">
                  {event.title}
                </h2>

                {event.summary && (
                  <p className="mt-3 text-sm md:text-base text-slate-600 dark:text-slate-400 line-clamp-2">{event.summary}</p>
                )}

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <InfoRow icon={<Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />} label={event.date} />
                  <InfoRow icon={<Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />} label={`${event.time}${event.duration ? ` · ${event.duration}` : ""}`} />
                  <InfoRow icon={<MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />} label={event.location} />
                  {speaker && <InfoRow icon={<User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />} label={speaker.name} />}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white gap-2"
                  onClick={() => onSelect(event)}
                >
                  {t("home.next_event.view_details")}
                  <Arrow className="h-4 w-4" />
                </Button>
                {!isSignedIn ? (
                  <Link href="/login" className="flex-1">
                    <Button size="lg" variant="outline" className="w-full dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                      {t("home.next_event.sign_in_to_register")}
                    </Button>
                  </Link>
                ) : isRegistered ? (
                  <Button size="lg" variant="outline" className="flex-1 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 cursor-default" disabled>
                    {t("home.registered")}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    onClick={() => onSelect(event)}
                  >
                    {t("home.next_event.register")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
      {icon}
      <span>{label}</span>
    </div>
  )
}
