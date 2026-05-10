"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PlayCircle, Image as ImageIcon, FileText } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"

export default function MediaCenterPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 space-y-12" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">{t("media.title")}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t("media.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 text-center space-y-4">
            <FileText className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold dark:text-slate-100">{t("media.news")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("media.news_desc")}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 text-center space-y-4">
            <ImageIcon className="h-10 w-10 text-blue-500 mx-auto" />
            <h3 className="text-xl font-bold dark:text-slate-100">{t("media.gallery")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("media.gallery_desc")}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 text-center space-y-4">
            <PlayCircle className="h-10 w-10 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold dark:text-slate-100">{t("media.videos")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("media.videos_desc")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
        {t("media.coming_soon")}
      </div>
    </div>
  )
}
