import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Html, Line, OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitImpl } from 'three-stdlib';
import { useIsMobile } from '../../training/useIsMobile';
import { BODY_MODEL } from '../data/anatomyModel';
import type { AnatomicalRegion, BodyHit } from '../types';
import { buildBody, surfacePatch, surfacePoint } from './body';
import { identify } from './identify';

export type View = 'front' | 'side' | 'back';
export type Overlay = 'quadrant' | 'nine' | 'thorax' | 'back' | 'lines' | 'landmarks';

const PRESET: Record<View, [number, number, number]> = { front: [0, 1.22, 1.7], side: [1.7, 1.22, 0.05], back: [0, 1.22, -1.7] };
const TARGET = new Vector3(0, 1.15, 0);

export interface Marker {
  point: [number, number, number];
  ok?: boolean;
}

/**
 * 3D 人體檢視器：可旋轉、縮放、點擊；點擊結果經 identify() 轉為部位／左右側／區域／體表標記
 */
export function BodyViewer({ view, overlays, highlightRegions = [], highlightLandmarks = [], marker, onHit, className = 'h-[60vh] min-h-[420px]' }: { view: View; overlays: Overlay[]; highlightRegions?: string[]; highlightLandmarks?: string[]; marker?: Marker | null; onHit?: (hit: BodyHit, point: [number, number, number]) => void; className?: string }) {
  const mobile = useIsMobile();
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#eef7f1] via-[#f8fafc] to-[#dfeee6] ring-1 ring-emerald-100 ${className}`}>
      <Canvas camera={{ position: PRESET.front, fov: 38, near: 0.05, far: 20 }} dpr={mobile ? [1, 1.5] : [1, 2]} style={{ touchAction: 'none' }}>
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#ffffff', '#cbd5c0', 0.6]} />
        <directionalLight position={[1.2, 2.4, 2]} intensity={1.05} />
        <directionalLight position={[-1.5, 1.6, -1.5]} intensity={0.45} />
        <Body overlays={overlays} highlightRegions={highlightRegions} highlightLandmarks={highlightLandmarks} marker={marker} onHit={onHit} detail={mobile ? 0.7 : 1} />
        <ContactShadows position={[0, 0.001, 0]} opacity={0.35} scale={2.2} blur={2.4} far={1.2} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
          <circleGeometry args={[0.7, 40]} />
          <meshStandardMaterial color="#d7e8dc" roughness={1} />
        </mesh>
        <Rig view={view} />
      </Canvas>
    </div>
  );
}

function Rig({ view }: { view: View }) {
  const { camera } = useThree();
  const ctl = useRef<OrbitImpl>(null);
  const goal = useRef<Vector3 | null>(null);
  useEffect(() => {
    goal.current = new Vector3(...PRESET[view]);
  }, [view]);
  useFrame(() => {
    if (!goal.current) return;
    camera.position.lerp(goal.current, 0.12);
    ctl.current?.target.lerp(TARGET, 0.12);
    ctl.current?.update();
    if (camera.position.distanceTo(goal.current) < 0.005) goal.current = null;
  });
  return <OrbitControls ref={ctl} target={TARGET} enablePan={false} minDistance={0.35} maxDistance={2.6} minPolarAngle={0.25} maxPolarAngle={Math.PI - 0.35} onStart={() => (goal.current = null)} />;
}

function Body({ overlays, highlightRegions, highlightLandmarks, marker, onHit, detail }: { overlays: Overlay[]; highlightRegions: string[]; highlightLandmarks: string[]; marker?: Marker | null; onHit?: (hit: BodyHit, p: [number, number, number]) => void; detail: number }) {
  const g = useMemo(() => buildBody(detail), [detail]);
  const click = (part: BodyHit['part']) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6 || !onHit) return;
    const p = e.point;
    onHit(identify(part, { x: p.x, y: p.y, z: p.z }), [p.x, p.y, p.z]);
  };
  const skin = <meshStandardMaterial vertexColors roughness={0.62} metalness={0} />;
  const shownRegions = BODY_MODEL.regions.filter((r) => overlays.includes(r.scheme === 'quadrant' ? 'quadrant' : r.scheme === 'nine' ? 'nine' : r.scheme === 'thorax' ? 'thorax' : 'back') || highlightRegions.includes(r.id));
  return (
    <group>
      <mesh geometry={g.torso} onClick={click('torso')}>
        {skin}
      </mesh>
      <mesh geometry={g.head} onClick={click('head')}>
        {skin}
      </mesh>
      <mesh geometry={g.neck} onClick={click('neck')}>
        {skin}
      </mesh>
      {g.arms.map((a, i) => (
        <mesh key={`a${i}`} geometry={a} onClick={click('arm')}>
          {skin}
        </mesh>
      ))}
      {[...g.legs, ...g.feet].map((a, i) => (
        <mesh key={`l${i}`} geometry={a} onClick={click('leg')}>
          {skin}
        </mesh>
      ))}

      {shownRegions.map((r) => (
        <RegionPatch key={r.id} r={r} strong={highlightRegions.includes(r.id)} />
      ))}

      {overlays.includes('lines') &&
        BODY_MODEL.lines.map((l) => <Line key={l.id} points={densify(l.points).map(([x, y]) => surfacePoint(x, y, l.surface === 'back', 0.003))} color={l.color} lineWidth={1.6} dashed={l.id.startsWith('mcl')} dashSize={0.012} gapSize={0.008} />)}

      {BODY_MODEL.landmarks
        .filter((l) => overlays.includes('landmarks') || highlightLandmarks.includes(l.id))
        .map((l) => {
          const strong = highlightLandmarks.includes(l.id);
          return (
            <group key={l.id} position={surfacePoint(l.x, l.y, l.surface === 'back', 0.004)}>
              <mesh>
                <sphereGeometry args={[strong ? 0.009 : 0.0055, 12, 12]} />
                <meshBasicMaterial color={strong ? '#f97316' : '#0f766e'} />
              </mesh>
              {strong && (
                <Html center position={[0, 0.03, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
                  <span className="whitespace-nowrap rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-black text-white shadow">{l.name}</span>
                </Html>
              )}
            </group>
          );
        })}

      {marker && (
        <mesh position={marker.point}>
          <sphereGeometry args={[0.011, 16, 16]} />
          <meshBasicMaterial color={marker.ok === undefined ? '#4f46e5' : marker.ok ? '#16a34a' : '#dc2626'} />
        </mesh>
      )}
    </group>
  );
}

function RegionPatch({ r, strong }: { r: AnatomicalRegion; strong: boolean }) {
  const geo = useMemo(() => surfacePatch(r.x, r.y, r.surface === 'back'), [r]);
  return (
    <mesh geometry={geo} raycast={() => null}>
      <meshBasicMaterial color={r.color} transparent opacity={strong ? 0.45 : 0.22} depthWrite={false} />
    </mesh>
  );
}

/** 線段加密，使線條貼合曲面 */
function densify(pts: [number, number][], step = 0.01): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 0; k < n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}
