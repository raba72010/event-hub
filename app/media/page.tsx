import { Card, CardContent } from "@/components/ui/card"
import { PlayCircle, Image as ImageIcon, FileText } from "lucide-react"

export default function MediaCenterPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">المركز الإعلامي</h1>
        <p className="text-lg text-slate-600">تابع أحدث الأخبار، التغطيات، والإصدارات الخاصة بنادي المحترفين السودانيين.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center space-y-4">
               <FileText className="h-10 w-10 text-emerald-500 mx-auto" />
               <h3 className="text-xl font-bold">الأخبار والبيانات</h3>
               <p className="text-sm text-slate-500">أحدث أخبار النادي والبيانات الصحفية.</p>
            </CardContent>
         </Card>
         <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center space-y-4">
               <ImageIcon className="h-10 w-10 text-blue-500 mx-auto" />
               <h3 className="text-xl font-bold">معرض الصور</h3>
               <p className="text-sm text-slate-500">تغطية مصورة لفعاليات وأنشطة النادي.</p>
            </CardContent>
         </Card>
         <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center space-y-4">
               <PlayCircle className="h-10 w-10 text-red-500 mx-auto" />
               <h3 className="text-xl font-bold">المكتبة المرئية</h3>
               <p className="text-sm text-slate-500">تسجيلات اللقاءات، ورش العمل، والندوات.</p>
            </CardContent>
         </Card>
      </div>
      
      <div className="bg-slate-100 rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
         محتوى المركز الإعلامي سيتم إضافته قريباً
      </div>
    </div>
  )
}
