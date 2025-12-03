"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface KeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Use these shortcuts to navigate faster</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Navigation</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Go to projects</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">G</kbd> <kbd className="px-2 py-1 bg-muted rounded text-xs">P</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Search</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">/</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Create issue</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">C</kbd>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">General</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Show shortcuts</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Close dialog</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function useKeyboardShortcuts() {
  const router = useRouter()
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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

      if (e.key === "g" && e.key === "p") {
        e.preventDefault()
        router.push("/")
      }

      if (e.key === "c" && !e.ctrlKey && !e.metaKey) {
        const createButton = document.querySelector('button:has-text("Create")') as HTMLButtonElement
        if (createButton) {
          createButton.click()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return { showShortcuts, setShowShortcuts }
}

