import type { Issue, Project, User } from "./types"

const STORAGE_KEYS = {
  PROJECTS: "jira_projects",
  ISSUES: "jira_issues",
  CURRENT_USER: "jira_current_user",
} as const

// Mock current user
const MOCK_USER: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "/placeholder.svg?key=tugf9",
}

// Mock team members
const MOCK_USERS: User[] = [
  MOCK_USER,
  {
    id: "2",
    name: "Sarah Smith",
    email: "sarah@example.com",
    avatar: "/placeholder.svg?key=f4u83",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    avatar: "/placeholder.svg?key=lo7yp",
  },
]

function initializeMockData() {
  if (typeof window === "undefined") return

  // Check localStorage directly to avoid infinite loop
  const existingProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS)
  if (!existingProjects || JSON.parse(existingProjects).length === 0) {
    const mockProjects: Project[] = [
      {
        id: "1",
        name: "Web Application",
        key: "WEB",
        description: "Main web application project",
        avatar: "/placeholder.svg?key=879hq",
        createdAt: new Date().toISOString(),
        members: MOCK_USERS,
      },
      {
        id: "2",
        name: "Mobile App",
        key: "MOB",
        description: "Mobile application development",
        avatar: "/placeholder.svg?key=ve3zv",
        createdAt: new Date().toISOString(),
        members: MOCK_USERS,
      },
    ]
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(mockProjects))

    const mockIssues: Issue[] = [
      {
        id: "1",
        key: "WEB-1",
        title: "Implement user authentication",
        description: "Add login and signup functionality with JWT tokens",
        type: "task",
        priority: "high",
        status: "in-progress",
        assignee: MOCK_USERS[0],
        reporter: MOCK_USERS[0],
        projectId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      },
      {
        id: "2",
        key: "WEB-2",
        title: "Fix navigation menu bug",
        description: "Menu does not close on mobile devices",
        type: "bug",
        priority: "highest",
        status: "todo",
        assignee: MOCK_USERS[1],
        reporter: MOCK_USERS[0],
        projectId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      },
      {
        id: "3",
        key: "WEB-3",
        title: "Design new dashboard layout",
        description: "Create wireframes and mockups for the new dashboard",
        type: "story",
        priority: "medium",
        status: "backlog",
        assignee: MOCK_USERS[2],
        reporter: MOCK_USERS[1],
        projectId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      },
      {
        id: "4",
        key: "WEB-4",
        title: "Implement dark mode",
        description: "Add dark mode support across all pages",
        type: "task",
        priority: "low",
        status: "done",
        assignee: MOCK_USERS[0],
        reporter: MOCK_USERS[2],
        projectId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      },
      {
        id: "5",
        key: "MOB-1",
        title: "Setup React Native project",
        description: "Initialize mobile app with React Native",
        type: "task",
        priority: "highest",
        status: "in-review",
        assignee: MOCK_USERS[1],
        reporter: MOCK_USERS[0],
        projectId: "2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      },
    ]
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(mockIssues))
  }
}

// Projects
export function getProjects(): Project[] {
  if (typeof window === "undefined") return []
  initializeMockData()
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS)
  return data ? JSON.parse(data) : []
}

export function getProject(id: string): Project | null {
  const projects = getProjects()
  return projects.find((p) => p.id === id) || null
}

export function createProject(project: Omit<Project, "id" | "createdAt">): Project {
  const projects = getProjects()
  const newProject: Project = {
    ...project,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  projects.push(newProject)
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
  return newProject
}

// Issues
export function getIssues(projectId?: string): Issue[] {
  if (typeof window === "undefined") return []
  initializeMockData()
  const data = localStorage.getItem(STORAGE_KEYS.ISSUES)
  const issues: Issue[] = data ? JSON.parse(data) : []
  return projectId ? issues.filter((i) => i.projectId === projectId) : issues
}

export function getIssue(id: string): Issue | null {
  const issues = getIssues()
  return issues.find((i) => i.id === id) || null
}

export function createIssue(issue: Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "comments">): Issue {
  const issues = getIssues()
  const project = getProject(issue.projectId)
  if (!project) throw new Error("Project not found")

  const projectIssues = issues.filter((i) => i.projectId === issue.projectId)
  const issueNumber = projectIssues.length + 1

  const newIssue: Issue = {
    ...issue,
    id: Date.now().toString(),
    key: `${project.key}-${issueNumber}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
  }
  issues.push(newIssue)
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues))
  return newIssue
}

export function updateIssue(id: string, updates: Partial<Issue>): Issue | null {
  const issues = getIssues()
  const index = issues.findIndex((i) => i.id === id)
  if (index === -1) return null

  issues[index] = {
    ...issues[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues))
  return issues[index]
}

export function deleteIssue(id: string): boolean {
  const issues = getIssues()
  const filtered = issues.filter((i) => i.id !== id)
  if (filtered.length === issues.length) return false
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(filtered))
  return true
}

// Current User
export function getCurrentUser(): User {
  return MOCK_USER
}

export function getAllUsers(): User[] {
  return MOCK_USERS
}
