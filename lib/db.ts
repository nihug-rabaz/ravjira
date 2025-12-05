import { neon } from "@neondatabase/serverless"
import type { Issue, Project, User, Comment, Sprint, IssueLink, SavedFilter, CustomField, Release } from "./types"

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

// Projects
export async function getProjects(): Promise<Project[]> {
  const sql = getSql()
  const projects = await sql`
    SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar)
        ) FILTER (WHERE u.id IS NOT NULL),
        '[]'
      ) as members
    FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.project_id
    LEFT JOIN users u ON pm.user_id = u.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `

  const projectIds = projects.map((p: any) => p.id)
  const allGithubRepos = projectIds.length > 0 ? await sql`
    SELECT id, project_id, github_repo_url, github_owner, github_repo, created_at
    FROM project_github_repos
    WHERE project_id = ANY(${projectIds})
    ORDER BY created_at DESC
  ` : []

  const allVercelProjects = projectIds.length > 0 ? await sql`
    SELECT id, project_id, vercel_project_id, vercel_project_name, vercel_team_id, vercel_url, created_at
    FROM project_vercel_projects
    WHERE project_id = ANY(${projectIds})
    ORDER BY created_at DESC
  ` : []

  const reposByProject = new Map<string, any[]>()
  for (const repo of allGithubRepos) {
    if (!reposByProject.has(repo.project_id)) {
      reposByProject.set(repo.project_id, [])
    }
    reposByProject.get(repo.project_id)!.push({
      id: repo.id,
      projectId: repo.project_id,
      githubRepoUrl: repo.github_repo_url,
      githubOwner: repo.github_owner,
      githubRepo: repo.github_repo,
      createdAt: repo.created_at,
    })
  }

  const vercelByProject = new Map<string, any[]>()
  for (const vp of allVercelProjects) {
    if (!vercelByProject.has(vp.project_id)) {
      vercelByProject.set(vp.project_id, [])
    }
    vercelByProject.get(vp.project_id)!.push({
      id: vp.id,
      projectId: vp.project_id,
      vercelProjectId: vp.vercel_project_id,
      vercelProjectName: vp.vercel_project_name,
      vercelTeamId: vp.vercel_team_id || undefined,
      vercelUrl: vp.vercel_url || undefined,
      createdAt: vp.created_at,
    })
  }

  return projects.map((p) => {
    const members = Array.isArray(p.members) ? p.members : (typeof p.members === 'string' ? JSON.parse(p.members) : [])
    return {
      ...p,
      environment: (p.environment || "civilian") as "civilian" | "military",
      githubRepos: reposByProject.get(p.id) || [],
      vercelProjects: vercelByProject.get(p.id) || [],
      members: members.filter((m: any) => m && m.id),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }
  }) as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const sql = getSql()
  const projects = await sql`
    SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar)
        ) FILTER (WHERE u.id IS NOT NULL),
        '[]'
      ) as members
    FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.project_id
    LEFT JOIN users u ON pm.user_id = u.id
    WHERE p.id = ${id}
    GROUP BY p.id
  `

  if (projects.length === 0) return null

  const p = projects[0]
  const members = Array.isArray(p.members) ? p.members : (typeof p.members === 'string' ? JSON.parse(p.members) : [])
  
  const githubRepos = await sql`
    SELECT id, project_id, github_repo_url, github_owner, github_repo, created_at
    FROM project_github_repos
    WHERE project_id = ${id}
    ORDER BY created_at DESC
  `

  const vercelProjects = await sql`
    SELECT id, project_id, vercel_project_id, vercel_project_name, vercel_team_id, vercel_url, created_at
    FROM project_vercel_projects
    WHERE project_id = ${id}
    ORDER BY created_at DESC
  `

  return {
    ...p,
    environment: (p.environment || "civilian") as "civilian" | "military",
    githubRepos: githubRepos.map((r: any) => ({
      id: r.id,
      projectId: r.project_id,
      githubRepoUrl: r.github_repo_url,
      githubOwner: r.github_owner,
      githubRepo: r.github_repo,
      createdAt: r.created_at,
    })),
    vercelProjects: vercelProjects.map((v: any) => ({
      id: v.id,
      projectId: v.project_id,
      vercelProjectId: v.vercel_project_id,
      vercelProjectName: v.vercel_project_name,
      vercelTeamId: v.vercel_team_id || undefined,
      vercelUrl: v.vercel_url || undefined,
      createdAt: v.created_at,
    })),
    members: members.filter((m: any) => m && m.id),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  } as Project
}

export async function createProject(project: {
  name: string
  key: string
  description: string
  avatar?: string
  creatorId: string
  environment?: "civilian" | "military"
}): Promise<Project> {
  const sql = getSql()
  console.log("[v0] createProject called with:", project)

  const id = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  console.log("[v0] Generated project ID:", id)

  await sql`
    INSERT INTO projects (id, name, key, description, icon, environment)
    VALUES (
      ${id},
      ${project.name},
      ${project.key},
      ${project.description},
      ${project.avatar || null},
      ${project.environment || "civilian"}
    )
  `

  console.log("[v0] Project inserted successfully")

  await sql`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (${id}, ${project.creatorId}, 'admin')
  `

  console.log("[v0] Project member added successfully")

  const result = await getProject(id)
  console.log("[v0] Final project result:", result)

  return result as Promise<Project>
}

