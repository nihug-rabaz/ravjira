"use client"

import { useState, useEffect } from "react"
import type { Subtask } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus } from "lucide-react"

interface SubtasksListProps {
  issueId: string
}

export function SubtasksList({ issueId }: SubtasksListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchSubtasks()
  }, [issueId])

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

  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done"

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
        <h3 className="text-lg font-semibold">Subtasks</h3>
        {!isAdding && (
          <Button variant="default" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subtask
          </Button>
        )}
      </div>
      
      {totalCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {completedCount} of {totalCount} completed
        </p>
      )}

      {isAdding && (
        <div className="flex gap-2">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Add a subtask..."
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
            Add
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
          <p className="text-sm text-muted-foreground mb-2">No subtasks yet</p>
          <p className="text-xs text-muted-foreground">Click "Add Subtask" to create one</p>
        </div>
      ) : null}
      
      {subtasks.length > 0 && (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2 group">
              <Checkbox
                checked={subtask.status === "done"}
                onCheckedChange={() => handleToggleSubtask(subtask.id, subtask.status)}
              />
              <span
                className={`flex-1 text-sm ${
                  subtask.status === "done" ? "line-through text-muted-foreground" : ""
                }`}
              >
                {subtask.title}
              </span>
              <button
                onClick={() => handleDeleteSubtask(subtask.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

