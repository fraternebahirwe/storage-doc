import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().trim().min(1, "Name can't be empty.").max(255),
  parentFolderId: z.string().min(1).nullish(),
});

export const renameFolderSchema = z.object({
  name: z.string().trim().min(1, "Name can't be empty.").max(255),
});

export const listFoldersQuerySchema = z.object({
  parentFolderId: z.string().min(1).optional(),
});
