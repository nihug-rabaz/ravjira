"use client"

import { useState, useEffect } from "react"
import type { TimeLog, IssueEstimate, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Clock, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TimeTrackingProps {
  issueId: string
  currentUser: User | null
}

export function TimeTracking({ issueId, currentUser }: TimeTrackingProps) {
  const [logs, setLogs] = useState<TimeLog[]>([])
  const [estimate, setEstimate] = useState<IssueEstimate | null>(null)
  const [isLogging, setIsLogging] = useState(false)
  const [timeSpent, setTimeSpent] = useState("")
  const [description, setDescription] = useState("")
  const [originalEstimate, setOriginalEstimate] = useState("")
  const [remainingEstimate, setRemainingEstimate] = useState("")

  useEffect(() => {
    fetchTimeTracking()
  }, [issueId])

  const fetchTimeTracking = async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/time-tracking`)
      const data = await res.json()
      setLogs(data.logs || [])
      setEstimate(data.estimate)
      if (data.estimate) {
        setOriginalEstimate(data.estimate.originalEstimate?.toString() || "")
        setRemainingEstimate(data.estimate.remainingEstimate?.toString() || "")
      }
    } catch (error) {
      console.error("[v0] Error fetching time tracking:", error)
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const parseTime = (timeStr: string): number => {
    const str = timeStr.trim().toLowerCase()
    if (!str) return 0

    let totalMinutes = 0
    const hourMatch = str.match(/(\d+)h/)
    const minuteMatch = str.match(/(\d+)m/)

    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1])

    return totalMinutes
  }

  const handleLogTime = async () => {
    if (!currentUser || !timeSpent.trim()) return

    const minutes = parseTime(timeSpent)
    if (minutes <= 0) {
      alert("Please enter a valid time (e.g., 2h 30m or 150m)")
      return
    }

    try {
      const res = await fetch(`/api/issues/${issueId}/time-tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeSpent: minutes,
          description: description.trim() || undefined,
        }),
      })

      if (res.ok) {
        await fetchTimeTracking()
        setTimeSpent("")
        setDescription("")
        setIsLogging(false)
      }
    } catch (error) {
      console.error("[v0] Error logging time:", error)
      alert("Failed to log time")
    }
  }

  const handleUpdateEstimate = async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/time-tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalEstimate: originalEstimate ? parseTime(originalEstimate) : undefined,
          remainingEstimate: remainingEstimate ? parseTime(remainingEstimate) : undefined,
        }),
      })

      if (res.ok) {
        await fetchTimeTracking()
      }
    } catch (error) {
      console.error("[v0] Error updating estimate:", error)
    }
  }

  const totalLogged = logs.reduce((sum, log) => sum + log.timeSpent, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Tracking
        </h3>
        {currentUser && !isLogging && (
          <Button variant="outline" size="sm" onClick={() => setIsLogging(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Time
          </Button>
        )}
      </div>

      {isLogging && currentUser && (
        <Card className="p-4 space-y-3">
          <div className="space-y-2">
            <Label>Time Spent (e.g., 2h 30m or 150m)</Label>
            <Input
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder="2h 30m"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you work on?"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleLogTime} disabled={!timeSpent.trim()}>
              Log Time
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLogging(false)
                setTimeSpent("")
                setDescription("")
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Original Estimate</div>
            <div className="font-semibold">
              {estimate?.originalEstimate ? formatTime(estimate.originalEstimate) : "-"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Time Spent</div>
            <div className="font-semibold">{formatTime(totalLogged)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Remaining</div>
            <div className="font-semibold">
              {estimate?.remainingEstimate ? formatTime(estimate.remainingEstimate) : "-"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Estimates</Label>
          <div className="flex gap-2">
            <Input
              value={originalEstimate}
              onChange={(e) => setOriginalEstimate(e.target.value)}
              placeholder="Original (e.g., 8h)"
              className="flex-1"
              onBlur={handleUpdateEstimate}
            />
            <Input
              value={remainingEstimate}
              onChange={(e) => setRemainingEstimate(e.target.value)}
              placeholder="Remaining (e.g., 4h)"
              className="flex-1"
              onBlur={handleUpdateEstimate}
            />
          </div>
        </div>

        {logs.length > 0 && (
          <div className="space-y-2">
            <Label>Time Logs</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    {log.user && (
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={log.user.avatar} />
                        <AvatarFallback className="text-xs">{log.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <span className="font-medium">{formatTime(log.timeSpent)}</span>
                    {log.description && (
                      <span className="text-muted-foreground">- {log.description}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.loggedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


