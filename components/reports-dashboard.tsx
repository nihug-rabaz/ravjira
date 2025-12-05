"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface ReportsDashboardProps {
  projectId?: string
}

export function ReportsDashboard({ projectId }: ReportsDashboardProps) {
  const [reportType, setReportType] = useState("overview")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [reportType, projectId])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const url = `/api/reports?type=${reportType}${projectId ? `&projectId=${projectId}` : ""}`
      const res = await fetch(url)
      const reportData = await res.json()
      setData(reportData)
    } catch (error) {
      console.error("[v0] Error fetching report:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading report...</div>
  }

  if (reportType === "overview" && data?.stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Reports</h2>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="assignee">By Assignee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{data.stats.total_issues || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Backlog
            </div>
            <div className="text-2xl font-bold">{data.stats.backlog_count || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">To Do</div>
            <div className="text-2xl font-bold">{data.stats.todo_count || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">In Progress</div>
            <div className="text-2xl font-bold">{data.stats.in_progress_count || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Done
            </div>
            <div className="text-2xl font-bold">{data.stats.done_count || 0}</div>
          </Card>
        </div>

        {data.byType && data.byType.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Issues by Type</h3>
            <div className="space-y-2">
              {data.byType.map((item: any) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="capitalize">{item.type}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {data.byPriority && data.byPriority.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Issues by Priority</h3>
            <div className="space-y-2">
              {data.byPriority.map((item: any) => (
                <div key={item.priority} className="flex items-center justify-between">
                  <span className="capitalize">{item.priority}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    )
  }

  if (reportType === "assignee" && Array.isArray(data)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Reports</h2>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="assignee">By Assignee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {data.map((assignee: any) => (
            <Card key={assignee.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {assignee?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="font-semibold">{assignee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {assignee.open_issues} open, {assignee.closed_issues} closed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{assignee.total_issues}</div>
                  <div className="text-xs text-muted-foreground">total issues</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return null
}



