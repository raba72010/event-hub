"use client"

import { Settings } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">الإعدادات</h1>
        <p className="text-slate-500 text-sm mt-1">إعدادات المنصة والنادي.</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="p-5 bg-slate-100 rounded-full mb-5">
          <Settings className="h-10 w-10" />
        </div>
        <h3 className="text-lg font-semibold text-slate-600">قريباً</h3>
        <p className="text-sm mt-2 max-w-xs text-center">ستتمكن قريباً من ضبط إعدادات المنصة من هذه الصفحة.</p>
      </div>
    </div>
  )
}
