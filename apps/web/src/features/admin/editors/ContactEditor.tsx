import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Field } from "../components/Field";
import { SaveBadge } from "../components/SaveBadge";
import { moveOrdered, withSave } from "../helpers";
import { api } from "../../../lib/api";
import type { ContactKind, ContactLink } from "../../../types";
import type { SaveState } from "../types";
import { blankContact, contactKinds } from "../forms";

export function ContactEditor() {
  const [links, setLinks] = useState<ContactLink[]>([]);
  const [draft, setDraft] = useState(blankContact);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const load = async () => setLinks(await api.adminContactLinks());
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  function update(id: string, patch: Partial<ContactLink>) {
    setLinks((current) =>
      current.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    );
  }

  async function saveLink(link: ContactLink) {
    await withSave(setSaveState, async () => {
      await api.saveContactLink(link);
      await load();
    });
  }

  async function addLink(event: React.FormEvent) {
    event.preventDefault();
    await withSave(setSaveState, async () => {
      await api.createContactLink({ ...draft, sortOrder: links.length + 1 });
      setDraft(blankContact);
      await load();
    });
  }

  async function removeLink(id: string) {
    if (!confirm("Delete this contact link?")) return;
    await api.deleteContactLink(id);
    await load();
  }

  async function move(index: number, direction: -1 | 1) {
    const reordered = moveOrdered(links, index, direction);
    if (!reordered) return;
    setLinks(reordered);
    setLinks(
      await api.reorderContactLinks(
        reordered.map(({ id, sortOrder }) => ({ id, sortOrder })),
      ),
    );
  }

  if (loading)
    return (
      <main className="cms-loading">
        <LoaderCircle className="spin" size={22} /> Loading contact links
      </main>
    );

  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <p className="cms-kicker">Content</p>
          <h1>Contact Links</h1>
        </div>
        <div className="cms-actions">
          <SaveBadge state={saveState} />
        </div>
      </div>
      <form className="cms-card cms-panel" onSubmit={addLink}>
        <div className="cms-section-title">
          <h2>Add contact</h2>
          <span>Public contact section</span>
        </div>
        <div className="cms-form-grid">
          <Field label="Kind">
            <select
              value={draft.kind}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  kind: event.target.value as ContactKind,
                }))
              }
            >
              {contactKinds.map((kind) => (
                <option key={kind}>{kind}</option>
              ))}
            </select>
          </Field>
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
          <Field label="Display value">
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
          <Field label="URL">
            <input
              value={draft.url}
              onChange={(event) =>
                setDraft((current) => ({ ...current, url: event.target.value }))
              }
              placeholder="mailto:, tel:, or https://"
              required
            />
          </Field>
          <Field label="Primary">
            <select
              value={draft.isPrimary ? "true" : "false"}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  isPrimary: event.target.value === "true",
                }))
              }
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
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
          <h2>Current contacts</h2>
          <span>{links.length} items</span>
        </div>
        <div className="cms-list">
          {links.map((link, index) => (
            <div key={link.id} className="cms-contact-row">
              <select
                value={link.kind}
                onChange={(event) =>
                  update(link.id, { kind: event.target.value as ContactKind })
                }
                aria-label="Kind"
              >
                {contactKinds.map((kind) => (
                  <option key={kind}>{kind}</option>
                ))}
              </select>
              <input
                value={link.label}
                onChange={(event) =>
                  update(link.id, { label: event.target.value })
                }
                aria-label="Label"
              />
              <input
                value={link.value}
                onChange={(event) =>
                  update(link.id, { value: event.target.value })
                }
                aria-label="Display value"
              />
              <input
                value={link.url}
                onChange={(event) =>
                  update(link.id, { url: event.target.value })
                }
                aria-label="URL"
              />
              <select
                value={link.isPrimary ? "true" : "false"}
                onChange={(event) =>
                  update(link.id, { isPrimary: event.target.value === "true" })
                }
                aria-label="Primary"
              >
                <option value="false">Normal</option>
                <option value="true">Primary</option>
              </select>
              <select
                value={link.isVisible ? "true" : "false"}
                onChange={(event) =>
                  update(link.id, { isVisible: event.target.value === "true" })
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
                disabled={index === links.length - 1}
                title="Move down"
              >
                <ArrowDown size={16} />
              </button>
              <button
                className="cms-button"
                type="button"
                onClick={() => saveLink(link)}
              >
                <Check size={16} /> Save
              </button>
              <button
                className="cms-button danger"
                type="button"
                onClick={() => removeLink(link.id)}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          ))}
          {!links.length && <p className="cms-muted">No contact links yet.</p>}
        </div>
      </section>
    </div>
  );
}
