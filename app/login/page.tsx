"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ArrowRight, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n-context"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewParam = searchParams.get("view")
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"sign_in" | "sign_up">(viewParam === "sign_up" ? "sign_up" : "sign_in")
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null)
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "" })

  useEffect(() => {
    if (viewParam === "sign_up") setMode("sign_up")
    else setMode("sign_in")
  }, [viewParam])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Dev-only mock admin bypass — never runs in production
      if (process.env.NODE_ENV !== "production" &&
          formData.email === "admin@spc.sd" &&
          formData.password === "admin") {
        localStorage.setItem("mock_admin_session", "true")
        router.push("/")
        router.refresh()
        return
      }

      if (mode === "sign_up") {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.fullName } },
        })
        if (error) throw error
        if (data.user && !data.session) {
          setMessage({ text: t("auth.email_confirm"), type: "success" })
        } else {
          router.push("/")
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
        router.push("/")
        router.refresh()
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" dir={isRtl ? "rtl" : "ltr"}>

      {/* LEFT SIDE: Branding */}
      <div className="hidden md:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center text-center p-12">
        <div className="absolute top-10 right-10 h-80 w-80 rounded-full bg-emerald-500 blur-[100px] opacity-20" />
        <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-blue-500 blur-[100px] opacity-20" />
        <div className="relative z-10 text-white space-y-6">
          <img src="/logo.png" alt="SPC Logo" className="h-24 w-24 object-contain bg-white rounded-full mx-auto shadow-2xl" />
          <div>
            <h1 className="text-4xl font-bold">{t("auth.brand_name")}</h1>
            <p className="text-lg text-slate-300 mt-2">{t("auth.brand_subtitle")}</p>
          </div>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">{t("auth.brand_desc")}</p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <Button
          variant="ghost"
          className={cn("absolute top-6", isRtl ? "right-6" : "left-6")}
          onClick={() => router.push("/")}
        >
          <BackIcon className="h-4 w-4 me-2" />
          {t("auth.back_home")}
        </Button>

        <div className="w-full max-w-md space-y-8">

          {/* Mobile Logo */}
          <div className="md:hidden text-center space-y-2">
            <img src="/logo.png" alt="SPC Logo" className="h-16 w-16 mx-auto bg-white rounded-full border border-gray-100 shadow-sm" />
            <h2 className="text-xl font-bold text-slate-900">SPC</h2>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              {mode === "sign_in" ? t("auth.sign_in_title") : t("auth.sign_up_title")}
            </h2>
            <p className="text-slate-500 mt-2">
              {mode === "sign_in" ? t("auth.sign_in_desc") : t("auth.sign_up_desc")}
            </p>
          </div>

          {/* Error/Success Message */}
          {message && (
            <div className={cn(
              "p-4 rounded-lg flex items-center gap-3 text-sm",
              message.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
            )}>
              {message.type === "error" ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">

            {mode === "sign_up" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-medium text-slate-700">{t("auth.full_name")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("auth.full_name_placeholder")}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{t("auth.email")}</label>
              <div className="relative">
                <Mail className={cn("absolute top-3.5 h-5 w-5 text-gray-400", isRtl ? "right-3" : "left-3")} />
                <input
                  type="email"
                  required
                  placeholder={t("auth.email_placeholder")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={cn(
                    "w-full py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all",
                    isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{t("auth.password")}</label>
              <div className="relative">
                <Lock className={cn("absolute top-3.5 h-5 w-5 text-gray-400", isRtl ? "right-3" : "left-3")} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={cn(
                    "w-full py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all",
                    isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-base" disabled={isLoading}>
              {isLoading
                ? <Loader2 className="animate-spin" />
                : mode === "sign_in" ? t("auth.sign_in_btn") : t("auth.sign_up_btn")}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-2 text-slate-400">{t("auth.or")}</span>
              </div>
            </div>
            <button
              onClick={() => { setMode(mode === "sign_in" ? "sign_up" : "sign_in"); setMessage(null) }}
              className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors"
            >
              {mode === "sign_in" ? t("auth.no_account") : t("auth.have_account")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
