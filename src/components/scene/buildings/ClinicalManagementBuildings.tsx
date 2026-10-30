import type { IslandTheme } from '../../../types/island';
import { BlinkLight, Bob, Box, Cyl, Diamond, Lamp, MedCross, Path, Tree, Bush } from '../primitives';

/** 醫囑看板 */
function OrderBoard({ position, rotation = 0, theme }: { position: [number, number, number]; rotation?: number; theme: IslandTheme }) {
  const rows: [number, number, string][] = [
    [0.55, 1.1, theme.accent],
    [0.25, 0.8, theme.secondary],
    [-0.05, 1.0, '#a3e635'],
    [-0.35, 0.6, theme.secondary],
  ];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box size={[0.1, 1.4, 0.1]} position={[-0.8, 0.7, 0]} color="#64748b" />
      <Box size={[0.1, 1.4, 0.1]} position={[0.8, 0.7, 0]} color="#64748b" />
      <Box size={[1.9, 1.5, 0.12]} position={[0, 1.85, 0]} color="#1e1b4b" />
      <Box size={[1.9, 0.12, 0.16]} position={[0, 2.6, 0]} color={theme.primary} />
      {rows.map(([y, w, c]) => (
        <Box key={y} size={[w, 0.12, 0.02]} position={[-0.75 + w / 2, 1.85 + y * 0.9, 0.07]} color={c} emissive={c} emissiveIntensity={0.6} castShadow={false} />
      ))}
    </group>
  );
}

/** 警示燈柱 */
function WarningPost({ position, phase = 0, theme }: { position: [number, number, number]; phase?: number; theme: IslandTheme }) {
  return (
    <group position={position}>
      <Cyl args={[0.08, 0.1, 1.5, 6]} position={[0, 0.75, 0]} color="#475569" />
      <Cyl args={[0.2, 0.2, 0.1, 8]} position={[0, 1.52, 0]} color="#334155" />
      <BlinkLight position={[0, 1.75, 0]} color={theme.accent} r={0.2} phase={phase} />
    </group>
  );
}

/** 處置站 */
function TreatmentStation({ position, rotation = 0, theme }: { position: [number, number, number]; rotation?: number; theme: IslandTheme }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box size={[1.4, 1.1, 1.2]} position={[0, 0.55, 0]} color={theme.wall} />
      <Box size={[1.6, 0.18, 1.4]} position={[0, 1.2, 0]} color={theme.primary} />
      <Box size={[1.42, 0.16, 1.22]} position={[0, 0.7, 0]} color={theme.accent} />
      <MedCross position={[0, 0.65, 0.62]} size={0.35} color="#ef4444" />
    </group>
  );
}

/** 臨床處置島：決策中心塔、急診區、決策節點、醫囑看板 */
export function ClinicalManagementBuildings({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      {/* 主建築：臨床處置決策中心（八角塔） */}
      <group position={[-0.6, 0, -2]}>
        <Cyl args={[2.5, 2.7, 2.2, 8]} position={[0, 1.1, 0]} color={theme.wall} />
        <Cyl args={[2.55, 2.55, 0.3, 8]} position={[0, 1.65, 0]} color={theme.primary} />
        <Cyl args={[1.5, 1.8, 3.4, 8]} position={[0, 3.9, 0]} color={theme.secondary} />
        {/* 塔身窗帶 */}
        <Cyl args={[1.62, 1.68, 0.4, 8]} position={[0, 4.1, 0]} color="#312e81" emissive={theme.primary} emissiveIntensity={0.5} />
        <Cyl args={[1.9, 1.6, 0.35, 8]} position={[0, 5.75, 0]} color={theme.primary} />
        <Cyl args={[0.12, 0.12, 0.9, 6]} position={[0, 6.35, 0]} color="#94a3b8" />
        <BlinkLight position={[0, 6.95, 0]} color={theme.accent} r={0.32} speed={2.4} />
        <MedCross position={[0, 4.95, 1.62]} size={0.65} color="#ffffff" glow={0.4} />
        {/* 大門 */}
        <Box size={[1.2, 1.5, 0.3]} position={[0, 0.75, 2.45]} color={theme.primary} />
        <Box size={[2, 0.16, 1]} position={[0, 1.75, 2.6]} color={theme.accent} />
      </group>

      {/* 急診區 */}
      <group position={[3.8, 0, -1.6]} rotation={[0, -0.25, 0]}>
        <Box size={[2.8, 1.9, 2.6]} position={[0, 0.95, 0]} color={theme.wall} />
        <Box size={[2.85, 0.3, 2.65]} position={[0, 1.35, 0]} color={theme.accent} />
        <Box size={[3, 0.18, 2.8]} position={[0, 1.98, 0]} color={theme.primary} />
        <Box size={[1.6, 0.12, 1.2]} position={[0, 1.5, 1.85]} color="#f8fafc" />
        <Box size={[0.08, 1.5, 0.08]} position={[-0.7, 0.75, 2.35]} color="#94a3b8" />
        <Box size={[0.08, 1.5, 0.08]} position={[0.7, 0.75, 2.35]} color="#94a3b8" />
        <Box size={[1, 1.1, 0.06]} position={[0, 0.55, 1.31]} color="#c7d2fe" emissive={theme.secondary} emissiveIntensity={0.3} />
        <MedCross position={[0, 2.5, 0.6]} size={0.6} color="#ef4444" glow={0.5} />
      </group>

      {/* 臨床流程路徑 + 決策節點 */}
      <Path from={[0, 7]} to={[0, 0.6]} width={0.9} color="#ede9fe" />
      <Path from={[0, 4.4]} to={[-3, 2.6]} width={0.5} color="#fed7aa" />
      <Path from={[0, 4.4]} to={[3, 2.8]} width={0.5} color="#fed7aa" />
      <Bob amp={0.18} speed={1.6} spin={0.8}>
        <Diamond position={[0, 1.2, 4.4]} r={0.42} color={theme.primary} />
      </Bob>
      <Bob amp={0.18} speed={1.6} phase={1.2} spin={0.8}>
        <Diamond position={[-3, 1, 2.6]} r={0.32} color={theme.accent} />
      </Bob>
      <Bob amp={0.18} speed={1.6} phase={2.4} spin={0.8}>
        <Diamond position={[3, 1, 2.8]} r={0.32} color={theme.accent} />
      </Bob>

      <OrderBoard position={[-4.6, 0, 1.2]} rotation={0.5} theme={theme} />
      <TreatmentStation position={[-4.8, 0, -2.4]} rotation={0.4} theme={theme} />
      <TreatmentStation position={[4.6, 0, 2.8]} rotation={-0.6} theme={theme} />
      <WarningPost position={[-1.6, 0, 6]} theme={theme} />
      <WarningPost position={[1.6, 0, 6]} phase={Math.PI} theme={theme} />
      <WarningPost position={[5.9, 0, 0.6]} phase={1} theme={theme} />

      <Lamp position={[-3.1, 0, 4.8]} />
      <Tree position={[-3.4, 0, -5.4]} color="#5ea36b" />
      <Tree position={[2.4, 0, -5.6]} scale={1.1} color="#5ea36b" />
      <Tree position={[5.6, 0, -4.2]} scale={0.9} color="#5ea36b" />
      <Bush position={[-6, 0, -0.2]} />
      <Bush position={[2.4, 0, 5.8]} />
    </group>
  );
}
