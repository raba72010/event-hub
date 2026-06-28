"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PlayCircle, Image as ImageIcon, FileText, Calendar, ArrowRight, ArrowLeft } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"
import { supabase } from "@/lib/supabase"

export default function MediaCenterPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [articles, setArticles] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all") // 'all' | 'news' | 'gallery' | 'video'
  const [isLoading, setIsLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null)

  useEffect(() => {
    async function fetchMedia() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("media_articles")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setArticles(data || [])
      } catch (e) {
        console.warn("Media center: Supabase error, loading mock fallback data", e)
        setArticles([
          {
            id: "1",
            title_ar: "نادي المحترفين السودانيين يطلق شراكة استراتيجية مع حاضنات تقنية دولية",
            title_en: "Sudanese Professionals Club Launches Strategic Partnership with International Tech Incubators",
            summary_ar: "أعلن النادي اليوم عن شراكة استراتيجية مع مسرعات وحاضنات تقنية لتقديم برامج تأهيل وتدريب متقدمة للأعضاء.",
            summary_en: "The club announced today a strategic partnership with tech accelerators to provide advanced training and mentoring.",
            content_ar: "أعلن النادي رسمياً عن إطلاق شراكة استراتيجية موسعة تهدف إلى ربط المبتكرين السودانيين بشبكات تمويل وتأهيل دولية لتسريع وتيرة التحول الرقمي ونمو الشركات الناشئة.",
            content_en: "The club officially announced a strategic partnership to connect Sudanese innovators with international funding and acceleration networks to promote digital growth.",
            type: "news",
            image_url: null,
            video_url: null,
            created_at: new Date(2026, 5, 20).toISOString()
          },
          {
            id: "2",
            title_ar: "تغطية مصورة: ورشة عمل أساسيات الحوسبة السحابية",
            title_en: "Photo Gallery: Cloud Computing Basics Workshop",
            summary_ar: "صور وتغطيات مرئية للقاء التفاعلي الذي أقيم بحضور 120 مشاركاً من المحترفين ومهندسي النظم.",
            summary_en: "Visual coverage and photos from the interactive session attended by 120 cloud professionals and systems engineers.",
            content_ar: "شهدت قاعات النادي إقبالاً كبيراً في ورشة العمل التفاعلية التي غطت ممارسات التحول السحابي وتطبيق إستراتيجيات الخصوصية وإدارة الموارد السحابية بكفاءة عالية.",
            content_en: "The workshop received high attendance, covering cloud migration, performance optimization, and data protection strategies.",
            type: "gallery",
            image_url: null,
            video_url: null,
            created_at: new Date(2026, 5, 15).toISOString()
          },
          {
            id: "3",
            title_ar: "حفل الاستقبال السنوي للمحترفين الجدد",
            title_en: "Annual Welcoming Ceremony for New Members",
            summary_ar: "فيديو مسجل يوثق الكلمات الافتتاحية والمناقشات الثنائية التي جرت خلال حفل التعارف السنوي.",
            summary_en: "Recorded video covering opening remarks and networking discussions during the annual networking event.",
            content_ar: "فيديو يوثق الحفل التعريفي للأعضاء الجدد واستعراض الفرص المستقبلية في مسارات الأنشطة ولجان التخصص المختلفة بالنادي.",
            content_en: "A video documenting the welcome speech, group photos, and introductory panels for our new professional members.",
            type: "video",
            image_url: null,
            video_url: "#",
            created_at: new Date(2026, 5, 10).toISOString()
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }
    fetchMedia()
  }, [])

  const filteredArticles = useMemo(() => {
    if (activeTab === "all") return articles
    return articles.filter(a => a.type === activeTab)
  }, [articles, activeTab])

  const dateLocale = isRtl ? "ar-EG" : "en-US"

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 space-y-12" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">{t("media.title")}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t("media.subtitle")}</p>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 max-w-2xl mx-auto">
        {[
          { id: "all", label: t("media.all_types") },
          { id: "news", label: t("media.news") },
          { id: "gallery", label: t("media.gallery") },
          { id: "video", label: t("media.videos") }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 animate-pulse">
              <div className="h-48 bg-slate-200 dark:bg-slate-800" />
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          {t("media.no_results")}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => {
            const dateStr = new Date(art.created_at).toLocaleDateString(dateLocale, {
              year: "numeric",
              month: "long",
              day: "numeric"
            })

            return (
              <Card
                key={art.id}
                className="hover:shadow-lg transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Visual Header */}
                  <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-950 dark:from-slate-900 dark:to-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-850">
                    <div className="absolute inset-0 bg-emerald-500/5 group-hover:scale-105 transition-transform duration-500" />
                    {art.type === "news" && <FileText className="h-12 w-12 text-emerald-500 opacity-60" />}
                    {art.type === "gallery" && <ImageIcon className="h-12 w-12 text-blue-500 opacity-60" />}
                    {art.type === "video" && <PlayCircle className="h-12 w-12 text-red-500 opacity-60" />}
                    <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-slate-200 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider">
                      {t(`media.${art.type === "gallery" ? "gallery" : art.type === "video" ? "videos" : "news"}`)}
                    </span>
                  </div>

                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{dateStr}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {isRtl ? art.title_ar : art.title_en}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                      {isRtl ? art.summary_ar : art.summary_en}
                    </p>
                  </CardContent>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="inline-flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors gap-2"
                  >
                    {t("media.read_more")}
                    {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Details Dialog Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                  {t(`media.${selectedArticle.type === "gallery" ? "gallery" : selectedArticle.type === "video" ? "videos" : "news"}`)}
                </span>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {isRtl ? selectedArticle.title_ar : selectedArticle.title_en}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(selectedArticle.created_at).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
              </div>

              <div className="text-slate-750 dark:text-slate-350 leading-relaxed text-base whitespace-pre-line border-t border-slate-100 dark:border-slate-800/80 pt-6">
                {isRtl ? selectedArticle.content_ar : selectedArticle.content_en}
              </div>

              {selectedArticle.type === "video" && (
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-850 text-center">
                  <PlayCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold dark:text-slate-200 mb-4">{isRtl ? "شاهد التسجيل الكامل على اليوتيوب" : "Watch the complete recording on YouTube"}</p>
                  <a
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isRtl ? "فتح الفيديو في نافذة جديدة" : "Open Video in New Window"}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
