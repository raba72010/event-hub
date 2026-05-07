"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n-context"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { COMMUNITIES } from "@/lib/communities"

export default function CommunitiesIndex() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  return (
    <div className="container mx-auto px-4 py-12 md:px-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">{t("communities.title")}</h1>
        <p className="text-lg text-slate-600">{t("communities.subtitle")}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {COMMUNITIES.map((community) => {
          const name = isRtl ? community.nameAr : community.nameEn
          return (
            <Link key={community.slug} href={`/communities/${community.slug}`}>
              <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-slate-200">
                <CardContent className="p-6 space-y-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${community.bg}`}>
                    <community.icon className={`h-6 w-6 ${community.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{name}</h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {t("communities.card_desc")} {name}.
                    </p>
                  </div>
                  <div className="flex items-center text-sm font-medium text-emerald-600 pt-2 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    {t("communities.browse")}
                    {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
