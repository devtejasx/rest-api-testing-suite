import { apiGet } from "./axios";
import { mapExecution } from "./mappers";
import type { ApiExecution, ApiPaginated } from "./api.types";
import type { ExecutionRecord } from "@/types";

/**
 * Executions service. Persisted execution history from the backend
 * (GET /executions, GET /executions/:id). The live run animation on the Test
 * Execution page is driven separately by the `useExecution` simulator hook.
 */
export const executionService = {
  async list(): Promise<ExecutionRecord[]> {
    const page = await apiGet<ApiPaginated<ApiExecution>>("/executions", {
      params: { pageSize: 50 },
    });
    return page.items.map(mapExecution);
  },

  async getById(id: string): Promise<ExecutionRecord> {
    const execution = await apiGet<ApiExecution>(`/executions/${id}`);
    return mapExecution(execution);
  },
};
