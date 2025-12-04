const { neon } = require("@neondatabase/serverless")

async function dropTables() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("Error: DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  const tables = [
    "comments",
    "issues",
    "project_members",
    "projects",
    "sessions",
    "users",
  ]

  console.log("Dropping existing tables...")
  
  for (const table of tables) {
    try {
      await sql.query(`DROP TABLE IF EXISTS ${table} CASCADE`)
      console.log(`✓ Dropped table: ${table}`)
    } catch (error) {
      console.log(`⚠ Error dropping table ${table}: ${error.message}`)
    }
  }

  console.log("\n✓ Tables dropped!")
}

dropTables().catch((error) => {
  console.error("Error dropping tables:", error)
  process.exit(1)
})


