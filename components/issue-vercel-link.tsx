"use client"

import { useState, useEffect } from "react"
import type { Issue, Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, ExternalLink, Plus, Globe } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { VercelIntegrationDialog } from "@/components/vercel-integration-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface IssueVercelLinkProps {
  issue: Issue
  project: Project
}

export function IssueVercelLink({ issue, project }: IssueVercelLinkProps) {
  const { t } = useLanguage()
  const [selectedVercelId, setSelectedVercelId] = useState<string>(issue.vercelProjectId || "")
  const [openVercelDialog, setOpenVercelDialog] = useState(false)
  const [openManualUrlDialog, setOpenManualUrlDialog] = useState(false)
  const [manualUrl, setManualUrl] = useState<string>("")
  const [deploymentInfo, setDeploymentInfo] = useState<any>(null)
  const [loadingDeployment, setLoadingDeployment] = useState(false)
  const [manualUrls, setManualUrls] = useState<string[]>([])

  const selectedVercel = project.vercelProjects?.find(vp => vp.id === selectedVercelId)

  // Load manual URLs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`vercel-urls-${issue.id}-${selectedVercelId || 'default'}`)
    if (stored) {
      try {
        setManualUrls(JSON.parse(stored))
      } catch (e) {
        console.error("[v0] Error parsing stored URLs:", e)
      }
    }
  }, [issue.id, selectedVercelId])

  useEffect(() => {
    if (selectedVercel) {
      fetchDeploymentInfo(selectedVercel)
    } else if (project.vercelProjects && project.vercelProjects.length === 1 && !selectedVercelId) {
      fetchDeploymentInfo(project.vercelProjects[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVercelId])

  const fetchDeploymentInfo = async (vercelProject: typeof selectedVercel) => {
    if (!vercelProject) return
    
    setLoadingDeployment(true)
    try {
      const url = `/api/vercel/projects/${vercelProject.vercelProjectId}/deployments${vercelProject.vercelTeamId ? `?teamId=${vercelProject.vercelTeamId}` : ''}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setDeploymentInfo(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching deployment info:", error)
    } finally {
      setLoadingDeployment(false)
    }
  }

  const handleVercelChange = async (vercelId: string) => {
    setSelectedVercelId(vercelId)
    if (vercelId) {
      try {
        const res = await fetch(`/api/issues/${issue.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vercelProjectId: vercelId }),
        })
        if (res.ok) {
          window.location.reload()
        }
      } catch (error) {
        console.error("[v0] Error linking Vercel project:", error)
      }
    }
  }

  const handleAddManualUrl = () => {
    if (manualUrl.trim()) {
      const newUrls = [...manualUrls, manualUrl.trim()]
      setManualUrls(newUrls)
      // Save to localStorage
      localStorage.setItem(`vercel-urls-${issue.id}-${selectedVercelId || 'default'}`, JSON.stringify(newUrls))
      setOpenManualUrlDialog(false)
      setManualUrl("")
    }
  }

  const hasVercelProjects = project.vercelProjects && project.vercelProjects.length > 0

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Vercel Deployment
          </h3>
          {hasVercelProjects && project.vercelProjects && (
            <Select value={selectedVercelId || ""} onValueChange={handleVercelChange}>
              <SelectTrigger className="w-[200px] h-8">
                <SelectValue placeholder="Select Deployment" />
              </SelectTrigger>
              <SelectContent>
                {project.vercelProjects.map((vp) => (
                  <SelectItem key={vp.id} value={vp.id}>
                    {vp.vercelProjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!hasVercelProjects && (
          <div className="p-3 bg-muted rounded text-sm">
            <p className="text-muted-foreground mb-2">
              Connect a Vercel project to see deployment links.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenVercelDialog(true)}
            >
              <Zap className="h-4 w-4 mr-2" />
              Connect Vercel Project
            </Button>
          </div>
        )}

        {hasVercelProjects && selectedVercel && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{selectedVercel.vercelProjectName}</span>
            </div>

            {loadingDeployment ? (
              <div className="text-xs text-muted-foreground">Loading deployment info...</div>
            ) : deploymentInfo ? (
              <>
                {deploymentInfo.latestDeployment && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Deployment</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenManualUrlDialog(true)}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add URL
                      </Button>
                    </div>
                    <div className="p-2 bg-muted rounded text-xs font-mono">
                      <a
                        href={`https://${deploymentInfo.latestDeployment.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {deploymentInfo.latestDeployment.url}
                      </a>
                    </div>
                  </div>
                )}

                {manualUrls.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Additional URLs</span>
                    </div>
                    <div className="space-y-1">
                      {manualUrls.map((url: string, idx: number) => (
                        <div key={idx} className="p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                          <a
                            href={`https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all flex-1"
                          >
                            {url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!deploymentInfo.latestDeployment && manualUrls.length === 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Deployment</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenManualUrlDialog(true)}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add URL
                      </Button>
                    </div>
                    <div className="p-2 bg-muted rounded text-xs text-muted-foreground">
                      No deployment information available. Add a URL manually.
                    </div>
                  </div>
                )}
              </>
            ) : selectedVercel.vercelUrl ? (
              <div className="p-2 bg-muted rounded text-xs">
                <a
                  href={selectedVercel.vercelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {selectedVercel.vercelUrl}
                </a>
              </div>
            ) : null}
          </div>
        )}

        {hasVercelProjects && !selectedVercel && project.vercelProjects && project.vercelProjects.length === 1 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{project.vercelProjects[0].vercelProjectName}</span>
            </div>
            {loadingDeployment ? (
              <div className="text-xs text-muted-foreground">Loading deployment info...</div>
            ) : deploymentInfo ? (
              <>
                {deploymentInfo.latestDeployment && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Deployment</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenManualUrlDialog(true)}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add URL
                      </Button>
                    </div>
                    <div className="p-2 bg-muted rounded text-xs font-mono">
                      <a
                        href={`https://${deploymentInfo.latestDeployment.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {deploymentInfo.latestDeployment.url}
                      </a>
                    </div>
                  </div>
                )}

                {deploymentInfo.domains && deploymentInfo.domains.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Domains</span>
                    </div>
                    <div className="space-y-1">
                      {deploymentInfo.domains.map((domain: string, idx: number) => (
                        <div key={idx} className="p-2 bg-muted rounded text-xs font-mono">
                          <a
                            href={`https://${domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all"
                          >
                            {domain}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {manualUrls.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Additional URLs</span>
                    </div>
                    <div className="space-y-1">
                      {manualUrls.map((url: string, idx: number) => (
                        <div key={idx} className="p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                          <a
                            href={`https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all flex-1"
                          >
                            {url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!deploymentInfo.latestDeployment && manualUrls.length === 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Deployment</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenManualUrlDialog(true)}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add URL
                      </Button>
                    </div>
                    <div className="p-2 bg-muted rounded text-xs text-muted-foreground">
                      No deployment information available. Add a URL manually.
                    </div>
                  </div>
                )}
              </>
            ) : project.vercelProjects[0].vercelUrl ? (
              <div className="p-2 bg-muted rounded text-xs">
                <a
                  href={project.vercelProjects[0].vercelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {project.vercelProjects[0].vercelUrl}
                </a>
              </div>
            ) : null}
          </div>
        )}

        {hasVercelProjects && !selectedVercel && project.vercelProjects && project.vercelProjects.length > 1 && (
          <div className="p-3 bg-muted rounded text-sm text-muted-foreground">
            No Vercel deployment linked. Select one from the dropdown above.
          </div>
        )}
      </div>

      <VercelIntegrationDialog 
        project={project} 
        open={openVercelDialog} 
        onOpenChange={(open) => {
          setOpenVercelDialog(open)
          if (!open) {
            // Reload page to get updated project with new Vercel projects
            window.location.reload()
          }
        }} 
      />

      <Dialog open={openManualUrlDialog} onOpenChange={setOpenManualUrlDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Deployment URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="manualUrl">Deployment URL</Label>
              <Input
                id="manualUrl"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="auth1-3x20plffy-nihugs-projects.vercel.app"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && manualUrl.trim()) {
                    handleAddManualUrl()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the full deployment URL (without https://)
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setOpenManualUrlDialog(false)
                setManualUrl("")
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddManualUrl} disabled={!manualUrl.trim()}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

