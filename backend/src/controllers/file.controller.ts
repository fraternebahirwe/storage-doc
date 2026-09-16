import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { storage } from "../services/storage/index.js";
import {
  createFileRecord,
  getOwnedFile,
  getStorageSummary,
  listFiles,
  listRecentFiles,
  renameFile,
  softDeleteFile,
  toggleFavorite,
} from "../services/file.service.js";
import { favoriteFileSchema, listFilesQuerySchema, renameFileSchema } from "../validation/file.validation.js";

export const upload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest("No file was uploaded.", "NO_FILE");
  }
  const file = await createFileRecord(req.userId!, req.file);
  res.status(201).json({ file });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listFilesQuerySchema.parse(req.query);
  const result = await listFiles(req.userId!, query);
  res.status(200).json(result);
});

export const recent = asyncHandler(async (req: Request, res: Response) => {
  const files = await listRecentFiles(req.userId!, 8);
  res.status(200).json({ files });
});

export const download = asyncHandler(async (req: Request, res: Response) => {
  const file = await getOwnedFile(req.userId!, req.params.id);
  const disposition = req.query.download ? "attachment" : "inline";
  const safeName = file.name.replace(/[^\w.\- ]/g, "_");

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `${disposition}; filename="${safeName}"`);
  await storage.streamToResponse(req.userId!, file.storageKey, res);
});

export const rename = asyncHandler(async (req: Request, res: Response) => {
  const { name } = renameFileSchema.parse(req.body);
  const file = await renameFile(req.userId!, req.params.id, name);
  res.status(200).json({ file });
});

export const favorite = asyncHandler(async (req: Request, res: Response) => {
  const { isFavorite } = favoriteFileSchema.parse(req.body);
  const file = await toggleFavorite(req.userId!, req.params.id, isFavorite);
  res.status(200).json({ file });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await softDeleteFile(req.userId!, req.params.id);
  res.status(200).json({ ok: true });
});

export const storageSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await getStorageSummary(req.userId!);
  res.status(200).json(summary);
});
