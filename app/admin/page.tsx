"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import {
  Users,
  CalendarDays,
  BookOpen,
  Plus
} from "lucide-react"

export default function AdminDashboardOverview() {
  const { t, locale } = useTranslation()
  const [stats, setStats] = useState({
    events: 0,
    members: 0,
    communities: 8,
  })
  const [recentEvents, setRecentEvents] = useState<any[]>([])

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: eventsCount } = await supabase.from("events").select("*", { count: "exact", head: true })
        const { count: membersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })
        
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)
        
        setStats({
          events: eventsCount || 0,
          members: membersCount || 0,
          communities: 8,
        })
        if (eventsData) setRecentEvents(eventsData)
      } catch (err) {
        console.error("Error fetching admin stats:", err)
      }
    }
    fetchStats()
  }, [])

  const dateLocale = locale === "ar" ? "ar-EG" : "en-US"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("admin.dash_overview")}</h1>
          <p className="text-slate-500 text-sm mt-1">{t("admin.dash_welcome")}</p>
        </div>
        <Link href="/admin/events/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("admin.dash_add_event")}
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t("admin.dash_total_events")}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.events}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t("admin.dash_members")}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.members}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t("admin.dash_communities")}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.communities}</h3>
          </div>
        </div>
      </div>

      {/* RECENT EVENTS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">{t("admin.dash_recent_events")}</h2>
          <Link href="/admin/events" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            {t("admin.dash_view_all")} &larr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ textAlign: locale === "ar" ? "right" : "left" }}>
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">{t("admin.dash_col_title")}</th>
                <th className="px-6 py-4 font-medium">{t("admin.dash_col_date")}</th>
                <th className="px-6 py-4 font-medium">{t("admin.dash_col_category")}</th>
                <th className="px-6 py-4 font-medium">{t("admin.dash_col_status")}</th>
                <th className="px-6 py-4 font-medium" style={{ textAlign: locale === "ar" ? "left" : "right" }}>{t("admin.dash_col_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    {t("admin.dash_no_events")}
                  </td>
                </tr>
              ) : (
                recentEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{event.title}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{new Date(event.start_time).toLocaleDateString(dateLocale)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{event.category}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {event.status === "upcoming" ? t("admin.dash_upcoming") : t("admin.dash_past")}
                      </span>
                    </td>
                    <td className="px-6 py-4" style={{ textAlign: locale === "ar" ? "left" : "right" }}>
                      <Link href={`/admin/edit/${event.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                        {t("admin.dash_edit")}
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
