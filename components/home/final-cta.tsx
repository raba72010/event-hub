"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n-context"
import { ArrowRight, ArrowLeft } from "lucide-react"

export function FinalCta() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 md:py-28">
      {/* Accent glows */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/15 blur-[120px] animate-mesh-1" />
        <div className="absolute -bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-[120px] animate-mesh-2" />
      </div>

      <div className="container relative mx-auto px-4 md:px-6 text-center max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">{t("home.final_cta.title")}</h2>
        <p className="mt-5 text-base md:text-lg text-slate-300 max-w-2xl mx-auto">{t("home.final_cta.desc")}</p>
        <div className="mt-10">
          <Link href="/login?view=sign_up">
            <Button size="lg" className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-full gap-2">
              {t("home.final_cta.button")}
              <Arrow className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
