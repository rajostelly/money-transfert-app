import { PrismaClient } from "@prisma/client"

declare global {
  var __prisma: PrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? globalThis.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
  globalThis.__prisma = prisma
}

export default prisma
