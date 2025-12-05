"use client"

import { useState, useEffect } from "react"
import type { Issue, Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Github, ExternalLink, Code, Plus, Settings } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface IssueCommitLinkProps {
  issue: Issue
  project: Project
}

export function IssueCommitLink({ issue, project }: IssueCommitLinkProps) {
  const { t } = useLanguage()
  const [commitId, setCommitId] = useState(issue.commitId || "")
  const [commitInfo, setCommitInfo] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const [openRepoSelect, setOpenRepoSelect] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRepoId, setSelectedRepoId] = useState<string>(issue.githubRepoId || project.githubRepos?.[0]?.id || "")

  const selectedRepo = project.githubRepos?.find(r => r.id === selectedRepoId) || project.githubRepos?.[0]

  const fetchCommitInfo = async (commitId: string, repo?: typeof selectedRepo) => {
    if (!commitId || !repo) return

    setLoading(true)
    try {
      const res = await fetch(
        `/api/github/commit/${commitId}?owner=${repo.githubOwner}&repo=${repo.githubRepo}`
      )
      if (res.ok) {
        const data = await res.json()
        setCommitInfo(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching commit info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (issue.commitId && selectedRepo) {
      fetchCommitInfo(issue.commitId, selectedRepo)
    }
  }, [issue.commitId, selectedRepoId])

  const handleLinkCommit = async () => {
    if (!commitId.trim() || !selectedRepo) return

    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubRepoId: selectedRepoId,
          commitId: commitId.trim(),
          commitUrl: commitInfo?.url || `https://github.com/${selectedRepo.githubOwner}/${selectedRepo.githubRepo}/commit/${commitId.trim()}`,
          commitMessage: commitInfo?.message || "",
          commitAuthor: commitInfo?.author || "",
          commitDate: commitInfo?.date || new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setOpen(false)
        window.location.reload()
      }
    } catch (error) {
      console.error("[v0] Error linking commit:", error)
    }
  }

  const handleRepoChange = async (repoId: string) => {
    setSelectedRepoId(repoId)
    const repo = project.githubRepos?.find(r => r.id === repoId)
    if (repoId && repo) {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubRepoId: repoId }),
      })
      if (res.ok) {
        window.location.reload()
      }
    }
  }

  const hasGitHubRepo = project.githubRepos && project.githubRepos.length > 0

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub Commit
          </h3>
          <div className="flex items-center gap-2">
            {hasGitHubRepo && project.githubRepos && (
              <Select value={selectedRepoId} onValueChange={handleRepoChange}>
                <SelectTrigger className="w-[200px] h-8">
                  <SelectValue placeholder="Select Repository" />
                </SelectTrigger>
                <SelectContent>
                  {project.githubRepos.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id}>
                      {repo.githubOwner}/{repo.githubRepo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!issue.commitId && hasGitHubRepo && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Link Commit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Link GitHub Commit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {project.githubRepos && project.githubRepos.length > 1 && (
                    <div>
                      <Label htmlFor="repoSelect">Repository</Label>
                      <Select value={selectedRepoId} onValueChange={setSelectedRepoId}>
                        <SelectTrigger id="repoSelect">
                          <SelectValue placeholder="Select Repository" />
                        </SelectTrigger>
                        <SelectContent>
                          {project.githubRepos.map((repo) => (
                            <SelectItem key={repo.id} value={repo.id}>
                              {repo.githubOwner}/{repo.githubRepo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="commitId">Commit ID</Label>
                    <Input
                      id="commitId"
                      value={commitId}
                      onChange={(e) => {
                        setCommitId(e.target.value)
                        if (e.target.value.length >= 7 && selectedRepo) {
                          fetchCommitInfo(e.target.value, selectedRepo)
                        }
                      }}
                      placeholder="d19e34a"
                    />
                  </div>
                  {commitInfo && (
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm font-medium mb-1">{commitInfo.message.split("\n")[0]}</p>
                      <p className="text-xs text-muted-foreground">
                        by {commitInfo.author} on {new Date(commitInfo.date).toLocaleDateString()}
                      </p>
                      {commitInfo.files && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {commitInfo.files.length} file(s) changed
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button onClick={handleLinkCommit} disabled={!commitId.trim() || loading}>
                      {t("common.save")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            )}
          </div>
        </div>

        {hasGitHubRepo && selectedRepo && (
          <div className="p-2 bg-muted rounded text-xs text-muted-foreground flex items-center gap-2">
            <Github className="h-3 w-3" />
            <span>Linked to: {selectedRepo.githubOwner}/{selectedRepo.githubRepo}</span>
            {selectedRepo.githubRepoUrl && (
              <a
                href={selectedRepo.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {!hasGitHubRepo && !issue.commitId && (
          <div className="p-3 bg-muted rounded text-sm">
            <p className="text-muted-foreground mb-2">
              Connect a GitHub repository to the project to link commits to issues.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = `/project/${project.id}?tab=settings&section=github`
              }}
            >
              <Github className="h-4 w-4 mr-2" />
              Connect GitHub Repository
            </Button>
          </div>
        )}

        {issue.commitId && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Code className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{issue.commitId.substring(0, 7)}</span>
              {selectedRepo && (
                <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                  {selectedRepo.githubOwner}/{selectedRepo.githubRepo}
                </span>
              )}
              {issue.commitUrl && (
                <a
                  href={issue.commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on GitHub
                </a>
              )}
            </div>
            {issue.commitMessage && (
              <div className="p-3 bg-muted rounded">
                <p className="text-sm whitespace-pre-wrap">{issue.commitMessage}</p>
                {issue.commitAuthor && (
                  <p className="text-xs text-muted-foreground mt-2">
                    by {issue.commitAuthor}
                    {issue.commitDate && ` on ${new Date(issue.commitDate).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            )}
            {commitInfo?.files && commitInfo.files.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Files Changed ({commitInfo.files.length}):</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {commitInfo.files.map((file: any, idx: number) => (
                    <div key={idx} className="text-xs border rounded p-2 bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs">{file.filename}</span>
                        <div className="flex items-center gap-2">
                          {file.additions > 0 && (
                            <span className="text-green-600 font-medium">+{file.additions}</span>
                          )}
                          {file.deletions > 0 && (
                            <span className="text-red-600 font-medium">-{file.deletions}</span>
                          )}
                          <span className="text-muted-foreground capitalize px-1.5 py-0.5 rounded bg-background text-[10px]">
                            {file.status}
                          </span>
                        </div>
                      </div>
                      {file.patch && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground text-[10px]">
                            Show diff
                          </summary>
                          <pre className="mt-2 p-2 bg-background rounded text-[10px] overflow-x-auto max-h-40 overflow-y-auto font-mono">
                            {file.patch}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
                {commitInfo.stats && (
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Total: +{commitInfo.stats.additions} / -{commitInfo.stats.deletions} ({commitInfo.stats.total} changes)
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

