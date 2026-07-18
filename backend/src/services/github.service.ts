export interface GithubWorkflowRun {
  id: number;
  workflow: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | null;
  branch: string;
  commitSha: string;
  commitMessage: string;
  actor: string;
  durationMs: number;
  lastRun: string; // ISO
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
        durationMs: 184_000,
        lastRun: "2026-07-18T13:30:00.000Z",
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
        durationMs: 121_000,
        lastRun: "2026-07-18T12:05:00.000Z",
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
        durationMs: 96_000,
        lastRun: "2026-07-18T10:40:00.000Z",
      },
    ];
  },
};
