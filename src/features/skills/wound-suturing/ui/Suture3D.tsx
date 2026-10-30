import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { MODEL } from '../caseData';
import type { WSAction, WSState } from '../engine';
import { HALF_WOUND, analyzeDisinfection, stitchSpacings, stitchX, type Pt } from '../geometry';
import { arcGeometry } from './CrossSection';

/**
 * 3D 縫合診間（桌面版）
 * 單位：公分。手背上表面 y = SKIN_Y；模型座標 (x, y) → 世界座標 (x, SKIN_Y, -y)。
 */
const SKIN_Y = 2.2;
const toWorld = (p: Pt, lift = 0.02) => new THREE.Vector3(p.x, SKIN_Y + lift, -p.y);

const mat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => (
  <meshStandardMaterial color={color} flatShading roughness={0.75} {...extra} />
);

/** 手部模型（Low Poly）：手背、手指、拇指、前臂與袖口 */
function HandModel({ onSleeve }: { onSleeve: () => void }) {
  const skin = '#efc09d';
  const fingers = [
    { x: -3.6, len: 6.2 },
    { x: -1.2, len: 7.2 },
    { x: 1.2, len: 6.9 },
    { x: 3.4, len: 5.6 },
  ];
  return (
    <group>
      {/* 手背 */}
      <mesh position={[0, SKIN_Y / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.4, SKIN_Y, 10.5]} />
        {mat(skin)}
      </mesh>
      <mesh position={[0, SKIN_Y - 0.15, -5.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 10.2, 8]} />
        {mat('#e8b48f')}
      </mesh>
      {fingers.map((f) => (
        <group key={f.x} position={[f.x, SKIN_Y * 0.55, -5.2 - f.len / 2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.9, 1, f.len, 8]} />
            {mat(skin)}
          </mesh>
          <mesh position={[0, 0, -f.len / 2]} castShadow>
            <sphereGeometry args={[0.9, 8, 6]} />
            {mat(skin)}
          </mesh>
        </group>
      ))}
      {/* 拇指 */}
      <group position={[6.6, SKIN_Y * 0.5, 0.4]} rotation={[0, -0.9, 0]}>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[1, 1.2, 5, 8]} />
          {mat(skin)}
        </mesh>
      </group>
      {/* 前臂與袖口（非無菌：可點擊） */}
      <mesh position={[0, SKIN_Y * 0.5, 9]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[4.3, 4.6, 8, 10]} />
        {mat('#e8b48f')}
      </mesh>
      <mesh
        position={[0, SKIN_Y * 0.55, 14]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta < 6) onSleeve();
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <cylinderGeometry args={[5, 5, 4, 10]} />
        {mat('#6b8fb5')}
      </mesh>
    </group>
  );
}

