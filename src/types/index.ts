/**
 * Central domain type definitions for the REST API Testing Suite.
 * These describe the shapes the (future) backend will return. For now they
 * are satisfied by the mock data layer under `src/services/mock`.
 */

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type RunStatus = "passed" | "failed" | "running" | "queued" | "skipped" | "cancelled";

export type HealthStatus = "healthy" | "degraded" | "down" | "unknown";

export type Environment = "development" | "staging" | "production";

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export interface DashboardStats {
  totalApis: number;
  collections: number;
  testsExecuted: number;
  passedTests: number;
  failedTests: number;
  avgResponseTimeMs: number;
  lastExecution: string; // ISO date
  dockerStatus: HealthStatus;
  githubActionsStatus: RunStatus;
}

export interface PassFailDatum {
  name: "Passed" | "Failed" | "Skipped";
  value: number;
}

export interface ResponseTimePoint {
  timestamp: string; // label e.g. "09:00"
  responseTime: number; // ms
  p95: number; // ms
}

export interface ExecutionTrendPoint {
  date: string; // e.g. "Mon"
  passed: number;
  failed: number;
}

export interface ActivityItem {
  id: string;
  collection: string;
  status: RunStatus;
  triggeredBy: string;
  environment: Environment;
  durationMs: number;
  timestamp: string; // ISO
}

export interface DashboardData {
  stats: DashboardStats;
  passFail: PassFailDatum[];
  responseTimes: ResponseTimePoint[];
  executionTrend: ExecutionTrendPoint[];
  recentActivity: ActivityItem[];
}

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

export interface Collection {
  id: string;
  name: string;
  description: string;
  requestCount: number;
  testCount: number;
  lastRun: string; // ISO
  status: RunStatus;
  passRate: number; // 0-100
  tags: string[];
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  endpoint: string;
  description: string;
  tests: string[]; // assertion descriptions
}

export interface CollectionFolder {
  id: string;
  name: string;
  description: string;
  requests: ApiRequest[];
}

export interface CollectionDetail extends Collection {
  baseUrl: string;
  folders: CollectionFolder[];
}

/* ------------------------------------------------------------------ */
/* Test execution                                                      */
/* ------------------------------------------------------------------ */

export type LogLevel = "info" | "success" | "error" | "warn";

export interface ExecutionLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
}

export interface ExecutionRequestResult {
  id: string;
  name: string;
  method: HttpMethod;
  endpoint: string;
  status: RunStatus;
  responseTimeMs: number;
  assertionsPassed: number;
  assertionsFailed: number;
}

export interface ExecutionSummary {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  durationMs: number;
}

export interface ExecutionState {
  runId: string;
  collectionId: string;
  collectionName: string;
  status: RunStatus;
  progress: number; // 0-100
  currentRequest: string | null;
  summary: ExecutionSummary;
  logs: ExecutionLog[];
  requests: ExecutionRequestResult[];
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export interface ReportSummary {
  id: string;
  collection: string;
  date: string; // ISO
  durationMs: number;
  passPct: number;
  failPct: number;
  status: RunStatus;
  environment: Environment;
  totalRequests: number;
}

export interface AssertionResult {
  id: string;
  request: string;
  assertion: string;
  status: "passed" | "failed";
  expected?: string;
  actual?: string;
}

export interface FailedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  endpoint: string;
  statusCode: number;
  error: string;
  responseTimeMs: number;
}

export interface ReportDetail extends ReportSummary {
  passed: number;
  failed: number;
  skipped: number;
  assertions: AssertionResult[];
  failedRequests: FailedRequest[];
  responseTimes: ResponseTimePoint[];
}

/* ------------------------------------------------------------------ */
/* CI/CD                                                               */
/* ------------------------------------------------------------------ */

export type PipelineStepStatus = "success" | "failed" | "running" | "pending" | "skipped";

export interface PipelineStep {
  id: string;
  name: string;
  status: PipelineStepStatus;
  durationMs: number;
  startedAt: string; // ISO
}

export interface WorkflowRun {
  id: string;
  name: string;
  branch: string;
  commit: string;
  commitMessage: string;
  author: string;
  status: RunStatus;
  triggeredBy: "push" | "pull_request" | "schedule" | "manual";
  startedAt: string;
  durationMs: number;
  steps: PipelineStep[];
}

/* ------------------------------------------------------------------ */
/* Docker                                                              */
/* ------------------------------------------------------------------ */

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: HealthStatus;
  state: "running" | "exited" | "restarting";
  ports: string[];
  cpuPct: number;
  memoryUsedMb: number;
  memoryLimitMb: number;
  uptime: string;
  logs: string[];
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export interface AppSettings {
  theme: "dark" | "light";
  environment: Environment;
  postmanEnvironment: string;
  github: {
    repository: string;
    workflow: string;
    token: string; // masked in UI
  };
}
