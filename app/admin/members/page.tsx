"use client"

import { useState, useEffect } from "react"
import { Users, Search, Building, MapPin, Shield, Calendar } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminMembersPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchMembers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        
      if (error) {
        console.error("Error fetching members:", error)
      } else if (data) {
        setMembers(data)
      }
      setLoading(false)
    }
    fetchMembers()
  }, [])

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.company?.toLowerCase().includes(search.toLowerCase()) ||
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.community?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("admin.members_title")}</h1>
          <p className="text-slate-500 text-sm mt-1">{t("admin.members_subtitle")}</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={isRtl ? "البحث بالاسم، الشركة، أو المنصب..." : "Search by name, company, or title..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isRtl ? 'pr-10' : 'pl-10'}`}
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left dark:text-slate-300">
            <thead className={`text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 uppercase border-b border-slate-200 dark:border-slate-800 ${isRtl ? 'text-right' : 'text-left'}`}>
              <tr>
                <th className="px-6 py-4 font-semibold">{isRtl ? "العضو" : "Member"}</th>
                <th className="px-6 py-4 font-semibold">{isRtl ? "المنصب والشركة" : "Title & Company"}</th>
                <th className="px-6 py-4 font-semibold">{isRtl ? "المجتمع" : "Community"}</th>
                <th className="px-6 py-4 font-semibold">{isRtl ? "تاريخ الانضمام" : "Joined"}</th>
                <th className="px-6 py-4 font-semibold text-center">{isRtl ? "نوع الحساب" : "Role"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-spin h-6 w-6 border-b-2 border-emerald-500 rounded-full mx-auto mb-4" />
                    {isRtl ? "جاري تحميل الأعضاء..." : "Loading members..."}
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    {isRtl ? "لم يتم العثور على أعضاء مطابقين للبحث" : "No members found matching your search"}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Avatar & Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                          <AvatarImage src={member.avatar_url || ""} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                            {member.full_name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{member.full_name || (isRtl ? "بدون اسم" : "Unnamed User")}</div>
                          {member.location && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {member.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Title & Company */}
                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-slate-200 font-medium">{member.title || "-"}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="h-3 w-3" />
                        {member.company || "-"}
                      </div>
                    </td>

                    {/* Community */}
                    <td className="px-6 py-4">
                      {member.community ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          {member.community}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(member.created_at).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { month: "short", year: "numeric", day: "numeric" })}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4 text-center">
                      {member.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                          <Shield className="h-3.5 w-3.5" />
                          {isRtl ? "مسؤول" : "Admin"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {isRtl ? "عضو" : "User"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
