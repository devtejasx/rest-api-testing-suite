import { apiGet } from "./axios";
import { mapReportSummary, mapReportDetail } from "./mappers";
import type { ApiPaginated, ApiReport } from "./api.types";
import type { ReportSummary, ReportDetail } from "@/types";

/**
 * Reports service. Historical execution reports and their details
 * (GET /reports, GET /reports/:id).
 */
export const reportsService = {
  async list(): Promise<ReportSummary[]> {
    const page = await apiGet<ApiPaginated<ApiReport>>("/reports", {
      params: { pageSize: 100 },
    });
    return page.items.map(mapReportSummary);
  },

  async getById(id: string): Promise<ReportDetail> {
    const report = await apiGet<ApiReport>(`/reports/${id}`);
    return mapReportDetail(report);
  },
};
