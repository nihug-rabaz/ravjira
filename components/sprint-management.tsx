"use client"

import { useState, useEffect } from "react"
import type { Sprint, Issue } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar } from "lucide-react"

interface SprintManagementProps {
  projectId: string
}

export function SprintManagement({ projectId }: SprintManagementProps) {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [goal, setGoal] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<"future" | "active" | "closed">("future")

  useEffect(() => {
    fetchSprints()
  }, [projectId])

  const fetchSprints = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints`)
      const data = await res.json()
      setSprints(data)
    } catch (error) {
      console.error("[v0] Error fetching sprints:", error)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, goal, startDate, endDate, status }),
      })
      if (res.ok) {
        setName("")
        setGoal("")
        setStartDate("")
        setEndDate("")
        setStatus("future")
        setOpen(false)
        fetchSprints()
      }
    } catch (error) {
      console.error("[v0] Error creating sprint:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sprints</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Sprint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sprint</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="goal">Goal</Label>
                <Textarea id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="future">Future</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!name}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {sprints.map((sprint) => (
          <div key={sprint.id} className="p-3 border rounded">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{sprint.name}</h4>
                {sprint.goal && <p className="text-sm text-muted-foreground">{sprint.goal}</p>}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  {sprint.startDate && (
                    <span>
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {sprint.startDate} - {sprint.endDate || "TBD"}
                    </span>
                  )}
                  <span className="capitalize">{sprint.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

