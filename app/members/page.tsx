"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Search, Filter, MapPin, Briefcase, Users as UsersIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import { COMMUNITIES } from "@/lib/communities"
import { cn } from "@/lib/utils"

interface Member {
  id: string
  full_name: string | null
  title: string | null
  company: string | null
  bio: string | null
  location: string | null
  community: string | null
  availability: string | null
  avatar_url: string | null
}

const AVAILABILITY_STYLES: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  busy:      "bg-amber-50  text-amber-700  ring-amber-200",
  inactive:  "bg-slate-100 text-slate-500  ring-slate-200",
}

export default function MembersDirectoryPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [community, setCommunity] = useState<string>("all")

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, title, company, bio, location, community, availability, avatar_url")
          .eq("is_public", true)
          .order("full_name", { ascending: true })

        if (error) throw error
        setMembers(data || [])
      } catch (e) {
        console.warn("Members directory: supabase error", e)
        setMembers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  const communityNameMap = useMemo(() => {
    const m = new Map<string, { ar: string; en: string }>()
    COMMUNITIES.forEach(c => m.set(c.slug, { ar: c.nameAr, en: c.nameEn }))
    return m
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter(m => {
      if (community !== "all" && m.community !== community) return false
      if (!q) return true
      return [m.full_name, m.title, m.company, m.location].some(v => v?.toLowerCase().includes(q))
    })
  }, [members, search, community])

  const clearFilters = () => { setSearch(""); setCommunity("all") }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:px-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">{t("members.title")}</h1>
        <p className="text-base md:text-lg text-slate-600">{t("members.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3 mb-10">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("members.search_placeholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="relative md:w-72">
          <Filter className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={community}
            onChange={e => setCommunity(e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-xl border border-slate-200 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t("members.all_communities")}</option>
            {COMMUNITIES.map(c => (
              <option key={c.slug} value={c.slug}>{isRtl ? c.nameAr : c.nameEn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <MembersGridSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <UsersIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">
            {members.length === 0 ? t("members.empty_state") : t("members.no_results")}
          </h3>
          {members.length > 0 && (
            <button onClick={clearFilters} className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800">
              {t("members.clear_filters")}
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              communityName={m.community ? (isRtl ? communityNameMap.get(m.community)?.ar : communityNameMap.get(m.community)?.en) ?? "" : ""}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MemberCard({ member, communityName, t }: { member: Member; communityName: string; t: (k: string) => string }) {
  const initials = (member.full_name || "—").trim().split(/\s+/).map(s => s[0]).slice(0, 2).join("").toUpperCase() || "?"
  const availability = member.availability || "active"
  const availStyle = AVAILABILITY_STYLES[availability] ?? AVAILABILITY_STYLES.active

  return (
    <Link
      href={`/members/${member.id}`}
      className="group flex flex-col rounded-2xl bg-white border border-slate-200 p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn("h-14 w-14 rounded-full overflow-hidden ring-2 ring-white shadow-sm flex items-center justify-center font-bold text-white text-lg", member.avatar_url ? "" : "bg-gradient-to-br from-slate-700 to-slate-900")}>
          {member.avatar_url
            ? <img src={member.avatar_url} alt={member.full_name || ""} className="h-full w-full object-cover" />
            : initials}
        </div>
        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset", availStyle)}>
          {t(`members.availability.${availability}`)}
        </span>
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1">
        {member.full_name || "—"}
      </h3>
      {member.title && (
        <p className="mt-1 text-sm text-slate-600 line-clamp-1 inline-flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-slate-400" />{member.title}
        </p>
      )}
      {member.location && (
        <p className="mt-1 text-xs text-slate-500 inline-flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-slate-400" />{member.location}
        </p>
      )}
      {communityName && (
        <span className="mt-4 inline-block text-[11px] font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700 self-start">
          {communityName}
        </span>
      )}
    </Link>
  )
}

function MembersGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-full skeleton" />
            <div className="h-5 w-16 rounded-full skeleton" />
          </div>
          <div className="mt-4 h-4 w-32 skeleton rounded" />
          <div className="mt-2 h-3 w-24 skeleton rounded" />
          <div className="mt-1 h-3 w-20 skeleton rounded" />
        </div>
      ))}
    </div>
  )
}
