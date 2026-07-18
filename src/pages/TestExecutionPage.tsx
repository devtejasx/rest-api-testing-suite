import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  MinusCircle,
  Play,
  RotateCcw,
  Square,
  Terminal,
  XCircle,
} from "lucide-react";
import { PageHeader, ProgressIndicator, MethodBadge } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExecution } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/utils/format";
import type { ExecutionRequestResult, LogLevel, RunStatus } from "@/types";

const LOG_COLORS: Record<LogLevel, string> = {
  info: "text-slate-300",
  success: "text-emerald-400",
  error: "text-rose-400",
  warn: "text-amber-400",
};

export function TestExecutionPage() {
  const { state, start, reset, isRunning, isFinished } = useExecution(
    "col_users",
    "Users API",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Execution"
        description="Run a collection and watch assertions execute in real time."
      />

      {/* Run control */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <CardContent className="relative flex flex-col items-center gap-5 py-10 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Selected collection</p>
            <h2 className="text-xl font-bold">{state.collectionName}</h2>
          </div>

          <RunButton
            isRunning={isRunning}
            isFinished={isFinished}
            onStart={start}
            onReset={reset}
          />

          {(isRunning || isFinished) && (
            <div className="w-full max-w-xl space-y-2">
              <ProgressIndicator
                value={state.progress}
                label={
                  isRunning && state.currentRequest
                    ? `Running: ${state.currentRequest}`
                    : isFinished
                    ? "Completed"
                    : "Progress"
                }
                indicatorClassName={
                  state.status === "failed" ? "bg-rose-500" : undefined
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Requests + running indicator */}
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {state.requests.map((req) => (
                <RequestExecutionRow
                  key={req.id}
                  request={req}
                  active={state.currentRequest === req.name && isRunning}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary + logs */}
        <div className="space-y-4 lg:col-span-2">
          <SummaryCard state={state} />
          <LiveLogs logs={state.logs} isRunning={isRunning} />
        </div>
      </div>
    </div>
  );
}

function RunButton({
  isRunning,
  isFinished,
  onStart,
  onReset,
}: {
  isRunning: boolean;
  isFinished: boolean;
  onStart: () => void;
  onReset: () => void;
}) {
  if (isRunning) {
    return (
      <Button size="xl" variant="secondary" disabled className="min-w-[240px]">
        <Loader2 className="h-5 w-5 animate-spin" />
        Running collection…
      </Button>
    );
  }
  if (isFinished) {
    return (
      <div className="flex items-center gap-3">
        <Button size="xl" onClick={onStart} className="min-w-[200px]">
          <RotateCcw className="h-5 w-5" />
          Run Again
        </Button>
        <Button size="xl" variant="outline" onClick={onReset}>
          <Square className="h-5 w-5" />
          Reset
        </Button>
      </div>
    );
  }
  return (
    <Button size="xl" onClick={onStart} className="min-w-[240px]">
      <Play className="h-5 w-5" />
      Run Collection
    </Button>
  );
}

function RequestExecutionRow({
  request,
  active,
}: {
  request: ExecutionRequestResult;
  active: boolean;
}) {
  const iconByStatus: Record<RunStatus, React.ReactNode> = {
    passed: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    failed: <XCircle className="h-4 w-4 text-rose-400" />,
    running: <Loader2 className="h-4 w-4 animate-spin text-blue-400" />,
    queued: <CircleDashed className="h-4 w-4 text-slate-500" />,
    skipped: <MinusCircle className="h-4 w-4 text-slate-500" />,
    cancelled: <MinusCircle className="h-4 w-4 text-slate-500" />,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        active
          ? "border-blue-500/40 bg-blue-500/5"
          : "border-transparent hover:bg-muted/30",
      )}
    >
      <span className="shrink-0">
        {active ? iconByStatus.running : iconByStatus[request.status]}
      </span>
      <MethodBadge method={request.method} />
      <span className="truncate font-mono text-xs text-muted-foreground">
        {request.endpoint}
      </span>
      <span className="ml-auto flex items-center gap-3 text-xs">
        {request.status !== "queued" && (
          <>
            <span className="hidden text-muted-foreground sm:inline">
              {request.assertionsPassed}✓{" "}
              {request.assertionsFailed > 0 && (
                <span className="text-rose-400">{request.assertionsFailed}✗</span>
              )}
            </span>
            <span className="font-mono text-muted-foreground">
              {request.responseTimeMs > 0 ? `${request.responseTimeMs}ms` : "—"}
            </span>
          </>
        )}
      </span>
    </div>
  );
}

function SummaryCard({ state }: { state: ReturnType<typeof useExecution>["state"] }) {
  const { summary } = state;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Execution Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <SummaryStat label="Passed" value={summary.passed} tone="emerald" />
        <SummaryStat label="Failed" value={summary.failed} tone="rose" />
        <SummaryStat label="Skipped" value={summary.skipped} tone="slate" />
        <SummaryStat
          label="Duration"
          value={summary.durationMs > 0 ? formatDuration(summary.durationMs) : "—"}
          tone="blue"
        />
      </CardContent>
    </Card>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "emerald" | "rose" | "slate" | "blue";
}) {
  const tones = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    slate: "text-slate-300",
    blue: "text-blue-400",
  };
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-bold tabular-nums", tones[tone])}>{value}</p>
    </div>
  );
}

function LiveLogs({ logs, isRunning }: { logs: ReturnType<typeof useExecution>["state"]["logs"]; isRunning: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/60 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Terminal className="h-4 w-4" />
          Live Logs
        </CardTitle>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-xs text-blue-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            streaming
          </span>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[280px] overflow-y-auto bg-[#0a0e14] p-4 font-mono text-xs leading-relaxed">
          {logs.length === 0 ? (
            <p className="text-slate-600">$ waiting for run to start…</p>
          ) : (
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn("whitespace-pre-wrap", LOG_COLORS[log.level])}
                >
                  <span className="mr-2 text-slate-600">
                    {new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                  </span>
                  {log.message}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={endRef} />
        </div>
      </CardContent>
    </Card>
  );
}
