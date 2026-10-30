import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { IslandTheme } from '../../../types/island';
import { BlinkLight, Box, Cyl, Lamp, Path, Tree, Bush } from '../primitives';

const STEEL = '#cbd5e1';

/** 技術訓練艙 */
function TrainingPod({ position, rotation = 0, theme }: { position: [number, number, number]; rotation?: number; theme: IslandTheme }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Cyl args={[0.95, 1.05, 0.3, 10]} position={[0, 0.15, 0]} color={theme.primary} />
      <Cyl args={[0.85, 0.85, 1.3, 10]} position={[0, 0.95, 0]} color={STEEL} metalness={0.4} roughness={0.4} />
      <Cyl args={[0.88, 0.88, 0.14, 10]} position={[0, 1.3, 0]} color={theme.accent} />
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.85, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={0.35} transparent opacity={0.75} flatShading />
      </mesh>
      <Box size={[0.6, 0.7, 0.05]} position={[0, 0.9, 0.84]} color="#0e7490" emissive="#22d3ee" emissiveIntensity={0.6} />
    </group>
  );
}

/** 操作台：器械盤 + 模型手臂 */
function OperationTable({ position, rotation = 0, theme }: { position: [number, number, number]; rotation?: number; theme: IslandTheme }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box size={[2, 0.12, 1.1]} position={[0, 0.85, 0]} color={STEEL} metalness={0.5} roughness={0.35} />
      {[[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]].map(([x, z]) => (
        <Box key={`${x}${z}`} size={[0.08, 0.8, 0.08]} position={[x, 0.4, z]} color="#64748b" />
      ))}
      <Box size={[1.9, 0.04, 1]} position={[0, 0.93, 0]} color="#0ea5e9" />
      {/* 模型手臂 */}
      <Cyl args={[0.14, 0.17, 1, 8]} position={[-0.2, 1.1, 0.05]} rotation={[0, 0, Math.PI / 2]} color="#f5cba7" />
      <Cyl args={[0.11, 0.14, 0.6, 8]} position={[0.55, 1.07, 0.05]} rotation={[0, 0, Math.PI / 2]} color="#f5cba7" />
      <Box size={[0.25, 0.1, 0.22]} position={[0.95, 1.05, 0.05]} color="#f5cba7" />
      <Cyl args={[0.18, 0.18, 0.15, 8]} position={[-0.1, 1.11, 0.05]} rotation={[0, 0, Math.PI / 2]} color={theme.accent} />
      {/* 器械盤 */}
      <Box size={[0.8, 0.06, 0.45]} position={[-0.4, 0.98, -0.3]} color="#e2e8f0" metalness={0.6} roughness={0.3} />
      {[-0.65, -0.45, -0.25].map((x) => (
        <Box key={x} size={[0.05, 0.03, 0.35]} position={[x, 1.03, -0.3]} color="#94a3b8" metalness={0.8} roughness={0.2} />
      ))}
    </group>
  );
}

/** 注射器圖騰 */
function SyringeTotem({ position, theme }: { position: [number, number, number]; theme: IslandTheme }) {
  return (
    <group position={position}>
      <Cyl args={[0.5, 0.6, 0.4, 8]} position={[0, 0.2, 0]} color={theme.primary} />
      <group position={[0, 0.4, 0]} rotation={[0, 0, 0.25]}>
        <Cyl args={[0.05, 0.05, 0.45, 6]} position={[0, 0.25, 0]} color="#e2e8f0" metalness={0.8} roughness={0.2} />
        <Cyl args={[0.2, 0.25, 0.2, 8]} position={[0, 0.55, 0]} color={STEEL} />
        <Cyl args={[0.3, 0.3, 1.6, 10]} position={[0, 1.45, 0]} color="#a5f3fc" emissive="#22d3ee" emissiveIntensity={0.2} opacity={0.6} />
        <Cyl args={[0.27, 0.27, 0.7, 10]} position={[0, 1.0, 0]} color={theme.accent} emissive={theme.accent} emissiveIntensity={0.3} />
        <Cyl args={[0.5, 0.5, 0.08, 10]} position={[0, 2.28, 0]} color={STEEL} />
        <Cyl args={[0.07, 0.07, 0.7, 6]} position={[0, 2.6, 0]} color="#64748b" />
        <Cyl args={[0.35, 0.35, 0.08, 10]} position={[0, 2.95, 0]} color={theme.primary} />
      </group>
    </group>
  );
}

