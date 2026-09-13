import type { ReactNode } from "react";

export function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "cms-field wide" : "cms-field"}>
      <span>{label}</span>
      {children}
    </label>
  );
}
