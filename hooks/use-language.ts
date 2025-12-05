"use client"

import { useState, useEffect } from "react"
import type { Language } from "@/lib/i18n"
import { useTranslations } from "@/lib/i18n"

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved && (saved === "he" || saved === "en")) {
      setLanguage(saved)
    }

    const handleLanguageChange = () => {
      const saved = localStorage.getItem("language") as Language
      if (saved && (saved === "he" || saved === "en")) {
        setLanguage(saved)
      }
    }

    window.addEventListener("languagechange", handleLanguageChange)
    return () => window.removeEventListener("languagechange", handleLanguageChange)
  }, [])

  const t = useTranslations(language)

  return { language, t }
}

