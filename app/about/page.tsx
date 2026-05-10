"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, ShieldCheck, Briefcase } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"

export default function AboutPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 space-y-16" dir={isRtl ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">{t("about.title")}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t("about.subtitle")}</p>
      </div>

      {/* Vision and Mission */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
          <CardContent className="p-8 space-y-4 text-center">
            <Target className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold dark:text-slate-100">{t("about.vision_title")}</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t("about.vision_desc")}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
          <CardContent className="p-8 space-y-4 text-center">
            <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold dark:text-slate-100">{t("about.mission_title")}</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t("about.mission_desc")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Leadership */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t("about.leadership_title")}</h2>
          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Advisory Board */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-2xl font-semibold dark:text-slate-100">{t("about.advisory_board")}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[200px]">
              <p className="text-slate-400 dark:text-slate-500">{t("about.advisory_coming_soon")}</p>
            </div>
          </div>

          {/* Executive Office */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-2xl font-semibold dark:text-slate-100">{t("about.executive_office")}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[200px]">
              <p className="text-slate-400 dark:text-slate-500">{t("about.executive_coming_soon")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organizational Structure */}
      <div className="bg-slate-900 dark:bg-slate-800 text-white p-12 rounded-3xl text-center space-y-6">
        <h2 className="text-3xl font-bold">{t("about.org_structure_title")}</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">{t("about.org_structure_desc")}</p>
        <div className="aspect-video bg-slate-800 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 max-w-4xl mx-auto">
          <p className="text-slate-500 dark:text-slate-400">{t("about.org_diagram_coming")}</p>
        </div>
      </div>

    </div>
  )
}
