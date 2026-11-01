import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Vector3 } from 'three';
import type { AWState } from '../engine';

/**
 * AirwayScene：低多邊形急診呼吸道處置模擬室（3D 總覽）
 * 只呈現目前的模擬狀態與鏡頭；操作判斷在 React 階段元件與引擎中。
 * 人形為教學示意模型，不代表真實解剖。
 */
export type Scene3DPreset = 'panorama' | 'airway' | 'chest';

const PRESETS: Record<Scene3DPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  panorama: { pos: [2.2, 2.2, 2.6], target: [0.2, 0.7, 0] },
  airway: { pos: [0, 1.55, -1.75], target: [0, 0.85, -0.85] },
  chest: { pos: [0.9, 1.7, 0.1], target: [0, 0.82, -0.35] },
};

const flat = { flatShading: true } as const;

function Rig({ preset }: { preset: Scene3DPreset }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as { target: Vector3; update: () => void } | null;
  const invalidate = useThree((s) => s.invalidate);
  const moving = useRef(true);
  useEffect(() => {
    moving.current = true;
    invalidate();
  }, [preset, invalidate]);
  useFrame(() => {
    if (!moving.current) return;
    const p = PRESETS[preset];
    const goal = new Vector3(...p.pos);
    camera.position.lerp(goal, 0.12);
    if (controls) {
      controls.target.lerp(new Vector3(...p.target), 0.12);
      controls.update();
    } else camera.lookAt(...p.target);
    if (camera.position.distanceTo(goal) < 0.01) moving.current = false;
    else invalidate();
  });
  return null;
}

function Label({ text, show }: { text: string; show: boolean }) {
  if (!show) return null;
  return (
    <Html center position={[0, 0.22, 0]} style={{ pointerEvents: 'none' }}>
      <span className="whitespace-nowrap rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-black text-amber-950 shadow">{text}</span>
    </Html>
  );
}

function Obj({ name, children, position, rotation, highlight }: { name: string; children: ReactNode; position: [number, number, number]; rotation?: [number, number, number]; highlight: string[] }) {
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
      <Label text={name} show={hover || highlight.includes(name)} />
    </group>
  );
}

