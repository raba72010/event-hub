"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, X, Heart, Share2, Link as LinkIcon, Download, ExternalLink } from "lucide-react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import type { Event } from "@/types/event"
import { supabase } from "@/lib/supabase"
import { toggleFavorite, isEventFavorited } from "@/lib/favorites"
import { toggleRegistration, isEventRegistered } from "@/lib/registrations"
import { cn } from "@/lib/utils"

interface EventDetailModalProps {
  event: Event
  isOpen: boolean
  isSignedIn: boolean
  onClose: () => void
}

export function EventDetailModal({ event, isOpen, isSignedIn, onClose }: EventDetailModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isOpen) return

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null)
      if (user) {
        Promise.all([
          isEventFavorited(event.id, user.id).catch(() => false),
          isEventRegistered(event.id, user.id).catch(() => false),
        ]).then(([favorited, registered]) => {
          setIsFavorited(favorited)
          setIsRegistered(registered)
          setIsLoading(false)
        })
      } else {
        setIsLoading(false)
      }
    })
  }, [isOpen, event.id])

  const handleFavorite = async () => {
    if (!userId) { window.location.href = "/login"; return }
    try {
      const newState = await toggleFavorite(event.id, userId)
      setIsFavorited(newState)
    } catch (error) { console.error(error) }
  }

  const handleRegister = async () => {
    if (!userId) { window.location.href = "/login"; return }
    setIsSubmitting(true)
    try {
      const newState = await toggleRegistration(event.id, userId)
      setIsRegistered(newState)
    } catch (error) {
      console.error(error)
      alert("Failed to update registration.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-6" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-t-2xl md:rounded-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 md:fade-in md:zoom-in-95 duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-all"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        {/* HERO IMAGE */}
        <div className="relative h-48 md:h-64 w-full bg-slate-100 shrink-0">
          {event.image ? (
            <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
               <span className="text-6xl font-bold text-white/20">{event.title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8">
            <span className="inline-block rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm mb-2 shadow-sm">
              {event.category}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white shadow-sm leading-tight">{event.title}</h2>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row h-full">
            
            {/* LEFT: Info */}
            <div className="flex-1 p-6 md:p-8 space-y-8">
              <div className="flex flex-wrap gap-4 pb-6 border-b border-gray-100">
                 <div className="flex items-center gap-2 text-gray-700">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Calendar className="h-5 w-5" /></div>
                    <div><p className="text-xs text-gray-500 font-semibold uppercase">Date</p><p className="text-sm font-medium">{event.date}</p></div>
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Clock className="h-5 w-5" /></div>
                    <div><p className="text-xs text-gray-500 font-semibold uppercase">Time</p><p className="text-sm font-medium">{event.time} ({event.duration})</p></div>
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><MapPin className="h-5 w-5" /></div>
                    <div><p className="text-xs text-gray-500 font-semibold uppercase">Location</p><p className="text-sm font-medium">{event.location}</p></div>
                 </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About this activity</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
              
              {/* 👇 NEW: RESOURCES SECTION */}
              {event.resources && event.resources.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                   <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                     <Download className="h-4 w-4 text-emerald-600" /> Event Resources
                   </h3>
                   <div className="grid gap-2">
                     {event.resources.map((res, i) => (
                       <a 
                         key={i} 
                         href={res.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-emerald-300 hover:shadow-sm transition-all group"
                       >
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                              <LinkIcon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{res.title}</span>
                         </div>
                         <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" />
                       </a>
                     ))}
                   </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">#{tag}</span>
                ))}
              </div>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="w-full md:w-80 bg-gray-50/80 p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col gap-6">
               <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-4">Registration is open to all members.</p>
                  <Button 
                    className={cn(
                      "w-full h-12 text-base shadow-md transition-all", 
                      isRegistered ? "bg-white border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50" : "bg-slate-900 hover:bg-slate-800 text-white"
                    )}
                    onClick={handleRegister} 
                    disabled={isLoading || isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : isRegistered ? "Cancel Registration" : "Join Event"}
                  </Button>
                  {isRegistered && <p className="mt-3 text-xs font-medium text-emerald-600">✓ You are going!</p>}
               </div>

               <div>
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Hosted By</h4>
                 <div className="space-y-4">
                   {event.speakers.map((speaker) => (
                     <div key={speaker.name} className="flex items-center gap-3">
                       <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm">
                          {speaker.avatarUrl ? (
                            <img src={speaker.avatarUrl} alt={speaker.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-800 text-white font-bold">{speaker.name.charAt(0)}</div>
                          )}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-900">{speaker.name}</p>
                         <p className="text-xs text-gray-500">{speaker.title}</p>
                         {speaker.company && <p className="text-xs text-emerald-600 font-medium">{speaker.company}</p>}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="mt-auto flex gap-2 justify-center">
                 <button onClick={handleFavorite} className={cn("flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-110", isFavorited ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 bg-white text-gray-400 hover:text-gray-600")}>
                    <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />
                 </button>
                 <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-emerald-600 transition-all hover:scale-110">
                    <Share2 className="h-5 w-5" />
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}