import { z } from "zod";

export const runExecutionSchema = z.object({
  collectionId: z.string().uuid("A valid collectionId is required"),
});

export const listExecutionsQuerySchema = z.object({
  collectionId: z.string().uuid().optional(),
  status: z.enum(["RUNNING", "SUCCESS", "FAILED"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type RunExecutionInput = z.infer<typeof runExecutionSchema>;
