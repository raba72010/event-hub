"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Search, Filter, MapPin, Briefcase, Users as UsersIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import { COMMUNITIES } from "@/lib/communities"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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

const PAGE_SIZE = 12

export default function MembersDirectoryPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAppending, setIsAppending] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [community, setCommunity] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Debounce search term change to prevent Supabase query spam
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    let active = true

    async function fetchMembers() {
      if (page === 1) {
        setIsLoading(true)
      } else {
        setIsAppending(true)
      }

      try {
        let query = supabase
          .from("profiles")
          .select("id, full_name, title, company, bio, location, community, availability, avatar_url")
          .eq("is_public", true)
          .order("full_name", { ascending: true })

        // Apply community filter directly in database query
        if (community !== "all") {
          query = query.eq("community", community)
        }

        // Apply text search directly in database query if provided
        if (debouncedSearch.trim()) {
          query = query.ilike("full_name", `%${debouncedSearch}%`)
        }

        // Pagination limit and offset range
        const from = (page - 1) * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        query = query.range(from, to)

        const { data, error } = await query
        if (error) throw error

        if (active) {
          if (page === 1) {
            setMembers(data || [])
          } else {
            setMembers(prev => [...prev, ...(data || [])])
          }
          setHasMore(data ? data.length === PAGE_SIZE : false)
        }
      } catch (e) {
        console.warn("Members directory: Supabase query failed, loading localized fallback mock data", e)
        if (active) {
          const allMock = [
            {
              id: "cfc233e2-e1bc-48e7-a5b0-bf4d8694b526",
              full_name: locale === "ar" ? "م. محمد عكود" : "Eng. Mohamed Akoud",
              title: locale === "ar" ? "مدير منتجات تقنية" : "Tech Product Manager",
              company: "Verizon",
              bio: "Specialized in AI and Product Management.",
              location: locale === "ar" ? "نيويورك، أمريكا" : "New York, USA",
              community: "ai",
              availability: "active",
              avatar_url: null
            },
            {
              id: "8784d544-0f1a-40ad-b63f-e1ebffdb0d4f",
              full_name: locale === "ar" ? "د. أحمد كمال" : "Dr. Ahmed Kamal",
              title: locale === "ar" ? "مدرب مهني | استشارات موارد بشرية" : "Career Coach | HR Consultant",
              company: locale === "ar" ? "استشارات مستقلة" : "Independent Consulting",
              bio: "Over 12 years of experience in administrative coaching.",
              location: locale === "ar" ? "الرياض، السعودية" : "Riyadh, KSA",
              community: "strategic-planning",
              availability: "active",
              avatar_url: null
            },
            {
              id: "680b3240-16a0-419b-b769-ac18ba1990ea",
              full_name: locale === "ar" ? "م. سارة إدريس" : "Eng. Sara Idris",
              title: locale === "ar" ? "مهندسة نظم معلومات" : "Information Systems Engineer",
              company: "Aramco Digital",
              bio: "Designing secure digital infrastructures.",
              location: locale === "ar" ? "جدة، السعودية" : "Jeddah, KSA",
              community: "data-science",
              availability: "active",
              avatar_url: null
            },
            {
              id: "d880a631-060f-44ad-8f31-dd813cb73f9c",
              full_name: locale === "ar" ? "د. منى عبدالله" : "Dr. Mona Abdullah",
              title: locale === "ar" ? "طبيبة أطفال — استشارية" : "Consultant Pediatrician",
              company: locale === "ar" ? "مستشفى الملك فهد" : "King Fahd Hospital",
              bio: "Passionate about improving neonatal care.",
              location: locale === "ar" ? "الخرطوم، السودان" : "Khartoum, Sudan",
              community: "healthcare",
              availability: "available",
              avatar_url: null
            }
          ]

          // In-memory filters for local mock mode
          const q = debouncedSearch.trim().toLowerCase()
          const filteredMock = allMock.filter(m => {
            if (community !== "all" && m.community !== community) return false
            if (!q) return true
            return [m.full_name, m.title, m.company, m.location].some(v => v?.toLowerCase().includes(q))
          })

          setMembers(filteredMock)
          setHasMore(false)
        }
      } finally {
        if (active) {
          setIsLoading(false)
          setIsAppending(false)
        }
      }
    }

    fetchMembers()

    return () => {
      active = false
    }
  }, [page, community, debouncedSearch, locale])

  const communityNameMap = useMemo(() => {
    const m = new Map<string, { ar: string; en: string }>()
    COMMUNITIES.forEach(c => m.set(c.slug, { ar: c.nameAr, en: c.nameEn }))
    return m
  }, [])

  const handleCommunityChange = (val: string) => {
    setCommunity(val)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch("")
    setCommunity("all")
    setPage(1)
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:px-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">{t("members.title")}</h1>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">{t("members.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3 mb-10">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={t("members.search_placeholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full ps-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ paddingInlineStart: "2.5rem" }}
          />
        </div>
        <div className="relative md:w-72">
          <Filter className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <select
            value={community}
            onChange={e => handleCommunityChange(e.target.value)}
            className="w-full ps-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ paddingInlineStart: "2.5rem" }}
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
      ) : members.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <UsersIcon className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("members.no_results")}
          </h3>
          <button onClick={clearFilters} className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300">
            {t("members.clear_filters")}
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map(m => (
              <MemberCard
                key={m.id}
                member={m}
                communityName={m.community ? (isRtl ? communityNameMap.get(m.community)?.ar : communityNameMap.get(m.community)?.en) ?? "" : ""}
                t={t}
              />
            ))}
          </div>

          {/* Load More Trigger Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                onClick={() => setPage(prev => prev + 1)}
                disabled={isAppending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md"
              >
                {isAppending ? (isRtl ? "جاري التحميل..." : "Loading...") : (isRtl ? "تحميل المزيد" : "Load More")}
              </Button>
            </div>
          )}
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
      className="group flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn("h-14 w-14 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-sm flex items-center justify-center font-bold text-white text-lg", member.avatar_url ? "" : "bg-gradient-to-br from-slate-700 to-slate-900")}>
          {member.avatar_url
            ? <img src={member.avatar_url} alt={member.full_name || ""} className="h-full w-full object-cover" />
            : initials}
        </div>
        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset", availStyle)}>
          {t(`members.availability.${availability}`)}
        </span>
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
        {member.full_name || "—"}
      </h3>
      {member.title && (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-1 inline-flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />{member.title}
        </p>
      )}
      {member.location && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-500" />{member.location}
        </p>
      )}
      {communityName && (
        <span className="mt-4 inline-block text-[11px] font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start">
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
        <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="mt-4 h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="mt-2 h-3.5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="mt-1 h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      ))}
    </div>
  )
}
