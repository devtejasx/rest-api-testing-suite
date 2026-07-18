import { useQuery } from "@tanstack/react-query";
import { collectionsService } from "@/services";
import { queryKeys } from "./queryKeys";

/** List all Postman collections. */
export function useCollections() {
  return useQuery({
    queryKey: queryKeys.collections,
    queryFn: collectionsService.list,
  });
}

/** Fetch folder + request detail for a single collection. */
export function useCollection(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.collection(id ?? "unknown"),
    queryFn: () => collectionsService.getById(id as string),
    enabled: Boolean(id),
  });
}
