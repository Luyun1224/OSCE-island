import { ContactShadows, Environment, Lightformer, Line, OrbitControls, RoundedBox, useGLTF } from '@react-three/drei';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import { Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { ACESFilmicToneMapping, CatmullRomCurve3, DoubleSide, Mesh, Object3D, PlaneGeometry, SRGBColorSpace, Shape, Vector3, type Group, type Material, type MeshStandardMaterial } from 'three';
import { chestFinding, maskSealed, type AWState } from '../engine';
import { AIRWAY_ASSETS, assetUrl } from './assets';
import { PhotoRelief } from './PhotoRelief';
import { proceduralPBR } from './textures';

/**
 * AirwayScene：臨床模擬病房 3D 主場景（perspective camera）
 *  - 建築與軟裝（地板、牆面、天花平板燈、隔簾、床頭設備帶）與病床：程式建模＋PBR 貼圖，依真實尺寸
 *  - 病人／訓練模型、面罩、管路與器械：只載入 GLB 資產；缺少時病人位置顯示明確標示的「模型待補」全像輪廓，
 *    絕不以幾何體拼湊人體冒充完成品
 *  - 渲染：ACES、sRGB、soft shadows、環境柔光、接觸陰影、N8AO 環境光遮蔽
 *  - 呼吸起伏：依案例規則（面罩密合／管路位置）驅動
 */
export type Scene3DPreset = 'panorama' | 'airway' | 'chest';

/** 病床座標：床長軸為 z，頭端在 -z；床墊表面高 0.62 m */
const PRESETS: Record<Scene3DPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  panorama: { pos: [1.75, 1.75, 1.55], target: [0, 0.68, -0.2] },
  airway: { pos: [0.08, 1.38, -0.02], target: [0, 0.68, -0.62] },
  chest: { pos: [1.05, 1.32, 0.15], target: [0, 0.66, -0.4] },
};
const MATTRESS_TOP = 0.62;

const url = (id: string) => assetUrl(AIRWAY_ASSETS.find((a) => a.id === id)!.file);

/* ---------------- 鏡頭 ---------------- */
function Rig({ preset }: { preset: Scene3DPreset }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const moving = useRef(true);
  useEffect(() => {
    moving.current = true;
    invalidate();
  }, [preset, invalidate]);
  useFrame((st) => {
    if (!moving.current) return;
    const goal = new Vector3(...PRESETS[preset].pos);
    camera.position.lerp(goal, 0.12);
    (st.controls as unknown as { update?: () => void } | null)?.update?.();
    if (camera.position.distanceTo(goal) < 0.003) moving.current = false;
    else invalidate();
  });
  return null;
}

/* ---------------- 材質 ---------------- */
function useMaterials() {
  return useMemo(
    () => ({
      floor: proceduralPBR('floor-vinyl', { base: [196, 204, 210], vary: 0.18, kind: 'speckle', repeat: 6, rough: [0.45, 0.75], strength: 1.2 }),
      wall: proceduralPBR('wall-paint', { base: [232, 236, 238], vary: 0.06, kind: 'paint', repeat: 3, rough: [0.8, 0.95], strength: 0.6 }),
      mattress: proceduralPBR('mattress', { base: [92, 128, 160], vary: 0.12, kind: 'weave', repeat: 8, rough: [0.55, 0.8], strength: 1.6 }),
      linen: proceduralPBR('linen', { base: [238, 242, 246], vary: 0.08, kind: 'weave', repeat: 10, rough: [0.75, 0.95], strength: 2.2 }),
      curtain: proceduralPBR('curtain', { base: [150, 190, 200], vary: 0.1, kind: 'weave', repeat: 6, rough: [0.8, 0.95], strength: 2.0 }),
    }),
    [],
  );
}

