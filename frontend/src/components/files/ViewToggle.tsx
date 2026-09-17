import { LayoutGrid, List } from "lucide-react";
import type { ViewMode } from "../../hooks/useViewPreference";

export function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (view: ViewMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--color-border)] p-0.5">
      <button
        onClick={() => onChange("grid")}
        aria-pressed={view === "grid"}
        aria-label="Grid view"
        className={`rounded-md p-1.5 ${view === "grid" ? "bg-[var(--color-surface-muted)] text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => onChange("list")}
        aria-pressed={view === "list"}
        aria-label="List view"
        className={`rounded-md p-1.5 ${view === "list" ? "bg-[var(--color-surface-muted)] text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}
      >
        <List size={16} />
      </button>
    </div>
  );
}
