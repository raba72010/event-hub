"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Upload, Calendar, MapPin, 
  User, Tag, Type, Loader2, Image as ImageIcon, Grid, CheckCircle2, ArrowRight
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import Link from "next/link"

const PREDEFINED_CATEGORIES = [
  "تصميم",
  "هندسة",
  "إدارة المنتجات",
  "تسويق",
  "علم البيانات",
  "أعمال",
  "مبيعات"
]

const STOCK_IMAGES = [
  { id: "code", label: "برمجة", url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1000&q=80" },
  { id: "design", label: "تصميم إبداعي", url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=80" },
  { id: "meeting", label: "اجتماع عمل", url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80" },
  { id: "conf", label: "مؤتمر", url: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1000&q=80" },
  { id: "laptop", label: "بيئة العمل", url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80" },
  { id: "data", label: "بيانات وتحليل", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80" },
  { id: "team", label: "فريق العمل", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" },
  { id: "neon", label: "تقنية متقدمة", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80" },
]

export default function NewEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [imageMode, setImageMode] = useState<"upload" | "stock">("stock")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    duration: "",
    speakerName: "",
    speakerTitle: "",
    speakerCompany: "",
    tags: "",
    category: PREDEFINED_CATEGORIES[0],
    location: "",
    level: "مبتدئ",
    status: "upcoming",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleStockSelect = (url: string) => {
    setImageFile(null)
    setImagePreview(url)
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "custom") {
      setIsCustomCategory(true)
      setFormData({ ...formData, category: "" })
    } else {
      setIsCustomCategory(false)
      setFormData({ ...formData, category: e.target.value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = imagePreview

      if (imageMode === "upload" && imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from("event-images").upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from("event-images").getPublicUrl(fileName)
        imageUrl = publicUrl
      }

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(t => t.length > 0)
      const speakersArray = [{ name: formData.speakerName, title: formData.speakerTitle, company: formData.speakerCompany || undefined }]

      const { error: insertError } = await supabase.from("events").insert({
        title: formData.title,
        description: formData.description,
        start_time: startDateTime.toISOString(),
        duration: parseInt(formData.duration) || 0,
        category: formData.category,
        location: formData.location || "Virtual",
        level: formData.level,
        status: formData.status,
        tags: tagsArray,
        speakers: speakersArray,
        speaker_name: formData.speakerName,
        speaker_title: formData.speakerTitle,
        speaker_company: formData.speakerCompany || null,
        image: imageUrl,
        summary: formData.description.substring(0, 150) + "...",
      })

      if (insertError) throw insertError
      setSuccess(true)
      setTimeout(() => router.push("/admin/events"), 1500)
    } catch (error: any) {
      console.error("Error:", error)
      alert(`خطأ: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" dir="rtl">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">تم نشر الفعالية بنجاح!</h2>
        <p className="text-slate-500 mt-2">جارٍ التحويل إلى قائمة الفعاليات...</p>
      </div>
    )
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إضافة فعالية جديدة</h1>
          <p className="text-slate-500 text-sm mt-1">أدخل تفاصيل الفعالية لنشرها على المنصة.</p>
        </div>
        <Link href="/admin/events">
          <Button variant="outline" size="sm">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للفعاليات
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: تفاصيل الفعالية */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5 text-emerald-600">
              <Type className="h-5 w-5" />
              <h3 className="font-semibold text-slate-900">تفاصيل الفعالية</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">عنوان الفعالية *</label>
                <input required type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-right"
                  placeholder="مثال: ورشة تطوير التطبيقات"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف *</label>
                <textarea required rows={4} value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-right"
                  placeholder="ماذا سيتعلم المشاركون؟"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">القسم</label>
                  {!isCustomCategory ? (
                    <select value={formData.category} onChange={handleCategoryChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-emerald-500 outline-none bg-white text-right">
                      {PREDEFINED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="custom">+ إضافة قسم جديد...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input autoFocus required type="text" value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="اكتب اسم القسم..." />
                      <Button type="button" variant="outline" onClick={() => { setIsCustomCategory(false); setFormData({ ...formData, category: PREDEFINED_CATEGORIES[0] }) }}>إلغاء</Button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الوسوم (مفصولة بفاصلة)</label>
                  <div className="relative">
                    <Tag className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <input type="text" value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 pr-10 pl-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-right"
                      placeholder="react, تصميم, أعمال" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: الوقت والمكان */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5 text-emerald-600">
              <Calendar className="h-5 w-5" />
              <h3 className="font-semibold text-slate-900">الوقت والمكان</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البداية *</label>
                <input required type="date" value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">وقت البداية *</label>
                <input required type="time" value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المدة (بالدقائق) *</label>
                <input required type="number" min="1" value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500" placeholder="60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الموقع</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  <input type="text" value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 pr-10 pl-4 py-2.5 outline-none focus:border-emerald-500 text-right"
                    placeholder="عبر الإنترنت / Zoom" />
                </div>
              </div>
            </div>
          </div>

          {/* Card: المتحدث */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5 text-emerald-600">
              <User className="h-5 w-5" />
              <h3 className="font-semibold text-slate-900">بيانات المتحدث</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الكامل *</label>
                <input required type="text" value={formData.speakerName}
                  onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-right"
                  placeholder="مثال: أحمد محمد" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المسمى الوظيفي *</label>
                  <input required type="text" value={formData.speakerTitle}
                    onChange={(e) => setFormData({ ...formData, speakerTitle: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 text-right"
                    placeholder="مثال: مهندس برمجيات أول" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الشركة</label>
                  <input type="text" value={formData.speakerCompany}
                    onChange={(e) => setFormData({ ...formData, speakerCompany: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 text-right"
                    placeholder="مثال: شركة سبأ" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="space-y-6">
          
          {/* Card: صورة الفعالية */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <ImageIcon className="h-5 w-5" />
                <h3 className="font-semibold text-slate-900">صورة الفعالية</h3>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button type="button" onClick={() => setImageMode("upload")}
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", imageMode === "upload" ? "bg-white shadow text-slate-900" : "text-slate-500")}>
                  رفع
                </button>
                <button type="button" onClick={() => setImageMode("stock")}
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", imageMode === "stock" ? "bg-white shadow text-slate-900" : "text-slate-500")}>
                  مكتبة
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="relative flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="معاينة" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    {imageMode === "upload" ? <Upload className="w-8 h-8" /> : <Grid className="w-8 h-8" />}
                    <p className="text-sm">{imageMode === "upload" ? "انقر لرفع صورة" : "اختر من المكتبة"}</p>
                  </div>
                )}
                {imageMode === "upload" && (
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                )}
              </div>
              {imageMode === "stock" && (
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                  {STOCK_IMAGES.map((img) => (
                    <div key={img.id} onClick={() => handleStockSelect(img.url)}
                      className={cn("relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:opacity-90",
                        imagePreview === img.url ? "border-emerald-500 ring-2 ring-emerald-200" : "border-transparent")}>
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      {imagePreview === img.url && (
                        <div className="absolute inset-0 bg-emerald-900/20 flex items-center justify-center">
                          <CheckCircle2 className="text-white h-5 w-5" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                        <p className="text-[10px] text-white text-center">{img.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card: الإعدادات */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">الإعدادات</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">مستوى الصعوبة</label>
                <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none bg-white focus:border-emerald-500 text-right">
                  <option value="مبتدئ">مبتدئ</option>
                  <option value="متوسط">متوسط</option>
                  <option value="متقدم">متقدم</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none bg-white focus:border-emerald-500 text-right">
                  <option value="upcoming">قادمة</option>
                  <option value="past">سابقة (متاح للمشاهدة)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جارٍ النشر...</> : "نشر الفعالية"}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/admin/events")}>إلغاء</Button>
          </div>
        </div>
      </form>
    </div>
  )
}