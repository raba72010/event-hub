"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, User, Shield } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserSidebar } from "@/components/user-sidebar"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Globe } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"

const NAV_PATHS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "communities", href: "/communities" },
  { key: "media", href: "/media" },
  { key: "library", href: "/library" },
  { key: "contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname()
  const { t, locale, setLocale } = useTranslation()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      if (typeof window !== "undefined" && localStorage.getItem("mock_admin_session") === "true") {
        setIsSignedIn(true)
        setIsAdmin(true)
        setUserEmail("admin@eventhub.com")
        return
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error;
        setIsSignedIn(!!session)
        setUserEmail(session?.user?.email || null)

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          if (profile?.role === 'admin') setIsAdmin(true)
        }
      } catch (e) {
        // Fallback or ignore for mock mode
      }
    }
    checkAuth()
    
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (typeof window !== "undefined" && localStorage.getItem("mock_admin_session") === "true") {
           return;
        }
        setIsSignedIn(!!session)
        setUserEmail(session?.user?.email || null)
      })
      return () => subscription.unsubscribe()
    } catch (e) { }
  }, [])

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mock_admin_session")
    }
    try {
      await supabase.auth.signOut()
    } catch (e) {}
    window.location.reload()
  }

  // Hide navbar on login page to match existing design
  if (pathname === '/login') return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="SPC Logo" 
              className="h-10 w-10 object-contain rounded-full bg-white"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} 
            />
            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold">SPC</div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none text-slate-900">نادي المحترفين السودانيين</span>
            </div>
          </Link>
        </div>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_PATHS.map(link => (
             <Link 
               key={link.href} 
               href={link.href}
               className={cn("hover:text-emerald-600 transition-colors", pathname === link.href ? "text-emerald-600" : "text-slate-600")}
             >
               {t(`nav.${link.key}`)}
             </Link>
          ))}
        </div>

        {/* USER CONTROLS & LANGUAGE SWITCHER */}
        <div className="hidden md:flex items-center gap-4">
          
          <div className="h-6 w-px bg-slate-200 mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="text-slate-600 hover:text-slate-900"
          >
            <Globe className="h-4 w-4 me-2" />
            {locale === "ar" ? "English" : "عربي"}
          </Button>

          <div className="h-6 w-px bg-slate-200 mx-2" />
          {isSignedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" className="text-indigo-600 font-medium gap-2">
                    <Shield className="h-4 w-4" />
                    {t('nav.admin')}
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 gap-2">
                  <User className="h-4 w-4" />
                  {t('nav.profile')}
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm" className="border-slate-300 ms-2">{t('nav.logout')}</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost">{t('nav.login')}</Button></Link>
              <Link href="/login?view=sign_up"><Button className="bg-slate-900 hover:bg-slate-800 text-white ms-2">{t('nav.join')}</Button></Link>
            </>
          )}
        </div>

        {/* MOBILE MENU */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden"><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side={locale === "ar" ? "left" : "right"} className="w-80 bg-white overflow-y-auto" dir={locale === "ar" ? "rtl" : "ltr"}>
            <div className="flex flex-col gap-6 mt-6">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-6">
                {NAV_PATHS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn("text-lg font-medium", pathname === link.href ? "text-emerald-600" : "text-slate-700")}
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                ))}
              </div>

              {/* Language switcher (mobile) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                className="self-start gap-2"
              >
                <Globe className="h-4 w-4" />
                {locale === "ar" ? "English" : "عربي"}
              </Button>

              <UserSidebar isSignedIn={isSignedIn} userEmail={userEmail} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
