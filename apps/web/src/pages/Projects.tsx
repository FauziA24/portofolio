import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import type { CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import Reveal from "../components/Reveal";
import { useProjects } from "../features/projects/useProjects";
import TiltCard from "../components/TiltCard";

const PAGE_SIZE = 6;
type ProjectItem = ReturnType<typeof useProjects>["projects"][number];

function ProjectTitle({ title }: { title: string }) {
  return (
    <h2 className="project-title-roll" aria-label={title}>
      {[...title].map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className="project-title-letter"
          style={{ "--letter-delay": `${index * 0.018}s` } as CSSProperties}
        >
          <span>{letter === " " ? "\u00a0" : letter}</span>
          <span aria-hidden="true">{letter === " " ? "\u00a0" : letter}</span>
        </span>
      ))}
    </h2>
  );
}

function ProjectTile({
  project,
  index,
}: {
  project: ProjectItem;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const wave = [34, -26, 18, -36, 28, -18][index % 6];
  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [0, 0, 0] : [wave, -wave * 0.35, -wave],
  );
  const rotateZ = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [wave * 0.035, -wave * 0.035],
  );

  return (
    <motion.div ref={ref} className="project-wave" style={{ y, rotateZ }}>
      <Reveal delay={Math.min(index, 5) as 0 | 1 | 2 | 3 | 4 | 5}>
        <TiltCard>
          <Link to={`/projects/${project.slug}`} className="project-card">
            <div className="project-card-media">
              {project.coverImageUrl ? (
                <img src={project.coverImageUrl} alt="" loading="lazy" />
              ) : (
                <>
                  <span>{project.num}</span>
                  <i aria-hidden="true" />
                </>
              )}
            </div>
            <div className="project-card-meta">
              <div>
                <span className="mono-label">
                  {project.category} · {project.year}
                </span>
                <ProjectTitle title={project.title} />
              </div>
              <span aria-hidden="true" className="project-card-arrow">
                ↗
              </span>
            </div>
          </Link>
        </TiltCard>
      </Reveal>
    </motion.div>
  );
}

export default function Projects() {
  const { projects, loading, error } = useProjects();
  const reduced = useReducedMotion();
  const [page, setPage] = useState(0);
  const pages = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(projects.length / PAGE_SIZE) },
        (_, index) =>
          projects.slice(index * PAGE_SIZE, index * PAGE_SIZE + PAGE_SIZE),
      ),
    [projects],
  );
  const currentProjects = pages[page] ?? [];
  const lastPage = Math.max(pages.length - 1, 0);
  const goToPage = (nextPage: number) =>
    setPage(Math.min(Math.max(nextPage, 0), lastPage));

  return (
    <main className="projects-page">
      <div className="projects-heading">
        <Link to="/" className="mono-label back-link">
          ← Home
        </Link>
        <p className="mono-label">01 / Archive</p>
        <h1>
          All selected <em>work.</em>
        </h1>
        <p>
          Projects, experiments, and systems built across web development,
          backend engineering, AI, and research.
        </p>
      </div>
      {loading && (
        <p className="mono-label" role="status">
          Loading projects…
        </p>
      )}
      {error && (
        <p className="mono-label" role="alert">
          Projects could not be loaded. Please try again later.
        </p>
      )}
      {!loading && !error && (
        <>
          <div className="project-section-status mono-label">
            Section {String(page * PAGE_SIZE + 1).padStart(2, "0")} -{" "}
            {String(Math.min((page + 1) * PAGE_SIZE, projects.length)).padStart(
              2,
              "0",
            )}{" "}
            / {String(projects.length).padStart(2, "0")}
          </div>
          <div className="project-slider">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                className="project-grid"
                initial={reduced ? false : { opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -80 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {currentProjects.map((project, index) => (
                  <ProjectTile
                    key={project.id}
                    project={project}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
          {currentProjects.length > 0 && (
            <div className="project-pager" aria-label="Project sections">
              <button
                type="button"
                className="project-pager-button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
              >
                Prev
              </button>
              <div className="project-pager-dots">
                {pages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={index === page ? "active" : ""}
                    aria-label={`Show projects ${index * PAGE_SIZE + 1} to ${Math.min((index + 1) * PAGE_SIZE, projects.length)}`}
                    aria-current={index === page ? "page" : undefined}
                    onClick={() => goToPage(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="project-pager-button"
                onClick={() => goToPage(page + 1)}
                disabled={page === lastPage}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
