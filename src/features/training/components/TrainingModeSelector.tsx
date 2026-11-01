import { getTrainingModes } from '../modes';
import type { TrainingModeId } from '../types';

const STYLE: Record<TrainingModeId, { icon: string; color: string; title: string }> = {
  guided: { icon: '🧭', color: '#0d9488', title: '教學引導模式' },
  independent: { icon: '🛠️', color: '#1e40af', title: '自主練習模式' },
  challenge: { icon: '⏱️', color: '#dc2626', title: 'OSCE 模擬挑戰' },
};

/**
 * TrainingModeSelector：技能操作站共用的四種模式入口
 * 正確示範 → 教學引導 → 自主練習 → OSCE 模擬挑戰
 */
export function TrainingModeSelector({
  stationMinutes,
  demoDescription,
  descriptions,
  onDemo,
  onSelect,
  onBack,
}: {
  stationMinutes: number;
  demoDescription: string;
  descriptions?: Partial<Record<TrainingModeId, string>>;
  onDemo: () => void;
  onSelect: (m: TrainingModeId) => void;
  onBack: () => void;
}) {
  const modes = getTrainingModes(stationMinutes);
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-indigo-50 via-slate-50 to-sky-50">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
        <button type="button" onClick={onBack} className="mt-2 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600 shadow-sm hover:bg-white">
          ← 回到情境說明
        </button>
        <h1 className="mt-4 text-2xl font-black text-slate-800">選擇訓練模式</h1>
        <p className="mt-1 text-sm text-slate-500">建議先觀看正確示範，再依序挑戰三種練習模式。所有模式使用同一個模擬場景與相同的評分規準。</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <button type="button" onClick={onDemo} className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-5 text-left shadow-glass ring-2 ring-emerald-300 transition hover:-translate-y-1 hover:ring-emerald-400">
            <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">建議先看</span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">🎬</span>
            <span className="mt-3 text-lg font-black text-slate-800">正確示範模式</span>
            <span className="text-[11px] font-bold text-emerald-700">Demonstration</span>
            <span className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">{demoDescription}</span>
            <span className="mt-3 flex flex-wrap gap-1 text-[10px] font-bold">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">章節導覽</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">旁白＋同步字幕</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">0.5–2 倍速</span>
            </span>
            <span className="mt-4 rounded-xl bg-emerald-600 py-2 text-center text-sm font-bold text-white">觀看示範</span>
          </button>
          {(Object.keys(modes) as TrainingModeId[]).map((id) => {
            const m = modes[id];
            const st = STYLE[id];
            return (
              <button key={id} type="button" onClick={() => onSelect(id)} className="flex flex-col rounded-3xl bg-white/90 p-5 text-left shadow-glass ring-2 ring-transparent transition hover:-translate-y-1 hover:ring-indigo-300">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: `${st.color}1a` }}>
                  {st.icon}
                </span>
                <span className="mt-3 text-lg font-black text-slate-800">{st.title}</span>
                <span className="text-[11px] font-bold" style={{ color: st.color }}>
                  {m.englishTitle}
                </span>
                <span className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">{descriptions?.[id] ?? m.description}</span>
                <span className="mt-3 flex flex-wrap gap-1 text-[10px] font-bold">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{m.showHints ? '漸進式提示' : '無提示'}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{m.immediateFeedback ? '即時回饋' : '結束後回饋'}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{m.timeLimitSec ? `${m.timeLimitSec / 60} 分鐘倒數` : '不限時'}</span>
                </span>
                <span className="mt-4 rounded-xl py-2 text-center text-sm font-bold text-white" style={{ background: st.color }}>
                  開始
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-5 text-center text-[12px] text-slate-500">數位評分一律為「模擬形成性評量」，僅作學習回饋，不等同正式 OSCE 考試成績。</p>
      </div>
    </div>
  );
}
