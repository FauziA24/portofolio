import { LogOut } from "lucide-react";
import { pages } from "../config";
import type { AdminPage } from "../types";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CMS"
  );
}

export function Sidebar({
  current,
  email,
  brandName,
  onChange,
  onLogout,
}: {
  current: AdminPage;
  email: string;
  brandName?: string;
  onChange: (page: AdminPage) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="cms-sidebar">
      <div className="cms-brand">
        <div className="cms-logo">{initials(brandName ?? "")}</div>
        <div>
          <strong>Portfolio CMS</strong>
          <span>{brandName || "Database content"}</span>
        </div>
      </div>
      <nav>
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <button
              key={page.id}
              className={current === page.id ? "active" : ""}
              onClick={() => onChange(page.id)}
            >
              <Icon size={16} />
              <span>{page.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="cms-account">
        <div>
          <strong>{email}</strong>
          <span>Admin</span>
        </div>
        <button onClick={onLogout}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
