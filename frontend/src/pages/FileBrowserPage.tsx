import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as fileService from "../services/fileService";
import type { FileCategory, FileRecord } from "../services/fileService";
import { UploadDropzone } from "../components/files/UploadDropzone";
import { UploadQueue, type UploadQueueItem } from "../components/files/UploadQueue";
import { FileCard } from "../components/files/FileCard";
import { FileListRow } from "../components/files/FileListRow";
import { ViewToggle } from "../components/files/ViewToggle";
import { MoveDialog } from "../components/files/MoveDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { NamePromptDialog } from "../components/ui/NamePromptDialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { useToast } from "../hooks/useToast";
import { useViewPreference } from "../hooks/useViewPreference";
import { ApiRequestError } from "../services/api";

export function FileBrowserPage({
  title,
  category,
  emptyIcon,
  emptyDescription,
}: {
  title: string;
  category?: FileCategory;
  emptyIcon: LucideIcon;
  emptyDescription: string;
}) {
  const { showToast } = useToast();

  const [view, setView] = useViewPreference();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [renameTarget, setRenameTarget] = useState<FileRecord | null>(null);
  const [moveTarget, setMoveTarget] = useState<FileRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const result = await fileService.listFiles({ page, limit: 24, category });
    setFiles(result.files);
    setTotalPages(result.totalPages);
    setLoading(false);
  }, [page, category]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

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
          await fileService.uploadFile(file, (percent) => {
            setUploadQueue((prev) => prev.map((q) => (q.id === queueId ? { ...q, progress: percent } : q)));
          });
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
    setPage(1);
    await load();
  }

  async function handleRenameSubmit(name: string) {
    if (!renameTarget) return;
    setIsSaving(true);
    try {
      await fileService.renameFile(renameTarget.id, name);
      showToast("File renamed.");
      setRenameTarget(null);
      await load();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't rename that file.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMoveSubmit(folderId: string | null) {
    if (!moveTarget) return;
    setIsSaving(true);
    try {
      await fileService.moveFile(moveTarget.id, folderId);
      showToast("File moved.");
      setMoveTarget(null);
      await load();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't move that file.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await fileService.deleteFile(deleteTarget.id);
      showToast("File deleted.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't delete that file.", "error");
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">{title}</h1>
        <ViewToggle view={view} onChange={setView} />
      </div>

      <UploadDropzone onFilesSelected={handleFilesSelected} />
      <UploadQueue items={uploadQueue} />

      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      ) : files.length === 0 ? (
        <EmptyState icon={emptyIcon} title="No files yet." description={emptyDescription} />
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onRename={setRenameTarget}
                  onMove={setMoveTarget}
                  onDelete={setDeleteTarget}
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
                  onRename={setRenameTarget}
                  onMove={setMoveTarget}
                  onDelete={setDeleteTarget}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}

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

      {renameTarget && (
        <NamePromptDialog
          initialName={renameTarget.name}
          isLoading={isSaving}
          onSubmit={handleRenameSubmit}
          onCancel={() => setRenameTarget(null)}
        />
      )}

      {moveTarget && (
        <MoveDialog
          itemName={moveTarget.name}
          currentFolderId={moveTarget.folderId}
          isLoading={isSaving}
          onSubmit={handleMoveSubmit}
          onCancel={() => setMoveTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this file?"
          description={`"${deleteTarget.name}" will be deleted. Trash and restore are coming in a later phase.`}
          confirmLabel="Delete"
          isLoading={isSaving}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
