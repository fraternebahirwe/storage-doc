import type { LucideIcon } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";

export function ComingSoonPage({
  title,
  icon,
  description,
}: {
  title: string;
  icon: LucideIcon;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-[var(--color-text)]">{title}</h1>
      <EmptyState icon={icon} title="This section is on its way." description={description} />
    </div>
  );
}
