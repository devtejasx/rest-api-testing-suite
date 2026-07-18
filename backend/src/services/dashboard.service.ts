import { collectionRepository } from "../repositories/collection.repository";
import { executionRepository } from "../repositories/execution.repository";
import { reportRepository } from "../repositories/report.repository";

export interface DashboardOverview {
  totalCollections: number;
  totalExecutions: number;
  passedTests: number;
  failedTests: number;
  averageResponseTime: number;
  passPercentage: number;
  failPercentage: number;
  latestExecution: {
    id: string;
    collection: string;
    status: string;
    duration: number;
    startedAt: Date;
    finishedAt: Date | null;
  } | null;
}

export const dashboardService = {
  /** Aggregate high-level metrics for the dashboard overview. */
  async getOverview(): Promise<DashboardOverview> {
    const [totalCollections, totalExecutions, totals, latest] = await Promise.all([
      collectionRepository.count(),
      executionRepository.count(),
      reportRepository.aggregateTotals(),
      executionRepository.findLatest(),
    ]);

    const totalTests = totals.passed + totals.failed;
    const passPercentage =
      totalTests > 0 ? Math.round((totals.passed / totalTests) * 1000) / 10 : 0;
    const failPercentage =
      totalTests > 0 ? Math.round((totals.failed / totalTests) * 1000) / 10 : 0;

    return {
      totalCollections,
      totalExecutions,
      passedTests: totals.passed,
      failedTests: totals.failed,
      averageResponseTime: totals.avgResponseTime,
      passPercentage,
      failPercentage,
      latestExecution: latest
        ? {
            id: latest.id,
            collection: latest.collection.name,
            status: latest.status,
            duration: latest.duration,
            startedAt: latest.startedAt,
            finishedAt: latest.finishedAt,
          }
        : null,
    };
  },
};
