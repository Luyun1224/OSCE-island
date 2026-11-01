import { Html, OrbitControls, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CatmullRomCurve3, Vector3, type Group } from 'three';
import { chestFinding, maskSealed, type AWState } from '../engine';

/**
 * AirwayScene：急診呼吸道處置模擬室（3D）
 * 中央為「氣道管理訓練模型」：白色底板、頭頸、上胸殼，胸殼後方外露雙肺與胃袋（原創模型，不含任何品牌標示）。
 * 依案例規則：有效通氣時雙肺鼓起；過深時右肺為主；食道插管時胃袋鼓起。不代表真實生理。
 */
export type Scene3DPreset = 'panorama' | 'airway' | 'chest';

const PRESETS: Record<Scene3DPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  panorama: { pos: [0.85, 1.32, 0.62], target: [0.08, 0.78, -0.08] },
  airway: { pos: [0.34, 1.02, -0.42], target: [0, 0.83, -0.28] },
  chest: { pos: [0.42, 1.08, 0.4], target: [0, 0.78, 0.04] },
};

const SKIN = '#e9d3ad';
const SKIN_SHADE = '#dcc196';
const LUNG = '#e8937c';

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
    camera.position.lerp(goal, 0.14);
    (st.controls as unknown as { update?: () => void } | null)?.update?.();
    if (camera.position.distanceTo(goal) < 0.004) moving.current = false;
    else invalidate();
  });
  return null;
}

function Tag({ text, show, y = 0.1 }: { text: string; show: boolean; y?: number }) {
  if (!show) return null;
  return (
    <Html center position={[0, y, 0]} style={{ pointerEvents: 'none' }}>
      <span className="whitespace-nowrap rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-black text-amber-950 shadow">{text}</span>
    </Html>
  );
}

function Obj({ name, children, position, rotation, highlight, tagY }: { name: string; children: ReactNode; position?: [number, number, number]; rotation?: [number, number, number]; highlight: string[]; tagY?: number }) {
  const [hover, setHover] = useState(false);
  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      {children}
      <Tag text={name} show={hover || highlight.includes(name)} y={tagY} />
    </group>
  );
}

const skin = <meshStandardMaterial color={SKIN} roughness={0.62} />;

/** 單次通氣：依案例規則鼓起的部位 */
function useBreath(state: AWState) {
  const a = state.attempt;
  const n = state.preBreaths.length + state.reoxBreaths + a.postBreaths;
  let target: 'both' | 'right' | 'weak' | 'stomach' | 'none' = 'none';
  if (a.location !== 'none' && a.bagConnected) {
    const f = chestFinding(a);
    target = f.rise === 'none' ? (a.location === 'esophagus' ? 'stomach' : 'none') : f.rise === 'right' ? 'right' : f.rise === 'weak' ? 'weak' : 'both';
  } else if (state.mask.placed) target = maskSealed(state) ? 'both' : 'none';
  return { n, target };
}

function Lungs({ state, highlight }: { state: AWState; highlight: string[] }) {
  const { n, target } = useBreath(state);
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const stomach = useRef<Group>(null);
  const t0 = useRef(-10);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (n > 0) {
      t0.current = performance.now();
      invalidate();
    }
  }, [n, invalidate]);
  useFrame(() => {
    const t = (performance.now() - t0.current) / 1000;
    const k = t >= 0 && t < 1.4 ? Math.sin((Math.PI * t) / 1.4) : 0;
    const amp = (who: 'left' | 'right' | 'stomach') =>
      who === 'stomach' ? (target === 'stomach' ? 0.45 : 0) : target === 'both' ? 0.28 : target === 'weak' ? 0.08 : target === 'right' && who === 'right' ? 0.3 : 0;
    const set = (g: Group | null, who: 'left' | 'right' | 'stomach') => {
      if (!g) return;
      const s = 1 + amp(who) * k;
      g.scale.set(1 + (s - 1) * 0.5, s, 1 + (s - 1) * 0.4);
    };
    set(left.current, 'left');
    set(right.current, 'right');
    set(stomach.current, 'stomach');
    if (t < 1.4) invalidate();
  });
  // 模型座標：頭朝 -z、臉朝 +y；病人右側為 -x
  return (
    <group>
      <Obj name="右肺" position={[-0.065, 0.06, 0.12]} highlight={highlight} tagY={0.1}>
        <group ref={right}>
          <mesh castShadow scale={[0.062, 0.05, 0.1]}>
            <sphereGeometry args={[1, 28, 20]} />
            <meshStandardMaterial color={LUNG} roughness={0.55} />
          </mesh>
        </group>
      </Obj>
      <Obj name="左肺" position={[0.065, 0.06, 0.12]} highlight={highlight} tagY={0.1}>
        <group ref={left}>
          <mesh castShadow scale={[0.058, 0.048, 0.096]}>
            <sphereGeometry args={[1, 28, 20]} />
            <meshStandardMaterial color={LUNG} roughness={0.55} />
          </mesh>
        </group>
      </Obj>
      <Obj name="胃袋" position={[0.03, 0.03, 0.215]} highlight={highlight} tagY={0.08}>
        <group ref={stomach}>
          <mesh castShadow scale={[0.06, 0.032, 0.05]}>
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color="#d8846f" roughness={0.6} />
          </mesh>
        </group>
      </Obj>
    </group>
  );
}

