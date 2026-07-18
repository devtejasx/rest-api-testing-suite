/**
 * Compiled seed runner used inside the Docker image (where devDependencies
 * such as tsx are not installed). Built to dist/seed/run.js and invoked by the
 * container entrypoint. Local development uses `npm run seed` instead.
 */
import { seedDatabase } from "./index";
import { prisma } from "../prisma/client";
import { logger } from "../config/logger";

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
