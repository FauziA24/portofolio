import { useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import SpartanRobot from "./SpartanRobot";

export type RobotInput = { x: number; y: number; progress: number };

function SceneContents({ input, color, reduced }: { input: RefObject<RobotInput>; color: string; reduced: boolean }) {
  const { gl, scene, camera, size, invalidate } = useThree();
  useEffect(() => {
    camera.position.z = Math.max(5.15, 3.55 / (size.width / size.height));
    camera.lookAt(0, 0.16, 0);
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(gl);
    const target = generator.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.55;
    room.dispose();
    generator.dispose();
    return () => { scene.environment = null; target.dispose(); };
  }, [gl, scene]);

  useFrame((_, delta) => {
    const progress = reduced ? 0 : THREE.MathUtils.smoothstep(input.current.progress, 0, 1);
    // Fit both shoulders and crest at every canvas aspect ratio.
    const distance = Math.max(5.15, 3.55 / (size.width / size.height));
    camera.position.z = reduced ? distance : THREE.MathUtils.damp(camera.position.z, distance - progress * 0.35, 5, delta);
    camera.position.y = 0.25 + progress * 0.25;
    camera.lookAt(0, 0.16, 0);
  });

  return <>
    <hemisphereLight args={["#e8eef5", "#333b37", 0.6]} />
    <directionalLight position={[-3, 4, 5]} intensity={3} color="#f4f5f1" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-2} shadow-camera-right={2} shadow-camera-top={2} shadow-camera-bottom={-2} shadow-normalBias={0.015} />
    <directionalLight position={[3, 1, -2]} intensity={3} color="#b8d1e2" />
    <directionalLight position={[0, -2, 3]} intensity={0.5} color="#c3b39c" />
    <SpartanRobot input={input} color={color} reduced={reduced} />
  </>;
}

export default function HeroScene({ scrollProgress }: { scrollProgress?: MotionValue<number> }) {
  const input = useRef<RobotInput>({ x: 0, y: 0, progress: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [color, setColor] = useState("#B9F227");
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!scrollProgress) return;
    const update = (progress: number) => {
      input.current.progress = progress;
    };
    update(scrollProgress.get());
    return scrollProgress.on("change", update);
  }, [scrollProgress]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Resume before entering the viewport without recreating the WebGL scene.
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "300px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setColor(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#B9F227");
    const move = (event: PointerEvent) => {
      input.current.x = event.clientX / window.innerWidth * 2 - 1;
      input.current.y = event.clientY / window.innerHeight * 2 - 1;
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return <div ref={containerRef} className="hero-scene-3d absolute pointer-events-none" aria-hidden>
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.25, 5.5], fov: 38, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={reduced || !inView ? "demand" : "always"}
    >
      <SceneContents input={input} color={color} reduced={reduced} />
    </Canvas>
  </div>;
}
