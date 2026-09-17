import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FolderClosed, FolderPlus, ChevronLeft, ChevronRight } from "lucide-react";
import * as fileService from "../services/fileService";
import type { FileRecord } from "../services/fileService";
import * as folderService from "../services/folderService";
import type { FolderRecord } from "../services/folderService";
import { UploadDropzone } from "../components/files/UploadDropzone";
import { UploadQueue, type UploadQueueItem } from "../components/files/UploadQueue";
import { FileCard } from "../components/files/FileCard";
import { FileListRow } from "../components/files/FileListRow";
import { FolderTile } from "../components/files/FolderTile";
import { Breadcrumbs } from "../components/files/Breadcrumbs";
import { ViewToggle } from "../components/files/ViewToggle";
import { MoveDialog } from "../components/files/MoveDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { NamePromptDialog } from "../components/ui/NamePromptDialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { useToast } from "../hooks/useToast";
import { useViewPreference } from "../hooks/useViewPreference";
import { ApiRequestError } from "../services/api";

type MoveTarget = { kind: "file" | "folder"; id: string; name: string; folderId: string | null };

export function MyFilesPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFolderId = searchParams.get("folder");

  const [view, setView] = useViewPreference();
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);

  const [renameFileTarget, setRenameFileTarget] = useState<FileRecord | null>(null);
  const [deleteFileTarget, setDeleteFileTarget] = useState<FileRecord | null>(null);
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null);
  const [renameFolderTarget, setRenameFolderTarget] = useState<FolderRecord | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<FolderRecord | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset to page 1 whenever the folder changes, so a deep page number from
  // one folder doesn't carry over and produce an out-of-range fetch in another.
  useEffect(() => {
    setPage(1);
  }, [currentFolderId]);

  const load = useCallback(async () => {
    const [folderResult, fileResult] = await Promise.all([
      folderService.listFolders(currentFolderId),
      fileService.listFiles({ page, limit: 24, folderId: currentFolderId }),
    ]);
    setFolders(folderResult.folders);
    setBreadcrumbs(folderResult.breadcrumbs);
    setFiles(fileResult.files);
    setTotalPages(fileResult.totalPages);
    setLoading(false);
  }, [currentFolderId, page]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  function openFolder(folderId: string | null) {
    setSearchParams(folderId ? { folder: folderId } : {});
  }

  async function handleFilesSelected(selected: File[]) {
    const items: UploadQueueItem[] = selected.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
      progress: 0,
      status: "uploading",
    }));
    setUploadQueue((prev) => [...prev, ...items]);

    await Promise.all(
      selected.map(async (file, index) => {
        const queueId = items[index].id;
        try {
          await fileService.uploadFile(
            file,
            (percent) => setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, progress: percent } : q))),
            currentFolderId,
          );
          setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, status: "done", progress: 100 } : q)));
        } catch (err) {
          const message = err instanceof ApiRequestError ? err.message : "Upload failed.";
          setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, status: "error", error: message } : q)));
          showToast(`${file.name}: ${message}`, "error");
        }
      }),
    );

    showToast("Your files are safely stored.");
    setTimeout(() => setUploadQueue((prev) => prev.filter((q) => q.status === "uploading")), 3000);
    await load();
  }

  async function handleCreateFolder(name: string) {
    setIsSaving(true);
    try {
      await folderService.createFolder(name, currentFolderId);
      showToast("Folder created.");
      setCreatingFolder(false);
      await load();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't create that folder.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRenameFile(name: string) {
    if (!renameFileTarget) return;
    setIsSaving(true);
    try {
      await fileService.renameFile(renameFileTarget.id, name);
      showToast("File renamed.");
      setRenameFileTarget(null);
      await load();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't rename that file.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRenameFolder(name: string) {
    if (!renameFolderTarget) return;
    setIsSaving(true);
    try {
      await folderService.renameFolder(renameFolderTarget.id, name);
      showToast("Folder renamed.");
      setRenameFolderTarget(null);
      await load();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't rename that folder.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteFile() {
    if (!deleteFileTarget) return;
    setIsSaving(true);
    try {
      await fileService.deleteFile(deleteFileTarget.id);
      showToast("File deleted.");
      setDeleteFileTarget(null);
      await load();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't delete that file.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteFolder() {
    if (!deleteFolderTarget) return;
    setIsSaving(true);
    try {
      await folderService.deleteFolder(deleteFolderTarget.id);
      showToast("Folder deleted.");
      setDeleteFolderTarget(null);
      await load();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't delete that folder.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMove(destinationFolderId: string | null) {
    if (!moveTarget) return;
    setIsSaving(true);
    try {
      if (moveTarget.kind === "file") {
        await fileService.moveFile(moveTarget.id, destinationFolderId);
      } else {
        await folderService.moveFolder(moveTarget.id, destinationFolderId);
      }
      showToast(`${moveTarget.kind === "file" ? "File" : "Folder"} moved.`);
      setMoveTarget(null);
      await load();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't move that.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleFavorite(file: FileRecord) {
    setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, isFavorite: !f.isFavorite } : f)));
    try {
      await fileService.setFavorite(file.id, !file.isFavorite);
    } catch {
      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, isFavorite: file.isFavorite } : f)));
      showToast("Couldn't update favorite.", "error");
    }
  }

  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">My Files</h1>
          <div className="mt-1">
            <Breadcrumbs trail={breadcrumbs} onNavigate={openFolder} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setCreatingFolder(true)}>
            <FolderPlus size={16} /> New folder
          </Button>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      <UploadDropzone onFilesSelected={handleFilesSelected} />
      <UploadQueue items={uploadQueue} />

      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      ) : isEmpty ? (
        <EmptyState icon={FolderClosed} title="No files yet." description="Upload something or create a folder to get started." />
      ) : (
        <>
          {folders.length > 0 &&
            (view === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {folders.map((folder) => (
                  <FolderTile
                    key={folder.id}
                    folder={folder}
                    onOpen={(f) => openFolder(f.id)}
                    onRename={setRenameFolderTarget}
                    onDelete={setDeleteFolderTarget}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                {folders.map((folder) => (
                  <FolderTile
                    key={folder.id}
                    folder={folder}
                    onOpen={(f) => openFolder(f.id)}
                    onRename={setRenameFolderTarget}
                    onDelete={setDeleteFolderTarget}
                  />
                ))}
              </div>
            ))}

          {files.length > 0 &&
            (view === "grid" ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onRename={setRenameFileTarget}
                    onMove={(f) => setMoveTarget({ kind: "file", id: f.id, name: f.name, folderId: f.folderId })}
                    onDelete={setDeleteFileTarget}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                {files.map((file) => (
                  <FileListRow
                    key={file.id}
                    file={file}
                    onRename={setRenameFileTarget}
                    onMove={(f) => setMoveTarget({ kind: "file", id: f.id, name: f.name, folderId: f.folderId })}
                    onDelete={setDeleteFileTarget}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={16} /> Previous
              </Button>
              <span className="text-sm text-[var(--color-text-muted)]">
                Page {page} of {totalPages}
              </span>
              <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}

      {creatingFolder && (
        <NamePromptDialog
          title="New folder"
          fieldLabel="Folder name"
          submitLabel="Create"
          isLoading={isSaving}
          onSubmit={handleCreateFolder}
          onCancel={() => setCreatingFolder(false)}
        />
      )}

      {renameFileTarget && (
        <NamePromptDialog
          initialName={renameFileTarget.name}
          isLoading={isSaving}
          onSubmit={handleRenameFile}
          onCancel={() => setRenameFileTarget(null)}
        />
      )}

      {renameFolderTarget && (
        <NamePromptDialog
          initialName={renameFolderTarget.name}
          isLoading={isSaving}
          onSubmit={handleRenameFolder}
          onCancel={() => setRenameFolderTarget(null)}
        />
      )}

      {deleteFileTarget && (
        <ConfirmDialog
          title="Delete this file?"
          description={`"${deleteFileTarget.name}" will be deleted. Trash and restore are coming in a later phase.`}
          confirmLabel="Delete"
          isLoading={isSaving}
          onConfirm={handleDeleteFile}
          onCancel={() => setDeleteFileTarget(null)}
        />
      )}

      {deleteFolderTarget && (
        <ConfirmDialog
          title="Delete this folder?"
          description={`"${deleteFolderTarget.name}" and any subfolders will be deleted. Files inside will be moved to My Files, not deleted.`}
          confirmLabel="Delete"
          isLoading={isSaving}
          onConfirm={handleDeleteFolder}
          onCancel={() => setDeleteFolderTarget(null)}
        />
      )}

      {moveTarget && (
        <MoveDialog
          itemName={moveTarget.name}
          currentFolderId={moveTarget.folderId}
          excludeFolderId={moveTarget.kind === "folder" ? moveTarget.id : undefined}
          isLoading={isSaving}
          onSubmit={handleMove}
          onCancel={() => setMoveTarget(null)}
        />
      )}
    </div>
  );
}
