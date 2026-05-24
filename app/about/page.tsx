"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, ShieldCheck, Briefcase, Award, ArrowRight, ArrowLeft, Calendar } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"
import Link from "next/link"

const ADVISORY_BOARD = [
  {
    id: "8784d544-0f1a-40ad-b63f-e1ebffdb0d4f",
    nameKey: "د. أحمد كمال",
    nameEn: "Dr. Ahmed Kamal",
    titleKey: "about.roles.ahmed_title",
    descKey: "about.roles.ahmed_desc",
    initials: "أك"
  },
  {
    id: "d880a631-060f-44ad-8f31-dd813cb73f9c",
    nameKey: "د. منى عبدالله",
    nameEn: "Dr. Mona Abdullah",
    titleKey: "about.roles.mona_title",
    descKey: "about.roles.mona_body",
    initials: "مع"
  },
  {
    id: "35f8a4d0-aac6-48cf-a3ea-67b616c7ee76",
    nameKey: "م. أبوبكر سامي علي",
    nameEn: "Eng. Abubaker Sami Ali",
    titleKey: "about.roles.sami_title",
    descKey: "about.roles.sami_body",
    initials: "بس"
  }
]

const EXECUTIVE_OFFICE = [
  {
    id: "cfc233e2-e1bc-48e7-a5b0-bf4d8694b526",
    nameKey: "م. محمد عكود",
    nameEn: "Eng. Mohamed Akoud",
    titleKey: "about.roles.akoud_title",
    descKey: "about.roles.akoud_body",
    initials: "مع"
  },
  {
    id: "680b3240-16a0-419b-b769-ac18ba1990ea",
    nameKey: "م. سارة إدريس",
    nameEn: "Eng. Sara Idris",
    titleKey: "about.roles.sara_title",
    descKey: "about.roles.sara_body",
    initials: "سإ"
  },
  {
    id: "4cc8cbae-a26f-4cf4-a474-9d7db644a03f",
    nameKey: "م. أبايزيد السماني",
    nameEn: "Eng. Abuyazid Al-Sammani",
    titleKey: "about.roles.abuyazid_title",
    descKey: "about.roles.abuyazid_body",
    initials: "أس"
  }
]

export default function AboutPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const advisoryList = ADVISORY_BOARD
  const executiveList = EXECUTIVE_OFFICE

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 space-y-20" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── HEADER ── */}
      <div className="text-center max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t("about.title")}</h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">{t("about.subtitle")}</p>
      </div>

      {/* ── VISION & MISSION ── */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card className="border-none shadow-lg bg-white dark:bg-slate-900 dark:border dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <div className="h-2 w-full bg-emerald-600" />
          <CardContent className="p-8 space-y-4 text-center">
            <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <Target className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("about.vision_title")}</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t("about.vision_desc")}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-900 dark:border dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <div className="h-2 w-full bg-blue-600" />
          <CardContent className="p-8 space-y-4 text-center">
            <div className="h-16 w-16 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("about.mission_title")}</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t("about.mission_desc")}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── LEADERSHIP SECTION ── */}
      <div className="space-y-12 max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">{t("about.leadership_title")}</h2>
          <div className="h-1.5 w-24 bg-emerald-600 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-10">

          {/* Advisory Board */}
          <div className="space-y-6">
            <div className={`flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3`}>
              <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("about.advisory_board")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t("about.advisory_desc")}</p>
              </div>
            </div>

            <div className="space-y-4">
              {advisoryList.map((member) => (
                <Link href={`/members/${member.id}`} key={member.id} className="block">
                  <div className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {isRtl ? member.nameKey : member.nameEn}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">{t(member.titleKey)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{t(member.descKey)}</p>
                    </div>
                    <div className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0">
                      {isRtl ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Executive Office */}
          <div className="space-y-6">
            <div className={`flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3`}>
              <Briefcase className="h-6 w-6 text-blue-600 shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("about.executive_office")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t("about.executive_desc")}</p>
              </div>
            </div>

            <div className="space-y-4">
              {executiveList.map((member) => (
                <Link href={`/members/${member.id}`} key={member.id} className="block">
                  <div className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {isRtl ? member.nameKey : member.nameEn}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">{t(member.titleKey)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{t(member.descKey)}</p>
                    </div>
                    <div className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0">
                      {isRtl ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── ORGANIZATIONAL STRUCTURE ── */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white p-8 md:p-12 rounded-3xl space-y-8 max-w-6xl mx-auto shadow-2xl relative overflow-hidden border border-slate-850">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
        </div>

        <div className="text-center space-y-3 relative z-10">
          <h2 className="text-3xl font-bold">{t("about.org_title")}</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t("about.org_subtitle")}
          </p>
        </div>

        {/* CSS Tree Org Chart */}
        <div className="relative z-10 overflow-x-auto py-6" dir="ltr">
          <div className="min-w-[800px] flex flex-col items-center gap-8">

            {/* General Assembly */}
            <div className="relative">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg border border-emerald-500/30 text-center tracking-wide text-base">
                {locale === "ar" ? "الجمعية العمومية" : "General Assembly"}
              </div>
              <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-slate-700 -translate-x-1/2" />
            </div>

            {/* Advisory and Executive Level */}
            <div className="flex justify-center gap-32 relative pt-4 w-full">
              {/* Connecting Horizontal Line */}
              <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-700" />

              {/* Advisory Board */}
              <div className="relative flex flex-col items-center">
                <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-slate-700 -translate-x-1/2" />
                <div className="bg-slate-800 text-slate-100 font-semibold px-6 py-3 rounded-xl border border-slate-700 shadow-md text-center text-sm mt-4">
                  {t("about.advisory_board")}
                </div>
              </div>

              {/* Executive Office */}
              <div className="relative flex flex-col items-center">
                <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-slate-700 -translate-x-1/2" />
                <div className="bg-slate-800 text-slate-100 font-semibold px-6 py-3 rounded-xl border border-slate-700 shadow-md text-center text-sm mt-4">
                  {t("about.executive_office")}
                </div>
                {/* Connector down to committees */}
                <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-slate-700 -translate-x-1/2" />
              </div>
            </div>

            {/* Specialized Committees */}
            <div className="relative pt-4 w-full">
              {/* Connecting Horizontal Line for committees */}
              <div className="absolute top-0 left-1/8 right-1/8 h-0.5 bg-slate-700" />

              <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mt-4">

                {/* Tech Committee */}
                <div className="relative flex flex-col items-center">
                  <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-slate-700 -translate-x-1/2" />
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 text-center w-full shadow-sm hover:border-emerald-500/40 transition-colors">
                    <Award className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-slate-200">
                      {locale === "ar" ? "اللجنة التقنية" : "Technical Committee"}
                    </span>
                  </div>
                </div>

                {/* Events Committee */}
                <div className="relative flex flex-col items-center">
                  <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-slate-700 -translate-x-1/2" />
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 text-center w-full shadow-sm hover:border-blue-500/40 transition-colors">
                    <Calendar className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-slate-200">
                      {locale === "ar" ? "لجنة الفعاليات والأنشطة" : "Events & Activities"}
                    </span>
                  </div>
                </div>

                {/* Membership Committee */}
                <div className="relative flex flex-col items-center">
                  <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-slate-700 -translate-x-1/2" />
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 text-center w-full shadow-sm hover:border-purple-500/40 transition-colors">
                    <Users className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-slate-200">
                      {locale === "ar" ? "لجنة العضوية والمجتمعات" : "Membership & Communities"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
