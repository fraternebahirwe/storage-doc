import { ChevronRight, HardDrive } from "lucide-react";

export function Breadcrumbs({
  trail,
  onNavigate,
}: {
  trail: { id: string | null; name: string }[];
  onNavigate: (folderId: string | null) => void;
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
      >
        <HardDrive size={14} /> My Files
      </button>
      {trail.map((crumb, index) => (
        <span key={crumb.id ?? "root"} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
          <button
            onClick={() => onNavigate(crumb.id)}
            disabled={index === trail.length - 1}
            className="rounded-md px-1.5 py-0.5 text-[var(--color-text-muted)] enabled:hover:bg-[var(--color-surface-muted)] enabled:hover:text-[var(--color-text)] disabled:font-medium disabled:text-[var(--color-text)]"
          >
            {crumb.name}
          </button>
        </span>
      ))}
    </nav>
  );
}
