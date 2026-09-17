import { useRef, useState } from "react";
import { Download, FolderInput, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import type { FileRecord } from "../../services/fileService";
import { fileDownloadUrl, fileViewUrl } from "../../services/fileService";
import { categoryIcon } from "./fileIcons";
import { formatBytes } from "../../utils/format";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function FilePreview({ file }: { file: FileRecord }) {
  if (file.category === "image") {
    return <img src={fileViewUrl(file.id)} alt={file.name} className="h-full w-full object-cover" loading="lazy" />;
  }
  if (file.category === "video") {
    return <video src={fileViewUrl(file.id)} className="h-full w-full object-cover" muted preload="metadata" />;
  }
  const Icon = categoryIcon[file.category];
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Icon size={28} className="text-[var(--color-text-muted)]" />
    </div>
  );
}

export function FileCard({
  file,
  onRename,
  onMove,
  onDelete,
  onToggleFavorite,
}: {
  file: FileRecord;
  onRename: (file: FileRecord) => void;
  onMove: (file: FileRecord) => void;
  onDelete: (file: FileRecord) => void;
  onToggleFavorite: (file: FileRecord) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <a
        href={fileViewUrl(file.id)}
        target="_blank"
        rel="noreferrer"
        className="flex aspect-square items-center justify-center bg-[var(--color-surface-muted)]"
      >
        <FilePreview file={file} />
      </a>
      <div className="flex flex-1 flex-col gap-1 px-3 py-2.5">
        <div className="flex items-start justify-between gap-1">
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-text)]" title={file.name}>
            {file.name}
          </p>
          <button
            onClick={() => onToggleFavorite(file)}
            aria-pressed={file.isFavorite}
            aria-label={file.isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
          >
            <Star size={15} fill={file.isFavorite ? "currentColor" : "none"} className={file.isFavorite ? "text-[var(--color-brand)]" : ""} />
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          {formatBytes(file.size)} &middot; {formatDate(file.createdAt)}
        </p>

        <div className="relative mt-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`More options for ${file.name}`}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
          >
            <MoreVertical size={14} /> Options
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute left-0 z-10 mt-1 w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
            >
              <a
                role="menuitem"
                href={fileDownloadUrl(file.id)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
              >
                <Download size={14} /> Download
              </a>
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onRename(file);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
              >
                <Pencil size={14} /> Rename
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onMove(file);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
              >
                <FolderInput size={14} /> Move
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(file);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-muted)]"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
