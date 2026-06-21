import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Verbose query logging only in development — never in production logs.
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  })

// Cache on globalThis so any module re-evaluation reuses the same client
// (avoids spawning extra Prisma engines / connections during restart churn).
globalForPrisma.prisma = db
