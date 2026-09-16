import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProjectDetailView } from "../features/projects/ProjectDetailView";
import { useProjects } from "../features/projects/useProjects";
import { api } from "../lib/api";
import type { ProjectMedia } from "../types";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { projects, loading, error } = useProjects();
  const [gallery, setGallery] = useState<ProjectMedia[]>([]);
  const project = projects.find((item) => item.slug === slug);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    api.projectMedia(slug)
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

  if (loading) return <main className="pt-32 px-6" role="status">Loading project…</main>;
  if (error) return <main className="pt-32 px-6" role="alert">Unable to load project. <Link to="/">Back home</Link></main>;
  if (!project) return <main className="pt-32 px-6"><h1>Project not found</h1><Link to="/#work">Back to work</Link></main>;

  const currentIndex = projects.findIndex((item) => item.slug === slug);
  const nextProject = projects.length > 1 ? projects[(currentIndex + 1) % projects.length] : undefined;
  return <ProjectDetailView project={project} gallery={gallery} nextProject={nextProject} />;
}
