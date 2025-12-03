"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function RequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    requesterName: "",
    personalNumber: "",
    department: "",
    phone: "",
    platform: "" as "civilian" | "military" | "",
    requestType: "" as "website" | "software" | "other" | "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSuccess(true)
        setFormData({
          requesterName: "",
          personalNumber: "",
          department: "",
          phone: "",
          platform: "",
          requestType: "",
          description: "",
        })
      } else {
        const error = await res.json()
        alert(error.error || "שגיאה בשליחת הבקשה")
      }
    } catch (error) {
      console.error("[v0] Error submitting request:", error)
      alert("שגיאה בשליחת הבקשה")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">הבקשה נשלחה בהצלחה!</CardTitle>
            <CardDescription>
              הבקשה שלך התקבלה ותיבדק על ידי הצוות. ניצור איתך קשר בהקדם.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setSuccess(false)
                router.push("/")
              }}
              className="w-full"
            >
              חזרה לדף הבית
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">טופס בקשה לפיתוח</CardTitle>
            <CardDescription>
              מלא את הפרטים הבאים כדי לבקש פיתוח אתר או תוכנה. הבקשה תיבדק ותטופל על ידי הצוות.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="requesterName">שם מבקש *</Label>
                  <Input
                    id="requesterName"
                    value={formData.requesterName}
                    onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                    required
                    placeholder="הכנס שם מלא"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personalNumber">מספר אישי *</Label>
                  <Input
                    id="personalNumber"
                    value={formData.personalNumber}
                    onChange={(e) => setFormData({ ...formData, personalNumber: e.target.value })}
                    required
                    placeholder="מספר אישי"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">מדור *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    placeholder="שם המדור"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">מספר טלפון *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="05X-XXXXXXX"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform">פלטפורמה *</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value: "civilian" | "military") =>
                      setFormData({ ...formData, platform: value })
                    }
                    required
                  >
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="בחר פלטפורמה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="civilian">אזרחי</SelectItem>
                      <SelectItem value="military">צה"לי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestType">סוג בקשה *</Label>
                  <Select
                    value={formData.requestType}
                    onValueChange={(value: "website" | "software" | "other") =>
                      setFormData({ ...formData, requestType: value })
                    }
                    required
                  >
                    <SelectTrigger id="requestType">
                      <SelectValue placeholder="בחר סוג בקשה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">אתר</SelectItem>
                      <SelectItem value="software">תוכנה</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">אפיון קצר *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="תאר את הבקשה שלך בפירוט..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  נא לתאר את הבקשה בפירוט: מה המטרה, מה התכונות הנדרשות, וכל מידע רלוונטי אחר.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    שולח...
                  </>
                ) : (
                  "שלח בקשה"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

