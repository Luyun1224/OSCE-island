import type { IslandTheme } from '../../../types/island';
import { Bench, Bob, Box, Cone, GableRoof, Lamp, Path, QuestionMark, SpeechBubble, Tree, Bush } from '../primitives';

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

/** 病史詢問島：門診診間群、接待櫃檯、對話氣泡、問題樹步道 */
export function HistoryTakingBuildings({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      {/* 主建築：病史詢問學院 */}
      <group position={[0, 0, -2]}>
        <Box size={[4.6, 2.4, 3.2]} position={[0, 1.2, 0]} color={theme.wall} />
        <Box size={[3.6, 1.3, 2.6]} position={[0, 3.05, -0.1]} color={theme.wall} />
        <Cone r={2.9} h={1.5} seg={4} position={[0, 4.45, -0.1]} rotation={[0, Math.PI / 4, 0]} color={theme.primary} />
        <Box size={[4.8, 0.18, 3.4]} position={[0, 2.45, 0]} color={theme.primary} />
        {/* 門廊柱 */}
        {[-1.5, -0.5, 0.5, 1.5].map((x) => (
          <Box key={x} size={[0.22, 2.2, 0.22]} position={[x, 1.1, 1.85]} color="#ffffff" />
        ))}
        <Box size={[3.6, 0.2, 0.7]} position={[0, 2.25, 1.75]} color={theme.secondary} />
        <Box size={[1, 1.5, 0.08]} position={[0, 0.75, 1.61]} color={theme.primary} />
        {/* 窗戶 */}
        {[-1.65, 1.65].map((x) => (
          <Box key={x} size={[0.7, 0.7, 0.06]} position={[x, 1.35, 1.61]} color={theme.accent} emissive={theme.accent} emissiveIntensity={0.25} />
        ))}
        {[-1.1, 0, 1.1].map((x) => (
          <Box key={x} size={[0.6, 0.5, 0.06]} position={[x, 3.1, 1.21]} color={theme.secondary} emissive={theme.accent} emissiveIntensity={0.2} />
        ))}
        {/* 屋頂大型對話氣泡（島嶼識別） */}
        <Bob amp={0.25} speed={1.1}>
          <SpeechBubble position={[0, 6.1, 0]} scale={1.3} dots={theme.primary} />
        </Bob>
      </group>

      {/* 診間群 */}
      <ClinicRoom position={[-4.3, 0, -0.6]} rotation={0.35} theme={theme} />
      <ClinicRoom position={[4.3, 0, -0.6]} rotation={-0.35} theme={theme} />

      {/* 接待櫃檯 */}
      <group position={[-2.5, 0, 2.6]} rotation={[0, 0.3, 0]}>
        <Box size={[1.6, 0.8, 0.5]} position={[0, 0.4, 0]} color="#ffffff" />
        <Box size={[1.7, 0.08, 0.6]} position={[0, 0.84, 0]} color={theme.secondary} />
        <Box size={[0.5, 0.8, 0.5]} position={[0.95, 0.4, -0.45]} color="#ffffff" />
        <Box size={[0.35, 0.25, 0.04]} position={[-0.3, 1.02, -0.1]} color="#334155" emissive={theme.accent} emissiveIntensity={0.4} />
        <GableRoof width={2.2} depth={1.6} height={0.5} position={[0.1, 2, -0.15]} color={theme.primary} />
        <Box size={[0.08, 1.2, 0.08]} position={[-0.9, 1.4, 0.45]} color="#94a3b8" />
        <Box size={[0.08, 1.2, 0.08]} position={[1.1, 1.4, 0.45]} color="#94a3b8" />
      </group>

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
