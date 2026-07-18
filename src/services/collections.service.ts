import { mockDelay } from "./axios";
import {
  collectionsMock,
  collectionDetailsMock,
  buildFallbackDetail,
} from "./mock/collections.mock";
import type { Collection, CollectionDetail } from "@/types";

/**
 * Collections service. Lists Postman collections and returns folder/request
 * detail for a single collection.
 *
 * TODO(backend):
 *   list   -> apiClient.get<Collection[]>("/collections")
 *   detail -> apiClient.get<CollectionDetail>(`/collections/${id}`)
 */
export const collectionsService = {
  list(): Promise<Collection[]> {
    return mockDelay(collectionsMock);
  },

  getById(id: string): Promise<CollectionDetail> {
    const detail = collectionDetailsMock[id];
    if (detail) return mockDelay(detail);

    const summary = collectionsMock.find((c) => c.id === id);
    if (!summary) {
      return Promise.reject(new Error(`Collection "${id}" not found`));
    }
    return mockDelay(buildFallbackDetail(summary));
  },
};
