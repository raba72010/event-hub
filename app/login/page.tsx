"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// Wrapper to handle search params safely
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
  const viewParam = searchParams.get("view") // 'sign_up' or 'sign_in'

  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"sign_in" | "sign_up">(viewParam === "sign_up" ? "sign_up" : "sign_in")
  const [message, setMessage] = useState<{ text: string, type: "error" | "success" } | null>(null)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "", // Only for sign up
  })

  // Toggle mode if the URL param changes
  useEffect(() => {
    if (viewParam === "sign_up") setMode("sign_up")
    else setMode("sign_in")
  }, [viewParam])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (mode === "sign_up") {
        // 1. Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        })
        if (error) throw error
        
        // Success message for email confirmation (if enabled) or direct login
        if (data.user && !data.session) {
            setMessage({ text: "Please check your email to confirm your account.", type: "success" })
        } else {
            // Create profile record if needed (Supabase triggers usually handle this, but good to be safe)
            router.push("/") 
        }

      } else {
        // 2. Sign In
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* LEFT SIDE: Branding Board */}
      <div className="hidden md:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center text-center p-12">
         {/* Background Orbs */}
         <div className="absolute top-10 right-10 h-80 w-80 rounded-full bg-emerald-500 blur-[100px] opacity-20" />
         <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-blue-500 blur-[100px] opacity-20" />
         
         <div className="relative z-10 text-white space-y-6">
            <img src="/logo.png" alt="SPC Logo" className="h-24 w-24 object-contain bg-white rounded-full mx-auto shadow-2xl" />
            <div>
               <h1 className="text-4xl font-bold">Sudanese Professionals Club</h1>
               <p className="text-lg text-slate-300 mt-2">نادي المحترفين السودانيين</p>
            </div>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
               Join a community of forward-thinking professionals. Access exclusive workshops, network with peers, and accelerate your career growth.
            </p>
         </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <Button variant="ghost" className="absolute top-6 left-6 md:left-auto md:right-6" onClick={() => router.push("/")}>
           <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <div className="w-full max-w-md space-y-8">
           
           {/* Mobile Logo (Visible only on small screens) */}
           <div className="md:hidden text-center space-y-2">
              <img src="/logo.png" alt="SPC Logo" className="h-16 w-16 mx-auto bg-white rounded-full border border-gray-100 shadow-sm" />
              <h2 className="text-xl font-bold text-slate-900">SPC</h2>
           </div>

           <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">
                {mode === "sign_in" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-slate-500 mt-2">
                {mode === "sign_in" ? "Enter your credentials to access your account" : "Join the club and start your journey"}
              </p>
           </div>

           {/* Error/Success Message */}
           {message && (
             <div className={cn(
               "p-4 rounded-lg flex items-center gap-3 text-sm",
               message.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
             )}>
                {message.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                {message.text}
             </div>
           )}

           <form onSubmit={handleAuth} className="space-y-5">
              
              {mode === "sign_up" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                   <label className="text-sm font-medium text-slate-700">Full Name</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        required 
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                   </div>
                </div>
              )}

              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input 
                      type="email" 
                      required 
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700">Password</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                 </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-base" disabled={isLoading}>
                 {isLoading ? <Loader2 className="animate-spin" /> : (mode === "sign_in" ? "Sign In" : "Create Account")}
              </Button>
           </form>

           <div className="text-center space-y-4">
              <div className="relative">
                 <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                 <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400">or</span></div>
              </div>

              <button 
                onClick={() => {
                   setMode(mode === "sign_in" ? "sign_up" : "sign_in")
                   setMessage(null)
                }}
                className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors"
              >
                {mode === "sign_in" ? "Don't have an account? Join Now" : "Already a member? Sign In"}
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}