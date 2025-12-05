"use client"

import { useState, useEffect } from "react"
import type { Issue, Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Github, ExternalLink, Code, Plus } from "lucide-react"
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
  const [loading, setLoading] = useState(false)

  const fetchCommitInfo = async (commitId: string) => {
    if (!commitId || !project.githubRepos || project.githubRepos.length === 0) return

    setLoading(true)
    try {
      const repo = project.githubRepos[0]
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
    if (issue.commitId) {
      fetchCommitInfo(issue.commitId)
    }
  }, [issue.commitId])

  const handleLinkCommit = async () => {
    if (!commitId.trim()) return

    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commitId: commitId.trim(),
          commitUrl: commitInfo?.url || `https://github.com/${project.githubRepos?.[0]?.githubOwner}/${project.githubRepos?.[0]?.githubRepo}/commit/${commitId}`,
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

  if (!project.githubRepos || project.githubRepos.length === 0) {
    return null
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub Commit
          </h3>
          {!issue.commitId && (
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
                  <div>
                    <Label htmlFor="commitId">Commit ID</Label>
                    <Input
                      id="commitId"
                      value={commitId}
                      onChange={(e) => {
                        setCommitId(e.target.value)
                        if (e.target.value.length >= 7) {
                          fetchCommitInfo(e.target.value)
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

        {issue.commitId && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{issue.commitId.substring(0, 7)}</span>
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
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Files Changed:</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {commitInfo.files.map((file: any, idx: number) => (
                    <div key={idx} className="text-xs p-2 bg-muted rounded flex items-center justify-between">
                      <span className="font-mono">{file.filename}</span>
                      <div className="flex items-center gap-2">
                        {file.additions > 0 && (
                          <span className="text-green-600">+{file.additions}</span>
                        )}
                        {file.deletions > 0 && (
                          <span className="text-red-600">-{file.deletions}</span>
                        )}
                        <span className="text-muted-foreground">{file.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

