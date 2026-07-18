import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paths } from "@/routes/paths";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Compass className="h-8 w-8" />
      </div>
      <p className="text-6xl font-bold tracking-tight text-gradient">404</p>
      <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button className="mt-6" onClick={() => navigate(paths.dashboard)}>
        Back to Dashboard
      </Button>
    </div>
  );
}
