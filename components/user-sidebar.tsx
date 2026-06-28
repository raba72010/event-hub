"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Bookmark, CalendarCheck, LogIn, Settings, User2, Shield, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import type { User } from "@supabase/supabase-js"

interface UserSidebarProps {
  isSignedIn?: boolean
  userEmail?: string | null
}

export function UserSidebar(_props: UserSidebarProps = {}) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      if (typeof window !== "undefined" && localStorage.getItem("mock_admin_session") === "true") {
        setUser({ id: "mock-admin-id", email: "admin@spc.sd" } as any)
        setUserRole("admin")
        setIsLoading(false)
        return
      }

      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()
          setUserRole(profile?.role || null)
        } else {
          setUserRole(null)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setUser(null)
        setUserRole(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (typeof window !== "undefined" && localStorage.getItem("mock_admin_session") === "true") return
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
        setUserRole(profile?.role || null)
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    if (typeof window !== "undefined") localStorage.removeItem("mock_admin_session")
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
    window.location.reload()
  }

  const isAuthenticated = !!user
  const email = user?.email || null

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      {/* Profile header — name + email stacked, sign-out below full-width */}
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/40 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 dark:bg-slate-700 text-white">
            <User2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
              {isAuthenticated ? t("sidebar.welcome_back") : t("sidebar.join_hub")}
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 truncate">
              {isAuthenticated ? (email || t("sidebar.see_schedule")) : t("sidebar.sign_in_sync")}
            </p>
          </div>
        </div>
        {isAuthenticated ? (
          <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            {t("sidebar.sign_out")}
          </Button>
        ) : (
          <Link href="/login" className="block">
            <Button variant="outline" size="sm" className="w-full dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{t("sidebar.sign_in")}</Button>
          </Link>
        )}
      </div>

      <div className="space-y-2">
        {isAuthenticated && (
          <>
            <SidebarLink
              icon={<User2 className="h-4 w-4" />}
              label={t("sidebar.my_profile")}
              href="/profile"
              active={pathname === "/profile"}
            />
            <SidebarLink
              icon={<MessageSquare className="h-4 w-4" />}
              label={t("nav.messages")}
              href="/messages"
              active={pathname === "/messages"}
            />
          </>
        )}
        <SidebarLink
          icon={<CalendarCheck className="h-4 w-4" />}
          label={t("sidebar.my_registrations")}
          href="/registrations"
          active={pathname === "/registrations"}
        />
        <SidebarLink
          icon={<Bookmark className="h-4 w-4" />}
          label={t("sidebar.saved_sessions")}
          href="/favorites"
          active={pathname === "/favorites"}
        />
        {userRole === "admin" && (
          <SidebarLink
            icon={<Shield className="h-4 w-4" />}
            label={t("sidebar.admin_dashboard")}
            href="/admin"
            active={pathname?.startsWith("/admin") || false}
          />
        )}
        <SidebarLink icon={<Settings className="h-4 w-4" />} label={t("sidebar.preferences")} />
        {!isAuthenticated && <SidebarLink icon={<LogIn className="h-4 w-4" />} label={t("sidebar.create_account")} href="/login?view=sign_up" />}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 p-4 text-sm text-gray-600 dark:text-slate-400">
        <p className="font-medium text-gray-900 dark:text-slate-100">{t("sidebar.need_help")}</p>
        <p className="mt-1">{t("sidebar.chat_team")}</p>
        <Link href="/contact" className="mt-3 block">
          <Button className="w-full dark:text-slate-200 dark:hover:bg-slate-800" variant="ghost" size="sm">
            {t("sidebar.talk_to_us")}
          </Button>
        </Link>
      </div>
    </div>
  )
}

function SidebarLink({
  icon, label, href, active = false,
}: {
  icon: React.ReactNode; label: string; href?: string; active?: boolean
}) {
  const content = (
    <>
      <span className={active ? "text-gray-900 dark:text-slate-100" : "text-gray-600 dark:text-slate-400"}>{icon}</span>
      <span>{label}</span>
    </>
  )
  const className = `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition active:scale-95 ${
    active
      ? "bg-gray-100 dark:bg-slate-800 font-semibold text-gray-900 dark:text-slate-100"
      : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
  }`
  if (href) return <Link href={href} className={className}>{content}</Link>
  return <button type="button" className={className}>{content}</button>
}