function TubeLine({ points, radius, color, opacity = 1 }: { points: [number, number, number][]; radius: number; color: string; opacity?: number }) {
  const curve = useMemo(() => new CatmullRomCurve3(points.map((p) => new Vector3(...p))), [points]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 32, radius, 10, false]} />
      <meshStandardMaterial color={color} roughness={0.25} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

/** 頭部（含臉部五官與口部器材）；以頸部為軸依擺位後仰 */
function Head({ state, highlight }: { state: AWState; highlight: string[] }) {
  const ext = state.head.extension === 'moderate' ? -0.24 : state.head.extension === 'hyper' ? -0.48 : 0;
  const a = state.attempt;
  const tubeIn = a.location !== 'none';
  const maskOn = !!state.mask.placed && !tubeIn;
  const MOUTH: [number, number, number] = [0, 0.087, -0.093];
  return (
    <group position={[0, 0.1, -0.25]} rotation={[ext, 0, 0]}>
      <Obj name="氣管插管訓練模型（安妮）" highlight={highlight} tagY={0.2} position={[0, 0, 0]}>
        {/* 頭顱（臉朝 +y、頭頂朝 -z） */}
        <mesh castShadow position={[0, 0.0, -0.16]} scale={[0.08, 0.084, 0.116]}>
          <sphereGeometry args={[1, 48, 36]} />
          {skin}
        </mesh>
        {/* 頭髮（後腦與頭頂，霧面紋理色） */}
        <mesh position={[0, -0.012, -0.18]} scale={[0.083, 0.08, 0.108]}>
          <sphereGeometry args={[1, 48, 36, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.68]} />
          <meshStandardMaterial color={SKIN_SHADE} roughness={1} />
        </mesh>
        {/* 下顎與臉頰（與頭顱融合） */}
        <mesh position={[0, 0.03, -0.1]} scale={[0.058, 0.056, 0.062]}>
          <sphereGeometry args={[1, 40, 28]} />
          {skin}
        </mesh>
        {/* 額頭與眉弓 */}
        <mesh position={[0, 0.07, -0.176]} scale={[0.055, 0.02, 0.03]}>
          <sphereGeometry args={[1, 32, 20]} />
          {skin}
        </mesh>
        {/* 閉眼眼瞼 */}
        {[-0.03, 0.03].map((x) => (
          <mesh key={x} position={[x, 0.08, -0.158]} scale={[0.016, 0.008, 0.009]}>
            <sphereGeometry args={[1, 16, 10]} />
            <meshStandardMaterial color="#dcc196" roughness={0.7} />
          </mesh>
        ))}
        {[-0.03, 0.03].map((x) => (
          <mesh key={`l${x}`} position={[x, 0.0875, -0.154]} rotation={[-Math.PI / 2, 0, Math.PI]}>
            <torusGeometry args={[0.014, 0.0012, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#a8916a" />
          </mesh>
        ))}
        {/* 鼻 */}
        <mesh position={[0, 0.096, -0.133]} rotation={[0.45, 0, 0]} scale={[0.013, 0.03, 0.021]}>
          <sphereGeometry args={[1, 24, 16]} />
          {skin}
        </mesh>
        <mesh position={[0, 0.112, -0.12]} scale={[0.016, 0.011, 0.012]}>
          <sphereGeometry args={[1, 20, 14]} />
          {skin}
        </mesh>
        {/* 口（張開）與上下唇 */}
        <mesh position={[0, 0.088, -0.103]} scale={[0.02, 0.006, 0.006]}>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color="#d3a281" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.085, -0.083]} scale={[0.019, 0.006, 0.006]}>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color="#d3a281" roughness={0.55} />
        </mesh>
        <mesh position={MOUTH} scale={[0.015, 0.006, 0.009]}>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color="#5c1a1a" />
        </mesh>
        {/* 下巴 */}
        <mesh position={[0, 0.06, -0.06]} scale={[0.03, 0.024, 0.024]}>
          <sphereGeometry args={[1, 20, 14]} />
          {skin}
        </mesh>
        {/* 耳 */}
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.079, 0.0, -0.14]} rotation={[0, 0, sd * 0.15]}>
            <mesh scale={[0.01, 0.028, 0.019]}>
              <sphereGeometry args={[1, 20, 14]} />
              {skin}
            </mesh>
            <mesh position={[sd * 0.004, 0.0, 0.002]} scale={[0.005, 0.017, 0.01]}>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color="#c9ab7f" />
            </mesh>
          </group>
        ))}
      </Obj>

      {/* 袋瓣罩面罩 */}
      {maskOn && (
        <Obj name="袋瓣罩（Ambu bag）" position={[0, 0.13, -0.12]} highlight={highlight} tagY={0.16}>
          <mesh rotation={[state.mask.apexToHead ? 0 : Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.05, 0.04, 3, 1, true]} />
            <meshStandardMaterial color="#bfdbfe" transparent opacity={0.6} side={2} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 12]} />
            <meshStandardMaterial color="#1d4ed8" />
          </mesh>
          <mesh position={[0, 0.06, -0.12]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.6, 1]}>
            <sphereGeometry args={[0.055, 24, 16]} />
            <meshStandardMaterial color="#93c5fd" roughness={0.4} />
          </mesh>
        </Obj>
      )}

      {/* 喉頭鏡 */}
      {state.scopeUse.inserted && !a.bagConnected && (
        <Obj name="喉頭鏡" position={[0.0, 0.13, -0.075]} rotation={[state.scopeUse.lift === 'lever' ? -0.6 : 0.5, 0, 0]} highlight={highlight} tagY={0.16}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.11, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.005, -0.03]} rotation={[0.9, 0, 0]}>
            <boxGeometry args={[0.012, 0.004, 0.08]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.25} />
          </mesh>
          <pointLight position={[0, -0.02, -0.06]} intensity={0.25} distance={0.15} color="#fef08a" />
        </Obj>
      )}

      {/* 氣管內管、接頭與 pilot balloon */}
      {tubeIn && (
        <Obj name="氣管內管" highlight={highlight} tagY={0.24}>
          <TubeLine points={[[MOUTH[0], MOUTH[1] - 0.02, MOUTH[2]], [0, 0.12, -0.1], [0.006, 0.17, -0.098], [0.008, 0.2, -0.1]]} radius={0.0055} color="#9fdbe3" opacity={0.85} />
          <mesh position={[0.008, 0.21, -0.1]}>
            <cylinderGeometry args={[0.009, 0.009, 0.02, 16]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          <TubeLine points={[[0.004, 0.15, -0.099], [0.03, 0.17, -0.11], [0.05, 0.18, -0.12]]} radius={0.0012} color="#94a3b8" />
          <mesh position={[0.055, 0.182, -0.122]} scale={[0.008, 0.012, 0.008]}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#fdba74" />
          </mesh>
          {state.secured.tied && (
            <mesh position={[MOUTH[0], MOUTH[1] + 0.004, MOUTH[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.03, 0.003, 6, 24]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          )}
          {a.bagConnected && (
            <group position={[0.008, 0.24, -0.1]}>
              <mesh>
                <cylinderGeometry args={[0.012, 0.012, 0.03, 12]} />
                <meshStandardMaterial color="#1d4ed8" />
              </mesh>
              <mesh position={[0, 0.02, -0.11]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.6, 1]}>
                <sphereGeometry args={[0.05, 24, 16]} />
                <meshStandardMaterial color="#93c5fd" roughness={0.4} />
              </mesh>
            </group>
          )}
        </Obj>
      )}
    </group>
  );
}

