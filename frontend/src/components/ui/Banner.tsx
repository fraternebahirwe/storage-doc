import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export function Banner({ variant, children }: { variant: "error" | "success"; children: ReactNode }) {
  const isError = variant === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
        isError
          ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
          : "bg-[var(--color-success)]/10 text-[var(--color-success)]"
      }`}
    >
      {isError ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}
