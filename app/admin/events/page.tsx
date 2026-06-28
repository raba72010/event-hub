"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import { Plus, Pencil, Loader2, CalendarDays, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminEventsPage() {
  const { t, locale } = useTranslation()
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

  const dateLocale = locale === "ar" ? "ar-EG" : "en-US"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("admin.events_title")}</h1>
          <p className="text-slate-500 text-sm mt-1">{t("admin.events_subtitle")}</p>
        </div>
        <Link href="/admin/events/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("admin.events_add")}
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
              <h3 className="text-lg font-semibold text-slate-700">{t("admin.events_none")}</h3>
              <p className="text-sm mt-1">{t("admin.events_none_desc")}</p>
              <Link href="/admin/events/new" className="mt-4 inline-block">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white mt-3">
                  <Plus className="h-4 w-4 me-1" /> {t("admin.events_add")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ textAlign: locale === "ar" ? "right" : "left" }}>
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">{t("admin.events_col_event")}</th>
                    <th className="px-6 py-4 font-medium">{t("admin.events_col_date")}</th>
                    <th className="px-6 py-4 font-medium">{t("admin.events_col_category")}</th>
                    <th className="px-6 py-4 font-medium">{t("admin.events_col_level")}</th>
                    <th className="px-6 py-4 font-medium">{t("admin.events_col_status")}</th>
                    <th className="px-6 py-4 font-medium" style={{ textAlign: locale === "ar" ? "left" : "right" }}>{t("admin.events_col_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {events.map(event => {
                    const dateObj = event.start_time ? new Date(event.start_time) : null
                    const dateStr = dateObj ? dateObj.toLocaleDateString(dateLocale) : "—"
                    return (
                      <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {event.image ? (
                              <img src={event.image} alt={event.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 font-bold">
                                {event.title?.charAt(0) || "E"}
                              </div>
                            )}
                            <span className="font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">{event.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{dateStr}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{event.category || "—"}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{event.level || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.status === "upcoming"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}>
                            {event.status === "upcoming" ? t("admin.events_status_upcoming") : t("admin.events_status_past")}
                          </span>
                        </td>
                        <td className="px-6 py-4" style={{ textAlign: locale === "ar" ? "left" : "right" }}>
                          <div className="flex items-center gap-3 justify-end">
                            <Link href={`/admin/attendees/${event.id}`} className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" /> {t("admin.events_attendees")}
                            </Link>
                            <Link href={`/admin/edit/${event.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs flex items-center gap-1">
                              <Pencil className="h-3.5 w-3.5" /> {t("admin.events_edit")}
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
