import { apiRequest, ApiRequestError } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4100";

export type FileCategory = "image" | "video" | "document" | "other";

export type FileRecord = {
  id: string;
  name: string;
  mimeType: string;
  extension: string;
  size: number;
  category: FileCategory;
  isFavorite: boolean;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FileListResult = {
  files: FileRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type StorageSummary = {
  usedBytes: number;
  limitBytes: number;
  totalFiles: number;
  photos: number;
  videos: number;
  documents: number;
  breakdown: { photos: number; videos: number; documents: number };
};

export function listFiles(
  params: { page?: number; limit?: number; category?: FileCategory; folderId?: string | null } = {},
) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.category) search.set("category", params.category);
  if (params.folderId !== undefined) search.set("folderId", params.folderId ?? "root");
  const query = search.toString();
  return apiRequest<FileListResult>(`/api/files${query ? `?${query}` : ""}`);
}

export function fetchRecentFiles() {
  return apiRequest<{ files: FileRecord[] }>("/api/files/recent");
}

export function fetchStorageSummary() {
  return apiRequest<StorageSummary>("/api/storage/summary");
}

export function renameFile(id: string, name: string) {
  return apiRequest<{ file: FileRecord }>(`/api/files/${id}`, { method: "PATCH", body: { name } });
}

export function setFavorite(id: string, isFavorite: boolean) {
  return apiRequest<{ file: FileRecord }>(`/api/files/${id}/favorite`, { method: "PATCH", body: { isFavorite } });
}

export function moveFile(id: string, folderId: string | null) {
  return apiRequest<{ file: FileRecord }>(`/api/files/${id}/move`, { method: "PATCH", body: { folderId } });
}

export function deleteFile(id: string) {
  return apiRequest<{ ok: true }>(`/api/files/${id}`, { method: "DELETE" });
}

export function fileViewUrl(id: string) {
  return `${API_BASE_URL}/api/files/${id}`;
}

export function fileDownloadUrl(id: string) {
  return `${API_BASE_URL}/api/files/${id}?download=1`;
}

/**
 * Uploads one file with progress callbacks. Uses XHR (not fetch) because
 * fetch has no upload-progress event, and each file is its own request so
 * the UI can show independent per-file progress bars.
 */
export function uploadFile(
  file: File,
  onProgress: (percent: number) => void,
  folderId?: string | null,
): Promise<FileRecord> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/files`);
    xhr.withCredentials = true;

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });

    xhr.addEventListener("load", () => {
      let data: unknown = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // ignore parse failure; handled by status check below
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve((data as { file: FileRecord }).file);
        return;
      }

      const error = (data as { error?: { code?: string; message?: string } } | null)?.error;
      reject(new ApiRequestError(xhr.status, error?.code ?? "UPLOAD_FAILED", error?.message ?? "Upload failed."));
    });

    xhr.addEventListener("error", () => reject(new ApiRequestError(0, "NETWORK_ERROR", "Network error during upload.")));

    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folderId", folderId);
    xhr.send(formData);
  });
}