export async function updateProject(
  id: string,
  updates: { 
    name?: string
    description?: string
    avatar?: string
    environment?: "civilian" | "military"
  },
): Promise<Project | null> {
  const sql = getSql()
  if (updates.name !== undefined) {
    await sql`UPDATE projects SET name = ${updates.name}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.description !== undefined) {
    await sql`UPDATE projects SET description = ${updates.description}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.avatar !== undefined) {
    await sql`UPDATE projects SET icon = ${updates.avatar}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.environment !== undefined) {
    await sql`UPDATE projects SET environment = ${updates.environment}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }

  return getProject(id)
}

export async function addGitHubRepoToProject(
  projectId: string,
  repoUrl: string,
  owner: string,
  repo: string,
): Promise<{ id: string; projectId: string; githubRepoUrl: string; githubOwner: string; githubRepo: string; createdAt: string }> {
  const sql = getSql()
  const id = crypto.randomUUID()
  
  await sql`
    INSERT INTO project_github_repos (id, project_id, github_repo_url, github_owner, github_repo)
    VALUES (${id}, ${projectId}, ${repoUrl}, ${owner}, ${repo})
    ON CONFLICT (project_id, github_owner, github_repo) DO NOTHING
  `

  const result = await sql`
    SELECT id, project_id, github_repo_url, github_owner, github_repo, created_at
    FROM project_github_repos
    WHERE project_id = ${projectId} AND github_owner = ${owner} AND github_repo = ${repo}
  `

  if (result.length === 0) {
    throw new Error("Failed to add GitHub repository")
  }

  const r = result[0]
  return {
    id: r.id,
    projectId: r.project_id,
    githubRepoUrl: r.github_repo_url,
    githubOwner: r.github_owner,
    githubRepo: r.github_repo,
    createdAt: r.created_at,
  }
}

export async function removeGitHubRepoFromProject(
  projectId: string,
  repoId: string,
): Promise<void> {
  const sql = getSql()
  await sql`
    DELETE FROM project_github_repos
    WHERE id = ${repoId} AND project_id = ${projectId}
  `
}

export async function addVercelProjectToProject(
  projectId: string,
  vercelProjectId: string,
  vercelProjectName: string,
  vercelTeamId?: string,
  vercelUrl?: string,
): Promise<{ id: string; projectId: string; vercelProjectId: string; vercelProjectName: string; vercelTeamId?: string; vercelUrl?: string; createdAt: string }> {
  const sql = getSql()
  const id = crypto.randomUUID()
  
  await sql`
    INSERT INTO project_vercel_projects (id, project_id, vercel_project_id, vercel_project_name, vercel_team_id, vercel_url)
    VALUES (${id}, ${projectId}, ${vercelProjectId}, ${vercelProjectName}, ${vercelTeamId || null}, ${vercelUrl || null})
    ON CONFLICT (project_id, vercel_project_id) DO NOTHING
  `

  const result = await sql`
    SELECT id, project_id, vercel_project_id, vercel_project_name, vercel_team_id, vercel_url, created_at
    FROM project_vercel_projects
    WHERE project_id = ${projectId} AND vercel_project_id = ${vercelProjectId}
  `

  if (result.length === 0) {
    throw new Error("Failed to add Vercel project")
  }

  const v = result[0]
  return {
    id: v.id,
    projectId: v.project_id,
    vercelProjectId: v.vercel_project_id,
    vercelProjectName: v.vercel_project_name,
    vercelTeamId: v.vercel_team_id || undefined,
    vercelUrl: v.vercel_url || undefined,
    createdAt: v.created_at,
  }
}

export async function removeVercelProjectFromProject(
  projectId: string,
  vercelProjectId: string,
): Promise<void> {
  const sql = getSql()
  await sql`
    DELETE FROM project_vercel_projects
    WHERE vercel_project_id = ${vercelProjectId} AND project_id = ${projectId}
  `
}

export async function deleteProject(id: string): Promise<void> {
  const sql = getSql()
  // Delete related data first (cascade)
  await sql`DELETE FROM comments WHERE issue_id IN (SELECT id FROM issues WHERE project_id = ${id})`
  await sql`DELETE FROM issues WHERE project_id = ${id}`
  await sql`DELETE FROM project_members WHERE project_id = ${id}`
  await sql`DELETE FROM project_github_repos WHERE project_id = ${id}`
  await sql`DELETE FROM project_vercel_projects WHERE project_id = ${id}`
  await sql`DELETE FROM projects WHERE id = ${id}`
}

// Issues
export async function getIssuesByProject(projectId: string): Promise<Issue[]> {
  const sql = getSql()
  const issues = await sql`
    SELECT 
      i.*,
      json_build_object('id', a.id, 'name', a.name, 'email', a.email, 'avatar', a.avatar) as assignee,
      json_build_object('id', r.id, 'name', r.name, 'email', r.email, 'avatar', r.avatar) as reporter
    FROM issues i
    LEFT JOIN users a ON i.assignee_id = a.id
    LEFT JOIN users r ON i.reporter_id = r.id
    WHERE i.project_id = ${projectId}
    ORDER BY i.created_at DESC
  `

  return issues.map((i) => ({
    ...i,
    projectId: i.project_id,
    assigneeId: i.assignee_id,
    reporterId: i.reporter_id,
    epicId: i.epic_id,
    githubRepoId: i.github_repo_id,
    commitId: i.commit_id,
    commitMessage: i.commit_message,
    commitUrl: i.commit_url,
    commitAuthor: i.commit_author,
    commitDate: i.commit_date,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  })) as Issue[]
}

