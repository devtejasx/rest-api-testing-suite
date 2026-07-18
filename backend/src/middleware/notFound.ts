import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/** Catch-all for unmatched routes — forwards a 404 to the error handler. */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}
