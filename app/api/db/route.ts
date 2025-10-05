
import { readFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

export const dynamic = "force-dynamic"

const dataDir = join(process.cwd(), "data")
const dbPath = join(dataDir, "app.db")
const schemaPath = join(process.cwd(), "database", "schema.sql")

let db: Database.Database | null = null

function getDb() {
  if (!db) {
    if (!existsSync(dataDir)) mkdirSync(dataDir)
    db = new Database(dbPath)
    const schema = readFileSync(schemaPath, "utf-8")
    db.exec(schema)
  }
  return db
}

export async function GET() {
  const db = getDb()
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
  return new Response(JSON.stringify({ ok: true, tables: rows }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}


