import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    console.log("[v0] Starting database initialization...");

    // The database schema is now managed by Prisma migrations
    // Check if we can connect to the database
    await prisma.$connect();
    console.log("[v0] Database connection successful!");

    // Check if any users exist
    const existingUsers = await prisma.user.count();
    console.log(`[v0] Found ${existingUsers} existing users`);

    // Insert test users
    const testUsers = [
      { email: "client1@test.com", name: "Client One", role: "CLIENT" },
      { email: "client2@test.com", name: "Client Two", role: "CLIENT" },
      { email: "client3@test.com", name: "Client Three", role: "CLIENT" },
      { email: "client4@test.com", name: "Client Four", role: "CLIENT" },
      { email: "admin@test.com", name: "Admin User", role: "ADMIN" },
      {
        email: "madagascar1@test.com",
        name: "Madagascar One",
        role: "MADAGASCAR_TEAM",
      },
      {
        email: "madagascar2@test.com",
        name: "Madagascar Two",
        role: "MADAGASCAR_TEAM",
      },
    ];

    const passwordHash = await bcrypt.hash("password123", 10);
    console.log("[v0] Generated password hash for password123");

    for (const user of testUsers) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          password: passwordHash,
          name: user.name,
          role: user.role as any,
        },
        create: {
          email: user.email,
          password: passwordHash,
          name: user.name,
          role: user.role as any,
        },
      });
    }

    console.log("[v0] Test users inserted successfully");

    return Response.json({
      success: true,
      message: "Database initialized successfully with test users",
    });
  } catch (error) {
    console.error("[v0] Database initialization error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
