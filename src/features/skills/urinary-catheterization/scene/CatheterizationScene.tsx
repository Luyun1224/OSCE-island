import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useState, type ReactNode } from 'react';
import { CatmullRomCurve3, Vector3 } from 'three';
import type { StepId } from '../caseData';
import { kitOpen, type CTState } from '../engine';

/**
 * CatheterizationScene：低多邊形急診導尿訓練場景（3D 總覽）
 * 只負責呈現目前的模擬狀態與點選導覽；所有操作判斷在 React 階段元件與引擎中。
 */
const flat = { flatShading: true } as const;

function Pick({ name, onPick, children, position }: { name: string; onPick?: () => void; children: ReactNode; position?: [number, number, number] }) {
  const [hover, setHover] = useState(false);
  return (
    <group
      position={position}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = onPick ? 'pointer' : 'default';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = 'default';
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPick?.();
      }}
    >
      {children}
      {hover && (
        <Html center position={[0, 0.5, 0]} style={{ pointerEvents: 'none' }}>
          <span className="whitespace-nowrap rounded-full bg-slate-900/85 px-2 py-0.5 text-[11px] font-bold text-white">{name}</span>
        </Html>
      )}
    </group>
  );
}

function Bed() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.12, 2.3]} />
        <meshStandardMaterial color="#94a3b8" {...flat} />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.14, 2.2]} />
        <meshStandardMaterial color="#e2e8f0" {...flat} />
      </mesh>
      {[-0.5, 0.5].flatMap((x) => [-1.05, 1.05].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.27, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.55, 6]} />
          <meshStandardMaterial color="#64748b" {...flat} />
        </mesh>
      )))}
      {/* 床欄 */}
      <mesh position={[-0.56, 0.86, 0.2]}>
        <boxGeometry args={[0.03, 0.18, 1.1]} />
        <meshStandardMaterial color="#cbd5e1" {...flat} />
      </mesh>
      {/* 枕頭 */}
      <mesh position={[0, 0.8, -0.92]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.32]} />
        <meshStandardMaterial color="#f8fafc" {...flat} />
      </mesh>
    </group>
  );
}

function Patient({ state, onPick }: { state: CTState; onPick: (s: StepId) => void }) {
  const skin = '#f2c4a0';
  return (
    <group position={[0, 0.76, 0]}>
      <Pick name="楊大偉（點選：說明與安撫）" onPick={() => onPick('greet')} position={[0, 0.12, -0.92]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.15, 1]} />
          <meshStandardMaterial color={skin} {...flat} />
        </mesh>
        <mesh position={[0, 0.08, -0.03]}>
          <icosahedronGeometry args={[0.13, 1]} />
          <meshStandardMaterial color="#a1a1aa" {...flat} />
        </mesh>
      </Pick>
      {/* 半身安妮：上半身（病人服） */}
      <mesh position={[0, 0.07, -0.42]} castShadow>
        <boxGeometry args={[0.5, 0.18, 0.72]} />
        <meshStandardMaterial color="#bfdbfe" {...flat} />
      </mesh>
      {/* 男性導尿模具：骨盆與大腿 */}
      <Pick name="男性導尿模具（點選：消毒／置入）" onPick={() => onPick(state.catheter.pos === 'none' ? (state.strokes.length ? 'insert' : 'disinfect') : 'insert')} position={[0, 0.06, 0.12]}>
        <mesh castShadow>
          <boxGeometry args={[0.48, 0.16, 0.36]} />
          <meshStandardMaterial color="#f1d3b8" {...flat} />
        </mesh>
        <mesh position={[0, 0.1, 0.14]} rotation={[Math.PI / 2.6, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 0.12, 6]} />
          <meshStandardMaterial color="#e9b291" {...flat} />
        </mesh>
      </Pick>
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, 0.04, 0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.6, 7]} />
          <meshStandardMaterial color="#f1d3b8" {...flat} />
        </mesh>
      ))}
      {/* 被單蓋在大腿 */}
      {!state.drape.placed && (
        <mesh position={[0, 0.1, 0.75]} castShadow>
          <boxGeometry args={[0.7, 0.04, 0.6]} />
          <meshStandardMaterial color="#c7d2fe" {...flat} />
        </mesh>
      )}
      {/* 洞巾 */}
      {state.drape.placed && (
        <mesh position={[0, 0.16, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.42, 8, 1]} />
          <meshStandardMaterial color="#4ade80" side={2} {...flat} />
        </mesh>
      )}
    </group>
  );
}

