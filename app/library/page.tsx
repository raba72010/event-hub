import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LibraryPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-slate-900">المكتبة الرقمية</h1>
        <p className="text-lg text-slate-600">دراسات، بحوث، ونشرات علمية في مختلف التخصصات المهنية.</p>
      </div>

      {/* Search and Filter */}
      <div className="max-w-3xl mx-auto flex gap-4 mb-12">
         <div className="relative flex-1">
            <Search className="absolute right-3 top-3 text-slate-400 h-5 w-5" />
            <input type="text" placeholder="ابحث في المكتبة..." className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
         </div>
         <select className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none bg-white">
            <option>جميع التصنيفات</option>
            <option>أبحاث علمية</option>
            <option>كتب ومراجع</option>
            <option>أوراق عمل</option>
         </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Placeholder Books/Research */}
         {[1, 2, 3, 4, 5, 6].map((i) => (
           <Card key={i} className="hover:shadow-md transition-all">
             <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                   <BookOpen className="h-6 w-6" />
                </div>
                <div>
                   <h3 className="font-bold text-lg text-slate-900 mb-2">عنوان البحث أو الكتاب {i}</h3>
                   <p className="text-sm text-slate-500 mb-4 line-clamp-2">وصف موجز لمحتوى البحث أو الكتاب وأهميته للمحترفين في هذا المجال.</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <span className="text-xs font-medium text-slate-400">PDF • 2.4 MB</span>
                   <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                      <Download className="h-4 w-4 ml-2" /> تحميل
                   </Button>
                </div>
             </CardContent>
           </Card>
         ))}
      </div>
    </div>
  )
}
