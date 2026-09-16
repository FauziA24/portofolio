import { Link } from "react-router-dom";
import Reveal from "../../components/Reveal";
import type { ProjectMedia, ViewProject } from "../../types";
import { defaultMediaTransform, mediaFrameStyle, mediaImageStyle } from "../../lib/media";

const mediaUrl = (item: Pick<ProjectMedia, "mediaAsset" | "url">) =>
  item.mediaAsset?.publicUrl || item.url || "";

function DemoButton({ project }: { project: ViewProject }) {
  if (project.demoStatus === "available" && /^https?:\/\//.test(project.demo)) {
    return (
      <a
        href={project.demo}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm font-display magnetic"
        style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
      >
        Live Demo ↗
      </a>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm font-display border opacity-60 cursor-not-allowed select-none"
      style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
      aria-disabled="true"
      title={project.demoStatus === "coming-soon" ? "Demo coming soon" : "Private project"}
    >
      {project.demoStatus === "archived"
        ? "Archived"
        : project.demoStatus === "coming-soon"
          ? "Coming Soon"
          : "Private"}{" "}
      · {project.demoStatus === "coming-soon" ? "Not yet deployed" : "Internal use"}
    </span>
  );
}

export function ProjectDetailView({
  project,
  gallery,
  nextProject,
  previewLabel,
  onBack,
}: {
  project: ViewProject;
  gallery: ProjectMedia[];
  nextProject?: ViewProject;
  previewLabel?: string;
  onBack?: () => void;
}) {
  const sections = [
    { heading: "Overview", content: project.overview },
    { heading: "Challenge", content: project.challenge },
    { heading: "Contribution", content: project.contribution },
    { heading: "Solution", content: project.solution },
  ];
  const backClass = "ul-link mono-label inline-flex items-center gap-1.5 mb-10";

  return (
    <main className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <section
        className="pt-[96px] pb-16 md:pb-20 px-6 md:px-10 lg:px-16 max-w-[1440px] mx-auto border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <Reveal>
          {onBack ? (
            <button
              type="button"
              className={backClass}
              style={{ color: "var(--muted-foreground)" }}
              onClick={onBack}
            >
              ← Back to CMS
            </button>
          ) : (
            <Link to="/#work" className={backClass} style={{ color: "var(--muted-foreground)" }}>
              ← Back to work
            </Link>
          )}
          {previewLabel && <p className="cms-pill warn mb-5">{previewLabel}</p>}
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 lg:gap-20 items-start">
          <div>
            <Reveal>
              <p className="mono-label mb-3" style={{ color: "var(--muted-foreground)" }}>
                {project.num} · {project.category || "Uncategorized"}
              </p>
              <h1
                className="text-[clamp(32px,5.5vw,72px)] font-bold leading-[1.04]"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                {project.title || "Untitled project"}
              </h1>
            </Reveal>
            <Reveal delay={1} className="mt-6">
              <p className="text-base leading-relaxed max-w-[520px]" style={{ color: "var(--muted-foreground)" }}>
                {project.overview || "No overview yet."}
              </p>
            </Reveal>
          </div>

          <Reveal delay={2} className="flex flex-col gap-5">
            <div className="flex flex-col gap-0">
              {[
                { label: "Year", value: project.year },
                { label: "Role", value: project.role || "-" },
                ...(project.team ? [{ label: "Organisation", value: project.team }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
                  <span className="mono-label" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <DemoButton project={project} />
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="ul-link mono-label self-start" style={{ color: "var(--muted-foreground)" }}>
                  View GitHub ↗
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <article className="max-w-[720px] mx-auto px-6 md:px-10 py-20 md:py-28 flex flex-col gap-14">
        {sections.map((section, index) => (
          <Reveal key={section.heading} delay={((index % 4) + 1) as 1 | 2 | 3 | 4}>
            <div className="flex flex-col gap-4">
              <h2 className="text-[11px] font-medium tracking-[0.14em] uppercase" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
                {section.heading}
              </h2>
              <p className="text-[17px] leading-[1.72]">{section.content || "Not added yet."}</p>
            </div>
          </Reveal>
        ))}

        <Reveal delay={1}>
          <div className="flex flex-col gap-4">
            <h2 className="text-[11px] font-medium tracking-[0.14em] uppercase" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
              Selected Technologies
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.length ? project.tags.map((tag) => (
                <span key={tag} className="mono-label px-3 py-1.5 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                  {tag}
                </span>
              )) : <span className="mono-label">No technologies yet.</span>}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="project-gallery">
            <h2 className="mono-label mb-4">Gallery</h2>
            <div className="gallery-grid">
              {(gallery.length
                ? gallery
                : project.coverImageUrl
                  ? [{ ...defaultMediaTransform, id: "cover", url: project.coverImageUrl, altText: project.title, caption: null }]
                  : []
              ).map((item, index) => mediaUrl(item) ? (
                <figure key={item.id} style={{ maxWidth: item.displayWidth ?? undefined }}>
                  <div className="media-frame" style={mediaFrameStyle(item)}>
                    <img
                      src={mediaUrl(item)}
                      alt={item.altText || `${project.title} gallery ${index + 1}`}
                      loading="lazy"
                      style={mediaImageStyle(item)}
                    />
                  </div>
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </figure>
              ) : null)}
            </div>
          </div>
        </Reveal>
      </article>

      {nextProject && (
        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          <Link
            to={`/projects/${nextProject.slug}`}
            className="group max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 flex items-center justify-between gap-6 transition-colors duration-200"
            style={{ display: "flex" }}
          >
            <div className="flex flex-col gap-1">
              <span className="mono-label" style={{ color: "var(--muted-foreground)" }}>Next project</span>
              <span className="text-xl md:text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                {nextProject.title}
              </span>
            </div>
            <span className="text-2xl transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" style={{ color: "var(--muted-foreground)" }}>↗</span>
          </Link>
        </div>
      )}
    </main>
  );
}
