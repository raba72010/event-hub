"use client"

import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"

export default function ContactPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  return (
    <div className="container mx-auto px-4 py-12 md:px-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-slate-900">{t("contact.title")}</h1>
        <p className="text-lg text-slate-600">{t("contact.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">{t("contact.send_message")}</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("contact.full_name")}</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("contact.email")}</label>
              <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("contact.message")}</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">{t("contact.send_btn")}</Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">{t("contact.info_title")}</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-50 p-3 rounded-full text-emerald-600"><Mail className="h-6 w-6" /></div>
              <div>
                <h4 className="font-bold text-slate-900">{t("contact.email_label")}</h4>
                <p className="text-slate-600">info@spc.org.sd</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Phone className="h-6 w-6" /></div>
              <div>
                <h4 className="font-bold text-slate-900">{t("contact.phone_label")}</h4>
                <p className="text-slate-600">+249 123 456 789</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-rose-50 p-3 rounded-full text-rose-600"><MapPin className="h-6 w-6" /></div>
              <div>
                <h4 className="font-bold text-slate-900">{t("contact.address_label")}</h4>
                <p className="text-slate-600">{t("contact.address_value")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
