import { ContactShadows, Environment, Html, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ACESFilmicToneMapping, Box3, Mesh, Object3D, SRGBColorSpace, Vector3, type Material, type MeshStandardMaterial } from 'three';
import { chestFinding, maskSealed, type AWState } from '../engine';
import { AIRWAY_ASSETS, assetUrl } from './assets';

/**
 * AirwayScene：高擬真 3D 場景（只載入 GLB 資產，不以基本幾何體拼湊病人或器械）
 * - 渲染：ACES Filmic、sRGB、PCF soft shadows、環境光（Lightformer 柔光箱）、接觸陰影
 * - 案例規則驅動：雙肺／胃袋 morph target、頭部節點後仰、器械掛在 Mouth_Socket
 * 呼叫端需先以 realistic3DReady() 確認必要資產存在。
 */
export type Scene3DPreset = 'panorama' | 'airway' | 'chest';

/** 鏡頭相對於訓練模型中心（公尺） */
const PRESETS: Record<Scene3DPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  panorama: { pos: [1.1, 0.75, 1.0], target: [0, 0.05, 0] },
  airway: { pos: [0.35, 0.38, -0.55], target: [0, 0.1, -0.22] },
  chest: { pos: [0.45, 0.42, 0.42], target: [0, 0.05, 0.05] },
};

const has = (id: string, available: Set<string>) => available.has(id);
// 訓練模型放在場景原點：room.glb 需把診察台檯面中心置於原點（見 public/models/airway/README.md）
const url = (id: string) => assetUrl(AIRWAY_ASSETS.find((a) => a.id === id)!.file);

function Rig({ preset, center }: { preset: Scene3DPreset; center: Vector3 }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const moving = useRef(true);
  useEffect(() => {
    moving.current = true;
    invalidate();
  }, [preset, invalidate]);
  useFrame((st) => {
    if (!moving.current) return;
    const goal = new Vector3(...PRESETS[preset].pos).add(center);
    camera.position.lerp(goal, 0.14);
    (st.controls as unknown as { update?: () => void } | null)?.update?.();
    if (camera.position.distanceTo(goal) < 0.003) moving.current = false;
    else invalidate();
  });
  return null;
}

/** 所有網格啟用陰影；材質維持 GLB 原有 PBR（baseColor／roughness／metalness／normal／AO） */
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

function Instrument({ id, available, socket, visible, offset }: { id: string; available: Set<string>; socket: Object3D | null; visible: boolean; offset?: [number, number, number] }) {
  if (!visible || !has(id, available) || !socket) return null;
  return createPortal(<GLBInstance id={id} position={offset} />, socket);
}

function GLBInstance({ id, position }: { id: string; position?: [number, number, number] }) {
  const { scene } = useGLTF(url(id));
  const obj = useMemo(() => {
    const c = scene.clone(true);
    prepare(c);
    return c;
  }, [scene]);
  return <primitive object={obj} position={position} />;
}

/** 訓練模型：依案例規則驅動肺／胃 morph 與頭部後仰 */
function Trainer({ state, onCenter, children }: { state: AWState; onCenter: (c: Vector3) => void; children?: (sockets: { mouth: Object3D | null }) => ReactNode }) {
  const { scene } = useGLTF(url('trainer'));
  const invalidate = useThree((s) => s.invalidate);
  const head = useMemo(() => scene.getObjectByName('Head') ?? null, [scene]);
  const mouth = useMemo(() => scene.getObjectByName('Mouth_Socket') ?? null, [scene]);
  const baseRot = useRef(head?.rotation.x ?? 0);
  useEffect(() => {
    prepare(scene);
    const box = new Box3().setFromObject(scene);
    onCenter(box.getCenter(new Vector3()));
  }, [scene, onCenter]);

  useEffect(() => {
    if (!head) return;
    head.rotation.x = baseRot.current + (state.head.extension === 'moderate' ? -0.22 : state.head.extension === 'hyper' ? -0.45 : 0);
    invalidate();
  }, [head, state.head.extension, invalidate]);

  // 單次通氣的鼓起動畫
  const a = state.attempt;
  const n = state.preBreaths.length + state.reoxBreaths + a.postBreaths;
  let target: 'both' | 'right' | 'weak' | 'stomach' | 'none' = 'none';
  if (a.location !== 'none' && a.bagConnected) {
    const f = chestFinding(a);
    target = f.rise === 'none' ? (a.location === 'esophagus' ? 'stomach' : 'none') : f.rise === 'right' ? 'right' : f.rise === 'weak' ? 'weak' : 'both';
  } else if (state.mask.placed) target = maskSealed(state) ? 'both' : 'none';
  const t0 = useRef(-1e9);
  useEffect(() => {
    if (n > 0) {
      t0.current = performance.now();
      invalidate();
    }
  }, [n, invalidate]);
  useFrame(() => {
    const t = (performance.now() - t0.current) / 1000;
    const k = t >= 0 && t < 1.4 ? Math.sin((Math.PI * t) / 1.4) : 0;
    setMorph(scene, 'lung_inflate_L', target === 'both' ? k : target === 'weak' ? 0.25 * k : 0);
    setMorph(scene, 'lung_inflate_R', target === 'both' || target === 'right' ? k : target === 'weak' ? 0.25 * k : 0);
    setMorph(scene, 'stomach_inflate', target === 'stomach' ? k : 0);
    if (t < 1.4) invalidate();
  });

  return (
    <>
      <primitive object={scene} />
      {children?.({ mouth })}
    </>
  );
}