function CartItems({ state, place }: { state: CTState; place: 'cart' | 'table' }) {
  const items = state.items;
  const at = (id: keyof CTState['items']) => (place === 'cart' ? items[id] === 'cart' : items[id] === 'table' || items[id] === 'field');
  const xs = [-0.32, -0.18, -0.04, 0.1, 0.24, 0.36];
  let i = 0;
  const slot = () => xs[i++ % xs.length];
  return (
    <group>
      {at('kit') &&
        (kitOpen(state) ? (
          <mesh position={[0, 0.005, 0.02]}>
            <boxGeometry args={[0.36, 0.01, 0.36]} />
            <meshStandardMaterial color="#a7f3d0" {...flat} />
          </mesh>
        ) : (
          <mesh position={[slot(), 0.04, -0.08]} castShadow>
            <boxGeometry args={[0.16, 0.08, 0.12]} />
            <meshStandardMaterial color="#7dd3fc" {...flat} />
          </mesh>
        ))}
      {at('catheter') && (
        <mesh position={place === 'table' && items.catheter === 'field' ? [0.04, 0.02, 0.06] : [slot(), 0.02, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.05, 0.008, 4, 12]} />
          <meshStandardMaterial color="#f59e0b" {...flat} />
        </mesh>
      )}
      {at('iodine') && (
        <mesh position={[slot(), 0.07, -0.1]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.14, 6]} />
          <meshStandardMaterial color="#92400e" {...flat} />
        </mesh>
      )}
      {at('jelly') && (
        <mesh position={[slot(), 0.02, 0.1]} rotation={[0, 0.4, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.028, 0.12, 6]} />
          <meshStandardMaterial color="#86efac" {...flat} />
        </mesh>
      )}
      {at('syringe') && (
        <mesh position={[slot(), 0.015, 0.12]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.14, 6]} />
          <meshStandardMaterial color="#e0f2fe" {...flat} />
        </mesh>
      )}
      {at('gloves') && (
        <mesh position={[slot(), 0.01, -0.12]}>
          <boxGeometry args={[0.12, 0.02, 0.16]} />
          <meshStandardMaterial color="#fde68a" {...flat} />
        </mesh>
      )}
      {at('tape') && (
        <mesh position={[slot(), 0.02, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.03, 0.012, 4, 10]} />
          <meshStandardMaterial color="#f8fafc" {...flat} />
        </mesh>
      )}
      {at('bag') && (
        <mesh position={[slot(), 0.01, -0.12]}>
          <boxGeometry args={[0.14, 0.015, 0.18]} />
          <meshStandardMaterial color="#fef9c3" {...flat} />
        </mesh>
      )}
      {at('gauze') && (
        <mesh position={[slot(), 0.01, 0.12]}>
          <boxGeometry args={[0.06, 0.01, 0.06]} />
          <meshStandardMaterial color="#ffffff" {...flat} />
        </mesh>
      )}
      {(at('saline') || at('water')) && (
        <mesh position={[slot(), 0.06, -0.1]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 6]} />
          <meshStandardMaterial color="#e0f2fe" {...flat} />
        </mesh>
      )}
    </group>
  );
}

function Cart({ state, onPick }: { state: CTState; onPick: (s: StepId) => void }) {
  return (
    <Pick name="換藥（工作）車（點選：器材準備）" onPick={() => onPick('prep')} position={[0.95, 0, 0.55]}>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.04, 0.5]} />
        <meshStandardMaterial color="#e2e8f0" {...flat} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.76, 0.03, 0.46]} />
        <meshStandardMaterial color="#cbd5e1" {...flat} />
      </mesh>
      {[-0.36, 0.36].flatMap((x) => [-0.21, 0.21].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.4, z]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 5]} />
          <meshStandardMaterial color="#64748b" {...flat} />
        </mesh>
      )))}
      <group position={[0, 0.82, 0]}>
        <CartItems state={state} place="table" />
      </group>
      <group position={[0, 0.37, 0]}>
        <CartItems state={state} place="cart" />
      </group>
    </Pick>
  );
}

