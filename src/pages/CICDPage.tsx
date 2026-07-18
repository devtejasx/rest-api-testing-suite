import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  GitBranch,
  GitCommit,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  ChartSkeleton,
  ErrorState,
  ExecutionTimeline,
  PageHeader,
  StatusBadge,
  type TimelineStep,
} from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkflowRuns } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatDuration, formatRelativeTime } from "@/utils/format";
import type { PipelineStep, WorkflowRun } from "@/types";

/** Horizontal pipeline visualization for the currently selected run. */
function PipelineFlow({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const color =
          step.status === "success"
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : step.status === "failed"
            ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
            : step.status === "running"
            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
            : "border-border bg-secondary/40 text-muted-foreground";
        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "flex min-w-[120px] flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-center",
                color,
              )}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                {step.status === "success" && <CheckCircle2 className="h-3.5 w-3.5" />}
                {step.status === "failed" && <XCircle className="h-3.5 w-3.5" />}
                {step.status === "running" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {step.name}
              </span>
              <span className="font-mono text-[10px] opacity-80">
                {step.durationMs > 0 ? formatDuration(step.durationMs) : "—"}
              </span>
            </motion.div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 w-4 shrink-0",
                  step.status === "success" ? "bg-emerald-500/40" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CICDPage() {
  const { data, isLoading, isError, refetch } = useWorkflowRuns();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = data?.find((r) => r.id === selectedId) ?? data?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CI/CD"
        description="GitHub Actions workflow runs, pipeline stages and timelines."
        actions={
          <Badge variant="secondary" className="hidden sm:inline-flex">
            <GitBranch className="h-3 w-3" />
            api-tests.yml
          </Badge>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !data || !selected ? (
        <>
          <ChartSkeleton />
          <ChartSkeleton />
        </>
      ) : (
        <>
          {/* Pipeline visualization for selected run */}
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  {selected.name}
                  <StatusBadge status={selected.status} />
                </CardTitle>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <GitCommit className="h-3.5 w-3.5" />
                  <span className="font-mono">{selected.commit}</span>
                  {selected.commitMessage}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">{selected.author}</span> ·{" "}
                  {selected.triggeredBy}
                </p>
                <p>{formatRelativeTime(selected.startedAt)}</p>
              </div>
            </CardHeader>
            <CardContent>
              <PipelineFlow steps={selected.steps} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Run list */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Workflow Runs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.map((run) => (
                  <WorkflowRunRow
                    key={run.id}
                    run={run}
                    active={run.id === selected.id}
                    onSelect={() => setSelectedId(run.id)}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Timeline for selected run */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Execution Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ExecutionTimeline
                  steps={selected.steps.map<TimelineStep>((s) => ({
                    id: s.id,
                    name: s.name,
                    status: s.status,
                    durationMs: s.durationMs,
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function WorkflowRunRow({
  run,
  active,
  onSelect,
}: {
  run: WorkflowRun;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
        active
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 hover:bg-muted/30",
      )}
    >
      <StatusBadge status={run.status} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{run.commitMessage}</p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <GitBranch className="h-3 w-3" />
          {run.branch}
          <span className="font-mono">· {run.commit}</span>
        </p>
      </div>
      <div className="hidden text-right text-xs text-muted-foreground sm:block">
        <p className="font-mono">{formatDuration(run.durationMs)}</p>
        <p>{formatRelativeTime(run.startedAt)}</p>
      </div>
    </button>
  );
}
