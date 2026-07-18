import { useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  Clock,
  Container,
  FolderGit2,
  GitBranch,
  Layers,
  Timer,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  ChartCard,
  ChartSkeleton,
  ErrorState,
  PageHeader,
  StatCard,
  StatCardSkeleton,
  StatusBadge,
} from "@/components/common";
import { PassFailPie } from "@/components/charts/PassFailPie";
import { ResponseTimeLine } from "@/components/charts/ResponseTimeLine";
import { ExecutionTrendChart } from "@/components/charts/ExecutionTrendChart";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks";
import { paths } from "@/routes/paths";
import {
  formatDateTime,
  formatDuration,
  formatMs,
  formatNumber,
  formatRelativeTime,
} from "@/utils/format";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your API testing activity and infrastructure health."
        actions={
          <Button onClick={() => navigate(paths.execution)}>
            <Activity className="h-4 w-4" />
            New Run
          </Button>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {isLoading || !data ? (
              Array.from({ length: 10 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard index={0} label="Total APIs" value={formatNumber(data.stats.totalApis)} icon={Layers} accent="blue" delta="+8" hint="this week" />
                <StatCard index={1} label="Collections" value={data.stats.collections} icon={FolderGit2} accent="violet" />
                <StatCard index={2} label="Tests Executed" value={formatNumber(data.stats.testsExecuted)} icon={Activity} accent="emerald" delta="+12.5%" hint="vs last week" />
                <StatCard index={3} label="Passed Tests" value={formatNumber(data.stats.passedTests)} icon={CheckCircle2} accent="emerald" />
                <StatCard index={4} label="Failed Tests" value={formatNumber(data.stats.failedTests)} icon={XCircle} accent="rose" delta="-3.1%" hint="vs last week" />
                <StatCard index={5} label="Avg Response" value={formatMs(data.stats.avgResponseTimeMs)} icon={Timer} accent="amber" />
                <StatCard
                  index={6}
                  label="Last Execution"
                  value=""
                  valueSlot={
                    <p className="text-base font-semibold">
                      {formatRelativeTime(data.stats.lastExecution)}
                    </p>
                  }
                  icon={Clock}
                  accent="slate"
                  hint={formatDateTime(data.stats.lastExecution)}
                />
                <StatCard
                  index={7}
                  label="Docker Status"
                  value=""
                  valueSlot={<StatusBadge status={data.stats.dockerStatus} variant="health" />}
                  icon={Container}
                  accent="blue"
                />
                <StatCard
                  index={8}
                  label="GitHub Actions"
                  value=""
                  valueSlot={<StatusBadge status={data.stats.githubActionsStatus} />}
                  icon={GitBranch}
                  accent="violet"
                />
                <StatCard
                  index={9}
                  label="Pass Rate"
                  value={`${((data.stats.passedTests / data.stats.testsExecuted) * 100).toFixed(1)}%`}
                  icon={TrendingUp}
                  accent="emerald"
                />
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {isLoading || !data ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton className="lg:col-span-2" />
              </>
            ) : (
              <>
                <ChartCard index={0} title="Pass vs Fail" description="Aggregate assertion outcomes">
                  <PassFailPie data={data.passFail} />
                </ChartCard>
                <ChartCard
                  index={1}
                  title="Response Time"
                  description="Average and p95 latency over the day"
                  className="lg:col-span-2"
                >
                  <ResponseTimeLine data={data.responseTimes} />
                </ChartCard>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {isLoading || !data ? (
              <>
                <ChartSkeleton className="lg:col-span-2" />
                <ChartSkeleton />
              </>
            ) : (
              <>
                <ChartCard
                  index={0}
                  title="Test Execution Trend"
                  description="Passed vs failed tests over the last 7 days"
                  className="lg:col-span-2"
                >
                  <ExecutionTrendChart data={data.executionTrend} />
                </ChartCard>

                {/* Quick health panel */}
                <ChartCard index={1} title="Environment" description="Live infrastructure status">
                  <div className="space-y-3">
                    <HealthRow icon={Container} label="Backend container" status="healthy" />
                    <HealthRow icon={Container} label="Database container" status="healthy" />
                    <HealthRow icon={GitBranch} label="CI pipeline" status="passed" variant="run" />
                    <div className="rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground">
                      Newman runs are triggered on every push to{" "}
                      <span className="font-mono text-foreground">main</span> and nightly
                      at 02:00 UTC.
                    </div>
                  </div>
                </ChartCard>
              </>
            )}
          </div>

          {/* Recent activity */}
          <ChartCard title="Recent Activity" description="Latest collection runs across environments">
            {isLoading || !data ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary/40" />
                ))}
              </div>
            ) : (
              <div className="-mx-2 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-2 py-2 font-semibold">Collection</th>
                      <th className="px-2 py-2 font-semibold">Status</th>
                      <th className="px-2 py-2 font-semibold">Trigger</th>
                      <th className="px-2 py-2 font-semibold">Environment</th>
                      <th className="px-2 py-2 font-semibold">Duration</th>
                      <th className="px-2 py-2 text-right font-semibold">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentActivity.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-border/50 transition-colors hover:bg-muted/30"
                      >
                        <td className="px-2 py-3 font-medium">{item.collection}</td>
                        <td className="px-2 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-2 py-3 text-muted-foreground">{item.triggeredBy}</td>
                        <td className="px-2 py-3 capitalize text-muted-foreground">
                          {item.environment}
                        </td>
                        <td className="px-2 py-3 font-mono text-xs text-muted-foreground">
                          {item.durationMs > 0 ? formatDuration(item.durationMs) : "—"}
                        </td>
                        <td className="px-2 py-3 text-right text-muted-foreground">
                          {formatRelativeTime(item.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}

function HealthRow({
  icon: Icon,
  label,
  status,
  variant = "health",
}: {
  icon: typeof Container;
  label: string;
  status: Parameters<typeof StatusBadge>[0]["status"];
  variant?: "health" | "run";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/20 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <StatusBadge status={status} variant={variant} />
    </div>
  );
}
