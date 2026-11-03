import { useState, type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import type { IslandTheme } from '../../../types/island';
import { CARE_BUILDINGS, type CareBuilding } from '../../../features/care/data/buildings';
import { navigate } from '../../../router';
import type { BuildingSetProps } from './index';
import { Ball, Bob, Box, Cone, Cyl, GableRoof, Heart, Lamp, Path, RoundTree, SpeechBubble, Torus, Bush } from '../primitives';

const careBuilding = (id: CareBuilding['id']) => CARE_BUILDINGS.find((b) => b.id === id)!;

/** CARE ISLAND 建築：島嶼選取後可點擊進入，並顯示名稱標籤 */
function CareLink({ id, position, rotation = 0, labelY, interactive, children }: { id: CareBuilding['id']; position: [number, number, number]; rotation?: number; labelY: number; interactive?: boolean; children: ReactNode }) {
  const b = careBuilding(id);
  const [hover, setHover] = useState(false);
  return (
    <group
      position={position}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        if (e.delta > 6) return;
        navigate(b.route);
      }}
      onPointerOver={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        if (interactive) document.body.style.cursor = 'auto';
      }}
    >
      <group rotation={[0, rotation, 0]} scale={hover ? 1.07 : 1} position={[0, hover ? 0.15 : 0, 0]}>
        {children}
      </group>
      {interactive && (
        <Html position={[0, labelY, 0]} center zIndexRange={[12, 0]}>
          <button
            type="button"
            onClick={() => navigate(b.route)}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black shadow-lg ring-2 transition md:text-xs ${hover ? 'scale-110' : 'bg-white/95'}`}
            style={{ background: hover ? b.color : undefined, color: hover ? '#fff' : b.color, boxShadow: `0 0 0 2px ${b.color}55` }}
          >
            {b.icon} {b.no} {b.title}
          </button>
        </Html>
      )}
    </group>
  );
}

/** 04 困難溝通情境館：展示四種工具的展板亭 */
function ToolGallery({ theme }: { theme: IslandTheme }) {
  const panels = ['#0d9488', '#e11d48', '#7c3aed', '#f59e0b'];
  return (
    <group>
      <Cyl args={[1.35, 1.45, 0.25, 8]} position={[0, 0.12, 0]} color="#fde7c8" />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return <Cyl key={i} args={[0.07, 0.07, 1.5, 6]} position={[Math.sin(a) * 1.05, 1, Math.cos(a) * 1.05]} color={theme.wall} />;
      })}
      <Cone r={1.55} h={0.8} seg={8} position={[0, 2.1, 0]} color="#2bb3a3" />
      <Ball r={0.16} position={[0, 2.6, 0]} color={theme.secondary} />
      {panels.map((c, i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <group key={c} position={[Math.sin(a) * 0.55, 0.85, Math.cos(a) * 0.55]} rotation={[0, a, 0]}>
            <Box size={[0.62, 0.8, 0.06]} position={[0, 0, 0]} color="#fffbeb" />
            <Box size={[0.5, 0.16, 0.02]} position={[0, 0.24, 0.04]} color={c} emissive={c} emissiveIntensity={0.2} castShadow={false} />
            <Box size={[0.42, 0.05, 0.02]} position={[0, 0.02, 0.04]} color="#fdba74" castShadow={false} />
            <Box size={[0.36, 0.05, 0.02]} position={[0, -0.12, 0.04]} color="#fca5a5" castShadow={false} />
          </group>
        );
      })}
    </group>
  );
}

/** 05 Virtual SP 挑戰中心：小型診間＋對話泡泡招牌 */
function VspCenter({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      <Box size={[2.1, 1.5, 1.7]} position={[0, 0.75, 0]} color={theme.wall} />
      <Box size={[2.25, 0.16, 1.85]} position={[0, 1.58, 0]} color="#0f766e" />
      <Box size={[1.7, 0.5, 1.4]} position={[0, 1.9, 0]} color="#2bb3a3" />
      <Box size={[0.55, 0.95, 0.06]} position={[-0.5, 0.48, 0.86]} color={theme.primary} />
      <Box size={[0.75, 0.5, 0.06]} position={[0.45, 0.95, 0.86]} color="#bae6fd" emissive="#99f6e4" emissiveIntensity={0.35} />
      <Box size={[0.8, 0.22, 0.04]} position={[0, 1.3, 0.87]} color="#ffffff" emissive={theme.secondary} emissiveIntensity={0.3} />
    </group>
  );
}

/** 03 衛教互動工坊：小屋＋衛教看板 */
function Workshop({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      <Box size={[1.8, 1.3, 1.5]} position={[0, 0.65, -0.3]} color={theme.wall} />
      <GableRoof width={2.1} depth={1.8} height={0.85} position={[0, 1.3, -0.3]} color={theme.secondary} />
      <Box size={[0.5, 0.85, 0.06]} position={[-0.4, 0.43, 0.46]} color="#f59e0b" />
      <Box size={[0.5, 0.4, 0.06]} position={[0.45, 0.8, 0.46]} color="#fef3c7" emissive="#fde68a" emissiveIntensity={0.3} />
    </group>
  );
}

const CHAIR_COLORS = ['#fda4af', '#fcd34d', '#fdba74', '#f9a8d4'];

/** 圓桌討論區 */
function RoundTable({ position, umbrella, theme }: { position: [number, number, number]; umbrella?: boolean; theme: IslandTheme }) {
  return (
    <group position={position}>
      <Cyl args={[0.55, 0.55, 0.08, 10]} position={[0, 0.62, 0]} color="#fff7ed" />
      <Cyl args={[0.07, 0.12, 0.6, 6]} position={[0, 0.3, 0]} color="#a8a29e" />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <group key={i} position={[Math.sin(a) * 0.95, 0, Math.cos(a) * 0.95]} rotation={[0, a + Math.PI, 0]}>
            <Box size={[0.38, 0.06, 0.38]} position={[0, 0.38, 0]} color={CHAIR_COLORS[i]} />
            <Box size={[0.38, 0.4, 0.06]} position={[0, 0.58, -0.18]} color={CHAIR_COLORS[i]} />
            <Box size={[0.06, 0.38, 0.06]} position={[0, 0.19, 0]} color="#a8a29e" />
          </group>
        );
      })}
      {umbrella && (
        <>
          <Cyl args={[0.04, 0.04, 1.9, 6]} position={[0, 1.6, 0]} color="#78716c" />
          <Cone r={1.3} h={0.55} seg={8} position={[0, 2.6, 0]} color={theme.primary} />
        </>
      )}
    </group>
  );
}

/** 衛教看板 */
function EduBoard({ position, rotation = 0, theme }: { position: [number, number, number]; rotation?: number; theme: IslandTheme }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box size={[0.1, 1.2, 0.1]} position={[-0.7, 0.6, 0]} color="#a16207" />
      <Box size={[0.1, 1.2, 0.1]} position={[0.7, 0.6, 0]} color="#a16207" />
      <Box size={[1.8, 1.3, 0.12]} position={[0, 1.7, 0]} color={theme.secondary} />
      <Box size={[1.6, 1.1, 0.04]} position={[0, 1.7, 0.07]} color="#fffbeb" />
      <Heart position={[-0.45, 1.75, 0.12]} size={0.35} color="#fb7185" glow={0.1} />
      <Box size={[0.6, 0.08, 0.02]} position={[0.3, 1.95, 0.1]} color="#fdba74" castShadow={false} />
      <Box size={[0.6, 0.08, 0.02]} position={[0.3, 1.75, 0.1]} color="#fca5a5" castShadow={false} />
      <Box size={[0.45, 0.08, 0.02]} position={[0.22, 1.55, 0.1]} color="#fcd34d" castShadow={false} />
    </group>
  );
}

/** 醫病溝通島 CARE ISLAND：五棟可進入的建築＋圓桌座談與步道 */
export function CommunicationBuildings({ theme, interactive }: BuildingSetProps) {
  return (
    <group>
      {/* 02 同理心對話劇場（主建築：圓形劇場 + 半球頂） */}
      <CareLink id="theater" position={[0, 0, -2.4]} labelY={7.6} interactive={interactive}>
        <Cyl args={[2.8, 3, 2.1, 12]} position={[0, 1.05, 0]} color={theme.wall} />
        <Cyl args={[2.9, 2.9, 0.25, 12]} position={[0, 2.2, 0]} color={theme.secondary} />
        <mesh position={[0, 2.3, 0]} castShadow>
          <sphereGeometry args={[2.7, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={theme.primary} flatShading roughness={0.8} />
        </mesh>
        <Cyl args={[0.3, 0.4, 0.4, 6]} position={[0, 5.15, 0]} color={theme.secondary} />
        {/* 舞台與拱門帷幕 */}
        <Cyl args={[2.2, 2.2, 0.35, 12]} thetaLength={Math.PI} position={[0, 0.17, 2.2]} rotation={[0, -Math.PI / 2, 0]} color="#e7c9a0" />
        <Torus r={1.15} tube={0.16} arc={Math.PI} position={[0, 0.9, 2.85]} color={theme.primary} />
        <Box size={[1.7, 1.3, 0.06]} position={[0, 0.95, 2.85]} color="#be123c" />
        {[-1.6, 1.6].map((x) => (
          <Box key={x} size={[0.5, 0.8, 0.06]} position={[x, 1.2, 2.1]} rotation={[0, x > 0 ? -0.5 : 0.5, 0]} color={theme.accent} emissive={theme.accent} emissiveIntensity={0.15} />
        ))}
        {/* 劇場上方的愛心 */}
        <Bob amp={0.25} speed={1.2} spin={0.6}>
          <Heart position={[0, 6.3, 0]} size={1.4} color="#fb7185" glow={0.35} />
        </Bob>
      </CareLink>

      {/* 04 困難溝通情境館 */}
      <CareLink id="gallery" position={[-3.9, 0, 2.6]} labelY={3.3} interactive={interactive}>
        <ToolGallery theme={theme} />
      </CareLink>
      {/* 05 Virtual SP 挑戰中心 */}
      <CareLink id="vsp" position={[4.0, 0, 2.7]} rotation={-0.35} labelY={3.0} interactive={interactive}>
        <VspCenter theme={theme} />
      </CareLink>
      {/* 圓桌座談（裝飾） */}
      <RoundTable position={[2.3, 0, 5.3]} umbrella theme={theme} />

      {/* 01 溝通 SOP 學院（小型教室） */}
      <CareLink id="academy" position={[4.6, 0, -1.6]} rotation={-0.45} labelY={3.3} interactive={interactive}>
        <Box size={[2.2, 1.5, 1.8]} position={[0, 0.75, 0]} color={theme.wall} />
        <GableRoof width={2.5} depth={2.2} height={1} position={[0, 1.5, 0]} color={theme.secondary} />
        <Box size={[0.6, 1, 0.06]} position={[-0.45, 0.5, 0.91]} color={theme.primary} />
        <Box size={[0.6, 0.45, 0.06]} position={[0.5, 0.9, 0.91]} color="#bae6fd" emissive="#fde68a" emissiveIntensity={0.3} />
      </CareLink>

      {/* 03 衛教互動工坊（小屋＋衛教看板） */}
      <CareLink id="workshop" position={[-4.6, 0, -1.5]} rotation={0.55} labelY={3.4} interactive={interactive}>
        <Workshop theme={theme} />
        <EduBoard position={[1.25, 0, 0.25]} rotation={-0.2} theme={theme} />
      </CareLink>

      {/* 漂浮對話與愛心 */}
      <Bob amp={0.2} speed={1.3} phase={1}>
        <SpeechBubble position={[2.3, 3.6, 5.3]} scale={0.5} color="#fff1f2" dots={theme.primary} />
      </Bob>
      <Bob amp={0.2} speed={1.1} phase={2}>
        <SpeechBubble position={[4.0, 3.1, 2.7]} scale={0.55} color="#fffbeb" dots="#2bb3a3" />
      </Bob>
      <Bob amp={0.15} speed={1.6} phase={3}>
        <Heart position={[4.6, 3.6, -1.6]} size={0.5} color={theme.accent} />
      </Bob>

      {/* 溫暖步道與花圃 */}
      <Path from={[0, 7.2]} to={[0, 1.5]} width={1} color="#fde7c8" />
      <Path from={[0, 4.4]} to={[-3.9, 2.6]} width={0.55} color="#fde7c8" />
      <Path from={[0, 4.4]} to={[4.0, 2.7]} width={0.55} color="#fde7c8" />
      {[[-1.4, 5.6], [-2.8, 5.0], [-5.6, 1], [5.6, 0.6], [-2.2, -5.6], [2.4, -5.8]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Bush position={[0, 0, 0]} scale={0.8} color="#86c46d" />
          <Ball r={0.12} position={[0.1, 0.5, 0.15]} color={CHAIR_COLORS[i % 4]} />
          <Ball r={0.1} position={[-0.15, 0.42, 0.1]} color="#ffffff" />
        </group>
      ))}

      <Lamp position={[-1.1, 0, 6.6]} color="#fed7aa" />
      <Lamp position={[1.1, 0, 6.6]} color="#fed7aa" />
      <RoundTree position={[-5.2, 0, -3.8]} color="#f9a8d4" />
      <RoundTree position={[5.4, 0, -4.2]} color="#fbcfe8" scale={1.1} />
      <RoundTree position={[-0.2, 0, -6.4]} color="#86c46d" />
    </group>
  );
}