export async function getIssue(id: string): Promise<Issue | null> {
  const sql = getSql()
  const issues = await sql`
    SELECT 
      i.*,
      json_build_object('id', a.id, 'name', a.name, 'email', a.email, 'avatar', a.avatar) as assignee,
      json_build_object('id', r.id, 'name', r.name, 'email', r.email, 'avatar', r.avatar) as reporter
    FROM issues i
    LEFT JOIN users a ON i.assignee_id = a.id
    LEFT JOIN users r ON i.reporter_id = r.id
    WHERE i.id = ${id}
  `

  if (issues.length === 0) return null

  const i = issues[0]
  return {
    ...i,
    projectId: i.project_id,
    assigneeId: i.assignee_id,
    reporterId: i.reporter_id,
    epicId: i.epic_id,
    commitId: i.commit_id,
    commitMessage: i.commit_message,
    commitUrl: i.commit_url,
    commitAuthor: i.commit_author,
    commitDate: i.commit_date,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  } as Issue
}

export async function createIssue(issue: Omit<Issue, "id" | "createdAt" | "updatedAt">): Promise<Issue> {
  const sql = getSql()
  const id = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const result = await sql`
    INSERT INTO issues (id, key, title, description, type, status, priority, project_id, assignee_id, reporter_id, epic_id)
    VALUES (
      ${id},
      ${issue.key},
      ${issue.title},
      ${issue.description || ""},
      ${issue.type},
      ${issue.status},
      ${issue.priority},
      ${issue.projectId},
      ${issue.assigneeId || null},
      ${issue.reporterId},
      ${(issue as any).epicId || null}
    )
    RETURNING *
  `

  return getIssue(id) as Promise<Issue>
}

