import { apiGet } from "./axios";
import { mapDashboard } from "./mappers";
import type { ApiDashboard } from "./api.types";
import type { DashboardData } from "@/types";

/** Dashboard overview — aggregate metrics + chart series from GET /dashboard. */
export const dashboardService = {
  async getOverview(): Promise<DashboardData> {
    const data = await apiGet<ApiDashboard>("/dashboard");
    return mapDashboard(data);
  },
};
