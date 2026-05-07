"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/i18n-context"
import { Calendar, ArrowRight, ArrowLeft, X, User } from "lucide-react"

interface Highlight {
  image: string
  titleAr: string
  titleEn: string
  dateAr: string
  dateEn: string
  speakerAr: string
  speakerEn: string
}

const HIGHLIGHTS: Highlight[] = [
  {
    image: "/spc/event-ai-agents.jpg",
    titleAr: "لماذا لم يعد الذكاء الاصطناعي التوليدي كافياً؟",
    titleEn: "Why Generative AI Is No Longer Enough?",
    dateAr: "13 ديسمبر",
    dateEn: "13 December",
    speakerAr: "م. محمد عكود",
    speakerEn: "Eng. Mohamed Akoud",
  },
  {
    image: "/spc/event-notebooklm.jpg",
    titleAr: "أدوات الذكاء الاصطناعي – NotebookLM",
    titleEn: "AI Tools Series – NotebookLM",
    dateAr: "7 يوليو 2025",
    dateEn: "7 July 2025",
    speakerAr: "أربعة محاضرين",
    speakerEn: "Four Speakers",
  },
  {
    image: "/spc/event-cv-writing.jpg",
    titleAr: "كيف تكتب سيرتك الذاتية باحتراف؟",
    titleEn: "How to Write Your CV Professionally",
    dateAr: "10 يونيو 2025",
    dateEn: "10 June 2025",
    speakerAr: "م. الصادق قرشي",
    speakerEn: "Eng. Sadiq Qureshi",
  },
]

export function PastHighlights() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"
  const Arrow = isRtl ? ArrowLeft : ArrowRight
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const open = openIdx !== null ? HIGHLIGHTS[openIdx] : null

  // Close on Escape
  useEffect(() => {
    if (openIdx === null) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenIdx(null) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [openIdx])

  return (
    <>
      <section className="container mx-auto px-4 py-16 md:py-20 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {t("home.highlights.title")}
            </h2>
            <p className="mt-3 text-base text-slate-500">{t("home.highlights.subtitle")}</p>
          </div>
          <Link
            href="#events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:gap-3 transition-all whitespace-nowrap"
          >
            {t("home.highlights.view_archive")}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map((h, i) => {
            const title   = isRtl ? h.titleAr   : h.titleEn
            const date    = isRtl ? h.dateAr    : h.dateEn
            const speaker = isRtl ? h.speakerAr : h.speakerEn
            return (
              <button
                key={i}
                type="button"
                onClick={() => setOpenIdx(i)}
                className="group flex flex-col text-start overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={h.image}
                    alt={title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <Calendar className="h-3.5 w-3.5" />
                    {date}
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900 leading-snug line-clamp-2">{title}</h3>
                  <p className="mt-2 text-sm text-slate-500 inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> {speaker}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* POSTER MODAL */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setOpenIdx(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIdx(null)}
            aria-label="Close"
            className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-[min(90vw,800px)] overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={open.image}
              alt={isRtl ? open.titleAr : open.titleEn}
              className="block h-auto w-auto max-h-[90vh] max-w-[min(90vw,800px)] object-contain bg-white"
            />
          </div>
        </div>
      )}
    </>
  )
}