/** 氣道管理訓練模型（原創造型） */
function Trainer({ state, highlight }: { state: AWState; highlight: string[] }) {
  return (
    <group position={[0, 0.715, 0]}>
      {/* 白色底板 */}
      <RoundedBox args={[0.6, 0.016, 0.98]} radius={0.007} smoothness={3} position={[0, 0.008, 0.02]} receiveShadow>
        <meshStandardMaterial color="#f5f6f8" roughness={0.4} />
      </RoundedBox>
      {[-0.46, 0.5].map((z) => (
        <mesh key={z} position={[0, 0.0165, z]}>
          <boxGeometry args={[0.18, 0.001, 0.04]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      ))}
      {/* 頭部支座 */}
      <mesh position={[0, 0.03, -0.38]}>
        <cylinderGeometry args={[0.03, 0.04, 0.03, 16]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      {state.head.towel && (
        <mesh position={[0, 0.035, state.head.towel === 'occiput' ? -0.42 : -0.16]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 16]} />
          <meshStandardMaterial color="#6ee7b7" roughness={0.9} />
        </mesh>
      )}
      <Head state={state} highlight={highlight} />
      {/* 頸部 */}
      <mesh position={[0, 0.085, -0.215]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.05, 0.18, 24]} />
        {skin}
      </mesh>
      {/* 上胸殼（單一平滑造型） */}
      <Obj name="胸廓" position={[0, 0.095, -0.06]} highlight={highlight} tagY={0.14}>
        <mesh castShadow scale={[0.17, 0.085, 0.105]}>
          <sphereGeometry args={[1, 48, 32]} />
          {skin}
        </mesh>
        <RoundedBox args={[0.3, 0.15, 0.14]} radius={0.06} smoothness={6} position={[0, -0.02, 0.035]} castShadow>
          {skin}
        </RoundedBox>
      </Obj>
      <Lungs state={state} highlight={highlight} />
      {/* 透明管路與空針 */}
      <TubeLine points={[[0.06, 0.03, 0.05], [0.12, 0.02, 0.12], [0.17, 0.018, 0.22], [0.2, 0.02, 0.3]]} radius={0.0035} color="#e2e8f0" opacity={0.7} />
      <group position={[0.2, 0.024, 0.36]} rotation={[0, 0.2, Math.PI / 2]}>
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.09, 16]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.85} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function Cart({ state, highlight }: { state: AWState; highlight: string[] }) {
  const tray = (id: keyof AWState['items']) => state.items[id] === 'tray';
  return (
    <group position={[0.72, 0, -0.35]}>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.03, 0.7]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {[-0.22, 0.22].flatMap((x) =>
        [-0.32, 0.32].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.39, z]}>
            <cylinderGeometry args={[0.012, 0.012, 0.78, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.5} />
          </mesh>
        )),
      )}
      <Obj name="器材盤" position={[0, 0.8, 0]} highlight={highlight} tagY={0.06}>
        <mesh>
          <boxGeometry args={[0.42, 0.012, 0.56]} />
          <meshStandardMaterial color="#4ade80" roughness={0.9} />
        </mesh>
      </Obj>
      {tray('handle') && (
        <Obj name="喉頭鏡握把" position={[-0.12, 0.82, -0.18]} rotation={[0, 0, Math.PI / 2]} highlight={highlight}>
          <mesh>
            <cylinderGeometry args={[0.016, 0.016, 0.12, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
          </mesh>
        </Obj>
      )}
      {tray('blade') && (
        <Obj name="喉頭鏡葉片" position={[0.04, 0.812, -0.18]} highlight={highlight}>
          <mesh>
            <boxGeometry args={[0.025, 0.006, 0.1]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.25} emissive={state.scope.lightChecked ? '#fde047' : '#000000'} emissiveIntensity={0.3} />
          </mesh>
        </Obj>
      )}
      {state.tube.size && state.attempt.location === 'none' && (
        <Obj name="氣管內管" position={[0, 0.812, 0.04]} rotation={[-Math.PI / 2, 0, 0]} highlight={highlight}>
          <mesh>
            <torusGeometry args={[0.08, 0.006, 8, 32, Math.PI * 1.2]} />
            <meshStandardMaterial color="#9fdbe3" transparent opacity={0.85} />
          </mesh>
        </Obj>
      )}
      {tray('syringe') && (
        <Obj name="10 mL 空針" position={[0.14, 0.815, 0.18]} rotation={[0, 0, Math.PI / 2]} highlight={highlight}>
          <mesh>
            <cylinderGeometry args={[0.009, 0.009, 0.09, 12]} />
            <meshStandardMaterial color="#e0f2fe" />
          </mesh>
        </Obj>
      )}
      {tray('stylet') && (
        <Obj name="通條" position={[-0.1, 0.81, 0.18]} rotation={[0, 0, Math.PI / 2]} highlight={highlight}>
          <mesh>
            <cylinderGeometry args={[0.003, 0.003, 0.2, 6]} />
            <meshStandardMaterial color="#a3a3a3" metalness={0.6} />
          </mesh>
        </Obj>
      )}
      {tray('bite') && (
        <Obj name="咬口器" position={[0.14, 0.818, -0.04]} highlight={highlight}>
          <RoundedBox args={[0.04, 0.02, 0.03]} radius={0.006}>
            <meshStandardMaterial color="#fde68a" />
          </RoundedBox>
        </Obj>
      )}
      {tray('ties') && (
        <Obj name="固定帶" position={[-0.13, 0.81, 0.02]} rotation={[-Math.PI / 2, 0, 0]} highlight={highlight}>
          <mesh>
            <torusGeometry args={[0.035, 0.006, 6, 20]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </Obj>
      )}
      {tray('stethoscope') && (
        <Obj name="聽診器" position={[0.08, 0.81, 0.26]} rotation={[-Math.PI / 2, 0, 0]} highlight={highlight}>
          <mesh>
            <torusGeometry args={[0.04, 0.005, 6, 24]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </Obj>
      )}
    </group>
  );
}

export default function AirwayScene({ state, preset, highlight = [], className }: { state: AWState; preset: Scene3DPreset; highlight?: string[]; className?: string }) {
  const a = state.attempt;
  return (
    <div className={className}>
      <Canvas shadows dpr={[1, 1.75]} frameloop="demand" camera={{ position: PRESETS.panorama.pos, fov: 38, near: 0.05 }}>
        <color attach="background" args={['#e8ecf6']} />
        <hemisphereLight args={['#ffffff', '#cbd5e1', 1.0]} />
        <directionalLight position={[1.2, 3, 1.5]} intensity={1.7} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-1.5, 1.5, -1]} intensity={0.5} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[6, 6]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>
        {/* 診察台 */}
        <RoundedBox args={[0.8, 0.08, 1.5]} radius={0.02} position={[0, 0.67, 0.1]} castShadow receiveShadow>
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
        </RoundedBox>
        {[-0.34, 0.34].flatMap((x) =>
          [-0.55, 0.75].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.32, z]}>
              <cylinderGeometry args={[0.02, 0.02, 0.64, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.5} />
            </mesh>
          )),
        )}
        <Trainer state={state} highlight={highlight} />
        <Cart state={state} highlight={highlight} />
        {/* 監視器（現行臨床安全補充：ETCO₂） */}
        <Obj name="監視器（ETCO₂）" position={[-0.6, 1.3, -0.6]} rotation={[0, 0.5, 0]} highlight={highlight}>
          <RoundedBox args={[0.36, 0.26, 0.04]} radius={0.015}>
            <meshStandardMaterial color="#0f172a" emissive={a.capno ? (a.location === 'trachea' ? '#14532d' : '#7f1d1d') : '#000000'} emissiveIntensity={0.7} />
          </RoundedBox>
          <mesh position={[0, -0.33, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.42, 8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </Obj>
        <Rig preset={preset} />
        <OrbitControls makeDefault target={PRESETS[preset].target} enablePan={false} minDistance={0.35} maxDistance={3.5} maxPolarAngle={1.45} />
      </Canvas>
    </div>
  );
}
