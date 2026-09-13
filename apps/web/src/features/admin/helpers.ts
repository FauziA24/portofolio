import type { Dispatch, SetStateAction } from "react";
import type { SaveState } from "./types";

export async function withSave<T>(
  setSaveState: Dispatch<SetStateAction<SaveState>>,
  action: () => Promise<T>,
) {
  setSaveState("saving");
  try {
    const result = await action();
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 1800);
    return result;
  } catch {
    setSaveState("error");
    window.setTimeout(() => setSaveState("idle"), 2500);
    return undefined;
  }
}

export function moveOrdered<T extends { sortOrder: number }>(
  items: T[],
  index: number,
  direction: -1 | 1,
  start = 1,
) {
  const next = [...items];
  const target = index + direction;
  if (!next[index] || !next[target]) return null;
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, sortOrder) => ({
    ...item,
    sortOrder: sortOrder + start,
  }));
}
