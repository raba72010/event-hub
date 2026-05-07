"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n-context"
import { Calendar, Users, BookOpen, Network, ArrowRight, ArrowLeft } from "lucide-react"

const FEATURES = [
  {
    icon: Calendar,
    titleKey: "home.offer.workshops_title",
    descKey:  "home.offer.workshops_desc",
    href: "#events",
    accent: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Users,
    titleKey: "home.offer.communities_title",
    descKey:  "home.offer.communities_desc",
    href: "/communities",
    accent: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: BookOpen,
    titleKey: "home.offer.library_title",
    descKey:  "home.offer.library_desc",
    href: "/library",
    accent: "text-amber-600 bg-amber-50",
  },
  {
    icon: Network,
    titleKey: "home.offer.network_title",
    descKey:  "home.offer.network_desc",
    href: "/login?view=sign_up",
    accent: "text-rose-600 bg-rose-50",
  },
]

export function FeatureGrid() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  return (
    <section className="container mx-auto px-4 py-20 md:px-6 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{t("home.offer.title")}</h2>
        <p className="mt-3 text-base md:text-lg text-slate-500">{t("home.offer.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((f) => {
          const Icon = f.icon
          return (
            <Link
              key={f.titleKey}
              href={f.href}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-slate-300"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.accent}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{t(f.titleKey)}</h3>
              <p className="mt-2 text-sm text-slate-500 flex-1">{t(f.descKey)}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 group-hover:gap-3 transition-all">
                {t("home.offer.explore")}
                <Arrow className="h-4 w-4" />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
