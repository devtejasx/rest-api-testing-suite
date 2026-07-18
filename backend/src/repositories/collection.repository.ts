import type { Collection, Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

interface FindManyOptions {
  search?: string;
  skip?: number;
  take?: number;
}

/** Data-access for the Collection model. */
export const collectionRepository = {
  findMany({ search, skip = 0, take = 50 }: FindManyOptions): Promise<Collection[]> {
    const where: Prisma.CollectionWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    return prisma.collection.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  },

  count(search?: string): Promise<number> {
    const where: Prisma.CollectionWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
    return prisma.collection.count({ where });
  },

  findById(id: string): Promise<Collection | null> {
    return prisma.collection.findUnique({ where: { id } });
  },

  create(data: Prisma.CollectionCreateInput): Promise<Collection> {
    return prisma.collection.create({ data });
  },

  update(id: string, data: Prisma.CollectionUpdateInput): Promise<Collection> {
    return prisma.collection.update({ where: { id }, data });
  },

  delete(id: string): Promise<Collection> {
    return prisma.collection.delete({ where: { id } });
  },
};
