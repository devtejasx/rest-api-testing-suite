export type WorkflowStepStatus = "success" | "failed" | "running" | "pending" | "skipped";

export interface GithubWorkflowStep {
  id: string;
  name: string;
  status: WorkflowStepStatus;
  durationMs: number;
  startedAt: string;
}

export interface GithubWorkflowRun {
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
  lastRun: string; // ISO
  steps: GithubWorkflowStep[];
}

const STEP_NAMES = [
  "Checkout",
  "Install",
  "Docker Build",
  "Database Seed",
  "Run Newman",
  "Upload Report",
];

/** Build the six-stage Newman pipeline for a run. */
function buildSteps(
  startIso: string,
  outcome: "success" | "failure" | "running",
): GithubWorkflowStep[] {
  const durations = [4000, 31000, 65000, 12000, 57000, 10000];
  const failAt = outcome === "failure" ? 4 : -1;
  const runningAt = outcome === "running" ? 3 : -1;
  let cursor = new Date(startIso).getTime();

  return STEP_NAMES.map((name, i) => {
    const startedAt = new Date(cursor).toISOString();
    cursor += durations[i];
    let status: WorkflowStepStatus = "success";
    if (failAt >= 0) {
      if (i < failAt) status = "success";
      else if (i === failAt) status = "failed";
      else status = "skipped";
    } else if (runningAt >= 0) {
      if (i < runningAt) status = "success";
      else if (i === runningAt) status = "running";
      else status = "pending";
    }
    return {
      id: `step_${i + 1}`,
      name,
      status,
      durationMs: status === "pending" || status === "running" ? 0 : durations[i],
      startedAt,
    };
  });
}

/**
 * GitHub Actions service. Returns mocked workflow information today.
 *
 * TODO: replace with the GitHub REST API
 * (GET /repos/{owner}/{repo}/actions/runs) using an authenticated token.
 */
export const githubService = {
  getWorkflows(): GithubWorkflowRun[] {
    return [
      {
        id: 318,
        workflow: "API Tests / Newman",
        status: "completed",
        conclusion: "success",
        branch: "main",
        commitSha: "a1b2c3d",
        commitMessage: "feat: add pagination to users endpoint",
        actor: "devtejasx",
        triggeredBy: "push",
        durationMs: 184_000,
        lastRun: "2026-07-18T13:30:00.000Z",
        steps: buildSteps("2026-07-18T13:30:00.000Z", "success"),
      },
      {
        id: 317,
        workflow: "API Tests / Newman",
        status: "completed",
        conclusion: "failure",
        branch: "feature/auth-mfa",
        commitSha: "e4f5g6h",
        commitMessage: "fix: handle expired refresh tokens",
        actor: "devtejasx",
        triggeredBy: "pull_request",
        durationMs: 121_000,
        lastRun: "2026-07-18T12:05:00.000Z",
        steps: buildSteps("2026-07-18T12:05:00.000Z", "failure"),
      },
      {
        id: 316,
        workflow: "API Tests / Newman",
        status: "in_progress",
        conclusion: null,
        branch: "main",
        commitSha: "i7j8k9l",
        commitMessage: "chore: bump newman to 6.1",
        actor: "ci-bot",
        triggeredBy: "schedule",
        durationMs: 96_000,
        lastRun: "2026-07-18T10:40:00.000Z",
        steps: buildSteps("2026-07-18T10:40:00.000Z", "running"),
      },
    ];
  },
};