function Wound() {
  return (
    <group position={[0, SKIN_Y + 0.005, 0]}>
      <mesh>
        <boxGeometry args={[MODEL.woundLength, 0.03, 0.22]} />
        {mat('#7f1d1d')}
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[MODEL.woundLength - 0.3, 0.03, 0.08]} />
        <meshStandardMaterial color="#dc2626" emissive="#7f1d1d" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/** 洞巾（3D）：中央有開口的無菌巾 */
function Drape3D({ center }: { center: Pt }) {
  const geom = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-8, -7);
    s.lineTo(8, -7);
    s.lineTo(8, 7);
    s.lineTo(-8, 7);
    s.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, MODEL.drapeHoleRadius, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  return (
    <mesh geometry={geom} position={[center.x, SKIN_Y + 0.04, -center.y]} receiveShadow>
      <meshStandardMaterial color="#5eb39b" roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** 已完成的一針：跨越傷口的縫線＋結＋線頭 */
function Stitch3D({ entry, exit, knotSide }: { entry: Pt; exit: Pt; knotSide: 1 | -1 }) {
  const curve = useMemo(() => {
    const a = toWorld(entry, 0.03);
    const b = toWorld(exit, 0.03);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y += 0.12;
    return new THREE.CatmullRomCurve3([a, mid, b]);
  }, [entry, exit]);
  const knotPt = useMemo(() => {
    const side = knotSide > 0 ? (entry.y > 0 ? entry : exit) : entry.y < 0 ? entry : exit;
    return toWorld({ x: (entry.x + exit.x) / 2 + 0.05, y: side.y * 0.6 }, 0.12);
  }, [entry, exit, knotSide]);
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 16, 0.045, 6, false]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
      </mesh>
      <mesh position={knotPt}>
        <icosahedronGeometry args={[0.13, 1]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
      </mesh>
      {[-0.5, 0.5].map((a) => (
        <mesh key={a} position={[knotPt.x + 0.25, knotPt.y, knotPt.z + a * 0.3]} rotation={[0, a, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 4]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      ))}
    </group>
  );
}

/** 進行中的縫針（弧形）：依穿針進度沿弧線移動 */
function Needle3D({ state }: { state: WSState }) {
  const w = state.work;
  if (!w.entry || !w.exit || (w.phase !== 'pass' && w.phase !== 'angle' && w.phase !== 'pull')) return null;
  const g = arcGeometry(Math.abs(w.entry.y), Math.abs(w.exit.y), w.entryAngle);
  const zE = -w.entry.y;
  const zX = -w.exit.y;
  const dir = Math.sign(zX - zE) || 1;
  const t = (w.entryAngle * Math.PI) / 180;
  const progress = w.phase === 'angle' ? 0 : w.passProgress;
  // 區域座標：x 沿進→出方向，y 向上；進針點角度 = -π/2 - t
  const aE = -Math.PI / 2 - t;
  const tipA = aE + progress * 2 * t;
  const sweep = Math.min(2.2, 2 * t * 1.1);
  return (
    <group position={[w.entry.x, SKIN_Y + g.R * Math.cos(t), (zE + zX) / 2]} rotation={[0, -dir * (Math.PI / 2), 0]}>
      <mesh rotation={[0, 0, tipA - sweep]}>
        <torusGeometry args={[g.R, 0.04, 6, 32, sweep]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Room({ onLamp }: { onLamp: () => void }) {
  return (
    <group>
      {/* 地板與牆 */}
      <mesh position={[0, -40, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#dbe4ea" />
      </mesh>
      <mesh position={[0, 20, -60]}>
        <planeGeometry args={[400, 140]} />
        <meshStandardMaterial color="#eef4f7" />
      </mesh>
      {/* 操作台面 */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[70, 2, 44]} />
        {mat('#e2e8f0')}
      </mesh>
      <mesh position={[0, -21, 0]}>
        <boxGeometry args={[66, 38, 40]} />
        {mat('#cbd5e1')}
      </mesh>
      {/* 無菌區（包布）與器械 */}
      <mesh position={[-22, 0.03, 2]} receiveShadow>
        <boxGeometry args={[18, 0.06, 18]} />
        <meshStandardMaterial color="#a7d7c5" roughness={1} />
      </mesh>
      <group position={[-22, 0.4, 2]}>
        {[-4, 0, 4].map((x, i) => (
          <group key={x} position={[x, 0, 0]} rotation={[0, 0.2 * i, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.18, 0.18, 10, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[-5.3, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.8, 0.15, 6, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0, 6]} castShadow>
          <boxGeometry args={[8, 0.4, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
      {/* 廢棄針筒收集盒、感染性（紅）與一般垃圾桶 */}
      <group position={[30, 0, -14]}>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[7, 10, 7]} />
          {mat('#facc15')}
        </mesh>
        <mesh position={[0, 10.5, 0]}>
          <boxGeometry args={[7.4, 1.2, 7.4]} />
          {mat('#dc2626')}
        </mesh>
      </group>
      <group position={[46, -40, -18]}>
        <mesh position={[0, 14, 0]} castShadow>
          <cylinderGeometry args={[8, 7, 28, 12]} />
          {mat('#ef4444')}
        </mesh>
      </group>
      <group position={[46, -40, 4]}>
        <mesh position={[0, 14, 0]} castShadow>
          <cylinderGeometry args={[8, 7, 28, 12]} />
          {mat('#94a3b8')}
        </mesh>
      </group>
      {/* 檯燈（非無菌，可點擊） */}
      <group
        position={[-30, 0, -18]}
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta < 6) onLamp();
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[4, 4.5, 1.2, 12]} />
          {mat('#475569')}
        </mesh>
        <mesh position={[0, 12, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 24, 6]} />
          {mat('#64748b')}
        </mesh>
        <mesh position={[8, 24, 6]} rotation={[0.3, 0, -1.2]}>
          <cylinderGeometry args={[0.45, 0.45, 18, 6]} />
          {mat('#64748b')}
        </mesh>
        <mesh position={[16, 26, 10]} rotation={[0.4, 0, 0.6]}>
          <coneGeometry args={[4, 4, 12, 1, true]} />
          <meshStandardMaterial color="#e2e8f0" side={THREE.DoubleSide} emissive="#fef9c3" emissiveIntensity={0.25} />
        </mesh>
      </group>
    </group>
  );
}

/** 依 zoom 平滑移動鏡頭（局部放大） */
function CameraRig({ zoom }: { zoom: 'room' | 'hand' | 'wound' }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const goal = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() });
  const active = useRef(true);
  useEffect(() => {
    const presets: Record<typeof zoom, { pos: [number, number, number]; target: [number, number, number] }> = {
      room: { pos: [0, 70, 75], target: [0, 0, 0] },
      hand: { pos: [0, 22, 20], target: [0, SKIN_Y, 0] },
      wound: { pos: [0, 10.5, 7.5], target: [0, SKIN_Y, 0] },
    };
    goal.current.pos.set(...presets[zoom].pos);
    goal.current.target.set(...presets[zoom].target);
    active.current = true;
  }, [zoom]);
  useEffect(() => {
    if (!controls) return;
    const stop = () => (active.current = false);
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);
  useFrame((_, dt) => {
    if (!active.current || !controls) return;
    const k = 1 - Math.exp(-dt * 4);
    camera.position.lerp(goal.current.pos, k);
    controls.target.lerp(goal.current.target, k);
    controls.update();
    if (camera.position.distanceTo(goal.current.pos) < 0.02) active.current = false;
  });
  return null;
}

export function Suture3D({
  state,
  dispatch,
  showRuler,
  showGuides,
  showMeasurements,
  judge,
}: {
  state: WSState;
  dispatch: (a: WSAction) => void;
  showRuler: boolean;
  showGuides: boolean;
  showMeasurements: boolean;
  /** 是否以顏色標示針距是否恰當（僅引導模式） */
  judge: boolean;
}) {
  const [zoom, setZoom] = useState<'room' | 'hand' | 'wound'>('wound');
  const [hover, setHover] = useState<Pt | null>(null);
  const w = state.work;
  const picking = w.phase === 'entry' || w.phase === 'exit';
  const iodine = analyzeDisinfection(state.disinfection.strokes);
  const gaps = stitchSpacings(state.stitches);
  const sortedX = state.stitches.map(stitchX).sort((a, b) => a - b);

  const toModel = (e: ThreeEvent<PointerEvent | MouseEvent>): Pt => ({ x: e.point.x, y: -e.point.z });

  return (
    <div className="relative h-full min-h-[18rem] overflow-hidden rounded-3xl bg-gradient-to-b from-sky-50 to-slate-200">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 40, 45], fov: 40, near: 0.5, far: 1000 }}>
        <color attach="background" args={['#eef5f9']} />
        <hemisphereLight args={['#ffffff', '#cbd5e1', 1]} />
        <directionalLight position={[20, 50, 25]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} />
        <pointLight position={[10, 30, 12]} intensity={300} distance={80} color="#fff7e0" />

        <Room onLamp={() => dispatch({ type: 'touch', hotspot: 'lamp' })} />
        <HandModel onSleeve={() => dispatch({ type: 'touch', hotspot: 'sleeve' })} />

        {/* 消毒範圍示意（優碘色） */}
        {iodine.started && (
          <mesh position={[0, SKIN_Y + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[Math.max(1.2, Math.min(5, iodine.coverageRadius)), 32]} />
            <meshStandardMaterial color="#9a4a1c" transparent opacity={0.28} depthWrite={false} />
          </mesh>
        )}
        <Wound />
        {state.drape.center && !state.drape.removed && <Drape3D center={state.drape.center} />}

        {/* 點選進出針的皮膚面 */}
        <mesh
          position={[0, SKIN_Y + 0.07, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerMove={(e) => picking && setHover(toModel(e))}
          onPointerOut={() => setHover(null)}
          onClick={(e) => {
            e.stopPropagation();
            if (e.delta > 6 || !picking) return;
            dispatch({ type: 'pickPoint', point: toModel(e) });
          }}
        >
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {showRuler &&
          Array.from({ length: MODEL.woundLength + 1 }, (_, i) => i - HALF_WOUND).map((x) => (
            <group key={x} position={[x, SKIN_Y + 0.1, 2.3]}>
              <mesh>
                <boxGeometry args={[0.04, 0.02, x === 0 ? 0.6 : 0.4]} />
                <meshBasicMaterial color="#1e3a8a" />
              </mesh>
              <Html center position={[0, 0, 0.6]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
                <span className="text-[10px] font-bold text-blue-900">{x}</span>
              </Html>
            </group>
          ))}
        {showRuler && (
          <mesh position={[0, SKIN_Y + 0.1, 2.3]}>
            <boxGeometry args={[MODEL.woundLength + 0.6, 0.02, 0.04]} />
            <meshBasicMaterial color="#1e3a8a" />
          </mesh>
        )}

        {/* 針距規劃參考線（提示第二層後顯示） */}
        {showGuides &&
          [-1, 0, 1].map((x) => (
            <mesh key={x} position={[x, SKIN_Y + 0.09, 0]}>
              <boxGeometry args={[0.03, 0.01, 3.2]} />
              <meshBasicMaterial color="#16a34a" transparent opacity={0.6} />
            </mesh>
          ))}

        {state.stitches.map((s) => (
          <Stitch3D key={s.id} entry={s.entry} exit={s.exit} knotSide={s.knotSide} />
        ))}
        {showMeasurements &&
          gaps.map((g, i) => (
            <Html key={i} center position={[(sortedX[i] + sortedX[i + 1]) / 2, SKIN_Y + 0.1, -1.9]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
              <span className={`whitespace-nowrap rounded px-1 text-[10px] font-bold ${!judge ? 'bg-white/90 text-slate-700' : g >= MODEL.spacingRange[0] && g <= MODEL.spacingRange[1] ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{g.toFixed(1)} cm</span>
            </Html>
          ))}

        {w.entry && (
          <mesh position={toWorld(w.entry, 0.08)}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={0.4} />
          </mesh>
        )}
        {w.exit && (
          <mesh position={toWorld(w.exit, 0.08)}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.4} />
          </mesh>
        )}
        {picking && hover && (
          <mesh position={toWorld(hover, 0.09)}>
            <ringGeometry args={[0.12, 0.18, 16]} />
            <meshBasicMaterial color={w.phase === 'entry' ? '#2563eb' : '#16a34a'} side={THREE.DoubleSide} />
          </mesh>
        )}
        <Needle3D state={state} />

        <OrbitControls makeDefault enableDamping minDistance={5} maxDistance={140} maxPolarAngle={Math.PI / 2.1} target={[0, SKIN_Y, 0]} />
        <CameraRig zoom={zoom} />
      </Canvas>

      <div className="absolute right-2 top-2 flex flex-col gap-1">
        {(
          [
            ['wound', '🔍 放大傷口'],
            ['hand', '✋ 手部'],
            ['room', '🏥 診間'],
          ] as const
        ).map(([z, label]) => (
          <button key={z} type="button" onClick={() => setZoom(z)} className={`rounded-full px-3 py-1 text-[11px] font-bold shadow ${zoom === z ? 'bg-blue-700 text-white' : 'bg-white/90 text-slate-600'}`}>
            {label}
          </button>
        ))}
      </div>
      {picking && hover && showMeasurements && (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-lg bg-slate-900/70 px-2 py-1 text-[11px] text-white">
          距傷口 {Math.abs(hover.y).toFixed(1)} cm · 沿傷口 {hover.x.toFixed(1)} cm
        </div>
      )}
    </div>
  );
}
