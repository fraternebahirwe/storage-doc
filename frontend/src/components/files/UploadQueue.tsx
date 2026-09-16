import { AlertCircle, CheckCircle2, File as FileIcon } from "lucide-react";

export type UploadQueueItem = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

export function UploadQueue({ items }: { items: UploadQueueItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 text-sm">
          <FileIcon size={16} className="shrink-0 text-[var(--color-text-muted)]" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[var(--color-text)]">{item.name}</p>
              {item.status === "uploading" && (
                <span className="shrink-0 text-xs text-[var(--color-text-muted)]">{item.progress}%</span>
              )}
              {item.status === "done" && <CheckCircle2 size={16} className="shrink-0 text-[var(--color-success)]" />}
              {item.status === "error" && <AlertCircle size={16} className="shrink-0 text-[var(--color-danger)]" />}
            </div>
            {item.status === "uploading" && (
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--color-brand)] transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
            {item.status === "error" && <p className="mt-0.5 text-xs text-[var(--color-danger)]">{item.error}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
