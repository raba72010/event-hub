"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n-context"
import { Calendar, CheckCircle2, Heart, Shield } from "lucide-react"

interface DashboardHeaderProps {
  fullName?: string | null
  upcomingCount: number
  attendedCount: number
  savedCount: number
  isAdmin?: boolean
}

export function DashboardHeader({
  fullName,
  upcomingCount,
  attendedCount,
  savedCount,
  isAdmin = false,
}: DashboardHeaderProps) {
  const { t } = useTranslation()
  const firstName = fullName?.trim().split(" ")[0]

  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 md:py-20">
      {/* Accent glows */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/15 blur-[120px] animate-mesh-1" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/15 blur-[100px] animate-mesh-2" />
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {firstName ? `${t("home.dash.greeting")}، ${firstName}` : t("home.dash.greeting_default")}
            </h1>
            <p className="mt-2 text-base md:text-lg text-slate-400">{t("home.dash.subtitle")}</p>

            {isAdmin && (
              <div className="mt-5">
                <Link href="/admin">
                  <Button size="sm" className="bg-indigo-500 hover:bg-indigo-400 text-white gap-2 rounded-full shadow-lg">
                    <Shield className="h-4 w-4" />
                    {t("home.dash.admin_btn")}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <StatPill icon={<Calendar className="h-4 w-4" />}      label={t("home.dash.stat_upcoming")} value={upcomingCount} accent="text-emerald-400" />
            <StatPill icon={<CheckCircle2 className="h-4 w-4" />} label={t("home.dash.stat_attended")} value={attendedCount} accent="text-indigo-400" />
            <StatPill icon={<Heart className="h-4 w-4" />}        label={t("home.dash.stat_saved")}    value={savedCount}    accent="text-rose-400" />
          </div>
        </div>
      </div>
    </section>
  )
}

function StatPill({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-3 shadow-lg">
      <span className={accent}>{icon}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      </div>
    </div>
  )
}
