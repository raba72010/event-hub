import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { I18nProvider } from "@/lib/i18n-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 👇 UPDATED METADATA
export const metadata: Metadata = {
  title: "Sudanese Professionals Club",
  description: "Empowering professionals, fostering innovation, and building a stronger community.",
  icons: {
    icon: "/logo.png", // This uses the logo you added to the public folder
  },
};

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const locale = (localeCookie?.value === "en" ? "en" : "ar") as "en" | "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";
  
  const dict = await import(`@/messages/${locale}.json`).then((module) => module.default);

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-50`}
      >
        <I18nProvider initialLocale={locale} dictionary={dict}>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}