import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

/**
 * Validate request `body`, `params` and/or `query` against Zod schemas.
 * Parsed (and coerced) values replace the originals so controllers receive
 * clean, typed input. Validation failures produce a 400 with field details.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) {
        // req.query is read-only in Express 5 semantics; assign parsed copy.
        Object.assign(req.query, schemas.query.parse(req.query));
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        throw ApiError.badRequest("Validation failed", details);
      }
      throw err;
    }
  };
}
