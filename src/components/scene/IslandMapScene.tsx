import { Canvas } from '@react-three/fiber';
import { ISLANDS, getIsland } from '../../data/islandData';
import type { IslandId } from '../../types/island';
import { Ambience } from './Ambience';
import { CameraControls } from './CameraControls';
import { CentralPlaza } from './CentralPlaza';
import { Island } from './Island';
import { Ocean } from './Ocean';
import { SeaRoutes } from './SeaRoutes';
import { SkyRig, TimeOfDayProvider, type TimeOfDay } from './timeOfDay';

interface IslandMapSceneProps {
  selectedId: IslandId | null;
  hoveredId: IslandId | null;
  onSelect: (id: IslandId) => void;
  onHover: (id: IslandId | null) => void;
  onBackToOverview: () => void;
  timeOfDay: TimeOfDay;
}

/** IslandMapScene：3D 群島主場景 */
export function IslandMapScene({ selectedId, hoveredId, onSelect, onHover, onBackToOverview, timeOfDay }: IslandMapSceneProps) {
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
      <TimeOfDayProvider value={timeOfDay}>
      <SkyRig time={timeOfDay} />

      <Ocean time={timeOfDay} />
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
      </TimeOfDayProvider>
    </Canvas>
  );
}