export default function AirwayScene({ state, preset, highlight = [], className }: { state: AWState; preset: Scene3DPreset; highlight?: string[]; className?: string }) {
  const a = state.attempt;
  const tray = (id: keyof AWState['items']) => state.items[id] === 'tray';
  const skin = '#f2c4a0';
  return (
    <div className={className}>
      <Canvas shadows dpr={[1, 1.75]} frameloop="demand" camera={{ position: PRESETS.panorama.pos, fov: 42 }}>
        <color attach="background" args={['#e0e7ff']} />
        <hemisphereLight args={['#ffffff', '#cbd5e1', 1.1]} />
        <directionalLight position={[2, 4, 1]} intensity={1.6} castShadow />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[7, 7]} />
          <meshStandardMaterial color="#f1f5f9" {...flat} />
        </mesh>
        {/* 急診床 */}
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 0.12, 2.2]} />
          <meshStandardMaterial color="#94a3b8" {...flat} />
        </mesh>
        <mesh position={[0, 0.66, 0]} receiveShadow>
          <boxGeometry args={[0.92, 0.1, 2.1]} />
          <meshStandardMaterial color="#e2e8f0" {...flat} />
        </mesh>
        {/* 安妮：頭部朝 -z（操作者站在床頭） */}
        <group position={[0, 0.74, 0]}>
          <Obj name="氣管插管訓練模型（安妮）" position={[0, 0.12 + (state.head.confirmedSniffing ? 0.03 : 0), -0.85]} rotation={[state.head.extension === 'moderate' ? -0.25 : state.head.extension === 'hyper' ? -0.55 : 0, 0, 0]} highlight={highlight}>
            <mesh castShadow>
              <icosahedronGeometry args={[0.15, 1]} />
              <meshStandardMaterial color={skin} {...flat} />
            </mesh>
            <mesh position={[0, 0.1, 0.05]}>
              <boxGeometry args={[0.07, 0.03, 0.04]} />
              <meshStandardMaterial color="#9f1239" {...flat} />
            </mesh>
          </Obj>
          {state.head.towel && (
            <mesh position={[0, 0.02, state.head.towel === 'occiput' ? -0.88 : -0.62]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.36, 8]} />
              <meshStandardMaterial color="#6ee7b7" {...flat} />
            </mesh>
          )}
          <mesh position={[0, 0.06, -0.62]}>
            <cylinderGeometry args={[0.06, 0.06, 0.12, 6]} />
            <meshStandardMaterial color={skin} {...flat} />
          </mesh>
          <Obj name="胸廓" position={[0, 0.08, -0.25]} highlight={highlight}>
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.2, 0.62]} />
              <meshStandardMaterial color="#bfdbfe" {...flat} />
            </mesh>
          </Obj>
          <mesh position={[0, 0.06, 0.4]} castShadow>
            <boxGeometry args={[0.46, 0.16, 0.6]} />
            <meshStandardMaterial color="#c7d2fe" {...flat} />
          </mesh>
        </group>
        {/* 袋瓣罩：面罩在臉上或接在氣管內管 */}
        {(state.mask.placed || a.bagConnected) && (
          <Obj name="袋瓣罩（Ambu bag）" position={[0, 1.05, -1.0]} rotation={[0.4, 0, 0]} highlight={highlight}>
            <mesh>
              <sphereGeometry args={[0.1, 8, 6]} />
              <meshStandardMaterial color="#93c5fd" {...flat} />
            </mesh>
            <mesh position={[0, -0.08, 0.1]} scale={[1, 0.6, 1]}>
              <boxGeometry args={[0.24, 0.12, 0.14]} />
              <meshStandardMaterial color="#bfdbfe" transparent opacity={0.85} {...flat} />
            </mesh>
          </Obj>
        )}
        {/* 喉頭鏡 */}
        {state.scopeUse.inserted && (
          <Obj name="喉頭鏡" position={[0.06, 1.0, -0.98]} rotation={[0.9, 0, 0]} highlight={highlight}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 0.18, 6]} />
              <meshStandardMaterial color="#94a3b8" {...flat} />
            </mesh>
            <pointLight position={[0, -0.12, 0.06]} intensity={0.6} distance={0.4} color="#fef08a" />
          </Obj>
        )}
        {/* 氣管內管 */}
        {a.location !== 'none' && (
          <Obj name="氣管內管" position={[0, 0.98, -0.95]} rotation={[0.6, 0, 0]} highlight={highlight}>
            <mesh>
              <cylinderGeometry args={[0.012, 0.012, 0.22, 6]} />
              <meshStandardMaterial color="#e2e8f0" {...flat} />
            </mesh>
            {state.secured.tied && (
              <mesh position={[0, -0.06, 0]}>
                <torusGeometry args={[0.05, 0.008, 4, 10]} />
                <meshStandardMaterial color="#f8fafc" {...flat} />
              </mesh>
            )}
          </Obj>
        )}
        {/* 工作車與器材盤 */}
        <group position={[0.95, 0, -0.6]}>
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.04, 0.8]} />
            <meshStandardMaterial color="#e2e8f0" {...flat} />
          </mesh>
          {[-0.27, 0.27].flatMap((x) =>
            [-0.37, 0.37].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 0.4, z]}>
                <cylinderGeometry args={[0.015, 0.015, 0.8, 5]} />
                <meshStandardMaterial color="#64748b" {...flat} />
              </mesh>
            )),
          )}
          <Obj name="器材盤" position={[0, 0.83, 0]} highlight={highlight}>
            <mesh>
              <boxGeometry args={[0.5, 0.02, 0.6]} />
              <meshStandardMaterial color="#4ade80" {...flat} />
            </mesh>
          </Obj>
          {tray('handle') && (
            <Obj name="喉頭鏡握把" position={[-0.15, 0.88, -0.2]} rotation={[0, 0, Math.PI / 2]} highlight={highlight}>
              <mesh>
                <cylinderGeometry args={[0.025, 0.025, 0.16, 6]} />
                <meshStandardMaterial color="#94a3b8" {...flat} />
              </mesh>
            </Obj>
          )}
          {tray('blade') && (
            <Obj name="喉頭鏡葉片" position={[0.05, 0.86, -0.2]} highlight={highlight}>
              <mesh>
                <boxGeometry args={[0.04, 0.01, 0.14]} />
                <meshStandardMaterial color="#cbd5e1" emissive={state.scope.lightChecked ? '#fde047' : '#000000'} emissiveIntensity={0.4} {...flat} />
              </mesh>
            </Obj>
          )}
          {state.tube.size && (
            <Obj name="氣管內管" position={[0, 0.86, 0.05]} rotation={[-Math.PI / 2, 0, 0]} highlight={highlight}>
              <mesh>
                <torusGeometry args={[0.09, 0.01, 4, 14, Math.PI * 1.3]} />
                <meshStandardMaterial color="#e0f2fe" {...flat} />
              </mesh>
            </Obj>
          )}
          {tray('syringe') && (
            <Obj name="10 mL 空針" position={[0.17, 0.86, 0.2]} rotation={[0, 0, Math.PI / 2]} highlight={highlight}>
              <mesh>
                <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
                <meshStandardMaterial color="#bae6fd" {...flat} />
              </mesh>
            </Obj>
          )}
          {tray('stylet') && (
            <Obj name="通條" position={[-0.12, 0.85, 0.2]} rotation={[0, 0, Math.PI / 2]} highlight={highlight}>
              <mesh>
                <cylinderGeometry args={[0.004, 0.004, 0.24, 4]} />
                <meshStandardMaterial color="#a3a3a3" {...flat} />
              </mesh>
            </Obj>
          )}
          {tray('bite') && (
            <Obj name="咬口器" position={[0.17, 0.86, -0.05]} highlight={highlight}>
              <mesh>
                <boxGeometry args={[0.05, 0.03, 0.04]} />
                <meshStandardMaterial color="#fde68a" {...flat} />
              </mesh>
            </Obj>
          )}
          {tray('ties') && (
            <Obj name="固定帶" position={[-0.15, 0.85, 0.05]} rotation={[-Math.PI / 2, 0, 0]} highlight={highlight}>
              <mesh>
                <torusGeometry args={[0.04, 0.008, 4, 10]} />
                <meshStandardMaterial color="#f8fafc" {...flat} />
              </mesh>
            </Obj>
          )}
          {tray('stethoscope') && (
            <Obj name="聽診器" position={[0.1, 0.85, 0.3]} rotation={[-Math.PI / 2, 0, 0]} highlight={highlight}>
              <mesh>
                <torusGeometry args={[0.05, 0.007, 4, 12]} />
                <meshStandardMaterial color="#334155" {...flat} />
              </mesh>
            </Obj>
          )}
        </group>
        {/* 監視器（現行臨床安全補充：ETCO₂） */}
        <Obj name="監視器（ETCO₂）" position={[-0.85, 1.45, -1.25]} highlight={highlight}>
          <mesh>
            <boxGeometry args={[0.42, 0.3, 0.05]} />
            <meshStandardMaterial color="#0f172a" emissive={a.capno ? (a.location === 'trachea' ? '#14532d' : '#7f1d1d') : '#000000'} emissiveIntensity={0.6} {...flat} />
          </mesh>
        </Obj>
        <Rig preset={preset} />
        <OrbitControls makeDefault enablePan={false} minDistance={0.8} maxDistance={5} maxPolarAngle={1.45} />
      </Canvas>
    </div>
  );
}
