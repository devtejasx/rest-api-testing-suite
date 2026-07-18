import { mockDelay } from "./axios";
import { workflowRunsMock } from "./mock/cicd.mock";
import type { WorkflowRun } from "@/types";

/**
 * CI/CD service. GitHub Actions workflow runs and pipeline steps.
 *
 * TODO(backend): apiClient.get<WorkflowRun[]>("/cicd/workflows")
 */
export const cicdService = {
  listWorkflowRuns(): Promise<WorkflowRun[]> {
    return mockDelay(workflowRunsMock);
  },
};
