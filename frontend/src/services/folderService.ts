import { apiRequest } from "./api";

export type FolderRecord = {
  id: string;
  name: string;
  parentFolderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FolderWithPath = { id: string; name: string; path: string };

export function listFolders(parentFolderId: string | null) {
  const query = parentFolderId ? `?parentFolderId=${parentFolderId}` : "";
  return apiRequest<{ folders: FolderRecord[]; breadcrumbs: { id: string; name: string }[] }>(`/api/folders${query}`);
}

export function listAllFolders() {
  return apiRequest<{ folders: FolderWithPath[] }>("/api/folders/all");
}

export function createFolder(name: string, parentFolderId: string | null) {
  return apiRequest<{ folder: FolderRecord }>("/api/folders", { method: "POST", body: { name, parentFolderId } });
}

export function renameFolder(id: string, name: string) {
  return apiRequest<{ folder: FolderRecord }>(`/api/folders/${id}`, { method: "PATCH", body: { name } });
}

export function moveFolder(id: string, parentFolderId: string | null) {
  return apiRequest<{ folder: FolderRecord }>(`/api/folders/${id}/move`, { method: "PATCH", body: { parentFolderId } });
}

export function deleteFolder(id: string) {
  return apiRequest<{ ok: true }>(`/api/folders/${id}`, { method: "DELETE" });
}
