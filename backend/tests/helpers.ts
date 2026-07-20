import request from "supertest";
import type { Application } from "express";
import { createApp } from "../src/app";

/** A single app instance reused across the test suite (no port binding). */
export const app: Application = createApp();

interface AuthData {
  token?: string;
  refreshToken?: string;
  user?: { role?: string };
}

/** Log in and return the full auth payload (token + refreshToken + user). */
export async function login(email: string, password: string): Promise<AuthData> {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return (res.body?.data ?? {}) as AuthData;
}

/** Log in as the seeded admin and return a JWT. */
export async function loginAdmin(): Promise<string> {
  const data = await login(
    process.env.SEED_ADMIN_EMAIL ?? "admin@rats.dev",
    process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345",
  );
  return data.token as string;
}

/** Fetch the id of the first collection (for detail/history tests). */
export async function firstCollectionId(): Promise<string | undefined> {
  const res = await request(app).get("/api/collections?pageSize=1");
  return res.body?.data?.items?.[0]?.id as string | undefined;
}
