import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ScrollText } from "lucide-react";
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
import { useReports } from "@/hooks";
import { paths } from "@/routes/paths";
import { formatDateTime, formatDuration, formatPercent } from "@/utils/format";
import type { ReportSummary } from "@/types";

const STATUS_FILTERS = [
  { label: "All statuses", value: "all" },
  { label: "Passed", value: "passed" },
  { label: "Failed", value: "failed" },
];

export function ReportsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useReports();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r) => {
      const matchesSearch = r.collection
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = status === "all" || r.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, status]);

  const columns: Column<ReportSummary>[] = [
    {
      key: "collection",
      header: "Collection",
      cell: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.collection}</span>
          <span className="font-mono text-[11px] text-muted-foreground">{r.id}</span>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (r) => (
        <span className="text-muted-foreground">{formatDateTime(r.date)}</span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDuration(r.durationMs)}
        </span>
      ),
    },
    {
      key: "pass",
      header: "Pass %",
      cell: (r) => (
        <span className="font-semibold text-emerald-400">{formatPercent(r.passPct)}</span>
      ),
    },
    {
      key: "fail",
      header: "Fail %",
      cell: (r) => (
        <span
          className={r.failPct > 0 ? "font-semibold text-rose-400" : "text-muted-foreground"}
        >
          {formatPercent(r.failPct)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "chevron",
      header: "",
      headerClassName: "w-10",
      cell: () => <ChevronRight className="h-4 w-4 text-muted-foreground" />,
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Historical execution reports. Click a row to inspect assertions and failures."
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
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate(paths.reportDetail(r.id))}
          emptyState={
            <EmptyState
              icon={ScrollText}
              title="No reports found"
              description="Adjust filters or run a collection to generate a report."
            />
          }
        />
      )}
    </div>
  );
}
