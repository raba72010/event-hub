"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { COMMUNITIES } from "@/lib/communities"
import { ArrowLeft, ArrowRight, MessageSquare, Loader2, MessageCircle, Heart, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SectionPage() {
  const { slug, sectionId } = useParams<{ slug: string, sectionId: string }>()
  const router = useRouter()
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [section, setSection] = useState<any>(null)
  const [discussions, setDiscussions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sessionUser, setSessionUser] = useState<any>(null)

  const communityObj = COMMUNITIES.find(c => c.slug === slug)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setSessionUser(user)

      const { data: sectionData } = await supabase
        .from("community_discussion_sections")
        .select("*")
        .eq("id", sectionId)
        .single()
      
      if (sectionData) setSection(sectionData)

      const { data: discData } = await supabase
        .from("community_discussions")
        .select(`
          *,
          profiles(full_name, avatar_url, title),
          likes:community_discussion_likes(count),
          comments:community_discussion_comments(count)
        `)
        .eq("section_id", sectionId)
        .order("created_at", { ascending: false })

      if (discData) setDiscussions(discData)
      setIsLoading(false)
    }

    fetchData()
  }, [sectionId])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
  }

  if (!section) return <div className="p-20 text-center text-slate-500">Section not found</div>

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <button
            onClick={() => router.push(`/communities/${slug}`)}
            className="inline-flex items-center text-slate-400 hover:text-white mb-6 text-sm gap-2 transition-colors"
          >
            {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isRtl ? "العودة للمجتمع" : "Back to Community"}
          </button>
          <div className="max-w-3xl space-y-3">
             <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs text-emerald-400 border border-slate-700 font-semibold tracking-wide">
               <MessageSquare className="h-3.5 w-3.5" />
               {isRtl ? "قسم النقاشات" : "Discussion Section"}
             </div>
             <h1 className="text-3xl font-bold text-white tracking-tight">{section.name}</h1>
             <p className="text-slate-400">{section.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{isRtl ? "المواضيع" : "Topics"}</h2>
          <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold gap-2">
            <Plus className="h-4 w-4" />
            {isRtl ? "موضوع جديد" : "New Topic"}
          </Button>
        </div>

        <div className="space-y-4">
          {discussions.length === 0 ? (
            <div className="py-20 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              {isRtl ? "لا توجد مواضيع في هذا القسم." : "No topics in this section yet."}
            </div>
          ) : discussions.map((disc) => (
            <Link href={`/communities/${slug}/discussions/${disc.id}`} key={disc.id} className="block">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{disc.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{disc.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={disc.profiles?.avatar_url || ""} />
                      <AvatarFallback className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600">{disc.profiles?.full_name?.charAt(0) || disc.mock_author_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{disc.profiles?.full_name || disc.mock_author_name}</span>
                    <span className="hidden sm:inline">• {new Date(disc.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {disc.likes?.[0]?.count || 0}</span>
                    <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {disc.comments?.[0]?.count || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
