"use client"

import { useState, useEffect } from "react"
import type { Issue, Project } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { IssueTypeIcon } from "@/components/issue-type-icon"
import { PriorityIcon } from "@/components/priority-icon"
import Link from "next/link"
import { Calendar } from "lucide-react"

interface TimelineViewProps {
  project: Project
  initialIssues: Issue[]
}

export function TimelineView({ project, initialIssues }: TimelineViewProps) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)

  const groupedByDate = issues.reduce((acc, issue) => {
    const date = new Date(issue.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(issue)
    return acc
  }, {} as Record<string, Issue[]>)

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date} className="relative pl-12">
              <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">{date}</h3>
              </div>
              <div className="space-y-2">
                {groupedByDate[date].map((issue) => (
                  <Link key={issue.id} href={`/issue/${issue.id}`}>
                    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <IssueTypeIcon type={issue.type} className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-muted-foreground">{issue.key}</span>
                            <h4 className="text-sm font-medium text-foreground truncate">{issue.title}</h4>
                          </div>
                          {issue.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{issue.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <PriorityIcon priority={issue.priority} />
                          <span className="text-xs text-muted-foreground capitalize px-2 py-1 rounded bg-muted">
                            {issue.status.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

