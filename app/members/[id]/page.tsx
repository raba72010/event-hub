"use client"

import { useEffect, useState, use, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Briefcase, MapPin, Users as UsersIcon, Mail, Loader2, Calendar, MessageSquare, Sparkles, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import { COMMUNITIES } from "@/lib/communities"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Member {
  id: string
  full_name: string | null
  email: string | null
  title: string | null
  company: string | null
  bio: string | null
  location: string | null
  community: string | null
  availability: string | null
  avatar_url: string | null
  is_public: boolean | null
  created_at?: string | null
}

const AVAILABILITY_STYLES: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-450 dark:ring-emerald-800",
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-450 dark:ring-emerald-800",
  busy:      "bg-amber-50  text-amber-700  ring-amber-200  dark:bg-amber-950/40  dark:text-amber-450  dark:ring-amber-800",
  inactive:  "bg-slate-100 text-slate-500  ring-slate-200  dark:bg-slate-800     dark:text-slate-400  dark:ring-slate-750",
}

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"
  const Arrow = isRtl ? ArrowRight : ArrowLeft

  const [member, setMember] = useState<Member | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)

  // Real-time Chat States
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch authenticated user context
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id)
      } else if (typeof window !== "undefined" && localStorage.getItem("mock_admin_session") === "true") {
        setCurrentUserId("mock-admin-id")
      }
    })
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load chat history & subscribe to live updates
  useEffect(() => {
    if (!currentUserId || currentUserId === "mock-admin-id" || currentUserId === id) return

    let active = true

    async function loadMessages() {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUserId})`)
          .order("created_at", { ascending: true })

        if (error) throw error
        if (active) {
          setMessages(data || [])
        }
      } catch (err) {
        console.error("Error loading chat messages:", err)
      }
    }

    loadMessages()

    const channel = supabase
      .channel(`chat_${currentUserId}_${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === id) ||
            (newMsg.sender_id === id && newMsg.receiver_id === currentUserId)
          ) {
            if (active) {
              setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev
                return [...prev, newMsg]
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [currentUserId, id])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !currentUserId || currentUserId === "mock-admin-id") return

    const content = chatInput.trim()
    setChatInput("")
    setIsSending(true)

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: id,
          content,
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev
          return [...prev, data]
        })
      }
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    async function fetch() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, title, company, bio, location, community, availability, avatar_url, is_public, created_at")
          .eq("id", id)
          .maybeSingle()

        if (error) throw error
        if (!data) { setNotFound(true); return }
        if (data.is_public === false) { setIsPrivate(true); return }
        setMember(data)

        // Fetch public events they registered for
        const { data: regData } = await supabase
          .from("registrations")
          .select("event_id, events(id, title, start_time, category)")
          .eq("user_id", id)
          .limit(6)

        if (regData) {
          setEvents(regData)
        }
      } catch (e) {
        console.warn("Member profile: supabase error, using fallback mock", e)
        const allMock = [
          { id: "cfc233e2-e1bc-48e7-a5b0-bf4d8694b526", full_name: isRtl ? "م. محمد عكود" : "Eng. Mohamed Akoud", email: "mohamed.akoud@example.spc.sd", title: isRtl ? "مدير منتجات تقنية" : "Tech Product Manager", company: "Verizon", location: isRtl ? "نيويورك" : "New York", community: "ai", bio: isRtl ? "متخصص في الذكاء الاصطناعي وعلم البيانات." : "Specialized in AI and Data Science.", availability: "active", avatar_url: null, is_public: true, created_at: new Date().toISOString() },
          { id: "8784d544-0f1a-40ad-b63f-e1ebffdb0d4f", full_name: isRtl ? "د. أحمد كمال" : "Dr. Ahmed Kamal", email: "ahmed.kamal@example.spc.sd", title: isRtl ? "مدرب مهني | استشارات موارد بشرية" : "Career Coach | HR Consultant", company: isRtl ? "استشارات مستقلة" : "Independent Consulting", location: isRtl ? "الرياض" : "Riyadh", community: "strategic-planning", bio: isRtl ? "متخصص في تطوير المسارات المهنية والتدريب الإداري." : "Specialized in career coaching and admin training.", availability: "active", avatar_url: null, is_public: true, created_at: new Date().toISOString() },
          { id: "680b3240-16a0-419b-b769-ac18ba1990ea", full_name: isRtl ? "م. سارة إدريس" : "Eng. Sara Idris", email: "sara.idris@example.spc.sd", title: isRtl ? "مهندسة نظم معلومات" : "Information Systems Engineer", company: "Aramco Digital", location: isRtl ? "جدة" : "Jeddah", community: "data-science", bio: isRtl ? "مهندسة نظم وأمن سيبراني." : "Systems and cybersecurity engineer.", availability: "active", avatar_url: null, is_public: true, created_at: new Date().toISOString() },
          { id: "d880a631-060f-44ad-8f31-dd813cb73f9c", full_name: isRtl ? "د. منى عبدالله" : "Dr. Mona Abdullah", email: "mona.abdullah@example.spc.sd", title: isRtl ? "طبيبة أطفال — استشارية" : "Consultant Pediatrician", company: isRtl ? "مستشفى الملك فهد" : "King Fahd Hospital", location: isRtl ? "الخرطوم" : "Khartoum", community: "healthcare", bio: isRtl ? "استشارية طب الأطفال وحديثي الولادة." : "Consultant pediatrician and neonatal specialist.", availability: "available", avatar_url: null, is_public: true, created_at: new Date().toISOString() }
        ]
        const matched = allMock.find(m => m.id === id)
        if (matched) {
          setMember(matched)
          setEvents([])
        } else {
          setNotFound(true)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  }

  if (notFound || isPrivate) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="container mx-auto px-4 py-20 md:px-6 text-center">
        <UsersIcon className="h-12 w-12 text-slate-300 dark:text-slate-650 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {isPrivate ? t("members.private_profile") : t("member.not_found")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {isPrivate ? "" : t("member.not_found_sub")}
        </p>
        <Link href="/members" className="mt-6 inline-block">
          <Button variant="outline" className="gap-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            <Arrow className="h-4 w-4" />
            {t("member.back_to_members")}
          </Button>
        </Link>
      </div>
    )
  }

  if (!member) return null

  const initials = (member.full_name || "—").trim().split(/\s+/).map(s => s[0]).slice(0, 2).join("").toUpperCase() || "?"
  const availability = member.availability || "active"
  const availStyle = AVAILABILITY_STYLES[availability] ?? AVAILABILITY_STYLES.active
  const communityObj = COMMUNITIES.find(c => c.slug === member.community)
  const communityName = communityObj ? (isRtl ? communityObj.nameAr : communityObj.nameEn) : null
  const joinedYear = member.created_at ? new Date(member.created_at).getFullYear() : null

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero band */}
      <section className="relative overflow-hidden bg-slate-950 py-16 md:py-20 border-b border-slate-900">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/15 blur-[100px]" />
        </div>

        <div className="container relative mx-auto px-4 md:px-6 max-w-4xl">
          <Link href="/members" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-6 transition-colors">
            <Arrow className="h-4 w-4" />
            {t("member.back_to_members")}
          </Link>

          <div className="flex flex-col md:flex-row gap-6 md:items-end">
            <div className={cn("h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl flex items-center justify-center font-bold text-white text-3xl shrink-0", member.avatar_url ? "" : "bg-gradient-to-br from-slate-700 to-slate-900")}>
              {member.avatar_url
                ? <img src={member.avatar_url} alt={member.full_name || ""} className="h-full w-full object-cover" />
                : initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset", availStyle)}>
                  {t(`members.availability.${availability}`)}
                </span>
                {communityName && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                    {communityName}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white truncate">{member.full_name || "—"}</h1>
              {member.title && (
                <p className="mt-2 text-lg text-slate-300 truncate">
                  {member.title}{member.company ? ` · ${member.company}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container mx-auto px-4 py-10 md:px-6 max-w-4xl space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar facts */}
          <aside className="md:col-span-1 space-y-3">
            <FactRow icon={<MapPin className="h-4 w-4" />} label={t("members.fields.location")} value={member.location || "—"} />
            <FactRow icon={<Briefcase className="h-4 w-4" />} label={t("members.fields.company")} value={member.company || "—"} />
            <FactRow icon={<UsersIcon className="h-4 w-4" />} label={t("members.fields.community")} value={communityName || "—"} />
            {joinedYear && <FactRow icon={<Calendar className="h-4 w-4" />} label={t("members.fields.joined")} value={String(joinedYear)} />}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="block rounded-xl border border-emerald-250 dark:border-emerald-850 bg-emerald-50 dark:bg-emerald-950/30 p-4 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-350">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
              </a>
            )}
          </aside>

          {/* About */}
          <section className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t("members.fields.bio")}</h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {member.bio || "—"}
            </p>
          </section>
        </div>

        {/* ── DYNAMIC ACTIVITY & MESSAGING SECTIONS ── */}
        <div className="grid md:grid-cols-2 gap-6 pb-16">

          {/* Registered Events */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("member.events_attended")}</h2>
            </div>

            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-500">
                <Calendar className="h-8 w-8 text-slate-350 dark:text-slate-650 mb-2 animate-pulse" />
                <p className="text-sm">{t("member.no_events")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((reg) => {
                  const ev = reg.events
                  if (!ev) return null
                  const d = new Date(ev.start_time)
                  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  return (
                    <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-colors">
                      <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-350 leading-none">
                          {d.toLocaleDateString("en-US", { day: "numeric" })}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-none">
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{ev.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{ev.category} · {date}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[350px]">
            <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("member.direct_message")}</h2>
            </div>

            {/* Case A: Not logged in */}
            {!currentUserId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md mb-3">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{t("member.chat_title")}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">{t("member.chat_sub")}</p>
                <Link href={`/login?redirect=/members/${id}`}>
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full">
                    {t("member.chat_cta")}
                  </Button>
                </Link>
              </div>
            ) : currentUserId === id ? (
              /* Case B: Own profile */
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-4">
                <UsersIcon className="h-10 w-10 text-slate-350 dark:text-slate-650 mb-2" />
                <p className="text-sm">
                  {isRtl ? "هذه هي صفحتك الشخصية العامة. لا يمكنك مراسلة نفسك." : "This is your public profile. You cannot message yourself."}
                </p>
              </div>
            ) : currentUserId === "mock-admin-id" ? (
              /* Case C: Mock admin warning */
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-4">
                <Sparkles className="h-8 w-8 text-amber-500 mb-2 animate-bounce" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {isRtl ? "وضع المعاينة التجريبي" : "Demo Preview Mode"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {isRtl ? "مراسلة الأعضاء تتطلب تسجيل الدخول بحساب حقيقي." : "Messaging members requires logging in with a real account."}
                </p>
              </div>
            ) : (
              /* Case D: Real Messaging Interface */
              <div className="flex-1 flex flex-col min-h-0">
                {/* Message Logs */}
                <div className="flex-1 overflow-y-auto max-h-[220px] min-h-[160px] space-y-3 pr-1 py-1">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-slate-400 dark:text-slate-500 text-xs py-10">
                      {isRtl ? "لا توجد رسائل بعد. ابدأ المحادثة الآن!" : "No messages yet. Say hello!"}
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUserId
                      return (
                        <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "px-3.5 py-2 rounded-2xl text-xs max-w-[85%] leading-relaxed break-words shadow-sm",
                            isMe 
                              ? "bg-emerald-600 text-white rounded-br-sm" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                          )}>
                            {msg.content}
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={sendMessage} className="mt-4 flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <input
                    type="text"
                    required
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t("member.chat_placeholder")}
                    className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <Button type="submit" disabled={isSending || !chatInput.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}

function FactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        {label}
      </div>
      <p className="mt-1.5 text-sm text-slate-900 dark:text-slate-100 font-medium">{value}</p>
    </div>
  )
}
