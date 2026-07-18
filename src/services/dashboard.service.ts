import { mockDelay } from "./axios";
import { dashboardMock } from "./mock/dashboard.mock";
import type { DashboardData } from "@/types";

/**
 * Dashboard service. Returns aggregate metrics for the overview page.
 *
 * TODO(backend): replace with `apiClient.get<DashboardData>("/dashboard")`.
 */
export const dashboardService = {
  getOverview(): Promise<DashboardData> {
    return mockDelay(dashboardMock);
  },
};
