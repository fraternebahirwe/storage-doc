import type { Express } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { storage } from "./storage/index.js";
import { getOwnedFolder } from "./folder.service.js";
import { categoryForExtension, extensionOf, extensionsForCategory, type SearchableCategory } from "../config/fileTypes.js";

function serializeFile(file: {
  id: string;
  name: string;
  mimeType: string;
  extension: string;
  size: bigint;
  isFavorite: boolean;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
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
  };
}

async function currentUsageBytes(userId: string): Promise<number> {
  const result = await prisma.file.aggregate({
    where: { userId, isDeleted: false },
    _sum: { size: true },
  });
  return Number(result._sum.size ?? 0n);
}

export async function createFileRecord(userId: string, uploaded: Express.Multer.File, folderId?: string | null) {
  if (folderId) {
    await getOwnedFolder(userId, folderId);
  }

  const used = await currentUsageBytes(userId);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (used + uploaded.size > Number(user.storageLimit)) {
    await storage.deleteFile(userId, uploaded.filename);
    throw new ApiError(413, "This upload would put you over your storage limit.", "STORAGE_LIMIT_EXCEEDED");
  }

  const file = await prisma.file.create({
    data: {
      userId,
      folderId: folderId ?? null,
      name: uploaded.originalname,
      originalName: uploaded.originalname,
      storageKey: uploaded.filename,
      mimeType: uploaded.mimetype,
      extension: extensionOf(uploaded.originalname),
      size: BigInt(uploaded.size),
    },
  });

  return serializeFile(file);
}

export async function listFiles(
  userId: string,
  options: { page: number; limit: number; category?: SearchableCategory; folderId?: string | null },
) {
  // Category filtering happens in the DB via extension, since it's cheap
  // and the set of extensions per category is small and fixed.
  const categoryWhere = options.category ? { extension: { in: extensionsForCategory(options.category) } } : {};

  const folderWhere = options.folderId !== undefined ? { folderId: options.folderId } : {};

  const where = { userId, isDeleted: false, ...categoryWhere, ...folderWhere };

  const [files, total] = await Promise.all([
    prisma.file.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),
    prisma.file.count({ where }),
  ]);

  return {
    files: files.map(serializeFile),
    page: options.page,
    limit: options.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / options.limit)),
  };
}

export async function getOwnedFile(userId: string, fileId: string) {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file || file.userId !== userId || file.isDeleted) {
    throw ApiError.notFound("We couldn't find that file.", "FILE_NOT_FOUND");
  }
  return file;
}

export async function renameFile(userId: string, fileId: string, name: string) {
  await getOwnedFile(userId, fileId);
  const file = await prisma.file.update({ where: { id: fileId }, data: { name } });
  return serializeFile(file);
}

export async function moveFile(userId: string, fileId: string, folderId: string | null) {
  await getOwnedFile(userId, fileId);
  if (folderId) {
    await getOwnedFolder(userId, folderId);
  }
  const file = await prisma.file.update({ where: { id: fileId }, data: { folderId } });
  return serializeFile(file);
}

export async function toggleFavorite(userId: string, fileId: string, isFavorite: boolean) {
  await getOwnedFile(userId, fileId);
  const file = await prisma.file.update({ where: { id: fileId }, data: { isFavorite } });
  return serializeFile(file);
}

export async function softDeleteFile(userId: string, fileId: string) {
  await getOwnedFile(userId, fileId);
  await prisma.file.update({ where: { id: fileId }, data: { isDeleted: true, deletedAt: new Date() } });
}

export async function getStorageSummary(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const [imageAgg, videoAgg, documentAgg, totalAgg, totalCount] = await Promise.all([
    prisma.file.aggregate({ where: { userId, isDeleted: false, extension: { in: extensionsForCategory("image") } }, _sum: { size: true }, _count: true }),
    prisma.file.aggregate({ where: { userId, isDeleted: false, extension: { in: extensionsForCategory("video") } }, _sum: { size: true }, _count: true }),
    prisma.file.aggregate({ where: { userId, isDeleted: false, extension: { in: extensionsForCategory("document") } }, _sum: { size: true }, _count: true }),
    prisma.file.aggregate({ where: { userId, isDeleted: false }, _sum: { size: true } }),
    prisma.file.count({ where: { userId, isDeleted: false } }),
  ]);

  return {
    usedBytes: Number(totalAgg._sum.size ?? 0n),
    limitBytes: Number(user.storageLimit),
    totalFiles: totalCount,
    photos: imageAgg._count,
    videos: videoAgg._count,
    documents: documentAgg._count,
    breakdown: {
      photos: Number(imageAgg._sum.size ?? 0n),
      videos: Number(videoAgg._sum.size ?? 0n),
      documents: Number(documentAgg._sum.size ?? 0n),
    },
  };
}

export async function listRecentFiles(userId: string, limit: number) {
  const files = await prisma.file.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return files.map(serializeFile);
}
