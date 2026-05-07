import {
  BarChart,
  Briefcase,
  Cpu,
  CheckCircle,
  LineChart,
  HeartPulse,
  BookOpen,
  Database,
  type LucideIcon,
} from "lucide-react"

export interface Community {
  slug: string
  nameAr: string
  nameEn: string
  icon: LucideIcon
  color: string
  bg: string
}

export const COMMUNITIES: Community[] = [
  { slug: "strategic-planning",  nameAr: "الإدارة والتخطيط الاستراتيجي", nameEn: "Strategic Management & Planning", icon: BarChart,   color: "text-blue-500",   bg: "bg-blue-50" },
  { slug: "project-management",  nameAr: "إدارة المشاريع",                nameEn: "Project Management",              icon: Briefcase,  color: "text-emerald-500", bg: "bg-emerald-50" },
  { slug: "ai",                  nameAr: "الذكاء الاصطناعي",              nameEn: "Artificial Intelligence",         icon: Cpu,        color: "text-purple-500", bg: "bg-purple-50" },
  { slug: "tqm",                 nameAr: "إدارة الجودة الشاملة",          nameEn: "Total Quality Management",        icon: CheckCircle, color: "text-orange-500", bg: "bg-orange-50" },
  { slug: "financial-management", nameAr: "الإدارة المالية والمراجعة",    nameEn: "Financial Management & Auditing", icon: LineChart,  color: "text-green-600", bg: "bg-green-50" },
  { slug: "healthcare",          nameAr: "الرعاية الصحية",                nameEn: "Healthcare",                      icon: HeartPulse, color: "text-rose-500",   bg: "bg-rose-50" },
  { slug: "english",             nameAr: "اللغة الإنجليزية",              nameEn: "English Language",                icon: BookOpen,   color: "text-indigo-500", bg: "bg-indigo-50" },
  { slug: "data-science",        nameAr: "علوم البيانات",                 nameEn: "Data Science",                    icon: Database,   color: "text-cyan-500",   bg: "bg-cyan-50" },
]
