import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, ShieldCheck, Briefcase } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">عن النادي</h1>
        <p className="text-lg text-slate-600">نادي المحترفين السودانيين هو منصة تجمع الكفاءات لبناء مستقبل مشرق من خلال تبادل المعرفة والابتكار.</p>
      </div>

      {/* Vision and Mission */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-8 space-y-4 text-center">
            <Target className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold">الرؤية</h2>
            <p className="text-slate-600 leading-relaxed">
              أن نكون المنصة الرائدة التي تجمع وتمكن المحترفين السودانيين ليكونوا رواداً في بناء مجتمع المعرفة والابتكار على المستوى العالمي.
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-8 space-y-4 text-center">
            <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold">الرسالة</h2>
            <p className="text-slate-600 leading-relaxed">
              توفير بيئة داعمة لتبادل الخبرات، وتطوير المهارات، وتعزيز التعاون المهني الذي يسهم في إحداث تأثير إيجابي ومستدام.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advisory Board & Executive Office placeholders */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">قيادة النادي</h2>
          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Advisory Board */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-emerald-600" />
              <h3 className="text-2xl font-semibold">المجلس الاستشاري</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[200px]">
              <p className="text-slate-400">سيتم إضافة أعضاء المجلس الاستشاري قريباً</p>
            </div>
          </div>

          {/* Executive Office */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-emerald-600" />
              <h3 className="text-2xl font-semibold">المكتب التنفيذي</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[200px]">
              <p className="text-slate-400">سيتم إضافة أعضاء المكتب التنفيذي قريباً</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Organizational Structure */}
      <div className="bg-slate-900 text-white p-12 rounded-3xl text-center space-y-6">
         <h2 className="text-3xl font-bold">الهيكل التنظيمي</h2>
         <p className="text-slate-300 max-w-2xl mx-auto">
            يعتمد نادي المحترفين السودانيين على هيكل تنظيمي مرن يضمن كفاءة الأداء وسرعة الاستجابة لمتطلبات أعضائه ومجتمعاته المختلفة.
         </p>
         <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 max-w-4xl mx-auto">
            <p className="text-slate-500">رسم بياني للهيكل التنظيمي (قيد التصميم)</p>
         </div>
      </div>

    </div>
  )
}
