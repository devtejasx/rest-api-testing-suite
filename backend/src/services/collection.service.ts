import type { Collection } from "@prisma/client";
import { collectionRepository } from "../repositories/collection.repository";
import { ApiError } from "../utils/ApiError";
import type { Paginated } from "../types";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "../validators/collection.validator";

interface ListOptions {
  search?: string;
  page: number;
  pageSize: number;
}

export const collectionService = {
  async list({ search, page, pageSize }: ListOptions): Promise<Paginated<Collection>> {
    const [items, total] = await Promise.all([
      collectionRepository.findMany({
        search,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      collectionRepository.count(search),
    ]);
    return { items, total, page, pageSize };
  },

  async getById(id: string): Promise<Collection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw ApiError.notFound("Collection not found");
    return collection;
  },

  create(input: CreateCollectionInput): Promise<Collection> {
    return collectionRepository.create({
      name: input.name,
      description: input.description,
      totalRequests: input.totalRequests,
      totalTests: input.totalTests,
    });
  },

  async update(id: string, input: UpdateCollectionInput): Promise<Collection> {
    await this.getById(id); // 404 if missing
    return collectionRepository.update(id, input);
  },

  async remove(id: string): Promise<void> {
    await this.getById(id); // 404 if missing
    await collectionRepository.delete(id);
  },
};
