export const PREDEFINED_CATEGORIES = [
  "تصميم",
  "هندسة",
  "إدارة المنتجات",
  "تسويق",
  "علم البيانات",
  "أعمال",
  "مبيعات",
]

export const STOCK_IMAGES = [
  { id: "code",    label: "برمجة",       url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1000&q=80" },
  { id: "design",  label: "تصميم",       url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=80" },
  { id: "meeting", label: "اجتماع",      url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80" },
  { id: "conf",    label: "مؤتمر",       url: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1000&q=80" },
  { id: "laptop",  label: "بيئة العمل", url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80" },
  { id: "data",    label: "بيانات",      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80" },
  { id: "team",    label: "فريق",        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" },
  { id: "neon",    label: "تقنية",       url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80" },
]

export function getDateLocale(locale: string): string {
  return locale === "ar" ? "ar-EG" : "en-US"
}

export function isMockAdmin(): boolean {
  if (process.env.NODE_ENV === "production") return false
  if (typeof window === "undefined") return false
  return localStorage.getItem("mock_admin_session") === "true"
}
