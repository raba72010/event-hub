"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n-context"
import { COMMUNITIES } from "@/lib/communities"
import { ArrowRight, ArrowLeft } from "lucide-react"

export function CommunitiesPreview() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{t("home.our_communities.title")}</h2>
            <p className="mt-3 text-base md:text-lg text-slate-500">{t("home.our_communities.subtitle")}</p>
          </div>
          <Link
            href="/communities"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:gap-3 transition-all whitespace-nowrap"
          >
            {t("home.our_communities.view_all")}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COMMUNITIES.map((community) => {
            const name = isRtl ? community.nameAr : community.nameEn
            const Icon = community.icon
            return (
              <Link
                key={community.slug}
                href={`/communities/${community.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-slate-300"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${community.bg}`}>
                  <Icon className={`h-5 w-5 ${community.color}`} />
                </div>
                <h3 className="mt-4 text-sm md:text-base font-semibold text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors">
                  {name}
                </h3>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
