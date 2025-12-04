"use client"

import { useState, useEffect } from "react"
import type { User, Project } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"

interface TeamDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeamDialog({ project, open, onOpenChange }: TeamDialogProps) {
  const [members, setMembers] = useState<User[]>([])

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open, project.id])

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching members:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </DialogTitle>
          <DialogDescription>
            Manage team members for {project.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No team members yet
              </p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


