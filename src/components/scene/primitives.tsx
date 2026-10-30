import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../types/island';

/**
 * Low-poly 共用幾何元件
 * 所有建築與裝飾都由這些簡單幾何組成，保持微縮模型風格與效能。
 */

interface MatProps {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  metalness?: number;
  roughness?: number;
}

interface Placement {
  position?: Vec3;
  rotation?: Vec3;
  scale?: number | Vec3;
  castShadow?: boolean;
}

function Mat({ color, emissive, emissiveIntensity = 0, opacity, metalness = 0, roughness = 0.85 }: MatProps) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissiveIntensity}
      flatShading
      metalness={metalness}
      roughness={roughness}
      transparent={opacity !== undefined}
      opacity={opacity ?? 1}
    />
  );
}

export function Box({ size = [1, 1, 1], castShadow = true, ...p }: Placement & MatProps & { size?: Vec3 }) {
  return (
    <mesh position={p.position} rotation={p.rotation} scale={p.scale} castShadow={castShadow} receiveShadow>
      <boxGeometry args={size} />
      <Mat {...p} />
    </mesh>
  );
}

export function Cyl({
  args = [0.5, 0.5, 1, 8],
  thetaLength,
  castShadow = true,
  ...p
}: Placement & MatProps & { args?: [number, number, number, number]; thetaLength?: number }) {
  return (
    <mesh position={p.position} rotation={p.rotation} scale={p.scale} castShadow={castShadow} receiveShadow>
      <cylinderGeometry args={[...args, 1, false, 0, thetaLength ?? Math.PI * 2]} />
      <Mat {...p} />
    </mesh>
  );
}

export function Cone({ r = 0.5, h = 1, seg = 6, ...p }: Placement & MatProps & { r?: number; h?: number; seg?: number }) {
  return (
    <mesh position={p.position} rotation={p.rotation} scale={p.scale} castShadow receiveShadow>
      <coneGeometry args={[r, h, seg]} />
      <Mat {...p} />
    </mesh>
  );
}

export function Ball({ r = 0.5, detail = 0, ...p }: Placement & MatProps & { r?: number; detail?: number }) {
  return (
    <mesh position={p.position} rotation={p.rotation} scale={p.scale} castShadow receiveShadow>
      <icosahedronGeometry args={[r, detail]} />
      <Mat {...p} />
    </mesh>
  );
}

export function Torus({
  r = 0.5,
  tube = 0.1,
  arc = Math.PI * 2,
  ...p
}: Placement & MatProps & { r?: number; tube?: number; arc?: number }) {
  return (
    <mesh position={p.position} rotation={p.rotation} scale={p.scale} castShadow>
      <torusGeometry args={[r, tube, 6, 16, arc]} />
      <Mat {...p} />
    </mesh>
  );
}

/* ---------------- 通用裝飾 ---------------- */

export function Tree({ position, scale = 1, color = '#4fa36b' }: { position: Vec3; scale?: number; color?: string }) {
  return (
    <group position={position} scale={scale}>
      <Cyl args={[0.12, 0.16, 0.6, 5]} position={[0, 0.3, 0]} color="#8b5e3c" />
      <Cone r={0.65} h={1.1} seg={6} position={[0, 1.05, 0]} color={color} />
      <Cone r={0.48} h={0.85} seg={6} position={[0, 1.6, 0]} color={color} />
    </group>
  );
}

export function RoundTree({ position, scale = 1, color = '#5cb870' }: { position: Vec3; scale?: number; color?: string }) {
  return (
    <group position={position} scale={scale}>
      <Cyl args={[0.1, 0.14, 0.7, 5]} position={[0, 0.35, 0]} color="#8b5e3c" />
      <Ball r={0.6} position={[0, 1.1, 0]} color={color} />
    </group>
  );
}

export function Bush({ position, scale = 1, color = '#62b874' }: { position: Vec3; scale?: number; color?: string }) {
  return (
    <group position={position} scale={scale}>
      <Ball r={0.35} position={[0, 0.25, 0]} color={color} />
      <Ball r={0.25} position={[0.3, 0.18, 0.1]} color={color} />
    </group>
  );
}

export function Lamp({ position, color = '#fde68a' }: { position: Vec3; color?: string }) {
  return (
    <group position={position}>
      <Cyl args={[0.05, 0.07, 1.4, 6]} position={[0, 0.7, 0]} color="#475569" />
      <Ball r={0.16} position={[0, 1.48, 0]} color={color} emissive={color} emissiveIntensity={0.8} />
    </group>
  );
}

export function Bench({ position, rotation, color = '#c08457' }: { position: Vec3; rotation?: Vec3; color?: string }) {
  return (
    <group position={position} rotation={rotation}>
      <Box size={[1, 0.08, 0.35]} position={[0, 0.35, 0]} color={color} />
      <Box size={[1, 0.3, 0.06]} position={[0, 0.52, -0.15]} color={color} />
      <Box size={[0.06, 0.35, 0.3]} position={[-0.42, 0.17, 0]} color="#64748b" />
      <Box size={[0.06, 0.35, 0.3]} position={[0.42, 0.17, 0]} color="#64748b" />
    </group>
  );
}

