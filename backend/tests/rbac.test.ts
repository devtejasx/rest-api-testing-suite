import request from "supertest";
import { app, login, loginAdmin } from "./helpers";

describe("Refresh tokens & logout (Feature 7)", () => {
  it("rotates the refresh token (old one becomes invalid)", async () => {
    const { refreshToken } = await login("admin@rats.dev", "Admin@12345");
    expect(refreshToken).toEqual(expect.any(String));

    const first = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken });
    expect(first.status).toBe(200);
    expect(first.body.data.token).toEqual(expect.any(String));
    expect(first.body.data.refreshToken).not.toBe(refreshToken);

    // The original (rotated) token can no longer be reused.
    const reused = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken });
    expect(reused.status).toBe(401);
  });

  it("revokes a refresh token on logout", async () => {
    const { refreshToken } = await login("admin@rats.dev", "Admin@12345");
    const out = await request(app).post("/api/auth/logout").send({ refreshToken });
    expect(out.status).toBe(200);

    const after = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(after.status).toBe(401);
  });
});

describe("Role-based access (Feature 8)", () => {
  it("lets an Admin create a collection", async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post("/api/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "RBAC Admin Collection" });
    expect(res.status).toBe(201);
    await request(app)
      .delete(`/api/collections/${res.body.data.id}`)
      .set("Authorization", `Bearer ${token}`);
  });

  it("forbids a Viewer from creating a collection (403)", async () => {
    const { token } = await login("viewer@rats.dev", "Password@123");
    const res = await request(app)
      .post("/api/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Should be forbidden" });
    expect(res.status).toBe(403);
  });

  it("forbids a Viewer from running a collection (403)", async () => {
    const { token } = await login("viewer@rats.dev", "Password@123");
    const res = await request(app)
      .post("/api/executions/run")
      .set("Authorization", `Bearer ${token}`)
      .send({ collectionId: "00000000-0000-0000-0000-000000000000" });
    expect(res.status).toBe(403);
  });
});
