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
  const [adminProfile, setAdminProfile] = useState<{ role: string, permissions: string[] } | null>(null)

  useEffect(() => {
    async function checkAdminAccess() {
      // Mock session logic fallback
      if (typeof window !== "undefined" && localStorage.getItem("mock_admin_session") === "true") {
        setAdminProfile({ role: "main_admin", permissions: [] })
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
          .select("role, permissions")
          .eq("id", user.id)
          .single()

        const allowedRoles = ["main_admin", "super_admin", "community_admin", "admin"] // Retain "admin" as fallback for unmigrated DBs
        if (profileError || !allowedRoles.includes(profile?.role)) {
          router.push("/")
          return
        }

        // RBAC Route Protection
        const currentModule = pathname.split('/')[2] // /admin/events -> events
        if (profile.role === "community_admin" && currentModule) {
          const permMap: Record<string, string> = {
            "events": "events",
            "media": "media",
            "library": "media", 
            "members": "users",
            "settings": "settings" // settings is usually super admin only
          }
          
          const requiredPerm = permMap[currentModule]
          const perms = profile.permissions || []
          
          // If the module requires a specific permission and they don't have it
          if (requiredPerm && !perms.includes(requiredPerm)) {
            router.push("/admin")
            return
          }
          
          // Community Admins should not access settings at all
          if (currentModule === "settings") {
            router.push("/admin")
            return
          }
        }

        setAdminProfile(profile)
      } catch (error) {
        console.error("Error checking admin access:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [router, pathname])

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

  if (!adminProfile) return null

  // Define Links
  const ALL_LINKS = [
    { key: "nav_dashboard", href: "/admin", icon: LayoutDashboard, requiredPerm: null },
    { key: "nav_events", href: "/admin/events", icon: CalendarDays, requiredPerm: "events" },
    { key: "nav_members", href: "/admin/members", icon: Users, requiredPerm: "users" },
    { key: "nav_library", href: "/admin/library", icon: BookOpen, requiredPerm: "media" },
    { key: "nav_media", href: "/admin/media", icon: Newspaper, requiredPerm: "media" },
    { key: "nav_settings", href: "/admin/settings", icon: Settings, requiredPerm: "settings" },
  ]

  // Filter links based on role
  const ADMIN_LINKS = ALL_LINKS.filter(link => {
    if (adminProfile.role === "main_admin" || adminProfile.role === "super_admin" || adminProfile.role === "admin") {
      return true
    }
    // community_admin logic
    if (link.requiredPerm === null) return true // everyone gets dashboard
    if (link.requiredPerm === "settings") return false // hide settings
    return (adminProfile.permissions || []).includes(link.requiredPerm)
  })

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
