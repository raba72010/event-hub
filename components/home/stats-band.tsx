"use client"

import { useTranslation } from "@/lib/i18n-context"

const STATS = [
  { value: "1,500+", labelKey: "home.stats.members" },
  { value: "50+",    labelKey: "home.stats.events_held" },
  { value: "8",      labelKey: "home.stats.communities" },
  { value: "30+",    labelKey: "home.stats.workshops" },
]

export function StatsBand() {
  const { t } = useTranslation()
  return (
    <section className="relative -mt-12 z-10 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl bg-slate-200 shadow-xl">
          {STATS.map((s) => (
            <div key={s.labelKey} className="bg-white px-6 py-8 md:py-10 text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 tracking-tight">{s.value}</div>
              <div className="mt-2 text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wider">{t(s.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
