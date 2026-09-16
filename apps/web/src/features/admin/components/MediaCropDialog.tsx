import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import { mediaImageStyle } from "../../../lib/media";
import type { MediaTransform } from "../../../types";

type Props = {
  open: boolean;
  src: string;
  value: MediaTransform;
  title?: string;
  busy?: boolean;
  layoutAspectRatio?: string;
  errorMessage?: string;
  onCancel: () => void;
  onApply: (value: MediaTransform) => void | Promise<void>;
};

type DragState = {
  pointerId: number;
  clientX: number;
  clientY: number;
  focalX: number;
  focalY: number;
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function MediaCropDialog({
  open,
  src,
  value,
  title = "Adjust image",
  busy = false,
  layoutAspectRatio,
  errorMessage,
  onCancel,
  onApply,
}: Props) {
  const [draft, setDraft] = useState(value);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<DragState | null>(null);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, src]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [busy, onCancel, open]);

  if (!open) return null;

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      focalX: draft.focalX,
      focalY: draft.focalY,
    };
    setDragging(true);
  }

  function moveImage(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const deltaX = ((event.clientX - drag.current.clientX) / bounds.width) * 100;
    const deltaY = ((event.clientY - drag.current.clientY) / bounds.height) * 100;
    setDraft((current) => ({
      ...current,
      focalX: clamp(drag.current!.focalX - deltaX),
      focalY: clamp(drag.current!.focalY - deltaY),
    }));
  }

  function stopDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
  }

  return (
    <div className="cms-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel();
    }}>
      <section className="cms-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-dialog-title">
        <header className="cms-crop-header">
          <div>
            <p className="cms-kicker">Media editor</p>
            <h2 id="crop-dialog-title">{title}</h2>
          </div>
          <button type="button" className="cms-icon-button" onClick={onCancel} disabled={busy} title="Close">
            <X size={18} />
          </button>
        </header>

        <div
          className={`cms-crop-stage${dragging ? " dragging" : ""}`}
          style={{ aspectRatio: layoutAspectRatio ?? (draft.aspectRatio === "auto" ? "4 / 3" : draft.aspectRatio) }}
          onPointerDown={startDrag}
          onPointerMove={moveImage}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        >
          <img src={src} alt="Crop preview" draggable={false} style={mediaImageStyle(draft)} />
          <span className="cms-crop-grid" aria-hidden="true" />
        </div>

        <div className={`cms-crop-controls${layoutAspectRatio ? " layout-only" : ""}`}>
          <label className="cms-crop-zoom">
            <span>Zoom</span>
            <input
              type="range"
              min="100"
              max="300"
              value={draft.cropZoom}
              onChange={(event) => setDraft((current) => ({ ...current, cropZoom: Number(event.target.value) }))}
            />
            <output>{draft.cropZoom}%</output>
          </label>
          {!layoutAspectRatio && (
            <>
              <label>
                <span>Aspect ratio</span>
                <select value={draft.aspectRatio} onChange={(event) => setDraft((current) => ({ ...current, aspectRatio: event.target.value }))}>
                  <option value="auto">Original</option>
                  <option value="1 / 1">Square 1:1</option>
                  <option value="4 / 3">Landscape 4:3</option>
                  <option value="3 / 2">Landscape 3:2</option>
                  <option value="4 / 5">Portrait 4:5</option>
                  <option value="16 / 9">Wide 16:9</option>
                </select>
              </label>
              <label>
                <span>Display width</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Auto"
                  value={draft.displayWidth ?? ""}
                  onChange={(event) => setDraft((current) => ({ ...current, displayWidth: event.target.value ? Number(event.target.value) : null }))}
                />
              </label>
              <label>
                <span>Display height</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Auto"
                  value={draft.displayHeight ?? ""}
                  onChange={(event) => setDraft((current) => ({ ...current, displayHeight: event.target.value ? Number(event.target.value) : null }))}
                />
              </label>
            </>
          )}
        </div>

        <footer className="cms-crop-actions">
          {errorMessage && (
            <p className="cms-media-feedback error cms-crop-error" role="alert">
              <AlertCircle size={16} /> <span>{errorMessage}</span>
            </p>
          )}
          <button type="button" className="cms-button" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="cms-button primary" onClick={() => onApply(layoutAspectRatio ? {
            ...draft,
            aspectRatio: layoutAspectRatio,
            displayWidth: null,
            displayHeight: null,
          } : draft)} disabled={busy}>
            <Check size={16} /> {busy ? "Applying..." : "Apply crop"}
          </button>
        </footer>
      </section>
    </div>
  );
}
