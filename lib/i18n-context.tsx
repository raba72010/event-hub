"use client"

import React, { createContext, useContext, useState } from "react"

type Locale = "en" | "ar"

interface I18nContextType {
  locale: Locale
  t: (key: string) => string
  setLocale: (newLocale: Locale) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({
  children,
  initialLocale,
  dictionary
}: {
  children: React.ReactNode
  initialLocale: Locale
  dictionary: any
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [dict, setDict] = useState<any>(dictionary)

  const t = (key: string): string => {
    const keys = key.split(".")
    let value = dict
    for (const k of keys) {
      if (value[k] === undefined) return key
      value = value[k]
    }
    return value as string
  }

  const setLocale = async (newLocale: Locale) => {
    const newDict = await import(`@/messages/${newLocale}.json`).then(m => m.default)
    setLocaleState(newLocale)
    setDict(newDict)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
  }

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider")
  }
  return context
}
