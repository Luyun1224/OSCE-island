import type { IslandTheme } from '../../../types/island';
import { Ball, Bob, Box, Cone, Cyl, GableRoof, Heart, Lamp, Path, RoundTree, SpeechBubble, Torus, Bush } from '../primitives';

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

/** 醫病溝通島：溝通劇場、圓桌座談、衛教角、小講堂 */
export function CommunicationBuildings({ theme }: { theme: IslandTheme }) {
  return (
    <group>
      {/* 主建築：醫病溝通劇場（圓形劇場 + 半球頂） */}
      <group position={[0, 0, -2.4]}>
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
      </group>

      {/* 圓桌討論區 */}
      <RoundTable position={[-3.6, 0, 2.4]} umbrella theme={theme} />
      <RoundTable position={[3.8, 0, 2.6]} theme={theme} />

      {/* 小型教室 */}
      <group position={[4.6, 0, -1.6]} rotation={[0, -0.45, 0]}>
        <Box size={[2.2, 1.5, 1.8]} position={[0, 0.75, 0]} color={theme.wall} />
        <GableRoof width={2.5} depth={2.2} height={1} position={[0, 1.5, 0]} color={theme.secondary} />
        <Box size={[0.6, 1, 0.06]} position={[-0.45, 0.5, 0.91]} color={theme.primary} />
        <Box size={[0.6, 0.45, 0.06]} position={[0.5, 0.9, 0.91]} color="#bae6fd" emissive="#fde68a" emissiveIntensity={0.3} />
      </group>

      {/* 衛教角 */}
      <EduBoard position={[-4.8, 0, -1.4]} rotation={0.55} theme={theme} />

      {/* 漂浮對話與愛心 */}
      <Bob amp={0.2} speed={1.3} phase={1}>
        <SpeechBubble position={[-3.6, 3.7, 2.4]} scale={0.55} color="#fff1f2" dots={theme.primary} />
      </Bob>
      <Bob amp={0.2} speed={1.1} phase={2}>
        <SpeechBubble position={[3.8, 2.4, 2.6]} scale={0.55} color="#fffbeb" dots="#f59e0b" />
      </Bob>
      <Bob amp={0.15} speed={1.6} phase={3}>
        <Heart position={[4.6, 3.6, -1.6]} size={0.5} color={theme.accent} />
      </Bob>

      {/* 溫暖步道與花圃 */}
      <Path from={[0, 7.2]} to={[0, 1.5]} width={1} color="#fde7c8" />
      <Path from={[0, 4.4]} to={[-3.6, 2.4]} width={0.55} color="#fde7c8" />
      <Path from={[0, 4.4]} to={[3.8, 2.6]} width={0.55} color="#fde7c8" />
      {[[-1.4, 5.6], [1.4, 5.2], [-5.6, 1], [5.6, 0.6], [-2.2, -5.6], [2.4, -5.8]].map(([x, z], i) => (
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
