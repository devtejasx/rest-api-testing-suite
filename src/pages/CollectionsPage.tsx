import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileCode2, FolderGit2, FlaskConical, Play } from "lucide-react";
import {
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  FilterDropdown,
  PageHeader,
  SearchBar,
  StatusBadge,
} from "@/components/common";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollections } from "@/hooks";
import { paths } from "@/routes/paths";
import { formatPercent, formatRelativeTime } from "@/utils/format";
import type { Collection, RunStatus } from "@/types";

const STATUS_FILTERS = [
  { label: "All statuses", value: "all" },
  { label: "Passed", value: "passed" },
  { label: "Failed", value: "failed" },
  { label: "Running", value: "running" },
  { label: "Queued", value: "queued" },
  { label: "Skipped", value: "skipped" },
];

export function CollectionsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useCollections();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((t) => t.includes(search.toLowerCase()));
      const matchesStatus = status === "all" || c.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collections"
        description="Postman collections available for automated testing."
        actions={
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {data?.length ?? 0} collections
          </Badge>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search collections…"
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
        <CardGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No collections found"
          description="Try adjusting your search or status filter."
          action={{ label: "Clear filters", onClick: () => {
            setSearch("");
            setStatus("all");
          } }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((collection, i) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={i}
              onOpen={() => navigate(paths.collectionDetail(collection.id))}
              onRun={() => navigate(paths.execution)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionCard({
  collection,
  index,
  onOpen,
  onRun,
}: {
  collection: Collection;
  index: number;
  onOpen: () => void;
  onRun: () => void;
}) {
  const isRunning = collection.status === "running";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Card
        className="group flex h-full cursor-pointer flex-col p-5 transition-all hover:border-primary/40 hover:shadow-glow-emerald"
        onClick={onOpen}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight group-hover:text-primary">
                {collection.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                Last run {formatRelativeTime(collection.lastRun)}
              </p>
            </div>
          </div>
          <StatusBadge status={collection.status} />
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {collection.description}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <FileCode2 className="h-4 w-4" />
            <span className="font-medium text-foreground">{collection.requestCount}</span>
            requests
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <FlaskConical className="h-4 w-4" />
            <span className="font-medium text-foreground">{collection.testCount}</span>
            tests
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {collection.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
          <PassRate status={collection.status} rate={collection.passRate} />
          <Button
            size="sm"
            variant="secondary"
            disabled={isRunning}
            onClick={(e) => {
              e.stopPropagation();
              onRun();
            }}
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Running" : "Run"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function PassRate({ status, rate }: { status: RunStatus; rate: number }) {
  if (status === "queued" || status === "skipped" || rate === 0) {
    return <span className="text-xs text-muted-foreground">No pass data yet</span>;
  }
  const color =
    rate >= 95 ? "text-emerald-400" : rate >= 80 ? "text-amber-400" : "text-rose-400";
  return (
    <span className="text-xs">
      <span className={`font-semibold ${color}`}>{formatPercent(rate)}</span>{" "}
      <span className="text-muted-foreground">pass rate</span>
    </span>
  );
}
