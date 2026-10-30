import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const WATER_LEVEL = -1;

/** Low Poly 動態海面：以頂點位移做出柔和波浪 */
export function Ocean() {
  const mesh = useRef<THREE.Mesh>(null);
  const { geometry, base } = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 320, 64, 64);
    g.rotateX(-Math.PI / 2);
    return { geometry: g, base: Float32Array.from(g.attributes.position.array) };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      pos.setY(i, Math.sin(x * 0.12 + t * 0.8) * 0.12 + Math.cos(z * 0.1 + t * 0.6) * 0.12);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={mesh} geometry={geometry} position={[0, WATER_LEVEL - 0.35, 0]} receiveShadow>
      <meshStandardMaterial color="#4fb8dd" flatShading roughness={0.35} metalness={0.05} transparent opacity={0.92} />
    </mesh>
  );
}
