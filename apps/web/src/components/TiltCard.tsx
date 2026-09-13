import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useRef } from "react";

export default function TiltCard({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scrollY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [18, -18],
  );
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(y, [-0.5, 0.5], reduced ? [0, 0] : [7, -7]),
    { stiffness: 220, damping: 24 },
  );
  const rotateY = useSpring(
    useTransform(x, [-0.5, 0.5], reduced ? [0, 0] : [-7, 7]),
    { stiffness: 220, damping: 24 },
  );
  return (
    <motion.div
      ref={ref}
      className="tilt-card"
      style={{ rotateX, rotateY, y: scrollY, transformPerspective: 900 }}
      onPointerMove={(event) => {
        if (reduced) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left) / rect.width - 0.5);
        y.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
