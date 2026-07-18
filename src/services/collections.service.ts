import { apiGet } from "./axios";
import { mapCollection, mapCollectionDetail } from "./mappers";
import type { ApiCollection, ApiPaginated } from "./api.types";
import type { Collection, CollectionDetail } from "@/types";

/**
 * Collections service. Lists collections and returns folder/request detail for
 * a single collection (GET /collections, GET /collections/:id).
 */
export const collectionsService = {
  async list(): Promise<Collection[]> {
    const page = await apiGet<ApiPaginated<ApiCollection>>("/collections", {
      params: { pageSize: 100 },
    });
    return page.items.map(mapCollection);
  },

  async getById(id: string): Promise<CollectionDetail> {
    const collection = await apiGet<ApiCollection>(`/collections/${id}`);
    return mapCollectionDetail(collection);
  },
};
