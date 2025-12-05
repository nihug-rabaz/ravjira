"use client"

import { useState } from "react"
import type { Project, Issue, User } from "@/lib/types"
import { KanbanBoard } from "@/components/kanban-board"
import { IssuesListView } from "@/components/issues-list-view"
import { ProjectHeader } from "@/components/project-header"
import { ViewToggle } from "@/components/view-toggle"
import { ReportsDashboard } from "@/components/reports-dashboard"
import { TimelineView } from "@/components/timeline-view"
import { CalendarView } from "@/components/calendar-view"
import { SprintManagement } from "@/components/sprint-management"

interface ProjectPageClientProps {
  project: Project
  issues: Issue[]
  user: User | null
}

export function ProjectPageClient({ project, issues, user }: ProjectPageClientProps) {
  const [view, setView] = useState<"kanban" | "list" | "timeline" | "calendar" | "reports" | "sprints">("kanban")

  return (
    <div className="min-h-screen bg-muted/30">
      <ProjectHeader project={project} user={user} />
      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <ViewToggle view={view} onViewChange={setView} />
        </div>
        {view === "kanban" ? (
          <KanbanBoard project={project} initialIssues={issues} />
        ) : view === "list" ? (
          <IssuesListView project={project} initialIssues={issues} />
        ) : view === "timeline" ? (
          <TimelineView project={project} initialIssues={issues} />
        ) : view === "calendar" ? (
          <CalendarView project={project} initialIssues={issues} />
        ) : view === "sprints" ? (
          <SprintManagement projectId={project.id} />
        ) : (
          <ReportsDashboard projectId={project.id} />
        )}
      </main>
    </div>
  )
}

