import type { ReportSummary, ReportDetail } from "@/types";

export const reportsMock: ReportSummary[] = [
  {
    id: "rep_2041",
    collection: "Users API",
    date: "2026-07-18T13:42:00.000Z",
    durationMs: 12400,
    passPct: 98.5,
    failPct: 1.5,
    status: "passed",
    environment: "production",
    totalRequests: 68,
  },
  {
    id: "rep_2040",
    collection: "Authentication",
    date: "2026-07-18T12:15:00.000Z",
    durationMs: 8600,
    passPct: 84.6,
    failPct: 15.4,
    status: "failed",
    environment: "staging",
    totalRequests: 52,
  },
  {
    id: "rep_2039",
    collection: "Todos API",
    date: "2026-07-18T11:00:00.000Z",
    durationMs: 9800,
    passPct: 100,
    failPct: 0,
    status: "passed",
    environment: "production",
    totalRequests: 44,
  },
  {
    id: "rep_2038",
    collection: "Notifications",
    date: "2026-07-18T09:30:00.000Z",
    durationMs: 6300,
    passPct: 96.7,
    failPct: 3.3,
    status: "passed",
    environment: "staging",
    totalRequests: 30,
  },
  {
    id: "rep_2037",
    collection: "Products API",
    date: "2026-07-17T18:05:00.000Z",
    durationMs: 15200,
    passPct: 97.2,
    failPct: 2.8,
    status: "passed",
    environment: "production",
    totalRequests: 71,
  },
  {
    id: "rep_2036",
    collection: "Payments API",
    date: "2026-07-17T14:48:00.000Z",
    durationMs: 21100,
    passPct: 92.1,
    failPct: 7.9,
    status: "failed",
    environment: "production",
    totalRequests: 89,
  },
  {
    id: "rep_2035",
    collection: "Analytics API",
    date: "2026-07-17T10:30:00.000Z",
    durationMs: 7400,
    passPct: 94.7,
    failPct: 5.3,
    status: "passed",
    environment: "development",
    totalRequests: 38,
  },
];

/** Detailed report for the failing Authentication run. */
const authReportDetail: ReportDetail = {
  ...reportsMock[1],
  passed: 44,
  failed: 8,
  skipped: 0,
  assertions: [
    {
      id: "as_01",
      request: "Login",
      assertion: "Status code is 200",
      status: "passed",
    },
    {
      id: "as_02",
      request: "Login",
      assertion: "Response has accessToken",
      status: "passed",
    },
    {
      id: "as_03",
      request: "Refresh Token",
      assertion: "Status code is 200",
      status: "failed",
      expected: "200",
      actual: "401 Unauthorized",
    },
    {
      id: "as_04",
      request: "Password Reset",
      assertion: "Reset email queued",
      status: "failed",
      expected: "true",
      actual: "false",
    },
    {
      id: "as_05",
      request: "MFA Verify",
      assertion: "Status code is 200",
      status: "failed",
      expected: "200",
      actual: "500 Internal Server Error",
    },
    {
      id: "as_06",
      request: "Logout",
      assertion: "Token revoked",
      status: "passed",
    },
  ],
  failedRequests: [
    {
      id: "fr_01",
      name: "Refresh Token",
      method: "POST",
      endpoint: "/auth/refresh",
      statusCode: 401,
      error: "Refresh token expired or invalid signature.",
      responseTimeMs: 142,
    },
    {
      id: "fr_02",
      name: "MFA Verify",
      method: "POST",
      endpoint: "/auth/mfa/verify",
      statusCode: 500,
      error: "TypeError: cannot read property 'secret' of undefined.",
      responseTimeMs: 388,
    },
    {
      id: "fr_03",
      name: "Password Reset",
      method: "POST",
      endpoint: "/auth/password/reset",
      statusCode: 502,
      error: "Upstream mail service timeout after 5000ms.",
      responseTimeMs: 5012,
    },
  ],
  responseTimes: [
    { timestamp: "Login", responseTime: 118, p95: 180 },
    { timestamp: "Refresh", responseTime: 142, p95: 210 },
    { timestamp: "Reset", responseTime: 5012, p95: 5100 },
    { timestamp: "MFA", responseTime: 388, p95: 420 },
    { timestamp: "Logout", responseTime: 96, p95: 140 },
  ],
};

/** Detailed report for a passing Users API run. */
const usersReportDetail: ReportDetail = {
  ...reportsMock[0],
  passed: 67,
  failed: 1,
  skipped: 0,
  assertions: [
    {
      id: "as_01",
      request: "List Users",
      assertion: "Status code is 200",
      status: "passed",
    },
    {
      id: "as_02",
      request: "List Users",
      assertion: "Response time < 300ms",
      status: "passed",
    },
    {
      id: "as_03",
      request: "Create User",
      assertion: "Status code is 201",
      status: "passed",
    },
    {
      id: "as_04",
      request: "Update User",
      assertion: "Updated fields persisted",
      status: "failed",
      expected: "role=admin",
      actual: "role=member",
    },
  ],
  failedRequests: [
    {
      id: "fr_01",
      name: "Update User",
      method: "PUT",
      endpoint: "/users/:id",
      statusCode: 200,
      error: "Assertion failed: role was not updated to admin.",
      responseTimeMs: 176,
    },
  ],
  responseTimes: [
    { timestamp: "List", responseTime: 142, p95: 240 },
    { timestamp: "Get", responseTime: 98, p95: 160 },
    { timestamp: "Create", responseTime: 210, p95: 320 },
    { timestamp: "Update", responseTime: 176, p95: 280 },
    { timestamp: "Delete", responseTime: 88, p95: 130 },
  ],
};

export const reportDetailsMock: Record<string, ReportDetail> = {
  rep_2040: authReportDetail,
  rep_2041: usersReportDetail,
};

/** Build a plausible detail for any report id lacking a hand-authored one. */
export function buildFallbackReportDetail(summary: ReportSummary): ReportDetail {
  const passed = Math.round((summary.passPct / 100) * summary.totalRequests);
  const failed = summary.totalRequests - passed;
  return {
    ...summary,
    passed,
    failed,
    skipped: 0,
    assertions: [
      {
        id: "as_01",
        request: "Health Check",
        assertion: "Status code is 200",
        status: "passed",
      },
      {
        id: "as_02",
        request: "List Resources",
        assertion: "Response is an array",
        status: "passed",
      },
      ...(failed > 0
        ? [
            {
              id: "as_03",
              request: "Create Resource",
              assertion: "Status code is 201",
              status: "failed" as const,
              expected: "201",
              actual: "422 Unprocessable Entity",
            },
          ]
        : []),
    ],
    failedRequests:
      failed > 0
        ? [
            {
              id: "fr_01",
              name: "Create Resource",
              method: "POST",
              endpoint: "/resources",
              statusCode: 422,
              error: "Validation failed for field 'name'.",
              responseTimeMs: 204,
            },
          ]
        : [],
    responseTimes: [
      { timestamp: "T1", responseTime: 120, p95: 210 },
      { timestamp: "T2", responseTime: 180, p95: 260 },
      { timestamp: "T3", responseTime: 150, p95: 240 },
      { timestamp: "T4", responseTime: 205, p95: 310 },
    ],
  };
}
