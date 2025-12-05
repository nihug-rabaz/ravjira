"use client"

import { useState, useEffect } from "react"
import type { Attachment, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Paperclip, Download, Trash2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AttachmentsListProps {
  issueId: string
  currentUser: User | null
}

export function AttachmentsList({ issueId, currentUser }: AttachmentsListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchAttachments()
  }, [issueId])

  const fetchAttachments = async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/attachments`)
      const data = await res.json()
      setAttachments(data)
    } catch (error) {
      console.error("[v0] Error fetching attachments:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(`/api/issues/${issueId}/attachments`, {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const newAttachment = await res.json()
        setAttachments((prev) => [newAttachment, ...prev])
      }
    } catch (error) {
      console.error("[v0] Error uploading file:", error)
      alert("Failed to upload file")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) return

    try {
      const res = await fetch(`/api/issues/${issueId}/attachments?attachmentId=${attachmentId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
      }
    } catch (error) {
      console.error("[v0] Error deleting attachment:", error)
      alert("Failed to delete attachment")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Attachments</h3>
        {currentUser && (
          <label className="cursor-pointer">
            <Input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button variant="outline" size="sm" asChild disabled={isUploading}>
              <span>
                <Paperclip className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Attach"}
              </span>
            </Button>
          </label>
        )}
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No attachments</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline block truncate"
                    >
                      {attachment.filename}
                    </a>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      {attachment.user && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={attachment.user.avatar} />
                              <AvatarFallback className="text-xs">
                                {attachment.user?.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{attachment.user.name}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={attachment.filePath}
                    download={attachment.filename}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                  {currentUser && (currentUser.id === attachment.userId || currentUser.id === attachment.user?.id) && (
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="p-1 hover:bg-muted rounded text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}



