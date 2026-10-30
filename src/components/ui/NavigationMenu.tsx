import { ISLANDS } from '../../data/islandData';
import type { IslandId } from '../../types/island';
import { IslandCard } from './IslandCard';

interface NavigationMenuProps {
  selectedId: IslandId | null;
  onSelect: (id: IslandId) => void;
  onHover: (id: IslandId | null) => void;
  onOverview: () => void;
}

/** NavigationMenu：桌機為左側面板，手機為上方橫向捲動膠囊列 */
export function NavigationMenu({ selectedId, onSelect, onHover, onOverview }: NavigationMenuProps) {
  return (
    <>
      {/* 桌機版 */}
      <nav className="pointer-events-auto hidden w-full flex-col gap-1.5 rounded-3xl bg-white/60 p-3 shadow-glass backdrop-blur-md md:flex">
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="text-xs font-bold tracking-wider text-slate-500">五大考站島嶼</span>
          <button
            type="button"
            onClick={onOverview}
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition ${
              selectedId ? 'bg-sky-600 text-white hover:bg-sky-700' : 'text-slate-400'
            }`}
            disabled={!selectedId}
          >
            🗺️ 全景
          </button>
        </div>
        {ISLANDS.map((island) => (
          <IslandCard
            key={island.id}
            island={island}
            active={island.id === selectedId}
            onClick={() => onSelect(island.id)}
            onHover={(h) => onHover(h ? island.id : null)}
          />
        ))}
      </nav>

      {/* 手機版 */}
      <nav className="pointer-events-auto -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] md:hidden">
        <button
          type="button"
          onClick={onOverview}
          className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
            selectedId ? 'bg-sky-600 text-white' : 'bg-white/90 text-slate-700'
          }`}
        >
          🗺️ 全景
        </button>
        {ISLANDS.map((island) => (
          <IslandCard key={island.id} island={island} compact active={island.id === selectedId} onClick={() => onSelect(island.id)} />
        ))}
      </nav>
    </>
  );
}
