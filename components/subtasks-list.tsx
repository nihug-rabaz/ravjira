"use client"

import { useState, useEffect } from "react"
import type { Subtask, User, IssuePriority } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PriorityIcon } from "@/components/priority-icon"
import { X, Plus, Edit2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface SubtasksListProps {
  issueId: string
}

export function SubtasksList({ issueId }: SubtasksListProps) {
  const { t } = useLanguage()
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [editingStatus, setEditingStatus] = useState<"todo" | "in-progress" | "done">("todo")
  const [editingAssignee, setEditingAssignee] = useState<string>("")
  const [editingPriority, setEditingPriority] = useState<IssuePriority>("medium")

  useEffect(() => {
    fetchSubtasks()
    fetchUsers()
  }, [issueId])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
    }
  }

  const fetchSubtasks = async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/subtasks`)
      if (!res.ok) {
        console.error("[v0] Failed to fetch subtasks:", res.status, res.statusText)
        return
      }
      const data = await res.json()
      setSubtasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[v0] Error fetching subtasks:", error)
    }
  }

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return

    try {
      const res = await fetch(`/api/issues/${issueId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSubtaskTitle }),
      })

      if (res.ok) {
        const newSubtask = await res.json()
        setSubtasks((prev) => [...prev, newSubtask])
        setNewSubtaskTitle("")
        setIsAdding(false)
      }
    } catch (error) {
      console.error("[v0] Error creating subtask:", error)
    }
  }

  const handleEdit = (subtask: Subtask) => {
    setEditingId(subtask.id)
    setEditingTitle(subtask.title)
    setEditingStatus(subtask.status)
    setEditingAssignee(subtask.assigneeId || "")
    setEditingPriority(subtask.priority || "medium")
  }

  const handleSaveEdit = async (subtaskId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/subtasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtaskId,
          title: editingTitle,
          status: editingStatus,
          assigneeId: editingAssignee || null,
          priority: editingPriority,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setSubtasks((prev) => prev.map((s) => (s.id === subtaskId ? updated : s)))
        setEditingId(null)
      }
    } catch (error) {
      console.error("[v0] Error updating subtask:", error)
    }
  }

  const handleToggleStatus = async (subtaskId: string, currentStatus: string) => {
    let newStatus: "todo" | "in-progress" | "done"
    if (currentStatus === "todo") {
      newStatus = "in-progress"
    } else if (currentStatus === "in-progress") {
      newStatus = "done"
    } else {
      newStatus = "todo"
    }

    try {
      const res = await fetch(`/api/issues/${issueId}/subtasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtaskId, status: newStatus }),
      })

      if (res.ok) {
        const updated = await res.json()
        setSubtasks((prev) => prev.map((s) => (s.id === subtaskId ? updated : s)))
      }
    } catch (error) {
      console.error("[v0] Error updating subtask:", error)
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/subtasks?subtaskId=${subtaskId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId))
      }
    } catch (error) {
      console.error("[v0] Error deleting subtask:", error)
    }
  }

  const completedCount = subtasks.filter((s) => s.status === "done").length
  const totalCount = subtasks.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-semibold">{t("subtask.title")}</h3>
        {!isAdding && (
          <Button variant="default" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("subtask.add")}
          </Button>
        )}
      </div>

      {totalCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          <span>
            {completedCount} {t("subtask.of")} {totalCount} {t("subtask.completed")}
          </span>
        </div>
      )}

      {isAdding && (
        <div className="flex gap-2">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder={t("subtask.placeholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddSubtask()
              } else if (e.key === "Escape") {
                setIsAdding(false)
                setNewSubtaskTitle("")
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>
            {t("common.add")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false)
              setNewSubtaskTitle("")
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {subtasks.length === 0 && !isAdding ? (
        <div className="text-center py-6 border-2 border-dashed rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground mb-2">{t("subtask.noSubtasks")}</p>
        </div>
      ) : null}

      {subtasks.length > 0 && (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`flex items-center gap-3 p-2 rounded border ${
                subtask.status === "done" ? "bg-muted/50" : "bg-background"
              }`}
            >
              <Select
                value={subtask.status}
                onValueChange={(v) => handleToggleStatus(subtask.id, subtask.status)}
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">{t("status.todo")}</SelectItem>
                  <SelectItem value="in-progress">{t("status.in-progress")}</SelectItem>
                  <SelectItem value="done">{t("status.done")}</SelectItem>
                </SelectContent>
              </Select>

              {editingId === subtask.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Select value={editingPriority} onValueChange={(v) => setEditingPriority(v as IssuePriority)}>
                    <SelectTrigger className="w-[100px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lowest">{t("priority.lowest")}</SelectItem>
                      <SelectItem value="low">{t("priority.low")}</SelectItem>
                      <SelectItem value="medium">{t("priority.medium")}</SelectItem>
                      <SelectItem value="high">{t("priority.high")}</SelectItem>
                      <SelectItem value="highest">{t("priority.highest")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={editingAssignee} onValueChange={setEditingAssignee}>
                    <SelectTrigger className="w-[150px] h-8">
                      <SelectValue placeholder={t("issue.assignee")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t("common.all")}</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => handleSaveEdit(subtask.id)}>
                    {t("common.save")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    {t("common.cancel")}
                  </Button>
                </div>
              ) : (
                <>
                  <PriorityIcon priority={subtask.priority || "medium"} />
                  <span
                    className={`flex-1 text-sm ${
                      subtask.status === "done" ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {subtask.title}
                  </span>
                  {subtask.assignee && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={subtask.assignee.avatar || "/placeholder.svg"} alt={subtask.assignee.name} />
                      <AvatarFallback className="text-xs">{subtask.assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(subtask)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
