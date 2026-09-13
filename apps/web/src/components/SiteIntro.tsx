import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "mfa-gate-intro-seen";

export default function SiteIntro() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) !== "true",
  );
  const [progress, setProgress] = useState(0);
  const [opening, setOpening] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    const focus = document.activeElement as HTMLElement | null;
    const siblings = Array.from(root.current?.parentElement?.children ?? [])
      .filter(
        (el): el is HTMLElement =>
          el instanceof HTMLElement && el !== root.current,
      )
      .map((el) => ({ el, inert: el.inert }));
    siblings.forEach(({ el }) => {
      el.inert = true;
    });
    document.body.style.overflow = "hidden";
    root.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previous;
      siblings.forEach(({ el, inert }) => {
        el.inert = inert;
      });
      if (focus && focus !== document.body && focus.isConnected)
        focus.focus({ preventScroll: true });
      else
        document.getElementById("main-content")?.focus({ preventScroll: true });
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const value = Math.min(
        100,
        Math.floor((elapsed / (reduced ? 600 : 2600)) * 100),
      );
      setProgress(value);
      if (value < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [visible, reduced]);

  useEffect(() => {
    if (progress !== 100 || !visible) return;
    const timer = window.setTimeout(
      () => setOpening(true),
      reduced ? 120 : 380,
    );
    return () => window.clearTimeout(timer);
  }, [progress, visible, reduced]);

  const finish = () => {
    if (!opening) return;
    sessionStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={root}
      tabIndex={-1}
      className={`site-intro${opening ? " is-opening" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Opening portfolio"
      aria-busy={progress < 100}
    >
      {[-1, 1].map((side) => (
        <motion.div
          key={side}
          className={`gate-door gate-door--${side === -1 ? "left" : "right"}`}
          initial={false}
          animate={
            reduced
              ? { opacity: opening ? 0 : 1 }
              : { x: opening ? `${side * 101}%` : "0%" }
          }
          transition={{
            duration: reduced ? 0.18 : 1.25,
            ease: [0.76, 0, 0.24, 1],
          }}
          onAnimationComplete={side === -1 ? finish : undefined}
          aria-hidden="true"
        >
          <div className="gate-armor" />
          <div className="gate-ribs">
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} />
            ))}
          </div>
          <div className="gate-piston" />
          <div className="gate-seam" />
          <span className="gate-serial">
            {side === -1 ? "MFA / 01" : "SPARTAN / 02"}
          </span>
          <div className="gate-bolts">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} />
            ))}
          </div>
        </motion.div>
      ))}

      <div className="gate-interface">
        <div className="gate-header">
          <span>MOHAMMAD FAUZI AZIZ</span>
          <span>PORTFOLIO / 2026</span>
        </div>
        <div className="gate-center">
          <div className="gate-lock" aria-hidden="true">
            <svg viewBox="0 0 120 140" fill="none">
              <path
                d="M60 8 98 27 105 68 88 114 68 128 67 77 91 68 89 54 64 61 60 43 56 61 31 54 29 68 53 77 52 128 32 114 15 68 22 27Z"
                fill="#89958d"
                stroke="#c0cac1"
                strokeWidth="1.5"
              />
              <path
                d="m60 8 0 35M22 27l34 10M98 27 64 37"
                stroke="#39433c"
                strokeWidth="3"
              />
              <path
                d="m31 64 21 7M89 64l-21 7"
                stroke="#b9f227"
                strokeWidth="4"
              />
              <path d="m60 52 4 26-4 39-4-39Z" fill="#9b8057" />
            </svg>
          </div>
          <p className="gate-status" role="status">
            {progress === 100 ? "ACCESS GRANTED" : "INITIALIZING"}
          </p>
          <div
            className="gate-progress"
            role="progressbar"
            aria-label="Portfolio startup"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span className="gate-number">
              {String(progress).padStart(2, "0")}
              <small>%</small>
            </span>
            <div className="gate-track">
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          </div>
        </div>
        <div className="gate-footer">
          <span>BACKEND / WEB / AI</span>
          <span className="gate-state">
            <i />
            {progress === 100 ? "UNLOCKED" : "STANDBY"}
          </span>
        </div>
      </div>
    </div>
  );
}
