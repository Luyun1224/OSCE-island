import { createContext, useContext, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

export type TimeOfDay = 'day' | 'night';

/** 白天／深夜的場景配色與光線 */
export const PALETTE = {
  day: {
    sky: '#bfe6f5',
    hemiSky: '#ffffff',
    hemiGround: '#7dd3c0',
    hemi: 0.9,
    ambient: 0.25,
    sun: '#fff6e5',
    sunIntensity: 1.6,
    sunPos: [30, 50, 25] as [number, number, number],
    ocean: '#4fb8dd',
  },
  night: {
    sky: '#0b1633',
    hemiSky: '#7d8fd6',
    hemiGround: '#0f2a3a',
    hemi: 0.42,
    ambient: 0.12,
    sun: '#b8c7ff',
    sunIntensity: 0.75,
    sunPos: [22, 58, 30] as [number, number, number],
    ocean: '#1c3a66',
  },
};

const TimeCtx = createContext<TimeOfDay>('day');
export const TimeOfDayProvider = TimeCtx.Provider;
export const useTimeOfDay = () => useContext(TimeCtx);

const tmp = new THREE.Color();

/** 背景、霧、光源：切換時以平滑漸變過渡 */
export function SkyRig({ time }: { time: TimeOfDay }) {
  const scene = useThree((s) => s.scene);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const moon = useRef<THREE.Group>(null);
  const sunTarget = useMemo(() => new THREE.Vector3(), []);
  const bg = useMemo(() => new THREE.Color(PALETTE.day.sky), []);
  const fog = useMemo(() => new THREE.Fog(PALETTE.day.sky, 120, 320), []);

  useMemo(() => {
    scene.background = bg;
    scene.fog = fog;
  }, [scene, bg, fog]);

  useFrame((_, dt) => {
    const p = PALETTE[time];
    const k = 1 - Math.exp(-dt * 2.2);
    bg.lerp(tmp.set(p.sky), k);
    fog.color.copy(bg);
    if (hemi.current) {
      hemi.current.color.lerp(tmp.set(p.hemiSky), k);
      hemi.current.groundColor.lerp(tmp.set(p.hemiGround), k);
      hemi.current.intensity += (p.hemi - hemi.current.intensity) * k;
    }
    if (ambient.current) ambient.current.intensity += (p.ambient - ambient.current.intensity) * k;
    if (sun.current) {
      sun.current.color.lerp(tmp.set(p.sun), k);
      sun.current.intensity += (p.sunIntensity - sun.current.intensity) * k;
      sun.current.position.lerp(sunTarget.set(...p.sunPos), k);
    }
    if (moon.current) {
      const target = time === 'night' ? 1 : 0.001;
      const s = moon.current.scale.x + (target - moon.current.scale.x) * k;
      moon.current.scale.setScalar(s);
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={[PALETTE.day.hemiSky, PALETTE.day.hemiGround, PALETTE.day.hemi]} />
      <ambientLight ref={ambient} intensity={PALETTE.day.ambient} />
      <directionalLight
        ref={sun}
        position={PALETTE.day.sunPos}
        intensity={PALETTE.day.sunIntensity}
        color={PALETTE.day.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-bias={-0.0005}
      />
      {/* 月亮 */}
      <group ref={moon} position={[46, 12, -170]} scale={0.001}>
        <mesh>
          <sphereGeometry args={[7, 24, 16]} />
          <meshBasicMaterial color="#fdf6d8" fog={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[11, 24, 16]} />
          <meshBasicMaterial color="#fdf6d8" transparent opacity={0.14} depthWrite={false} fog={false} />
        </mesh>
      </group>
      {time === 'night' && (
        <>
          <Stars radius={260} depth={60} count={2200} factor={5} saturation={0.2} fade speed={0.6} />
          {/* 夜晚的螢火光點與海面月光 */}
          <Sparkles count={90} scale={[90, 8, 80]} position={[0, 5, -2]} size={5} speed={0.35} color="#fde68a" opacity={0.85} />
          <Sparkles count={40} scale={[70, 4, 60]} position={[0, 2, -2]} size={3} speed={0.25} color="#a5f3fc" opacity={0.7} />
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[30 + i * 2, -1.1, -40 - i * 14]} rotation={[-Math.PI / 2, 0, 0.2]}>
              <planeGeometry args={[10 - i, 2.2 - i * 0.25]} />
              <meshBasicMaterial color="#fdf6d8" transparent opacity={0.18 - i * 0.025} depthWrite={false} />
            </mesh>
          ))}
        </>
      )}
    </>
  );
}
