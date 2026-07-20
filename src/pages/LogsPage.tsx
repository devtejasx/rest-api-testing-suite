import { useMemo, useState } from "react";
import { ScrollText } from "lucide-react";
import {
  DataTable,
  EmptyState,
  ErrorState,
  FilterDropdown,
  PageHeader,
  SearchBar,
  TableSkeleton,
  type Column,
} from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { useLogs } from "@/hooks/useLogs";
import { formatDateTime, formatRelativeTime } from "@/utils/format";
import type { LogEntry } from "@/services/logs.service";

const TYPE_FILTERS = [
  { label: "All types", value: "all" },
  { label: "Requests", value: "REQUEST" },
  { label: "Auth", value: "AUTH" },
  { label: "Executions", value: "EXECUTION" },
  { label: "Errors", value: "ERROR" },
  { label: "System", value: "SYSTEM" },
];

const LEVEL_FILTERS = [
  { label: "All levels", value: "all" },
  { label: "Info", value: "info" },
  { label: "Warn", value: "warn" },
  { label: "Error", value: "error" },
];

function levelVariant(level: string): "secondary" | "warning" | "destructive" {
  if (level === "error") return "destructive";
  if (level === "warn") return "warning";
  return "secondary";
}

export function LogsPage() {
  const [type, setType] = useState("all");
  const [level, setLevel] = useState("all");
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useLogs({ type, level });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    return data.filter((l) => l.message.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const columns: Column<LogEntry>[] = [
    {
      key: "time",
      header: "Time",
      cell: (l) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground" title={formatDateTime(l.createdAt)}>
          {formatRelativeTime(l.createdAt)}
        </span>
      ),
    },
    {
      key: "level",
      header: "Level",
      cell: (l) => (
        <Badge variant={levelVariant(l.level)} className="uppercase">
          {l.level}
        </Badge>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (l) => (
        <Badge variant="outline" className="font-mono text-[10px]">
          {l.type}
        </Badge>
      ),
    },
    {
      key: "message",
      header: "Message",
      cell: (l) => <span className="font-mono text-xs">{l.message}</span>,
      className: "w-full",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logs"
        description="API requests, authentication, executions and errors — persisted to the database."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search log messages…"
          className="sm:max-w-sm"
        />
        <FilterDropdown value={type} onChange={setType} options={TYPE_FILTERS} placeholder="Type" />
        <FilterDropdown value={level} onChange={setLevel} options={LEVEL_FILTERS} placeholder="Level" />
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(l) => l.id}
          emptyState={
            <EmptyState
              icon={ScrollText}
              title="No logs yet"
              description="Activity will appear here as the API is used."
            />
          }
        />
      )}
    </div>
  );
}
