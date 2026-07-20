import request from "supertest";
import { app } from "./helpers";

describe("Reports & Dashboard", () => {
  it("lists reports (paginated)", async () => {
    const res = await request(app).get("/api/reports");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("returns aggregated dashboard metrics", async () => {
    const res = await request(app).get("/api/dashboard");
    expect(res.status).toBe(200);
    for (const key of [
      "totalCollections",
      "totalExecutions",
      "passedTests",
      "failedTests",
      "passFail",
      "recentActivity",
    ]) {
      expect(res.body.data).toHaveProperty(key);
    }
  });

  it("returns 404 for an unknown report", async () => {
    const res = await request(app).get(
      "/api/reports/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(404);
  });
});
