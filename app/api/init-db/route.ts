import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    console.log("[v0] Starting database initialization...")

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'client',
        balance DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("[v0] Users table created successfully")

    // Insert test users
    const testUsers = [
      { email: "client1@test.com", name: "Client One", role: "client", balance: 1000.0 },
      { email: "client2@test.com", name: "Client Two", role: "client", balance: 1500.0 },
      { email: "client3@test.com", name: "Client Three", role: "client", balance: 2000.0 },
      { email: "client4@test.com", name: "Client Four", role: "client", balance: 500.0 },
      { email: "admin@test.com", name: "Admin User", role: "admin", balance: 10000.0 },
      { email: "madagascar1@test.com", name: "Madagascar One", role: "client", balance: 750.0 },
      { email: "madagascar2@test.com", name: "Madagascar Two", role: "client", balance: 1250.0 },
    ]

    const passwordHash = await bcrypt.hash("password123", 10)
    console.log("[v0] Generated password hash for password123")

    for (const user of testUsers) {
      await sql`
        INSERT INTO users (email, password_hash, name, role, balance)
        VALUES (${user.email}, ${passwordHash}, ${user.name}, ${user.role}, ${user.balance})
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          balance = EXCLUDED.balance,
          updated_at = CURRENT_TIMESTAMP
      `
    }

    console.log("[v0] Test users inserted successfully")

    return Response.json({
      success: true,
      message: "Database initialized successfully with test users",
    })
  } catch (error) {
    console.error("[v0] Database initialization error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
