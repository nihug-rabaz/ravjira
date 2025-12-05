"use client"

import { useState, useEffect } from "react"
import type { IssueLink, Issue } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Plus, X, Link2 } from "lucide-react"

interface IssueLinksProps {
  issueId: string
}

export function IssueLinks({ issueId }: IssueLinksProps) {
  const [links, setLinks] = useState<IssueLink[]>([])
  const [open, setOpen] = useState(false)
  const [linkType, setLinkType] = useState<IssueLink["linkType"]>("relates")
  const [targetKey, setTargetKey] = useState("")

  useEffect(() => {
    fetchLinks()
  }, [issueId])

  const fetchLinks = async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/links`)
      const data = await res.json()
      setLinks(data)
    } catch (error) {
      console.error("[v0] Error fetching links:", error)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/search?q=${targetKey}`)
      const results = await res.json()
      if (results.issues && results.issues.length > 0) {
        const targetIssue = results.issues[0]
        await fetch(`/api/issues/${issueId}/links`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetIssueId: targetIssue.id, linkType }),
        })
        setTargetKey("")
        setOpen(false)
        fetchLinks()
      }
    } catch (error) {
      console.error("[v0] Error creating link:", error)
    }
  }

  const handleDelete = async (linkId: string) => {
    try {
      await fetch(`/api/issues/${issueId}/links/${linkId}`, { method: "DELETE" })
      fetchLinks()
    } catch (error) {
      console.error("[v0] Error deleting link:", error)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Links</h4>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Issue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Link Type</label>
                <Select value={linkType} onValueChange={(v) => setLinkType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relates">Relates to</SelectItem>
                    <SelectItem value="blocks">Blocks</SelectItem>
                    <SelectItem value="is blocked by">Is blocked by</SelectItem>
                    <SelectItem value="duplicates">Duplicates</SelectItem>
                    <SelectItem value="is duplicated by">Is duplicated by</SelectItem>
                    <SelectItem value="depends on">Depends on</SelectItem>
                    <SelectItem value="is depended on by">Is depended on by</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Issue Key</label>
                <Input value={targetKey} onChange={(e) => setTargetKey(e.target.value)} placeholder="PROJ-123" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!targetKey}>
                  Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-1">
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between text-sm p-2 border rounded">
            <span>
              <Link2 className="h-3 w-3 inline mr-1" />
              {link.linkType} {link.targetIssueId}
            </span>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(link.id)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

