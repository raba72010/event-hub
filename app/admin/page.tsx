"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { 
  Users, 
  CalendarDays, 
  BookOpen, 
  TrendingUp,
  Plus
} from "lucide-react"

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    events: 0,
    members: 1520, // Mocked for now
    communities: 8, // Mocked
  })

  const [recentEvents, setRecentEvents] = useState<any[]>([])

  useEffect(() => {
    async function fetchStats() {
      // Fetch actual event count
      const { count } = await supabase.from("events").select("*", { count: "exact", head: true })
      
      // Fetch recent events
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)
      
      setStats(prev => ({ ...prev, events: count || 0 }))
      if (data) setRecentEvents(data)
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">نظرة عامة</h1>
          <p className="text-slate-500 text-sm mt-1">مرحباً بك في لوحة تحكم نادي المحترفين السودانيين.</p>
        </div>
        <Link href="/admin/events/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
           <Plus className="h-4 w-4" />
           إضافة فعالية جديدة
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
           <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
             <CalendarDays className="h-6 w-6" />
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium">إجمالي الفعاليات</p>
             <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.events}</h3>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
           <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
             <Users className="h-6 w-6" />
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium">الأعضاء المسجلين</p>
             <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.members}</h3>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
           <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
             <BookOpen className="h-6 w-6" />
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium">المجتمعات النشطة</p>
             <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.communities}</h3>
           </div>
        </div>
      </div>

      {/* RECENT EVENTS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">أحدث الفعاليات</h2>
          <Link href="/admin/events" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
             عرض الكل &larr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">عنوان الفعالية</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">القسم</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    لا توجد فعاليات مضافة بعد.
                  </td>
                </tr>
              ) : (
                recentEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{event.title}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(event.start_time).toLocaleDateString('ar-EG')}</td>
                    <td className="px-6 py-4 text-slate-600">{event.category}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {event.status === 'upcoming' ? 'قادمة' : 'سابقة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <Link href={`/admin/edit/${event.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                        تعديل
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
