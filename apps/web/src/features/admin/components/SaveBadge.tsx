import { LoaderCircle } from "lucide-react";
import type { SaveState } from "../types";

export function SaveBadge({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  const text = { saving: "Saving", saved: "Saved", error: "Failed" }[state];
  return (
    <span className={`cms-save ${state}`}>
      {state === "saving" && <LoaderCircle className="spin" size={14} />}
      {text}
    </span>
  );
}
