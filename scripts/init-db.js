const { neon } = require("@neondatabase/serverless")
const fs = require("fs")
const path = require("path")

async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("Error: DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  const scripts = [
    "001_create_tables.sql",
    "003_add_auth.sql",
    "004_add_labels_and_history.sql",
    "005_add_attachments.sql",
    "006_add_subtasks.sql",
    "007_add_time_tracking.sql",
    "008_add_notifications.sql",
    "009_add_environment.sql",
    "010_add_github_integration.sql",
    "011_add_multiple_github_repos.sql",
    "012_add_vercel_integration.sql",
    "013_add_requests.sql",
  ]

  for (const scriptName of scripts) {
    const scriptPath = path.join(__dirname, scriptName)
    const sqlContent = fs.readFileSync(scriptPath, "utf8")
    
    const lines = sqlContent.split("\n")
    let currentStatement = ""
    
    console.log(`\nRunning ${scriptName}...`)
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (trimmedLine.startsWith("--") || trimmedLine.length === 0) {
        continue
      }
      
      currentStatement += line + "\n"
      
      if (trimmedLine.endsWith(";")) {
        const statement = currentStatement.trim().replace(/;$/, "")
        if (statement.length > 0) {
          try {
            await sql.query(statement)
            console.log(`✓ Executed statement`)
          } catch (error) {
            if (error.message.includes("already exists") || 
                error.message.includes("duplicate") ||
                error.code === "42P07" ||
                error.code === "42710") {
              console.log(`⚠ Statement already executed (skipping)`)
            } else {
              console.error(`✗ Error executing statement: ${error.message}`)
              console.error(`Statement: ${statement.substring(0, 100)}...`)
              throw error
            }
          }
        }
        currentStatement = ""
      }
    }
  }

  console.log("\n✓ Database initialization completed!")
}

initDatabase().catch((error) => {
  console.error("Error initializing database:", error)
  process.exit(1)
})

