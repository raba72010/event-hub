"use client"

import { useState, useEffect } from "react"
import { Users, Search, Building, MapPin, Shield, Calendar, Edit, X, Loader2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminMembersPage() {
  const { t, locale } = useTranslation()
  const isRtl = locale === "ar"

  const [members, setMembers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Modal State
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [roleForm, setRoleForm] = useState({ role: "user", permissions: [] as string[] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function init() {
      // Fetch current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setCurrentUser(profile)
      }

      // Fetch all members
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        
      if (!error && data) {
        setMembers(data)
      }
      setLoading(false)
    }
    init()
  }, [])

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.company?.toLowerCase().includes(search.toLowerCase()) ||
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.community?.toLowerCase().includes(search.toLowerCase())
  )

  const canManageRoles = currentUser?.role === "main_admin" || currentUser?.role === "super_admin"

  const handleOpenModal = (member: any) => {
    // Super admins cannot edit main admins or other super admins
    if (currentUser?.role === "super_admin" && (member.role === "main_admin" || member.role === "super_admin")) {
      alert(isRtl ? "ليس لديك صلاحية لتعديل هذا الحساب" : "You do not have permission to edit this account.")
      return
    }
    setSelectedMember(member)
    setRoleForm({
      role: member.role || "user",
      permissions: member.permissions || []
    })
  }

  const handleTogglePerm = (perm: string) => {
    setRoleForm(prev => {
      const perms = prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
      return { ...prev, permissions: perms }
    })
  }

  const handleSaveRole = async () => {
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({ role: roleForm.role, permissions: roleForm.permissions })
      .eq("id", selectedMember.id)

    if (!error) {
      setMembers(members.map(m => m.id === selectedMember.id ? { ...m, role: roleForm.role, permissions: roleForm.permissions } : m))
      setSelectedMember(null)
    } else {
      alert(error.message)
    }
    setSaving(false)
  }

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
            placeholder={isRtl ? "البحث بالاسم..." : "Search by name..."}
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
                <th className="px-6 py-4 font-semibold">{isRtl ? "المنصب" : "Title"}</th>
                <th className="px-6 py-4 font-semibold">{isRtl ? "تاريخ الانضمام" : "Joined"}</th>
                <th className="px-6 py-4 font-semibold text-center">{isRtl ? "الصلاحية" : "Role"}</th>
                {canManageRoles && <th className="px-6 py-4 font-semibold text-center">{isRtl ? "إجراءات" : "Actions"}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={canManageRoles ? 5 : 4} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="animate-spin h-6 w-6 text-emerald-500 mx-auto mb-4" />
                    {isRtl ? "جاري تحميل الأعضاء..." : "Loading members..."}
                  </td>
                </tr>
              ) : filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                          <AvatarImage src={member.avatar_url || ""} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                            {member.full_name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{member.full_name || "Unknown"}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{member.email || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-slate-200 font-medium">{member.title || "-"}</div>
                      <div className="text-xs text-slate-500">{member.company || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(member.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {member.role || 'user'}
                      </span>
                    </td>
                    {canManageRoles && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenModal(member)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Management Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {isRtl ? "إدارة الصلاحيات" : "Manage Role"}
              </h3>
              <button onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedMember.avatar_url || ""} />
                  <AvatarFallback>{selectedMember.full_name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{selectedMember.full_name}</div>
                  <div className="text-sm text-slate-500">{selectedMember.email}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "مستوى الحساب" : "Account Level"}
                </label>
                <select
                  value={roleForm.role}
                  onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3"
                >
                  <option value="user">{isRtl ? "مستخدم عادي" : "Standard User"}</option>
                  <option value="community_admin">{isRtl ? "مشرف مجتمعي" : "Community Admin"}</option>
                  <option value="super_admin">{isRtl ? "مشرف عام" : "Super Admin"}</option>
                  {currentUser?.role === "main_admin" && (
                    <option value="main_admin">{isRtl ? "المدير الرئيسي (God Mode)" : "Main Admin (God Mode)"}</option>
                  )}
                </select>
              </div>

              {roleForm.role === "community_admin" && (
                <div className="space-y-3 pt-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isRtl ? "صلاحيات المشرف المجتمعي" : "Community Admin Modules"}
                  </label>
                  <div className="space-y-2">
                    {['users', 'events', 'media'].map(perm => (
                      <label key={perm} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">
                        <input
                          type="checkbox"
                          checked={roleForm.permissions.includes(perm)}
                          onChange={() => handleTogglePerm(perm)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleSaveRole}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isRtl ? "حفظ التغييرات" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
