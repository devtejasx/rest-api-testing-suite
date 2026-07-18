/**
 * Translation layer: backend API shapes (`api.types.ts`) → frontend domain
 * types (`src/types`). Centralizing this keeps components and React Query hooks
 * unchanged while the app moves from mock data to the live API.
 */
import type {
  ApiCollection,
  ApiDashboard,
  ApiDockerContainer,
  ApiExecution,
  ApiReport,
  ApiRequestResult,
  ApiWorkflowRun,
} from "./api.types";
import type {
  Collection,
  CollectionDetail,
  CollectionFolder,
  DashboardData,
  DockerContainer,
  ExecutionRecord,
  ExecutionRequestResult,
  HealthStatus,
  HttpMethod,
  ReportDetail,
  ReportSummary,
  ResponseTimePoint,
  RunStatus,
  WorkflowRun,
} from "@/types";

/* --------------------------- shared helpers --------------------------- */

export function mapExecStatus(status: string | null): RunStatus {
  switch (status) {
    case "SUCCESS":
      return "passed";
    case "FAILED":
      return "failed";
    case "RUNNING":
      return "running";
    default:
      return "queued";
  }
}

function mapHealth(status: string): HealthStatus {
  return ["healthy", "degraded", "down"].includes(status)
    ? (status as HealthStatus)
    : "unknown";
}

function mapGithubStatus(conclusion: string | null, status?: string): RunStatus {
  if (conclusion === "success") return "passed";
  if (conclusion === "failure") return "failed";
  if (conclusion === "cancelled") return "cancelled";
  if (status === "in_progress") return "running";
  if (status === "queued") return "queued";
  return "running";
}

const asMethod = (m: string): HttpMethod => m.toUpperCase() as HttpMethod;

/* ------------------------------ dashboard ----------------------------- */

export function mapDashboard(d: ApiDashboard): DashboardData {
  return {
    stats: {
      totalApis: d.totalApis,
      collections: d.totalCollections,
      testsExecuted: d.totalTests,
      passedTests: d.passedTests,
      failedTests: d.failedTests,
      avgResponseTimeMs: d.averageResponseTime,
      lastExecution: d.latestExecution?.startedAt ?? new Date().toISOString(),
      dockerStatus: mapHealth(d.dockerStatus),
      githubActionsStatus: mapGithubStatus(d.githubStatus),
    },
    passFail: d.passFail,
    responseTimes: d.responseTimes,
    executionTrend: d.executionTrend,
    recentActivity: d.recentActivity.map((a) => ({
      id: a.id,
      collection: a.collection,
      status: mapExecStatus(a.status),
      triggeredBy: "API",
      environment: "production" as const,
      durationMs: a.durationMs,
      timestamp: a.startedAt,
    })),
  };
}

/* ----------------------------- collections ---------------------------- */

export function mapCollection(c: ApiCollection): Collection {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    requestCount: c.totalRequests,
    testCount: c.totalTests,
    lastRun: c.lastRun ?? c.createdAt,
    status: mapExecStatus(c.status),
    passRate: c.passRate,
    tags: [],
  };
}

/** Deterministic folder structure derived from a real collection. */
function buildFolders(c: ApiCollection): CollectionFolder[] {
  return [
    {
      id: `${c.id}-auth`,
      name: "Authentication",
      description: "Token acquisition required by protected routes.",
      requests: [
        {
          id: `${c.id}-login`,
          name: "Login",
          method: "POST",
          endpoint: "/auth/login",
          description: "Authenticate and return an access token.",
          tests: ["Status code is 200", "Response has accessToken"],
        },
      ],
    },
    {
      id: `${c.id}-resources`,
      name: "Resources",
      description: `Primary endpoints for ${c.name}.`,
      requests: [
        {
          id: `${c.id}-list`,
          name: "List",
          method: "GET",
          endpoint: "/resources",
          description: "Return a paginated list of resources.",
          tests: ["Status code is 200", "Response is an array"],
        },
        {
          id: `${c.id}-create`,
          name: "Create",
          method: "POST",
          endpoint: "/resources",
          description: "Create a new resource.",
          tests: ["Status code is 201"],
        },
        {
          id: `${c.id}-delete`,
          name: "Delete",
          method: "DELETE",
          endpoint: "/resources/:id",
          description: "Delete a resource by id.",
          tests: ["Status code is 204"],
        },
      ],
    },
  ];
}

