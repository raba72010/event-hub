"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Loader2,
  BookOpen,
  Newspaper
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkAdminAccess() {
      if (typeof window !== "undefined" && localStorage.getItem("mock_admin_session") === "true") {
        setIsAdmin(true)
        setIsLoading(false)
        return
      }

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/login")
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError || profile?.role !== "admin") {
          router.push("/")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("Error checking admin access:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mock_admin_session")
    }
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!isAdmin) return null

  const ADMIN_LINKS = [
    { key: "nav_dashboard", href: "/admin", icon: LayoutDashboard },
    { key: "nav_events", href: "/admin/events", icon: CalendarDays },
    { key: "nav_members", href: "/admin/members", icon: Users },
    { key: "nav_library", href: "/admin/library", icon: BookOpen },
    { key: "nav_media", href: "/admin/media", icon: Newspaper },
    { key: "nav_settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex" dir={isRtl ? "rtl" : "ltr"}>
      {/* Sidebar Navigation */}
      <aside className={cn(
        "w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col",
        isRtl ? "border-r border-slate-800" : "border-r border-slate-800"
      )}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">{t("admin.portal_title")}</h2>
          <p className="text-xs text-slate-400 mt-1">{t("admin.portal_subtitle")}</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon
            const isActive = link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(`admin.${link.key}`)}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t("admin.sign_out")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
