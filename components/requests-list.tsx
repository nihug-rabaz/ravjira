"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, User, Phone, Building, FileText, CheckCircle2, XCircle } from "lucide-react"
import type { Request } from "@/lib/types"
import { useRouter } from "next/navigation"

export function RequestsList() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{ status?: string; platform?: string }>({})
  const [takingRequestId, setTakingRequestId] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [filter])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append("status", filter.status)
      if (filter.platform) params.append("platform", filter.platform)

      const res = await fetch(`/api/requests?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTakeRequest = async (requestId: string) => {
    if (!confirm("האם אתה בטוח שאתה רוצה לקחת את הבקשה הזו? זה ייצור פרויקט חדש.")) {
      return
    }

    setTakingRequestId(requestId)
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "take" }),
      })

      if (res.ok) {
        const data = await res.json()
        alert("הבקשה נלקחה בהצלחה! פרויקט חדש נוצר.")
        router.push(`/project/${data.projectId}`)
      } else {
        const error = await res.json()
        alert(error.error || "שגיאה בנטילת הבקשה")
      }
    } catch (error) {
      console.error("[v0] Error taking request:", error)
      alert("שגיאה בנטילת הבקשה")
    } finally {
      setTakingRequestId(null)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    if (!confirm("האם אתה בטוח שאתה רוצה לדחות את הבקשה הזו?")) {
      return
    }

    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      })

      if (res.ok) {
        fetchRequests()
      } else {
        alert("שגיאה בדחיית הבקשה")
      }
    } catch (error) {
      console.error("[v0] Error rejecting request:", error)
      alert("שגיאה בדחיית הבקשה")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">אין בקשות זמינות</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Select
          value={filter.status || "pending"}
          onValueChange={(value) => setFilter({ ...filter, status: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="pending">ממתין</SelectItem>
            <SelectItem value="taken">נלקח</SelectItem>
            <SelectItem value="completed">הושלם</SelectItem>
            <SelectItem value="rejected">נדחה</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filter.platform || "all"}
          onValueChange={(value) => setFilter({ ...filter, platform: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="פלטפורמה" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הפלטפורמות</SelectItem>
            <SelectItem value="civilian">אזרחי</SelectItem>
            <SelectItem value="military">צה"לי</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{request.requesterName}</CardTitle>
                    <Badge
                      variant={
                        request.platform === "military"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {request.platform === "military" ? "צה\"לי" : "אזרחי"}
                    </Badge>
                    <Badge variant="outline">
                      {request.requestType === "website"
                        ? "אתר"
                        : request.requestType === "software"
                        ? "תוכנה"
                        : "אחר"}
                    </Badge>
                    {request.status === "pending" && (
                      <Badge variant="secondary">ממתין</Badge>
                    )}
                    {request.status === "taken" && (
                      <Badge variant="default">נלקח</Badge>
                    )}
                    {request.status === "completed" && (
                      <Badge className="bg-green-500">הושלם</Badge>
                    )}
                    {request.status === "rejected" && (
                      <Badge variant="destructive">נדחה</Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {request.personalNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {request.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {request.phone}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">אפיון:</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t">
                  {request.status === "pending" && (
                    <>
                      <Button
                        onClick={() => handleTakeRequest(request.id)}
                        disabled={takingRequestId === request.id}
                        className="flex-1"
                      >
                        {takingRequestId === request.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            מעבד...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            קח את הבקשה
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        דחה
                      </Button>
                    </>
                  )}
                  {request.status === "taken" && request.projectId && (
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/project/${request.projectId}`)}
                      className="flex-1"
                    >
                      צפה בפרויקט
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}



