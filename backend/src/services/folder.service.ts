import type { Folder } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";

function serializeFolder(folder: { id: string; name: string; parentFolderId: string | null; createdAt: Date; updatedAt: Date }) {
  return {
    id: folder.id,
    name: folder.name,
    parentFolderId: folder.parentFolderId,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
  };
}

export async function getOwnedFolder(userId: string, folderId: string) {
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder || folder.userId !== userId) {
    throw ApiError.notFound("We couldn't find that folder.", "FOLDER_NOT_FOUND");
  }
  return folder;
}

export async function createFolder(userId: string, name: string, parentFolderId?: string | null) {
  if (parentFolderId) {
    await getOwnedFolder(userId, parentFolderId);
  }
  const folder = await prisma.folder.create({
    data: { userId, name, parentFolderId: parentFolderId ?? null },
  });
  return serializeFolder(folder);
}

export async function listFolders(userId: string, parentFolderId: string | null) {
  if (parentFolderId) {
    await getOwnedFolder(userId, parentFolderId);
  }
  const folders = await prisma.folder.findMany({
    where: { userId, parentFolderId },
    orderBy: { name: "asc" },
  });
  return folders.map(serializeFolder);
}

/** Every folder the user owns, each with its full "A / B / C" path — used by the move-to-folder picker. */
export async function listAllFoldersWithPaths(userId: string) {
  const folders = await prisma.folder.findMany({ where: { userId }, orderBy: { name: "asc" } });
  const byId = new Map(folders.map((f) => [f.id, f]));

  function pathFor(folder: (typeof folders)[number]): string {
    const segments: string[] = [folder.name];
    let parentId = folder.parentFolderId;
    for (let i = 0; i < 100 && parentId; i++) {
      const parent = byId.get(parentId);
      if (!parent) break;
      segments.unshift(parent.name);
      parentId = parent.parentFolderId;
    }
    return segments.join(" / ");
  }

  return folders.map((folder) => ({ id: folder.id, name: folder.name, path: pathFor(folder) }));
}

/** Ancestor chain from root to (excluding) the given folder, for breadcrumbs. */
export async function getFolderBreadcrumbs(userId: string, folderId: string | null) {
  const breadcrumbs: { id: string; name: string }[] = [];
  let currentId = folderId;

  // Bounded by a sane max depth so a corrupted/cyclic chain can't hang the request.
  for (let i = 0; i < 100 && currentId; i++) {
    const folder = await getOwnedFolder(userId, currentId);
    breadcrumbs.unshift({ id: folder.id, name: folder.name });
    currentId = folder.parentFolderId;
  }

  return breadcrumbs;
}

async function isDescendant(userId: string, folderId: string, possibleAncestorId: string): Promise<boolean> {
  let currentId: string | null = folderId;
  for (let i = 0; i < 100 && currentId; i++) {
    if (currentId === possibleAncestorId) return true;
    const current: Folder | null = await prisma.folder.findUnique({ where: { id: currentId } });
    if (!current || current.userId !== userId) return false;
    currentId = current.parentFolderId;
  }
  return false;
}

export async function renameFolder(userId: string, folderId: string, name: string) {
  await getOwnedFolder(userId, folderId);
  const folder = await prisma.folder.update({ where: { id: folderId }, data: { name } });
  return serializeFolder(folder);
}

export async function moveFolder(userId: string, folderId: string, newParentFolderId: string | null) {
  await getOwnedFolder(userId, folderId);

  if (newParentFolderId) {
    await getOwnedFolder(userId, newParentFolderId);
    if (newParentFolderId === folderId || (await isDescendant(userId, newParentFolderId, folderId))) {
      throw ApiError.badRequest("A folder can't be moved into itself or one of its own subfolders.", "INVALID_MOVE");
    }
  }

  const folder = await prisma.folder.update({ where: { id: folderId }, data: { parentFolderId: newParentFolderId } });
  return serializeFolder(folder);
}

export async function deleteFolder(userId: string, folderId: string) {
  await getOwnedFolder(userId, folderId);
  // Subfolders cascade-delete via the schema's FK; files inside are set to
  // folderId=null (moved to root) rather than deleted, per the File
  // model's onDelete: SetNull.
  await prisma.folder.delete({ where: { id: folderId } });
}
