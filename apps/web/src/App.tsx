import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation, Link } from "react-router-dom";
import Nav from "./components/Nav";
import SiteIntro from "./components/SiteIntro";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import { api } from "./lib/api";
import type { SiteProfile } from "./types";
const Admin = lazy(() => import("./pages/Admin"));

type SiteContent = {
  profile: SiteProfile | null;
  settings: Record<string, string>;
};

export function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    localStorage.getItem("theme") === "dark" ? "dark" : "light",
  );
  const [site, setSite] = useState<SiteContent>({
    profile: null,
    settings: {},
  });
  const [siteLoading, setSiteLoading] = useState(true);
  const [siteError, setSiteError] = useState(false);
  const location = useLocation();
  const adminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (adminRoute) {
      setSiteLoading(false);
      return;
    }
    setSiteLoading(true);
    api
      .site()
      .then((data) => {
        setSite({ profile: data.profile, settings: data.settings });
        setSiteError(false);
      })
      .catch(() => {
        setSite({ profile: null, settings: {} });
        setSiteError(true);
      })
      .finally(() => setSiteLoading(false));
  }, [adminRoute]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!site.profile) return;
    document.title =
      site.profile.seoTitle || `${site.profile.displayName} - Portfolio`;
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description && site.profile.seoDescription)
      description.content = site.profile.seoDescription;
  }, [site.profile]);

  useEffect(() => {
    if (location.hash)
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return (
    <>
      {location.pathname === "/" && site.profile && (
        <SiteIntro profile={site.profile} />
      )}
      {!adminRoute && (
        <a
          href="#main-content"
          className="fixed -top-20 focus:top-2 left-4 z-[100] p-3 bg-background"
        >
          Skip to content
        </a>
      )}
      {!adminRoute && (
        <Nav
          profile={site.profile}
          availabilityLabel={site.settings.availabilityLabel ?? ""}
          theme={theme}
          onToggle={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
        />
      )}
      <div id="main-content" tabIndex={-1}>
        <Suspense
          fallback={
            <p className="pt-32 px-6" role="status">
              Loading…
            </p>
          }
        >
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  profile={site.profile}
                  settings={site.settings}
                  loading={siteLoading}
                  error={siteError}
                />
              }
            />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route
              path="/projects"
              element={<Projects settings={site.settings} />}
            />
            <Route path="/admin" element={<Admin />} />
            <Route
              path="*"
              element={
                <main className="pt-32 px-6">
                  <h1>Page not found</h1>
                  <Link to="/">Back home</Link>
                </main>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}
