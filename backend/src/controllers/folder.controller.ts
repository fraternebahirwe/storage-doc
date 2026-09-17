import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createFolder,
  deleteFolder,
  getFolderBreadcrumbs,
  listAllFoldersWithPaths,
  listFolders,
  moveFolder,
  renameFolder,
} from "../services/folder.service.js";
import { createFolderSchema, listFoldersQuerySchema, renameFolderSchema } from "../validation/folder.validation.js";
import { z } from "zod";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, parentFolderId } = createFolderSchema.parse(req.body);
  const folder = await createFolder(req.userId!, name, parentFolderId);
  res.status(201).json({ folder });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { parentFolderId } = listFoldersQuerySchema.parse(req.query);
  const [folders, breadcrumbs] = await Promise.all([
    listFolders(req.userId!, parentFolderId ?? null),
    getFolderBreadcrumbs(req.userId!, parentFolderId ?? null),
  ]);
  res.status(200).json({ folders, breadcrumbs });
});

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const folders = await listAllFoldersWithPaths(req.userId!);
  res.status(200).json({ folders });
});

export const rename = asyncHandler(async (req: Request, res: Response) => {
  const { name } = renameFolderSchema.parse(req.body);
  const folder = await renameFolder(req.userId!, req.params.id, name);
  res.status(200).json({ folder });
});

const moveFolderSchema = z.object({ parentFolderId: z.string().min(1).nullable() });

export const move = asyncHandler(async (req: Request, res: Response) => {
  const { parentFolderId } = moveFolderSchema.parse(req.body);
  const folder = await moveFolder(req.userId!, req.params.id, parentFolderId);
  res.status(200).json({ folder });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteFolder(req.userId!, req.params.id);
  res.status(200).json({ ok: true });
});
