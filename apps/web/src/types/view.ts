import type { Project } from "./api";

export type ViewDemoStatus =
  | "available"
  | "coming-soon"
  | "private"
  | "archived";

export type ViewProject = Omit<Project, "demoStatus" | "overview"> & {
  num: string;
  year: string;
  team?: string | null;
  overview: string;
  tags: string[];
  github: string;
  demo: string;
  demoStatus: ViewDemoStatus;
  color: string;
};
