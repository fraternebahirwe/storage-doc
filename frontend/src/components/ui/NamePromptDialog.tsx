import { useState, type FormEvent } from "react";
import { Button } from "./Button";
import { FormField } from "./FormField";

export function NamePromptDialog({
  title = "Rename",
  fieldLabel = "Name",
  submitLabel = "Save",
  initialName = "",
  isLoading,
  onSubmit,
  onCancel,
}: {
  title?: string;
  fieldLabel?: string;
  submitLabel?: string;
  initialName?: string;
  isLoading?: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Name can't be empty.");
      return;
    }
    onSubmit(name.trim());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-prompt-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl"
      >
        <h2 id="name-prompt-dialog-title" className="mb-3 text-base font-semibold text-[var(--color-text)]">
          {title}
        </h2>
        <form onSubmit={handleSubmit}>
          <FormField
            label={fieldLabel}
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            error={error ?? undefined}
          />
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
