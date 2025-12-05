"use client"

import { useState } from "react"
import type { Issue, Project } from "@/lib/types"
import Link from "next/link"
import type { Issue } from "@/lib/types"
import { IssueTypeIcon } from "@/components/issue-type-icon"
import { PriorityIcon } from "@/components/priority-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import { BulkOperations } from "@/components/bulk-operations"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter } from "lucide-react"

interface IssuesListViewProps {
  project: Project
  initialIssues: Issue[]
}

export function IssuesListView({ project, initialIssues }: IssuesListViewProps) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.key.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || issue.status === statusFilter
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter
    const matchesType = typeFilter === "all" || issue.type === typeFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const toggleSelect = (issueId: string) => {
    setSelectedIssues((prev) => (prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]))
  }

  const toggleSelectAll = () => {
    if (selectedIssues.length === filteredIssues.length) {
      setSelectedIssues([])
    } else {
      setSelectedIssues(filteredIssues.map((issue) => issue.id))
    }
  }

  const handleBulkComplete = () => {
    setSelectedIssues([])
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Issues</h2>
        <div className="flex items-center gap-2">
          {selectedIssues.length > 0 && <BulkOperations selectedIssues={selectedIssues} onComplete={handleBulkComplete} />}
          <CreateIssueDialog
            projectId={project.id}
            onIssueCreated={(issue) => setIssues((prev) => [...prev, issue])}
          />
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="highest">Highest</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="lowest">Lowest</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Type</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="story">Story</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No issues found</p>
          </div>
        ) : filteredIssues.length > 0 ? (
          <div className="flex items-center gap-2 p-2 border-b">
            <Checkbox
              checked={selectedIssues.length === filteredIssues.length && filteredIssues.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedIssues.length > 0 ? `${selectedIssues.length} selected` : "Select all"}
            </span>
          </div>
        ) : null}
        {filteredIssues.length > 0 && (
          filteredIssues.map((issue) => (
            <Card key={issue.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Checkbox
                    checked={selectedIssues.includes(issue.id)}
                    onCheckedChange={() => toggleSelect(issue.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Link href={`/issue/${issue.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <IssueTypeIcon type={issue.type} className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {issue.title}
                        </h3>
                      </div>
                      {issue.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {issue.description}
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <PriorityIcon priority={issue.priority} />
                    {issue.assignee && issue.assignee.name && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={issue.assignee.avatar || "/placeholder.svg"} alt={issue.assignee.name} />
                        <AvatarFallback className="text-xs">
                          {issue.assignee.name ? issue.assignee.name[0] : ""}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-xs text-muted-foreground capitalize px-2 py-1 rounded bg-muted">
                      {issue.status.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

