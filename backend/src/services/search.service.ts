import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { categoryForExtension, extensionsForCategory, type SearchableCategory } from "../config/fileTypes.js";

export type SearchOptions = {
  q: string;
  category?: SearchableCategory;
  favorite?: boolean;
  folderId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minSize?: number;
  maxSize?: number;
  page: number;
  limit: number;
};

export async function search(userId: string, options: SearchOptions) {
  const where: Prisma.FileWhereInput = {
    userId,
    isDeleted: false,
    ...(options.q ? { name: { contains: options.q, mode: "insensitive" } } : {}),
    ...(options.category ? { extension: { in: extensionsForCategory(options.category) } } : {}),
    ...(options.favorite !== undefined ? { isFavorite: options.favorite } : {}),
    ...(options.folderId !== undefined ? { folderId: options.folderId } : {}),
    ...(options.dateFrom || options.dateTo
      ? { createdAt: { ...(options.dateFrom ? { gte: options.dateFrom } : {}), ...(options.dateTo ? { lte: options.dateTo } : {}) } }
      : {}),
    ...(options.minSize !== undefined || options.maxSize !== undefined
      ? { size: { ...(options.minSize !== undefined ? { gte: BigInt(options.minSize) } : {}), ...(options.maxSize !== undefined ? { lte: BigInt(options.maxSize) } : {}) } }
      : {}),
  };

  const [files, total, folders] = await Promise.all([
    prisma.file.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),
    prisma.file.count({ where }),
    // Folders only match on name, and only when there's a search term —
    // otherwise every folder would "match" an empty/filter-only search.
    options.q
      ? prisma.folder.findMany({
          where: { userId, name: { contains: options.q, mode: "insensitive" } },
          orderBy: { name: "asc" },
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  return {
    files: files.map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      extension: file.extension,
      size: Number(file.size),
      category: categoryForExtension(file.extension),
      isFavorite: file.isFavorite,
      folderId: file.folderId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    })),
    folders: folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      parentFolderId: folder.parentFolderId,
    })),
    page: options.page,
    limit: options.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / options.limit)),
  };
}
