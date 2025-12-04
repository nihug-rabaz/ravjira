"use client"

import type React from "react"

import { useState } from "react"
import type { Issue, IssueStatus, Project } from "@/lib/types"
import { KanbanColumn } from "@/components/kanban-column"
import { CreateIssueDialog } from "@/components/create-issue-dialog"

interface KanbanBoardProps {
  project: Project
  initialIssues: Issue[]
}

const COLUMNS: { status: IssueStatus; title: string }[] = [
  { status: "backlog", title: "Backlog" },
  { status: "todo", title: "To Do" },
  { status: "in-progress", title: "In Progress" },
  { status: "in-review", title: "In Review" },
  { status: "done", title: "Done" },
]

export function KanbanBoard({ project, initialIssues }: KanbanBoardProps) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null)

  const handleDragStart = (issue: Issue) => {
    setDraggedIssue(issue)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (status: IssueStatus) => {
    if (!draggedIssue) return

    try {
      const res = await fetch(`/api/issues/${draggedIssue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        const updatedIssue = await res.json()
        setIssues((prev) => prev.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)))
      }
    } catch (error) {
      console.error("[v0] Error updating issue status:", error)
    }

    setDraggedIssue(null)
  }

  const getIssuesByStatus = (status: IssueStatus) => {
    return issues.filter((issue) => issue.status === status)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Board</h2>
        <CreateIssueDialog
          projectId={project.id}
          onIssueCreated={(issue) => setIssues((prev) => [...prev, issue])}
        />
      </div>

      <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 -mx-3 sm:-mx-6 px-3 sm:px-6">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            issues={getIssuesByStatus(column.status)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            projectId={project.id}
          />
        ))}
      </div>
    </div>
  )
}
