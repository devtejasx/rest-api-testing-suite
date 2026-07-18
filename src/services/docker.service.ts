import { mockDelay } from "./axios";
import { dockerContainersMock } from "./mock/docker.mock";
import type { DockerContainer } from "@/types";

/**
 * Docker service. Container health, resource usage and logs.
 *
 * TODO(backend):
 *   list    -> apiClient.get<DockerContainer[]>("/docker/containers")
 *   restart -> apiClient.post(`/docker/containers/${id}/restart`)
 */
export const dockerService = {
  listContainers(): Promise<DockerContainer[]> {
    return mockDelay(dockerContainersMock);
  },

  /** UI-only restart — resolves after a short delay, no backend call. */
  restartContainer(id: string): Promise<{ id: string; restarted: boolean }> {
    return mockDelay({ id, restarted: true }, 1200);
  },
};
