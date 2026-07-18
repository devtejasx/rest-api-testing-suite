import { useQuery } from "@tanstack/react-query";
import { cicdService } from "@/services";
import { queryKeys } from "./queryKeys";

/** List GitHub Actions workflow runs with their pipeline steps. */
export function useWorkflowRuns() {
  return useQuery({
    queryKey: queryKeys.workflows,
    queryFn: cicdService.listWorkflowRuns,
  });
}
