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
import type { ProfileFact } from "../../../types";
import type { SaveState } from "../types";
import { blankFact } from "../forms";

export function AboutFactsEditor() {
  const [facts, setFacts] = useState<ProfileFact[]>([]);
  const [draft, setDraft] = useState(blankFact);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const load = async () => setFacts(await api.adminProfileFacts());
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  function update(id: string, patch: Partial<ProfileFact>) {
    setFacts((current) =>
      current.map((fact) => (fact.id === id ? { ...fact, ...patch } : fact)),
    );
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
          <h1>Profile Facts</h1>
        </div>
        <div className="cms-actions">
          <SaveBadge state={saveState} />
        </div>
      </div>
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
    </div>
  );
}
