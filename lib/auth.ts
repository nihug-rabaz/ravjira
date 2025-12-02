import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"

const sql = neon(process.env.DATABASE_URL!)

// Simple password hashing (in production, use bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function register(email: string, password: string, name: string) {
  // Check if user already exists
  const existingUser = await sql`
    SELECT id FROM users WHERE email = ${email}
  `

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" }
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const userId = `user-${nanoid()}`
  await sql`
    INSERT INTO users (id, email, password_hash, name, avatar)
    VALUES (${userId}, ${email}, ${passwordHash}, ${name}, '/user-avatar.jpg')
  `

  // Create session
  const sessionId = nanoid()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt.toISOString()})
  `

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return { success: true, userId }
}

export async function login(email: string, password: string) {
  const passwordHash = await hashPassword(password)

  const user = await sql`
    SELECT id, name, email FROM users 
    WHERE email = ${email} AND password_hash = ${passwordHash}
  `

  if (user.length === 0) {
    return { success: false, error: "Invalid email or password" }
  }

  // Create session
  const sessionId = nanoid()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${user[0].id}, ${expiresAt.toISOString()})
  `

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return { success: true, user: user[0] }
}

export async function logout() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`
    cookieStore.delete("session")
  }

  return { success: true }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (!sessionId) {
    return null
  }

  const result = await sql`
    SELECT u.id, u.name, u.email, u.avatar
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${sessionId} AND s.expires_at > NOW()
  `

  if (result.length === 0) {
    // Clean up expired session
    cookieStore.delete("session")
    return null
  }

  return result[0]
}
