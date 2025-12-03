"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EditProjectDialog } from "./edit-project-dialog"
import { GitHubIntegrationDialog } from "./github-integration-dialog"
import { VercelIntegrationDialog } from "./vercel-integration-dialog"
import { MoreVertical, Edit, Trash2, Github, Zap } from "lucide-react"
import type { Project } from "@/lib/types"

interface ProjectSettingsMenuProps {
  project: Project
}

export function ProjectSettingsMenu({ project }: ProjectSettingsMenuProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [githubOpen, setGithubOpen] = useState(false)
  const [vercelOpen, setVercelOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete project")

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting project:", error)
      alert("Failed to delete project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setGithubOpen(true)}>
            <Github className="mr-2 h-4 w-4" />
            GitHub Integration
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setVercelOpen(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Vercel Integration
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProjectDialog project={project} open={editOpen} onOpenChange={setEditOpen} />
      <GitHubIntegrationDialog project={project} open={githubOpen} onOpenChange={setGithubOpen} />
      <VercelIntegrationDialog project={project} open={vercelOpen} onOpenChange={setVercelOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project <strong>{project.name}</strong> and all its issues and comments.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
