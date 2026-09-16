import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { DashboardSummary, Project } from "../../../types";

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <article className="cms-card cms-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </article>
  );
}

export function Dashboard({ projects }: { projects: Project[] }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  useEffect(() => {
    api.adminDashboard().then(setSummary).catch(() => setSummary(null));
  }, []);
  const published = projects.filter(
    (project) => project.status === "PUBLISHED",
  ).length;
  const drafts = projects.filter(
    (project) => project.status === "DRAFT",
  ).length;
  const live = projects.filter(
    (project) => project.demoStatus === "LIVE",
  ).length;
  const recent = [...projects]
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 5);

  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <p className="cms-kicker">Overview</p>
          <h1>Analytics Dashboard</h1>
        </div>
        <span className="cms-pill warn">Analytics not connected</span>
      </div>
      <div className="cms-stats">
        {([
          ["Website visitors", "visitors"],
          ["Performance", "performance"],
          ["Organic traffic", "organicTraffic"],
          ["Backlinks", "backlinks"],
        ] as const).map(([label, key]) => {
          const metric = summary?.metrics[key];
          return (
            <StatCard
              key={key}
              label={label}
              value={metric?.value == null ? "Unavailable" : String(metric.value)}
              helper={metric?.message ?? "Loading metric status"}
            />
          );
        })}
      </div>
      <div className="cms-stats">
        <StatCard
          label="Projects"
          value={String(projects.length)}
          helper="From API database"
        />
        <StatCard
          label="Published"
          value={String(published)}
          helper="Visible on public site"
        />
        <StatCard label="Drafts" value={String(drafts)} helper="Admin only" />
        <StatCard
          label="Live demos"
          value={String(live)}
          helper="Demo status LIVE"
        />
      </div>
      <section className="cms-card cms-panel">
        <div className="cms-section-title">
          <h2>Recent projects</h2>
          <span>Real content</span>
        </div>
        <div className="cms-list compact">
          {recent.length ? (
            recent.map((project) => (
              <div key={project.id}>
                <strong>{project.title}</strong>
                <span>
                  {project.category} · {project.status}
                </span>
              </div>
            ))
          ) : (
            <p className="cms-muted">No projects yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
