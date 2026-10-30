import { useCallback, useEffect, useRef, useState } from 'react';
import { IslandMapScene } from '../components/scene/IslandMapScene';
import { NavigationMenu } from '../components/ui/NavigationMenu';
import { IslandInfoPanel } from '../components/ui/IslandInfoPanel';
import { AppHeader, ControlHint, Toast } from '../components/ui/Overlay';
import { getIsland } from '../data/islandData';
import type { IslandConfig, IslandId } from '../types/island';
import { navigate } from '../router';

export function IslandMapPage({ initialIslandId = null }: { initialIslandId?: IslandId | null }) {
  const [selectedId, setSelectedId] = useState<IslandId | null>(initialIslandId);
  const [hoveredId, setHoveredId] = useState<IslandId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>();

  const selected = getIsland(selectedId);

  const backToOverview = useCallback(() => setSelectedId(null), []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  // 已開放學習區的島嶼導向其路由；其餘島嶼仍顯示規劃中提示
  const handleEnter = useCallback(
    (island: IslandConfig) => {
      if (island.learningRoute) navigate(island.learningRoute);
      else showToast(`「${island.buildingName}」學習區將於下一階段開放 🚧`);
    },
    [showToast],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') backToOverview();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [backToOverview]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">
        <IslandMapScene
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={setSelectedId}
          onHover={setHoveredId}
          onBackToOverview={backToOverview}
        />
      </div>

      {/* UI 疊層 */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:gap-4 md:p-5">
        <div className="flex flex-col gap-2 md:w-72 md:gap-4">
          <AppHeader />
          <NavigationMenu selectedId={selectedId} onSelect={setSelectedId} onHover={setHoveredId} onOverview={backToOverview} />
        </div>
      </div>

      {selected && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center md:inset-y-0 md:left-auto md:right-0 md:items-center md:p-5">
          <IslandInfoPanel island={selected} onClose={backToOverview} onEnter={handleEnter} />
        </div>
      )}

      {!selected && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <ControlHint />
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}
