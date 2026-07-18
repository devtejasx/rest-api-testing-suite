import { PrismaClient } from "@prisma/client";
import { isProduction } from "../config/env";
import { logger } from "../config/logger";

/**
 * A single, shared PrismaClient instance. In development we cache it on the
 * global object so hot-reloads (tsx watch) don't exhaust the connection pool.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ["error"] : ["error", "warn"],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}

/** Verify database connectivity at startup. */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("✅ Connected to PostgreSQL");
}

/** Gracefully close the pool on shutdown. */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("🔌 Disconnected from PostgreSQL");
}
