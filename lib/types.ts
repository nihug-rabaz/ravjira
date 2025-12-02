export type IssueType = "task" | "bug" | "story" | "epic"
export type IssuePriority = "lowest" | "low" | "medium" | "high" | "highest"
export type IssueStatus = "backlog" | "todo" | "in-progress" | "in-review" | "done"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
}

export interface Issue {
  id: string
  key: string
  title: string
  description: string
  type: IssueType
  priority: IssuePriority
  status: IssueStatus
  assignee?: User
  reporter: User
  projectId: string
  createdAt: string
  updatedAt: string
  comments: Comment[]
}

export interface Comment {
  id: string
  content: string
  author: User
  createdAt: string
}

export interface Project {
  id: string
  name: string
  key: string
  description: string
  avatar: string
  createdAt: string
  members: User[]
}
