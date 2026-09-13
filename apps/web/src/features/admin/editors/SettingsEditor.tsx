import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Field } from "../components/Field";
import { SaveBadge } from "../components/SaveBadge";
import { labels } from "../config";
import { withSave } from "../helpers";
import { api } from "../../../lib/api";
import type { SaveState } from "../types";

export function SettingsEditor({ page }: { page: "seo" | "settings" }) {
  const [settings, setSettings] = useState<Record<string, string>>({
    siteUrl: "",
    robotsPolicy: "allow",
    deploymentTarget: "",
    contactNotificationEmail: "",
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    api
      .adminSettings()
      .then((data) => setSettings((current) => ({ ...current, ...data })))
      .catch(() => null);
  }, []);

  function update(key: string, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    await withSave(setSaveState, async () =>
      setSettings(await api.saveSettings(settings)),
    );
  }

  return (
    <form className="cms-page" onSubmit={save}>
      <div className="cms-page-head">
        <div>
          <p className="cms-kicker">
            {page === "seo" ? "Search visibility" : "Site controls"}
          </p>
          <h1>{labels[page]}</h1>
        </div>
        <div className="cms-actions">
          <SaveBadge state={saveState} />
          <button className="cms-button primary">
            <Check size={16} /> Save
          </button>
        </div>
      </div>
      <section className="cms-card cms-panel">
        <div className="cms-form-grid">
          <Field label="Public site URL" wide>
            <input
              type="url"
              value={settings.siteUrl ?? ""}
              onChange={(event) => update("siteUrl", event.target.value)}
              placeholder="https://domain-anda.com"
            />
          </Field>
          {page === "seo" ? (
            <>
              <Field label="Robots policy">
                <select
                  value={settings.robotsPolicy ?? "allow"}
                  onChange={(event) =>
                    update("robotsPolicy", event.target.value)
                  }
                >
                  <option value="allow">Allow indexing</option>
                  <option value="disallow">Disallow all</option>
                </select>
              </Field>
              <Field label="Sitemap URL">
                <input
                  readOnly
                  value={`${(settings.siteUrl || window.location.origin).replace(/\/+$/, "")}/sitemap.xml`}
                />
              </Field>
              <Field label="Robots URL">
                <input
                  readOnly
                  value={`${(settings.siteUrl || window.location.origin).replace(/\/+$/, "")}/robots.txt`}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Deployment target">
                <input
                  value={settings.deploymentTarget ?? ""}
                  onChange={(event) =>
                    update("deploymentTarget", event.target.value)
                  }
                  placeholder="Cloudflare Pages / VPS / Docker"
                />
              </Field>
              <Field label="Notification email">
                <input
                  type="email"
                  value={settings.contactNotificationEmail ?? ""}
                  onChange={(event) =>
                    update("contactNotificationEmail", event.target.value)
                  }
                />
              </Field>
            </>
          )}
        </div>
      </section>
    </form>
  );
}
