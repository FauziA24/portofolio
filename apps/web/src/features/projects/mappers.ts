import type { Project } from "../../types/api";
import type { ViewDemoStatus, ViewProject } from "../../types/view";

export function toViewProject(project: Project, index: number): ViewProject {
  const year = (value?: string | null) =>
    value ? new Date(value).getUTCFullYear().toString() : "";
  const start = year(project.startDate);
  const end = year(project.endDate);
  const safe = (value?: string | null) =>
    value && /^https?:\/\//i.test(value) ? value : "";
  const demoStatus: ViewDemoStatus =
    project.demoStatus === "LIVE" && safe(project.demoUrl)
      ? "available"
      : project.demoStatus === "PRIVATE"
        ? "private"
        : project.demoStatus === "ARCHIVED"
          ? "archived"
          : "coming-soon";

  return {
    ...project,
    num: String(index + 1).padStart(2, "0"),
    year:
      start && end && start !== end ? `${start} - ${end}` : start || end || "-",
    team: project.teamNote,
    overview: project.summary,
    tags: project.technologies.map(({ technology }) => technology.name),
    github: safe(project.githubUrl),
    demo: safe(project.demoUrl),
    demoStatus,
    color: "var(--surface)",
  };
}
