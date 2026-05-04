"use client"

import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  
  if (pathname === '/login') return null;

  return (
    <footer className="border-t border-slate-200 bg-white py-12" dir="rtl">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-2">
           <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">SPC</div>
           <span className="font-bold text-slate-900">نادي المحترفين السودانيين</span>
         </div>
         <p className="text-sm text-slate-500">© 2026 SPC. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  )
}
