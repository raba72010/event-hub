"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { COMMUNITIES } from "@/lib/communities"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Sparkles,
  Loader2,
  MapPin,
  Briefcase
} from "lucide-react"

export default function CommunityDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [members, setMembers] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const communityObj = COMMUNITIES.find(c => c.slug === slug)
  const isValid = !!communityObj

  useEffect(() => {
    if (!isValid) return

    async function fetchCommunityData() {
      setIsLoading(true)
      try {
        // 1. Fetch profiles in this community
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, title, company, location, avatar_url")
          .eq("community", slug)
          .eq("is_public", true)

        if (profileData) setMembers(profileData)

        // 2. Fetch events matching this community
        const communityName = communityObj ? (isRtl ? communityObj.nameAr : communityObj.nameEn).toLowerCase() : ""
        const { data: eventData } = await supabase
          .from("events")
          .select("*")

        if (eventData) {
          // Filter events whose category matches the slug or localized name
          const matched = eventData.filter(e => {
            const cat = (e.category || "").toLowerCase()
            return cat.includes(slug) || cat.includes(communityName) || slug.replace("-", " ").includes(cat)
          })
          setEvents(matched)
        }
      } catch (err) {
        console.error("Error fetching community data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommunityData()
  }, [slug, isValid, locale])

  if (!isValid) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {t("community_detail.not_found")}
        </h1>
        <Button onClick={() => router.push("/communities")} className="bg-emerald-600 hover:bg-emerald-700">
          {t("community_detail.back_to_list_btn")}
        </Button>
      </div>
    )
  }

  const name = isRtl ? communityObj.nameAr : communityObj.nameEn
  const description = t("communities.desc_template").replace("{name}", name)
  const Icon = communityObj.icon

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* ── HERO SECTION ── */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white py-16 relative overflow-hidden border-b border-slate-800 dark:border-slate-900">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
        </div>

        <div className="container relative mx-auto px-4 md:px-6 z-10">
          <button
            onClick={() => router.push("/communities")}
            className="inline-flex items-center text-slate-400 hover:text-white mb-6 text-sm gap-2 transition-colors"
          >
            {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t("community_detail.back_to_list")}
          </button>

          <div className="max-w-3xl space-y-4">
             <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs text-emerald-400 border border-slate-700 font-semibold tracking-wide">
               <Icon className="h-3.5 w-3.5" />
               {t("community_detail.badge")}
             </div>
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{name}</h1>
             <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">{description}</p>

             <div className="pt-4 flex flex-wrap gap-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6 font-semibold shadow-lg">
                  {t("community_detail.join")}
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-10 px-6 font-semibold">
                  {t("community_detail.schedule")}
                </Button>
             </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT GRID ── */}
      <div className="container mx-auto px-4 py-12 md:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── MAIN COLUMN (Events & Discussions) ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Events Section */}
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                   <Calendar className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
                   <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("community_detail.latest_events")}</h2>
                </div>
                {events.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                     {t("community_detail.no_events")}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => {
                      const dateObj = new Date(event.start_time)
                      const date = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      return (
                        <div key={event.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 flex flex-col md:flex-row gap-4 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all">
                          {event.image && (
                            <img src={event.image} alt={event.title} className="w-full md:w-32 h-20 object-cover rounded-lg shrink-0" />
                          )}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{event.title}</h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {date}</span>
                              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location || "Virtual"}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Discussions Section */}
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                   <MessageSquare className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
                   <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("community_detail.discussion_board")}</h2>
                </div>
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                   <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-2">
                     <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                     {locale === "ar" ? "ميزة مستقبلية" : "Future Feature"}
                   </span>
                   {t("community_detail.no_discussions")}
                </div>
              </section>

            </div>

            {/* ── SIDEBAR (Stats & Members list) ── */}
            <div className="space-y-6">

               {/* Community Stats */}
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
                    {t("community_detail.stats_title")}
                  </h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                         <Users className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                         <span className="text-sm font-medium">{t("community_detail.stats_members")}</span>
                       </div>
                       <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-xs">
                         {members.length}
                       </span>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                         <BookOpen className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                         <span className="text-sm font-medium">{t("community_detail.stats_articles")}</span>
                       </div>
                       <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-xs">
                         {members.length > 0 ? members.length * 2 : 0}
                       </span>
                     </div>
                  </div>
               </div>

               {/* Members Directory in this community */}
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
                    {t("community_detail.members_section")}
                  </h3>

                  {members.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                      {t("community_detail.no_members")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member) => {
                        const initials = member.full_name
                          ? member.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                          : "?"

                        const colours = [
                          "bg-emerald-600", "bg-blue-600", "bg-indigo-600",
                          "bg-violet-600", "bg-rose-600", "bg-amber-600", "bg-cyan-600",
                        ]
                        const colourIndex = (member.full_name?.charCodeAt(0) ?? 0) % colours.length
                        const avatarColour = colours[colourIndex]

                        return (
                          <Link href={`/members/${member.id}`} key={member.id} className="block">
                            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-3 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all group">
                              <div className={`h-9 w-9 rounded-full ${avatarColour} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                                {member.avatar_url ? (
                                  <img src={member.avatar_url} alt={member.full_name} className="h-full w-full object-cover rounded-full" />
                                ) : (
                                  initials
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                  {member.full_name}
                                </h5>
                                {(member.title || member.company) && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                    <Briefcase className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{[member.title, member.company].filter(Boolean).join(" · ")}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
               </div>

            </div>

          </div>
        )}
      </div>
    </div>
  )
}
