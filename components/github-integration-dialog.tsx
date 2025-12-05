"use client"

import { useState, useEffect } from "react"
import type { Project, GitHubRepo } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Github, ExternalLink, X, Plus, Loader2, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface GitHubRepoOption {
  id: number
  name: string
  fullName: string
  url: string
  description: string
  private: boolean
  owner: string
}

interface GitHubIntegrationDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GitHubIntegrationDialog({ project, open, onOpenChange }: GitHubIntegrationDialogProps) {
  const [repos, setRepos] = useState<GitHubRepoOption[]>([])
  const [connectedRepos, setConnectedRepos] = useState<GitHubRepo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>("")
  const [manualRepoUrl, setManualRepoUrl] = useState<string>("")
  const [useManualUrl, setUseManualUrl] = useState(false)
  const [createNew, setCreateNew] = useState(false)
  const [newRepoName, setNewRepoName] = useState("")
  const [newRepoDescription, setNewRepoDescription] = useState("")
  const [newRepoPrivate, setNewRepoPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [removingRepoId, setRemovingRepoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchConnectedRepos()
      fetchRepos()
    }
  }, [open, project.id])

  const fetchConnectedRepos = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/github`)
      if (res.ok) {
        const data = await res.json()
        setConnectedRepos(data.githubRepos || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching connected repos:", error)
    }
  }

  const fetchRepos = async () => {
    setLoadingRepos(true)
    setError(null)
    try {
      const res = await fetch("/api/github/repos")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setRepos(data)
          if (data.length === 0) {
            setError("No repositories found. You can enter a repository URL manually.")
          }
        } else {
          setError("Failed to load repositories. You can enter a repository URL manually.")
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        setError(errorData.error || "Failed to fetch repositories. You can enter a repository URL manually.")
        console.error("[v0] Failed to fetch repositories:", errorData)
      }
    } catch (error) {
      setError("Failed to connect to GitHub. You can enter a repository URL manually.")
      console.error("[v0] Error fetching repositories:", error)
    } finally {
      setLoadingRepos(false)
    }
  }

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/github/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRepoName.trim(),
          description: newRepoDescription.trim(),
          private: newRepoPrivate,
        }),
      })

      if (res.ok) {
        const newRepo = await res.json()
        await handleConnect(newRepo.url, newRepo.owner, newRepo.name)
        await fetchRepos()
        setCreateNew(false)
        setNewRepoName("")
        setNewRepoDescription("")
        setNewRepoPrivate(false)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to create repository")
      }
    } catch (error) {
      console.error("[v0] Error creating repository:", error)
      alert("Failed to create repository")
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (repoUrl?: string, owner?: string, repo?: string) => {
    const url = repoUrl || selectedRepo || manualRepoUrl
    if (!url) return

    setLoading(true)
    setError(null)
    try {
      let finalUrl = url
      let finalOwner = owner
      let finalRepo = repo

      if (!finalOwner || !finalRepo) {
        const selected = repos.find((r) => r.url === url)
        if (selected) {
          finalOwner = selected.owner
          finalRepo = selected.name
          finalUrl = selected.url
        } else {
          const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
          if (match) {
            finalOwner = match[1]
            finalRepo = match[2]
          }
        }
      }

      if (!finalOwner || !finalRepo) {
        alert("Invalid repository URL")
        setLoading(false)
        return
      }

      const res = await fetch(`/api/projects/${project.id}/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: finalUrl }),
      })

      if (res.ok) {
        await fetchConnectedRepos()
        setSelectedRepo("")
        setManualRepoUrl("")
        setUseManualUrl(false)
      } else {
        const errorData = await res.json()
        setError(errorData.error || "Failed to connect GitHub repository")
        alert(errorData.error || "Failed to connect GitHub repository")
      }
    } catch (error) {
      console.error("[v0] Error connecting GitHub:", error)
      alert("Failed to connect GitHub repository")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (repoId: string) => {
    if (!confirm("Are you sure you want to disconnect this repository?")) return

    setRemovingRepoId(repoId)
    try {
      const res = await fetch(`/api/projects/${project.id}/github?repoId=${repoId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchConnectedRepos()
      } else {
        alert("Failed to disconnect repository")
      }
    } catch (error) {
      console.error("[v0] Error disconnecting repository:", error)
      alert("Failed to disconnect repository")
    } finally {
      setRemovingRepoId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </DialogTitle>
          <DialogDescription>
            Connect multiple GitHub repositories to this project. You can create issues in any connected repository.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {connectedRepos.length > 0 && (
            <div className="space-y-2">
              <Label>Connected Repositories ({connectedRepos.length})</Label>
              <div className="space-y-2">
                {connectedRepos.map((repo) => (
                  <Card key={repo.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Github className="h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{repo.githubOwner}/{repo.githubRepo}</p>
                          <a
                            href={repo.githubRepoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                          >
                            {repo.githubRepoUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(repo.id)}
                        disabled={removingRepoId === repo.id}
                        className="shrink-0"
                      >
                        {removingRepoId === repo.id ? (
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
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={!createNew ? "default" : "outline"}
                size="sm"
                onClick={() => setCreateNew(false)}
                className="flex-1"
              >
                Select Existing
              </Button>
              <Button
                variant={createNew ? "default" : "outline"}
                size="sm"
                onClick={() => setCreateNew(true)}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>

            {!createNew ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repoSelect">Select Repository</Label>
                  {loadingRepos ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading repositories...</span>
                    </div>
                  ) : (
                    <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                      <SelectTrigger id="repoSelect">
                        <SelectValue placeholder="Select a repository" />
                      </SelectTrigger>
                      <SelectContent>
                        {repos
                          .filter((repo) => !connectedRepos.some((cr) => cr.githubRepoUrl === repo.url))
                          .map((repo) => (
                            <SelectItem key={repo.id} value={repo.url}>
                              <div className="flex items-center gap-2">
                                <Github className="h-4 w-4" />
                                <span className="font-medium">{repo.fullName}</span>
                                {repo.private && (
                                  <span className="text-xs text-muted-foreground">(Private)</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                  {repos.length === 0 && !loadingRepos && (
                    <p className="text-xs text-muted-foreground">
                      No repositories found. Create a new one instead.
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleConnect()}
                  disabled={loading || !selectedRepo || loadingRepos}
                  className="w-full"
                >
                  <Github className="h-4 w-4 mr-2" />
                  {loading ? "Connecting..." : "Add Repository"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newRepoName">Repository Name *</Label>
                  <Input
                    id="newRepoName"
                    placeholder="my-awesome-project"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Repository name must be unique and contain only alphanumeric characters, hyphens, and underscores.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newRepoDescription">Description (Optional)</Label>
                  <Input
                    id="newRepoDescription"
                    placeholder="A brief description of the repository"
                    value={newRepoDescription}
                    onChange={(e) => setNewRepoDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="newRepoPrivate"
                    checked={newRepoPrivate}
                    onChange={(e) => setNewRepoPrivate(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="newRepoPrivate" className="text-sm font-normal cursor-pointer">
                    Make this repository private
                  </Label>
                </div>
                <Button
                  onClick={handleCreateRepo}
                  disabled={loading || !newRepoName.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? "Creating..." : "Create and Add Repository"}
                </Button>
              </div>
            )}
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
