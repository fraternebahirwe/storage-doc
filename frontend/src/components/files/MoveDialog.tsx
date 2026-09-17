import { useEffect, useState } from "react";
import { HardDrive, Folder } from "lucide-react";
import { Button } from "../ui/Button";
import * as folderService from "../../services/folderService";
import type { FolderWithPath } from "../../services/folderService";

export function MoveDialog({
  itemName,
  currentFolderId,
  excludeFolderId,
  isLoading,
  onSubmit,
  onCancel,
}: {
  itemName: string;
  currentFolderId: string | null;
  /** When moving a folder, its own subtree can't be a valid destination. */
  excludeFolderId?: string;
  isLoading?: boolean;
  onSubmit: (folderId: string | null) => void;
  onCancel: () => void;
}) {
  const [folders, setFolders] = useState<FolderWithPath[]>([]);
  const [selected, setSelected] = useState<string | null>(currentFolderId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void folderService.listAllFolders().then(({ folders }) => {
      setFolders(folders);
      setLoading(false);
    });
  }, []);

  // The exact folder being moved can't be its own destination. Moving it into
  // one of its own descendants is also invalid; the backend rejects that
  // (400) as a defense-in-depth check, since detecting it here would need
  // each candidate's full ancestry, not just its display path.
  const options = folders.filter((f) => f.id !== excludeFolderId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="move-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl"
      >
        <h2 id="move-dialog-title" className="mb-1 text-base font-semibold text-[var(--color-text)]">
          Move "{itemName}"
        </h2>
        <p className="mb-3 text-sm text-[var(--color-text-muted)]">Choose a destination.</p>

        <div className="max-h-64 overflow-y-auto rounded-lg border border-[var(--color-border)]">
          <button
            onClick={() => setSelected(null)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
              selected === null ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]" : "text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
            }`}
          >
            <HardDrive size={15} /> My Files (root)
          </button>
          {loading ? (
            <p className="px-3 py-2 text-sm text-[var(--color-text-muted)]">Loading folders…</p>
          ) : (
            options.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelected(folder.id)}
                  className={`flex w-full items-center gap-2 border-t border-[var(--color-border)] px-3 py-2 text-left text-sm ${
                    selected === folder.id
                      ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                      : "text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
                  }`}
                >
                  <Folder size={15} className="shrink-0" />
                  <span className="truncate">{folder.path}</span>
                </button>
              ))
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            isLoading={isLoading}
            disabled={selected === currentFolderId}
            onClick={() => onSubmit(selected)}
          >
            Move here
          </Button>
        </div>
      </div>
    </div>
  );
}