/** 工具架 */
function ToolRack({ position, rotation = 0, theme }: { position: [number, number, number]; rotation?: number; theme: IslandTheme }) {
  const items = ['#ef4444', '#22d3ee', '#fbbf24', theme.primary, '#94a3b8', '#ef4444'];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box size={[0.08, 1.8, 0.5]} position={[-0.8, 0.9, 0]} color="#475569" />
      <Box size={[0.08, 1.8, 0.5]} position={[0.8, 0.9, 0]} color="#475569" />
      {[0.4, 1.0, 1.6].map((y, row) => (
        <group key={y}>
          <Box size={[1.6, 0.06, 0.5]} position={[0, y, 0]} color={STEEL} />
          {[-0.5, 0, 0.5].map((x, i) => (
            <Box key={x} size={[0.32, 0.25, 0.3]} position={[x, y + 0.16, 0]} color={items[(row * 3 + i) % items.length]} />
          ))}
        </group>
      ))}
    </group>
  );
}

/** 屋頂旋轉雷達（機械感） */
function RoofRadar({ position, theme }: { position: [number, number, number]; theme: IslandTheme }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.8;
  });
  return (
    <group position={position}>
      <Cyl args={[0.12, 0.18, 0.8, 6]} position={[0, 0.4, 0]} color="#475569" />
      <group ref={ref} position={[0, 0.9, 0]}>
        <Cyl args={[0.6, 0.15, 0.2, 10]} rotation={[0.6, 0, 0]} color={STEEL} metalness={0.5} roughness={0.35} />
        <BlinkLight position={[0, 0.3, 0.2]} color={theme.accent} r={0.1} />
      </group>
    </group>
  );
}

/** 技能操作島：技能實作中心、訓練艙、操作台、器械 */
export function ProceduralSkillsBuildings({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      {/* 主建築：技能操作中心（機棚式） */}
      <group position={[0.3, 0, -2.2]}>
        <Box size={[5, 2, 3.4]} position={[0, 1, 0]} color={theme.wall} metalness={0.2} roughness={0.6} />
        <Cyl args={[1.7, 1.7, 5.1, 10]} thetaLength={Math.PI} position={[0, 2, 0]} rotation={[0, 0, Math.PI / 2]} color={theme.primary} metalness={0.2} roughness={0.5} />
        <Box size={[5.1, 0.25, 3.5]} position={[0, 1.95, 0]} color={theme.accent} />
        {/* 大門：發光門縫 */}
        <Box size={[2.2, 1.6, 0.1]} position={[0, 0.8, 1.72]} color="#1e293b" />
        <Box size={[2.2, 0.12, 0.12]} position={[0, 1.15, 1.76]} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1} castShadow={false} />
        <Box size={[0.08, 1.6, 0.12]} position={[0, 0.8, 1.76]} color="#334155" />
        {[-2, 2].map((x) => (
          <Box key={x} size={[0.5, 0.5, 0.06]} position={[x, 1.3, 1.71]} color="#0e7490" emissive="#22d3ee" emissiveIntensity={0.5} />
        ))}
        <RoofRadar position={[1.4, 3.5, 0]} theme={theme} />
        <BlinkLight position={[-2.4, 2.3, 1.8]} color={theme.accent} r={0.14} />
        <BlinkLight position={[2.4, 2.3, 1.8]} color={theme.accent} r={0.14} phase={Math.PI} />
      </group>

      {/* 訓練艙 */}
      <TrainingPod position={[-4.5, 0, 0.4]} theme={theme} />
      <TrainingPod position={[-3.8, 0, -3.2]} rotation={0.3} theme={theme} />

      {/* 操作平台與練習站 */}
      <Box size={[3.6, 0.2, 2.6]} position={[3.4, 0.1, 2.3]} rotation={[0, -0.35, 0]} color="#64748b" castShadow={false} />
      <OperationTable position={[3.4, 0.2, 2.3]} rotation={-0.35} theme={theme} />
      <SyringeTotem position={[4.9, 0, -1.6]} theme={theme} />
      <ToolRack position={[-2.6, 0, 3.6]} rotation={0.4} theme={theme} />

      {/* 金屬步道 */}
      <Path from={[0, 6.6]} to={[0, -0.5]} width={1.1} color="#cbd5e1" />
      {[5.2, 3.7, 2.2].map((z) => (
        <Box key={z} size={[1.2, 0.07, 0.1]} position={[0, 0.07, z]} color={theme.accent} emissive={theme.accent} emissiveIntensity={0.4} castShadow={false} />
      ))}

      <Lamp position={[-1.2, 0, 6]} color="#a5f3fc" />
      <Lamp position={[1.2, 0, 6]} color="#a5f3fc" />
      <Tree position={[-5.6, 0, -1.6]} color="#3f8f63" />
      <Tree position={[5.2, 0, -4.2]} scale={1.1} color="#3f8f63" />
      <Tree position={[0.4, 0, -6]} scale={0.9} color="#3f8f63" />
      <Bush position={[5.8, 0, 0.8]} />
      <Bush position={[-5.5, 0, 2.8]} />
    </group>
  );
}
