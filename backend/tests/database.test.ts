import { prisma } from "../src/prisma/client";

describe("Database", () => {
  it("connects and can query", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    expect(result).toBeDefined();
  });

  it("has the seeded admin user", async () => {
    const count = await prisma.user.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
