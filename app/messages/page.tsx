"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/i18n-context"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Search, ChevronRight } from "lucide-react"
import Link from "next/link"

type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  title: string | null
  community: string | null
}

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

type Conversation = {
  otherUser: Profile
  latestMessage: Message
}

export default function MessagesCenter() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const isRtl = locale === "ar"

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id)
      } else if (typeof window !== "undefined" && localStorage.getItem("mock_admin_session") === "true") {
        setCurrentUserId("mock-admin-id")
      } else {
        router.push("/login")
      }
    })
  }, [router])

  useEffect(() => {
    if (!currentUserId) return

    async function fetchInbox() {
      try {
        // 1. Fetch all messages for the current user
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .order("created_at", { ascending: false })

        if (messagesError) throw messagesError
        
        if (!messagesData || messagesData.length === 0) {
          setConversations([])
          setLoading(false)
          return
        }

        // 2. Group messages by the "other" user to find unique conversations
        const uniqueConversationsMap = new Map<string, Message>()
        messagesData.forEach((msg: Message) => {
          const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id
          if (!uniqueConversationsMap.has(otherId)) {
            uniqueConversationsMap.set(otherId, msg)
          }
        })

        // 3. Fetch profiles for these unique users
        const otherUserIds = Array.from(uniqueConversationsMap.keys())
        
        if (otherUserIds.length === 0) {
          setConversations([])
          setLoading(false)
          return
        }

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, title, community")
          .in("id", otherUserIds)

        if (profilesError) throw profilesError

        // 4. Combine data
        const convos: Conversation[] = []
        profilesData?.forEach((profile: Profile) => {
          const latestMsg = uniqueConversationsMap.get(profile.id)
          if (latestMsg) {
            convos.push({
              otherUser: profile,
              latestMessage: latestMsg
            })
          }
        })

        // Sort by latest message date descending
        convos.sort((a, b) => new Date(b.latestMessage.created_at).getTime() - new Date(a.latestMessage.created_at).getTime())

        setConversations(convos)
      } catch (e) {
        console.error("Error fetching inbox:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchInbox()
  }, [currentUserId])

  const filteredConversations = conversations.filter(c => 
    c.otherUser.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.otherUser.title && c.otherUser.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!currentUserId) return null // Wait for auth check

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir={isRtl ? "rtl" : "ltr"}>
      {/* HEADER OVERLAY */}
      <div className="bg-emerald-600 dark:bg-emerald-900 pb-24 pt-12 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="container relative z-10 mx-auto px-4">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('messages_center.title')}</h1>
          <p className="text-emerald-100 max-w-2xl mx-auto text-lg">
            {t('messages_center.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12 pb-24">
        <Card className="max-w-4xl mx-auto shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
          
          {/* TOOLBAR */}
          <div className="border-b border-slate-100 dark:border-slate-800 p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative max-w-md">
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400`} />
              <Input 
                type="text"
                placeholder={t('messages_center.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRtl ? 'pr-10' : 'pl-10'} bg-white dark:bg-slate-950`}
              />
            </div>
          </div>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                Loading messages...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-16 text-center">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('messages_center.empty')}</h3>
                <p className="text-slate-500 max-w-md mx-auto">{t('messages_center.empty_sub')}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No conversations match your search.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredConversations.map((convo) => {
                  const isYou = convo.latestMessage.sender_id === currentUserId
                  const date = new Date(convo.latestMessage.created_at)
                  const timeString = date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })
                  
                  // Simple relative date formatting
                  const today = new Date()
                  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
                  const dateString = isToday ? timeString : date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })

                  return (
                    <Link key={convo.otherUser.id} href={`/members/${convo.otherUser.id}`}>
                      <div className="p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center gap-4 group cursor-pointer">
                        
                        <Avatar className="h-14 w-14 border-2 border-transparent group-hover:border-emerald-500 transition-colors">
                          <AvatarImage src={convo.otherUser.avatar_url || ""} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-lg">
                            {convo.otherUser.full_name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate pr-4">
                              {convo.otherUser.full_name}
                            </h4>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {dateString}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isYou && (
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {t('messages_center.you')}
                              </span>
                            )}
                            <p className={`text-sm truncate ${isYou ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                              {convo.latestMessage.content}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className={`h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors ${isRtl ? 'rotate-180' : ''}`} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
