import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { Ball, Box, Cyl } from './primitives';
import { WATER_LEVEL } from './Ocean';
import { useTimeOfDay } from './timeOfDay';

/** Low Poly 雲朵 */
function Cloud({ position, scale = 1, speed = 0.3 }: { position: [number, number, number]; scale?: number; speed?: number }) {
  const ref = useRef<Group>(null);
  // 夜晚的雲帶一點月光，避免變成黑色剪影
  const glow = useTimeOfDay() === 'night' ? { emissive: '#8ea2d6', emissiveIntensity: 0.85 } : {};
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * speed * 0.1) * 6;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <Ball r={1.4} detail={0} color="#ffffff" {...glow} />
      <Ball r={1.1} detail={0} position={[1.5, -0.2, 0.2]} color="#f8fafc" {...glow} />
      <Ball r={0.95} detail={0} position={[-1.4, -0.3, -0.1]} color="#f8fafc" {...glow} />
    </group>
  );
}

/** 繞行的小船 */
function Boat({ radius, speed, phase, color }: { radius: number; speed: number; phase: number; color: string }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const a = clock.getElapsedTime() * speed + phase;
    ref.current.position.set(Math.cos(a) * radius, WATER_LEVEL + Math.sin(a * 6) * 0.06, Math.sin(a) * radius);
    ref.current.rotation.y = -a;
    ref.current.rotation.z = Math.sin(a * 5) * 0.05;
  });
  return (
    <group ref={ref}>
      <Box size={[0.8, 0.35, 1.8]} position={[0, 0.1, 0]} color="#ffffff" />
      <Box size={[0.85, 0.12, 1.85]} position={[0, -0.05, 0]} color={color} />
      <Cyl args={[0.04, 0.04, 1.5, 5]} position={[0, 0.95, 0]} color="#78716c" />
      <mesh position={[0, 1, 0.3]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <coneGeometry args={[0.55, 1.2, 3]} />
        <meshStandardMaterial color="#fef3c7" flatShading />
      </mesh>
    </group>
  );
}

export function Ambience() {
  return (
    <group>
      <Cloud position={[-48, 16, -30]} scale={1.6} />
      <Cloud position={[44, 18, -38]} scale={1.3} speed={0.5} />
      <Cloud position={[52, 14, 22]} scale={1.1} />
      <Cloud position={[-55, 15, 18]} scale={1.4} speed={0.4} />
      <Cloud position={[0, 20, -62]} scale={1.8} />
      <Boat radius={38} speed={0.05} phase={0} color="#ef4444" />
      <Boat radius={34} speed={-0.04} phase={2.4} color="#3b82f6" />
    </group>
  );
}
