import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Crop,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Field } from "../components/Field";
import { MediaCropDialog } from "../components/MediaCropDialog";
import { MediaFeedback, type MediaFeedbackState } from "../components/MediaFeedback";
import { ABOUT_PORTRAIT_ASPECT_RATIO, mediaFrameStyle, mediaImageStyle } from "../../../lib/media";
import { SaveBadge } from "../components/SaveBadge";
import { moveOrdered, withSave } from "../helpers";
import { api, fileToDataUrl } from "../../../lib/api";
import type { MediaTransform, ProfileFact, SiteProfile } from "../../../types";
import type { SaveState } from "../types";
import { blankFact, blankProfile } from "../forms";

export function AboutFactsEditor() {
  const [facts, setFacts] = useState<ProfileFact[]>([]);
  const [profile, setProfile] = useState<SiteProfile>(blankProfile);
  const [portraitPreview, setPortraitPreview] = useState("");
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [mediaFeedback, setMediaFeedback] = useState<{ state: MediaFeedbackState; message: string }>({ state: "idle", message: "" });
  const [draft, setDraft] = useState(blankFact);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const load = async () => {
    const [nextProfile, nextFacts] = await Promise.all([
      api.adminProfile(),
      api.adminProfileFacts(),
    ]);
    setProfile(nextProfile);
    setFacts(nextFacts);
  };
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  function update(id: string, patch: Partial<ProfileFact>) {
    setFacts((current) =>
      current.map((fact) => (fact.id === id ? { ...fact, ...patch } : fact)),
    );
  }

  function updateProfile<K extends keyof SiteProfile>(key: K, value: SiteProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  const portraitTransform: MediaTransform = {
    cropZoom: profile.portraitCropZoom,
    focalX: profile.portraitFocalX,
    focalY: profile.portraitFocalY,
    aspectRatio: ABOUT_PORTRAIT_ASPECT_RATIO,
    displayWidth: null,
    displayHeight: null,
  };

  async function selectPortrait(file?: File) {
    if (!file) return;
    setMediaFeedback({ state: "idle", message: "" });
    try {
      const dataUrl = await fileToDataUrl(file);
      setPortraitPreview(dataUrl);
      setPortraitFile(file);
      setCropOpen(true);
    } catch (error) {
      setMediaFeedback({
        state: "error",
        message: error instanceof Error ? error.message : "Portrait preview failed.",
      });
    }
  }

  async function applyPortraitCrop(transform: MediaTransform) {
    setUploadingPortrait(true);
    setMediaFeedback({
      state: "uploading",
      message: portraitFile ? "Uploading portrait..." : "Applying portrait crop...",
    });
    try {
      const asset = portraitFile ? await api.uploadMedia({
        fileName: portraitFile.name,
        mimeType: portraitFile.type,
        dataBase64: portraitPreview.split(",")[1] ?? "",
        scope: "profile",
      }) : null;
      setProfile((current) => ({
        ...current,
        portraitImageUrl: asset?.publicUrl ?? current.portraitImageUrl,
        portraitImageAlt: current.portraitImageAlt || portraitFile?.name || null,
        portraitCropZoom: transform.cropZoom,
        portraitFocalX: transform.focalX,
        portraitFocalY: transform.focalY,
        portraitAspectRatio: transform.aspectRatio,
        portraitDisplayWidth: transform.displayWidth,
        portraitDisplayHeight: transform.displayHeight,
      }));
      setPortraitFile(null);
      setCropOpen(false);
      setMediaFeedback({
        state: "success",
        message: asset
          ? "Portrait uploaded successfully. Save About to publish the change."
          : "Portrait crop applied. Save About to publish the change.",
      });
    } catch (error) {
      setMediaFeedback({
        state: "error",
        message: error instanceof Error ? `Portrait upload failed: ${error.message}` : "Portrait upload failed.",
      });
    } finally {
      setUploadingPortrait(false);
    }
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    await withSave(setSaveState, async () => {
      setProfile(await api.saveProfile(profile));
      setPortraitPreview("");
    });
  }

  async function saveFact(fact: ProfileFact) {
    await withSave(setSaveState, async () => {
      await api.saveProfileFact(fact);
      await load();
    });
  }

  async function addFact(event: React.FormEvent) {
    event.preventDefault();
    await withSave(setSaveState, async () => {
      await api.createProfileFact({ ...draft, sortOrder: facts.length + 1 });
      setDraft(blankFact);
      await load();
    });
  }

  async function removeFact(id: string) {
    if (!confirm("Delete this profile fact?")) return;
    await api.deleteProfileFact(id);
    await load();
  }

  async function move(index: number, direction: -1 | 1) {
    const reordered = moveOrdered(facts, index, direction);
    if (!reordered) return;
    setFacts(reordered);
    setFacts(
      await api.reorderProfileFacts(
        reordered.map(({ id, sortOrder }) => ({ id, sortOrder })),
      ),
    );
  }

  if (loading)
    return (
      <main className="cms-loading">
        <LoaderCircle className="spin" size={22} /> Loading facts
      </main>
    );

  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <p className="cms-kicker">About</p>
          <h1>About & Footer</h1>
        </div>
        <div className="cms-actions">
          <SaveBadge state={saveState} />
        </div>
      </div>
      <form className="cms-card cms-panel" onSubmit={saveProfile}>
        <div className="cms-section-title">
          <h2>About content</h2>
          <span>Public homepage and footer</span>
        </div>
        <div className="cms-form-grid">
          <Field label="About headline" wide>
            <input value={profile.aboutHeadline} onChange={(event) => updateProfile("aboutHeadline", event.target.value)} required />
          </Field>
          <Field label="About body" wide>
            <textarea rows={5} value={profile.aboutBody} onChange={(event) => updateProfile("aboutBody", event.target.value)} required />
          </Field>
          <Field label="Portrait image" wide>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={uploadingPortrait}
              onChange={(event) => {
                selectPortrait(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
            {(portraitPreview || profile.portraitImageUrl) && (
              <div
                className="cms-media-edit cms-portrait-edit"
                role="button"
                tabIndex={0}
                aria-label="Adjust portrait crop"
                onClick={() => setCropOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setCropOpen(true);
                }}
              >
                <div className="cms-media-frame cms-portrait-preview" style={mediaFrameStyle(portraitTransform)}>
                  <img src={portraitPreview || profile.portraitImageUrl || ""} alt="Portrait preview" style={mediaImageStyle(portraitTransform)} />
                </div>
                <span className="cms-media-edit-indicator" aria-hidden="true"><Crop size={17} /></span>
              </div>
            )}
            <MediaFeedback state={mediaFeedback.state} message={mediaFeedback.message} />
          </Field>
          <Field label="Portrait alt">
            <input value={profile.portraitImageAlt ?? ""} onChange={(event) => updateProfile("portraitImageAlt", event.target.value || null)} />
          </Field>
          <Field label="Short name / brand">
            <input value={profile.shortName} onChange={(event) => updateProfile("shortName", event.target.value)} required />
          </Field>
          <Field label="Footer location">
            <input value={profile.footerLocation} onChange={(event) => updateProfile("footerLocation", event.target.value)} required />
          </Field>
          <Field label="Footer timezone">
            <input value={profile.footerTimezone} onChange={(event) => updateProfile("footerTimezone", event.target.value)} required />
          </Field>
          <Field label="Content language">
            <select value={profile.contentLanguage} onChange={(event) => updateProfile("contentLanguage", event.target.value as SiteProfile["contentLanguage"])}>
              <option value="en">English</option>
              <option value="id">Indonesian</option>
            </select>
          </Field>
          <div className="cms-actions wide">
            <button className="cms-button primary" disabled={uploadingPortrait}>
              <Check size={16} /> Save about
            </button>
          </div>
        </div>
      </form>
      <form className="cms-card cms-panel" onSubmit={addFact}>
        <div className="cms-section-title">
          <h2>Add fact</h2>
          <span>Public about section</span>
        </div>
        <div className="cms-form-grid">
          <Field label="Label">
            <input
              value={draft.label}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  label: event.target.value,
                }))
              }
              required
            />
          </Field>
          <Field label="Value">
            <input
              value={draft.value}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  value: event.target.value,
                }))
              }
              required
            />
          </Field>
          <Field label="Visible">
            <select
              value={draft.isVisible ? "true" : "false"}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  isVisible: event.target.value === "true",
                }))
              }
            >
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
          </Field>
          <div className="cms-actions">
            <button className="cms-button primary">
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </form>
      <section className="cms-card cms-panel">
        <div className="cms-section-title">
          <h2>Current facts</h2>
          <span>{facts.length} items</span>
        </div>
        <div className="cms-list">
          {facts.map((fact, index) => (
            <div key={fact.id} className="cms-fact-row">
              <input
                value={fact.label}
                onChange={(event) =>
                  update(fact.id, { label: event.target.value })
                }
                aria-label="Fact label"
              />
              <input
                value={fact.value}
                onChange={(event) =>
                  update(fact.id, { value: event.target.value })
                }
                aria-label="Fact value"
              />
              <select
                value={fact.isVisible ? "true" : "false"}
                onChange={(event) =>
                  update(fact.id, { isVisible: event.target.value === "true" })
                }
                aria-label="Visibility"
              >
                <option value="true">Visible</option>
                <option value="false">Hidden</option>
              </select>
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
                disabled={index === facts.length - 1}
                title="Move down"
              >
                <ArrowDown size={16} />
              </button>
              <button
                className="cms-button"
                type="button"
                onClick={() => saveFact(fact)}
              >
                <Check size={16} /> Save
              </button>
              <button
                className="cms-button danger"
                type="button"
                onClick={() => removeFact(fact.id)}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          ))}
          {!facts.length && <p className="cms-muted">No profile facts yet.</p>}
        </div>
      </section>
      <MediaCropDialog
        open={cropOpen}
        src={portraitPreview || profile.portraitImageUrl || ""}
        value={portraitTransform}
        title="Crop portrait"
        busy={uploadingPortrait}
        layoutAspectRatio={ABOUT_PORTRAIT_ASPECT_RATIO}
        errorMessage={mediaFeedback.state === "error" ? mediaFeedback.message : undefined}
        onCancel={() => {
          if (portraitFile) {
            setPortraitFile(null);
            setPortraitPreview("");
          }
          setCropOpen(false);
        }}
        onApply={applyPortraitCrop}
      />
    </div>
  );
}
