import type { Project } from "../../../types";

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
      <section className="cms-card cms-panel muted-panel">
        <h2>Traffic, SEO, backlinks, and Core Web Vitals</h2>
        <p>
          Desain dashboard sudah dimigrasikan sebagai area kerja, tetapi angka
          analytics belum ditampilkan sampai sumber data production dipilih di
          fase berikutnya.
        </p>
      </section>
    </div>
  );
}
