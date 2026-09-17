import { useRef, useState } from "react";
import { Folder, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { FolderRecord } from "../../services/folderService";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

export function FolderTile({
  folder,
  onOpen,
  onRename,
  onDelete,
}: {
  folder: FolderRecord;
  onOpen: (folder: FolderRecord) => void;
  onRename: (folder: FolderRecord) => void;
  onDelete: (folder: FolderRecord) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <div className="group flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-3 pr-1.5">
      <button onClick={() => onOpen(folder)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <Folder size={18} className="shrink-0 text-[var(--color-brand)]" fill="currentColor" fillOpacity={0.15} />
        <span className="truncate text-sm font-medium text-[var(--color-text)]" title={folder.name}>
          {folder.name}
        </span>
      </button>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`More options for ${folder.name}`}
          className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
        >
          <MoreVertical size={15} />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
          >
            <button
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onRename(folder);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
            >
              <Pencil size={14} /> Rename
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onDelete(folder);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-muted)]"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
