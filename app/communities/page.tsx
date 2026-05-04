import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { 
  BarChart, 
  Briefcase, 
  Cpu, 
  CheckCircle, 
  LineChart, 
  HeartPulse, 
  BookOpen, 
  Database,
  ArrowLeft
} from "lucide-react"

const COMMUNITIES = [
  { slug: "strategic-planning", name: "الإدارة والتخطيط الاستراتيجي", icon: BarChart, color: "text-blue-500", bg: "bg-blue-50" },
  { slug: "project-management", name: "إدارة المشاريع", icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-50" },
  { slug: "ai", name: "الذكاء الاصطناعي", icon: Cpu, color: "text-purple-500", bg: "bg-purple-50" },
  { slug: "tqm", name: "إدارة الجودة الشاملة", icon: CheckCircle, color: "text-orange-500", bg: "bg-orange-50" },
  { slug: "financial-management", name: "الإدارة المالية والمراجعة", icon: LineChart, color: "text-green-600", bg: "bg-green-50" },
  { slug: "healthcare", name: "الرعاية الصحية", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50" },
  { slug: "english", name: "اللغة الإنجليزية", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50" },
  { slug: "data-science", name: "علوم البيانات", icon: Database, color: "text-cyan-500", bg: "bg-cyan-50" },
]

export default function CommunitiesIndex() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">مجتمعات النادي</h1>
        <p className="text-lg text-slate-600">
           انضم إلى مجتمعاتنا المتخصصة للتواصل مع الخبراء، وتبادل المعرفة، وتطوير مهاراتك في مجالك المهني.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {COMMUNITIES.map((community) => (
          <Link key={community.slug} href={`/communities/${community.slug}`}>
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-slate-200">
              <CardContent className="p-6 space-y-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${community.bg}`}>
                   <community.icon className={`h-6 w-6 ${community.color}`} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{community.name}</h3>
                   <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                     اكتشف الفعاليات، المقالات، والنقاشات المتعلقة بمجال {community.name}.
                   </p>
                </div>
                <div className="flex items-center text-sm font-medium text-emerald-600 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   تصفح المجتمع <ArrowLeft className="h-4 w-4 mr-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
