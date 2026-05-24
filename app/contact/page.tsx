"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, CheckCircle, Send, Loader2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"

export default function ContactPage() {
  const { t, locale } = useTranslation()
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      setError(locale === "ar" ? "يرجى ملء جميع الحقول" : "Please fill in all fields")
      return
    }
    setError("")
    setIsSubmitting(true)

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setFormData({ name: "", email: "", message: "" })
    }, 1500)
  }

  const isRtl = locale === "ar"

  return (
    <div className="container mx-auto px-4 py-12 md:px-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12 animate-in fade-in duration-500">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{t("contact.title")}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t("contact.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          {isSuccess ? (
            <div className="text-center py-10 space-y-4 animate-in zoom-in duration-300">
              <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("contact.success_title")}</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">{t("contact.success_body")}</p>
              <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-4 dark:border-slate-700 dark:text-slate-200">
                {locale === "ar" ? "أرسل رسالة أخرى" : "Send another message"}
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("contact.send_message")}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 rounded-lg text-rose-600 dark:text-rose-400 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("contact.name")}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 dark:bg-slate-950 dark:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("contact.email")}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 dark:bg-slate-950 dark:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("contact.message")}</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 dark:bg-slate-950 dark:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 h-11">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("contact.sending")}
                    </>
                  ) : (
                    <>
                      <Send className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
                      {t("contact.submit")}
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-8 flex flex-col justify-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("contact.info_title")}</h2>

            <div className="flex items-start gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{t("contact.email_label")}</h4>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">info@spc.org.sd</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl text-blue-600 dark:text-blue-400 shrink-0">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{t("contact.phone_label")}</h4>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5" dir="ltr">+249 123 456 789</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-2xl text-rose-600 dark:text-rose-400 shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{t("contact.address_label")}</h4>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{t("contact.address_value")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
