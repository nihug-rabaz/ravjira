"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, EyeOff } from "lucide-react"

interface IssueWatchersProps {
  issueId: string
}

export function IssueWatchers({ issueId }: IssueWatchersProps) {
  const [watchers, setWatchers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isWatching, setIsWatching] = useState(false)

  useEffect(() => {
    fetchWatchers()
    fetchCurrentUser()
  }, [issueId])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const user = await res.json()
      setCurrentUser(user)
      if (user) {
        checkWatching(user.id)
      }
    } catch (error) {
      console.error("[v0] Error fetching current user:", error)
    }
  }

  const fetchWatchers = async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/watchers`)
      const data = await res.json()
      setWatchers(data)
    } catch (error) {
      console.error("[v0] Error fetching watchers:", error)
    }
  }

  const checkWatching = async (userId: string) => {
    const watcherIds = watchers.map((w) => w.id)
    setIsWatching(watcherIds.includes(userId))
  }

  const toggleWatch = async () => {
    if (!currentUser) return
    try {
      if (isWatching) {
        await fetch(`/api/issues/${issueId}/watchers?userId=${currentUser.id}`, { method: "DELETE" })
      } else {
        await fetch(`/api/issues/${issueId}/watchers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id }),
        })
      }
      fetchWatchers()
      setIsWatching(!isWatching)
    } catch (error) {
      console.error("[v0] Error toggling watch:", error)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Watchers ({watchers.length})</h4>
        {currentUser && (
          <Button variant="ghost" size="sm" onClick={toggleWatch}>
            {isWatching ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {watchers.map((watcher) => (
          <Avatar key={watcher.id} className="h-6 w-6">
            <AvatarImage src={watcher.avatar || "/placeholder.svg"} alt={watcher.name} />
            <AvatarFallback className="text-xs">{watcher.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  )
}

