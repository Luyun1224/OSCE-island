import type { IslandConfig, LearningModuleType } from '../../types/island';

interface IslandInfoPanelProps {
  island: IslandConfig;
  onClose: () => void;
  onEnter: (island: IslandConfig) => void;
}

const MODULE_TYPE_LABEL: Record<LearningModuleType, string> = {
  case: '教案',
  skill: '技能',
  checklist: '清單',
  quiz: '測驗',
  simulation: '模擬',
};

/** IslandInfoPanel：桌機為右側卡片，手機為底部抽屜 */
export function IslandInfoPanel({ island, onClose, onEnter }: IslandInfoPanelProps) {
  return (
    <aside
      key={island.id}
      className="pointer-events-auto flex max-h-[52vh] w-full animate-fade-up flex-col overflow-hidden rounded-t-3xl bg-white/90 shadow-glass backdrop-blur-md md:max-h-[calc(100vh-10rem)] md:mt-12 md:w-[380px] md:rounded-3xl"
    >
      {/* 主題色頁首 */}
      <header className="relative shrink-0 px-5 pb-4 pt-5 text-white" style={{ background: `linear-gradient(135deg, ${island.theme.primary}, ${island.theme.accent})` }}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/50 md:hidden" />
        <button
          type="button"
          onClick={onClose}
          aria-label="返回全景"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg leading-none transition hover:bg-white/35"
        >
          ×
        </button>
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em]">
          <span className="opacity-80">ISLAND 0{island.order}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] tracking-normal ${island.learningRoute ? 'bg-emerald-400 text-emerald-950' : 'bg-black/25 text-white'}`}>
            {island.learningRoute ? '✅ 已開放' : '🚧 尚未開放'}
          </span>
        </div>
        <h2 className="mt-1 flex items-center gap-2 text-xl font-black md:text-2xl">
          <span>{island.icon}</span>
          {island.title}
        </h2>
        <p className="mt-0.5 text-xs font-medium opacity-90">{island.englishTitle}</p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {!island.learningRoute && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-[12px] leading-relaxed text-slate-600">
            🚧 <span className="font-bold">此島嶼的學習區尚未開放</span>，內容正在規劃中。以下為預定的學習方向。
            <br />
            目前已開放：🛠️ 技能操作島 › 傷口縫合
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl p-2.5 text-sm" style={{ background: `${island.themeColor}14` }}>
          <span className="text-base">🏛️</span>
          <span className="text-slate-500">主建築</span>
          <span className="font-bold" style={{ color: island.themeColor }}>
            {island.buildingName}
          </span>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800">{island.tagline}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{island.description}</p>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold tracking-wider text-slate-400">考試重點</h3>
          <ul className="grid grid-cols-2 gap-1.5">
            {island.examFocus.map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-[12px] text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: island.themeColor }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold tracking-wider text-slate-400">學習模組</h3>
          <ul className="space-y-1.5">
            {island.modules.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-[12px]">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: island.themeColor }}>
                    {MODULE_TYPE_LABEL[m.type]}
                  </span>
                  {m.title}
                </span>
                {m.status === 'available' ? (
                  <span className="text-[10px] font-bold" style={{ color: island.themeColor }}>
                    已開放
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">即將開放</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {island.styleKeywords.map((k) => (
            <span key={k} className="rounded-full border px-2 py-0.5 text-[11px] text-slate-500" style={{ borderColor: `${island.themeColor}55` }}>
              #{k}
            </span>
          ))}
        </div>
      </div>

      <footer className="flex shrink-0 gap-2 border-t border-slate-100 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
        >
          🗺️ 返回全景
        </button>
        {island.learningRoute ? (
          <button
            type="button"
            onClick={() => onEnter(island)}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
            style={{ background: island.themeColor }}
          >
            進入學習區 →
          </button>
        ) : (
          <button type="button" disabled className="flex-1 cursor-not-allowed rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-500">
            🚧 學習區尚未開放
          </button>
        )}
      </footer>
    </aside>
  );
}
