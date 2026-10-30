/** 頁首標題 */
export function AppHeader() {
  return (
    <header className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-2 shadow-glass backdrop-blur-md md:px-4 md:py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-emerald-400 text-lg text-white shadow md:h-11 md:w-11 md:text-xl">
        🏝️
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-sm font-black text-slate-800 md:text-base">OSCE Learning Islands</h1>
        <p className="truncate text-[11px] text-slate-500 md:text-xs">醫學生 OSCE 學習探索島</p>
      </div>
    </header>
  );
}

/** 操作提示 */
export function ControlHint() {
  return (
    <div className="pointer-events-none flex items-center gap-3 rounded-full bg-slate-900/55 px-4 py-2 text-[11px] text-white/90 backdrop-blur">
      <span className="hidden md:inline">🖱️ 拖曳旋轉</span>
      <span className="hidden md:inline">⚙️ 滾輪縮放</span>
      <span className="hidden md:inline">右鍵平移</span>
      <span className="md:hidden">☝️ 單指旋轉 · 雙指縮放</span>
      <span>👆 點擊島嶼探索</span>
    </div>
  );
}

/** 簡易提示訊息 */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 animate-fade-up rounded-2xl bg-slate-900/85 px-5 py-3 text-center text-sm text-white shadow-lg backdrop-blur md:top-8">
      {message}
    </div>
  );
}
