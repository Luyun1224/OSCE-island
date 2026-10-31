import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { IslandConfig, IslandId } from '../../types/island';
import { BUILDING_REGISTRY } from './buildings';
import { WATER_LEVEL } from './Ocean';

interface IslandProps {
  data: IslandConfig;
  selected: boolean;
  hovered: boolean;
  /** 其他島被選取時，本島淡化 */
  dimmed: boolean;
  onSelect: (id: IslandId) => void;
  onHover: (id: IslandId | null) => void;
}

/** 拖曳超過此像素距離就不視為點擊（避免旋轉視角時誤選） */
const CLICK_DRAG_THRESHOLD = 6;

/** 島嶼地基：草地 + 沙灘 + 岩石底座（八角 Low Poly） */
function IslandBase({ radius, ground }: { radius: number; ground: string }) {
  // 讓草地邊緣略有起伏，避免太規則
  const grassGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(radius, radius + 0.35, 0.7, 10, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const n = 1 + Math.sin(Math.atan2(z, x) * 3 + radius) * 0.04;
      pos.setXYZ(i, x * n, pos.getY(i), z * n);
    }
    g.computeVertexNormals();
    return g;
  }, [radius]);

  return (
    <group>
      <mesh geometry={grassGeometry} position={[0, -0.35, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={ground} flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.85, 0]} receiveShadow>
        <cylinderGeometry args={[radius + 0.9, radius + 1.3, 0.5, 10]} />
        <meshStandardMaterial color="#f3dfae" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, -3.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[radius + 1.1, 4, 10]} />
        <meshStandardMaterial color="#9c8a76" flatShading roughness={1} />
      </mesh>
    </group>
  );
}

export function Island({ data, selected, hovered, dimmed, onSelect, onHover }: IslandProps) {
  const lift = useRef<THREE.Group>(null);
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const liftValue = useRef(0);
  const Buildings = BUILDING_REGISTRY[data.id];

  useFrame(({ clock }, dt) => {
    const active = hovered || selected;
    const k = 1 - Math.exp(-dt * 6);
    liftValue.current += ((active ? 0.45 : 0) - liftValue.current) * k;
    if (lift.current) {
      lift.current.position.y = liftValue.current + Math.sin(clock.getElapsedTime() * 0.7 + data.order) * 0.07;
    }
    if (ring.current) {
      const goal = selected ? 0.75 : hovered ? 0.55 : 0;
      const pulse = active ? Math.sin(clock.getElapsedTime() * 3) * 0.12 : 0;
      ring.current.opacity += (goal + pulse - ring.current.opacity) * k;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > CLICK_DRAG_THRESHOLD) return;
    onSelect(data.id);
  };

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(data.id);
    document.body.style.cursor = 'pointer';
  };

  const handleOut = () => {
    onHover(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group position={data.position}>
      {/* 淺水區 */}
      <mesh position={[0, WATER_LEVEL + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[data.radius + 3.2, 24]} />
        <meshBasicMaterial color="#a5f3fc" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {/* 高亮光環 */}
      <mesh position={[0, WATER_LEVEL + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.radius + 1.6, data.radius + 2.3, 40]} />
        <meshBasicMaterial ref={ring} color={data.themeColor} transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={lift} onClick={handleClick} onPointerOver={handleOver} onPointerOut={handleOut}>
        <IslandBase radius={data.radius} ground={data.theme.ground} />
        <Buildings theme={data.theme} interactive={selected} onRequestSelect={() => onSelect(data.id)} />
      </group>

      {/* 浮動島名標籤 */}
      {!selected && (
        <Html position={[0, 8.6, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold shadow-glass backdrop-blur transition-all duration-300 sm:text-sm ${
              dimmed ? 'opacity-40' : 'opacity-100'
            } ${hovered ? 'scale-110' : 'scale-100'}`}
            style={{ background: hovered ? data.themeColor : 'rgba(255,255,255,0.88)', color: hovered ? '#fff' : data.themeColor }}
          >
            <span className="mr-1">{data.icon}</span>
            {data.title}
            {data.learningRoute ? (
              <span className="ml-1.5 rounded-full bg-emerald-500 px-1.5 py-0.5 align-middle text-[10px] font-bold text-white">已開放</span>
            ) : (
              <span className="ml-1.5 rounded-full bg-slate-500/80 px-1.5 py-0.5 align-middle text-[10px] font-bold text-white">🚧 尚未開放</span>
            )}
            {hovered && <div className="text-center text-[10px] font-medium opacity-90">{data.buildingName}</div>}
          </div>
        </Html>
      )}
    </group>
  );
}
