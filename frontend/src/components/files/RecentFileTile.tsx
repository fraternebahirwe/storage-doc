import type { FileRecord } from "../../services/fileService";
import { fileViewUrl } from "../../services/fileService";
import { categoryIcon } from "./fileIcons";
import { formatBytes } from "../../utils/format";

export function RecentFileTile({ file }: { file: FileRecord }) {
  const Icon = categoryIcon[file.category];

  return (
    <a
      href={fileViewUrl(file.id)}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="flex aspect-square items-center justify-center bg-[var(--color-surface-muted)]">
        {file.category === "image" ? (
          <img src={fileViewUrl(file.id)} alt={file.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <Icon size={26} className="text-[var(--color-text-muted)]" />
        )}
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-sm font-medium text-[var(--color-text)]" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">{formatBytes(file.size)}</p>
      </div>
    </a>
  );
}
