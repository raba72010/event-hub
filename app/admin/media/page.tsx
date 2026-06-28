"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import { Newspaper, Plus, Trash2, Video, FileImage, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminMediaPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [articles, setArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const [form, setForm] = useState({
    titleAr: "",
    titleEn: "",
    summaryAr: "",
    summaryEn: "",
    contentAr: "",
    contentEn: "",
    type: "news",
    videoUrl: "",
  })

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("media_articles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setArticles(data || [])
    } catch (e: any) {
      console.error("Error fetching media articles:", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMsg(null)

    try {
      const { error } = await supabase
        .from("media_articles")
        .insert({
          title_ar: form.titleAr,
          title_en: form.titleEn,
          summary_ar: form.summaryAr,
          summary_en: form.summaryEn,
          content_ar: form.contentAr,
          content_en: form.contentEn,
          type: form.type,
          video_url: form.videoUrl || null,
        })

      if (error) throw error

      setMsg({
        text: isRtl ? "تم نشر الخبر بنجاح!" : "Media post published successfully!",
        type: "success",
      })

      // Reset form
      setForm({
        titleAr: "",
        titleEn: "",
        summaryAr: "",
        summaryEn: "",
        contentAr: "",
        contentEn: "",
        type: "news",
        videoUrl: "",
      })

      fetchArticles()
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? "هل أنت متأكد من حذف هذا الخبر؟" : "Are you sure you want to delete this media item?")) {
      return
    }

    try {
      const { error } = await supabase.from("media_articles").delete().eq("id", id)
      if (error) throw error
      setMsg({
        text: isRtl ? "تم حذف الخبر بنجاح!" : "Media item deleted successfully!",
        type: "success",
      })
      fetchArticles()
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" })
    }
  }

  const getIcon = (type: string) => {
    if (type === "video") return <Video className="h-4 w-4 text-rose-500" />
    if (type === "gallery") return <FileImage className="h-4 w-4 text-blue-500" />
    return <Newspaper className="h-4 w-4 text-emerald-500" />
  }

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {isRtl ? "إدارة المركز الإعلامي" : "Manage Media Center"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isRtl ? "إضافة وحذف الأخبار، التغطيات المصورة والندوات المسجلة" : "Create and manage news statements, galleries, and recorded webinars"}
          </p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-lg text-sm ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {msg.text}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-600" />
            {isRtl ? "نشر منشور إعلامي جديد" : "Publish New Media Item"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "النوع" : "Media Type"}
              </label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="news">{isRtl ? "أخبار وبيانات" : "News & Statements"}</option>
                <option value="gallery">{isRtl ? "معرض الصور" : "Photo Gallery"}</option>
                <option value="video">{isRtl ? "المكتبة المرئية" : "Videos & Webinars"}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "العنوان باللغة العربية" : "Title (Arabic)"}
              </label>
              <input
                type="text"
                required
                value={form.titleAr}
                onChange={e => setForm({ ...form, titleAr: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "العنوان باللغة الإنجليزية" : "Title (English)"}
              </label>
              <input
                type="text"
                required
                value={form.titleEn}
                onChange={e => setForm({ ...form, titleEn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "الملخص باللغة العربية" : "Summary (Arabic)"}
              </label>
              <textarea
                required
                rows={2}
                value={form.summaryAr}
                onChange={e => setForm({ ...form, summaryAr: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "الملخص باللغة الإنجليزية" : "Summary (English)"}
              </label>
              <textarea
                required
                rows={2}
                value={form.summaryEn}
                onChange={e => setForm({ ...form, summaryEn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "المحتوى الكامل باللغة العربية" : "Full Content (Arabic)"}
              </label>
              <textarea
                required
                rows={4}
                value={form.contentAr}
                onChange={e => setForm({ ...form, contentAr: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "المحتوى الكامل باللغة الإنجليزية" : "Full Content (English)"}
              </label>
              <textarea
                required
                rows={4}
                value={form.contentEn}
                onChange={e => setForm({ ...form, contentEn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {form.type === "video" && (
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "رابط الفيديو" : "Video URL"}
                </label>
                <input
                  type="text"
                  required={form.type === "video"}
                  value={form.videoUrl}
                  onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="e.g. https://youtube.com/embed/..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRtl ? "نشر المنشور" : "Publish Post")}
            </Button>
          </form>
        </div>

        {/* LIST TABLE */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-slate-500" />
              {isRtl ? "المنشورات الحالية" : "Current Publications"}
            </h3>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-emerald-600 h-8 w-8" /></div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {isRtl ? "لا توجد منشورات بعد." : "No publications added yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-medium">
                  <tr>
                    <th className="px-5 py-3 text-start">{isRtl ? "المنشور" : "Publication"}</th>
                    <th className="px-5 py-3 text-start">{isRtl ? "النوع" : "Type"}</th>
                    <th className="px-5 py-3 text-center">{isRtl ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {isRtl ? art.title_ar : art.title_en}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {isRtl ? art.summary_ar : art.summary_en}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 capitalize">
                          {getIcon(art.type)}
                          {art.type}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors inline-flex"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
