"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") {
          return
        }
        return
      }

      if (e.key === "/") {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault()
        setShowShortcuts(true)
      }

      if (e.key === "g" || e.key === "G") {
        if (e.key === "p" || e.key === "P") {
          e.preventDefault()
          router.push("/")
        }
      }

      if (e.key === "c" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const createButton = document.querySelector('[aria-label*="Create"], button:has-text("Create")') as HTMLButtonElement
        if (createButton && document.activeElement !== createButton) {
          createButton.click()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <>
      {children}
      <KeyboardShortcuts open={showShortcuts} onOpenChange={setShowShortcuts} />
    </>
  )
}


