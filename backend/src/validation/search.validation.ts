import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().max(255).optional().default(""),
  category: z.enum(["image", "video", "document"]).optional(),
  favorite: z.coerce.boolean().optional(),
  folderId: z.string().min(1).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minSize: z.coerce.number().int().min(0).optional(),
  maxSize: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});
