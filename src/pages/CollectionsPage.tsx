import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FileCode2,
  FolderGit2,
  FlaskConical,
  Play,
} from "lucide-react";
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

const SORT_OPTIONS = [
  { label: "Name (A–Z)", value: "name-asc" },
  { label: "Name (Z–A)", value: "name-desc" },
  { label: "Most requests", value: "requests-desc" },
  { label: "Most tests", value: "tests-desc" },
  { label: "Highest pass rate", value: "pass-desc" },
  { label: "Recently run", value: "recent-desc" },
];

const PAGE_SIZE = 6;

function sortCollections(items: Collection[], sort: string): Collection[] {
  const sorted = [...items];
  switch (sort) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "requests-desc":
      return sorted.sort((a, b) => b.requestCount - a.requestCount);
    case "tests-desc":
      return sorted.sort((a, b) => b.testCount - a.testCount);
    case "pass-desc":
      return sorted.sort((a, b) => b.passRate - a.passRate);
    case "recent-desc":
      return sorted.sort(
        (a, b) => new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime(),
      );
    default:
      return sorted;
  }
}

export function CollectionsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useCollections();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!data) return [];
    const matched = data.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((t) => t.includes(search.toLowerCase()));
      const matchesStatus = status === "all" || c.status === status;
      return matchesSearch && matchesStatus;
    });
    return sortCollections(matched, sort);
  }, [data, search, status, sort]);

  // Reset to the first page whenever the result set changes.
  useEffect(() => setPage(1), [search, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

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
        <FilterDropdown
          value={sort}
          onChange={setSort}
          options={SORT_OPTIONS}
          placeholder="Sort"
          icon={false}
          className="sm:w-[190px]"
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
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paged.map((collection, i) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                index={i}
                onOpen={() => navigate(paths.collectionDetail(collection.id))}
                onRun={() => navigate(paths.execution)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
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
