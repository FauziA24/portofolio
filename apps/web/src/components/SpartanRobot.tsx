import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { RobotInput } from "./HeroScene";
import RobotBlaster, { type CombatPose } from "./RobotBlaster";

type V3 = [number, number, number];
type PartProps = {
  material: THREE.Material;
  position?: V3;
  rotation?: V3;
  scale?: V3;
};

// Beveled extrusions give the armor its hard-surface silhouette and edge highlights.
const outlines = {
  crown: [
    [-0.38, -0.04],
    [-0.4, 0.25],
    [-0.24, 0.44],
    [0.24, 0.44],
    [0.4, 0.25],
    [0.38, -0.04],
    [0.19, 0.03],
    [0, 0.07],
    [-0.19, 0.03],
  ],
  cheek: [
    [0.14, -0.14],
    [0.38, -0.08],
    [0.4, -0.23],
    [0.26, -0.46],
    [0.11, -0.39],
  ],
  brow: [
    [0.025, 0.05],
    [0.36, 0.025],
    [0.4, -0.04],
    [0.15, -0.025],
    [0.025, -0.02],
  ],
  nose: [
    [-0.06, 0.045],
    [0.06, 0.045],
    [0.075, -0.23],
    [0, -0.36],
    [-0.075, -0.23],
  ],
  chest: [
    [0.065, 0.3],
    [0.41, 0.36],
    [0.63, 0.2],
    [0.54, -0.08],
    [0.2, -0.23],
    [0.055, -0.08],
  ],
  shoulder: [
    [-0.26, 0.14],
    [-0.16, 0.32],
    [0.17, 0.28],
    [0.35, 0.08],
    [0.32, -0.25],
    [0.12, -0.33],
    [-0.23, -0.17],
  ],
  abdomen: [
    [-0.3, 0.08],
    [0.3, 0.08],
    [0.27, -0.055],
    [0, -0.12],
    [-0.27, -0.055],
  ],
  forearm: [
    [-0.16, 0.27],
    [0.15, 0.3],
    [0.19, -0.14],
    [0.09, -0.29],
    [-0.13, -0.25],
  ],
} satisfies Record<string, number[][]>;

function Plate({
  shape,
  depth = 0.08,
  ...props
}: PartProps & { shape: keyof typeof outlines; depth?: number }) {
  const geometry = useMemo(() => {
    const path = new THREE.Shape(
      outlines[shape].map(([x, y]) => new THREE.Vector2(x, y)),
    );
    return new THREE.ExtrudeGeometry(path, {
      depth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.018,
      bevelThickness: 0.018,
      curveSegments: 1,
    });
  }, [shape, depth]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} castShadow receiveShadow {...props} />;
}

function Block({ size, ...props }: PartProps & { size: V3 }) {
  const [x, y, z] = size;
  const geometry = useMemo(
    () => new RoundedBoxGeometry(x, y, z, 2, Math.min(x, y, z) * 0.15),
    [x, y, z],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} castShadow receiveShadow {...props} />;
}

function Joint({
  radius,
  length,
  ...props
}: PartProps & { radius: number; length: number }) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <cylinderGeometry args={[radius, radius, length, 16]} />
    </mesh>
  );
}

