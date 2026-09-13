import type { ComponentType } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Contact,
  FolderKanban,
  Home,
  Search,
  Settings,
  Star,
  User,
} from "lucide-react";
import type { AdminPage } from "./types";

export const pages: {
  id: AdminPage;
  label: string;
  icon: ComponentType<{ size?: number }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "profile", label: "Profile & Homepage", icon: Home },
  { id: "selected-work", label: "Selected Work", icon: Star },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "about", label: "About", icon: User },
  { id: "research", label: "Research & Credentials", icon: BriefcaseBusiness },
  { id: "contact", label: "Contact", icon: Contact },
  { id: "seo", label: "SEO", icon: Search },
  { id: "settings", label: "Settings", icon: Settings },
];

export const labels = Object.fromEntries(
  pages.map((page) => [page.id, page.label]),
) as Record<AdminPage, string>;
