import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services";
import { queryKeys } from "./queryKeys";

/** List historical execution reports. */
export function useReports() {
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: reportsService.list,
  });
}

/** Fetch the full detail for a single report. */
export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.report(id ?? "unknown"),
    queryFn: () => reportsService.getById(id as string),
    enabled: Boolean(id),
  });
}
