"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Issue, Project, IssueType, IssuePriority, IssueStatus, Comment, User, Label, IssueHistory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label as LabelComponent } from "@/components/ui/label"
import { IssueTypeIcon } from "@/components/issue-type-icon"
import { PriorityIcon } from "@/components/priority-icon"
import { ChevronLeft, Trash2, Send, Edit2, X, Tag, History, Github } from "lucide-react"
import { AttachmentsList } from "@/components/attachments-list"
import { SubtasksList } from "@/components/subtasks-list"
import { TimeTracking } from "@/components/time-tracking"

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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState("")
  const [labels, setLabels] = useState<Label[]>([])
  const [availableLabels, setAvailableLabels] = useState<Label[]>([])
  const [history, setHistory] = useState<IssueHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
        if (data.length > 0) setCurrentUser(data[0])
      })
      .catch((err) => console.error("[v0] Error fetching users:", err))

    fetch(`/api/issues/${issue.id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("[v0] Error fetching comments:", err))

    fetch(`/api/labels?projectId=${project.id}`)
      .then((res) => res.json())
      .then((data) => setAvailableLabels(data))
      .catch((err) => console.error("[v0] Error fetching labels:", err))

    fetch(`/api/issues/${issue.id}/labels`)
      .then((res) => res.json())
      .then((data) => setLabels(data))
      .catch((err) => console.error("[v0] Error fetching issue labels:", err))

    fetch(`/api/issues/${issue.id}/history`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("[v0] Error fetching history:", err))
  }, [issue.id, project.id])

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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push(`/project/${project.id}`)
      } else {
        alert("Failed to delete issue")
      }
    } catch (error) {
      console.error("[v0] Error deleting issue:", error)
      alert("Failed to delete issue")
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentUser) return

    try {
      const res = await fetch(`/api/issues/${issue.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText,
          userId: currentUser.id,
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

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditingCommentText(comment.content)
  }

  const handleSaveComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingCommentText }),
      })

      if (res.ok) {
        const updated = await res.json()
        setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)))
        setEditingCommentId(null)
        setEditingCommentText("")
      }
    } catch (error) {
      console.error("[v0] Error updating comment:", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch (error) {
      console.error("[v0] Error deleting comment:", error)
    }
  }

  const handleAddLabel = async (labelId: string) => {
    try {
      const res = await fetch(`/api/issues/${issue.id}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      })

      if (res.ok) {
        const label = availableLabels.find((l) => l.id === labelId)
        if (label) setLabels((prev) => [...prev, label])
      }
    } catch (error) {
      console.error("[v0] Error adding label:", error)
    }
  }

  const handleRemoveLabel = async (labelId: string) => {
    try {
      const res = await fetch(`/api/issues/${issue.id}/labels?labelId=${labelId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setLabels((prev) => prev.filter((l) => l.id !== labelId))
      }
    } catch (error) {
      console.error("[v0] Error removing label:", error)
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

      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Title and Description */}
            <Card className="p-4 sm:p-6">
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

            {/* Subtasks */}
            <Card className="p-4 sm:p-6 border-2 border-primary/20 bg-background">
              <SubtasksList issueId={issue.id} key={issue.id} />
            </Card>

            {/* Attachments */}
            <Card className="p-4 sm:p-6">
              <AttachmentsList issueId={issue.id} currentUser={currentUser} />
            </Card>

            {/* Comments */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Comments</h2>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                      <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{comment.user.name}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                          {comment.updatedAt !== comment.createdAt && (
                            <span className="text-xs text-muted-foreground italic">(edited)</span>
                          )}
                        </div>
                        {currentUser && currentUser.id === comment.userId && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditComment(comment)}
                              className="h-6 px-2"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="h-6 px-2 text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveComment(comment.id)}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCommentId(null)
                                setEditingCommentText("")
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground">{comment.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {comments.length === 0 && <p className="text-sm text-muted-foreground italic">No comments yet</p>}

                <Separator className="my-4" />

                {/* Add Comment */}
                {currentUser && (
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
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 mt-4 lg:mt-0">
            <Card className="p-4 sm:p-6">
              <TimeTracking issueId={issue.id} currentUser={currentUser} />
            </Card>

            <Card className="p-4 sm:p-6">
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide">Details</h2>
              <div className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <LabelComponent className="text-xs text-muted-foreground uppercase">Status</LabelComponent>
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
                  <LabelComponent className="text-xs text-muted-foreground uppercase">Type</LabelComponent>
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
                  <LabelComponent className="text-xs text-muted-foreground uppercase">Priority</LabelComponent>
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
                  <LabelComponent className="text-xs text-muted-foreground uppercase">Assignee</LabelComponent>
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
                  <LabelComponent className="text-xs text-muted-foreground uppercase">Reporter</LabelComponent>
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
                  <LabelComponent className="text-xs text-muted-foreground uppercase">Created</LabelComponent>
                  <p className="text-sm">{formatDate(issue.createdAt)}</p>
                </div>

                <div className="space-y-2">
                  <LabelComponent className="text-xs text-muted-foreground uppercase">Updated</LabelComponent>
                  <p className="text-sm">{formatDate(issue.updatedAt)}</p>
                </div>
              </div>
            </Card>

            {/* History Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-2" />
              {showHistory ? "Hide" : "Show"} History
            </Button>

            {/* GitHub Integration */}
            {project.githubRepos && project.githubRepos.length > 0 && (
              <div className="space-y-2">
                <Label>Create Issue on GitHub</Label>
                {project.githubRepos.map((repo) => (
                  <Button
                    key={repo.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/issues/${issue.id}/github?repoId=${repo.id}`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({}),
                        })

                        if (res.ok) {
                          const data = await res.json()
                          alert(`Issue created on GitHub!\n${data.githubIssueUrl}`)
                          window.open(data.githubIssueUrl, "_blank")
                        } else {
                          const error = await res.json()
                          alert(error.error || "Failed to create GitHub issue")
                        }
                      } catch (error) {
                        console.error("[v0] Error creating GitHub issue:", error)
                        alert("Failed to create GitHub issue")
                      }
                    }}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    <span className="truncate">{repo.githubOwner}/{repo.githubRepo}</span>
                  </Button>
                ))}
              </div>
            )}

            {/* Delete Button */}
            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Issue
            </Button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No activity yet</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={item.user?.avatar || "/placeholder.svg"}
                        alt={item.user?.name || "User"}
                      />
                      <AvatarFallback className="text-xs">
                        {item.user?.name.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="font-semibold">{item.user?.name || "Unknown"}</span>
                      {" changed "}
                      <span className="font-semibold">{item.field}</span>
                      {item.oldValue && (
                        <>
                          {" from "}
                          <span className="text-muted-foreground">{item.oldValue}</span>
                        </>
                      )}
                      {item.newValue && (
                        <>
                          {" to "}
                          <span className="text-muted-foreground">{item.newValue}</span>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </main>
    </>
  )
}
