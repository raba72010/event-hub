"use client"

import { useTranslation } from "@/lib/i18n-context"

export function AnnouncementBanner() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  return (
    <section className="relative -mt-12 z-10 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        <article
          className={[
            "rounded-2xl border border-slate-200 bg-white shadow-xl px-6 py-7 md:px-10 md:py-9",
            isRtl ? "border-r-4 border-r-emerald-600" : "border-l-4 border-l-emerald-600",
          ].join(" ")}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {t("home.announcement.eyebrow")}
          </p>
          <h2 className="mt-2 text-xl md:text-2xl font-bold text-slate-900 leading-snug">
            {t("home.announcement.title")}
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">
            {t("home.announcement.body")}
          </p>
        </article>
      </div>
    </section>
  )
}
