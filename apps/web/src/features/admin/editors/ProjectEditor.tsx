import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, Crop, Eye, Plus, Trash2 } from "lucide-react";
import { Field } from "../components/Field";
import { MediaCropDialog } from "../components/MediaCropDialog";
import { MediaFeedback, type MediaFeedbackState } from "../components/MediaFeedback";
import { defaultMediaTransform, mediaFrameStyle, mediaImageStyle } from "../../../lib/media";
import { SaveBadge } from "../components/SaveBadge";
import { ProjectDetailView } from "../../projects/ProjectDetailView";
import { toViewProject } from "../../projects/mappers";
import { moveOrdered, withSave } from "../helpers";
import { api, fileToDataUrl } from "../../../lib/api";
import type { MediaTransform, Project, ProjectMedia } from "../../../types";
import type { SaveState } from "../types";
import {
  blankProject,
  fieldLabel,
  projectFormToProject,
  projectToForm,
  toProjectPayload,
  type ProjectForm,
} from "../forms";

type PendingMedia = MediaTransform & {
  id: string;
  file: File;
  previewUrl: string;
  status: "queued" | "uploading" | "failed";
  error?: string;
};

type CropTarget = { kind: "pending" | "saved"; id: string } | null;

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
  const [cropTarget, setCropTarget] = useState<CropTarget>(null);
  const [savingCrop, setSavingCrop] = useState(false);
  const [cropError, setCropError] = useState("");
  const [mediaFeedback, setMediaFeedback] = useState<{ state: MediaFeedbackState; message: string }>({ state: "idle", message: "" });
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
    setCropTarget(null);
    setCropError("");
    setMediaFeedback({ state: "idle", message: "" });
  }

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function queueProjectImages(files?: FileList | null) {
    if (!files?.length || !activeId) return;
    setMediaFeedback({ state: "idle", message: "" });
    try {
      const selected = await Promise.all(Array.from(files).map(async (file) => ({
        ...defaultMediaTransform,
        id: crypto.randomUUID(),
        file,
        previewUrl: await fileToDataUrl(file),
        status: "queued" as const,
      })));
      setPendingMedia((current) => [...current, ...selected]);
      setCropTarget({ kind: "pending", id: selected[0].id });
    } catch (error) {
      setMediaFeedback({
        state: "error",
        message: error instanceof Error ? error.message : "Media preview failed.",
      });
    }
  }

  async function uploadProjectImages() {
    const selected = pendingMedia.filter((item) => item.status === "queued" || item.status === "failed");
    if (!selected.length || !activeId) return;
    setUploadingMedia(true);
    setMediaFeedback({ state: "uploading", message: `Uploading ${selected.length} media item${selected.length === 1 ? "" : "s"}...` });
    let uploadedCount = 0;
    let failedCount = 0;
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
          cropZoom: pending.cropZoom,
          focalX: pending.focalX,
          focalY: pending.focalY,
          aspectRatio: pending.aspectRatio,
          displayWidth: pending.displayWidth,
          displayHeight: pending.displayHeight,
        });
        setMedia((current) => [...current, { ...row, mediaAsset: asset }]);
        setPendingMedia((current) => current.filter((item) => item.id !== pending.id));
        uploadedCount += 1;
      } catch (error) {
        failedCount += 1;
        if (assetId) await api.deleteMedia(assetId).catch(() => null);
        setPendingMedia((current) => current.map((item) => item.id === pending.id
          ? { ...item, status: "failed", error: error instanceof Error ? error.message : "Upload failed" }
          : item,
        ));
      }
    }
    setUploadingMedia(false);
    if (failedCount) {
      setMediaFeedback({
        state: "error",
        message: `${uploadedCount} media saved successfully; ${failedCount} failed. Review the marked item${failedCount === 1 ? "" : "s"} and retry.`,
      });
    } else {
      setMediaFeedback({
        state: "success",
        message: `${uploadedCount} media item${uploadedCount === 1 ? "" : "s"} uploaded and saved successfully.`,
      });
    }
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
    const saved = await api.saveProjectMedia(row);
    setMedia((current) =>
      current.map((item) => (item.id === row.id ? { ...item, ...saved } : item)),
    );
  }

  async function saveMediaWithFeedback(row: ProjectMedia) {
    setMediaFeedback({ state: "uploading", message: "Saving media changes..." });
    try {
      await saveMedia(row);
      setMediaFeedback({ state: "success", message: "Media changes saved successfully." });
    } catch (error) {
      setMediaFeedback({
        state: "error",
        message: error instanceof Error ? `Media save failed: ${error.message}` : "Media save failed.",
      });
    }
  }

  async function applyMediaCrop(transform: MediaTransform) {
    if (!cropTarget) return;
    setCropError("");
    if (cropTarget.kind === "pending") {
      setPendingMedia((current) => current.map((item) => item.id === cropTarget.id
        ? { ...item, ...transform, status: "queued", error: undefined }
        : item,
      ));
      setCropTarget(null);
      return;
    }

    const row = media.find((item) => item.id === cropTarget.id);
    if (!row) return setCropTarget(null);
    setSavingCrop(true);
    setMediaFeedback({ state: "uploading", message: "Saving media crop..." });
    try {
      await saveMedia({ ...row, ...transform });
      setCropTarget(null);
      setMediaFeedback({ state: "success", message: "Media crop saved successfully." });
    } catch (error) {
      const message = error instanceof Error ? `Media crop save failed: ${error.message}` : "Media crop save failed.";
      setCropError(message);
      setMediaFeedback({ state: "error", message });
    } finally {
      setSavingCrop(false);
    }
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

  const pendingCrop = cropTarget?.kind === "pending"
    ? pendingMedia.find((item) => item.id === cropTarget.id)
    : undefined;
  const savedCrop = cropTarget?.kind === "saved"
    ? media.find((item) => item.id === cropTarget.id)
    : undefined;
  const cropItem = pendingCrop ?? savedCrop;
  const cropSource = pendingCrop?.previewUrl
    ?? savedCrop?.mediaAsset?.publicUrl
    ?? savedCrop?.url
    ?? "";

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
              setCropTarget(null);
              setCropError("");
              setMediaFeedback({ state: "idle", message: "" });
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
              Draft
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
                      queueProjectImages(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </Field>
                <MediaFeedback state={mediaFeedback.state} message={mediaFeedback.message} />
                {!activeId && <p className="cms-muted">Save draft before uploading images.</p>}
                {!!pendingMedia.length && (
                  <div className="cms-upload-previews">
                    {pendingMedia.map((item) => (
                      <div className={`cms-upload-preview ${item.status}`} key={item.id}>
                        <div
                          className="cms-media-edit"
                          role="button"
                          tabIndex={0}
                          aria-label={`Adjust crop for ${item.file.name}`}
                          onClick={() => setCropTarget({ kind: "pending", id: item.id })}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") setCropTarget({ kind: "pending", id: item.id });
                          }}
                        >
                          <div className="cms-media-frame" style={mediaFrameStyle(item)}>
                            <img src={item.previewUrl} alt="" style={mediaImageStyle(item)} />
                          </div>
                          <span className="cms-media-edit-indicator" aria-hidden="true"><Crop size={16} /></span>
                        </div>
                        <div className="cms-upload-details">
                          <strong>{item.file.name}</strong>
                          <span>{item.error || item.status}</span>
                        </div>
                        <button type="button" className="cms-button" onClick={() => setPendingMedia((current) => current.filter((row) => row.id !== item.id))}>
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" className="cms-button primary" disabled={uploadingMedia} onClick={uploadProjectImages}>
                      Upload queued
                    </button>
                  </div>
                )}
                <div className="cms-list cms-media-list">
                  {media.map((item, index) => (
                    <div key={item.id} className="cms-media-row">
                      <div
                        className="cms-media-edit"
                        role="button"
                        tabIndex={0}
                        aria-label={`Adjust crop for ${item.altText || "project image"}`}
                        onClick={() => setCropTarget({ kind: "saved", id: item.id })}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") setCropTarget({ kind: "saved", id: item.id });
                        }}
                      >
                        <div className="cms-media-frame" style={mediaFrameStyle(item)}>
                          <img
                            src={item.mediaAsset?.publicUrl || item.url || ""}
                            alt=""
                            style={mediaImageStyle(item)}
                          />
                        </div>
                        <span className="cms-media-edit-indicator" aria-hidden="true"><Crop size={16} /></span>
                      </div>
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
                        onClick={() => saveMediaWithFeedback(item)}
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
      <MediaCropDialog
        open={Boolean(cropTarget && cropItem)}
        src={cropSource}
        value={cropItem ?? defaultMediaTransform}
        title="Crop project image"
        busy={savingCrop}
        errorMessage={cropError || undefined}
        onCancel={() => {
          setCropTarget(null);
          setCropError("");
        }}
        onApply={applyMediaCrop}
      />
    </div>
  );
}
