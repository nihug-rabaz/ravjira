"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { IssueStatus, IssuePriority, IssueType } from "@/lib/types"
import { Trash2, Edit } from "lucide-react"

interface BulkOperationsProps {
  selectedIssues: string[]
  onComplete: () => void
}

export function BulkOperations({ selectedIssues, onComplete }: BulkOperationsProps) {
  const [open, setOpen] = useState(false)
  const [operation, setOperation] = useState<"update" | "delete">("update")
  const [status, setStatus] = useState<IssueStatus | "">("")
  const [priority, setPriority] = useState<IssuePriority | "">("")
  const [type, setType] = useState<IssueType | "">("")

  const handleBulkUpdate = async () => {
    try {
      const updates: any = {}
      if (status) updates.status = status
      if (priority) updates.priority = priority
      if (type) updates.type = type

      if (Object.keys(updates).length === 0) {
        alert("Please select at least one field to update")
        return
      }

      const res = await fetch("/api/issues/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueIds: selectedIssues, updates }),
      })

      if (res.ok) {
        setOpen(false)
        onComplete()
      } else {
        alert("Failed to update issues")
      }
    } catch (error) {
      console.error("[v0] Error performing bulk update:", error)
      alert("Failed to update issues")
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIssues.length} issue(s)? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch("/api/issues/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueIds: selectedIssues }),
      })

      if (res.ok) {
        setOpen(false)
        onComplete()
      } else {
        alert("Failed to delete issues")
      }
    } catch (error) {
      console.error("[v0] Error performing bulk delete:", error)
      alert("Failed to delete issues")
    }
  }

  if (selectedIssues.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Edit className="h-4 w-4 mr-2" />
        Bulk Actions ({selectedIssues.length})
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Operations ({selectedIssues.length} issues)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Operation</Label>
            <Select value={operation} onValueChange={(v) => setOperation(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {operation === "update" && (
            <>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No change</SelectItem>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No change</SelectItem>
                    <SelectItem value="lowest">Lowest</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="highest">Highest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No change</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkUpdate}>Update Issues</Button>
              </div>
            </>
          )}

          {operation === "delete" && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Issues
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