function Catheter({ state }: { state: CTState }) {
  const curve = useMemo(() => {
    const pts = [new Vector3(0, 0.95, 0.3), new Vector3(0.05, 0.9, 0.55), new Vector3(0.35, 0.78, 0.8)];
    if (state.bag.connected) pts.push(new Vector3(0.6, 0.6, 0.85), state.bag.hang === 'bedFrame' ? new Vector3(0.62, 0.42, 0.6) : new Vector3(0.62, 0.75, 0.7));
    return new CatmullRomCurve3(pts);
  }, [state.bag.connected, state.bag.hang]);
  if (state.catheter.pos !== 'inserted') return null;
  return (
    <mesh>
      <tubeGeometry args={[curve, 24, 0.012, 5, false]} />
      <meshStandardMaterial color="#f59e0b" {...flat} />
    </mesh>
  );
}

function Bag({ state, onPick }: { state: CTState; onPick: (s: StepId) => void }) {
  if (!state.bag.connected) return null;
  const pos: [number, number, number] = state.bag.hang === 'bedFrame' ? [0.62, 0.32, 0.6] : state.bag.hang === 'abdomen' ? [0.1, 0.92, -0.2] : state.bag.hang === 'rail' ? [-0.56, 1.0, 0.2] : [0.62, 0.62, 0.85];
  return (
    <Pick name="尿袋（點選：連接與固定）" onPick={() => onPick('connect')} position={pos}>
      <mesh castShadow>
        <boxGeometry args={[0.16, 0.22, 0.03]} />
        <meshStandardMaterial color="#fef08a" transparent opacity={0.9} {...flat} />
      </mesh>
      <mesh position={[0, -0.05, 0.016]}>
        <boxGeometry args={[0.14, 0.08, 0.005]} />
        <meshStandardMaterial color="#facc15" {...flat} />
      </mesh>
    </Pick>
  );
}

export default function CatheterizationScene({ state, onPick, className }: { state: CTState; onPick: (s: StepId) => void; className?: string }) {
  const afterSteps = state.catheter.pos === 'inserted';
  return (
    <div className={className}>
      <Canvas shadows dpr={[1, 1.75]} frameloop="demand" camera={{ position: [1.9, 2.1, 2.6], fov: 42 }}>
        <color attach="background" args={['#e0f2fe']} />
        <hemisphereLight args={['#ffffff', '#cbd5e1', 1.1]} />
        <directionalLight position={[2, 4, 2]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[6, 6]} />
          <meshStandardMaterial color="#f1f5f9" {...flat} />
        </mesh>
        <mesh position={[0, 1.4, -1.5]} receiveShadow>
          <boxGeometry args={[6, 2.8, 0.05]} />
          <meshStandardMaterial color="#dbeafe" {...flat} />
        </mesh>
        {/* 隔簾 */}
        <mesh position={state.curtain ? [-1.2, 1.1, 0.1] : [-1.2, 1.1, -1.2]} castShadow>
          <boxGeometry args={[0.03, 1.6, state.curtain ? 2.6 : 0.4]} />
          <meshStandardMaterial color="#a5b4fc" transparent opacity={0.85} {...flat} />
        </mesh>
        <Bed />
        <Patient state={state} onPick={onPick} />
        <Cart state={state} onPick={onPick} />
        <Catheter state={state} />
        <Bag state={state} onPick={onPick} />
        {/* 乾洗手液 */}
        <Pick name="乾洗手液（點選：手部衛生）" onPick={() => onPick(afterSteps && state.gloves.status === 'none' ? 'hygieneAfter' : 'hygieneBefore')} position={[0.9, 1.3, -1.45]}>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.26, 0.1]} />
            <meshStandardMaterial color="#3b82f6" {...flat} />
          </mesh>
          <mesh position={[0, -0.16, 0.03]}>
            <boxGeometry args={[0.04, 0.06, 0.04]} />
            <meshStandardMaterial color="#e2e8f0" {...flat} />
          </mesh>
        </Pick>
        {/* 垃圾桶 */}
        <Pick name="感染性垃圾桶（點選：廢棄物處理）" onPick={() => onPick('disposal')} position={[1.55, 0, -0.35]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.17, 0.14, 0.5, 8]} />
            <meshStandardMaterial color="#ef4444" {...flat} />
          </mesh>
        </Pick>
        <Pick name="一般垃圾桶（點選：廢棄物處理）" onPick={() => onPick('disposal')} position={[1.55, 0, 0.05]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.13, 0.44, 8]} />
            <meshStandardMaterial color="#94a3b8" {...flat} />
          </mesh>
        </Pick>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={5} minPolarAngle={0.3} maxPolarAngle={1.35} target={[0.3, 0.7, 0.1]} />
      </Canvas>
    </div>
  );
}
