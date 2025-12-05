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
  epicId?: string
  githubRepoId?: string
  commitId?: string
  commitMessage?: string
  commitUrl?: string
  commitAuthor?: string
  commitDate?: string
  createdAt: string
  updatedAt: string
  comments: Comment[]
}

export interface Comment {
  id: string
  content: string
  user: User
  issueId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export type ProjectEnvironment = "civilian" | "military"

export interface GitHubRepo {
  id: string
  projectId: string
  githubRepoUrl: string
  githubOwner: string
  githubRepo: string
  createdAt: string
}

export interface VercelProject {
  id: string
  projectId: string
  vercelProjectId: string
  vercelProjectName: string
  vercelTeamId?: string
  vercelUrl?: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  key: string
  description: string
  avatar: string
  environment?: ProjectEnvironment
  githubRepos?: GitHubRepo[]
  vercelProjects?: VercelProject[]
  createdAt: string
  members: User[]
}

export interface Label {
  id: string
  name: string
  color: string
  projectId?: string
  createdAt: string
}

export interface IssueHistory {
  id: string
  issueId: string
  userId: string
  user?: User
  field: string
  oldValue?: string
  newValue?: string
  createdAt: string
}

export interface Attachment {
  id: string
  issueId: string
  userId: string
  user?: User
  filename: string
  filePath: string
  fileSize: number
  mimeType?: string
  createdAt: string
}

export interface Subtask {
  id: string
  parentIssueId: string
  title: string
  status: "todo" | "in-progress" | "done"
  assignee?: User
  assigneeId?: string
  priority?: IssuePriority
  createdAt: string
  updatedAt: string
}

export interface TimeLog {
  id: string
  issueId: string
  userId: string
  user?: User
  timeSpent: number
  description?: string
  loggedAt: string
  createdAt: string
}

export interface IssueEstimate {
  issueId: string
  originalEstimate?: number
  remainingEstimate?: number
  timeSpent: number
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message?: string
  link?: string
  read: boolean
  createdAt: string
}

export interface Request {
  id: string
  requesterName: string
  personalNumber: string
  department: string
  phone: string
  platform: "civilian" | "military"
  requestType: "website" | "software" | "other"
  description: string
  status: "pending" | "taken" | "completed" | "rejected"
  takenByUserId?: string
  projectId?: string
  createdAt: string
  updatedAt: string
}

export interface Sprint {
  id: string
  projectId: string
  name: string
  goal?: string
  startDate?: string
  endDate?: string
  status: "future" | "active" | "closed"
  createdAt: string
  updatedAt: string
}

export type IssueLinkType = "relates" | "blocks" | "is blocked by" | "duplicates" | "is duplicated by" | "depends on" | "is depended on by"

export interface IssueLink {
  id: string
  sourceIssueId: string
  targetIssueId: string
  linkType: IssueLinkType
  createdAt: string
}

export interface SavedFilter {
  id: string
  userId: string
  projectId?: string
  name: string
  description?: string
  filterData: any
  isShared: boolean
  createdAt: string
  updatedAt: string
}

export type CustomFieldType = "text" | "number" | "date" | "select" | "user" | "checkbox"

export interface CustomField {
  id: string
  projectId: string
  name: string
  fieldType: CustomFieldType
  options?: any
  isRequired: boolean
  createdAt: string
}

export interface IssueCustomFieldValue {
  issueId: string
  customFieldId: string
  value?: string
  createdAt: string
  updatedAt: string
}

export interface Release {
  id: string
  projectId: string
  name: string
  version?: string
  description?: string
  releaseDate?: string
  status: "unreleased" | "released" | "archived"
  createdAt: string
  updatedAt: string
}

export interface IssueRelease {
  issueId: string
  releaseId: string
  fixVersion: boolean
}
