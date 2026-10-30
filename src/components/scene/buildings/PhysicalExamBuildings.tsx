import type { IslandTheme } from '../../../types/island';
import { Ball, Bob, Box, Cyl, GableRoof, Heart, Lamp, Path, RoundTree, Torus, Bush } from '../primitives';

/** 聽診器雕塑（島嶼識別） */
function Stethoscope({ position, scale = 1, theme }: { position: [number, number, number]; scale?: number; theme: IslandTheme }) {
  const tube = '#1f2937';
  return (
    <group position={position} scale={scale}>
      {/* 耳管 U 形 */}
      <Torus r={0.55} tube={0.07} arc={Math.PI} position={[0, 2, 0]} rotation={[0, 0, Math.PI]} color="#cbd5e1" metalness={0.6} roughness={0.3} />
      <Ball r={0.11} position={[-0.55, 2.02, 0]} color={tube} />
      <Ball r={0.11} position={[0.55, 2.02, 0]} color={tube} />
      {/* 導管 */}
      <Cyl args={[0.07, 0.07, 0.8, 6]} position={[0, 1.08, 0]} color={theme.primary} />
      <Torus r={0.35} tube={0.07} arc={Math.PI} position={[0.35, 0.7, 0]} rotation={[0, 0, Math.PI]} color={theme.primary} />
      <Cyl args={[0.07, 0.07, 0.3, 6]} position={[0.7, 0.85, 0]} color={theme.primary} />
      {/* 聽診頭 */}
      <Cyl args={[0.32, 0.32, 0.14, 12]} position={[0.7, 1.08, 0]} rotation={[Math.PI / 2, 0, 0]} color="#e2e8f0" metalness={0.7} roughness={0.25} />
    </group>
  );
}

/** 檢查床 */
function ExamBed({ position, rotation = 0, theme }: { position: [number, number, number]; rotation?: number; theme: IslandTheme }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[[-0.75, -0.3], [0.75, -0.3], [-0.75, 0.3], [0.75, 0.3]].map(([x, z]) => (
        <Box key={`${x}${z}`} size={[0.08, 0.55, 0.08]} position={[x, 0.27, z]} color="#94a3b8" />
      ))}
      <Box size={[1.8, 0.12, 0.8]} position={[0, 0.6, 0]} color="#e5e7eb" />
      <Box size={[1.7, 0.16, 0.7]} position={[0, 0.74, 0]} color={theme.secondary} />
      <Box size={[0.4, 0.14, 0.55]} position={[-0.6, 0.86, 0]} rotation={[0, 0, 0.2]} color="#ffffff" />
    </group>
  );
}

/** 屏風 */
function Screen({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.55, 0, 0.55].map((x, i) => (
        <group key={x} position={[x, 0, i === 1 ? 0 : 0.12]} rotation={[0, i === 0 ? 0.35 : i === 2 ? -0.35 : 0, 0]}>
          <Box size={[0.5, 1.3, 0.05]} position={[0, 0.85, 0]} color="#f0fdf4" />
          <Box size={[0.04, 1.5, 0.06]} position={[-0.25, 0.75, 0]} color="#94a3b8" />
        </group>
      ))}
    </group>
  );
}

/** 血壓計 */
function BPMonitor({ position, theme }: { position: [number, number, number]; theme: IslandTheme }) {
  return (
    <group position={position}>
      <Cyl args={[0.25, 0.3, 0.08, 6]} position={[0, 0.04, 0]} color="#64748b" />
      <Cyl args={[0.04, 0.04, 1.2, 6]} position={[0, 0.6, 0]} color="#94a3b8" />
      <Box size={[0.55, 0.45, 0.25]} position={[0, 1.35, 0]} color="#f8fafc" />
      <Box size={[0.42, 0.28, 0.02]} position={[0, 1.38, 0.13]} color="#0f172a" emissive={theme.accent} emissiveIntensity={0.6} />
      <Torus r={0.18} tube={0.07} position={[0.38, 1.0, 0]} rotation={[0, Math.PI / 2, 0]} color="#1e3a8a" />
    </group>
  );
}

/** 身體部位指示圖騰 */
function BodyTotem({ position, children, theme }: { position: [number, number, number]; children: React.ReactNode; theme: IslandTheme }) {
  return (
    <group position={position}>
      <Cyl args={[0.32, 0.4, 1.1, 6]} position={[0, 0.55, 0]} color={theme.wall} />
      <Cyl args={[0.36, 0.36, 0.08, 6]} position={[0, 1.12, 0]} color={theme.primary} />
      <Bob amp={0.1} speed={1.5} phase={position[2]} spin={0.5}>
        <group position={[0, 1.65, 0]}>{children}</group>
      </Bob>
    </group>
  );
}

