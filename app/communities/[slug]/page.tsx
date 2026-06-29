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
  Loader2,
  MapPin,
  Briefcase,
  Lock,
  Activity,
  Heart,
  MessageCircle,
  Share
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CommunityDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [members, setMembers] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [discussions, setDiscussions] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [userActivities, setUserActivities] = useState<Set<string>>(new Set())
  const [userRole, setUserRole] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("events") // 'events' | 'discussions' | 'activity'
  const [isMember, setIsMember] = useState(false)
  const [sessionUser, setSessionUser] = useState<any>(null)

  const communityObj = COMMUNITIES.find(c => c.slug === slug)
  const isValid = !!communityObj

  useEffect(() => {
    if (!isValid) return

    async function fetchCommunityData() {
      setIsLoading(true)
      try {
        // 0. Check current user profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setSessionUser(user)
          const { data: profile } = await supabase.from("profiles").select("community").eq("id", user.id).single()
          if (profile && profile.community && profile.community.split(",").includes(slug)) {
            setIsMember(true)
          }
        }

        // 1. Fetch profiles in this community
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, title, company, location, avatar_url")
          .ilike("community", `%${slug}%`)
          .eq("is_public", true)

        if (profileData) setMembers(profileData)

        // 2. Fetch events matching this community
        const communityName = communityObj ? (isRtl ? communityObj.nameAr : communityObj.nameEn).toLowerCase() : ""
        const { data: eventData } = await supabase.from("events").select("*")

        if (eventData) {
          const matched = eventData.filter(e => {
            const cat = (e.category || "").toLowerCase()
            return cat.includes(slug) || cat.includes(communityName) || slug.replace("-", " ").includes(cat)
          })
          setEvents(matched)
        }

        // 3. Fetch activities (projects)
        const { data: activityData } = await supabase
          .from("community_activities")
          .select(`
            id, title, description, date_string, location, created_at,
            participants:community_activity_participants(count)
          `)
          .eq("community_slug", slug)
          .order("created_at", { ascending: false })
        if (activityData) setActivities(activityData)

        // 3b. Fetch user's participation
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
          if (profile) setUserRole(profile.role || "")
          
          const { data: parts } = await supabase
            .from("community_activity_participants")
            .select("activity_id")
            .eq("user_id", user.id)
          if (parts) setUserActivities(new Set(parts.map(p => p.activity_id)))
        }

        // 4. Fetch sections instead of single discussions list
        const { data: sectionData } = await supabase
          .from("community_discussion_sections")
          .select("*, discussions:community_discussions(count)")
          .eq("community_slug", slug)
          .order("created_at", { ascending: true })
          
        if (sectionData) setSections(sectionData)

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

  const [isJoining, setIsJoining] = useState(false)

  const handleJoin = async () => {
    if (!sessionUser) {
      router.push("/login")
      return
    }
    setIsJoining(true)
    try {
      const { data: profile } = await supabase.from("profiles").select("community").eq("id", sessionUser.id).single()
      
      let newCommunity = slug
      if (profile && profile.community) {
        const list = profile.community.split(",")
        if (!list.includes(slug)) {
          list.push(slug)
        }
        newCommunity = list.join(",")
      }

      const { error } = await supabase
        .from("profiles")
        .update({ community: newCommunity })
        .eq("id", sessionUser.id)
      
      if (error) throw error
      
      setIsMember(true)
      window.location.reload()
    } catch (err) {
      console.error("Failed to join community", err)
      setIsJoining(false)
    }
  }

  const handleParticipate = async (activityId: string) => {
    if (!sessionUser) return router.push("/login")
    if (!isMember) return
    
    const isParticipating = userActivities.has(activityId)
    
    try {
      if (isParticipating) {
        // Leave
        await supabase.from("community_activity_participants").delete().match({ activity_id: activityId, user_id: sessionUser.id })
        const next = new Set(userActivities)
        next.delete(activityId)
        setUserActivities(next)
      } else {
        // Join
        await supabase.from("community_activity_participants").insert({ activity_id: activityId, user_id: sessionUser.id })
        const next = new Set(userActivities)
        next.add(activityId)
        setUserActivities(next)
      }
      
      // Update count locally
      setActivities(activities.map(a => {
        if (a.id === activityId) {
          const currentCount = a.participants?.[0]?.count || 0
          return { ...a, participants: [{ count: isParticipating ? currentCount - 1 : currentCount + 1 }] }
        }
        return a
      }))
    } catch (err) {
      console.error("Error toggling participation", err)
    }
  }

  // Helper to render locked overlay
  const renderLockedOverlay = (title: string, desc: string) => (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-[3px] rounded-2xl">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center max-w-sm mx-4">
        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{desc}</p>
        <Button onClick={handleJoin} disabled={isJoining} className="bg-emerald-600 hover:bg-emerald-700 w-full font-semibold">
          {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRtl ? "الانضمام للمجتمع" : "Join Community")}
        </Button>
      </div>
    </div>
  )

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
                {!isMember ? (
                  <Button onClick={handleJoin} disabled={isJoining} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6 font-semibold shadow-lg">
                    {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : t("community_detail.join")}
                  </Button>
                ) : (
                  <Button variant="outline" className="border-emerald-700 text-emerald-400 hover:bg-emerald-900 hover:text-emerald-300 h-10 px-6 font-semibold pointer-events-none">
                    {isRtl ? "أنت عضو" : "Joined"}
                  </Button>
                )}
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-10 px-6 font-semibold">
                  {t("community_detail.schedule")}
                </Button>
             </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT GRID ── */}
      <div className="container mx-auto px-4 py-8 md:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── MAIN COLUMN (Tabs: Events, Discussions, Activity) ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Tabs Navigation */}
              <div className="flex space-x-6 rtl:space-x-reverse border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                <button 
                  onClick={() => setActiveTab("events")}
                  className={`px-2 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'events' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  {isRtl ? "الفعاليات" : "Events"}
                </button>
                <button 
                  onClick={() => setActiveTab("discussions")}
                  className={`px-2 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'discussions' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-2">
                    {isRtl ? "لوحة النقاشات" : "Discussion Board"}
                    {!isMember && <Lock className="h-3 w-3 text-slate-400" />}
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab("activity")}
                  className={`px-2 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'activity' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-2">
                    {isRtl ? "النشاطات" : "Activity Feed"}
                    {!isMember && <Lock className="h-3 w-3 text-slate-400" />}
                  </div>
                </button>
              </div>

              {/* TAB CONTENT: EVENTS */}
              {activeTab === "events" && (
                <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                     <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
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
              )}

              {/* TAB CONTENT: DISCUSSIONS */}
              {activeTab === "discussions" && (
                <section className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[400px]">
                  {!isMember && renderLockedOverlay(
                    isRtl ? "لوحة النقاشات مغلقة" : "Locked Discussion Board",
                    isRtl ? "انضم إلى هذا المجتمع لتتمكن من قراءة النقاشات وطرح أسئلتك على الأعضاء الآخرين." : "Join this community to read discussions and ask questions to other members."
                  )}
                  
                  <div className={cn("space-y-6", !isMember && "opacity-30 blur-sm pointer-events-none select-none")}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("community_detail.discussion_board")}</h2>
                      </div>
                      
                      {['main_admin', 'super_admin'].includes(userRole) || (userRole === 'community_admin' && isMember) ? (
                        <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 h-9 px-4 text-sm font-semibold">
                          {isRtl ? "إضافة قسم جديد" : "Add Section"}
                        </Button>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      {sections.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                          {isRtl ? "لا توجد أقسام بعد." : "No sections yet."}
                        </div>
                      ) : sections.map((sec) => (
                        <Link href={`/communities/${slug}/sections/${sec.id}`} key={sec.id} className="block">
                          <div className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-emerald-200 dark:hover:border-emerald-900 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">{sec.name}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{sec.description}</p>
                              </div>
                              <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{sec.discussions?.[0]?.count || 0}</span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{isRtl ? "نقاش" : "Topics"}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* TAB CONTENT: ACTIVITY */}
              {activeTab === "activity" && (
                <section className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[400px]">
                  {!isMember && renderLockedOverlay(
                    isRtl ? "سجل النشاطات مغلق" : "Locked Activities",
                    isRtl ? "انضم إلى المجتمع للمشاركة في الفعاليات والأنشطة." : "Join the community to participate in activities and projects."
                  )}

                  <div className={cn("space-y-6", !isMember && "opacity-30 blur-sm pointer-events-none select-none")}>
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isRtl ? "المبادرات والأنشطة" : "Initiatives & Activities"}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {activities.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                          {isRtl ? "لا توجد نشاطات بعد." : "No activities yet."}
                        </div>
                      ) : activities.map((act) => {
                        const count = act.participants?.[0]?.count || 0
                        const isParticipating = userActivities.has(act.id)
                        
                        return (
                          <div key={act.id} className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col h-full hover:border-emerald-200 dark:hover:border-emerald-900 transition-all">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{act.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">{act.description}</p>
                            
                            <div className="space-y-2 mb-4">
                              {act.date_string && <div className="flex items-center gap-2 text-xs text-slate-500"><Calendar className="h-3.5 w-3.5" />{act.date_string}</div>}
                              {act.location && <div className="flex items-center gap-2 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{act.location}</div>}
                              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"><Users className="h-3.5 w-3.5" />{count} {isRtl ? "مشارك" : "participants"}</div>
                            </div>
                            
                            <Button 
                              onClick={() => handleParticipate(act.id)}
                              variant={isParticipating ? "outline" : "default"} 
                              className={cn("w-full font-semibold", isParticipating ? "border-emerald-600 text-emerald-600 dark:text-emerald-400" : "bg-emerald-600 hover:bg-emerald-700")}
                            >
                              {isParticipating ? (isRtl ? "مشارك" : "Participating") : (isRtl ? "شارك الآن" : "Participate")}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>
              )}

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
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                         <MessageSquare className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                         <span className="text-sm font-medium">{isRtl ? "أقسام النقاش" : "Discussion Sections"}</span>
                       </div>
                       <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-xs">
                         {sections.length}
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
