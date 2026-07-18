import type { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedRequest } from "../types";

/**
 * Require a valid Bearer token. Attaches the decoded user to `req.user`.
 */
export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Missing or malformed Authorization header");
  }

  const token = header.slice(7).trim();
  if (!token) {
    throw ApiError.unauthorized("Missing bearer token");
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
}

/**
 * Restrict a route to specific roles. Must run after `authenticate`.
 */
export function authorize(...roles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) throw ApiError.unauthorized();
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw ApiError.forbidden("Insufficient permissions");
    }
    next();
  };
}
