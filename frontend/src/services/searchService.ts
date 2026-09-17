import { apiRequest } from "./api";
import type { FileCategory, FileRecord } from "./fileService";

export type SearchParams = {
  q: string;
  category?: FileCategory;
  favorite?: boolean;
  dateFrom?: string;
  dateTo?: string;
  minSize?: number;
  maxSize?: number;
  page?: number;
  limit?: number;
};

export type SearchResult = {
  files: FileRecord[];
  folders: { id: string; name: string; parentFolderId: string | null }[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function search(params: SearchParams) {
  const search = new URLSearchParams();
  search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.favorite !== undefined) search.set("favorite", String(params.favorite));
  if (params.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params.dateTo) search.set("dateTo", params.dateTo);
  if (params.minSize !== undefined) search.set("minSize", String(params.minSize));
  if (params.maxSize !== undefined) search.set("maxSize", String(params.maxSize));
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  return apiRequest<SearchResult>(`/api/search?${search.toString()}`);
}
