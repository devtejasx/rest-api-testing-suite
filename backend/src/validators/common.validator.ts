import { z } from "zod";

/** Reusable UUID path-param schema. */
export const idParamSchema = z.object({
  id: z.string().uuid("A valid resource id is required"),
});

/** Reusable pagination query schema. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(50),
});
