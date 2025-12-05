"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, List, BarChart3, Calendar, GitBranch, Clock } from "lucide-react"

interface ViewToggleProps {
  view: "kanban" | "list" | "timeline" | "calendar" | "reports" | "sprints"
  onViewChange: (view: "kanban" | "list" | "timeline" | "calendar" | "reports" | "sprints") => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-md p-1 flex-wrap">
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
        variant={view === "timeline" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("timeline")}
        className="h-8 text-xs sm:text-sm"
      >
        <Clock className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
        <span className="hidden sm:inline">Timeline</span>
      </Button>
      <Button
        variant={view === "calendar" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("calendar")}
        className="h-8 text-xs sm:text-sm"
      >
        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
        <span className="hidden sm:inline">Calendar</span>
      </Button>
      <Button
        variant={view === "sprints" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("sprints")}
        className="h-8 text-xs sm:text-sm"
      >
        <GitBranch className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
        <span className="hidden sm:inline">Sprints</span>
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

