"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Briefcase, MapPin, Users as UsersIcon, Mail, Loader2, Calendar, MessageSquare, Sparkles } from "lucide-react"
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
        console.warn("Member profile: supabase error", e)
        setNotFound(true)
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
        <UsersIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
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
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 leading-none">
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

          {/* Chat Panel placeholder */}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden min-h-[300px]">
            {/* Frosted overlay */}
            <div className="absolute inset-0 z-10 backdrop-blur-[2.5px] bg-white/70 dark:bg-slate-900/75 flex flex-col items-center justify-center text-center p-8 rounded-2xl">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4">
                <Sparkles className="h-7 w-7 text-white animate-pulse" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {t("member.coming_soon")}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t("member.chat_title")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">{t("member.chat_sub")}</p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-350">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                {t("member.chat_cta")}
              </div>
            </div>

            {/* Background preview (blurred behind overlay) */}
            <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("member.direct_message")}</h2>
            </div>

            <div className="space-y-3">
              {["Hello!", "Nice to connect!", "Let's collaborate"].map((msg, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <div className={`px-4 py-2 rounded-2xl text-sm max-w-[75%] ${
                    i % 2 === 0
                      ? "bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-tl-sm"
                      : "bg-emerald-600 text-white rounded-tr-sm"
                  }`}>
                    {msg}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                disabled
                placeholder={t("member.chat_placeholder")}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-400 cursor-not-allowed"
              />
              <button disabled className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed">
                {t("member.send")}
              </button>
            </div>
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
