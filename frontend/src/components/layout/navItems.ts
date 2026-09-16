import {
  LayoutDashboard,
  FolderClosed,
  Image,
  Video,
  FileText,
  Star,
  Clock,
  Share2,
  Trash2,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const primaryNavItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Files", path: "/files", icon: FolderClosed },
  { label: "Photos", path: "/photos", icon: Image },
  { label: "Videos", path: "/videos", icon: Video },
  { label: "Documents", path: "/documents", icon: FileText },
  { label: "Favorites", path: "/favorites", icon: Star },
  { label: "Recent", path: "/recent", icon: Clock },
  { label: "Shared", path: "/shared", icon: Share2 },
  { label: "Trash", path: "/trash", icon: Trash2 },
];

export const secondaryNavItems: NavItem[] = [{ label: "Settings", path: "/settings", icon: Settings }];
