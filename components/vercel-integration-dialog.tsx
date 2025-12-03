"use client"

import { useState, useEffect } from "react"
import type { Project, VercelProject } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExternalLink, X, Loader2, Trash2, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

interface VercelProjectOption {
  id: string
  name: string
  accountId: string
  teamId: string
  url: string
  framework: string
  createdAt: number
}

interface VercelIntegrationDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VercelIntegrationDialog({ project, open, onOpenChange }: VercelIntegrationDialogProps) {
  const [vercelProjects, setVercelProjects] = useState<VercelProjectOption[]>([])
  const [connectedProjects, setConnectedProjects] = useState<VercelProject[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [removingProjectId, setRemovingProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchConnectedProjects()
      fetchVercelProjects()
    }
  }, [open, project.id])

  const fetchConnectedProjects = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/vercel`)
      if (res.ok) {
        const data = await res.json()
        setConnectedProjects(data.vercelProjects || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching connected Vercel projects:", error)
    }
  }

  const fetchVercelProjects = async () => {
    setLoadingProjects(true)
    try {
      const res = await fetch("/api/vercel/projects")
      if (res.ok) {
        const data = await res.json()
        setVercelProjects(data)
      } else {
        console.error("[v0] Failed to fetch Vercel projects")
      }
    } catch (error) {
      console.error("[v0] Error fetching Vercel projects:", error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleConnect = async () => {
    if (!selectedProject) return

    setLoading(true)
    try {
      const selected = vercelProjects.find((p) => p.id === selectedProject)
      if (!selected) {
        alert("Invalid project selected")
        setLoading(false)
        return
      }

      const res = await fetch(`/api/projects/${project.id}/vercel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vercelProjectId: selected.id,
          vercelProjectName: selected.name,
          vercelUrl: selected.url,
        }),
      })

      if (res.ok) {
        await fetchConnectedProjects()
        setSelectedProject("")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to connect Vercel project")
      }
    } catch (error) {
      console.error("[v0] Error connecting Vercel:", error)
      alert("Failed to connect Vercel project")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (vpId: string) => {
    if (!confirm("Are you sure you want to disconnect this Vercel project?")) return

    const vp = connectedProjects.find((p) => p.id === vpId)
    if (!vp) return

    setRemovingProjectId(vpId)
    try {
      const res = await fetch(`/api/projects/${project.id}/vercel?vercelProjectId=${vp.vercelProjectId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchConnectedProjects()
      } else {
        alert("Failed to disconnect Vercel project")
      }
    } catch (error) {
      console.error("[v0] Error disconnecting Vercel project:", error)
      alert("Failed to disconnect Vercel project")
    } finally {
      setRemovingProjectId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Vercel Integration
          </DialogTitle>
          <DialogDescription>
            Connect Vercel projects to this project to track deployments and previews.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {connectedProjects.length > 0 && (
            <div className="space-y-2">
              <Label>Connected Vercel Projects ({connectedProjects.length})</Label>
              <div className="space-y-2">
                {connectedProjects.map((vp) => (
                  <Card key={vp.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Zap className="h-4 w-4 shrink-0 text-black dark:text-white" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{vp.vercelProjectName}</p>
                          {vp.vercelUrl && (
                            <a
                              href={vp.vercelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                            >
                              {vp.vercelUrl}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(vp.id)}
                        disabled={removingProjectId === vp.id}
                        className="shrink-0"
                      >
                        {removingProjectId === vp.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vercelProjectSelect">Select Vercel Project</Label>
                {loadingProjects ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading Vercel projects...</span>
                  </div>
                ) : (
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger id="vercelProjectSelect">
                      <SelectValue placeholder="Select a Vercel project" />
                    </SelectTrigger>
                    <SelectContent>
                      {vercelProjects
                        .filter((vp) => !connectedProjects.some((cp) => cp.vercelProjectId === vp.id))
                        .map((vp) => (
                          <SelectItem key={vp.id} value={vp.id}>
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              <span className="font-medium">{vp.name}</span>
                              {vp.framework && (
                                <span className="text-xs text-muted-foreground">({vp.framework})</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
                {vercelProjects.length === 0 && !loadingProjects && (
                  <p className="text-xs text-muted-foreground">
                    No Vercel projects found. Make sure you have projects in your Vercel team.
                  </p>
                )}
              </div>
              <Button
                onClick={handleConnect}
                disabled={loading || !selectedProject || loadingProjects}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                {loading ? "Connecting..." : "Add Vercel Project"}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

