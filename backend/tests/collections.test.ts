import request from "supertest";
import { app, loginAdmin, firstCollectionId } from "./helpers";

describe("Collections", () => {
  it("lists collections (paginated)", async () => {
    const res = await request(app).get("/api/collections");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(typeof res.body.data.total).toBe("number");
  });

  it("fetches a single collection by id", async () => {
    const id = await firstCollectionId();
    const res = await request(app).get(`/api/collections/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
    expect(res.body.data).toHaveProperty("passRate");
  });

  it("rejects creation without a token (401)", async () => {
    const res = await request(app).post("/api/collections").send({ name: "Nope" });
    expect(res.status).toBe(401);
  });

  it("creates and deletes a collection when authenticated", async () => {
    const token = await loginAdmin();
    const created = await request(app)
      .post("/api/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Jest Collection", totalRequests: 2, totalTests: 4 });
    expect(created.status).toBe(201);
    const id = created.body.data.id;

    const del = await request(app)
      .delete(`/api/collections/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  it("validates the id param (400 for non-uuid)", async () => {
    const res = await request(app).get("/api/collections/not-a-uuid");
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("returns 404 for an unknown collection", async () => {
    const res = await request(app).get(
      "/api/collections/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(404);
  });

  it("returns execution history for a collection", async () => {
    const id = await firstCollectionId();
    const res = await request(app).get(`/api/collections/${id}/history`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
