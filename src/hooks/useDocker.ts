import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dockerService } from "@/services";
import { queryKeys } from "./queryKeys";

/** List Docker containers with health, resource usage and logs. */
export function useContainers() {
  return useQuery({
    queryKey: queryKeys.containers,
    queryFn: dockerService.listContainers,
  });
}

/** UI-only restart mutation. Invalidates the container list on success. */
export function useRestartContainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dockerService.restartContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.containers });
    },
  });
}
