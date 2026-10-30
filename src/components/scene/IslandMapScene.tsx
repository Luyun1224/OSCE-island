import { Canvas } from '@react-three/fiber';
import { ISLANDS, getIsland } from '../../data/islandData';
import type { IslandId } from '../../types/island';
import { Ambience } from './Ambience';
import { CameraControls } from './CameraControls';
import { CentralPlaza } from './CentralPlaza';
import { Island } from './Island';
import { Ocean } from './Ocean';
import { SeaRoutes } from './SeaRoutes';

interface IslandMapSceneProps {
  selectedId: IslandId | null;
  hoveredId: IslandId | null;
  onSelect: (id: IslandId) => void;
  onHover: (id: IslandId | null) => void;
  onBackToOverview: () => void;
}

const SKY = '#bfe6f5';

/** IslandMapScene：3D 群島主場景 */
export function IslandMapScene({ selectedId, hoveredId, onSelect, onHover, onBackToOverview }: IslandMapSceneProps) {
  const focus = getIsland(selectedId);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 110, 140], fov: 42, near: 0.5, far: 800 }}
      onPointerMissed={(e) => {
        // 點擊空白海面不做任何事（保留目前選取），僅在桌機雙擊時返回全景
        if (e.type === 'dblclick') onBackToOverview();
      }}
    >
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 120, 320]} />

      <hemisphereLight args={['#ffffff', '#7dd3c0', 0.9]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[30, 50, 25]}
        intensity={1.6}
        color="#fff6e5"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-bias={-0.0005}
      />

      <Ocean />
      <Ambience />
      <SeaRoutes activeId={selectedId ?? hoveredId} />
      <CentralPlaza onClick={onBackToOverview} showLabel={!selectedId} />

      {ISLANDS.map((island) => (
        <Island
          key={island.id}
          data={island}
          selected={island.id === selectedId}
          hovered={island.id === hoveredId}
          dimmed={!!selectedId && island.id !== selectedId}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}

      <CameraControls focus={focus} />
    </Canvas>
  );
}
