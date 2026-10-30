import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, MeshBasicMaterial } from 'three';
import { CENTRAL_PLAZA, ISLANDS } from '../../data/islandData';
import type { IslandConfig, IslandId } from '../../types/island';
import { WATER_LEVEL } from './Ocean';

/** 單條發光航線：海面光帶 + 浮標 + 流動光點 */
function Route({ island, active }: { island: IslandConfig; active: boolean }) {
  const pulse = useRef<Group>(null);
  const strip = useRef<MeshBasicMaterial>(null);

  const [ix, , iz] = island.position;
  const dist = Math.hypot(ix, iz);
  const dir: [number, number] = [ix / dist, iz / dist];
  const start = CENTRAL_PLAZA.radius + 1.2;
  const end = dist - island.radius - 1.4;
  const len = end - start;
  const mid = (start + end) / 2;
  const angle = Math.atan2(ix, iz);

  useFrame(({ clock }, dt) => {
    const t = (clock.getElapsedTime() * 0.25 + island.order * 0.2) % 1;
    const d = start + t * len;
    if (pulse.current) pulse.current.position.set(dir[0] * d, WATER_LEVEL + 0.35, dir[1] * d);
    if (strip.current) {
      const goal = active ? 0.65 : 0.3;
      strip.current.opacity += (goal - strip.current.opacity) * (1 - Math.exp(-dt * 5));
    }
  });

  const buoys = [0.2, 0.4, 0.6, 0.8];

  return (
    <group>
      <mesh position={[dir[0] * mid, WATER_LEVEL + 0.12, dir[1] * mid]} rotation={[-Math.PI / 2, 0, -angle]}>
        <planeGeometry args={[0.8, len]} />
        <meshBasicMaterial ref={strip} color={island.themeColor} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {buoys.map((f) => {
        const d = start + f * len;
        return (
          <group key={f} position={[dir[0] * d + dir[1] * 0.9, WATER_LEVEL, dir[1] * d - dir[0] * 0.9]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.18, 0.25, 0.5, 6]} />
              <meshStandardMaterial color="#ffffff" flatShading />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <icosahedronGeometry args={[0.15, 0]} />
              <meshStandardMaterial color={island.themeColor} emissive={island.themeColor} emissiveIntensity={0.9} />
            </mesh>
          </group>
        );
      })}
      <group ref={pulse}>
        <mesh>
          <icosahedronGeometry args={[0.28, 1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshBasicMaterial color={island.themeColor} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

/** 中央廣場通往五座島的發光航線 */
export function SeaRoutes({ activeId }: { activeId: IslandId | null }) {
  return (
    <group>
      {ISLANDS.map((island) => (
        <Route key={island.id} island={island} active={island.id === activeId} />
      ))}
    </group>
  );
}
