import type { LucideIcon } from "lucide-react";

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <Icon size={16} />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  );
}
