import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { SaveBadge } from "../components/SaveBadge";
import { withSave } from "../helpers";
import { api } from "../../../lib/api";
import type { Project } from "../../../types";
import type { SaveState } from "../types";

export function SelectedWorkEditor({
  projects,
  onReload,
}: {
  projects: Project[];
  onReload: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>(() =>
    projects
      .filter((project) => project.featuredRank)
      .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0))
      .slice(0, 5)
      .map((project) => project.id),
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    setSelected(
      projects
        .filter((project) => project.featuredRank)
        .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0))
        .slice(0, 5)
        .map((project) => project.id),
    );
  }, [projects]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 5
          ? [...current, id]
          : current,
    );
  }

  function move(index: number, direction: -1 | 1) {
    setSelected((current) => {
      const next = [...current];
      const target = index + direction;
      if (!next[index] || !next[target]) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    await withSave(setSaveState, async () => {
      await api.saveFeaturedProjects(
        selected.map((id, index) => ({ id, featuredRank: index + 1 })),
      );
      await onReload();
    });
  }

  const selectedProjects = selected
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is Project => Boolean(project));

  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <p className="cms-kicker">Homepage</p>
          <h1>Selected Work</h1>
        </div>
        <div className="cms-actions">
          <SaveBadge state={saveState} />
          <button className="cms-button primary" onClick={save}>
            <Check size={16} /> Save order
          </button>
        </div>
      </div>
      <section className="cms-card cms-panel">
        <div className="cms-section-title">
          <h2>Current selection</h2>
          <span>{selected.length}/5 selected</span>
        </div>
        <div className="cms-list">
          {selectedProjects.map((project, index) => (
            <div key={project.id} className="cms-selected-row">
              <strong>
                {index + 1}. {project.title}
              </strong>
              <span>
                {project.category} · {project.status}
              </span>
              <button
                className="cms-button"
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                title="Move up"
              >
                <ArrowUp size={16} />
              </button>
              <button
                className="cms-button"
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === selectedProjects.length - 1}
                title="Move down"
              >
                <ArrowDown size={16} />
              </button>
            </div>
          ))}
          {!selectedProjects.length && (
            <p className="cms-muted">No selected work yet.</p>
          )}
        </div>
      </section>
      <section className="cms-card cms-panel">
        <div className="cms-section-title">
          <h2>Project catalog</h2>
          <span>Published projects show publicly</span>
        </div>
        <div className="cms-list">
          {projects.map((project) => {
            const checked = selected.includes(project.id);
            const disabled = !checked && selected.length >= 5;
            return (
              <div key={project.id} className="cms-selected-row">
                <label className="cms-check">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggle(project.id)}
                  />{" "}
                  <span>{project.title}</span>
                </label>
                <span>
                  {project.category} · {project.status} · {project.demoStatus}
                </span>
                {project.status !== "PUBLISHED" && (
                  <span className="cms-pill warn">Admin only</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
