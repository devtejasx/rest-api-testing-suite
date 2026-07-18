import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ChevronRight } from "lucide-react";
import {
  DataTable,
  EmptyState,
  ErrorState,
  FilterDropdown,
  PageHeader,
  SearchBar,
  StatusBadge,
  TableSkeleton,
  type Column,
} from "@/components/common";
import { useExecutions } from "@/hooks";
import { paths } from "@/routes/paths";
import { formatDuration, formatMs, formatRelativeTime } from "@/utils/format";
import type { ExecutionRecord } from "@/types";

const STATUS_FILTERS = [
  { label: "All statuses", value: "all" },
  { label: "Passed", value: "passed" },
  { label: "Failed", value: "failed" },
  { label: "Running", value: "running" },
];

export function ExecutionsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useExecutions();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((e) => {
      const matchesSearch = e.collection.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || e.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, status]);

  const columns: Column<ExecutionRecord>[] = [
    {
      key: "collection",
      header: "Collection",
      cell: (e) => (
        <div className="flex flex-col">
          <span className="font-medium">{e.collection}</span>
          <span className="font-mono text-[11px] text-muted-foreground">{e.id.slice(0, 8)}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (e) => <StatusBadge status={e.status} />,
    },
    {
      key: "results",
      header: "Results",
      cell: (e) => (
        <span className="text-sm">
          <span className="font-semibold text-emerald-400">{e.passed}</span>
          <span className="text-muted-foreground"> / </span>
          <span className={e.failed > 0 ? "font-semibold text-rose-400" : "text-muted-foreground"}>
            {e.failed} failed
          </span>
        </span>
      ),
    },
    {
      key: "avg",
      header: "Avg Response",
      cell: (e) => (
        <span className="font-mono text-xs text-muted-foreground">
          {e.averageResponseTimeMs > 0 ? formatMs(e.averageResponseTimeMs) : "—"}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      cell: (e) => (
        <span className="font-mono text-xs text-muted-foreground">
          {e.durationMs > 0 ? formatDuration(e.durationMs) : "—"}
        </span>
      ),
    },
    {
      key: "started",
      header: "Started",
      cell: (e) => (
        <span className="text-muted-foreground">{formatRelativeTime(e.startedAt)}</span>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "chevron",
      header: "",
      headerClassName: "w-8",
      cell: () => <ChevronRight className="h-4 w-4 text-muted-foreground" />,
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executions"
        description="History of every collection run recorded by the backend."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by collection…"
          className="sm:max-w-sm"
        />
        <FilterDropdown
          value={status}
          onChange={setStatus}
          options={STATUS_FILTERS}
          placeholder="Status"
        />
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <TableSkeleton rows={6} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(e) => e.id}
          onRowClick={(e) => navigate(paths.executionDetail(e.id))}
          emptyState={
            <EmptyState
              icon={Activity}
              title="No executions yet"
              description="Run a collection to record its first execution."
            />
          }
        />
      )}
    </div>
  );
}
