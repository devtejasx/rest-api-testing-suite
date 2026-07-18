import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  FlaskConical,
  Folder,
  Play,
  ShieldCheck,
} from "lucide-react";
import {
  ChartSkeleton,
  ErrorState,
  MethodBadge,
  PageHeader,
  StatusBadge,
} from "@/components/common";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollection } from "@/hooks";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import type { ApiRequest, CollectionFolder } from "@/types";

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useCollection(id);

  if (isError) {
    return (
      <div className="space-y-6">
        <BackButton />
        <ErrorState
          title="Collection not found"
          description="This collection may have been removed."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <BackButton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const totalRequests = data.folders.reduce((n, f) => n + f.requests.length, 0);

  return (
    <div className="space-y-6">
      <BackButton />

      <PageHeader
        title={data.name}
        description={data.description}
        actions={
          <Button onClick={() => navigate(paths.execution)}>
            <Play className="h-4 w-4" />
            Run Collection
          </Button>
        }
      />

      {/* Meta strip */}
      <Card className="flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
        <Meta label="Base URL" value={data.baseUrl} mono />
        <Meta label="Requests" value={String(totalRequests)} />
        <Meta label="Tests" value={String(data.testCount)} />
        <Meta label="Last run" value={formatRelativeTime(data.lastRun)} />
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          <StatusBadge status={data.status} />
        </div>
      </Card>

      {/* Folder hierarchy */}
      <div className="space-y-3">
        {data.folders.map((folder, i) => (
          <FolderBlock key={folder.id} folder={folder} defaultOpen={i === 0} index={i} />
        ))}
      </div>
    </div>
  );
}

function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(paths.collections)}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to collections
    </button>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-sm font-medium", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  );
}

function FolderBlock({
  folder,
  defaultOpen,
  index,
}: {
  folder: CollectionFolder;
  defaultOpen?: boolean;
  index: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isAuth = folder.name.toLowerCase().includes("auth");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
              {isAuth ? <ShieldCheck className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{folder.name}</h3>
              <p className="text-xs text-muted-foreground">{folder.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-[10px]">
              {folder.requests.length} requests
            </Badge>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </div>
        </button>

        {open && (
          <div className="border-t border-border/60">
            {folder.requests.map((req, i) => (
              <RequestRow key={req.id} request={req} last={i === folder.requests.length - 1} />
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function RequestRow({ request, last }: { request: ApiRequest; last: boolean }) {
  return (
    <div className={cn("p-4", !last && "border-b border-border/40")}>
      <div className="flex flex-wrap items-center gap-3">
        <MethodBadge method={request.method} />
        <span className="font-mono text-sm">{request.endpoint}</span>
        <span className="text-sm font-medium text-muted-foreground">· {request.name}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{request.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {request.tests.map((test, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/30 px-2 py-1 text-xs text-muted-foreground"
          >
            <FlaskConical className="h-3 w-3 text-emerald-400" />
            {test}
          </span>
        ))}
      </div>
    </div>
  );
}
