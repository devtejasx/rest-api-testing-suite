import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import type { ErrorResponse } from "../types";

const tooMany: ErrorResponse = {
  success: false,
  message: "Too many requests, please try again later",
  errors: [],
};

/** Global API rate limiter. */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});

/** Stricter limiter for auth endpoints to slow brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});