/** 身體檢查島：檢查床、考站動線、人體模型、聽診器 */
export function PhysicalExamBuildings({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      {/* 主建築：身體檢查訓練館 */}
      <group position={[0, 0, -2.4]}>
        <Box size={[5.6, 2.5, 3.2]} position={[0, 1.25, 0]} color={theme.wall} />
        <GableRoof width={6.1} depth={3.8} height={1.5} position={[0, 2.5, 0]} color={theme.primary} />
        <Box size={[5.7, 0.25, 3.3]} position={[0, 0.12, 0]} color="#cbd5e1" />
        {/* 入口與綠色十字 */}
        <Box size={[1.3, 1.7, 0.08]} position={[0, 0.85, 1.61]} color={theme.primary} />
        <Box size={[1.8, 0.12, 0.9]} position={[0, 1.95, 1.95]} color="#e2e8f0" />
        <group position={[0, 3.15, 1.62]}>
          <Box size={[0.24, 0.8, 0.1]} color="#ffffff" />
          <Box size={[0.8, 0.24, 0.1]} color="#ffffff" />
        </group>
        {/* 考站窗格 */}
        {[-2.1, -1.3, 1.3, 2.1].map((x) => (
          <Box key={x} size={[0.6, 0.8, 0.06]} position={[x, 1.35, 1.61]} color={theme.secondary} emissive={theme.accent} emissiveIntensity={0.2} />
        ))}
        {/* 屋頂聽診器 */}
        <Stethoscope position={[2.05, 2.55, 0]} scale={0.75} theme={theme} />
      </group>

      {/* 考站動線：主步道 + 考站地標圓盤 */}
      <Path from={[0, 7.2]} to={[0, -0.6]} width={1} color="#e7f5e9" />
      {[5.6, 3.9, 2.2].map((z, i) => (
        <Cyl key={z} args={[0.42, 0.42, 0.08, 10]} position={[i % 2 ? 0.9 : -0.9, 0.05, z]} color={theme.primary} castShadow={false} />
      ))}

      {/* 檢查室：檢查床 + 屏風 + 血壓計 */}
      <ExamBed position={[3.3, 0, 1.6]} rotation={-0.3} theme={theme} />
      <Screen position={[3.6, 0, 0.3]} rotation={-0.3} />
      <BPMonitor position={[4.7, 0, 2.2]} theme={theme} />
      <ExamBed position={[4.2, 0, 4]} rotation={-0.7} theme={theme} />

      {/* 人體模型展示區 */}
      <group position={[-3.5, 0, 1.4]}>
        <Cyl args={[0.75, 0.85, 0.35, 8]} position={[0, 0.17, 0]} color="#e2e8f0" />
        <Cyl args={[0.18, 0.22, 0.9, 6]} position={[0, 0.8, 0]} color="#fcd9b8" />
        <Ball r={0.45} detail={1} position={[0, 1.55, 0]} scale={[0.85, 1.15, 0.6]} color="#fcd9b8" />
        <Ball r={0.27} detail={1} position={[0, 2.35, 0]} color="#fcd9b8" />
        <Ball r={0.16} position={[0.08, 1.7, 0.22]} color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        <Ball r={0.13} position={[-0.16, 1.55, 0.2]} color="#fda4af" />
      </group>

      {/* 身體部位圖騰：心臟、肺、腦 */}
      <BodyTotem position={[-5, 0, -0.8]} theme={theme}>
        <Heart position={[0, 0, 0]} size={0.55} color="#ef4444" />
      </BodyTotem>
      <BodyTotem position={[-5.5, 0, 1.6]} theme={theme}>
        <Ball r={0.26} detail={1} position={[-0.17, 0, 0]} scale={[0.8, 1.2, 0.8]} color="#fda4af" />
        <Ball r={0.26} detail={1} position={[0.17, 0, 0]} scale={[0.8, 1.2, 0.8]} color="#fda4af" />
      </BodyTotem>
      <BodyTotem position={[-4.6, 0, 3.8]} theme={theme}>
        <Ball r={0.33} detail={1} scale={[1.1, 0.85, 0.9]} color="#f9a8d4" />
      </BodyTotem>

      <Lamp position={[-1.2, 0, 6.4]} />
      <Lamp position={[1.2, 0, 6.4]} />
      <RoundTree position={[-5.6, 0, -3.6]} color="#4ade80" />
      <RoundTree position={[5.6, 0, -3.4]} scale={1.2} />
      <RoundTree position={[-3.2, 0, -5.8]} scale={0.9} />
      <RoundTree position={[3.6, 0, -5.6]} />
      <Bush position={[6.4, 0, -0.8]} />
      <Bush position={[-2.2, 0, 5.4]} />
    </group>
  );
}
