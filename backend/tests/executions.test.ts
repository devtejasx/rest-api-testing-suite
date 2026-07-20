import request from "supertest";
import { app } from "./helpers";

describe("Executions", () => {
  it("lists executions (paginated)", async () => {
    const res = await request(app).get("/api/executions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("returns 404 for an unknown execution", async () => {
    const res = await request(app).get(
      "/api/executions/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(404);
  });

  it("rejects running a collection without a token (401)", async () => {
    const res = await request(app)
      .post("/api/executions/run")
      .send({ collectionId: "00000000-0000-0000-0000-000000000000" });
    expect(res.status).toBe(401);
  });

  it("rejects deleting an execution without a token (401)", async () => {
    const res = await request(app).delete(
      "/api/executions/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(401);
  });
});
