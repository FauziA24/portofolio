import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation, Link } from "react-router-dom";
import Nav from "./components/Nav";
import SiteIntro from "./components/SiteIntro";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
const Admin = lazy(() => import("./pages/Admin"));
export function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    localStorage.getItem("theme") === "dark" ? "dark" : "light",
  );
  const location = useLocation();
  const adminRoute = location.pathname.startsWith("/admin");
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    if (location.hash)
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return (
    <>
      {location.pathname === "/" && <SiteIntro />}
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
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/projects" element={<Projects />} />
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
