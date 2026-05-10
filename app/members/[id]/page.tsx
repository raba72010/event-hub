"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Briefcase, MapPin, Users as UsersIcon, Mail, Loader2 } from "lucide-react"
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
  active:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  busy:      "bg-amber-50  text-amber-700  ring-amber-200",
  inactive:  "bg-slate-100 text-slate-500  ring-slate-200",
}

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"
  const Arrow = isRtl ? ArrowRight : ArrowLeft

  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, title, company, bio, location, community, availability, avatar_url, is_public, created_at")
          .eq("id", id)
          .maybeSingle()

        if (error) throw error
        if (!data) { setNotFound(true); return }
        if (data.is_public === false) { setIsPrivate(true); return }
        setMember(data)
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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (notFound || isPrivate) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="container mx-auto px-4 py-20 md:px-6 text-center">
        <UsersIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">
          {isPrivate ? t("members.private_profile") : "—"}
        </h1>
        <Link href="/members" className="mt-6 inline-block">
          <Button variant="outline" className="gap-2">
            <Arrow className="h-4 w-4" />
            {t("members.back_to_directory")}
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
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-slate-50">
      {/* Hero band */}
      <section className="relative overflow-hidden bg-slate-950 py-16 md:py-20">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/15 blur-[120px] animate-mesh-1" />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/15 blur-[100px] animate-mesh-2" />
        </div>

        <div className="container relative mx-auto px-4 md:px-6 max-w-4xl">
          <Link href="/members" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-6 transition-colors">
            <Arrow className="h-4 w-4" />
            {t("members.back_to_directory")}
          </Link>

          <div className="flex flex-col md:flex-row gap-6 md:items-end">
            <div className={cn("h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl flex items-center justify-center font-bold text-white text-3xl", member.avatar_url ? "" : "bg-gradient-to-br from-slate-700 to-slate-900")}>
              {member.avatar_url
                ? <img src={member.avatar_url} alt={member.full_name || ""} className="h-full w-full object-cover" />
                : initials}
            </div>
            <div className="flex-1">
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
              <h1 className="text-3xl md:text-4xl font-bold text-white">{member.full_name || "—"}</h1>
              {member.title && (
                <p className="mt-2 text-lg text-slate-300">
                  {member.title}{member.company ? ` · ${member.company}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container mx-auto px-4 py-10 md:px-6 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar facts */}
          <aside className="md:col-span-1 space-y-3">
            <FactRow icon={<MapPin className="h-4 w-4" />} label={t("members.fields.location")} value={member.location || "—"} />
            <FactRow icon={<Briefcase className="h-4 w-4" />} label={t("members.fields.company")} value={member.company || "—"} />
            <FactRow icon={<UsersIcon className="h-4 w-4" />} label={t("members.fields.community")} value={communityName || "—"} />
            {joinedYear && <FactRow icon={<UsersIcon className="h-4 w-4" />} label={t("members.fields.joined")} value={String(joinedYear)} />}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="block rounded-xl border border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </div>
              </a>
            )}
          </aside>

          {/* About */}
          <section className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{t("members.fields.bio")}</h2>
            <p className="text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
              {member.bio || "—"}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

function FactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <p className="mt-1.5 text-sm text-slate-900 font-medium">{value}</p>
    </div>
  )
}