/** 平鋪步道（由起點到終點的平板） */
export function Path({ from, to, width = 0.7, color = '#f1e4c8' }: { from: [number, number]; to: [number, number]; width?: number; color?: string }) {
  const [x1, z1] = from;
  const [x2, z2] = to;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const angle = Math.atan2(x2 - x1, z2 - z1);
  return (
    <Box
      size={[width, 0.06, len]}
      position={[(x1 + x2) / 2, 0.03, (z1 + z2) / 2]}
      rotation={[0, angle, 0]}
      color={color}
      castShadow={false}
    />
  );
}

/** 醫療十字 */
export function MedCross({ position, rotation, size = 1, color = '#ef4444', glow = 0.3 }: { position: Vec3; rotation?: Vec3; size?: number; color?: string; glow?: number }) {
  return (
    <group position={position} rotation={rotation} scale={size}>
      <Box size={[0.3, 1, 0.15]} color={color} emissive={color} emissiveIntensity={glow} />
      <Box size={[1, 0.3, 0.15]} color={color} emissive={color} emissiveIntensity={glow} />
    </group>
  );
}

/** 愛心造型 */
export function Heart({ position, rotation, size = 1, color = '#fb7185', glow = 0.25 }: { position: Vec3; rotation?: Vec3; size?: number; color?: string; glow?: number }) {
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(25, 25);
    s.bezierCurveTo(25, 25, 20, 0, 0, 0);
    s.bezierCurveTo(-30, 0, -30, 35, -30, 35);
    s.bezierCurveTo(-30, 55, -10, 77, 25, 95);
    s.bezierCurveTo(60, 77, 80, 55, 80, 35);
    s.bezierCurveTo(80, 35, 80, 0, 50, 0);
    s.bezierCurveTo(35, 0, 25, 25, 25, 25);
    const g = new THREE.ExtrudeGeometry(s, { depth: 18, bevelEnabled: true, bevelSize: 4, bevelThickness: 4, bevelSegments: 1, curveSegments: 6 });
    g.center();
    g.rotateZ(Math.PI);
    g.scale(0.01, 0.01, 0.01);
    return g;
  }, []);
  return (
    <mesh geometry={geometry} position={position} rotation={rotation} scale={size} castShadow>
      <Mat color={color} emissive={color} emissiveIntensity={glow} roughness={0.6} />
    </mesh>
  );
}

/** 對話氣泡 */
export function SpeechBubble({ position, color = '#ffffff', dots = '#3b82f6', scale = 1 }: { position: Vec3; color?: string; dots?: string; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Ball r={0.55} detail={1} scale={[1.3, 0.85, 0.6]} color={color} />
      <Cone r={0.18} h={0.4} seg={4} position={[-0.35, -0.5, 0]} rotation={[0, 0, 0.6 + Math.PI]} color={color} />
      {[-0.28, 0, 0.28].map((x) => (
        <Ball key={x} r={0.08} position={[x, 0, 0.33]} color={dots} />
      ))}
    </group>
  );
}

/** 問號造型 */
export function QuestionMark({ position, color = '#3b82f6', scale = 1 }: { position: Vec3; color?: string; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Torus r={0.3} tube={0.09} arc={Math.PI * 1.5} position={[0, 0.55, 0]} rotation={[0, 0, -Math.PI / 2]} color={color} />
      <Cyl args={[0.09, 0.09, 0.25, 6]} position={[0, 0.15, 0]} color={color} />
      <Ball r={0.11} position={[0, -0.15, 0]} color={color} />
    </group>
  );
}

/** 緩慢上下浮動的群組 */
export function Bob({ children, speed = 1.2, amp = 0.15, phase = 0, spin = 0 }: { children: React.ReactNode; speed?: number; amp?: number; phase?: number; spin?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = Math.sin(t * speed + phase) * amp;
    if (spin) ref.current.rotation.y = t * spin;
  });
  return <group ref={ref}>{children}</group>;
}

/** 閃爍燈號（emissive 脈動） */
export function BlinkLight({ position, color = '#f97316', r = 0.18, speed = 3, phase = 0 }: { position: Vec3; color?: string; r?: number; speed?: number; phase?: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.emissiveIntensity = 0.4 + (Math.sin(clock.getElapsedTime() * speed + phase) * 0.5 + 0.5) * 1.4;
  });
  return (
    <mesh position={position}>
      <icosahedronGeometry args={[r, 1]} />
      <meshStandardMaterial ref={mat} color={color} emissive={color} flatShading />
    </mesh>
  );
}

/** 人字形屋頂：width 沿 X、depth 沿 Z、height 為屋脊高度；底面位於 position.y */
export function GableRoof({ width, depth, height, position, rotation, color }: { width: number; depth: number; height: number; position: Vec3; rotation?: Vec3; color: string }) {
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-depth / 2, 0);
    s.lineTo(depth / 2, 0);
    s.lineTo(0, height);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: false });
    g.translate(0, 0, -width / 2);
    g.rotateY(Math.PI / 2);
    return g;
  }, [width, depth, height]);
  return (
    <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
      <Mat color={color} />
    </mesh>
  );
}

/** 決策節點（八面體） */
export function Diamond({ position, r = 0.35, color, glow = 0.6 }: { position: Vec3; r?: number; color: string; glow?: number }) {
  return (
    <mesh position={position} castShadow>
      <octahedronGeometry args={[r, 0]} />
      <Mat color={color} emissive={color} emissiveIntensity={glow} roughness={0.4} />
    </mesh>
  );
}
