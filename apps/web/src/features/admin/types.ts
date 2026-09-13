export type AdminPage =
  | "dashboard"
  | "profile"
  | "selected-work"
  | "projects"
  | "about"
  | "research"
  | "contact"
  | "seo"
  | "settings";

export type SaveState = "idle" | "saving" | "saved" | "error";
