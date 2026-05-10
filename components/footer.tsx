"use client"

import { usePathname } from "next/navigation"
import { useTranslation } from "@/lib/i18n-context"

export function Footer() {
  const pathname = usePathname()
  const { locale } = useTranslation()

  if (pathname === '/login') return null;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 transition-colors" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-2">
           <div className="h-6 w-6 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">SPC</div>
           <span className="font-bold text-slate-900 dark:text-slate-100">نادي المحترفين السودانيين</span>
         </div>
         <p className="text-sm text-slate-500 dark:text-slate-400">© 2026 SPC. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  )
}
