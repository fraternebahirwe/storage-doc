import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { search } from "../services/search.service.js";
import { searchQuerySchema } from "../validation/search.validation.js";

export const runSearch = asyncHandler(async (req: Request, res: Response) => {
  const query = searchQuerySchema.parse(req.query);
  const result = await search(req.userId!, query);
  res.status(200).json(result);
});
