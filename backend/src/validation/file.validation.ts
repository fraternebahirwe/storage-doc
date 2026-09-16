import { z } from "zod";

export const listFilesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  category: z.enum(["image", "video", "document"]).optional(),
});

export const renameFileSchema = z.object({
  name: z.string().trim().min(1, "Name can't be empty.").max(255),
});

export const favoriteFileSchema = z.object({
  isFavorite: z.boolean(),
});
