/**
 * Raw response shapes returned by the backend API. These are intentionally
 * kept separate from the frontend domain types in `src/types` — the mapper
 * layer (`mappers.ts`) translates between the two so the UI never has to know
 * about the backend's exact field names.
 */

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiPaginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiDashboard {
  totalApis: number;
  totalCollections: number;
  totalExecutions: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageResponseTime: number;
  passPercentage: number;
  failPercentage: number;
  dockerStatus: string;
  githubStatus: string;
  latestExecution: {
    id: string;
    collection: string;
    status: string;
    duration: number;
    startedAt: string;
    finishedAt: string | null;
  } | null;
  passFail: { name: "Passed" | "Failed" | "Skipped"; value: number }[];
  responseTimes: { timestamp: string; responseTime: number; p95: number }[];
  executionTrend: { date: string; passed: number; failed: number }[];
  recentActivity: {
    id: string;
    collection: string;
    status: string;
    durationMs: number;
    startedAt: string;
  }[];
}

export interface ApiCollection {
  id: string;
  name: string;
  description: string;
  totalRequests: number;
  totalTests: number;
  createdAt: string;
  status: "RUNNING" | "SUCCESS" | "FAILED" | null;
  lastRun: string | null;
  passRate: number;
}

export interface ApiRequestResult {
  id: string;
  executionId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  passed: boolean;
}

export interface ApiExecution {
  id: string;
  collectionId: string;
  status: "RUNNING" | "SUCCESS" | "FAILED";
  duration: number;
  startedAt: string;
  finishedAt: string | null;
  collection: { id: string; name: string };
  results: ApiRequestResult[];
  report: {
    id: string;
    totalTests: number;
    passed: number;
    failed: number;
    averageResponseTime: number;
  } | null;
}

export interface ApiReport {
  id: string;
  executionId: string;
  totalTests: number;
  passed: number;
  failed: number;
  averageResponseTime: number;
  execution: {
    id: string;
    status: "RUNNING" | "SUCCESS" | "FAILED";
    duration: number;
    startedAt: string;
    finishedAt: string | null;
    collection: { id: string; name: string };
    results: ApiRequestResult[];
  };
}

export interface ApiWorkflowStep {
  id: string;
  name: string;
  status: "success" | "failed" | "running" | "pending" | "skipped";
  durationMs: number;
  startedAt: string;
}

export interface ApiWorkflowRun {
  id: number;
  workflow: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | null;
  branch: string;
  commitSha: string;
  commitMessage: string;
  actor: string;
  triggeredBy: "push" | "pull_request" | "schedule" | "manual";
  durationMs: number;
  lastRun: string;
  steps: ApiWorkflowStep[];
}

export interface ApiDockerContainer {
  id: string;
  name: string;
  image: string;
  status: "running" | "exited" | "restarting";
  state: "running" | "exited" | "restarting";
  health: "healthy" | "degraded" | "down";
  cpuUsage: number;
  memoryUsage: { usedMb: number; limitMb: number };
  ports: string[];
  uptime: string;
  logs: string[];
}
