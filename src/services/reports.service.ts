import { mockDelay } from "./axios";
import {
  reportsMock,
  reportDetailsMock,
  buildFallbackReportDetail,
} from "./mock/reports.mock";
import type { ReportSummary, ReportDetail } from "@/types";

/**
 * Reports service. Historical execution reports and their details.
 *
 * TODO(backend):
 *   list   -> apiClient.get<ReportSummary[]>("/reports")
 *   detail -> apiClient.get<ReportDetail>(`/reports/${id}`)
 */
export const reportsService = {
  list(): Promise<ReportSummary[]> {
    return mockDelay(reportsMock);
  },

  getById(id: string): Promise<ReportDetail> {
    const detail = reportDetailsMock[id];
    if (detail) return mockDelay(detail);

    const summary = reportsMock.find((r) => r.id === id);
    if (!summary) {
      return Promise.reject(new Error(`Report "${id}" not found`));
    }
    return mockDelay(buildFallbackReportDetail(summary));
  },
};
