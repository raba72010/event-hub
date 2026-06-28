"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n-context"
import { supabase } from "@/lib/supabase"

export default function LibraryPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [documents, setDocuments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDocs() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setDocuments(data || [])
      } catch (e) {
        console.warn("Digital library: Supabase query failed, loading fallbacks", e)
        setDocuments([
          {
            id: "1",
            title_ar: "تقرير الآفاق الاقتصادية السودانية 2026",
            title_en: "Sudanese Economic Outlook Report 2026",
            description_ar: "دراسة تحليلية شاملة للآفاق الاقتصادية ومسارات التعافي التنموي والفرص المتاحة للمؤسسات والشركات الناشئة.",
            description_en: "A comprehensive analytical study of economic prospects, recovery pathways, and opportunities for startups.",
            category: "research",
            file_size: "3.2 MB",
            download_url: "#"
          },
          {
            id: "2",
            title_ar: "الدليل الإرشادي للهندسة البرمجية المستدامة",
            title_en: "Sustainable Software Engineering Guidelines",
            description_ar: "معايير تصميم وتطوير تطبيقات برمجية مستدامة تراعي كفاءة استهلاك الموارد وحماية البيانات.",
            description_en: "Standards for designing and developing sustainable software applications, focusing on resource efficiency and data security.",
            category: "books",
            file_size: "4.5 MB",
            download_url: "#"
          },
          {
            id: "3",
            title_ar: "ورقة عمل: التحول الرقمي في القطاع الصحي",
            title_en: "Worksheet: Digital Transformation in Healthcare",
            description_ar: "خارطة طريق مبسطة لتطبيقات السجلات الصحية الإلكترونية والاستشارات الطبية عن بعد في البيئات منخفضة الموارد.",
            description_en: "A simplified roadmap for electronic health records and telemedicine deployments in resource-constrained environments.",
            category: "worksheets",
            file_size: "1.8 MB",
            download_url: "#"
          },
          {
            id: "4",
            title_ar: "أساسيات الذكاء الاصطناعي للمديرين والقياديين",
            title_en: "AI Basics for Managers and Leaders",
            description_ar: "دليل عملي لتطبيقات التعلم الآلي ونماذج اللغة الكبيرة في اتخاذ القرارات وحوكمة المشروعات المهنية.",
            description_en: "A practical guide to machine learning and LLM applications in decision-making and professional project governance.",
            category: "books",
            file_size: "2.7 MB",
            download_url: "#"
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const title = (isRtl ? doc.title_ar : doc.title_en) || ""
      const desc = (isRtl ? doc.description_ar : doc.description_en) || ""
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            desc.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [documents, searchQuery, categoryFilter, isRtl])

  return (
    <div className="container mx-auto px-4 py-12 md:px-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{t("library.title")}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t("library.subtitle")}</p>
      </div>

      {/* Search and Filter */}
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute top-3 text-slate-400 dark:text-slate-500 h-5 w-5" style={{ [isRtl ? "right" : "left"]: "0.75rem" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("library.search_placeholder")}
            className="w-full py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ [isRtl ? "paddingRight" : "paddingLeft"]: "2.5rem", [isRtl ? "paddingLeft" : "paddingRight"]: "1rem" }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="all">{t("library.all_categories")}</option>
          <option value="research">{t("library.research")}</option>
          <option value="books">{t("library.books")}</option>
          <option value="worksheets">{t("library.worksheets")}</option>
        </select>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 pt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          {t("library.no_results")}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                      {isRtl ? doc.title_ar : doc.title_en}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">
                      {isRtl ? doc.description_ar : doc.description_en}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                    {doc.file_size} • {t(`library.${doc.category}`)}
                  </span>
                  <a
                    href={doc.download_url}
                    onClick={(e) => {
                      if (doc.download_url === "#") {
                        e.preventDefault()
                        alert(locale === "ar" ? "تحميل الملف التجريبي قيد التحضير" : "Demo file download is being prepared")
                      }
                    }}
                    className="inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-3 py-1.5 rounded-lg transition-colors gap-2"
                  >
                    <Download className="h-4 w-4" /> {t("library.download")}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
