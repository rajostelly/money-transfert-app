import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!databaseUrl) {
  throw new Error("No database connection string found. Please check your environment variables.")
}

const sql = neon(databaseUrl)

export { sql }

export async function getUser(email: string) {
  const result = await sql`
    SELECT * FROM users_sync WHERE email = ${email} LIMIT 1
  `
  return result[0] || null
}

export async function createUser(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
}) {
  const result = await sql`
    INSERT INTO users_sync (email, name, raw_json, created_at, updated_at)
    VALUES (${data.email}, ${data.firstName + " " + data.lastName}, ${JSON.stringify({
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || "CLIENT",
    })}, NOW(), NOW())
    RETURNING *
  `
  return result[0]
}

export async function getUserById(id: string) {
  const result = await sql`
    SELECT * FROM users_sync WHERE id = ${id} LIMIT 1
  `
  return result[0] || null
}

export async function updateUser(
  id: string,
  data: Partial<{
    firstName: string
    lastName: string
    phone: string
    isActive: boolean
  }>,
) {
  const user = await getUserById(id)
  if (!user) return null

  const currentData = user.raw_json || {}
  const updatedData = {
    ...currentData,
    ...data,
    firstName: data.firstName || currentData.firstName,
    lastName: data.lastName || currentData.lastName,
  }

  const fullName = `${updatedData.firstName || ""} ${updatedData.lastName || ""}`.trim()

  const result = await sql`
    UPDATE users_sync 
    SET name = ${fullName}, raw_json = ${JSON.stringify(updatedData)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] || null
}
