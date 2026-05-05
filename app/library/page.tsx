"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n-context"

export default function LibraryPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  return (
    <div className="container mx-auto px-4 py-12 md:px-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-slate-900">{t("library.title")}</h1>
        <p className="text-lg text-slate-600">{t("library.subtitle")}</p>
      </div>

      {/* Search and Filter */}
      <div className="max-w-3xl mx-auto flex gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute top-3 text-slate-400 h-5 w-5" style={{ [isRtl ? "right" : "left"]: "0.75rem" }} />
          <input
            type="text"
            placeholder={t("library.search_placeholder")}
            className="w-full py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ [isRtl ? "paddingRight" : "paddingLeft"]: "2.5rem", [isRtl ? "paddingLeft" : "paddingRight"]: "1rem" }}
          />
        </div>
        <select className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none bg-white">
          <option>{t("library.all_categories")}</option>
          <option>{t("library.research")}</option>
          <option>{t("library.books")}</option>
          <option>{t("library.worksheets")}</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="hover:shadow-md transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{t("library.placeholder_title")} {i}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{t("library.placeholder_desc")}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-400">PDF • 2.4 MB</span>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-2">
                  <Download className="h-4 w-4" /> {t("library.download")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
