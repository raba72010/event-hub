"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  User, Mail, Building, Briefcase,
  Calendar, MapPin, Clock, Heart, Ticket,
  LogOut, Loader2, ArrowLeft, ArrowRight, Save
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { EventDetailModal } from "@/components/event-detail-modal"
import { useTranslation } from "@/lib/i18n-context"
import { COMMUNITIES } from "@/lib/communities"

function cleanEventData(row: any) {
  if (!row) return null
  const startTime = row.start_time ? new Date(row.start_time) : null
  const date = startTime ? startTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : row.date || ""
  const time = startTime ? startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : row.time || ""

  let tags: string[] = []
  if (row.tags) {
    if (typeof row.tags === "string") { try { tags = JSON.parse(row.tags) } catch { tags = row.tags.split(",").map((t: string) => t.trim()) } }
    else if (Array.isArray(row.tags)) { tags = row.tags }
  }

  let speakers: any[] = []
  if (row.speakers) {
    if (typeof row.speakers === "string") { try { speakers = JSON.parse(row.speakers) } catch { } }
    else if (Array.isArray(row.speakers)) { speakers = row.speakers }
  }
  if (speakers.length === 0 && row.speaker_name) {
    speakers = [{ name: row.speaker_name, title: row.speaker_title || "", company: row.speaker_company, avatarUrl: row.speaker_avatar_url }]
  }

  return {
    ...row,
    id: row.id?.toString() || "",
    title: row.title || "",
    category: row.category || "General",
    date, time,
    duration: row.duration || "",
    location: row.location || "Virtual",
    description: row.description || "",
    image: row.image,
    resources: row.resources || [],
    tags,
    speakers,
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"tickets" | "favorites" | "settings">("tickets")
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({})
  const [registrations, setRegistrations] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  useEffect(() => {
    async function init() {
      if (typeof window !== "undefined" && localStorage.getItem("mock_admin_session") === "true") {
        setUser({ id: "mock-admin-id", email: "admin@spc.sd" })
        setProfile({ full_name: "Admin", company: "SPC", title: "Administrator", availability: "active", is_public: true })
        setIsLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUser(user)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profileData || { full_name: "", company: "", title: "" })

      const { data: regData } = await supabase.from("registrations").select("*, events(*)").eq("user_id", user.id)
      setRegistrations((regData || []).filter(r => r.events))

      const { data: favData } = await supabase.from("favorites").select("*, events(*)").eq("user_id", user.id)
      setFavorites((favData || []).filter(f => f.events))

      setIsLoading(false)
    }
    init()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: profile.full_name,
        company: profile.company,
        title: profile.title,
        bio: profile.bio,
        location: profile.location,
        community: profile.community,
        availability: profile.availability || "active",
        is_public: profile.is_public !== false,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      alert(t("profile.profile_updated"))
    } catch {
      alert(t("profile.profile_error"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    if (typeof window !== "undefined") localStorage.removeItem("mock_admin_session")
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleEventClick = (rawEvent: any) => setSelectedEvent(cleanEventData(rawEvent))

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
  }

  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  return (
    <div className="min-h-screen bg-slate-50" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">

          {/* SIDEBAR */}
          <aside className="w-full md:w-72 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="h-24 w-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 mb-4">
                {profile.full_name ? profile.full_name.charAt(0) : user.email.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{profile.full_name || "User"}</h2>
              <p className="text-sm text-gray-500 mb-6">{user.email}</p>

              <div className="flex flex-col gap-2 text-start">
                <button onClick={() => setActiveTab("tickets")} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "tickets" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  <Ticket className="h-4 w-4" /> {t("profile.my_tickets")}
                </button>
                <button onClick={() => setActiveTab("favorites")} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "favorites" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  <Heart className="h-4 w-4" /> {t("profile.saved_events")}
                </button>
                <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "settings" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  <User className="h-4 w-4" /> {t("profile.edit_profile")}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button onClick={handleSignOut} className="flex items-center justify-center gap-2 w-full text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <LogOut className="h-4 w-4" /> {t("profile.sign_out")}
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">

            {activeTab === "tickets" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900">{t("profile.my_tickets")}</h2>
                {registrations.length === 0 ? (
                  <EmptyState title={t("profile.no_tickets")} message={t("profile.no_tickets_desc")} />
                ) : (
                  <div className="grid gap-4">
                    {registrations.map(({ events: event }) => (
                      <EventRow key={event.id} event={event} badge={t("profile.registered_badge")} onClick={() => handleEventClick(event)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900">{t("profile.saved_events")}</h2>
                {favorites.length === 0 ? (
                  <EmptyState title={t("profile.no_favorites")} message={t("profile.no_favorites_desc")} />
                ) : (
                  <div className="grid gap-4">
                    {favorites.map(({ events: event }) => (
                      <EventRow key={event.id} event={event} badge={t("profile.favorite_badge")} onClick={() => handleEventClick(event)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900">{t("profile.profile_settings")}</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.full_name")}</label>
                      <div className="relative">
                        <User className="absolute top-2.5 h-4 w-4 text-gray-400" style={{ [isRtl ? "right" : "left"]: "0.75rem" }} />
                        <input type="text" value={profile.full_name || ""} onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                          className="w-full py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                          style={{ [isRtl ? "paddingRight" : "paddingLeft"]: "2.5rem", [isRtl ? "paddingLeft" : "paddingRight"]: "1rem" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.job_title")}</label>
                      <div className="relative">
                        <Briefcase className="absolute top-2.5 h-4 w-4 text-gray-400" style={{ [isRtl ? "right" : "left"]: "0.75rem" }} />
                        <input type="text" value={profile.title || ""} onChange={e => setProfile({ ...profile, title: e.target.value })}
                          placeholder={t("profile.job_title_placeholder")}
                          className="w-full py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                          style={{ [isRtl ? "paddingRight" : "paddingLeft"]: "2.5rem", [isRtl ? "paddingLeft" : "paddingRight"]: "1rem" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.company")}</label>
                      <div className="relative">
                        <Building className="absolute top-2.5 h-4 w-4 text-gray-400" style={{ [isRtl ? "right" : "left"]: "0.75rem" }} />
                        <input type="text" value={profile.company || ""} onChange={e => setProfile({ ...profile, company: e.target.value })}
                          placeholder={t("profile.company_placeholder")}
                          className="w-full py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                          style={{ [isRtl ? "paddingRight" : "paddingLeft"]: "2.5rem", [isRtl ? "paddingLeft" : "paddingRight"]: "1rem" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.location")}</label>
                      <input type="text" value={profile.location || ""} onChange={e => setProfile({ ...profile, location: e.target.value })}
                        placeholder={t("profile.location_placeholder")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.community")}</label>
                      <select value={profile.community || ""} onChange={e => setProfile({ ...profile, community: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">{t("profile.community_placeholder")}</option>
                        {COMMUNITIES.map(c => (
                          <option key={c.slug} value={c.slug}>{isRtl ? c.nameAr : c.nameEn}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.availability")}</label>
                      <select value={profile.availability || "active"} onChange={e => setProfile({ ...profile, availability: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="active">{t("members.availability.active")}</option>
                        <option value="available">{t("members.availability.available")}</option>
                        <option value="busy">{t("members.availability.busy")}</option>
                        <option value="inactive">{t("members.availability.inactive")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.bio")}</label>
                      <textarea rows={4} value={profile.bio || ""} onChange={e => setProfile({ ...profile, bio: e.target.value })}
                        placeholder={t("profile.bio_placeholder")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                      />
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <input
                        id="is_public"
                        type="checkbox"
                        checked={profile.is_public !== false}
                        onChange={e => setProfile({ ...profile, is_public: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="is_public" className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-slate-900">{t("profile.is_public")}</div>
                        <p className="mt-0.5 text-xs text-slate-500">{t("profile.is_public_desc")}</p>
                      </label>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" disabled={isSaving} className="gap-2">
                        {isSaving ? t("profile.saving") : <><Save className="h-4 w-4" /> {t("profile.save_changes")}</>}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} isSignedIn={true} />
      )}
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
      <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <User className="h-6 w-6 text-gray-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

function EventRow({ event, badge, onClick }: { event: any; badge: string; onClick: () => void }) {
  const dateObj = new Date(event.start_time)
  const date = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const time = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

  return (
    <div onClick={onClick} className="group flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
      <div className="h-32 md:h-24 w-full md:w-40 bg-slate-100 rounded-lg overflow-hidden shrink-0">
        {event.image ? (
          <img src={event.image} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-2xl">
            {event.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mb-2 inline-block">{badge}</span>
          <span className="text-xs text-gray-400">{event.category}</span>
        </div>
        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
          <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {date}</div>
          <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {time}</div>
          <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location || "Virtual"}</div>
        </div>
      </div>
    </div>
  )
}
