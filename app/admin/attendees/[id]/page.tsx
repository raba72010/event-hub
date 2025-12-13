"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, User, Download, Loader2, Search 
} from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AttendeeListPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id
  
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [attendees, setAttendees] = useState<any[]>([])
  const [eventTitle, setEventTitle] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchData() {
      // 1. Check Admin Access
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      // 2. Fetch Event Title
      const { data: eventData } = await supabase.from("events").select("title").eq("id", eventId).single()
      if (eventData) setEventTitle(eventData.title)

      // 3. SAFE FETCH STEP A: Get Registrations first
      // We only ask for user_id to avoid join errors
      const { data: regs, error: regError } = await supabase
        .from("registrations")
        .select("user_id, created_at")
        .eq("event_id", eventId)
      
      if (regError) {
          console.error("Error fetching regs:", regError)
          setIsLoading(false)
          return
      }

      if (!regs || regs.length === 0) {
          setAttendees([])
          setIsLoading(false)
          return
      }

      // 4. SAFE FETCH STEP B: Get User Profiles
      // Extract the IDs and fetch their profiles separately
      const userIds = regs.map(r => r.user_id)

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, company, title")
        .in("id", userIds)

      // 5. Combine Data manually (Javascript Join)
      const combined = regs.map(r => {
          const profile = profiles?.find(p => p.id === r.user_id)
          return {
              registered_at: new Date(r.created_at).toLocaleDateString(),
              email: profile?.email || "Unknown",
              name: profile?.full_name || "Guest User",
              company: profile?.company || "-",
              title: profile?.title || "-"
          }
      })

      setAttendees(combined)
      setIsLoading(false)
    }

    fetchData()
  }, [eventId, router])

  // Filter Logic
  const filteredAttendees = attendees.filter(p => 
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.company || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Export to CSV Function
  const handleExport = () => {
    const headers = ["Name,Email,Company,Job Title,Registered Date"]
    const rows = filteredAttendees.map(p => 
      `"${p.name}","${p.email}","${p.company}","${p.title}","${p.registered_at}"`
    )
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${eventTitle}_attendees.csv`)
    document.body.appendChild(link)
    link.click()
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white">
                <User className="h-4 w-4" />
             </div>
             <div className="flex flex-col">
               <h1 className="text-sm font-bold text-slate-900">Attendee List</h1>
               <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{eventTitle}</span>
             </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, email, or company..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
           </div>
           
           <Button onClick={handleExport} variant="outline" className="w-full md:w-auto">
             <Download className="h-4 w-4 mr-2" /> Export CSV
           </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                 <tr>
                   <th className="px-6 py-3">Name</th>
                   <th className="px-6 py-3">Email</th>
                   <th className="px-6 py-3">Company</th>
                   <th className="px-6 py-3">Registered</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {filteredAttendees.length > 0 ? (
                   filteredAttendees.map((person, i) => (
                     <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-6 py-4 font-medium text-gray-900">
                         {person.name}
                         <div className="text-xs text-gray-400 font-normal md:hidden">{person.email}</div>
                       </td>
                       <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{person.email}</td>
                       <td className="px-6 py-4 text-gray-500">
                         <div className="flex flex-col">
                           <span>{person.company}</span>
                           <span className="text-[10px] text-gray-400">{person.title}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-gray-500">{person.registered_at}</td>
                     </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                       No attendees found.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
           <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
             Total Attendees: {filteredAttendees.length}
           </div>
        </div>
      </div>
    </div>
  )
}