"use client"

import type React from "react"

import type { Issue, IssueStatus } from "@/lib/types"
import { IssueCard } from "@/components/issue-card"

interface KanbanColumnProps {
  title: string
  status: IssueStatus
  issues: Issue[]
  onDragStart: (issue: Issue) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (status: IssueStatus) => void
  projectId: string
}

export function KanbanColumn({ title, status, issues, onDragStart, onDragOver, onDrop }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-card rounded-lg border">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide">{title}</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{issues.length}</span>
          </div>
        </div>
        <div className="p-3 space-y-3 min-h-[500px]" onDragOver={onDragOver} onDrop={() => onDrop(status)}>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onDragStart={onDragStart} />
          ))}
          {issues.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No issues</div>
          )}
        </div>
      </div>
    </div>
  )
}