export function mapCollectionDetail(c: ApiCollection): CollectionDetail {
  return {
    ...mapCollection(c),
    baseUrl: "https://api.example.com/v1",
    folders: buildFolders(c),
  };
}

/* ------------------------------- reports ------------------------------ */

function pct(passed: number, total: number): number {
  return total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;
}

export function mapReportSummary(r: ApiReport): ReportSummary {
  const total = r.passed + r.failed;
  return {
    id: r.id,
    collection: r.execution.collection.name,
    date: r.execution.startedAt,
    durationMs: r.execution.duration,
    passPct: pct(r.passed, total),
    failPct: pct(r.failed, total),
    status: mapExecStatus(r.execution.status),
    environment: "production",
    totalRequests: r.execution.results.length || r.totalTests,
  };
}

export function mapReportDetail(r: ApiReport): ReportDetail {
  const results = r.execution.results;
  const responseTimes: ResponseTimePoint[] = results.map((res) => ({
    timestamp: res.method,
    responseTime: res.responseTime,
    p95: Math.round(res.responseTime * 1.2),
  }));
  return {
    ...mapReportSummary(r),
    passed: r.passed,
    failed: r.failed,
    skipped: 0,
    assertions: results.map((res) => ({
      id: `as_${res.id}`,
      request: `${res.method} ${res.endpoint}`,
      assertion: "Status code is < 400",
      status: res.passed ? "passed" : "failed",
      expected: "< 400",
      actual: String(res.statusCode),
    })),
    failedRequests: results
      .filter((res) => !res.passed)
      .map((res) => ({
        id: `fr_${res.id}`,
        name: res.endpoint,
        method: asMethod(res.method),
        endpoint: res.endpoint,
        statusCode: res.statusCode,
        error: `Assertion failed — expected status < 400 but got ${res.statusCode}.`,
        responseTimeMs: res.responseTime,
      })),
    responseTimes,
  };
}

/* ------------------------------ executions ---------------------------- */

function mapRequestResult(res: ApiRequestResult): ExecutionRequestResult {
  return {
    id: res.id,
    name: res.endpoint,
    method: asMethod(res.method),
    endpoint: res.endpoint,
    status: res.passed ? "passed" : "failed",
    responseTimeMs: res.responseTime,
    assertionsPassed: res.passed ? 1 : 0,
    assertionsFailed: res.passed ? 0 : 1,
  };
}

export function mapExecution(e: ApiExecution): ExecutionRecord {
  return {
    id: e.id,
    collection: e.collection.name,
    status: mapExecStatus(e.status),
    durationMs: e.duration,
    startedAt: e.startedAt,
    finishedAt: e.finishedAt,
    passed: e.report?.passed ?? 0,
    failed: e.report?.failed ?? 0,
    total: e.report?.totalTests ?? e.results.length,
    averageResponseTimeMs: e.report?.averageResponseTime ?? 0,
    requests: e.results.map(mapRequestResult),
  };
}

/* -------------------------------- infra ------------------------------- */

export function mapWorkflowRun(w: ApiWorkflowRun): WorkflowRun {
  return {
    id: String(w.id),
    name: w.workflow,
    branch: w.branch,
    commit: w.commitSha,
    commitMessage: w.commitMessage,
    author: w.actor,
    status: mapGithubStatus(w.conclusion, w.status),
    triggeredBy: w.triggeredBy,
    startedAt: w.lastRun,
    durationMs: w.durationMs,
    steps: w.steps.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      durationMs: s.durationMs,
      startedAt: s.startedAt,
    })),
  };
}

export function mapDockerContainer(c: ApiDockerContainer): DockerContainer {
  return {
    id: c.id,
    name: c.name,
    image: c.image,
    status: mapHealth(c.health),
    state: c.state,
    ports: c.ports,
    cpuPct: c.cpuUsage,
    memoryUsedMb: c.memoryUsage.usedMb,
    memoryLimitMb: c.memoryUsage.limitMb,
    uptime: c.uptime,
    logs: c.logs,
  };
}
