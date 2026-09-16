import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function FormField({ label, error, id, type = "text", ...rest }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={isPassword && visible ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
