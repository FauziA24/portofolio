import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProjects } from "../features/projects/useProjects";
import type { ViewDemoStatus as DemoStatus } from "../features/projects/useProjects";
import Reveal from "../components/Reveal";
import { api } from "../lib/api";
import type { ProjectMedia } from "../types";

function DemoButton({ status, href }: { status: DemoStatus; href: string }) {
  if (status === "available" && /^https?:\/\//.test(href)) {
    return (
      <a
        href={href}
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
      title={status === "coming-soon" ? "Demo coming soon" : "Private project"}
    >
      {status === "archived"
        ? "Archived"
        : status === "coming-soon"
          ? "Coming Soon"
          : "Private"}{" "}
      · {status === "coming-soon" ? "Not yet deployed" : "Internal use"}
    </span>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { projects, loading, error } = useProjects();
  const [gallery, setGallery] = useState<ProjectMedia[]>([]);
  const project = projects.find((p) => p.slug === slug);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    api
      .projectMedia(slug)
      .then((items) => {
        if (active) setGallery(items);
      })
      .catch(() => {
        if (active) setGallery([]);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading)
    return (
      <main className="pt-32 px-6" role="status">
        Loading project…
      </main>
    );
  if (error)
    return (
      <main className="pt-32 px-6" role="alert">
        Unable to load project. <Link to="/">Back home</Link>
      </main>
    );
  if (!project)
    return (
      <main className="pt-32 px-6">
        <h1>Project not found</h1>
        <Link to="/#work">Back to work</Link>
      </main>
    );

  const currentIdx = projects.findIndex((p) => p.slug === slug);
  const nextProject = projects[(currentIdx + 1) % projects.length];

  const sections: { heading: string; content: string }[] = [
    { heading: "Overview", content: project.overview },
    { heading: "Challenge", content: project.challenge },
    { heading: "Contribution", content: project.contribution },
    { heading: "Solution", content: project.solution },
  ];

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* ── Project hero ──────────────────────────────────────────── */}
      <section
        className="pt-[96px] pb-16 md:pb-20 px-6 md:px-10 lg:px-16 max-w-[1440px] mx-auto border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <Reveal>
          <Link
            to="/#work"
            className="ul-link mono-label inline-flex items-center gap-1.5 mb-10"
            style={{ color: "var(--muted-foreground)" }}
          >
            ← Back to work
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 lg:gap-20 items-start">
          <div>
            <Reveal>
              <p
                className="mono-label mb-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                {project.num} · {project.category}
              </p>
              <h1
                className="text-[clamp(32px,5.5vw,72px)] font-bold leading-[1.04]"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.03em",
                }}
              >
                {project.title}
              </h1>
            </Reveal>

            <Reveal delay={1} className="mt-6">
              <p
                className="text-base leading-relaxed max-w-[520px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {project.overview}
              </p>
            </Reveal>
          </div>

          <Reveal delay={2} className="flex flex-col gap-5">
            <div className="flex flex-col gap-0">
              {[
                { label: "Year", value: project.year },
                { label: "Role", value: project.role },
                ...(project.team
                  ? [{ label: "Organisation", value: project.team }]
                  : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-0.5 py-4 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="mono-label"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {label}
                  </span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Primary: demo button; Secondary: GitHub as quiet text */}
            <div className="flex flex-col gap-3 pt-2">
              <DemoButton status={project.demoStatus} href={project.demo} />
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ul-link mono-label self-start"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  View GitHub ↗
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Case study content ───────────────────────────────────── */}
      <article className="max-w-[720px] mx-auto px-6 md:px-10 py-20 md:py-28 flex flex-col gap-14">
        {sections.map((s, i) => (
          <Reveal key={s.heading} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
            <div className="flex flex-col gap-4">
              <h2
                className="text-[11px] font-medium tracking-[0.14em] uppercase"
                style={{
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {s.heading}
              </h2>
              <p className="text-[17px] leading-[1.72]">{s.content}</p>
            </div>
          </Reveal>
        ))}

        {/* Tech stack */}
        <Reveal delay={1}>
          <div className="flex flex-col gap-4">
            <h2
              className="text-[11px] font-medium tracking-[0.14em] uppercase"
              style={{
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Selected Technologies
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="mono-label px-3 py-1.5 rounded-full border"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {t}
                </span>
              ))}
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
                  ? [
                      {
                        id: "cover",
                        url: project.coverImageUrl,
                        altText: project.title,
                      },
                    ]
                  : []
              ).map((item, index) =>
                item.url ? (
                  <img
                    key={item.id}
                    src={item.url}
                    alt={
                      item.altText || `${project.title} gallery ${index + 1}`
                    }
                    loading="lazy"
                  />
                ) : null,
              )}
            </div>
          </div>
        </Reveal>
      </article>

      {/* ── Next project ─────────────────────────────────────────── */}
      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        <Link
          to={`/projects/${nextProject.slug}`}
          className="group max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 flex items-center justify-between gap-6 transition-colors duration-200"
          style={{ display: "flex" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "color-mix(in srgb, var(--foreground) 3%, transparent)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "transparent")
          }
        >
          <div className="flex flex-col gap-1">
            <span
              className="mono-label"
              style={{ color: "var(--muted-foreground)" }}
            >
              Next project
            </span>
            <span
              className="text-xl md:text-2xl font-semibold"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              {nextProject.title}
            </span>
          </div>
          <span
            className="text-2xl transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            ↗
          </span>
        </Link>
      </div>
    </main>
  );
}