export async function updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | null> {
  const sql = getSql()

  if (updates.title !== undefined) {
    await sql`UPDATE issues SET title = ${updates.title}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.description !== undefined) {
    await sql`UPDATE issues SET description = ${updates.description}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.type !== undefined) {
    await sql`UPDATE issues SET type = ${updates.type}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.status !== undefined) {
    await sql`UPDATE issues SET status = ${updates.status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.priority !== undefined) {
    await sql`UPDATE issues SET priority = ${updates.priority}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.assigneeId !== undefined) {
    await sql`UPDATE issues SET assignee_id = ${updates.assigneeId}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if ((updates as any).epicId !== undefined) {
    await sql`UPDATE issues SET epic_id = ${(updates as any).epicId}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if ((updates as any).commitId !== undefined) {
    await sql`UPDATE issues SET commit_id = ${(updates as any).commitId}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if ((updates as any).commitMessage !== undefined) {
    await sql`UPDATE issues SET commit_message = ${(updates as any).commitMessage}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if ((updates as any).commitUrl !== undefined) {
    await sql`UPDATE issues SET commit_url = ${(updates as any).commitUrl}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if ((updates as any).commitAuthor !== undefined) {
    await sql`UPDATE issues SET commit_author = ${(updates as any).commitAuthor}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if ((updates as any).commitDate !== undefined) {
    await sql`UPDATE issues SET commit_date = ${(updates as any).commitDate || null}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if ((updates as any).githubRepoId !== undefined) {
    await sql`UPDATE issues SET github_repo_id = ${(updates as any).githubRepoId || null}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }

  return getIssue(id)
}

// Users
export async function getUsers(): Promise<User[]> {
  const sql = getSql()
  const users = await sql`
    SELECT * FROM users
    ORDER BY name ASC
  `

  return users.map((u) => ({
    ...u,
    createdAt: u.created_at,
  })) as User[]
}

// Comments
export async function getCommentsByIssue(issueId: string): Promise<Comment[]> {
  const sql = getSql()
  const comments = await sql`
    SELECT 
      c.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as user
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.issue_id = ${issueId}
    ORDER BY c.created_at ASC
  `

  return comments.map((c) => ({
    ...c,
    issueId: c.issue_id,
    userId: c.user_id,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  })) as Comment[]
}

export async function createComment(comment: Omit<Comment, "id" | "createdAt" | "updatedAt">): Promise<Comment> {
  const sql = getSql()
  const id = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  await sql`
    INSERT INTO comments (id, content, issue_id, user_id)
    VALUES (
      ${id},
      ${comment.content},
      ${comment.issueId},
      ${comment.userId}
    )
  `

  const result = await sql`
    SELECT 
      c.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as user
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ${id}
  `

  const c = result[0]
  return {
    ...c,
    issueId: c.issue_id,
    userId: c.user_id,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  } as Comment
}

// Notifications
export async function getNotificationsByUser(
  userId: string,
  unreadOnly: boolean = false,
): Promise<any[]> {
  const sql = getSql()
  const notifications = unreadOnly
    ? await sql`
        SELECT * FROM notifications
        WHERE user_id = ${userId} AND read = FALSE
        ORDER BY created_at DESC
      `
    : await sql`
        SELECT * FROM notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `

  return notifications.map((n: any) => ({
    id: n.id,
    userId: n.user_id,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    read: n.read,
    createdAt: n.created_at,
  }))
}

export async function createNotification(notification: {
  userId: string
  type: string
  title: string
  message?: string
  link?: string
}): Promise<any> {
  const sql = getSql()
  const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  await sql`
    INSERT INTO notifications (id, user_id, type, title, message, link)
    VALUES (${id}, ${notification.userId}, ${notification.type}, ${notification.title}, ${notification.message || null}, ${notification.link || null})
  `

  const result = await sql`
    SELECT * FROM notifications WHERE id = ${id}
  `

  const n = result[0]
  return {
    id: n.id,
    userId: n.user_id,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    read: n.read,
    createdAt: n.created_at,
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE notifications
    SET read = TRUE
    WHERE id = ${notificationId}
  `
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE notifications
    SET read = TRUE
    WHERE user_id = ${userId} AND read = FALSE
  `
}

// Labels
export async function getLabelsByProject(projectId?: string): Promise<any[]> {
  const sql = getSql()
  const labels = projectId
    ? await sql`
        SELECT * FROM labels
        WHERE project_id = ${projectId}
        ORDER BY name ASC
      `
    : await sql`
        SELECT * FROM labels
        ORDER BY name ASC
      `

  return labels.map((l: any) => ({
    id: l.id,
    projectId: l.project_id,
    name: l.name,
    color: l.color,
    createdAt: l.created_at,
  }))
}

export async function createLabel(label: {
  projectId: string
  name: string
  color: string
}): Promise<any> {
  const sql = getSql()
  const id = `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  await sql`
    INSERT INTO labels (id, project_id, name, color)
    VALUES (${id}, ${label.projectId}, ${label.name}, ${label.color})
  `

  const result = await sql`
    SELECT * FROM labels WHERE id = ${id}
  `

  const l = result[0]
  return {
    id: l.id,
    projectId: l.project_id,
    name: l.name,
    color: l.color,
    createdAt: l.created_at,
  }
}

export async function getLabelsByIssue(issueId: string): Promise<any[]> {
  const sql = getSql()
  const labels = await sql`
    SELECT l.* FROM labels l
    INNER JOIN issue_labels il ON l.id = il.label_id
    WHERE il.issue_id = ${issueId}
    ORDER BY l.name ASC
  `

  return labels.map((l: any) => ({
    id: l.id,
    projectId: l.project_id,
    name: l.name,
    color: l.color,
    createdAt: l.created_at,
  }))
}

export async function addLabelToIssue(issueId: string, labelId: string): Promise<void> {
  const sql = getSql()
  await sql`
    INSERT INTO issue_labels (issue_id, label_id)
    VALUES (${issueId}, ${labelId})
    ON CONFLICT (issue_id, label_id) DO NOTHING
  `
}

export async function removeLabelFromIssue(issueId: string, labelId: string): Promise<void> {
  const sql = getSql()
  await sql`
    DELETE FROM issue_labels
    WHERE issue_id = ${issueId} AND label_id = ${labelId}
  `
}

// Issue History
export async function getIssueHistory(issueId: string): Promise<any[]> {
  const sql = getSql()
  const history = await sql`
    SELECT 
      h.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as user
    FROM issue_history h
    LEFT JOIN users u ON h.user_id = u.id
    WHERE h.issue_id = ${issueId}
    ORDER BY h.created_at DESC
  `

  return history.map((h: any) => ({
    id: h.id,
    issueId: h.issue_id,
    userId: h.user_id,
    field: h.field,
    oldValue: h.old_value,
    newValue: h.new_value,
    createdAt: h.created_at,
    user: h.user,
  }))
}

export async function addIssueHistory(history: {
  issueId: string
  userId: string
  field: string
  oldValue?: string
  newValue?: string
}): Promise<void> {
  const sql = getSql()
  const id = `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  await sql`
    INSERT INTO issue_history (id, issue_id, user_id, field, old_value, new_value)
    VALUES (${id}, ${history.issueId}, ${history.userId}, ${history.field}, ${history.oldValue || null}, ${history.newValue || null})
  `
}

// Attachments
export async function getAttachmentsByIssue(issueId: string): Promise<any[]> {
  const sql = getSql()
  const attachments = await sql`
    SELECT 
      a.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as user
    FROM attachments a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.issue_id = ${issueId}
    ORDER BY a.created_at DESC
  `

  return attachments.map((a: any) => ({
    id: a.id,
    issueId: a.issue_id,
    userId: a.user_id,
    fileName: a.filename,
    fileSize: a.file_size,
    fileType: a.mime_type,
    filePath: a.file_path,
    createdAt: a.created_at,
    user: a.user,
  }))
}

export async function createAttachment(attachment: {
  issueId: string
  userId: string
  fileName?: string
  filename?: string
  fileSize: number
  fileType?: string
  mimeType?: string
  filePath: string
}): Promise<any> {
  const sql = getSql()
  const id = `attach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const fileName = attachment.fileName || attachment.filename || "file"
  const fileType = attachment.fileType || attachment.mimeType || "application/octet-stream"

  await sql`
    INSERT INTO attachments (id, issue_id, user_id, filename, file_size, mime_type, file_path)
    VALUES (${id}, ${attachment.issueId}, ${attachment.userId}, ${fileName}, ${attachment.fileSize}, ${fileType}, ${attachment.filePath})
  `

  const result = await sql`
    SELECT 
      a.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as user
    FROM attachments a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = ${id}
  `

  const a = result[0]
  return {
    id: a.id,
    issueId: a.issue_id,
    userId: a.user_id,
    fileName: a.filename,
    fileSize: a.file_size,
    fileType: a.mime_type,
    filePath: a.file_path,
    createdAt: a.created_at,
    user: a.user,
  }
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const sql = getSql()
  await sql`
    DELETE FROM attachments
    WHERE id = ${attachmentId}
  `
}

// Subtasks
export async function getSubtasksByIssue(issueId: string): Promise<any[]> {
  const sql = getSql()
  const subtasks = await sql`
    SELECT 
      s.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as assignee
    FROM subtasks s
    LEFT JOIN users u ON s.assignee_id = u.id
    WHERE s.parent_issue_id = ${issueId}
    ORDER BY s.created_at ASC
  `

  return subtasks.map((s: any) => ({
    id: s.id,
    issueId: s.parent_issue_id,
    title: s.title,
    status: s.status,
    assigneeId: s.assignee_id,
    assignee: s.assignee,
    priority: s.priority || "medium",
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }))
}

export async function createSubtask(subtask: {
  issueId: string
  title: string
  assigneeId?: string
  priority?: string
}): Promise<any> {
  const sql = getSql()
  const id = `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  await sql`
    INSERT INTO subtasks (id, parent_issue_id, title, status, assignee_id, priority)
    VALUES (${id}, ${subtask.issueId}, ${subtask.title}, 'todo', ${subtask.assigneeId || null}, ${subtask.priority || 'medium'})
  `

  const result = await sql`
    SELECT 
      s.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as assignee
    FROM subtasks s
    LEFT JOIN users u ON s.assignee_id = u.id
    WHERE s.id = ${id}
  `

  const s = result[0]
  return {
    id: s.id,
    issueId: s.parent_issue_id,
    title: s.title,
    status: s.status,
    assigneeId: s.assignee_id,
    assignee: s.assignee,
    priority: s.priority || "medium",
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }
}

export async function updateSubtask(subtaskId: string, updates: {
  title?: string
  status?: string
  assigneeId?: string
  priority?: string
}): Promise<any> {
  const sql = getSql()
  if (updates.title !== undefined) {
    await sql`UPDATE subtasks SET title = ${updates.title}, updated_at = CURRENT_TIMESTAMP WHERE id = ${subtaskId}`
  }
  if (updates.status !== undefined) {
    await sql`UPDATE subtasks SET status = ${updates.status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${subtaskId}`
  }
  if (updates.assigneeId !== undefined) {
    await sql`UPDATE subtasks SET assignee_id = ${updates.assigneeId || null}, updated_at = CURRENT_TIMESTAMP WHERE id = ${subtaskId}`
  }
  if (updates.priority !== undefined) {
    await sql`UPDATE subtasks SET priority = ${updates.priority}, updated_at = CURRENT_TIMESTAMP WHERE id = ${subtaskId}`
  }

  const result = await sql`
    SELECT 
      s.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as assignee
    FROM subtasks s
    LEFT JOIN users u ON s.assignee_id = u.id
    WHERE s.id = ${subtaskId}
  `

  if (result.length === 0) return null

  const s = result[0]
  return {
    id: s.id,
    issueId: s.parent_issue_id,
    title: s.title,
    status: s.status,
    assigneeId: s.assignee_id,
    assignee: s.assignee,
    priority: s.priority || "medium",
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }
}

export async function deleteSubtask(subtaskId: string): Promise<void> {
  const sql = getSql()
  await sql`
    DELETE FROM subtasks
    WHERE id = ${subtaskId}
  `
}

// Time Tracking
export async function getTimeLogsByIssue(issueId: string): Promise<any[]> {
  const sql = getSql()
  const timeLogs = await sql`
    SELECT 
      t.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as user
    FROM time_logs t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.issue_id = ${issueId}
    ORDER BY t.logged_at DESC
  `

  return timeLogs.map((t: any) => ({
    id: t.id,
    issueId: t.issue_id,
    userId: t.user_id,
    timeSpent: t.time_spent,
    description: t.description,
    loggedAt: t.logged_at,
    createdAt: t.created_at,
    user: t.user,
  }))
}

export async function createTimeLog(timeLog: {
  issueId: string
  userId: string
  timeSpent: number
  description?: string
  loggedAt?: string
}): Promise<any> {
  const sql = getSql()
  const id = `timelog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  await sql`
    INSERT INTO time_logs (id, issue_id, user_id, time_spent, description, logged_at)
    VALUES (${id}, ${timeLog.issueId}, ${timeLog.userId}, ${timeLog.timeSpent}, ${timeLog.description || null}, ${timeLog.loggedAt || new Date().toISOString()})
  `

  const result = await sql`
    SELECT 
      t.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as user
    FROM time_logs t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.id = ${id}
  `

  const t = result[0]
  return {
    id: t.id,
    issueId: t.issue_id,
    userId: t.user_id,
    timeSpent: t.time_spent,
    description: t.description,
    loggedAt: t.logged_at,
    createdAt: t.created_at,
    user: t.user,
  }
}

export async function getIssueEstimate(issueId: string): Promise<any> {
  const sql = getSql()
  const result = await sql`
    SELECT 
      COALESCE(SUM(time_spent), 0) as time_spent
    FROM time_logs
    WHERE issue_id = ${issueId}
  `

  const timeLogs = await getTimeLogsByIssue(issueId)
  const totalTimeSpent = timeLogs.reduce((sum, log) => sum + (log.timeSpent || 0), 0)

  return {
    issueId,
    timeSpent: totalTimeSpent,
    timeLogs,
  }
}

export async function updateIssueEstimate(issueId: string, estimate: {
  originalEstimate?: number
  remainingEstimate?: number
  timeSpent?: number
}): Promise<any> {
  const sql = getSql()
  
  const existing = await sql`
    SELECT * FROM issue_estimates WHERE issue_id = ${issueId}
  `

  if (existing.length === 0) {
    await sql`
      INSERT INTO issue_estimates (issue_id, original_estimate, remaining_estimate, time_spent)
      VALUES (${issueId}, ${estimate.originalEstimate || null}, ${estimate.remainingEstimate || null}, ${estimate.timeSpent || 0})
    `
  } else {
    const updates: string[] = []
    if (estimate.originalEstimate !== undefined) {
      updates.push(`original_estimate = ${estimate.originalEstimate}`)
    }
    if (estimate.remainingEstimate !== undefined) {
      updates.push(`remaining_estimate = ${estimate.remainingEstimate}`)
    }
    if (estimate.timeSpent !== undefined) {
      updates.push(`time_spent = ${estimate.timeSpent}`)
    }
    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`)
      await sql`
        UPDATE issue_estimates
        SET ${sql(updates.join(", "))}
        WHERE issue_id = ${issueId}
      `
    }
  }

  const result = await sql`
    SELECT * FROM issue_estimates WHERE issue_id = ${issueId}
  `

  if (result.length === 0) return null

  const e = result[0]
  return {
    issueId: e.issue_id,
    originalEstimate: e.original_estimate,
    remainingEstimate: e.remaining_estimate,
    timeSpent: e.time_spent,
    updatedAt: e.updated_at,
  }
}

// Comments
export async function updateComment(commentId: string, content: string): Promise<any> {
  const sql = getSql()
  await sql`
    UPDATE comments
    SET content = ${content}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${commentId}
  `

  const result = await sql`
    SELECT 
      c.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar) as user
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ${commentId}
  `

  if (result.length === 0) return null

  const c = result[0]
  return {
    id: c.id,
    issueId: c.issue_id,
    userId: c.user_id,
    content: c.content,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    user: c.user,
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  const sql = getSql()
  await sql`
    DELETE FROM comments
    WHERE id = ${commentId}
  `
}

// Issues
export async function deleteIssue(issueId: string): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM comments WHERE issue_id = ${issueId}`
  await sql`DELETE FROM issue_labels WHERE issue_id = ${issueId}`
  await sql`DELETE FROM issue_history WHERE issue_id = ${issueId}`
  await sql`DELETE FROM attachments WHERE issue_id = ${issueId}`
  await sql`DELETE FROM subtasks WHERE parent_issue_id = ${issueId}`
  await sql`DELETE FROM time_logs WHERE issue_id = ${issueId}`
  await sql`DELETE FROM issues WHERE id = ${issueId}`
}

// Project Members
export async function getProjectMembers(projectId: string): Promise<User[]> {
  const sql = getSql()
  const members = await sql`
    SELECT u.*
    FROM users u
    INNER JOIN project_members pm ON u.id = pm.user_id
    WHERE pm.project_id = ${projectId}
    ORDER BY u.name ASC
  `

  return members.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    createdAt: u.created_at,
  })) as User[]
}

export async function getSprintsByProject(projectId: string): Promise<Sprint[]> {
  try {
    const sql = getSql()
    const sprints = await sql`
      SELECT * FROM sprints
      WHERE project_id = ${projectId}
      ORDER BY start_date DESC, created_at DESC
    `
    if (!Array.isArray(sprints)) {
      return []
    }
    return sprints.map((s: any) => ({
      id: s.id,
      projectId: s.project_id,
      name: s.name,
      goal: s.goal,
      startDate: s.start_date,
      endDate: s.end_date,
      status: s.status,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    })) as Sprint[]
  } catch (error) {
    console.error("[v0] Error fetching sprints:", error)
    return []
  }
}

export async function getSprint(id: string): Promise<Sprint | null> {
  const sql = getSql()
  const sprints = await sql`
    SELECT * FROM sprints WHERE id = ${id}
  `
  if (sprints.length === 0) return null
  const s = sprints[0]
  return {
    id: s.id,
    projectId: s.project_id,
    name: s.name,
    goal: s.goal,
    startDate: s.start_date,
    endDate: s.end_date,
    status: s.status,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  } as Sprint
}

export async function createSprint(sprint: {
  projectId: string
  name: string
  goal?: string
  startDate?: string
  endDate?: string
  status?: "future" | "active" | "closed"
}): Promise<Sprint> {
  const sql = getSql()
  const id = `sprint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  await sql`
    INSERT INTO sprints (id, project_id, name, goal, start_date, end_date, status)
    VALUES (${id}, ${sprint.projectId}, ${sprint.name}, ${sprint.goal || null}, ${sprint.startDate || null}, ${sprint.endDate || null}, ${sprint.status || "future"})
  `
  return getSprint(id) as Promise<Sprint>
}

export async function updateSprint(id: string, updates: Partial<Sprint>): Promise<Sprint | null> {
  const sql = getSql()
  if (updates.name !== undefined) {
    await sql`UPDATE sprints SET name = ${updates.name}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.goal !== undefined) {
    await sql`UPDATE sprints SET goal = ${updates.goal}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.startDate !== undefined) {
    await sql`UPDATE sprints SET start_date = ${updates.startDate || null}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.endDate !== undefined) {
    await sql`UPDATE sprints SET end_date = ${updates.endDate || null}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.status !== undefined) {
    await sql`UPDATE sprints SET status = ${updates.status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  return getSprint(id)
}

export async function deleteSprint(id: string): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM sprints WHERE id = ${id}`
}

export async function addIssueToSprint(issueId: string, sprintId: string): Promise<void> {
  const sql = getSql()
  await sql`
    INSERT INTO issue_sprints (issue_id, sprint_id)
    VALUES (${issueId}, ${sprintId})
    ON CONFLICT (issue_id, sprint_id) DO NOTHING
  `
}

export async function removeIssueFromSprint(issueId: string, sprintId: string): Promise<void> {
  const sql = getSql()
  await sql`
    DELETE FROM issue_sprints
    WHERE issue_id = ${issueId} AND sprint_id = ${sprintId}
  `
}

export async function getIssuesBySprint(sprintId: string): Promise<Issue[]> {
  const sql = getSql()
  const issues = await sql`
    SELECT 
      i.*,
      json_build_object('id', a.id, 'name', a.name, 'email', a.email, 'avatar', a.avatar) as assignee,
      json_build_object('id', r.id, 'name', r.name, 'email', r.email, 'avatar', r.avatar) as reporter
    FROM issues i
    INNER JOIN issue_sprints isp ON i.id = isp.issue_id
    LEFT JOIN users a ON i.assignee_id = a.id
    LEFT JOIN users r ON i.reporter_id = r.id
    WHERE isp.sprint_id = ${sprintId}
    ORDER BY i.created_at DESC
  `
  return issues.map((i) => ({
    ...i,
    projectId: i.project_id,
    assigneeId: i.assignee_id,
    reporterId: i.reporter_id,
    epicId: i.epic_id,
    githubRepoId: i.github_repo_id,
    commitId: i.commit_id,
    commitMessage: i.commit_message,
    commitUrl: i.commit_url,
    commitAuthor: i.commit_author,
    commitDate: i.commit_date,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  })) as Issue[]
}

export async function createIssueLink(link: {
  sourceIssueId: string
  targetIssueId: string
  linkType: string
}): Promise<IssueLink> {
  const sql = getSql()
  const id = `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  await sql`
    INSERT INTO issue_links (id, source_issue_id, target_issue_id, link_type)
    VALUES (${id}, ${link.sourceIssueId}, ${link.targetIssueId}, ${link.linkType})
  `
  const result = await sql`
    SELECT * FROM issue_links WHERE id = ${id}
  `
  const l = result[0]
  return {
    id: l.id,
    sourceIssueId: l.source_issue_id,
    targetIssueId: l.target_issue_id,
    linkType: l.link_type,
    createdAt: l.created_at,
  } as IssueLink
}

export async function getIssueLinks(issueId: string): Promise<IssueLink[]> {
  const sql = getSql()
  const links = await sql`
    SELECT * FROM issue_links
    WHERE source_issue_id = ${issueId} OR target_issue_id = ${issueId}
    ORDER BY created_at DESC
  `
  return links.map((l: any) => ({
    id: l.id,
    sourceIssueId: l.source_issue_id,
    targetIssueId: l.target_issue_id,
    linkType: l.link_type,
    createdAt: l.created_at,
  })) as IssueLink[]
}

export async function deleteIssueLink(linkId: string): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM issue_links WHERE id = ${linkId}`
}

export async function addWatcher(issueId: string, userId: string): Promise<void> {
  const sql = getSql()
  await sql`
    INSERT INTO issue_watchers (issue_id, user_id)
    VALUES (${issueId}, ${userId})
    ON CONFLICT (issue_id, user_id) DO NOTHING
  `
}

export async function removeWatcher(issueId: string, userId: string): Promise<void> {
  const sql = getSql()
  await sql`
    DELETE FROM issue_watchers
    WHERE issue_id = ${issueId} AND user_id = ${userId}
  `
}

export async function getWatchers(issueId: string): Promise<User[]> {
  const sql = getSql()
  const watchers = await sql`
    SELECT u.* FROM users u
    INNER JOIN issue_watchers iw ON u.id = iw.user_id
    WHERE iw.issue_id = ${issueId}
    ORDER BY u.name ASC
  `
  return watchers.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    createdAt: u.created_at,
  })) as User[]
}

export async function createSavedFilter(filter: {
  userId: string
  projectId?: string
  name: string
  description?: string
  filterData: any
  isShared?: boolean
}): Promise<SavedFilter> {
  const sql = getSql()
  const id = `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  await sql`
    INSERT INTO saved_filters (id, user_id, project_id, name, description, filter_data, is_shared)
    VALUES (${id}, ${filter.userId}, ${filter.projectId || null}, ${filter.name}, ${filter.description || null}, ${JSON.stringify(filter.filterData)}, ${filter.isShared || false})
  `
  const result = await sql`
    SELECT * FROM saved_filters WHERE id = ${id}
  `
  const f = result[0]
  return {
    id: f.id,
    userId: f.user_id,
    projectId: f.project_id,
    name: f.name,
    description: f.description,
    filterData: typeof f.filter_data === 'string' ? JSON.parse(f.filter_data) : f.filter_data,
    isShared: f.is_shared,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  } as SavedFilter
}

export async function getSavedFilters(userId: string, projectId?: string): Promise<SavedFilter[]> {
  const sql = getSql()
  const filters = projectId
    ? await sql`
        SELECT * FROM saved_filters
        WHERE user_id = ${userId} AND (project_id = ${projectId} OR is_shared = TRUE)
        ORDER BY created_at DESC
      `
    : await sql`
        SELECT * FROM saved_filters
        WHERE user_id = ${userId} OR is_shared = TRUE
        ORDER BY created_at DESC
      `
  return filters.map((f: any) => ({
    id: f.id,
    userId: f.user_id,
    projectId: f.project_id,
    name: f.name,
    description: f.description,
    filterData: typeof f.filter_data === 'string' ? JSON.parse(f.filter_data) : f.filter_data,
    isShared: f.is_shared,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  })) as SavedFilter[]
}

export async function deleteSavedFilter(filterId: string): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM saved_filters WHERE id = ${filterId}`
}

export async function getCustomFields(projectId: string): Promise<CustomField[]> {
  const sql = getSql()
  const fields = await sql`
    SELECT * FROM custom_fields
    WHERE project_id = ${projectId}
    ORDER BY created_at ASC
  `
  return fields.map((f: any) => ({
    id: f.id,
    projectId: f.project_id,
    name: f.name,
    fieldType: f.field_type,
    options: typeof f.options === 'string' ? JSON.parse(f.options) : f.options,
    isRequired: f.is_required,
    createdAt: f.created_at,
  })) as CustomField[]
}

export async function createCustomField(field: {
  projectId: string
  name: string
  fieldType: string
  options?: any
  isRequired?: boolean
}): Promise<CustomField> {
  const sql = getSql()
  const id = `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  await sql`
    INSERT INTO custom_fields (id, project_id, name, field_type, options, is_required)
    VALUES (${id}, ${field.projectId}, ${field.name}, ${field.fieldType}, ${field.options ? JSON.stringify(field.options) : null}, ${field.isRequired || false})
  `
  const result = await sql`
    SELECT * FROM custom_fields WHERE id = ${id}
  `
  const f = result[0]
  return {
    id: f.id,
    projectId: f.project_id,
    name: f.name,
    fieldType: f.field_type,
    options: typeof f.options === 'string' ? JSON.parse(f.options) : f.options,
    isRequired: f.is_required,
    createdAt: f.created_at,
  } as CustomField
}

export async function getIssueCustomFieldValues(issueId: string): Promise<any[]> {
  const sql = getSql()
  const values = await sql`
    SELECT icfv.*, cf.name as field_name, cf.field_type, cf.options
    FROM issue_custom_field_values icfv
    INNER JOIN custom_fields cf ON icfv.custom_field_id = cf.id
    WHERE icfv.issue_id = ${issueId}
  `
  return values.map((v: any) => ({
    issueId: v.issue_id,
    customFieldId: v.custom_field_id,
    fieldName: v.field_name,
    fieldType: v.field_type,
    options: typeof v.options === 'string' ? JSON.parse(v.options) : v.options,
    value: v.value,
    createdAt: v.created_at,
    updatedAt: v.updated_at,
  }))
}

export async function setIssueCustomFieldValue(issueId: string, customFieldId: string, value: string): Promise<void> {
  const sql = getSql()
  await sql`
    INSERT INTO issue_custom_field_values (issue_id, custom_field_id, value, updated_at)
    VALUES (${issueId}, ${customFieldId}, ${value || null}, CURRENT_TIMESTAMP)
    ON CONFLICT (issue_id, custom_field_id) 
    DO UPDATE SET value = ${value || null}, updated_at = CURRENT_TIMESTAMP
  `
}

export async function getReleasesByProject(projectId: string): Promise<Release[]> {
  const sql = getSql()
  const releases = await sql`
    SELECT * FROM releases
    WHERE project_id = ${projectId}
    ORDER BY release_date DESC, created_at DESC
  `
  return releases.map((r: any) => ({
    id: r.id,
    projectId: r.project_id,
    name: r.name,
    version: r.version,
    description: r.description,
    releaseDate: r.release_date,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  })) as Release[]
}

export async function createRelease(release: {
  projectId: string
  name: string
  version?: string
  description?: string
  releaseDate?: string
  status?: "unreleased" | "released" | "archived"
}): Promise<Release> {
  const sql = getSql()
  const id = `release-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  await sql`
    INSERT INTO releases (id, project_id, name, version, description, release_date, status)
    VALUES (${id}, ${release.projectId}, ${release.name}, ${release.version || null}, ${release.description || null}, ${release.releaseDate || null}, ${release.status || "unreleased"})
  `
  const result = await sql`
    SELECT * FROM releases WHERE id = ${id}
  `
  const r = result[0]
  return {
    id: r.id,
    projectId: r.project_id,
    name: r.name,
    version: r.version,
    description: r.description,
    releaseDate: r.release_date,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  } as Release
}

export async function addIssueToRelease(issueId: string, releaseId: string, fixVersion: boolean = false): Promise<void> {
  const sql = getSql()
  await sql`
    INSERT INTO issue_releases (issue_id, release_id, fix_version)
    VALUES (${issueId}, ${releaseId}, ${fixVersion})
    ON CONFLICT (issue_id, release_id) 
    DO UPDATE SET fix_version = ${fixVersion}
  `
}

export async function getIssueVotes(issueId: string): Promise<number> {
  const sql = getSql()
  const result = await sql`
    SELECT COUNT(*) as count FROM issue_votes WHERE issue_id = ${issueId}
  `
  return parseInt(result[0].count) || 0
}

export async function hasUserVoted(issueId: string, userId: string): Promise<boolean> {
  const sql = getSql()
  const result = await sql`
    SELECT COUNT(*) as count FROM issue_votes
    WHERE issue_id = ${issueId} AND user_id = ${userId}
  `
  return parseInt(result[0].count) > 0
}

export async function toggleVote(issueId: string, userId: string): Promise<boolean> {
  const sql = getSql()
  const hasVoted = await hasUserVoted(issueId, userId)
  if (hasVoted) {
    await sql`
      DELETE FROM issue_votes
      WHERE issue_id = ${issueId} AND user_id = ${userId}
    `
    return false
  } else {
    await sql`
      INSERT INTO issue_votes (issue_id, user_id)
      VALUES (${issueId}, ${userId})
    `
    return true
  }
}
