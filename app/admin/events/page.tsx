"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Plus, Pencil, Loader2, CalendarDays, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: false })
      setEvents(data || [])
      setIsLoading(false)
    }
    fetchEvents()
  }, [])

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الفعاليات</h1>
          <p className="text-slate-500 text-sm mt-1">عرض وتعديل جميع فعاليات النادي.</p>
        </div>
        <Link href="/admin/events/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة فعالية جديدة
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {events.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700">لا توجد فعاليات بعد</h3>
              <p className="text-sm mt-1">ابدأ بإضافة أول فعالية للنادي.</p>
              <Link href="/admin/events/new" className="mt-4 inline-block">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white mt-3">
                  <Plus className="h-4 w-4 ml-1" /> إضافة فعالية
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">الفعالية</th>
                    <th className="px-6 py-4 font-medium">التاريخ</th>
                    <th className="px-6 py-4 font-medium">القسم</th>
                    <th className="px-6 py-4 font-medium">المستوى</th>
                    <th className="px-6 py-4 font-medium">الحالة</th>
                    <th className="px-6 py-4 font-medium text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map(event => {
                    const dateObj = event.start_time ? new Date(event.start_time) : null
                    const dateStr = dateObj ? dateObj.toLocaleDateString("ar-EG") : "—"
                    return (
                      <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {event.image ? (
                              <img src={event.image} alt={event.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 font-bold">
                                {event.title?.charAt(0) || "ف"}
                              </div>
                            )}
                            <span className="font-medium text-slate-900 max-w-xs truncate">{event.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{dateStr}</td>
                        <td className="px-6 py-4 text-slate-600">{event.category || "—"}</td>
                        <td className="px-6 py-4 text-slate-600">{event.level || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.status === "upcoming" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {event.status === "upcoming" ? "قادمة" : "سابقة"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center gap-3 justify-end">
                            <Link href={`/admin/attendees/${event.id}`} className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" /> الحضور
                            </Link>
                            <Link href={`/admin/edit/${event.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs flex items-center gap-1">
                              <Pencil className="h-3.5 w-3.5" /> تعديل
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
