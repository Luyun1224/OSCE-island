import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Group } from 'three';
import { CENTRAL_PLAZA, ISLANDS } from '../../data/islandData';
import { Box, Cyl, MedCross } from './primitives';

/** 中央導航廣場：六角平台 + 方位盤 + 五色環繞光球 */
export function CentralPlaza({ onClick, showLabel }: { onClick: () => void; showLabel: boolean }) {
  const orbit = useRef<Group>(null);
  const beacon = useRef<Group>(null);
  const r = CENTRAL_PLAZA.radius;

  useFrame(({ clock }, dt) => {
    if (orbit.current) orbit.current.rotation.y += dt * 0.35;
    if (beacon.current) beacon.current.position.y = 4.4 + Math.sin(clock.getElapsedTime() * 1.4) * 0.2;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return;
    onClick();
  };

  return (
    <group position={CENTRAL_PLAZA.position} onClick={handleClick}>
      <Cyl args={[r + 0.6, r + 1, 1.2, 6]} position={[0, -0.7, 0]} color="#e2e8f0" />
      <Cyl args={[r, r + 0.3, 0.5, 6]} position={[0, 0.05, 0]} color="#f8fafc" />
      <Cyl args={[r * 0.7, r * 0.7, 0.06, 6]} position={[0, 0.33, 0]} color="#bae6fd" castShadow={false} />
      <Cyl args={[r * 0.45, r * 0.45, 0.08, 24]} position={[0, 0.36, 0]} color="#ffffff" castShadow={false} />
      {/* 方位指針 */}
      {[0, Math.PI / 2].map((a) => (
        <Box key={a} size={[0.12, 0.1, r * 1.3]} position={[0, 0.4, 0]} rotation={[0, a, 0]} color="#7dd3fc" castShadow={false} />
      ))}
      {/* 中央燈塔 */}
      <Cyl args={[0.35, 0.6, 3, 6]} position={[0, 1.8, 0]} color="#ffffff" />
      <Cyl args={[0.7, 0.7, 0.2, 6]} position={[0, 3.3, 0]} color="#0ea5e9" />
      <group ref={beacon}>
        <MedCross position={[0, 0, 0]} size={1.1} color="#ef4444" glow={0.6} />
        <MedCross position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} size={1.1} color="#ef4444" glow={0.6} />
      </group>
      {/* 五色光球：代表五座島 */}
      <group ref={orbit} position={[0, 2.6, 0]}>
        {ISLANDS.map((island, i) => {
          const a = (i / ISLANDS.length) * Math.PI * 2;
          return (
            <mesh key={island.id} position={[Math.sin(a) * 1.6, Math.sin(a * 2) * 0.2, Math.cos(a) * 1.6]}>
              <icosahedronGeometry args={[0.28, 1]} />
              <meshStandardMaterial color={island.themeColor} emissive={island.themeColor} emissiveIntensity={0.7} flatShading />
            </mesh>
          );
        })}
      </group>

      {showLabel && (
        <Html position={[0, 6.2, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-full bg-sky-900/70 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
            🧭 {CENTRAL_PLAZA.title}
          </div>
        </Html>
      )}
    </group>
  );
}
