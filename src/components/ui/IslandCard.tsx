import type { IslandConfig } from '../../types/island';

interface IslandCardProps {
  island: IslandConfig;
  active: boolean;
  /** compact：手機橫向膠囊樣式 */
  compact?: boolean;
  onClick: () => void;
  onHover?: (hovering: boolean) => void;
}

/** IslandCard：導航選單中的單一島嶼卡片 */
export function IslandCard({ island, active, compact, onClick, onHover }: IslandCardProps) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-95"
        style={{
          background: active ? island.themeColor : 'rgba(255,255,255,0.9)',
          borderColor: active ? island.themeColor : 'rgba(255,255,255,0.9)',
          color: active ? '#fff' : '#334155',
        }}
      >
        <span>{island.icon}</span>
        {island.shortTitle}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-200 ${
        active ? 'bg-white shadow-md' : 'border-transparent bg-white/50 hover:bg-white/90 hover:shadow-sm'
      }`}
      style={{ borderColor: active ? island.themeColor : undefined }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-transform group-hover:scale-110"
        style={{ background: `${island.themeColor}22` }}
      >
        {island.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold tabular-nums" style={{ color: island.themeColor }}>
            0{island.order}
          </span>
          <span className="truncate text-sm font-bold text-slate-800">{island.shortTitle}</span>
        </span>
        <span className="block truncate text-[11px] text-slate-500">{island.englishTitle}</span>
      </span>
      <span className="h-2 w-2 shrink-0 rounded-full transition-opacity" style={{ background: island.themeColor, opacity: active ? 1 : 0.25 }} />
    </button>
  );
}
