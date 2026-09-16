import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, Eye, Plus, Trash2 } from "lucide-react";
import { Field } from "../components/Field";
import { SaveBadge } from "../components/SaveBadge";
import { ProjectDetailView } from "../../projects/ProjectDetailView";
import { toViewProject } from "../../projects/mappers";
import { moveOrdered, withSave } from "../helpers";
import { api, fileToDataUrl } from "../../../lib/api";
import type { Project, ProjectMedia } from "../../../types";
import type { SaveState } from "../types";
import {
  blankProject,
  fieldLabel,
  projectFormToProject,
  projectToForm,
  toProjectPayload,
  type ProjectForm,
} from "../forms";

type PendingMedia = {
  id: string;
  file: File;
  previewUrl: string;
  status: "queued" | "uploading" | "failed";
  error?: string;
};

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
  const [media, setMedia] = useState<ProjectMedia[]>([]);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    if (!activeId && projects[0]) {
      setActiveId(projects[0].id);
      setForm(projectToForm(projects[0]));
    }
  }, [activeId, projects]);

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
    setPendingMedia([]);
  }

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadProjectImages(files?: FileList | null) {
    if (!files?.length || !activeId) return;
    const selected = await Promise.all(Array.from(files).map(async (file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: await fileToDataUrl(file),
      status: "queued" as const,
    })));
    setPendingMedia((current) => [...current, ...selected]);
    setUploadingMedia(true);
    for (const [index, pending] of selected.entries()) {
      setPendingMedia((current) => current.map((item) =>
        item.id === pending.id ? { ...item, status: "uploading" } : item,
      ));
      let assetId = "";
      try {
        const asset = await api.uploadMedia({
          fileName: pending.file.name,
          mimeType: pending.file.type,
          dataBase64: pending.previewUrl.split(",")[1] ?? "",
          scope: "projects",
          projectId: activeId,
        });
        assetId = asset.id;
        const row = await api.createProjectMedia(activeId, {
          mediaAssetId: asset.id,
          url: null,
          altText: form.title || pending.file.name,
          caption: null,
          kind: "IMAGE",
          sortOrder: media.length + index,
          isHighlighted: false,
        });
        setMedia((current) => [...current, { ...row, mediaAsset: asset }]);
        setPendingMedia((current) => current.filter((item) => item.id !== pending.id));
      } catch (error) {
        if (assetId) await api.deleteMedia(assetId).catch(() => null);
        setPendingMedia((current) => current.map((item) => item.id === pending.id
          ? { ...item, status: "failed", error: error instanceof Error ? error.message : "Upload failed" }
          : item,
        ));
      }
    }
    setUploadingMedia(false);
  }

  function useMediaAs(item: ProjectMedia, target: "cover" | "highlight" | "hover") {
    const url = item.mediaAsset?.publicUrl || item.url || "";
    if (target === "cover") return update("coverImageUrl", url);
    if (target === "highlight") {
      update("highlightImageUrl", url);
      update("highlightImageAlt", item.altText);
      return;
    }
    update("hoverPreviewImageUrl", url);
    update("hoverPreviewImageAlt", item.altText);
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

  async function persist(status?: Project["status"]) {
    await withSave(setSaveState, async () => {
      const saved = await api.saveProject(toProjectPayload(status ? { ...form, status } : form));
      setActiveId(saved.id);
      setForm(projectToForm(saved));
      await onReload();
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    await persist();
  }

  async function remove() {
    if (!form.id || !confirm(`Delete ${form.title || "this project"}?`)) return;
    await api.deleteProject(form.id);
    setActiveId("");
    setForm(blankProject);
    await onReload();
  }

  if (previewing) {
    return (
      <div className="cms-project-preview">
        <ProjectDetailView
          project={toViewProject(projectFormToProject(form), 0)}
          gallery={media}
          previewLabel={form.status === "PUBLISHED" ? "CMS Preview" : "Draft Preview"}
          onBack={() => setPreviewing(false)}
        />
      </div>
    );
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
              setMedia([]);
              setPendingMedia([]);
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
            <button className="cms-button" type="button" onClick={() => setPreviewing(true)}>
              <Eye size={16} /> Preview
            </button>
            {form.id && (
              <button
                className="cms-button danger"
                type="button"
                onClick={remove}
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button className="cms-button" type="button" onClick={() => persist("DRAFT")}>
              Save draft
            </button>
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
                    required={["title", "slug"].includes(key) ||
                      (form.status === "PUBLISHED" && ["category", "role"].includes(key))}
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
                    required={form.status === "PUBLISHED"}
                  />
                </Field>
              ))}
            </>
          )}
          {tab === "media" && (
            <>
              <div className="cms-media-roles wide">
                {[
                  ["Cover", form.coverImageUrl],
                  ["Highlight", form.highlightImageUrl],
                  ["Hover preview", form.hoverPreviewImageUrl],
                ].map(([label, url]) => (
                  <div className="cms-card" key={label}>
                    <span>{label}</span>
                    {url ? <img src={url} alt="" /> : <p>Not selected</p>}
                  </div>
                ))}
              </div>
              <section className="cms-card cms-panel wide">
                <div className="cms-section-title">
                  <h2>Gallery</h2>
                  <span>{media.length} items</span>
                </div>
                <Field label="Upload images" wide>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    disabled={!activeId || uploadingMedia}
                    onChange={(event) => {
                      uploadProjectImages(event.target.files).catch(console.error);
                      event.currentTarget.value = "";
                    }}
                  />
                </Field>
                {!activeId && <p className="cms-muted">Save draft before uploading images.</p>}
                {!!pendingMedia.length && (
                  <div className="cms-upload-previews">
                    {pendingMedia.map((item) => (
                      <div className={`cms-upload-preview ${item.status}`} key={item.id}>
                        <img src={item.previewUrl} alt="" />
                        <div>
                          <strong>{item.file.name}</strong>
                          <span>{item.error || item.status}</span>
                        </div>
                        {item.status === "failed" && (
                          <button type="button" className="cms-button" onClick={() => setPendingMedia((current) => current.filter((row) => row.id !== item.id))}>
                            Dismiss
                          </button>
                        )}
                      </div>
                    ))}
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
                      <div className="cms-media-role-actions">
                        <button className="cms-button" type="button" onClick={() => useMediaAs(item, "cover")}>Cover</button>
                        <button className="cms-button" type="button" onClick={() => useMediaAs(item, "highlight")}>Highlight</button>
                        <button className="cms-button" type="button" onClick={() => useMediaAs(item, "hover")}>Hover</button>
                      </div>
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
