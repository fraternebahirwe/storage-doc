export type FileCategory = "image" | "video" | "document" | "other";
export type SearchableCategory = Exclude<FileCategory, "other">;

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm"]);
const DOCUMENT_EXTENSIONS = new Set(["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"]);

export const ALLOWED_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...DOCUMENT_EXTENSIONS]);

const EXTENSIONS_BY_CATEGORY: Record<SearchableCategory, string[]> = {
  image: [...IMAGE_EXTENSIONS],
  video: [...VIDEO_EXTENSIONS],
  document: [...DOCUMENT_EXTENSIONS],
};

export function extensionsForCategory(category: SearchableCategory): string[] {
  return EXTENSIONS_BY_CATEGORY[category];
}

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}

export function categoryForExtension(extension: string): FileCategory {
  const ext = extension.toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (DOCUMENT_EXTENSIONS.has(ext)) return "document";
  return "other";
}

export function isAllowedExtension(extension: string): boolean {
  return ALLOWED_EXTENSIONS.has(extension.toLowerCase());
}
