"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, List, BarChart3 } from "lucide-react"

interface ViewToggleProps {
  view: "kanban" | "list" | "reports"
  onViewChange: (view: "kanban" | "list" | "reports") => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      <Button
        variant={view === "kanban" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("kanban")}
        className="h-8 text-xs sm:text-sm"
      >
        <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
        <span className="hidden sm:inline">Board</span>
      </Button>
      <Button
        variant={view === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="h-8 text-xs sm:text-sm"
      >
        <List className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
        <span className="hidden sm:inline">List</span>
      </Button>
      <Button
        variant={view === "reports" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("reports")}
        className="h-8 text-xs sm:text-sm"
      >
        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
        <span className="hidden sm:inline">Reports</span>
      </Button>
    </div>
  )
}

