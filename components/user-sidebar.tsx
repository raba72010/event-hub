"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, CalendarCheck, LogIn, Settings, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface UserSidebarProps {
  // Props kept for backward compatibility but component manages its own auth state
  isSignedIn?: boolean
  userEmail?: string | null
}

export function UserSidebar(_props: UserSidebarProps = {}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check auth state on mount
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error checking auth:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const isAuthenticated = !!user
  const email = user?.email || null

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white">
          <User2 className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {isAuthenticated ? "Welcome back" : "Join the hub"}
          </p>
          <p className="text-xs text-gray-600">
            {isAuthenticated
              ? email || "See your schedule and saved sessions."
              : "Sign in to sync your registrations."}
          </p>
        </div>
        {isAuthenticated ? (
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-2">
        <SidebarLink icon={<CalendarCheck className="h-4 w-4" />} label="My registrations" active />
        <SidebarLink icon={<Bookmark className="h-4 w-4" />} label="Saved sessions" />
        <SidebarLink icon={<Settings className="h-4 w-4" />} label="Preferences" />
        {!isAuthenticated && <SidebarLink icon={<LogIn className="h-4 w-4" />} label="Create an account" />}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-900">Need help?</p>
        <p className="mt-1">Chat with our team to find the right session for your goals.</p>
        <Button className="mt-3 w-full" variant="ghost" size="sm">
          Talk to us
        </Button>
      </div>
    </div>
  )
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition active:scale-95 ${
        active
          ? "bg-gray-100 font-semibold text-gray-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <span className="text-gray-600">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

