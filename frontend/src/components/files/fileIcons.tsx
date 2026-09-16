import { FileText, Image, Video, File as FileIcon, type LucideIcon } from "lucide-react";
import type { FileCategory } from "../../services/fileService";

export const categoryIcon: Record<FileCategory, LucideIcon> = {
  image: Image,
  video: Video,
  document: FileText,
  other: FileIcon,
};
