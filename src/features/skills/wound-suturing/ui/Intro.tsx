import { getTrainingModes } from '../../../training/modes';
import type { TrainingModeId } from '../../../training/types';
import { EQUIPMENT, INSTRUMENTS, WOUND_SUTURING_CASE } from '../caseData';
import { EquipmentIcon } from './EquipmentIcon';

const sc = WOUND_SUTURING_CASE.scenario;

/** 診間示意圖（依教案「診間復原狀態」配置） */
function RoomDiagram() {
  const box = (x: number, y: number, w: number, h: number, label: string, fill = '#fff') => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} stroke="#475569" strokeWidth={1} />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1e293b">
        {label}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 280 200" className="w-full">
      <rect x={4} y={4} width={272} height={192} fill="#f8fafc" stroke="#334155" strokeWidth={1.5} />
      <path d="M276 4 A44 44 0 0 1 232 48" fill="none" stroke="#94a3b8" />
      <line x1={232} y1={4} x2={232} y2={48} stroke="#94a3b8" />
      {box(46, 52, 32, 24, '助手')}
      {box(122, 52, 32, 24, '考生')}
      {box(196, 46, 34, 18, '一般性', '#e2e8f0')}
      {box(196, 66, 34, 18, '感染性', '#fecaca')}
      {box(12, 92, 40, 34, '備物', '#cbd5e1')}
      {box(66, 90, 132, 44, '操作台面')}
      {box(122, 150, 32, 24, '考官')}
    </svg>
  );
}

export function ScenarioIntro({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-sky-100 via-slate-50 to-blue-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
        <button type="button" onClick={onBack} className="mt-2 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600 shadow-sm hover:bg-white">
          ← 技能訓練中心
        </button>
        <header className="mt-4">
          <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600">{sc.stationTitle}</p>
          <h1 className="mt-1 text-3xl font-black text-slate-800">傷口縫合 <span className="text-lg font-bold text-slate-400">Wound Suturing</span></h1>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-bold">
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm">測驗場景：{sc.setting}</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm">測驗時間：{sc.stationMinutes} 分鐘</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm">單項技能操作</span>
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <section className="rounded-3xl bg-white/90 p-5 shadow-glass">
            <h2 className="text-[11px] font-bold tracking-widest text-slate-400">考生指引｜背景資料</h2>
            <p className="mt-2 text-base font-black text-slate-800">{sc.patient}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-700">{sc.background}</p>
            <h2 className="mt-5 text-[11px] font-bold tracking-widest text-slate-400">測驗任務</h2>
            <ol className="mt-2 space-y-2">
              {sc.tasks.map((t, i) => (
                <li key={t} className="flex gap-2 text-[14px] leading-relaxed text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-[12px] font-bold text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-[12px] text-slate-500">{sc.sourceNote}</p>
          </section>

          <section className="space-y-4">
            <div className="rounded-3xl bg-white/90 p-5 shadow-glass">
              <h2 className="text-[11px] font-bold tracking-widest text-slate-400">診間示意圖</h2>
              <RoomDiagram />
            </div>
            <div className="rounded-3xl bg-white/90 p-5 shadow-glass">
              <h2 className="text-[11px] font-bold tracking-widest text-slate-400">道具與耗材</h2>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[...EQUIPMENT.map((e) => ({ id: e.id, name: e.name })), ...INSTRUMENTS.map((i) => ({ id: i.id, name: i.name }))].map((e) => (
                  <div key={e.id} className="flex flex-col items-center text-center">
                    <EquipmentIcon id={e.id} size={34} />
                    <span className="text-[10px] leading-tight text-slate-600">{e.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/80 p-4">
          <h2 className="text-[12px] font-bold text-amber-800">數位模擬的限制</h2>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[12px] leading-relaxed text-amber-900">
            {WOUND_SUTURING_CASE.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onContinue} className="rounded-2xl bg-blue-700 px-6 py-3 text-base font-bold text-white shadow-lg hover:bg-blue-800">
            已閱讀，選擇訓練模式 →
          </button>
        </div>
      </div>
    </div>
  );
}

const MODE_STYLE: Record<TrainingModeId, { icon: string; color: string }> = {
  guided: { icon: '🧭', color: '#0ea5e9' },
  independent: { icon: '🛠️', color: '#1e40af' },
  challenge: { icon: '⏱️', color: '#dc2626' },
};

export function ModeSelect({ onSelect, onDemo, onBack }: { onSelect: (m: TrainingModeId) => void; onDemo: () => void; onBack: () => void }) {
  const modes = getTrainingModes(sc.stationMinutes);
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-sky-100 via-slate-50 to-blue-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
        <button type="button" onClick={onBack} className="mt-2 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600 shadow-sm hover:bg-white">
          ← 回到情境說明
        </button>
        <h1 className="mt-4 text-2xl font-black text-slate-800">選擇訓練模式</h1>
        <p className="mt-1 text-sm text-slate-500">建議先觀看正確示範，再依序挑戰三種練習模式。所有模式使用同一個模擬診間。</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={onDemo}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-5 text-left shadow-glass ring-2 ring-emerald-300 transition hover:-translate-y-1 hover:ring-emerald-400"
          >
            <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">建議先看</span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">🎬</span>
            <span className="mt-3 text-lg font-black text-slate-800">正確示範模式</span>
            <span className="text-[11px] font-bold text-emerald-700">Demonstration</span>
            <span className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">
              以動畫完整播放正確操作流程：器材準備、無菌手套、消毒、鋪單、三針縫合與打結、覆蓋及廢棄物處理，每一步都附字幕說明與正確觀念。
            </span>
            <span className="mt-3 flex flex-wrap gap-1 text-[10px] font-bold">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">完整流程</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">字幕＋語音旁白</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">可暫停 / 倍速 / 跳章</span>
            </span>
            <span className="mt-4 rounded-xl bg-emerald-600 py-2 text-center text-sm font-bold text-white">觀看示範</span>
          </button>
          {(Object.keys(modes) as TrainingModeId[]).map((id) => {
            const m = modes[id];
            const st = MODE_STYLE[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                className="group flex flex-col rounded-3xl bg-white/90 p-5 text-left shadow-glass ring-2 ring-transparent transition hover:-translate-y-1 hover:ring-blue-300"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: `${st.color}1a` }}>
                  {st.icon}
                </span>
                <span className="mt-3 text-lg font-black text-slate-800">{m.title}</span>
                <span className="text-[11px] font-bold" style={{ color: st.color }}>
                  {m.englishTitle}
                </span>
                <span className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">{m.description}</span>
                <span className="mt-3 flex flex-wrap gap-1 text-[10px] font-bold">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{m.showHints ? '逐層提示' : '無提示'}</span>
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
        <p className="mt-5 text-center text-[12px] text-slate-500">數位評分一律為「模擬練習評量」，僅作形成性回饋，不等同現場 OSCE 實作成績。</p>
      </div>
    </div>
  );
}
