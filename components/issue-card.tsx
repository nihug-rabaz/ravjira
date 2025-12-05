"use client"

import Link from "next/link"
import type { Issue } from "@/lib/types"
import { IssueTypeIcon } from "@/components/issue-type-icon"
import { PriorityIcon } from "@/components/priority-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

interface IssueCardProps {
  issue: Issue
  onDragStart: (issue: Issue) => void
}

export function IssueCard({ issue, onDragStart }: IssueCardProps) {
  return (
    <Link href={`/issue/${issue.id}`}>
      <Card
        draggable
        onDragStart={() => onDragStart(issue)}
        className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-background"
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground line-clamp-2 text-balance">
            {issue.title}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IssueTypeIcon type={issue.type} className="h-4 w-4 text-muted-foreground" />
              {issue.description && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {issue.description}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PriorityIcon priority={issue.priority} />
              {issue.assignee && issue.assignee.name && (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={issue.assignee.avatar || "/placeholder.svg"} alt={issue.assignee.name} />
                  <AvatarFallback className="text-xs">{issue.assignee?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
