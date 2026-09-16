import { useEffect, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { Field } from "../components/Field";
import { SaveBadge } from "../components/SaveBadge";
import { withSave } from "../helpers";
import { api, fileToBase64 } from "../../../lib/api";
import type { SiteProfile } from "../../../types";
import type { SaveState } from "../types";
import { blankProfile } from "../forms";

export function ProfileEditor() {
  const [profile, setProfile] = useState<SiteProfile>(blankProfile);
  const [loading, setLoading] = useState(true);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    api
      .adminProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof SiteProfile>(key: K, value: SiteProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function uploadPortrait(file?: File) {
    if (!file) return;
    setUploadingPortrait(true);
    try {
      const asset = await api.uploadMedia({
        fileName: file.name,
        mimeType: file.type,
        dataBase64: await fileToBase64(file),
        scope: "profile",
      });
      update("portraitImageUrl", asset.publicUrl);
      update("portraitImageAlt", profile.portraitImageAlt || file.name);
    } finally {
      setUploadingPortrait(false);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    await withSave(setSaveState, async () =>
      setProfile(await api.saveProfile(profile)),
    );
  }

  if (loading)
    return (
      <main className="cms-loading">
        <LoaderCircle className="spin" size={22} /> Loading profile
      </main>
    );

  return (
    <form className="cms-page" onSubmit={save}>
      <div className="cms-page-head">
        <div>
          <p className="cms-kicker">Profile & Homepage</p>
          <h1>{profile.displayName || "Site profile"}</h1>
        </div>
        <div className="cms-actions">
          <SaveBadge state={saveState} />
          <button className="cms-button primary">
            <Check size={16} /> Save
          </button>
        </div>
      </div>
      <section className="cms-card cms-panel">
        <div className="cms-section-title">
          <h2>Hero</h2>
          <span>Public homepage</span>
        </div>
        <div className="cms-form-grid">
          <Field label="Display name">
            <input
              value={profile.displayName}
              onChange={(event) => update("displayName", event.target.value)}
              required
            />
          </Field>
          <Field label="Role">
            <input
              value={profile.role}
              onChange={(event) => update("role", event.target.value)}
              required
            />
          </Field>
          <Field label="Hero headline" wide>
            <input
              value={profile.heroHeadline}
              onChange={(event) => update("heroHeadline", event.target.value)}
              required
            />
          </Field>
          <Field label="Hero emphasis">
            <input
              value={profile.heroEmphasis ?? ""}
              onChange={(event) =>
                update("heroEmphasis", event.target.value || null)
              }
            />
          </Field>
          <Field label="Hero body" wide>
            <textarea
              rows={4}
              value={profile.heroBody}
              onChange={(event) => update("heroBody", event.target.value)}
              required
            />
          </Field>
          <Field label="Primary CTA label">
            <input
              value={profile.heroPrimaryLabel}
              onChange={(event) =>
                update("heroPrimaryLabel", event.target.value)
              }
              required
            />
          </Field>
          <Field label="Primary CTA URL">
            <input
              value={profile.heroPrimaryUrl}
              onChange={(event) => update("heroPrimaryUrl", event.target.value)}
              required
            />
          </Field>
          <Field label="Secondary CTA label">
            <input
              value={profile.heroSecondaryLabel ?? ""}
              onChange={(event) =>
                update("heroSecondaryLabel", event.target.value || null)
              }
            />
          </Field>
          <Field label="Secondary CTA URL">
            <input
              value={profile.heroSecondaryUrl ?? ""}
              onChange={(event) =>
                update("heroSecondaryUrl", event.target.value || null)
              }
            />
          </Field>
        </div>
      </section>
      <section className="cms-card cms-panel">
        <div className="cms-section-title">
          <h2>About and footer</h2>
          <span>Public homepage</span>
        </div>
        <div className="cms-form-grid">
          <Field label="About headline" wide>
            <input
              value={profile.aboutHeadline}
              onChange={(event) => update("aboutHeadline", event.target.value)}
              required
            />
          </Field>
          <Field label="About body" wide>
            <textarea
              rows={5}
              value={profile.aboutBody}
              onChange={(event) => update("aboutBody", event.target.value)}
              required
            />
          </Field>
          <Field label="Portrait image" wide>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={uploadingPortrait}
              onChange={(event) => {
                uploadPortrait(event.target.files?.[0]).catch(console.error);
                event.target.value = "";
              }}
            />
            <input
              type="url"
              value={profile.portraitImageUrl ?? ""}
              onChange={(event) =>
                update("portraitImageUrl", event.target.value || null)
              }
              placeholder="https://..."
            />
          </Field>
          <Field label="Portrait alt">
            <input
              value={profile.portraitImageAlt ?? ""}
              onChange={(event) =>
                update("portraitImageAlt", event.target.value || null)
              }
            />
          </Field>
          <Field label="Short name / brand">
            <input
              value={profile.shortName}
              onChange={(event) => update("shortName", event.target.value)}
              required
            />
          </Field>
          <Field label="Footer location">
            <input
              value={profile.footerLocation}
              onChange={(event) => update("footerLocation", event.target.value)}
              required
            />
          </Field>
          <Field label="Footer timezone">
            <input
              value={profile.footerTimezone}
              onChange={(event) => update("footerTimezone", event.target.value)}
              required
            />
          </Field>
          <Field label="Content language">
            <select
              value={profile.contentLanguage}
              onChange={(event) =>
                update(
                  "contentLanguage",
                  event.target.value as SiteProfile["contentLanguage"],
                )
              }
            >
              <option value="en">English</option>
              <option value="id">Indonesian</option>
            </select>
          </Field>
        </div>
      </section>
    </form>
  );
}
