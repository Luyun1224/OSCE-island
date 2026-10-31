import { useState, type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import type { IslandTheme } from '../../../types/island';
import { HQ_BUILDINGS, type HQBuilding } from '../../../features/history/data/buildings';
import { navigate } from '../../../router';
import type { BuildingSetProps } from './index';
import { Ball, Bench, Bob, Box, Cone, Cyl, Lamp, Path, QuestionMark, SpeechBubble, Torus, Tree, Bush } from '../primitives';

const building = (id: HQBuilding['id']) => HQ_BUILDINGS.find((b) => b.id === id)!;

/** HISTORY QUEST 建築：島嶼選取後可點擊進入，並顯示名稱標籤 */
function QuestBuilding({ id, position, labelY, interactive, children }: { id: HQBuilding['id']; position: [number, number, number]; labelY: number; interactive?: boolean; children: ReactNode }) {
  const b = building(id);
  const [hover, setHover] = useState(false);
  return (
    <group
      position={position}
      onClick={(e) => {
        if (!interactive) return; // 未選取島嶼時交給島嶼處理（先選取島嶼）
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
      <group scale={hover ? 1.07 : 1} position={[0, hover ? 0.15 : 0, 0]}>
        {children}
      </group>
      {interactive && (
        <Html position={[0, labelY, 0]} center zIndexRange={[12, 0]}>
          <button
            type="button"
            onClick={() => navigate(b.route)}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black shadow-lg ring-2 transition md:text-xs ${hover ? 'scale-110 text-white' : 'bg-white/95'}`}
            style={{ background: hover ? b.color : undefined, color: hover ? '#fff' : b.color, borderColor: b.color, boxShadow: `0 0 0 2px ${b.color}55` }}
          >
            {b.icon} {b.no} {b.title}
            {b.status === 'building' && <span className="ml-1 opacity-70">🚧</span>}
          </button>
        </Html>
      )}
    </group>
  );
}

/** 小型診間（含門牌） */
function ClinicRoom({ position, rotation = 0, theme }: { position: [number, number, number]; rotation?: number; theme: IslandTheme }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box size={[1.9, 1.4, 1.7]} position={[0, 0.7, 0]} color={theme.wall} />
      <Cone r={1.55} h={0.9} seg={4} position={[0, 1.85, 0]} rotation={[0, Math.PI / 4, 0]} color={theme.secondary} />
      <Box size={[0.55, 0.95, 0.06]} position={[0, 0.48, 0.86]} color={theme.primary} />
      {/* 診間門牌 */}
      <Box size={[0.6, 0.22, 0.04]} position={[0, 1.15, 0.87]} color="#ffffff" emissive={theme.accent} emissiveIntensity={0.25} />
      <Box size={[0.38, 0.35, 0.04]} position={[0.65, 0.85, 0.86]} color={theme.accent} emissive={theme.accent} emissiveIntensity={0.2} />
    </group>
  );
}

/** 02 問診技巧訓練場：圓頂競技場 */
function TrainingArena({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      <Cyl args={[1.45, 1.55, 0.5, 12]} position={[0, 0.25, 0]} color="#ffffff" />
      <Cyl args={[1.47, 1.47, 0.14, 12]} position={[0, 0.45, 0]} color="#f97316" />
      <Cyl args={[1.3, 1.35, 0.9, 12]} position={[0, 0.95, 0]} color={theme.wall} />
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[1.3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fb923c" flatShading roughness={0.7} />
      </mesh>
      <Box size={[0.6, 0.75, 0.08]} position={[0, 0.85, 1.3]} color={theme.primary} />
      <Bob amp={0.15} speed={1.5} spin={0.8}>
        <group position={[0, 3.3, 0]}>
          <Torus r={0.42} tube={0.1} color="#f97316" emissive="#f97316" emissiveIntensity={0.4} />
          <Ball r={0.16} color="#fde68a" emissive="#fde68a" emissiveIntensity={0.6} />
        </group>
      </Bob>
    </group>
  );
}

/** 04 問診能力分析中心：屋頂長條圖 */
function ReviewCenter({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      <Box size={[2.2, 1.6, 1.8]} position={[0, 0.8, 0]} color={theme.wall} />
      <Box size={[2.35, 0.14, 1.95]} position={[0, 1.65, 0]} color="#7c3aed" />
      <Box size={[1.5, 0.75, 0.06]} position={[0, 0.95, 0.91]} color="#1e1b4b" emissive="#7c3aed" emissiveIntensity={0.4} />
      {[
        [-0.5, 0.35, '#14b8a6'],
        [0, 0.6, '#f97316'],
        [0.5, 0.9, '#8b5cf6'],
      ].map(([x, h, c]) => (
        <Box key={x as number} size={[0.32, h as number, 0.32]} position={[x as number, 1.72 + (h as number) / 2, 0]} color={c as string} emissive={c as string} emissiveIntensity={0.25} />
      ))}
      <Box size={[0.5, 0.95, 0.06]} position={[-0.6, 0.48, 0.91]} color={theme.primary} />
    </group>
  );
}

/** 病歷夾 */
function Clipboard({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <Box size={[1, 1.35, 0.08]} color="#b7865b" />
      <Box size={[0.82, 1.1, 0.03]} position={[0, -0.06, 0.05]} color="#ffffff" />
      <Box size={[0.42, 0.14, 0.12]} position={[0, 0.66, 0.04]} color="#94a3b8" metalness={0.5} />
      {[0.25, 0.08, -0.09, -0.26].map((y) => (
        <Box key={y} size={[0.6, 0.05, 0.02]} position={[0, y, 0.075]} color="#93c5fd" castShadow={false} />
      ))}
    </group>
  );
}

/** 問號路標 */
function QuestionSign({ position, theme }: { position: [number, number, number]; theme: IslandTheme }) {
  return (
    <group position={position}>
      <Box size={[0.1, 1.2, 0.1]} position={[0, 0.6, 0]} color="#8b5e3c" />
      <Bob amp={0.08} speed={1.6} phase={position[0]} spin={0.6}>
        <QuestionMark position={[0, 1.65, 0]} color={theme.primary} scale={0.7} />
      </Bob>
    </group>
  );
}

/**
 * 病史詢問島：HISTORY QUEST 病史偵探學院
 * 01 問診 SOP 學院（主建築）、02 問診技巧訓練場、03 虛擬病人診間、04 問診能力分析中心
 */
export function HistoryTakingBuildings({ theme, interactive }: BuildingSetProps) {
  return (
    <group>
      {/* 01 問診 SOP 學院（主建築） */}
      <QuestBuilding id="academy" position={[0, 0, -2]} labelY={7.6} interactive={interactive}>
        <Box size={[4.6, 2.4, 3.2]} position={[0, 1.2, 0]} color={theme.wall} />
        <Box size={[3.6, 1.3, 2.6]} position={[0, 3.05, -0.1]} color={theme.wall} />
        <Cone r={2.9} h={1.5} seg={4} position={[0, 4.45, -0.1]} rotation={[0, Math.PI / 4, 0]} color={theme.primary} />
        <Box size={[4.8, 0.18, 3.4]} position={[0, 2.45, 0]} color={theme.primary} />
        {[-1.5, -0.5, 0.5, 1.5].map((x) => (
          <Box key={x} size={[0.22, 2.2, 0.22]} position={[x, 1.1, 1.85]} color="#ffffff" />
        ))}
        <Box size={[3.6, 0.2, 0.7]} position={[0, 2.25, 1.75]} color={theme.secondary} />
        <Box size={[1, 1.5, 0.08]} position={[0, 0.75, 1.61]} color={theme.primary} />
        {[-1.65, 1.65].map((x) => (
          <Box key={x} size={[0.7, 0.7, 0.06]} position={[x, 1.35, 1.61]} color={theme.accent} emissive={theme.accent} emissiveIntensity={0.25} />
        ))}
        {[-1.1, 0, 1.1].map((x) => (
          <Box key={x} size={[0.6, 0.5, 0.06]} position={[x, 3.1, 1.21]} color={theme.secondary} emissive={theme.accent} emissiveIntensity={0.2} />
        ))}
        <Bob amp={0.25} speed={1.1}>
          <SpeechBubble position={[0, 6.1, 0]} scale={1.3} dots={theme.primary} />
        </Bob>
      </QuestBuilding>

      {/* 02 問診技巧訓練場 */}
      <QuestBuilding id="lab" position={[-3.1, 0, 2.5]} labelY={3.9} interactive={interactive}>
        <TrainingArena theme={theme} />
      </QuestBuilding>

      {/* 03 虛擬病人診間 */}
      <QuestBuilding id="clinic" position={[-4.3, 0, -0.6]} labelY={5.4} interactive={interactive}>
        <group rotation={[0, 0.35, 0]}>
          <ClinicRoom position={[0, 0, 0]} theme={theme} />
        </group>
      </QuestBuilding>

      {/* 04 問診能力分析中心 */}
      <QuestBuilding id="review" position={[4.3, 0, -0.6]} labelY={3.4} interactive={interactive}>
        <group rotation={[0, -0.35, 0]}>
          <ReviewCenter theme={theme} />
        </group>
      </QuestBuilding>

      {/* 病人等候區 */}
      <Bench position={[2.4, 0, 2.3]} rotation={[0, -0.3, 0]} color={theme.secondary} />
      <Bench position={[3.3, 0, 3.4]} rotation={[0, -0.6, 0]} color={theme.secondary} />

      {/* 問題樹步道：主幹 + 分支 */}
      <Path from={[0, 7]} to={[0, 0]} width={0.9} />
      <Path from={[0, 4.3]} to={[-3.6, 5.1]} width={0.55} color="#dbeafe" />
      <Path from={[0, 4.3]} to={[3.6, 5.1]} width={0.55} color="#dbeafe" />
      <Path from={[-3.6, 5.1]} to={[-5.3, 3.6]} width={0.45} color="#e0f2fe" />
      <Path from={[3.6, 5.1]} to={[5.3, 3.6]} width={0.45} color="#e0f2fe" />
      <QuestionSign position={[-3.7, 0, 5.2]} theme={theme} />
      <QuestionSign position={[3.7, 0, 5.2]} theme={theme} />
      <QuestionSign position={[-5.4, 0, 3.4]} theme={theme} />

      {/* 漂浮對話氣泡 */}
      <Bob amp={0.2} speed={1.4} phase={1}>
        <SpeechBubble position={[-4.3, 3.4, -0.4]} scale={0.6} color="#e0f2fe" dots={theme.primary} />
      </Bob>
      <Bob amp={0.2} speed={1.2} phase={2}>
        <SpeechBubble position={[4.5, 3.5, -0.2]} scale={0.6} dots={theme.accent} />
      </Bob>

      {/* 病歷夾 */}
      <Clipboard position={[5.4, 0.9, 2.4]} rotation={[-0.25, -0.7, 0]} />

      <Lamp position={[-1, 0, 5.8]} />
      <Lamp position={[1, 0, 5.8]} />
      <Tree position={[-5.3, 0, -3.6]} />
      <Tree position={[5.2, 0, -3.8]} scale={1.15} />
      <Tree position={[-2.8, 0, -5.6]} scale={0.9} />
      <Tree position={[3, 0, -5.6]} />
      <Bush position={[-6.2, 0, 1]} />
      <Bush position={[6.3, 0, 1.2]} />
    </group>
  );
}