/* ---------------- 房間（建築） ---------------- */
function Room() {
  const m = useMaterials();
  const curtainGeo = useMemo(() => {
    const g = new PlaneGeometry(2.0, 2.3, 120, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 26) * 0.035);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial {...m.floor} roughness={1} />
      </mesh>
      {/* 床頭牆與側牆 */}
      <mesh position={[0, 1.4, -1.45]} receiveShadow>
        <planeGeometry args={[9, 2.8]} />
        <meshStandardMaterial {...m.wall} roughness={1} />
      </mesh>
      <mesh position={[-2.6, 1.4, 1.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7, 2.8]} />
        <meshStandardMaterial {...m.wall} roughness={1} />
      </mesh>
      {/* 牆裙 */}
      <mesh position={[0, 0.06, -1.44]}>
        <boxGeometry args={[9, 0.12, 0.02]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>
      {/* 床頭設備帶（醫療氣體出口、插座、閱讀燈） */}
      <group position={[0, 1.38, -1.41]}>
        <RoundedBox args={[2.4, 0.26, 0.08]} radius={0.02} castShadow receiveShadow>
          <meshStandardMaterial color="#e5e7eb" roughness={0.35} metalness={0.1} />
        </RoundedBox>
        {[-0.5, -0.3, 0.3, 0.5].map((x, i) => (
          <mesh key={x} position={[x, 0, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 24]} />
            <meshStandardMaterial color={['#ffffff', '#1d4ed8', '#16a34a', '#facc15'][i]} roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.1, 0.045]}>
          <boxGeometry args={[2.3, 0.02, 0.01]} />
          <meshStandardMaterial color="#fff7ed" emissive="#fff7ed" emissiveIntensity={0.8} />
        </mesh>
      </group>
      {/* 天花平板燈 */}
      {[-0.4, 1.0].map((z) => (
        <mesh key={z} position={[0, 2.79, z]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 0.6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} side={DoubleSide} />
        </mesh>
      ))}
      {/* 隔簾軌道與隔簾 */}
      <mesh position={[-1.5, 2.6, 0]}>
        <boxGeometry args={[0.03, 0.03, 2.9]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh geometry={curtainGeo} position={[-1.5, 1.42, 0.45]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...m.curtain} roughness={1} side={DoubleSide} />
      </mesh>
    </group>
  );
}

/* ---------------- 病床（依真實尺寸程式建模，可由 hospital-bed.glb 取代） ---------------- */
function roundedRect(w: number, h: number, r: number) {
  const s = new Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

function Bed({ pillow = true }: { pillow?: boolean }) {
  const m = useMaterials();
  const board = useMemo(() => roundedRect(0.98, 0.5, 0.08), []);
  const rail = useMemo(() => {
    const pts = [
      [0, 0, -0.42],
      [0, 0.24, -0.42],
      [0, 0.28, -0.36],
      [0, 0.28, 0.36],
      [0, 0.24, 0.42],
      [0, 0, 0.42],
    ].map((p) => new Vector3(...(p as [number, number, number])));
    return new CatmullRomCurve3(pts, false, 'catmullrom', 0.2);
  }, []);
  const metal = <meshStandardMaterial color="#9aa5b1" metalness={0.75} roughness={0.28} />;
  const plastic = <meshStandardMaterial color="#d6dde4" roughness={0.42} metalness={0.05} />;
  const extrude = { depth: 0.04, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 3 };
  return (
    <group>
      {/* 底盤與腳輪 */}
      <RoundedBox args={[0.82, 0.1, 1.86]} radius={0.04} position={[0, 0.2, 0]} castShadow receiveShadow>
        {plastic}
      </RoundedBox>
      {[-0.36, 0.36].flatMap((x) =>
        [-0.85, 0.85].map((z) => (
          <group key={`${x}${z}`} position={[x, 0.065, z]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.055, 0.055, 0.04, 28]} />
              <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.09, 12]} />
              {metal}
            </mesh>
          </group>
        )),
      )}
      {/* 升降柱與床架 */}
      <RoundedBox args={[0.32, 0.26, 0.5]} radius={0.03} position={[0, 0.37, 0]} castShadow>
        {plastic}
      </RoundedBox>
      <RoundedBox args={[0.94, 0.05, 2.06]} radius={0.02} position={[0, 0.51, 0]} castShadow receiveShadow>
        {metal}
      </RoundedBox>
      {/* 床墊、床單、枕頭 */}
      <RoundedBox args={[0.88, 0.1, 1.98]} radius={0.045} smoothness={6} position={[0, 0.57, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...m.mattress} roughness={1} />
      </RoundedBox>
      <RoundedBox args={[0.92, 0.012, 1.62]} radius={0.006} position={[0, MATTRESS_TOP + 0.002, 0.12]} receiveShadow>
        <meshStandardMaterial {...m.linen} roughness={1} />
      </RoundedBox>
      {pillow && (
        <RoundedBox args={[0.6, 0.11, 0.38]} radius={0.05} smoothness={8} position={[0, MATTRESS_TOP + 0.05, -0.8]} rotation={[0.08, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...m.linen} roughness={1} />
        </RoundedBox>
      )}
      {/* 床頭板、床尾板 */}
      <mesh position={[0, 0.78, -1.07]} castShadow receiveShadow>
        <extrudeGeometry args={[board, extrude]} />
        {plastic}
      </mesh>
      <mesh position={[0, 0.72, 1.05]} scale={[1, 0.8, 1]} castShadow receiveShadow>
        <extrudeGeometry args={[board, extrude]} />
        {plastic}
      </mesh>
      {/* 頭側床欄（雙側） */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.47, MATTRESS_TOP + 0.02, -0.45]}>
          <mesh castShadow>
            <tubeGeometry args={[rail, 48, 0.014, 12, false]} />
            {metal}
          </mesh>
          <mesh position={[0, 0.13, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.78, 0.2]} />
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.45} roughness={0.15} side={DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------------- 病人（GLB） ---------------- */
function prepare(root: Object3D) {
  root.traverse((o) => {
    if ((o as Mesh).isMesh) {
      const m = o as Mesh;
      m.castShadow = true;
      m.receiveShadow = true;
      const mats = (Array.isArray(m.material) ? m.material : [m.material]) as Material[];
      for (const mat of mats) if ((mat as MeshStandardMaterial).map) (mat as MeshStandardMaterial).map!.colorSpace = SRGBColorSpace;
    }
  });
}

function setMorph(root: Object3D, key: string, value: number) {
  root.traverse((o) => {
    const m = o as Mesh;
    const i = m.morphTargetDictionary?.[key];
    if (i !== undefined && m.morphTargetInfluences) m.morphTargetInfluences[i] = value;
  });
}

type BreathTarget = 'both' | 'right' | 'weak' | 'stomach' | 'none';

/** 案例規則：本次通氣會讓哪裡起伏 */
function useBreath(state: AWState) {
  const a = state.attempt;
  const n = state.preBreaths.length + state.reoxBreaths + a.postBreaths;
  let target: BreathTarget = 'none';
  if (a.location !== 'none' && a.bagConnected) {
    const f = chestFinding(a);
    target = f.rise === 'none' ? (a.location === 'esophagus' ? 'stomach' : 'none') : f.rise === 'right' ? 'right' : f.rise === 'weak' ? 'weak' : 'both';
  } else if (state.mask.placed) target = maskSealed(state) ? 'both' : 'none';
  return { n, target };
}

/** 0–1 的單次通氣起伏曲線 */
function useBreathCurve(n: number) {
  const invalidate = useThree((s) => s.invalidate);
  const t0 = useRef(-1e9);
  useEffect(() => {
    if (n > 0) {
      t0.current = performance.now();
      invalidate();
    }
  }, [n, invalidate]);
  return () => {
    const t = (performance.now() - t0.current) / 1000;
    if (t < 1.6) invalidate();
    return t >= 0 && t < 1.6 ? Math.sin((Math.PI * t) / 1.6) : 0;
  };
}

function PatientGLB({ id, state, children }: { id: 'patient' | 'trainer'; state: AWState; children?: (mouth: Object3D | null) => ReactNode }) {
  const { scene } = useGLTF(url(id));
  const head = useMemo(() => scene.getObjectByName('Head') ?? null, [scene]);
  const mouth = useMemo(() => scene.getObjectByName('Mouth_Socket') ?? null, [scene]);
  const base = useRef(head?.rotation.x ?? 0);
  const { n, target } = useBreath(state);
  const curve = useBreathCurve(n);
  useEffect(() => prepare(scene), [scene]);
  useEffect(() => {
    if (head) head.rotation.x = base.current + (state.head.extension === 'moderate' ? -0.22 : state.head.extension === 'hyper' ? -0.45 : 0);
  }, [head, state.head.extension]);
  useFrame(() => {
    const k = curve();
    setMorph(scene, 'breath', target === 'both' || target === 'right' ? k : target === 'weak' ? 0.3 * k : 0);
    setMorph(scene, 'lung_inflate_L', target === 'both' ? k : target === 'weak' ? 0.25 * k : 0);
    setMorph(scene, 'lung_inflate_R', target === 'both' || target === 'right' ? k : target === 'weak' ? 0.25 * k : 0);
    setMorph(scene, 'stomach_inflate', target === 'stomach' ? k : 0);
  });
  return (
    <>
      <primitive object={scene} position={[0, MATTRESS_TOP + 0.01, 0]} />
      {children?.(mouth)}
    </>
  );
}

function GLBInstance({ id }: { id: string }) {
  const { scene } = useGLTF(url(id));
  const obj = useMemo(() => {
    const c = scene.clone(true);
    prepare(c);
    return c;
  }, [scene]);
  return <primitive object={obj} />;
}

function Attach({ id, available, socket, visible }: { id: string; available: Set<string>; socket: Object3D | null; visible: boolean }) {
  if (!visible || !socket || !available.has(id)) return null;
  return createPortal(<GLBInstance id={id} />, socket);
}

/** 照片浮雕訓練模型：依案例規則把通氣傳給肺部遮罩 */
function ReliefTrainer({ state }: { state: AWState }) {
  const { n, target } = useBreath(state);
  const curve = useBreathCurve(n);
  const breath = () => {
    const k = curve();
    return {
      r: target === 'both' || target === 'right' ? k : target === 'weak' ? 0.3 * k : 0,
      l: target === 'both' ? k : target === 'weak' ? 0.3 * k : 0,
      s: target === 'stomach' ? k : 0,
    };
  };
  return <PhotoRelief position={[0, MATTRESS_TOP + 0.014, -0.45]} breath={breath} />;
}

/* ---------------- 缺少病人資產時：明確標示的全像輪廓（位置標記，非完成品） ---------------- */
const SILHOUETTE: [number, number][] = [
  [0, -0.88], [0.05, -0.865], [0.085, -0.82], [0.09, -0.77], [0.075, -0.72], [0.05, -0.69], [0.05, -0.65], [0.2, -0.62], [0.23, -0.58],
  [0.24, -0.4], [0.27, -0.2], [0.28, 0.0], [0.26, 0.08], [0.2, 0.06], [0.19, 0.12], [0.17, 0.2], [0.14, 0.55], [0.12, 0.85], [0.06, 0.88], [0.03, 0.55], [0, 0.2],
];
const outline = (): [number, number, number][] => {
  const y = (z: number) => MATTRESS_TOP + (z < -0.62 ? 0.12 : 0.03);
  const right = SILHOUETTE.map(([x, z]) => [x, y(z), z] as [number, number, number]);
  const left = [...SILHOUETTE].reverse().map(([x, z]) => [-x, y(z), z] as [number, number, number]);
  return [...right, ...left];
};
const ellipse = (rx: number, rz: number, n: number) => Array.from({ length: n + 1 }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * rx, 0, Math.sin((i / n) * Math.PI * 2) * rz] as [number, number, number]);

function PatientPlaceholder({ state }: { state: AWState }) {
  const { n, target } = useBreath(state);
  const curve = useBreathCurve(n);
  const chest = useRef<Group>(null);
  const belly = useRef<Group>(null);
  useFrame(() => {
    const k = curve();
    const c = target === 'both' ? 0.18 : target === 'right' ? 0.12 : target === 'weak' ? 0.05 : 0;
    chest.current?.scale.setScalar(1 + c * k);
    belly.current?.scale.setScalar(1 + (target === 'stomach' ? 0.22 : 0) * k);
  });
  const pts = useMemo(outline, []);
  return (
    <group>
      <Line points={pts} color="#22d3ee" lineWidth={2} transparent opacity={0.85} dashed dashSize={0.03} gapSize={0.015} />
      <group ref={chest} position={[0, MATTRESS_TOP + 0.031, -0.42]}>
        <Line points={ellipse(0.17, 0.13, 48)} color="#67e8f9" lineWidth={1.5} transparent opacity={0.8} />
      </group>
      <group ref={belly} position={[0, MATTRESS_TOP + 0.031, -0.12]}>
        <Line points={ellipse(0.1, 0.07, 32)} color="#fbbf24" lineWidth={1.2} transparent opacity={0.7} />
      </group>
    </group>
  );
}

/* ---------------- 主場景 ---------------- */
export default function AirwayScene({ state, preset, available, className, quality = 'high' }: { state: AWState; preset: Scene3DPreset; available: Set<string>; highlight?: string[]; className?: string; quality?: 'high' | 'low' }) {
  const a = state.attempt;
  const tubeIn = a.location !== 'none';
  const patientId = available.has('patient') ? 'patient' : available.has('trainer') ? 'trainer' : null;
  const relief = !patientId && available.has('trainerPhoto');
  return (
    <div className={className}>
      <Canvas
        shadows="soft"
        dpr={quality === 'high' ? [1, 1.75] : 1}
        frameloop="demand"
        camera={{ position: PRESETS.panorama.pos, fov: 38, near: 0.05, far: 40 }}
        gl={{ antialias: false, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.15, outputColorSpace: SRGBColorSpace }}
      >
        <color attach="background" args={['#dfe6ec']} />
        <Suspense fallback={null}>
          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={2.4} position={[0, 2.7, -0.4]} rotation-x={Math.PI / 2} scale={[1.2, 0.6, 1]} />
            <Lightformer form="rect" intensity={2.4} position={[0, 2.7, 1.0]} rotation-x={Math.PI / 2} scale={[1.2, 0.6, 1]} />
            <Lightformer form="rect" intensity={0.9} position={[-2.5, 1.5, 0.5]} rotation-y={Math.PI / 2} scale={[3, 1.6, 1]} color="#fff4e6" />
            <Lightformer form="rect" intensity={0.5} position={[2.5, 1.4, 0]} rotation-y={-Math.PI / 2} scale={[3, 1.6, 1]} color="#e0f2fe" />
          </Environment>
        </Suspense>
        <ambientLight intensity={0.15} />
        <directionalLight position={[0.8, 2.6, 0.6]} intensity={1.25} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} shadow-camera-left={-2} shadow-camera-right={2} shadow-camera-top={2} shadow-camera-bottom={-2} />
        <spotLight position={[0, 2.4, -0.6]} angle={0.6} penumbra={0.8} intensity={6} distance={4} castShadow color="#fffaf0" />
        <Room />
        <Bed pillow={!relief} />
        <Suspense fallback={null}>
          {patientId ? (
            <PatientGLB id={patientId} state={state}>
              {(mouth) => (
                <>
                  <Attach id="bvm" available={available} socket={mouth} visible={(!!state.mask.placed && !tubeIn) || a.bagConnected} />
                  <Attach id="laryngoscope" available={available} socket={mouth} visible={state.scopeUse.inserted && !a.bagConnected} />
                  <Attach id="ett" available={available} socket={mouth} visible={tubeIn} />
                  <Attach id="bite" available={available} socket={mouth} visible={tubeIn && state.secured.bite} />
                  <Attach id="ties" available={available} socket={mouth} visible={tubeIn && state.secured.tied} />
                </>
              )}
            </PatientGLB>
          ) : relief ? (
            <ReliefTrainer state={state} />
          ) : (
            <PatientPlaceholder state={state} />
          )}
        </Suspense>
        <ContactShadows position={[0, 0.002, 0]} opacity={0.5} scale={4} blur={2.2} far={1.4} resolution={512} />
        {quality === 'high' && (
          <EffectComposer multisampling={4}>
            <N8AO aoRadius={0.35} distanceFalloff={0.6} intensity={2.2} halfRes />
          </EffectComposer>
        )}
        <Rig preset={preset} />
        <OrbitControls makeDefault target={PRESETS[preset].target} enablePan={false} minDistance={0.5} maxDistance={4} minPolarAngle={0.2} maxPolarAngle={1.45} />
      </Canvas>
    </div>
  );
}
