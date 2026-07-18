import type {
  ExecutionState,
  ExecutionLog,
  LogLevel,
} from "@/types";

/**
 * Client-side run simulator used by the Test Execution page to animate a
 * Newman-style run in real time. This is UI behaviour (a progress animation),
 * not mock API data — the real execution history comes from GET /executions.
 */

/** The ordered set of requests a simulated run steps through. */
export const executionRequestTemplates: Omit<
  ExecutionState["requests"][number],
  "status" | "responseTimeMs" | "assertionsPassed" | "assertionsFailed"
>[] = [
  { id: "e_login", name: "Login", method: "POST", endpoint: "/auth/login" },
  { id: "e_refresh", name: "Refresh Token", method: "POST", endpoint: "/auth/refresh" },
  { id: "e_list_users", name: "List Users", method: "GET", endpoint: "/users" },
  { id: "e_get_user", name: "Get User", method: "GET", endpoint: "/users/:id" },
  { id: "e_create_user", name: "Create User", method: "POST", endpoint: "/users" },
  { id: "e_update_user", name: "Update User", method: "PUT", endpoint: "/users/:id" },
  { id: "e_list_todos", name: "List Todos", method: "GET", endpoint: "/users/:id/todos" },
  { id: "e_create_todo", name: "Create Todo", method: "POST", endpoint: "/users/:id/todos" },
  { id: "e_delete_user", name: "Delete User", method: "DELETE", endpoint: "/users/:id" },
];

let logSeq = 0;
export function makeLog(level: LogLevel, message: string): ExecutionLog {
  logSeq += 1;
  return {
    id: `log_${Date.now()}_${logSeq}`,
    timestamp: new Date().toISOString(),
    level,
    message,
  };
}

/** A fresh, not-yet-started execution state for the given collection. */
export function createInitialExecutionState(
  collectionId = "col_users",
  collectionName = "Users API",
): ExecutionState {
  return {
    runId: `run_${Date.now()}`,
    collectionId,
    collectionName,
    status: "queued",
    progress: 0,
    currentRequest: null,
    summary: {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: executionRequestTemplates.length,
      durationMs: 0,
    },
    logs: [],
    requests: executionRequestTemplates.map((r) => ({
      ...r,
      status: "queued",
      responseTimeMs: 0,
      assertionsPassed: 0,
      assertionsFailed: 0,
    })),
  };
}
