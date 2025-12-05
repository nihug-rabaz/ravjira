"use client"

import { useState } from "react"
import Link from "next/link"
import type { Project, User } from "@/lib/types"
import { ChevronLeft, Users, Folder, Github, ExternalLink, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserMenu } from "@/components/user-menu"
import { ProjectSettingsMenu } from "@/components/project-settings-menu"
import { NotificationsBell } from "@/components/notifications-bell"
import { TeamDialog } from "@/components/team-dialog"
import { LanguageSwitcher } from "@/components/language-switcher"
import { GitHubIntegrationDialog } from "@/components/github-integration-dialog"

interface ProjectHeaderProps {
  project: Project
  user: User | null
}

export function ProjectHeader({ project, user }: ProjectHeaderProps) {
  const [githubOpen, setGithubOpen] = useState(false)

  return (
    <>
      <header className="border-b bg-background">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/" className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded bg-primary shrink-0">
                    <Folder className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                  </div>
                  <span className="text-base sm:text-lg font-bold text-primary hidden sm:inline">RavJira</span>
                </div>
              </Link>
              <div className="h-4 sm:h-6 w-px bg-border hidden sm:block" />
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 rounded shrink-0">
                <AvatarImage src={project.avatar || "/placeholder.svg"} alt={project.name} />
                <AvatarFallback className="rounded bg-primary text-primary-foreground text-xs">
                  {project.key}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <h1 className="text-base sm:text-xl font-bold text-foreground truncate">{project.name}</h1>
                  {project.environment && (project.environment === "military" || project.environment === "civilian") && (
                    <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      project.environment === "military" 
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}>
                      {project.environment === "military" ? "צה\"לי" : "אזרחי"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono hidden sm:block">{project.key}</p>
                {(project.githubRepos && project.githubRepos.length > 0) || (project.vercelProjects && project.vercelProjects.length > 0) ? (
                  <div className="flex items-center gap-2 mt-1 hidden sm:flex flex-wrap">
                    {project.githubRepos && project.githubRepos.slice(0, 1).map((repo) => (
                      <a
                        key={repo.id}
                        href={repo.githubRepoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        <Github className="h-3 w-3" />
                        <span>{repo.githubOwner}/{repo.githubRepo}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                    {project.vercelProjects && project.vercelProjects.slice(0, 1).map((vp) => (
                      <a
                        key={vp.id}
                        href={vp.vercelUrl || `https://vercel.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        <Zap className="h-3 w-3" />
                        <span>{vp.vercelProjectName}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGithubOpen(true)}
                className="hidden sm:flex"
                title="GitHub Integration"
              >
                <Github className="h-4 w-4 sm:mr-2" />
                <span className="hidden md:inline">GitHub</span>
              </Button>
              <NotificationsBell />
              <TeamDialogButton project={project} />
              <ProjectSettingsMenu project={project} />
              {user && <UserMenu user={user} />}
            </div>
            <GitHubIntegrationDialog project={project} open={githubOpen} onOpenChange={setGithubOpen} />
          </div>
        </div>
      </header>
    </>
  )
}

function TeamDialogButton({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="hidden sm:flex">
        <Users className="h-4 w-4 mr-2" />
        <span className="hidden md:inline">Team</span>
      </Button>
      <TeamDialog project={project} open={open} onOpenChange={setOpen} />
    </>
  )
}
