import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, Eye, Plus, Trash2 } from "lucide-react";
import { Field } from "../components/Field";
import { SaveBadge } from "../components/SaveBadge";
import { moveOrdered, withSave } from "../helpers";
import { api, fileToBase64 } from "../../../lib/api";
import type { MediaAsset, Project, ProjectMedia } from "../../../types";
import type { SaveState } from "../types";
import {
  blankProject,
  fieldLabel,
  projectToForm,
  toProjectPayload,
  type ProjectForm,
} from "../forms";

export function ProjectEditor({
  projects,
  onReload,
}: {
  projects: Project[];
  onReload: () => Promise<void>;
}) {
  const [activeId, setActiveId] = useState(projects[0]?.id ?? "");
  const [form, setForm] = useState<ProjectForm>(() =>
    projects[0] ? projectToForm(projects[0]) : blankProject,
  );
  const [tab, setTab] = useState<
    "info" | "content" | "media" | "links" | "seo"
  >("info");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [media, setMedia] = useState<ProjectMedia[]>([]);
  const [mediaDraft, setMediaDraft] = useState({
    mediaAssetId: "",
    url: "",
    altText: "",
    caption: "",
    kind: "IMAGE",
    isHighlighted: "false",
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const active = projects.find((project) => project.id === activeId);

  useEffect(() => {
    if (!activeId && projects[0]) {
      setActiveId(projects[0].id);
      setForm(projectToForm(projects[0]));
    }
  }, [activeId, projects]);

  useEffect(() => {
    api
      .adminMedia()
      .then(setAssets)
      .catch(() => setAssets([]));
  }, []);

  useEffect(() => {
    if (!activeId) return setMedia([]);
    api
      .adminProjectMedia(activeId)
      .then(setMedia)
      .catch(() => setMedia([]));
  }, [activeId]);

  function choose(project: Project) {
    setActiveId(project.id);
    setForm(projectToForm(project));
    setTab("info");
  }

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadProjectImage(file?: File) {
    if (!file || !activeId) return;
    const asset = await api.uploadMedia({
      fileName: file.name,
      mimeType: file.type,
      dataBase64: await fileToBase64(file),
      scope: "projects",
      projectId: activeId,
    });
    setAssets((current) => [asset, ...current]);
    setMediaDraft((current) => ({
      ...current,
      mediaAssetId: asset.id,
      url: "",
      altText: current.altText || active?.title || file.name,
    }));
  }

  async function addProjectMedia() {
    if (!activeId) return;
    const row = await api.createProjectMedia(activeId, {
      mediaAssetId: mediaDraft.mediaAssetId || null,
      url: mediaDraft.mediaAssetId ? null : mediaDraft.url,
      altText: mediaDraft.altText,
      caption: mediaDraft.caption || null,
      kind: mediaDraft.kind as ProjectMedia["kind"],
      sortOrder: media.length,
      isHighlighted: mediaDraft.isHighlighted === "true",
    });
    setMedia((current) => [...current, row]);
    setMediaDraft({
      mediaAssetId: "",
      url: "",
      altText: "",
      caption: "",
      kind: "IMAGE",
      isHighlighted: "false",
    });
  }

  async function saveMedia(row: ProjectMedia) {
    setMedia((current) =>
      current.map((item) => (item.id === row.id ? row : item)),
    );
    await api.saveProjectMedia(row);
  }

  async function removeMedia(row: ProjectMedia) {
    await api.deleteProjectMedia(row.projectId, row.id);
    setMedia((current) => current.filter((item) => item.id !== row.id));
  }

  async function moveMedia(index: number, direction: -1 | 1) {
    const ordered = moveOrdered(media, index, direction, 0);
    if (!ordered) return;
    setMedia(ordered);
    await api.reorderProjectMedia(
      activeId,
      ordered.map(({ id, sortOrder }) => ({ id, sortOrder })),
    );
  }

  async function save(event?: React.FormEvent) {
    event?.preventDefault();
    await withSave(setSaveState, async () => {
      const saved = await api.saveProject(toProjectPayload(form));
      setActiveId(saved.id);
      setForm(projectToForm(saved));
      await onReload();
    });
  }

  async function remove() {
    if (!form.id || !confirm(`Delete ${form.title || "this project"}?`)) return;
    await api.deleteProject(form.id);
    setActiveId("");
    setForm(blankProject);
    await onReload();
  }

  return (
    <div className="cms-editor">
      <aside className="cms-projects">
        <div className="cms-projects-head">
          <span>Projects</span>
          <button
            onClick={() => {
              setActiveId("");
              setForm(blankProject);
            }}
            title="New project"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="cms-project-list">
          {projects.map((project) => (
            <button
              key={project.id}
              className={project.id === activeId ? "active" : ""}
              onClick={() => choose(project)}
            >
              <strong>{project.title}</strong>
              <span>
                {project.status} · {project.category}
              </span>
            </button>
          ))}
        </div>
      </aside>
      <form className="cms-project-form" onSubmit={save}>
        <div className="cms-editor-head">
          <div>
            <p className="cms-kicker">
              {form.id ? "Edit project" : "New project"}
            </p>
            <h1>{form.title || "Untitled project"}</h1>
          </div>
          <div className="cms-actions">
            <SaveBadge state={saveState} />
            {active?.slug && (
              <a
                className="cms-button"
                href={`/projects/${active.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <Eye size={16} /> Preview
              </a>
            )}
            {form.id && (
              <button
                className="cms-button danger"
                type="button"
                onClick={remove}
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button className="cms-button primary">
              <Check size={16} /> Save
            </button>
          </div>
        </div>
        <div className="cms-tabs">
          {(["info", "content", "media", "links", "seo"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                className={tab === item ? "active" : ""}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <div className="cms-form-grid">
          {tab === "info" && (
            <>
              {[
                "title",
                "slug",
                "category",
                "role",
                "teamNote",
                "featuredRank",
                "sortOrder",
              ].map((key) => (
                <Field key={key} label={fieldLabel(key)}>
                  <input
                    value={form[key] ?? ""}
                    onChange={(event) => update(key, event.target.value)}
                    required={["title", "slug", "category", "role"].includes(
                      key,
                    )}
                  />
                </Field>
              ))}
              <Field label="Start date">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => update("startDate", event.target.value)}
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => update("endDate", event.target.value)}
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(event) => update("status", event.target.value)}
                >
                  <option>DRAFT</option>
                  <option>PUBLISHED</option>
                  <option>ARCHIVED</option>
                </select>
              </Field>
              <Field label="Demo status">
                <select
                  value={form.demoStatus}
                  onChange={(event) => update("demoStatus", event.target.value)}
                >
                  <option>LIVE</option>
                  <option>COMING_SOON</option>
                  <option>PRIVATE</option>
                  <option>ARCHIVED</option>
                </select>
              </Field>
              <Field label="Technologies" wide>
                <input
                  value={form.technologies}
                  onChange={(event) =>
                    update("technologies", event.target.value)
                  }
                  placeholder="React, Fastify, PostgreSQL"
                />
              </Field>
            </>
          )}
          {tab === "content" && (
            <>
              {[
                "summary",
                "overview",
                "challenge",
                "contribution",
                "solution",
              ].map((key) => (
                <Field key={key} label={fieldLabel(key)} wide>
                  <textarea
                    value={form[key] ?? ""}
                    onChange={(event) => update(key, event.target.value)}
                    rows={key === "summary" ? 3 : 6}
                    required={key !== "overview"}
                  />
                </Field>
              ))}
            </>
          )}
          {tab === "media" && (
            <>
              <Field label="Cover image URL" wide>
                <input
                  type="url"
                  value={form.coverImageUrl}
                  onChange={(event) =>
                    update("coverImageUrl", event.target.value)
                  }
                  placeholder="https://..."
                />
              </Field>
              <div className="cms-preview wide">
                {form.coverImageUrl ? (
                  <img src={form.coverImageUrl} alt="" />
                ) : (
                  <span>No image selected</span>
                )}
              </div>
              <Field label="Highlight image URL" wide>
                <input
                  type="url"
                  value={form.highlightImageUrl}
                  onChange={(event) =>
                    update("highlightImageUrl", event.target.value)
                  }
                  placeholder="https://..."
                />
              </Field>
              <Field label="Highlight image alt" wide>
                <input
                  value={form.highlightImageAlt}
                  onChange={(event) =>
                    update("highlightImageAlt", event.target.value)
                  }
                />
              </Field>
              <section className="cms-card cms-panel wide">
                <div className="cms-section-title">
                  <h2>Gallery</h2>
                  <span>{media.length} items</span>
                </div>
                {activeId && (
                  <div className="cms-form-grid">
                    <Field label="Upload image">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) =>
                          uploadProjectImage(event.target.files?.[0]).catch(
                            console.error,
                          )
                        }
                      />
                    </Field>
                    <Field label="Existing asset">
                      <select
                        value={mediaDraft.mediaAssetId}
                        onChange={(event) =>
                          setMediaDraft((current) => ({
                            ...current,
                            mediaAssetId: event.target.value,
                            url: "",
                          }))
                        }
                      >
                        <option value="">Use URL</option>
                        {assets.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.originalName}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="External URL" wide>
                      <input
                        type="url"
                        value={mediaDraft.url}
                        onChange={(event) =>
                          setMediaDraft((current) => ({
                            ...current,
                            url: event.target.value,
                          }))
                        }
                        disabled={!!mediaDraft.mediaAssetId}
                      />
                    </Field>
                    <Field label="Alt text">
                      <input
                        value={mediaDraft.altText}
                        onChange={(event) =>
                          setMediaDraft((current) => ({
                            ...current,
                            altText: event.target.value,
                          }))
                        }
                        required
                      />
                    </Field>
                    <Field label="Caption">
                      <input
                        value={mediaDraft.caption}
                        onChange={(event) =>
                          setMediaDraft((current) => ({
                            ...current,
                            caption: event.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="Kind">
                      <select
                        value={mediaDraft.kind}
                        onChange={(event) =>
                          setMediaDraft((current) => ({
                            ...current,
                            kind: event.target.value,
                          }))
                        }
                      >
                        <option>IMAGE</option>
                        <option>VIDEO</option>
                        <option>MOCKUP</option>
                        <option>SCREENSHOT</option>
                      </select>
                    </Field>
                    <Field label="Highlight">
                      <select
                        value={mediaDraft.isHighlighted}
                        onChange={(event) =>
                          setMediaDraft((current) => ({
                            ...current,
                            isHighlighted: event.target.value,
                          }))
                        }
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </Field>
                    <div className="cms-actions">
                      <button
                        className="cms-button primary"
                        type="button"
                        onClick={() => addProjectMedia()}
                      >
                        <Plus size={16} /> Add media
                      </button>
                    </div>
                  </div>
                )}
                <div className="cms-list cms-media-list">
                  {media.map((item, index) => (
                    <div key={item.id} className="cms-media-row">
                      <img
                        src={item.mediaAsset?.publicUrl || item.url || ""}
                        alt=""
                      />
                      <input
                        value={item.altText}
                        onChange={(event) =>
                          setMedia((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? { ...row, altText: event.target.value }
                                : row,
                            ),
                          )
                        }
                        aria-label="Alt text"
                      />
                      <input
                        value={item.caption ?? ""}
                        onChange={(event) =>
                          setMedia((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? { ...row, caption: event.target.value }
                                : row,
                            ),
                          )
                        }
                        aria-label="Caption"
                      />
                      <button
                        className="cms-button"
                        type="button"
                        onClick={() => moveMedia(index, -1)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        className="cms-button"
                        type="button"
                        onClick={() => moveMedia(index, 1)}
                        disabled={index === media.length - 1}
                        title="Move down"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        className="cms-button"
                        type="button"
                        onClick={() => saveMedia(item)}
                      >
                        <Check size={16} /> Save
                      </button>
                      <button
                        className="cms-button danger"
                        type="button"
                        onClick={() => removeMedia(item)}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          {tab === "links" && (
            <>
              <Field label="Demo URL" wide>
                <input
                  type="url"
                  value={form.demoUrl}
                  onChange={(event) => update("demoUrl", event.target.value)}
                  placeholder="https://..."
                />
              </Field>
              <Field label="GitHub URL" wide>
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={(event) => update("githubUrl", event.target.value)}
                  placeholder="https://github.com/..."
                />
              </Field>
            </>
          )}
          {tab === "seo" && (
            <>
              <Field label="SEO title" wide>
                <input
                  value={form.seoTitle}
                  onChange={(event) => update("seoTitle", event.target.value)}
                />
              </Field>
              <Field label="SEO description" wide>
                <textarea
                  value={form.seoDescription}
                  onChange={(event) =>
                    update("seoDescription", event.target.value)
                  }
                  rows={4}
                />
              </Field>
              <Field label="SEO image URL" wide>
                <input
                  type="url"
                  value={form.seoImageUrl}
                  onChange={(event) =>
                    update("seoImageUrl", event.target.value)
                  }
                  placeholder="https://..."
                />
              </Field>
              <Field label="Canonical URL" wide>
                <input
                  type="url"
                  value={form.canonicalUrl}
                  onChange={(event) =>
                    update("canonicalUrl", event.target.value)
                  }
                  placeholder="https://..."
                />
              </Field>
              <Field label="Indexed">
                <select
                  value={form.isIndexed}
                  onChange={(event) => update("isIndexed", event.target.value)}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </Field>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
