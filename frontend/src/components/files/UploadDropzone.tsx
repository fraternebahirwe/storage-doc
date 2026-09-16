import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export function UploadDropzone({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onFilesSelected(Array.from(e.dataTransfer.files));
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        dragOver ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5" : "border-[var(--color-border)]"
      }`}
    >
      <UploadCloud size={24} className="mb-2 text-[var(--color-text-muted)]" />
      <p className="text-sm font-medium text-[var(--color-text)]">Drag and drop files here, or click to choose</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Images, videos, and documents up to 500 MB each.
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onFilesSelected(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}