export default function SpartanRobot({
  input,
  color,
  reduced,
}: {
  input: RefObject<RobotInput>;
  color: string;
  reduced: boolean;
}) {
  const rig = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const rightShoulder = useRef<THREE.Group>(null);
  const leftShoulder = useRef<THREE.Group>(null);
  const rightElbow = useRef<THREE.Group>(null);
  const leftElbow = useRef<THREE.Group>(null);
  const pose = useRef<CombatPose>({ aim: 0, recoil: 0, firing: false });
  const eyeBase = useMemo(() => new THREE.Color(color), [color]);
  const eyeRed = useMemo(() => new THREE.Color("#ff2424"), []);
  const grain = useMemo(() => {
    const data = new Uint8Array(64 * 64 * 4);
    let seed = 24;
    for (let i = 0; i < data.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const value = 230 + (seed % 20);
      data[i] = data[i + 1] = data[i + 2] = value;
      data[i + 3] = 255;
    }
    const texture = new THREE.DataTexture(data, 64, 64);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);
  useEffect(() => () => grain.dispose(), [grain]);
  const mats = useMemo(
    () => ({
      armor: new THREE.MeshStandardMaterial({
        color: "#424d49",
        metalness: 0.8,
        roughness: 0.42,
        roughnessMap: grain,
        bumpMap: grain,
        bumpScale: 0.0002,
      }),
      ceramic: new THREE.MeshStandardMaterial({
        color: "#89958d",
        metalness: 0.7,
        roughness: 0.38,
        roughnessMap: grain,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: "#171c1d",
        metalness: 0.6,
        roughness: 0.4,
      }),
      steel: new THREE.MeshStandardMaterial({
        color: "#87979b",
        metalness: 0.95,
        roughness: 0.22,
      }),
      bronze: new THREE.MeshStandardMaterial({
        color: "#9b8057",
        metalness: 0.85,
        roughness: 0.3,
      }),
      visor: new THREE.MeshPhysicalMaterial({
        color: "#101b1b",
        metalness: 0.8,
        roughness: 0.13,
        clearcoat: 1,
      }),
      signal: new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 2.2,
        toneMapped: false,
      }),
      eyes: new THREE.MeshStandardMaterial({
        name: "robot-eyes",
        color,
        emissive: color,
        emissiveIntensity: 1.4,
        toneMapped: false,
      }),
    }),
    [color, grain],
  );
  useEffect(
    () => () => Object.values(mats).forEach((material) => material.dispose()),
    [mats],
  );

  useFrame(({ clock }, delta) => {
    if (!rig.current || !head.current) return;
    const { aim, recoil, firing } = pose.current;
    mats.eyes.color.copy(!reduced && firing ? eyeRed : eyeBase);
    mats.eyes.emissive.copy(mats.eyes.color);
    mats.eyes.emissiveIntensity = !reduced && firing ? 2 : 1.4;
    const breathe = reduced ? 0 : Math.sin(clock.elapsedTime * 1.3) * 0.02;
    if (
      rightShoulder.current &&
      leftShoulder.current &&
      rightElbow.current &&
      leftElbow.current
    ) {
      const blend = reduced ? 1 : 1 - Math.exp(-delta * 9);
      rightShoulder.current.rotation.x = THREE.MathUtils.lerp(
        rightShoulder.current.rotation.x,
        -0.16 - aim * 0.58 + recoil * 0.2 + breathe,
        blend,
      );
      rightShoulder.current.rotation.y = THREE.MathUtils.lerp(
        rightShoulder.current.rotation.y,
        input.current.x * aim * 0.45,
        blend,
      );
      rightShoulder.current.rotation.z = THREE.MathUtils.lerp(
        rightShoulder.current.rotation.z,
        0.12 - aim * 0.16,
        blend,
      );
      rightElbow.current.rotation.x = THREE.MathUtils.lerp(
        rightElbow.current.rotation.x,
        -0.62 - aim * 0.35 - recoil * 0.35 + input.current.y * aim * 0.3,
        blend,
      );
      leftShoulder.current.rotation.x = THREE.MathUtils.lerp(
        leftShoulder.current.rotation.x,
        -0.12 - aim * 0.12 - breathe,
        blend,
      );
      leftElbow.current.rotation.x = THREE.MathUtils.lerp(
        leftElbow.current.rotation.x,
        -0.48 - aim * 0.18,
        blend,
      );
    }
    if (reduced) {
      rig.current.rotation.set(-0.015, -0.24, 0);
      rig.current.position.y = 0;
      head.current.rotation.set(0, 0, 0);
      return;
    }
    const p = reduced
      ? 0
      : THREE.MathUtils.smoothstep(input.current.progress, 0, 1);
    const x = reduced ? 0 : input.current.x;
    const y = reduced ? 0 : input.current.y;
    rig.current.rotation.y = THREE.MathUtils.damp(
      rig.current.rotation.y,
      -0.24 + x * 0.12 + p * 0.85,
      4,
      delta,
    );
    rig.current.rotation.x = THREE.MathUtils.damp(
      rig.current.rotation.x,
      -0.015 + y * 0.025 - p * 0.08 + recoil * 0.045,
      4,
      delta,
    );
    rig.current.position.y = reduced
      ? 0
      : Math.sin(clock.elapsedTime * 0.9) * 0.018;
    head.current.rotation.y = THREE.MathUtils.damp(
      head.current.rotation.y,
      x * 0.2,
      5,
      delta,
    );
    head.current.rotation.x = THREE.MathUtils.damp(
      head.current.rotation.x,
      y * 0.09,
      5,
      delta,
    );
  }, -1);

  return (
    <group ref={rig} rotation={[0, -0.24, 0]}>
      {/* Recessed T visor, split cheek guards, and a reinforced helmet crest. */}
      <group ref={head} position={[0, 0.93, 0.025]}>
        <Block
          size={[0.72, 0.66, 0.64]}
          position={[0, 0.035, -0.035]}
          material={mats.dark}
        />
        <Plate
          shape="crown"
          position={[0, 0.015, 0.05]}
          depth={0.3}
          material={mats.armor}
        />
        <Plate
          shape="crown"
          position={[0, 0.065, 0.365]}
          scale={[0.81, 0.71, 0.32]}
          depth={0.07}
          material={mats.armor}
        />
        <Block
          size={[0.04, 0.18, 0.024]}
          position={[0, 0.29, 0.414]}
          material={mats.bronze}
        />
        <Block
          size={[0.66, 0.2, 0.075]}
          position={[0, -0.055, 0.35]}
          material={mats.visor}
        />
        <Block
          size={[0.2, 0.36, 0.07]}
          position={[0, -0.24, 0.32]}
          material={mats.visor}
        />
        <Plate
          shape="nose"
          position={[0, -0.025, 0.42]}
          depth={0.025}
          material={mats.bronze}
        />
        <Block
          size={[0.075, 0.29, 0.58]}
          position={[0, 0.415, -0.015]}
          material={mats.dark}
        />
        <Block
          size={[0.048, 0.16, 0.65]}
          position={[0, 0.51, -0.025]}
          rotation={[-0.06, 0, 0]}
          material={mats.ceramic}
        />
        <Block
          size={[0.018, 0.024, 0.47]}
          position={[0, 0.595, -0.015]}
          material={mats.bronze}
        />
        <Block
          size={[0.24, 0.08, 0.18]}
          position={[0, -0.43, 0.19]}
          material={mats.steel}
        />
        {[-1, 1].map((side) => (
          <group key={side} scale={[side, 1, 1]}>
            <Plate
              shape="cheek"
              position={[0, -0.015, 0.32]}
              rotation={[0, 0.12, 0]}
              depth={0.12}
              material={mats.ceramic}
            />
            <Plate
              shape="brow"
              position={[0, 0, 0.405]}
              material={mats.armor}
            />
            <Block
              size={[0.215, 0.022, 0.022]}
              position={[0.215, -0.075, 0.398]}
              rotation={[0, 0, -0.1]}
              material={mats.eyes}
            />
            <Joint
              radius={0.17}
              length={0.07}
              rotation={[0, 0, Math.PI / 2]}
              position={[0.408, -0.055, -0.035]}
              material={mats.dark}
            />
            <Joint
              radius={0.115}
              length={0.086}
              rotation={[0, 0, Math.PI / 2]}
              position={[0.42, -0.055, -0.035]}
              material={mats.steel}
            />
            <Joint
              radius={0.059}
              length={0.094}
              rotation={[0, 0, Math.PI / 2]}
              position={[0.43, -0.055, -0.035]}
              material={mats.bronze}
            />
            {[0, 1, 2].map((i) => (
              <Block
                key={i}
                size={[0.1, 0.018, 0.015]}
                position={[0.27, -0.22 - i * 0.047, 0.473]}
                rotation={[0, 0, 0.23]}
                material={mats.dark}
              />
            ))}
            <Joint
              radius={0.022}
              length={0.015}
              position={[0.31, 0.26, 0.375]}
              rotation={[Math.PI / 2, 0, 0]}
              material={mats.steel}
            />
          </group>
        ))}
      </group>

      <Joint
        radius={0.15}
        length={0.26}
        position={[0, 0.46, 0]}
        material={mats.dark}
      />
      {[0, 1, 2].map((i) => (
        <Joint
          key={i}
          radius={0.17}
          length={0.025}
          position={[0, 0.37 + i * 0.065, 0]}
          material={mats.steel}
        />
      ))}
      <Block
        size={[0.88, 0.91, 0.5]}
        position={[0, -0.12, -0.085]}
        material={mats.dark}
      />
      <Block
        size={[0.7, 0.66, 0.2]}
        position={[0, 0, -0.39]}
        material={mats.armor}
      />
      <Block
        size={[0.18, 0.65, 0.08]}
        position={[0, -0.04, -0.52]}
        material={mats.steel}
      />

      {[-1, 1].map((side) => (
        <group key={side} scale={[side, 1, 1]}>
          <Joint
            radius={0.035}
            length={0.28}
            position={[0.21, 0.37, 0.06]}
            rotation={[0, 0, -0.32]}
            material={mats.steel}
          />
          <Block
            size={[0.48, 0.1, 0.25]}
            position={[0.35, 0.32, -0.025]}
            rotation={[0, 0, -0.15]}
            material={mats.ceramic}
          />
          <Plate
            shape="chest"
            position={[0, -0.055, 0.2]}
            rotation={[0, 0.09, 0]}
            depth={0.15}
            material={mats.armor}
          />
          <Plate
            shape="chest"
            position={[0.057, -0.01, 0.38]}
            scale={[0.76, 0.59, 0.4]}
            rotation={[0, 0.09, 0]}
            material={mats.ceramic}
          />
          <Block
            size={[0.2, 0.026, 0.02]}
            position={[0.3, 0.235, 0.445]}
            rotation={[0, 0, 0.13]}
            material={mats.bronze}
          />
          {[0, 1, 2, 3].map((i) => (
            <Block
              key={i}
              size={[0.24, 0.035, 0.18]}
              position={[0.39, -0.31 - i * 0.07, 0.02]}
              rotation={[0, 0, -0.2]}
              material={mats.steel}
            />
          ))}
          <Joint
            radius={0.02}
            length={0.018}
            position={[0.46, 0.085, 0.408]}
            rotation={[Math.PI / 2, 0, 0]}
            material={mats.bronze}
          />

          <group
            ref={side === 1 ? rightShoulder : leftShoulder}
            name={side === 1 ? "robot-right-shoulder" : "robot-left-shoulder"}
            position={[0.71, 0.14, -0.055]}
            rotation={[-0.16, 0, 0.1]}
          >
            <Joint
              radius={0.21}
              length={0.28}
              rotation={[0, 0, Math.PI / 2]}
              material={mats.dark}
            />
            <Plate
              shape="shoulder"
              position={[0.06, 0.04, 0.045]}
              depth={0.3}
              material={mats.armor}
            />
            <Plate
              shape="shoulder"
              position={[0.08, 0.09, 0.36]}
              scale={[0.8, 0.7, 0.4]}
              material={mats.ceramic}
            />
            <Block
              size={[0.15, 0.035, 0.025]}
              position={[0.13, 0.19, 0.43]}
              rotation={[0, 0, -0.16]}
              material={mats.bronze}
            />
            {[0, 1, 2].map((i) => (
              <Block
                key={i}
                size={[0.1, 0.025, 0.024]}
                position={[0.15, -0.02 - i * 0.044, 0.42]}
                material={mats.dark}
              />
            ))}
            <Block
              size={[0.23, 0.45, 0.24]}
              position={[0.12, -0.4, -0.005]}
              material={mats.dark}
            />
            <Block
              size={[0.18, 0.31, 0.14]}
              position={[0.12, -0.38, 0.18]}
              rotation={[0.05, 0, -0.07]}
              material={mats.armor}
            />
            <Joint
              radius={0.026}
              length={0.35}
              position={[0.27, -0.38, 0.045]}
              material={mats.steel}
            />
            <Joint
              radius={0.045}
              length={0.15}
              position={[0.27, -0.47, 0.045]}
              material={mats.dark}
            />
            <Joint
              radius={0.13}
              length={0.29}
              position={[0.12, -0.64, 0.02]}
              rotation={[0, 0, Math.PI / 2]}
              material={mats.steel}
            />
            <Joint
              radius={0.075}
              length={0.31}
              position={[0.12, -0.64, 0.02]}
              rotation={[0, 0, Math.PI / 2]}
              material={mats.dark}
            />
            <group
              ref={side === 1 ? rightElbow : leftElbow}
              name={side === 1 ? "robot-right-elbow" : "robot-left-elbow"}
              position={[0.12, -0.64, 0.02]}
              rotation={[-0.62, 0, -0.1]}
            >
              <group position={[0.01, -0.27, 0.09]}>
                {side === 1 && (
                  <RobotBlaster
                    input={input}
                    color={color}
                    reduced={reduced}
                    pose={pose}
                  />
                )}
                <Block size={[0.23, 0.48, 0.25]} material={mats.dark} />
                <Plate
                  shape="forearm"
                  position={[0, 0, 0.12]}
                  depth={0.1}
                  material={mats.armor}
                />
                <Block
                  size={[0.038, 0.22, 0.02]}
                  position={[0, 0.03, 0.24]}
                  material={mats.ceramic}
                />
                <Block
                  size={[0.025, 0.07, 0.025]}
                  position={[0, 0.14, 0.256]}
                  material={mats.signal}
                />
                <Joint
                  radius={0.09}
                  length={0.1}
                  position={[0, -0.32, 0]}
                  material={mats.steel}
                />
                <Block
                  size={[0.22, 0.17, 0.16]}
                  position={[0, -0.43, 0.015]}
                  material={mats.dark}
                />
                {[0, 1, 2, 3].map((i) => (
                  <Block
                    key={i}
                    size={[0.042, 0.095, 0.09]}
                    position={[-0.078 + i * 0.052, -0.46, 0.1]}
                    material={mats.ceramic}
                  />
                ))}
              </group>
            </group>
          </group>
        </group>
      ))}

      <Block
        size={[0.095, 0.24, 0.075]}
        position={[0, 0.04, 0.39]}
        material={mats.dark}
      />
      {[0, 1, 2].map((i) => (
        <Block
          key={i}
          size={[0.039, 0.014, 0.025]}
          position={[0, 0.1 - i * 0.055, 0.438]}
          material={mats.signal}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <Plate
          key={i}
          shape="abdomen"
          position={[0, -0.4 - i * 0.165, 0.19 - i * 0.025]}
          depth={0.085}
          material={i === 1 ? mats.ceramic : mats.armor}
        />
      ))}
      <Block
        size={[0.67, 0.16, 0.37]}
        position={[0, -0.97, -0.055]}
        material={mats.dark}
      />
      <Block
        size={[0.2, 0.13, 0.08]}
        position={[0, -0.97, 0.18]}
        material={mats.bronze}
      />
    </group>
  );
}
