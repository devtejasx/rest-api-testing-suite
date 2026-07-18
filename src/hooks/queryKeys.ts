/** Centralized React Query keys — one source of truth for cache invalidation. */
export const queryKeys = {
  dashboard: ["dashboard"] as const,
  collections: ["collections"] as const,
  collection: (id: string) => ["collections", id] as const,
  reports: ["reports"] as const,
  report: (id: string) => ["reports", id] as const,
  workflows: ["cicd", "workflows"] as const,
  containers: ["docker", "containers"] as const,
};
