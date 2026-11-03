import type { IslandTheme } from '../../../types/island';
import { CLINICAL_BUILDINGS, type ClinicalBuilding } from '../../../features/clinical/data/buildings';
import type { BuildingSetProps } from './index';
import { LinkedBuilding } from './LinkedBuilding';
import { BlinkLight, Bob, Box, Cyl, Diamond, Lamp, MedCross, Path, Tree, Bush } from '../primitives';

const meta = (id: ClinicalBuilding['id']) => {
  const b = CLINICAL_BUILDINGS.find((x) => x.id === id)!;
  return { route: b.route, label: `${b.icon} ${b.no} ${b.title}`, color: b.color };
};

/** 01 臨床推理學院：小講堂＋六色 CLINICAL-6 看板 */
function Academy({ theme }: { theme: IslandTheme }) {
  const cols = ['#f97316', '#6366f1', '#8b5cf6', '#0ea5e9', '#14b8a6', '#7c3aed'];
  return (
    <group>
      <Box size={[2.1, 1.4, 1.7]} position={[0, 0.7, 0]} color={theme.wall} />
      <Box size={[2.3, 0.2, 1.9]} position={[0, 1.5, 0]} color="#4f46e5" />
      <Box size={[1.6, 0.4, 1.3]} position={[0, 1.8, 0]} color={theme.secondary} />
      <Box size={[0.5, 0.9, 0.06]} position={[-0.55, 0.45, 0.86]} color="#4f46e5" />
      {cols.map((c, i) => (
        <Box key={c} size={[0.16, 0.32, 0.04]} position={[0.05 + i * 0.18, 0.95, 0.87]} color={c} emissive={c} emissiveIntensity={0.35} castShadow={false} />
      ))}
    </group>
  );
}

/** 02 診斷線索實驗室：實驗室＋燒瓶燈 */
function ClueLab({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      <Box size={[1.9, 1.3, 1.6]} position={[0, 0.65, 0]} color={theme.wall} />
      <Box size={[2.05, 0.18, 1.75]} position={[0, 1.38, 0]} color="#0d9488" />
      <Box size={[1.2, 0.5, 0.06]} position={[0, 0.85, 0.81]} color="#ccfbf1" emissive="#5eead4" emissiveIntensity={0.35} />
      <Cyl args={[0.32, 0.32, 0.3, 8]} position={[0.45, 1.62, 0]} color="#ccfbf1" emissive="#2dd4bf" emissiveIntensity={0.4} />
      <Cyl args={[0.08, 0.22, 0.45, 8]} position={[0.45, 1.98, 0]} color="#ccfbf1" emissive="#2dd4bf" emissiveIntensity={0.4} />
    </group>
  );
}

/** 04 病情解釋模擬診間 */
function ExplainRoom({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      <Box size={[1.8, 1.3, 1.5]} position={[0, 0.65, 0]} color={theme.wall} />
      <Box size={[1.95, 0.18, 1.65]} position={[0, 1.38, 0]} color="#0891b2" />
      <Box size={[0.5, 0.85, 0.06]} position={[-0.45, 0.43, 0.76]} color="#0891b2" />
      <Box size={[0.6, 0.4, 0.06]} position={[0.4, 0.8, 0.76]} color="#cffafe" emissive="#67e8f9" emissiveIntensity={0.3} />
      <MedCross position={[0, 1.75, 0.3]} size={0.4} color="#ffffff" glow={0.3} />
    </group>
  );
}

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

/** 臨床處置島：決策中心塔、急診區、決策節點、醫囑看板 */
export function ClinicalManagementBuildings({ theme, interactive }: BuildingSetProps) {
  return (
    <group>
      {/* 03 臨床處置決策中心（主建築：八角塔） */}
      <LinkedBuilding {...meta('decision')} position={[-0.6, 0, -2]} labelY={7.7} interactive={interactive}>
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
      </LinkedBuilding>

      {/* 05 OSCE 臨床決策挑戰館（急診區） */}
      <LinkedBuilding {...meta('challenge')} position={[3.8, 0, -1.6]} rotation={-0.25} labelY={3.3} interactive={interactive}>
        <Box size={[2.8, 1.9, 2.6]} position={[0, 0.95, 0]} color={theme.wall} />
        <Box size={[2.85, 0.3, 2.65]} position={[0, 1.35, 0]} color={theme.accent} />
        <Box size={[3, 0.18, 2.8]} position={[0, 1.98, 0]} color={theme.primary} />
        <Box size={[1.6, 0.12, 1.2]} position={[0, 1.5, 1.85]} color="#f8fafc" />
        <Box size={[0.08, 1.5, 0.08]} position={[-0.7, 0.75, 2.35]} color="#94a3b8" />
        <Box size={[0.08, 1.5, 0.08]} position={[0.7, 0.75, 2.35]} color="#94a3b8" />
        <Box size={[1, 1.1, 0.06]} position={[0, 0.55, 1.31]} color="#c7d2fe" emissive={theme.secondary} emissiveIntensity={0.3} />
        <MedCross position={[0, 2.5, 0.6]} size={0.6} color="#ef4444" glow={0.5} />
      </LinkedBuilding>

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

      {/* 02 診斷線索實驗室（實驗室＋醫囑看板） */}
      <LinkedBuilding {...meta('lab')} position={[-4.3, 0, 1.6]} rotation={0.5} labelY={3.2} interactive={interactive}>
        <ClueLab theme={theme} />
        <OrderBoard position={[-1.55, 0, -0.2]} rotation={0.2} theme={theme} />
      </LinkedBuilding>
      {/* 01 臨床推理學院 */}
      <LinkedBuilding {...meta('academy')} position={[-4.6, 0, -2.4]} rotation={0.4} labelY={2.9} interactive={interactive}>
        <Academy theme={theme} />
      </LinkedBuilding>
      {/* 04 病情解釋模擬診間 */}
      <LinkedBuilding {...meta('explain')} position={[4.4, 0, 2.9]} rotation={-0.6} labelY={2.8} interactive={interactive}>
        <ExplainRoom theme={theme} />
      </LinkedBuilding>
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
