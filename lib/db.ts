import { neon } from "@neondatabase/serverless"
import type { Issue, Project, User, Comment } from "./types"

const sql = neon(process.env.DATABASE_URL!)

// Projects
export async function getProjects(): Promise<Project[]> {
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

  return projects.map((p) => ({
    ...p,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  })) as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
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
  return {
    ...p,
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
}): Promise<Project> {
  console.log("[v0] createProject called with:", project)

  const id = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  console.log("[v0] Generated project ID:", id)

  await sql`
    INSERT INTO projects (id, name, key, description, icon)
    VALUES (
      ${id},
      ${project.name},
      ${project.key},
      ${project.description},
      ${project.avatar || null}
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
  updates: { name?: string; description?: string; avatar?: string },
): Promise<Project | null> {
  if (updates.name !== undefined) {
    await sql`UPDATE projects SET name = ${updates.name}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.description !== undefined) {
    await sql`UPDATE projects SET description = ${updates.description}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }
  if (updates.avatar !== undefined) {
    await sql`UPDATE projects SET icon = ${updates.avatar}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
  }

  return getProject(id)
}

export async function deleteProject(id: string): Promise<void> {
  // Delete related data first (cascade)
  await sql`DELETE FROM comments WHERE issue_id IN (SELECT id FROM issues WHERE project_id = ${id})`
  await sql`DELETE FROM issues WHERE project_id = ${id}`
  await sql`DELETE FROM project_members WHERE project_id = ${id}`
  await sql`DELETE FROM projects WHERE id = ${id}`
}

// Issues
export async function getIssuesByProject(projectId: string): Promise<Issue[]> {
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
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  })) as Issue[]
}

export async function getIssue(id: string): Promise<Issue | null> {
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
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  } as Issue
}

export async function createIssue(issue: Omit<Issue, "id" | "createdAt" | "updatedAt">): Promise<Issue> {
  const id = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const result = await sql`
    INSERT INTO issues (id, key, title, description, type, status, priority, project_id, assignee_id, reporter_id)
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
      ${issue.reporterId}
    )
    RETURNING *
  `

  return getIssue(id) as Promise<Issue>
}

export async function updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | null> {
  const sets: string[] = []
  const values: any[] = []

  if (updates.title !== undefined) {
    sets.push(`title = $${sets.length + 1}`)
    values.push(updates.title)
  }
  if (updates.description !== undefined) {
    sets.push(`description = $${sets.length + 1}`)
    values.push(updates.description)
  }
  if (updates.type !== undefined) {
    sets.push(`type = $${sets.length + 1}`)
    values.push(updates.type)
  }
  if (updates.status !== undefined) {
    sets.push(`status = $${sets.length + 1}`)
    values.push(updates.status)
  }
  if (updates.priority !== undefined) {
    sets.push(`priority = $${sets.length + 1}`)
    values.push(updates.priority)
  }
  if (updates.assigneeId !== undefined) {
    sets.push(`assignee_id = $${sets.length + 1}`)
    values.push(updates.assigneeId)
  }

  if (sets.length === 0) return getIssue(id)

  sets.push(`updated_at = CURRENT_TIMESTAMP`)

  await sql`
    UPDATE issues
    SET ${sql(sets.join(", "))}
    WHERE id = ${id}
  `

  return getIssue(id)
}

// Users
export async function getUsers(): Promise<User[]> {
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
