import { useMemo, useRef, type RefObject } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { RobotInput } from "./HeroScene";

export type CombatPose = { aim: number; recoil: number; firing: boolean };

export default function RobotBlaster({
  input,
  color,
  reduced,
  pose,
}: {
  input: RefObject<RobotInput>;
  color: string;
  reduced: boolean;
  pose: RefObject<CombatPose>;
}) {
  const { scene, camera, gl } = useThree();
  const gun = useRef<THREE.Group>(null);
  const muzzle = useRef<THREE.Mesh>(null);
  const bolt = useRef<THREE.Mesh>(null);
  const impact = useRef<THREE.Mesh>(null);
  const shot = useMemo(
    () => ({
      cooldown: 0,
      age: 1,
      start: new THREE.Vector3(),
      end: new THREE.Vector3(),
      target: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      pointer: new THREE.Vector2(),
      ray: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.7),
      forward: new THREE.Vector3(0, 0, 1),
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!gun.current || !muzzle.current || !bolt.current || !impact.current)
      return;
    const rect = gl.domElement.getBoundingClientRect();
    if (
      reduced ||
      document.hidden ||
      rect.bottom <= 0 ||
      rect.top >= window.innerHeight ||
      document.querySelector(".site-intro")
    ) {
      shot.cooldown = 0;
      shot.age = 1;
      pose.current.aim = pose.current.recoil = 0;
      pose.current.firing = false;
      muzzle.current.visible =
        bolt.current.visible =
        impact.current.visible =
          false;
      return;
    }
    // Map the last window pointer to the canvas, including its responsive offset.
    shot.pointer.set(
      ((((input.current.x + 1) * window.innerWidth) / 2 - rect.left) /
        rect.width) *
        2 -
        1,
      1 -
        ((((input.current.y + 1) * window.innerHeight) / 2 - rect.top) /
          rect.height) *
          2,
    );
    shot.ray.setFromCamera(shot.pointer, camera);
    if (!shot.ray.ray.intersectPlane(shot.plane, shot.target)) return;
    // Discard suspended-frame time instead of firing a backlog after a pause.
    const step = delta > 0.25 ? 0 : delta;
    shot.cooldown += step;
    shot.age += step;
    if (shot.cooldown >= 5) {
      shot.cooldown %= 5;
      shot.age = 0;
      muzzle.current.getWorldPosition(shot.start);
      shot.end.copy(shot.target);
      shot.direction.subVectors(shot.end, shot.start).normalize();
      bolt.current.quaternion.setFromUnitVectors(shot.forward, shot.direction);
    }
    pose.current.aim = Math.max(
      THREE.MathUtils.smoothstep(shot.cooldown, 4.1, 4.85),
      1 - THREE.MathUtils.smoothstep(shot.age, 0.3, 1),
    );
    pose.current.recoil =
      shot.age < 0.4
        ? Math.sin((Math.min(1, shot.age / 0.08) * Math.PI) / 2) *
          Math.exp(-shot.age * 10)
        : 0;
    pose.current.firing = shot.age < 0.65;
    const flight = 0.45;
    bolt.current.visible = shot.age < flight;
    bolt.current.position.lerpVectors(
      shot.start,
      shot.end,
      Math.min(1, shot.age / flight),
    );
    muzzle.current.visible = shot.age < 0.12;
    muzzle.current.scale.setScalar(1 + Math.max(0, 1 - shot.age / 0.12) * 1.4);
    impact.current.visible = shot.age >= flight && shot.age < flight + 0.25;
    impact.current.position.copy(shot.end);
    impact.current.quaternion.copy(camera.quaternion);
    impact.current.scale.setScalar(0.04 + Math.max(0, shot.age - flight) * 0.7);
    (impact.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
      0,
      1 - (shot.age - flight) / 0.25,
    );
  }, -2);

  return (
    <>
      <group
        ref={gun}
        position={[0, -0.12, 0.3]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.09]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.24, 12]} />
          <meshStandardMaterial
            color="#303b36"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0, 0.22]}>
          <torusGeometry args={[0.06, 0.012, 8, 16]} />
          <meshStandardMaterial
            color="#8d9991"
            metalness={0.9}
            roughness={0.22}
          />
        </mesh>
        <mesh ref={muzzle} position={[0, 0, 0.25]} visible={false}>
          <sphereGeometry args={[0.05, 12, 8]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      </group>
      {createPortal(
        <>
          <mesh
            ref={bolt}
            visible={false}
            scale={[0.025, 0.025, 0.18]}
            name="robot-bolt"
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
          <mesh ref={impact} visible={false} name="robot-impact">
            <ringGeometry args={[0.75, 1, 24]} />
            <meshBasicMaterial
              color={color}
              transparent
              depthWrite={false}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>,
        scene,
      )}
    </>
  );
}
