import { CheckCircle2, X, XCircle } from "lucide-react";
import { useToast } from "../../hooks/useToast";

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg ${
            toast.variant === "success"
              ? "border-[var(--color-success)]/30 bg-[var(--color-surface)] text-[var(--color-text)]"
              : "border-[var(--color-danger)]/30 bg-[var(--color-surface)] text-[var(--color-text)]"
          }`}
        >
          {toast.variant === "success" ? (
            <CheckCircle2 size={16} className="shrink-0 text-[var(--color-success)]" />
          ) : (
            <XCircle size={16} className="shrink-0 text-[var(--color-danger)]" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
