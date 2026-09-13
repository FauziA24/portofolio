import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export default function Nav({ theme, onToggle }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const links = [
    { label: "Home", href: "/" },
    { label: "Work", href: isHome ? "#work" : "/#work" },
    { label: "About", href: isHome ? "#about" : "/#about" },
    { label: "Research", href: isHome ? "#research" : "/#research" },
    { label: "Contact", href: isHome ? "#contact" : "/#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-glass border-b hr" : ""}`}
    >
      <nav className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 h-[64px] flex items-center justify-between">
        <Link
          to="/"
          className="font-bold text-[15px] tracking-tight font-display"
          aria-label="Home"
        >
          MFA
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="ul-link mono-label"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--foreground)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--muted-foreground)")
              }
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-flex mono-label items-center gap-1.5 px-2.5 py-1 rounded-full border"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
              color: "var(--accent)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--accent)" }}
            />
            Open to opportunities
          </span>

          <button
            onClick={onToggle}
            className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors duration-200"
            style={{ borderColor: "var(--border)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--foreground)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--border)")
            }
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border"
            style={{ borderColor: "var(--border)" }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="md:hidden border-t nav-glass"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex flex-col px-6 py-6 gap-5">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-base font-semibold font-display"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div
              className="pt-3 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="mono-label inline-flex items-center gap-1.5"
                style={{ color: "var(--accent)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "var(--accent)" }}
                />
                Open to opportunities
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
