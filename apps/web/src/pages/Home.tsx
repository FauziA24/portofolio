import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFeaturedProjects } from "../features/projects/useProjects";
import { api } from "../lib/api";
import type {
  ContactLink,
  ProfileFact,
  ResearchItem,
  SiteProfile,
} from "../types";
import Reveal from "../components/Reveal";
import { lazy, Suspense } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import SceneBoundary from "../components/SceneBoundary";
const HeroScene = lazy(() => import("../components/HeroScene"));

function useProfile() {
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    api
      .profile()
      .then((data) => { setProfile(data); setError(false); })
      .catch(() => { setProfile(null); setError(true); })
      .finally(() => setLoading(false));
  }, []);
  return { profile, loading, error };
}

function useProfileFacts() {
  const [facts, setFacts] = useState<ProfileFact[]>([]);
  useEffect(() => {
    api
      .profileFacts()
      .then(setFacts)
      .catch(() => setFacts([]));
  }, []);
  return facts;
}

function useResearchItems() {
  const [items, setItems] = useState<ResearchItem[]>([]);
  useEffect(() => {
    api
      .research()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);
  return items;
}

function useContactLinks() {
  const [links, setLinks] = useState<ContactLink[]>([]);
  useEffect(() => {
    api
      .contactLinks()
      .then(setLinks)
      .catch(() => setLinks([]));
  }, []);
  return links;
}

function emphasizedHeadline(profile: SiteProfile) {
  const emphasis = profile.heroEmphasis;
  if (!emphasis || !profile.heroHeadline.includes(emphasis))
    return profile.heroHeadline;
  const [before, after] = profile.heroHeadline.split(emphasis);
  return (
    <>
      {before}
      <em className="hero-em">{emphasis}</em>
      {after}
    </>
  );
}

function ctaProps(url: string) {
  return url.startsWith("http")
    ? { href: url, target: "_blank", rel: "noreferrer" }
    : { href: url };
}

// ── Section heading ─────────────────────────────────────────────────────────────
function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <Reveal className="flex items-baseline gap-4 mb-14">
      <span className="mono-label" style={{ color: "var(--muted-foreground)" }}>
        {index}
      </span>
      <h2
        className="text-[clamp(26px,3.5vw,40px)] font-bold"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.022em" }}
      >
        {title}
      </h2>
    </Reveal>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────────
function HeroSection({ profile }: { profile: SiteProfile }) {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const scrollProgress = useTransform(scrollY, [0, 900], [0, 1]);
  const heroProgress = useSpring(scrollProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  });
  const heroParallax = useTransform(
    heroProgress,
    [0, 1],
    [0, reduced ? 0 : 160],
  );
  const copyY = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : -42]);
  const [loaded, setLoaded] = useState(false);
  const [showScene, setShowScene] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 180);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (reduced || !window.matchMedia("(min-width: 768px)").matches) return;
    const connection = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    if (connection.connection?.saveData) return;
    const id = window.setTimeout(() => setShowScene(true), 900);
    return () => window.clearTimeout(id);
  }, [reduced]);

  const trans = (d: string) => ({
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${d}, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${d}`,
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(24px)",
  });

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative min-h-screen overflow-hidden"
    >
      <div className="relative min-h-screen flex flex-col justify-end pb-16 pt-[96px] px-6 md:px-10 lg:px-16 max-w-[1440px] mx-auto">
        {/* Three.js scene – static SVG fallback behind it */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{ y: heroParallax }}
        >
          <svg width="100%" height="100%" opacity="0.025">
            <defs>
              <pattern
                id="grid"
                width="52"
                height="52"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M52 0L0 0 0 52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </motion.div>

        {showScene && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <HeroScene scrollProgress={heroProgress} />
            </Suspense>
          </SceneBoundary>
        )}

        <motion.div className="relative z-10" style={{ y: copyY }}>
          <div
            className="mono-label mb-8"
            style={{ ...trans("0.08s"), color: "var(--muted-foreground)" }}
          >
            {profile.displayName}&nbsp;&nbsp;/&nbsp;&nbsp;{profile.role}
          </div>

          <h1
            className="hero-display text-[clamp(44px,7.5vw,108px)] max-w-[860px]"
            style={trans("0.22s")}
          >
            {emphasizedHeadline(profile)}
          </h1>

          <p
            className="mt-6 max-w-[500px] text-base md:text-lg leading-relaxed"
            style={{ ...trans("0.38s"), color: "var(--muted-foreground)" }}
          >
            {profile.heroBody}
          </p>

          <div className="mt-10 flex flex-wrap gap-3" style={trans("0.52s")}>
            <a
              {...ctaProps(profile.heroPrimaryUrl)}
              className="creative-button hero-work-button magnetic px-6 py-3.5 rounded-full font-semibold text-sm font-display"
            >
              {profile.heroPrimaryLabel}
            </a>
            {profile.heroSecondaryLabel && profile.heroSecondaryUrl && (
              <a
                {...ctaProps(profile.heroSecondaryUrl)}
                className="creative-button hero-github-button magnetic px-6 py-3.5 rounded-full font-semibold text-sm font-display"
              >
                {profile.heroSecondaryLabel} ↗
              </a>
            )}
          </div>
        </motion.div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-10 right-6 md:right-16 flex flex-col items-center gap-2"
          style={{ ...trans("0.9s") }}
        >
          <span
            className="mono-label [writing-mode:vertical-rl]"
            style={{ color: "var(--muted-foreground)" }}
          >
            scroll
          </span>
          <div
            className="w-px h-12 overflow-hidden"
            style={{ background: "var(--border)" }}
          >
            <div
              className="w-full h-4 animate-bounce"
              style={{
                background: "var(--muted-foreground)",
                animationDuration: "1.5s",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Work list ───────────────────────────────────────────────────────────────────
function WorkSection() {
  const { projects: displayedProjects, loading, error } = useFeaturedProjects();
  const [preview, setPreview] = useState({
    active: false,
    index: 0,
    x: 0,
    y: 0,
  });
  return (
    <section
      id="work"
      className="py-24 md:py-32 border-t"
      style={{ borderColor: "var(--border)" }}
      onMouseMove={(event) =>
        preview.active &&
        setPreview((value) => ({
          ...value,
          x: event.clientX,
          y: event.clientY,
        }))
      }
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
        <SectionHeading index="02" title="Selected Work" />

        <div className="work-list">
          {loading && (
            <p role="status" className="mono-label py-6">
              Loading projects…
            </p>
          )}
          {error && (
            <p role="alert" className="mono-label py-6">
              Projects could not be loaded. Please try again later.
            </p>
          )}
          {!loading && !error && displayedProjects.length === 0 && (
            <p className="mono-label py-6">New work is coming soon.</p>
          )}
          {displayedProjects.map((p, i) => (
            <Reveal
              key={p.id}
              delay={Math.min((i % 4) + 1, 5) as 1 | 2 | 3 | 4 | 5}
            >
              <Link
                to={`/projects/${p.slug}`}
                className="work-row"
                onMouseEnter={(event) =>
                  setPreview({
                    active: true,
                    index: i,
                    x: event.clientX,
                    y: event.clientY,
                  })
                }
                onMouseLeave={() =>
                  setPreview((value) => ({ ...value, active: false }))
                }
              >
                <h3>{p.title}</h3>
                <p>{p.category}</p>
              </Link>
            </Reveal>
          ))}

          {!loading && !error && displayedProjects.length > 0 && (
            <motion.div
              className="work-preview"
              animate={{
                opacity: preview.active ? 1 : 0,
                scale: preview.active ? 1 : 0.82,
                x: preview.x - 190,
                y: preview.y - 155,
              }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              {displayedProjects[preview.index]?.coverImageUrl ? (
                <img
                  src={displayedProjects[preview.index].coverImageUrl ?? ""}
                  alt=""
                />
              ) : (
                <span>{displayedProjects[preview.index]?.category}</span>
              )}
              <i>View</i>
            </motion.div>
          )}

          {!loading && !error && (
            <div className="flex justify-center pt-10">
              <Link
                to="/projects"
                className="creative-button show-more-button magnetic inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm font-display"
              >
                <span className="show-more-label">
                  Show more project 
                </span>
                <span className="show-more-spark" aria-hidden="true" />
                <span className="show-more-marquee" aria-hidden="true">
                  <span>
                    let's see the projects that have been created&nbsp; · &nbsp;
                  </span>
                  <span>
                    let's see the projects that have been created&nbsp; · &nbsp;
                  </span>
                  <span>
                    let's see the projects that have been created&nbsp; · &nbsp;
                  </span>
                  <span>
                    let's see the projects that have been created&nbsp; · &nbsp;
                  </span>
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── About ───────────────────────────────────────────────────────────────────────
function AboutSection({
  profile,
  facts,
}: {
  profile: SiteProfile;
  facts: ProfileFact[];
}) {
  return (
    <section
      id="about"
      className="py-24 md:py-32 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
        <SectionHeading index="03" title="About" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-12 lg:gap-20 items-start">
          <Reveal>
            <div className="about-photo-card">
              <span className="chip-path chip-path-top" aria-hidden="true" />
              <span className="chip-path chip-path-right" aria-hidden="true" />
              <span className="chip-path chip-path-bottom" aria-hidden="true" />
              <div className="about-photo">
                {profile.portraitImageUrl ? (
                  <img
                    src={profile.portraitImageUrl}
                    alt={profile.portraitImageAlt ?? ""}
                  />
                ) : (
                  <span className="mono-label">Portrait placeholder</span>
                )}
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-8">
            <Reveal delay={1}>
              <p
                className="text-[clamp(20px,2.8vw,34px)] font-semibold leading-snug"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                }}
              >
                {profile.aboutHeadline}
              </p>
            </Reveal>

            <Reveal delay={2}>
              <p
                className="text-base leading-relaxed max-w-[520px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                {profile.aboutBody}
              </p>
            </Reveal>

            <Reveal delay={3}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                {facts.map(({ id, label, value }) => (
                  <div
                    key={id}
                    className="flex flex-col gap-0.5 py-4 border-t"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span
                      className="mono-label"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {label}
                    </span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Research ────────────────────────────────────────────────────────────────────
function ResearchSection() {
  const items = useResearchItems();
  const publications = items.filter((item) => item.type !== "CERTIFICATION");
  const certifications = items.filter((item) => item.type === "CERTIFICATION");

  return (
    <section
      id="research"
      className="research-section border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <SectionHeading index="04" title="Research & Credentials" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <Reveal>
              <p
                className="mono-label mb-6"
                style={{ color: "var(--muted-foreground)" }}
              >
                Publications
              </p>
            </Reveal>
            {publications.map((pub, i) => (
              <Reveal key={pub.id} delay={Math.min(i + 1, 2) as 1 | 2}>
                <div
                  className="flex items-start justify-between gap-4 py-5 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex flex-col gap-1">
                    <span
                      className="mono-label"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {pub.issuerOrVenue}
                      {pub.dateLabel ? ` · ${pub.dateLabel}` : ""}
                    </span>
                    <p className="text-sm font-medium leading-snug mt-1">
                      {pub.title}
                    </p>
                  </div>
                  {pub.url && (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-shrink-0 mono-label px-3 py-1.5 rounded-full border transition-colors duration-200"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--muted-foreground)",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.borderColor =
                          "var(--foreground)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.borderColor =
                          "var(--border)")
                      }
                    >
                      View ↗
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <div>
            <Reveal>
              <p
                className="mono-label mb-6"
                style={{ color: "var(--muted-foreground)" }}
              >
                Certifications
              </p>
            </Reveal>
            {certifications.map((cert, i) => (
              <Reveal key={cert.id} delay={Math.min(i + 1, 2) as 1 | 2}>
                <div
                  className="flex flex-col gap-0.5 py-5 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="mono-label"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {cert.issuerOrVenue}
                    {cert.dateLabel ? ` · ${cert.dateLabel}` : ""}
                  </span>
                  <p className="text-sm font-medium">{cert.title}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Contact ─────────────────────────────────────────────────────────────────────
function ContactSection({ links }: { links: ContactLink[] }) {
  const primary = links.find((link) => link.isPrimary) ?? links[0];
  const quickLinks = [
    primary,
    ...links
      .filter(
        (link) =>
          link.id !== primary?.id && ["LINKEDIN", "GITHUB"].includes(link.kind),
      )
      .slice(0, 2),
  ].filter(Boolean) as ContactLink[];

  return (
    <section
      id="contact"
      className="contact-sticky py-24 md:py-32 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
        <SectionHeading index="05" title="Contact" />

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 lg:gap-20">
          <Reveal>
            <p
              className="text-[clamp(22px,3.8vw,50px)] font-semibold leading-snug"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.025em",
              }}
            >
              Have a system worth making{" "}
              <em className="hero-em" style={{ fontWeight: 300 }}>
                simpler
              </em>
              ?
              <br />
              Let's talk.
            </p>

            <div className="flex flex-wrap gap-3 mt-10 creative-buttons">
              {quickLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel={link.url.startsWith("http") ? "noreferrer" : undefined}
                  className={`creative-button ${link.kind.toLowerCase()}-button magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm font-display`}
                >
                  {link.kind === "EMAIL" && (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  )}
                  {link.kind === "EMAIL" ? "Send email" : link.label}{" "}
                  {link.url.startsWith("http") ? "↗" : ""}
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={2} className="flex flex-col gap-0">
            {links.map(({ id, label, value, url }) => (
              <div
                key={id}
                className="flex flex-col gap-0.5 py-4 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                <span
                  className="mono-label"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {label}
                </span>
                <a
                  href={url}
                  className="ul-link text-sm font-medium"
                  target={url.startsWith("http") ? "_blank" : undefined}
                  rel={url.startsWith("http") ? "noreferrer" : undefined}
                >
                  {value}
                </a>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────────
function Footer({ profile }: { profile: SiteProfile }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: profile.footerTimezone,
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [profile.footerTimezone]);

  return (
    <footer
      className="site-footer border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[15px] font-display">
            {profile.shortName}
          </span>
          <span
            className="mono-label"
            style={{ color: "var(--muted-foreground)" }}
          >
            {profile.footerLocation} · {profile.footerTimezone} ·{" "}
            {time || "—:—"}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span
            className="mono-label"
            style={{ color: "var(--muted-foreground)" }}
          >
            © 2026 {profile.displayName}
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────
export default function Home() {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const facts = useProfileFacts();
  const contactLinks = useContactLinks();
  useEffect(() => {
    if (!profile) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const buttons = Array.from(
      document.querySelectorAll<HTMLElement>(".magnetic"),
    );
    const move = (event: PointerEvent) => {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      button.style.setProperty(
        "--magnet-x",
        `${(event.clientX - rect.left - rect.width / 2) * 0.22}px`,
      );
      button.style.setProperty(
        "--magnet-y",
        `${(event.clientY - rect.top - rect.height / 2) * 0.32}px`,
      );
    };
    const leave = (event: PointerEvent) => {
      const button = event.currentTarget as HTMLElement;
      button.style.setProperty("--magnet-x", "0px");
      button.style.setProperty("--magnet-y", "0px");
    };

    buttons.forEach((button) => {
      button.addEventListener("pointermove", move);
      button.addEventListener("pointerleave", leave);
    });
    return () =>
      buttons.forEach((button) => {
        button.removeEventListener("pointermove", move);
        button.removeEventListener("pointerleave", leave);
      });
  }, [profile]);

  return (
    <>
      <main>
        {profile ? (
          <>
            <HeroSection profile={profile} />
            <WorkSection />
            <AboutSection profile={profile} facts={facts} />
            <ResearchSection />
            <ContactSection links={contactLinks} />
          </>
        ) : (
          <section className="min-h-screen grid place-items-center px-6">
            <p className="mono-label" role={profileError ? "alert" : "status"}>
              {profileLoading ? "Loading portfolio content..." : "Portfolio content could not be loaded."}
            </p>
          </section>
        )}
      </main>
      {profile && <Footer profile={profile} />}
    </>
  );
}
