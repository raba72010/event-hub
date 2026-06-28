"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { COMMUNITIES } from "@/lib/communities"
import { ArrowLeft, ArrowRight, Loader2, MessageCircle, Heart, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DiscussionPage() {
  const { slug, id } = useParams<{ slug: string, id: string }>()
  const router = useRouter()
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [discussion, setDiscussion] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [likesCount, setLikesCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [sessionUser, setSessionUser] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setSessionUser(user)

      // Fetch Discussion
      const { data: discData } = await supabase
        .from("community_discussions")
        .select(`
          *,
          profiles(full_name, avatar_url, title),
          section:community_discussion_sections(name)
        `)
        .eq("id", id)
        .single()
      
      if (discData) setDiscussion(discData)

      // Fetch Likes Count & Status
      const { count } = await supabase
        .from("community_discussion_likes")
        .select("*", { count: "exact", head: true })
        .eq("discussion_id", id)
      
      setLikesCount(count || 0)

      if (user) {
        const { data: userLike } = await supabase
          .from("community_discussion_likes")
          .select("user_id")
          .match({ discussion_id: id, user_id: user.id })
          .single()
        if (userLike) setHasLiked(true)
      }

      // Fetch Comments
      const { data: commentData } = await supabase
        .from("community_discussion_comments")
        .select(`
          *,
          profiles(full_name, avatar_url, title)
        `)
        .eq("discussion_id", id)
        .order("created_at", { ascending: true })

      if (commentData) setComments(commentData)
      setIsLoading(false)
    }

    fetchData()
  }, [id])

  const handleLike = async () => {
    if (!sessionUser) return router.push("/login")
    
    try {
      if (hasLiked) {
        setHasLiked(false)
        setLikesCount(prev => prev - 1)
        await supabase.from("community_discussion_likes").delete().match({ discussion_id: id, user_id: sessionUser.id })
      } else {
        setHasLiked(true)
        setLikesCount(prev => prev + 1)
        await supabase.from("community_discussion_likes").insert({ discussion_id: id, user_id: sessionUser.id })
      }
    } catch (err) {
      console.error("Error toggling like", err)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionUser) return router.push("/login")
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("community_discussion_comments").insert({
        discussion_id: id,
        user_id: sessionUser.id,
        content: newComment.trim()
      })

      if (error) throw error

      setNewComment("")
      // Optimistically reload page or refetch comments
      window.location.reload()
    } catch (err) {
      console.error("Error posting comment", err)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
  }

  if (!discussion) return <div className="p-20 text-center text-slate-500">Discussion not found</div>

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <button
            onClick={() => router.push(`/communities/${slug}/sections/${discussion.section_id}`)}
            className="inline-flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium gap-2 transition-colors"
          >
            {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {discussion.section?.name || (isRtl ? "عودة" : "Back")}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl space-y-6">
        
        {/* OP Post */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">{discussion.title}</h1>
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
            <Avatar className="h-12 w-12 border border-slate-200 dark:border-slate-700">
              <AvatarImage src={discussion.profiles?.avatar_url || ""} />
              <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold">{discussion.profiles?.full_name?.charAt(0) || discussion.mock_author_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {discussion.profiles?.full_name || discussion.mock_author_name}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{discussion.profiles?.title || discussion.mock_author_title}</span>
                <span>•</span>
                <span>{new Date(discussion.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-8 text-lg">
            {discussion.content}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={handleLike}
              className={`gap-2 rounded-full px-6 font-semibold transition-all ${hasLiked ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-500 dark:hover:bg-rose-900/50' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
              {likesCount} {isRtl ? "إعجاب" : "Likes"}
            </Button>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 px-4">
              <MessageCircle className="h-4 w-4" />
              {comments.length} {isRtl ? "تعليق" : "Comments"}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 px-2">
            {isRtl ? "التعليقات" : "Comments"} ({comments.length})
          </h3>
          
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                  <AvatarImage src={comment.profiles?.avatar_url || ""} />
                  <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600">{comment.profiles?.full_name?.charAt(0) || comment.mock_author_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {comment.profiles?.full_name || comment.mock_author_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed ps-14">
                {comment.content}
              </div>
            </div>
          ))}

          {/* Add Comment Form */}
          <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 mt-6">
            <h4 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">{isRtl ? "أضف تعليقاً" : "Add a comment"}</h4>
            <form onSubmit={handleComment} className="flex flex-col items-end gap-3">
              <Textarea
                placeholder={isRtl ? "اكتب تعليقك هنا..." : "Write your comment here..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 resize-none rounded-xl"
                rows={4}
                required
              />
              <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="bg-emerald-600 hover:bg-emerald-700 font-semibold gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isRtl ? "إرسال" : "Post Comment"}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
