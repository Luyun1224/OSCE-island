import { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Group } from 'three';
import { EXTERNAL_LINKS } from '../../config/site';
import { logVisit } from '../../lib/practiceLog';
import { Ball, Bob, Box, Cone, Cyl, Torus } from './primitives';

const L = EXTERNAL_LINKS.skillsIsland;
export const SKILLS_PORTAL_POSITION: [number, number, number] = [0, 0, 26.5];

/**
 * 臨床技能島碼頭與傳送門（外部網站入口）
 * 標籤是一般 <a target="_self">；點擊 3D 碼頭時也只是觸發同一個 <a>，
 * 因此永遠在目前分頁開啟、保留上一頁，不使用 window.open，也不經過站內 hash 路由。
 */
export function SkillsIslandPortal({ showLabel }: { showLabel: boolean }) {
  const link = useRef<HTMLAnchorElement>(null);
  const ring = useRef<Group>(null);
  const [hover, setHover] = useState(false);
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.z = clock.getElapsedTime() * 0.6;
  });
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return;
    link.current?.click();
  };
  return (
    <group
      position={SKILLS_PORTAL_POSITION}
      onClick={click}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <group scale={hover ? 1.06 : 1}>
        {/* 碼頭棧板與木樁 */}
        <Box size={[2.4, 0.25, 6]} position={[0, 0.35, -1.2]} color="#d6a76c" />
        {[-1, 1].flatMap((x) => [-3.8, -1.6, 0.6, 1.6].map((z) => <Cyl key={`${x}${z}`} args={[0.14, 0.14, 1.4, 6]} position={[x * 1.15, -0.2, z]} color="#92643a" />))}
        {[-3.4, -2.4, -1.4, -0.4, 0.6, 1.6].map((z) => (
          <Box key={z} size={[2.45, 0.04, 0.06]} position={[0, 0.49, z]} color="#b8864f" castShadow={false} />
        ))}
        {/* 小帆船 */}
        <Bob amp={0.12} speed={1.1}>
          <group position={[2.6, 0.1, -0.6]} rotation={[0, 0.3, 0]}>
            <Box size={[1, 0.45, 2.4]} position={[0, 0.2, 0]} color="#ffffff" />
            <Box size={[1.02, 0.12, 2.42]} position={[0, 0.02, 0]} color="#f97316" />
            <Cyl args={[0.05, 0.05, 2.2, 6]} position={[0, 1.5, 0]} color="#78350f" />
            <Cone r={0.7} h={1.6} seg={3} position={[0.02, 1.55, 0.1]} rotation={[0, Math.PI / 2, 0]} scale={[0.15, 1, 1]} color="#fde68a" />
          </group>
        </Bob>
        {/* 傳送門拱環 */}
        <group position={[0, 2.4, 1.9]}>
          <Torus r={1.6} tube={0.16} position={[0, 0, 0]} color="#f97316" emissive="#fb923c" emissiveIntensity={hover ? 0.9 : 0.45} />
          <group ref={ring}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2;
              return <Ball key={i} r={0.13} position={[Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0]} color="#fde047" emissive="#fde047" emissiveIntensity={0.8} />;
            })}
          </group>
          <mesh>
            <circleGeometry args={[1.45, 32]} />
            <meshBasicMaterial color="#7dd3fc" transparent opacity={hover ? 0.55 : 0.32} />
          </mesh>
        </group>
        <Cyl args={[0.12, 0.16, 0.9, 6]} position={[-1.6, 0.85, 1.9]} color="#f97316" />
        <Cyl args={[0.12, 0.16, 0.9, 6]} position={[1.6, 0.85, 1.9]} color="#f97316" />
        {/* 指標旗 */}
        <Cyl args={[0.05, 0.05, 2, 6]} position={[-1, 1.4, -3.6]} color="#64748b" />
        <Box size={[0.9, 0.5, 0.04]} position={[-0.52, 2.1, -3.6]} color="#ef4444" />
      </group>
      <Html position={[0, showLabel ? 5 : 4.6, 1.9]} center zIndexRange={[14, 0]}>
        <a
          ref={link}
          href={L.url}
          target="_self"
          onClick={() => logVisit('map', 'external:skills-island', '前往臨床技能島（外部網站・3D 碼頭）')}
          aria-label={`${L.label}：${L.description}`}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black shadow-lg ring-2 ring-orange-300 outline-none transition focus-visible:ring-4 focus-visible:ring-orange-500 md:text-sm ${hover ? 'scale-110 bg-orange-500 text-white' : 'bg-white/95 text-orange-600'}`}
        >
          ⛵ {L.label} →
        </a>
      </Html>
    </group>
  );
}
