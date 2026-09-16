import { formatBytes } from "../../utils/format";

export function StorageMeter({ usedBytes, limitBytes }: { usedBytes: number; limitBytes: number }) {
  const percent = limitBytes > 0 ? Math.min(100, (usedBytes / limitBytes) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {formatBytes(usedBytes)} used of {formatBytes(limitBytes)}
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">{percent.toFixed(1)}%</p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]"
      >
        <div
          className="h-full rounded-full bg-[var(--color-brand)] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
