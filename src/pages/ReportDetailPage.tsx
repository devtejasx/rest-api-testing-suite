import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Hash,
  XCircle,
} from "lucide-react";
import {
  ChartCard,
  ChartSkeleton,
  ErrorState,
  MethodBadge,
  PageHeader,
  StatusBadge,
} from "@/components/common";
import { PassFailPie } from "@/components/charts/PassFailPie";
import { ResponseTimeLine } from "@/components/charts/ResponseTimeLine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useReport } from "@/hooks";
import { paths } from "@/routes/paths";
import { formatDateTime, formatDuration } from "@/utils/format";

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useReport(id);

  const back = (
    <button
      onClick={() => navigate(paths.reports)}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to reports
    </button>
  );

  if (isError) {
    return (
      <div className="space-y-6">
        {back}
        <ErrorState title="Report not found" onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        {back}
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const passFail = [
    { name: "Passed" as const, value: data.passed },
    { name: "Failed" as const, value: data.failed },
    { name: "Skipped" as const, value: data.skipped },
  ];

  return (
    <div className="space-y-6">
      {back}

      <PageHeader
        title={data.collection}
        description={`Execution report · ${formatDateTime(data.date)}`}
        actions={<StatusBadge status={data.status} />}
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryTile icon={Hash} label="Total Requests" value={String(data.totalRequests)} tone="blue" />
        <SummaryTile icon={CheckCircle2} label="Passed" value={String(data.passed)} tone="emerald" />
        <SummaryTile icon={XCircle} label="Failed" value={String(data.failed)} tone="rose" />
        <SummaryTile icon={Clock} label="Duration" value={formatDuration(data.durationMs)} tone="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Assertion Outcomes" description="Pass / fail / skip breakdown">
          <PassFailPie data={passFail} />
        </ChartCard>
        <ChartCard
          title="Response Times"
          description="Per-request latency for this run"
          className="lg:col-span-2"
        >
          <ResponseTimeLine data={data.responseTimes} />
        </ChartCard>
      </div>

      {/* Failed requests */}
      {data.failedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="h-4 w-4 text-rose-400" />
              Failed Requests
              <Badge variant="destructive">{data.failedRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.failedRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-lg border border-rose-500/20 bg-rose-500/[0.03] p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <MethodBadge method={req.method} />
                  <span className="font-mono text-sm">{req.endpoint}</span>
                  <Badge variant="destructive" className="ml-auto">
                    {req.statusCode}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {req.responseTimeMs}ms
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs text-rose-300/90">{req.error}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Assertions table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assertions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Request</TableHead>
                <TableHead>Assertion</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead className="text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.assertions.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.request}</TableCell>
                  <TableCell className="text-muted-foreground">{a.assertion}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {a.expected ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {a.status === "failed" ? (
                      <span className="text-rose-400">{a.actual ?? "—"}</span>
                    ) : (
                      <span className="text-muted-foreground">{a.actual ?? "—"}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {a.status === "passed" ? (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="ml-auto h-4 w-4 text-rose-400" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  tone: "emerald" | "rose" | "blue" | "amber";
}) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    rose: "bg-rose-500/10 text-rose-400",
    blue: "bg-blue-500/10 text-blue-400",
    amber: "bg-amber-500/10 text-amber-400",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
