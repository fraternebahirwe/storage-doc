import { useEffect, useState } from "react";

export type ViewMode = "grid" | "list";

const STORAGE_KEY = "storage-doc:view-mode";

function readStoredPreference(): ViewMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

export function useViewPreference() {
  const [view, setView] = useState<ViewMode>(readStoredPreference);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, view);
    } catch {
      // per-viewer convenience only; fine to no-op if storage is unavailable
    }
  }, [view]);

  return [view, setView] as const;
}
