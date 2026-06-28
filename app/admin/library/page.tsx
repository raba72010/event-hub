"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import { BookOpen, Plus, Trash2, FileText, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLibraryPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const [form, setForm] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    category: "research",
    fileSize: "",
    downloadUrl: "#",
  })

  const fetchDocs = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (e: any) {
      console.error("Error fetching library documents:", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMsg(null)

    try {
      const { error } = await supabase
        .from("documents")
        .insert({
          title_ar: form.titleAr,
          title_en: form.titleEn,
          description_ar: form.descriptionAr,
          description_en: form.descriptionEn,
          category: form.category,
          file_size: form.fileSize,
          download_url: form.downloadUrl,
        })

      if (error) throw error

      setMsg({
        text: isRtl ? "تمت إضافة المستند بنجاح!" : "Document added successfully!",
        type: "success",
      })

      // Reset form
      setForm({
        titleAr: "",
        titleEn: "",
        descriptionAr: "",
        descriptionEn: "",
        category: "research",
        fileSize: "",
        downloadUrl: "#",
      })

      fetchDocs()
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? "هل أنت متأكد من حذف هذا المستند؟" : "Are you sure you want to delete this document?")) {
      return
    }

    try {
      const { error } = await supabase.from("documents").delete().eq("id", id)
      if (error) throw error
      setMsg({
        text: isRtl ? "تم حذف المستند بنجاح!" : "Document deleted successfully!",
        type: "success",
      })
      fetchDocs()
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" })
    }
  }

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {isRtl ? "إدارة المكتبة الرقمية" : "Manage Digital Library"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isRtl ? "إضافة وحذف ملفات البحوث والكتب التعليمية للمكتبة" : "Add and delete research resources and books"}
          </p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-lg text-sm ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {msg.text}
        </div>
      )}

      {/* Grid: Form on left/top, list on right/bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD FORM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-600" />
            {isRtl ? "إضافة مستند جديد" : "Add New Document"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "العنوان باللغة العربية" : "Title (Arabic)"}
              </label>
              <input
                type="text"
                required
                value={form.titleAr}
                onChange={e => setForm({ ...form, titleAr: e.target.value })}
                placeholder="مثال: تقرير الآفاق الاقتصادية"
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
                placeholder="e.g. Economic Outlook Report"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "الوصف باللغة العربية" : "Description (Arabic)"}
              </label>
              <textarea
                required
                rows={3}
                value={form.descriptionAr}
                onChange={e => setForm({ ...form, descriptionAr: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "الوصف باللغة الإنجليزية" : "Description (English)"}
              </label>
              <textarea
                required
                rows={3}
                value={form.descriptionEn}
                onChange={e => setForm({ ...form, descriptionEn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "الفئة" : "Category"}
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="research">{isRtl ? "أبحاث علمية" : "Research"}</option>
                  <option value="books">{isRtl ? "كتب ومراجع" : "Books"}</option>
                  <option value="worksheets">{isRtl ? "أوراق عمل" : "Worksheets"}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "حجم الملف" : "File Size"}
                </label>
                <input
                  type="text"
                  required
                  value={form.fileSize}
                  onChange={e => setForm({ ...form, fileSize: e.target.value })}
                  placeholder="e.g. 3.2 MB"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "رابط التحميل" : "Download URL"}
              </label>
              <input
                type="text"
                required
                value={form.downloadUrl}
                onChange={e => setForm({ ...form, downloadUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRtl ? "حفظ المستند" : "Save Document")}
            </Button>
          </form>
        </div>

        {/* LIST TABLE */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-slate-500" />
              {isRtl ? "المستندات الحالية" : "Current Documents"}
            </h3>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-emerald-600 h-8 w-8" /></div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {isRtl ? "لا توجد مستندات بعد." : "No documents added yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-medium">
                  <tr>
                    <th className="px-5 py-3 text-start">{isRtl ? "العنوان" : "Title"}</th>
                    <th className="px-5 py-3 text-start">{isRtl ? "الفئة" : "Category"}</th>
                    <th className="px-5 py-3 text-start">{isRtl ? "الحجم" : "Size"}</th>
                    <th className="px-5 py-3 text-center">{isRtl ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {isRtl ? doc.title_ar : doc.title_en}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {isRtl ? doc.description_ar : doc.description_en}
                        </div>
                      </td>
                      <td className="px-5 py-3 capitalize">{doc.category}</td>
                      <td className="px-5 py-3 font-mono text-xs">{doc.file_size}</td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleDelete(doc.id)}
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
