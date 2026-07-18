import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services";
import { queryKeys } from "./queryKeys";

/** Fetch aggregate dashboard metrics, charts and recent activity. */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardService.getOverview,
  });
}
