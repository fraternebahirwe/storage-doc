"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FileRecord = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-neutral-400">
      <path
        d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FilePreview({ file }: { file: FileRecord }) {
  const src = `/api/files/${file.id}`;

  if (file.mimeType.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={file.originalName} className="h-full w-full object-cover" loading="lazy" />
    );
  }

  if (file.mimeType.startsWith("video/")) {
    return <video src={src} className="h-full w-full object-cover" muted preload="metadata" />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <FileIcon />
    </div>
  );
}

export function FileManager() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    const response = await fetch("/api/files");
    if (response.ok) {
      const data = await response.json();
      setFiles(data.files);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching the initial file list on mount is intentional
    void loadFiles();
  }, [loadFiles]);

  async function uploadFiles(fileList: FileList | File[]) {
    const list = Array.from(fileList);
    if (list.length === 0) return;

    setError(null);
    setUploading(true);

    const formData = new FormData();
    for (const file of list) formData.append("files", file);

    const response = await fetch("/api/files", { method: "POST", body: formData });

    setUploading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Upload failed.");
      return;
    }

    await loadFiles();
  }

  async function deleteFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    const response = await fetch(`/api/files/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete file.");
      await loadFiles();
    }
  }

  return (
    <div className="flex-1 px-6 py-6">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          uploadFiles(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver ? "border-neutral-900 bg-neutral-50" : "border-neutral-300"
        }`}
      >
        <p className="text-sm font-medium text-neutral-900">
          {uploading ? "Uploading…" : "Drag and drop files here, or click to choose"}
        </p>
        <p className="mt-1 text-xs text-neutral-500">Pictures, videos, documents — anything.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) uploadFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-8 text-sm text-neutral-500">Loading…</p>
      ) : files.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">No files yet. Upload something to get started.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((file) => (
            <div
              key={file.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200"
            >
              <a
                href={`/api/files/${file.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex aspect-square items-center justify-center bg-neutral-100"
              >
                <FilePreview file={file} />
              </a>
              <div className="flex flex-1 flex-col gap-1 px-3 py-2">
                <p className="truncate text-sm font-medium text-neutral-900" title={file.originalName}>
                  {file.originalName}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatBytes(file.size)} · {formatDate(file.createdAt)}
                </p>
                <div className="mt-1 flex gap-3 text-xs">
                  <a
                    href={`/api/files/${file.id}?download=1`}
                    className="font-medium text-neutral-700 underline hover:text-neutral-900"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="font-medium text-red-600 underline hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
