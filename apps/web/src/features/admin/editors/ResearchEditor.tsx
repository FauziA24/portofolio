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
import type { ResearchItem, ResearchType } from "../../../types";
import type { SaveState } from "../types";
import { blankResearch, researchTypes } from "../forms";

export function ResearchEditor() {
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [draft, setDraft] = useState(blankResearch);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const load = async () => setItems(await api.adminResearch());
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  function update(id: string, patch: Partial<ResearchItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function saveItem(item: ResearchItem) {
    await withSave(setSaveState, async () => {
      await api.saveResearch(item);
      await load();
    });
  }

  async function addItem(event: React.FormEvent) {
    event.preventDefault();
    await withSave(setSaveState, async () => {
      await api.createResearch({ ...draft, sortOrder: items.length + 1 });
      setDraft(blankResearch);
      await load();
    });
  }

  async function removeItem(id: string) {
    if (!confirm("Delete this research or credential item?")) return;
    await api.deleteResearch(id);
    await load();
  }

  async function move(index: number, direction: -1 | 1) {
    const reordered = moveOrdered(items, index, direction);
    if (!reordered) return;
    setItems(reordered);
    setItems(
      await api.reorderResearch(
        reordered.map(({ id, sortOrder }) => ({ id, sortOrder })),
      ),
    );
  }

  if (loading)
    return (
      <main className="cms-loading">
        <LoaderCircle className="spin" size={22} /> Loading research
      </main>
    );

  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <p className="cms-kicker">Content</p>
          <h1>Research & Credentials</h1>
        </div>
        <div className="cms-actions">
          <SaveBadge state={saveState} />
        </div>
      </div>
      <form className="cms-card cms-panel" onSubmit={addItem}>
        <div className="cms-section-title">
          <h2>Add item</h2>
          <span>Public research section</span>
        </div>
        <div className="cms-form-grid">
          <Field label="Type">
            <select
              value={draft.type}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  type: event.target.value as ResearchType,
                }))
              }
            >
              {researchTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="Title">
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
            />
          </Field>
          <Field label="Issuer or venue">
            <input
              value={draft.issuerOrVenue}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  issuerOrVenue: event.target.value,
                }))
              }
              required
            />
          </Field>
          <Field label="Date label">
            <input
              value={draft.dateLabel ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  dateLabel: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="DOI">
            <input
              value={draft.doi ?? ""}
              onChange={(event) =>
                setDraft((current) => ({ ...current, doi: event.target.value }))
              }
            />
          </Field>
          <Field label="URL">
            <input
              type="url"
              value={draft.url ?? ""}
              onChange={(event) =>
                setDraft((current) => ({ ...current, url: event.target.value }))
              }
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
          <h2>Current items</h2>
          <span>{items.length} items</span>
        </div>
        <div className="cms-list">
          {items.map((item, index) => (
            <div key={item.id} className="cms-research-row">
              <select
                value={item.type}
                onChange={(event) =>
                  update(item.id, { type: event.target.value as ResearchType })
                }
                aria-label="Type"
              >
                {researchTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              <input
                value={item.title}
                onChange={(event) =>
                  update(item.id, { title: event.target.value })
                }
                aria-label="Title"
              />
              <input
                value={item.issuerOrVenue}
                onChange={(event) =>
                  update(item.id, { issuerOrVenue: event.target.value })
                }
                aria-label="Issuer or venue"
              />
              <input
                value={item.dateLabel ?? ""}
                onChange={(event) =>
                  update(item.id, { dateLabel: event.target.value })
                }
                aria-label="Date label"
              />
              <input
                value={item.doi ?? ""}
                onChange={(event) =>
                  update(item.id, { doi: event.target.value })
                }
                aria-label="DOI"
              />
              <input
                value={item.url ?? ""}
                onChange={(event) =>
                  update(item.id, { url: event.target.value })
                }
                aria-label="URL"
              />
              <select
                value={item.isVisible ? "true" : "false"}
                onChange={(event) =>
                  update(item.id, { isVisible: event.target.value === "true" })
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
                disabled={index === items.length - 1}
                title="Move down"
              >
                <ArrowDown size={16} />
              </button>
              <button
                className="cms-button"
                type="button"
                onClick={() => saveItem(item)}
              >
                <Check size={16} /> Save
              </button>
              <button
                className="cms-button danger"
                type="button"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          ))}
          {!items.length && (
            <p className="cms-muted">No research or credentials yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
