import Link from "next/link"
import { ArrowRight, Users, BookOpen, Calendar, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const COMMUNITIES: Record<string, { name: string, description: string }> = {
  "strategic-planning": { name: "الإدارة والتخطيط الاستراتيجي", description: "مجتمع يركز على تطوير مهارات التخطيط الاستراتيجي والمؤسسي." },
  "project-management": { name: "إدارة المشاريع", description: "تبادل أفضل الممارسات في إدارة المشاريع الاحترافية." },
  "ai": { name: "الذكاء الاصطناعي", description: "استكشاف وتطبيق تقنيات الذكاء الاصطناعي في مختلف القطاعات." },
  "tqm": { name: "إدارة الجودة الشاملة", description: "تعزيز مفاهيم الجودة الشاملة والتميز المؤسسي." },
  "financial-management": { name: "الإدارة المالية والمراجعة", description: "نقاشات حول أحدث التطورات في الإدارة المالية والمراجعة الداخلية." },
  "healthcare": { name: "الرعاية الصحية", description: "مجتمع للمتخصصين في الرعاية الصحية وتطوير النظم الصحية." },
  "english": { name: "اللغة الإنجليزية", description: "تطوير مهارات اللغة الإنجليزية للأغراض المهنية والأكاديمية." },
  "data-science": { name: "علوم البيانات", description: "تحليل البيانات، بناء النماذج، واستخراج الرؤى الاستراتيجية." },
}

export default function CommunityPage({ params }: { params: { slug: string } }) {
  const community = COMMUNITIES[params.slug]

  if (!community) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">المجتمع غير موجود</h1>
        <Link href="/communities"><Button>العودة للمجتمعات</Button></Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <Link href="/communities" className="inline-flex items-center text-slate-400 hover:text-white mb-6 text-sm">
             <ArrowRight className="h-4 w-4 ml-2" /> العودة للقائمة
          </Link>
          <div className="max-w-3xl space-y-4">
             <div className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-sm text-emerald-400 border border-slate-700">
               مجتمع تخصصي
             </div>
             <h1 className="text-4xl md:text-5xl font-bold">{community.name}</h1>
             <p className="text-lg text-slate-300 leading-relaxed">{community.description}</p>
             <div className="pt-4 flex gap-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700">الانضمام للمجتمع</Button>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">جدول الفعاليات</Button>
             </div>
          </div>
        </div>
      </div>

      {/* Community Content */}
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                 <Calendar className="h-5 w-5 text-emerald-600" />
                 <h2 className="text-xl font-bold text-slate-900">أحدث الفعاليات</h2>
              </div>
              <div className="py-8 text-center text-slate-500">
                 لا توجد فعاليات قادمة حالياً.
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                 <MessageCircle className="h-5 w-5 text-emerald-600" />
                 <h2 className="text-xl font-bold text-slate-900">ساحة النقاش</h2>
              </div>
              <div className="py-8 text-center text-slate-500">
                 كن أول من يبدأ النقاش في هذا المجتمع!
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <h3 className="font-bold text-slate-900">إحصائيات المجتمع</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-slate-600"><Users className="h-4 w-4" /> الأعضاء</div>
                     <span className="font-semibold text-slate-900">+120</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-slate-600"><BookOpen className="h-4 w-4" /> المقالات</div>
                     <span className="font-semibold text-slate-900">15</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
