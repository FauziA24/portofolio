import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { Sidebar } from "../features/admin/components/Sidebar";
import { Login } from "../features/admin/components/Login";
import { labels } from "../features/admin/config";
import { Dashboard } from "../features/admin/editors/Dashboard";
import { AboutFactsEditor } from "../features/admin/editors/AboutFactsEditor";
import { ContactEditor } from "../features/admin/editors/ContactEditor";
import { ProfileEditor } from "../features/admin/editors/ProfileEditor";
import { ProjectEditor } from "../features/admin/editors/ProjectEditor";
import { ResearchEditor } from "../features/admin/editors/ResearchEditor";
import { SelectedWorkEditor } from "../features/admin/editors/SelectedWorkEditor";
import { SettingsEditor } from "../features/admin/editors/SettingsEditor";
import type { AdminPage } from "../features/admin/types";
import { api } from "../lib/api";
import type { Project } from "../types";
import "../styles/admin.css";

function Content({
  page,
  projects,
  onReload,
}: {
  page: AdminPage;
  projects: Project[];
  onReload: () => Promise<void>;
}) {
  if (page === "dashboard") return <Dashboard projects={projects} />;
  if (page === "profile") return <ProfileEditor />;
  if (page === "about") return <AboutFactsEditor />;
  if (page === "selected-work")
    return <SelectedWorkEditor projects={projects} onReload={onReload} />;
  if (page === "research") return <ResearchEditor />;
  if (page === "contact") return <ContactEditor />;
  if (page === "projects")
    return <ProjectEditor projects={projects} onReload={onReload} />;
  return <SettingsEditor page={page} />;
}

export default function Admin() {
  const [email, setEmail] = useState("");
  const [page, setPage] = useState<AdminPage>("dashboard");
  const [projects, setProjects] = useState<Project[]>([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const loadProjects = async () => {
    const data = await api.adminProjects();
    setProjects(data);
  };
  const loadBrand = async () => {
    const profile = await api.adminProfile();
    setBrandName(profile.displayName);
  };

  useEffect(() => {
    api
      .adminMe()
      .then((session) => {
        setEmail(session.email);
        return Promise.all([loadProjects(), loadBrand()]);
      })
      .catch(() => setEmail(""))
      .finally(() => setLoading(false));
  }, []);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          (a.featuredRank ?? 999) - (b.featuredRank ?? 999) ||
          a.title.localeCompare(b.title),
      ),
    [projects],
  );

  async function logout() {
    await api.adminLogout().catch(() => null);
    setEmail("");
    setProjects([]);
    setBrandName("");
  }

  if (loading)
    return (
      <main className="cms-loading">
        <LoaderCircle className="spin" size={22} /> Loading CMS
      </main>
    );
  if (!email)
    return (
      <Login
        onLogin={(nextEmail) => {
          setEmail(nextEmail);
          Promise.all([loadProjects(), loadBrand()]).catch((error) => setNotice(error.message));
        }}
      />
    );

  return (
    <div className="cms-shell">
      <Sidebar
        current={page}
        email={email}
        brandName={brandName}
        onChange={setPage}
        onLogout={logout}
      />
      <div className="cms-main">
        <header className="cms-topbar">
          <span>Portfolio / {labels[page]}</span>
          <a href="/" target="_blank" rel="noreferrer">
            View site
          </a>
        </header>
        {notice && (
          <p className="cms-notice error">
            {notice}
            <button onClick={() => setNotice("")}>
              <X size={14} />
            </button>
          </p>
        )}
        <Content
          page={page}
          projects={sortedProjects}
          onReload={loadProjects}
        />
      </div>
    </div>
  );
}
