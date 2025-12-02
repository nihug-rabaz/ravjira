"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Issue, Project, IssueType, IssuePriority, IssueStatus, Comment, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { IssueTypeIcon } from "@/components/issue-type-icon"
import { PriorityIcon } from "@/components/priority-icon"
import { ChevronLeft, Trash2, Send } from "lucide-react"

interface IssueDetailProps {
  issue: Issue
  project: Project
}

export function IssueDetail({ issue: initialIssue, project }: IssueDetailProps) {
  const [issue, setIssue] = useState(initialIssue)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)
  const [commentText, setCommentText] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("[v0] Error fetching users:", err))

    fetch(`/api/issues/${issue.id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("[v0] Error fetching comments:", err))
  }, [issue.id])

  const handleUpdate = async (updates: Partial<Issue>) => {
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        const updated = await res.json()
        setIssue(updated)
      }
    } catch (error) {
      console.error("[v0] Error updating issue:", error)
    }
  }

  const handleSaveEdit = () => {
    handleUpdate({ title, description })
    setIsEditing(false)
  }

  const handleDelete = () => {
    alert("Delete functionality requires additional API endpoint")
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || users.length === 0) return

    try {
      const res = await fetch(`/api/issues/${issue.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText,
          userId: users[0].id, // Use first user as comment author
        }),
      })

      if (res.ok) {
        const newComment = await res.json()
        setComments((prev) => [...prev, newComment])
        setCommentText("")
      }
    } catch (error) {
      console.error("[v0] Error adding comment:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const currentUser = users[0] || { id: "user-1", name: "User", email: "user@example.com", avatar: "/user-avatar.jpg" }

  return (
    <>
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/project/${project.id}`}>
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <IssueTypeIcon type={issue.type} className="h-5 w-5 text-muted-foreground" />
              <span className="font-mono text-sm text-muted-foreground">{issue.key}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Description */}
            <Card className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xl font-semibold" />
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Add a description..."
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit}>Save</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTitle(issue.title)
                        setDescription(issue.description)
                        setIsEditing(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-foreground text-balance">{issue.title}</h1>
                  {issue.description ? (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {issue.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No description provided</p>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </div>
              )}
            </Card>

            {/* Comments */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Comments</h2>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                      <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{comment.user.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && <p className="text-sm text-muted-foreground italic">No comments yet</p>}

                <Separator className="my-4" />

                {/* Add Comment */}
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                    />
                    <Button onClick={handleAddComment} size="sm" disabled={!commentText.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide">Details</h2>
              <div className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Status</Label>
                  <Select
                    value={issue.status}
                    onValueChange={(value) => handleUpdate({ status: value as IssueStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="in-review">In Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Type</Label>
                  <Select value={issue.type} onValueChange={(value) => handleUpdate({ type: value as IssueType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Priority</Label>
                  <Select
                    value={issue.priority}
                    onValueChange={(value) => handleUpdate({ priority: value as IssuePriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highest">
                        <div className="flex items-center gap-2">
                          <PriorityIcon priority="highest" />
                          Highest
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <PriorityIcon priority="high" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <PriorityIcon priority="medium" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <PriorityIcon priority="low" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="lowest">
                        <div className="flex items-center gap-2">
                          <PriorityIcon priority="lowest" />
                          Lowest
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Assignee */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Assignee</Label>
                  <Select
                    value={issue.assignee?.id || "unassigned"}
                    onValueChange={(value) => {
                      handleUpdate({ assigneeId: value === "unassigned" ? null : value })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reporter */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Reporter</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={issue.reporter.avatar || "/placeholder.svg"} alt={issue.reporter.name} />
                      <AvatarFallback className="text-xs">{issue.reporter.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{issue.reporter.name}</span>
                  </div>
                </div>

                <Separator />

                {/* Dates */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Created</Label>
                  <p className="text-sm">{formatDate(issue.createdAt)}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Updated</Label>
                  <p className="text-sm">{formatDate(issue.updatedAt)}</p>
                </div>
              </div>
            </Card>

            {/* Delete Button */}
            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Issue
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
