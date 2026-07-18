/**
 * Prisma seed entry point. Run with `npm run seed` (which invokes
 * `prisma db seed` → `tsx prisma/seed.ts`).
 */
import { seedDatabase } from "../src/seed";
import { prisma } from "../src/prisma/client";
import { logger } from "../src/config/logger";

seedDatabase()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    logger.error(`Seed failed: ${err instanceof Error ? err.stack : String(err)}`);
    await prisma.$disconnect();
    process.exit(1);
  });
