"use client"

import { useState, useEffect } from "react"
import type { Issue, Project } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IssueTypeIcon } from "@/components/issue-type-icon"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import Link from "next/link"

interface CalendarViewProps {
  project: Project
  initialIssues: Issue[]
}

export function CalendarView({ project, initialIssues }: CalendarViewProps) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getIssuesForDate = (day: number) => {
    const date = new Date(year, month, day)
    return issues.filter((issue) => {
      const issueDate = new Date(issue.createdAt)
      return (
        issueDate.getDate() === date.getDate() &&
        issueDate.getMonth() === date.getMonth() &&
        issueDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-48 text-center">{monthName}</span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayIssues = getIssuesForDate(day)
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear()

            return (
              <div
                key={day}
                className={`aspect-square border rounded p-1 ${isToday ? "bg-primary/10 border-primary" : ""}`}
              >
                <div className="text-xs font-medium mb-1">{day}</div>
                <div className="space-y-1 overflow-hidden">
                  {dayIssues.slice(0, 2).map((issue) => (
                    <Link key={issue.id} href={`/issue/${issue.id}`}>
                      <div className="flex items-center gap-1 p-1 rounded hover:bg-muted cursor-pointer">
                        <IssueTypeIcon type={issue.type} className="h-3 w-3 flex-shrink-0" />
                        <span className="text-xs truncate">{issue.key}</span>
                      </div>
                    </Link>
                  ))}
                  {dayIssues.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">+{dayIssues.length - 2}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

