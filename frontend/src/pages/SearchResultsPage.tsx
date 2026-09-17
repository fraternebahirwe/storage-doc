import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Folder, Search as SearchIcon, Star } from "lucide-react";
import * as searchService from "../services/searchService";
import type { SearchResult } from "../services/searchService";
import type { FileCategory } from "../services/fileService";
import { FileCard } from "../components/files/FileCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { NamePromptDialog } from "../components/ui/NamePromptDialog";
import { MoveDialog } from "../components/files/MoveDialog";
import { useToast } from "../hooks/useToast";
import { ApiRequestError } from "../services/api";
import * as fileService from "../services/fileService";
import type { FileRecord } from "../services/fileService";

const CATEGORY_OPTIONS: { label: string; value: FileCategory | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
  { label: "Documents", value: "document" },
];

export function SearchResultsPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = (searchParams.get("category") as FileCategory | null) ?? undefined;
  const favoriteOnly = searchParams.get("favorite") === "true";

  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [renameTarget, setRenameTarget] = useState<FileRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);
  const [moveTarget, setMoveTarget] = useState<FileRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await searchService.search({ q, category, favorite: favoriteOnly || undefined, limit: 48 });
    setResult(data);
    setLoading(false);
  }, [q, category, favoriteOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateFilter(key: string, value: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  async function handleRename(name: string) {
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

  async function handleDelete() {
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

  async function handleMove(folderId: string | null) {
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

  async function handleToggleFavorite(file: FileRecord) {
    try {
      await fileService.setFavorite(file.id, !file.isFavorite);
      await load();
    } catch {
      showToast("Couldn't update favorite.", "error");
    }
  }

  const hasResults = result && (result.files.length > 0 || result.folders.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Search</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{q ? `Results for "${q}"` : "Filter your files below."}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.label}
            onClick={() => updateFilter("category", option.value)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              category === option.value
                ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
            }`}
          >
            {option.label}
          </button>
        ))}
        <button
          onClick={() => updateFilter("favorite", favoriteOnly ? undefined : "true")}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${
            favoriteOnly
              ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
              : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
          }`}
        >
          <Star size={14} fill={favoriteOnly ? "currentColor" : "none"} /> Favorites
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Searching…</p>
      ) : !hasResults ? (
        <EmptyState
          icon={SearchIcon}
          title={q ? `No files found for "${q}"` : "Type something to search."}
          description={q ? "Try a different name, or adjust your filters." : undefined}
        />
      ) : (
        <>
          {result.folders.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-[var(--color-text)]">Folders</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {result.folders.map((folder) => (
                  <Link
                    key={folder.id}
                    to={`/files?folder=${folder.id}`}
                    className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
                  >
                    <Folder size={16} className="shrink-0 text-[var(--color-brand)]" />
                    <span className="truncate">{folder.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {result.files.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-[var(--color-text)]">Files</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {result.files.map((file) => (
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
            </div>
          )}
        </>
      )}

      {renameTarget && (
        <NamePromptDialog
          initialName={renameTarget.name}
          isLoading={isSaving}
          onSubmit={handleRename}
          onCancel={() => setRenameTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this file?"
          description={`"${deleteTarget.name}" will be deleted. Trash and restore are coming in a later phase.`}
          confirmLabel="Delete"
          isLoading={isSaving}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {moveTarget && (
        <MoveDialog
          itemName={moveTarget.name}
          currentFolderId={moveTarget.folderId}
          isLoading={isSaving}
          onSubmit={handleMove}
          onCancel={() => setMoveTarget(null)}
        />
      )}
    </div>
  );
}