function Room({ onAnchors }: { onAnchors: (a: Record<string, Object3D | null>) => void }) {
  const { scene } = useGLTF(url('room'));
  useEffect(() => {
    prepare(scene);
    onAnchors({ trainer: scene.getObjectByName('Trainer_Anchor') ?? null, cart: scene.getObjectByName('Cart_Anchor') ?? null, monitor: scene.getObjectByName('Monitor_Anchor') ?? null });
  }, [scene, onAnchors]);
  return <primitive object={scene} />;
}

export default function AirwayScene({ state, preset, available, className }: { state: AWState; preset: Scene3DPreset; available: Set<string>; highlight?: string[]; className?: string }) {
  const center = useRef(new Vector3());
  const [anchors, setAnchors] = useState<Record<string, Object3D | null>>({});
  const a = state.attempt;
  const tubeIn = a.location !== 'none';
  return (
    <div className={className}>
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        frameloop="demand"
        camera={{ position: [1.2, 1.5, 1.2], fov: 35, near: 0.02, far: 50 }}
        gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace }}
      >
        <Suspense fallback={<Html center>載入高擬真模型中…</Html>}>
          {/* 臨床技能中心的柔光照明（平板燈＋窗光），不依賴外部 HDRI */}
          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={2.2} position={[0, 3, 0]} rotation-x={Math.PI / 2} scale={[4, 2, 1]} />
            <Lightformer form="rect" intensity={1.2} position={[-3, 1.5, 0]} rotation-y={Math.PI / 2} scale={[3, 2, 1]} color="#fff7ed" />
            <Lightformer form="rect" intensity={0.6} position={[3, 1.2, -1]} rotation-y={-Math.PI / 2} scale={[3, 1.5, 1]} color="#e0f2fe" />
          </Environment>
          <directionalLight position={[1.5, 3.2, 1.2]} intensity={1.1} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
          <Room onAnchors={setAnchors} />
          {/* 器材車與監視器掛在場景錨點（未提供則不顯示，不以幾何體代替） */}
          <Instrument id="cart" available={available} socket={anchors.cart ?? null} visible />
          <Instrument id="monitor" available={available} socket={anchors.monitor ?? null} visible />
          <Trainer state={state} onCenter={(c) => center.current.copy(c)}>
            {({ mouth }) => (
              <>
                <Instrument id="bvm" available={available} socket={mouth} visible={(!!state.mask.placed && !tubeIn) || a.bagConnected} />
                <Instrument id="laryngoscope" available={available} socket={mouth} visible={state.scopeUse.inserted && !a.bagConnected} />
                <Instrument id="ett" available={available} socket={mouth} visible={tubeIn} />
                <Instrument id="bite" available={available} socket={mouth} visible={tubeIn && state.secured.bite} />
                <Instrument id="ties" available={available} socket={mouth} visible={tubeIn && state.secured.tied} />
              </>
            )}
          </Trainer>
          <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={3} blur={2.4} far={1.2} />
          <Rig preset={preset} center={center.current} />
        </Suspense>
        <OrbitControls makeDefault target={new Vector3(...PRESETS[preset].target).add(center.current)} enablePan={false} minDistance={0.25} maxDistance={4} maxPolarAngle={1.5} />
      </Canvas>
    </div>
  );
}
