import type { ReactNode } from 'react';
import { navigate } from '../../../router';
import type { Crumb } from '../../history/components/Shell';
import { MAP } from '../engine/evaluate';
import type { DecisionEvent, PatientState } from '../types';

/** 頁面外框：靛紫／青綠／白，警示橘點綴 */
export function ClinicalShell({ crumbs, children, wide }: { crumbs: Crumb[]; children: ReactNode; wide?: boolean }) {
  const all: Crumb[] = [{ label: '🏝️ 群島', to: '/' }, { label: '🧭 臨床處置島', to: '/map/clinical-management' }, ...crumbs];
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#eef0ff] via-[#f8fafc] to-[#e8f8f6]">
      <div className={`mx-auto px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))] md:px-8 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <nav className="flex flex-wrap items-center gap-1.5 py-3 text-[13px]">
          {all.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-indigo-200">/</span>}
              {c.to && i < all.length - 1 ? (
                <button type="button" onClick={() => navigate(c.to!)} className="rounded-full bg-white/85 px-3 py-1 font-bold text-slate-600 shadow-sm ring-1 ring-indigo-100 hover:bg-white">
                  {c.label}
                </button>
              ) : (
                <span className="font-black text-slate-800">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-indigo-100 md:p-5 ${className}`}>{children}</div>;
}

export function DemoNote({ text }: { text?: string }) {
  return <p className="rounded-2xl bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900 ring-1 ring-amber-200">ℹ️ {text ?? 'DEMO 病例為本平台原創教學情境，非國考題目、非真實病人；臨床數值、處置與模擬後果待臨床教師審核。練習結果為「模擬形成性評量」，不是正式 OSCE 評分。'}</p>;
}

export function Btn({ children, onClick, disabled, tone = 'indigo' }: { children: ReactNode; onClick: () => void; disabled?: boolean; tone?: 'indigo' | 'teal' | 'orange' | 'ghost' }) {
  const cls = { indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow', teal: 'bg-teal-600 text-white hover:bg-teal-700 shadow', orange: 'bg-orange-500 text-white hover:bg-orange-600 shadow', ghost: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50' }[tone];
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}>
      {children}
    </button>
  );
}

/** 可勾選的選項卡（真的可以點選；回饋顯示時標示必要性） */
export function OptionToggle({ on, onClick, children, tag, disabled }: { on: boolean; onClick: () => void; children: ReactNode; tag?: ReactNode; disabled?: boolean }) {
  return (
    <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick} className={`w-full rounded-2xl border-2 px-3 py-2.5 text-left text-[14px] leading-relaxed transition ${on ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'} disabled:cursor-default`}>
      <span className="flex items-start gap-2">
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[12px] font-black ${on ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{on ? '✓' : ''}</span>
        <span className="min-w-0 flex-1 text-slate-800">{children}</span>
      </span>
      {tag && <span className="mt-1.5 block pl-7">{tag}</span>}
    </button>
  );
}

const Q: Record<DecisionEvent['quality'], { label: string; cls: string }> = {
  good: { label: '適當', cls: 'bg-emerald-100 text-emerald-800' },
  acceptable: { label: '可再加強', cls: 'bg-amber-100 text-amber-800' },
  poor: { label: '待修正', cls: 'bg-rose-100 text-rose-800' },
  unsafe: { label: '病人安全', cls: 'bg-red-600 text-white' },
};

export function QualityChip({ q }: { q: DecisionEvent['quality'] }) {
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${Q[q].cls}`}>{Q[q].label}</span>;
}

/** 即時觀念回饋：列出這一步的決策事件（安全事件置頂） */
export function EventList({ events }: { events: DecisionEvent[] }) {
  const sorted = [...events].sort((a, b) => Number(!!b.safety) - Number(!!a.safety));
  return (
    <ul className="space-y-1.5">
      {sorted.map((e, i) => (
        <li key={i} className={`rounded-2xl px-3 py-2 text-[13px] ${e.safety ? 'bg-red-50 ring-2 ring-red-300' : 'bg-slate-50'}`}>
          <span className="flex flex-wrap items-center gap-1.5">
            <QualityChip q={e.safety && e.quality !== 'unsafe' ? 'unsafe' : e.quality} />
            <b className="text-slate-800">{e.label}</b>
          </span>
          <span className="mt-0.5 block leading-relaxed text-slate-600">{e.note}</span>
          {e.safety && <span className="mt-0.5 block font-bold text-red-700">⚠️ 安全事件：{e.safety}</span>}
        </li>
      ))}
    </ul>
  );
}

/** 生命徵象監視器 */
export function VitalsMonitor({ s, title = '生命徵象', compareTo, wide }: { s: PatientState; title?: string; compareTo?: PatientState; wide?: boolean }) {
  const v = s.vitals;
  const cells: [string, string, boolean, string?][] = [
    ['體溫', `${v.temp.toFixed(1)}°C`, v.temp >= 38, compareTo && `${compareTo.vitals.temp.toFixed(1)}`],
    ['心跳', `${v.hr}`, v.hr > 100, compareTo && `${compareTo.vitals.hr}`],
    ['血壓', `${v.sbp}/${v.dbp}`, v.sbp < 90, compareTo && `${compareTo.vitals.sbp}/${compareTo.vitals.dbp}`],
    ['MAP', `${MAP(s)}`, MAP(s) < 65, compareTo && `${MAP(compareTo)}`],
    ['呼吸', `${v.rr}`, v.rr >= 22, compareTo && `${compareTo.vitals.rr}`],
    ['SpO₂', `${v.spo2}%`, v.spo2 < 92],
    ['GCS', `${v.gcs}`, v.gcs < 15, compareTo && `${compareTo.vitals.gcs}`],
  ];
  return (
    <div className="rounded-3xl bg-slate-900 p-3 text-white shadow-lg">
      <p className="flex items-center gap-2 text-[11px] font-black tracking-widest text-teal-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
        {title}
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${s.trend === 'better' ? 'bg-emerald-500/30 text-emerald-200' : s.trend === 'worse' ? 'bg-red-500/30 text-red-200' : 'bg-white/10 text-slate-300'}`}>{s.trend === 'better' ? '改善' : s.trend === 'worse' ? '惡化' : '持平'}</span>
      </p>
      <div className={`mt-2 grid grid-cols-4 gap-1.5 ${wide ? 'sm:grid-cols-7' : ''}`}>
        {cells.map(([k, val, bad, prev]) => (
          <div key={k} className={`rounded-xl px-2 py-1.5 ${bad ? 'bg-orange-500/25 ring-1 ring-orange-400' : 'bg-white/5'}`}>
            <p className="text-[10px] text-slate-400">{k}</p>
            <p className={`whitespace-nowrap text-[15px] font-black tabular-nums ${bad ? 'text-orange-300' : 'text-white'}`}>{val}</p>
            {prev && prev !== val && <p className="text-[9px] text-slate-400">原 {prev}</p>}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-slate-300">
        {s.status}
        {s.lactate !== undefined && `｜乳酸 ${s.lactate}`}
        {s.urineMlPerHr !== undefined && `｜尿量約 ${s.urineMlPerHr} mL/hr`}
      </p>
    </div>
  );
}

export function Steps({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="flex gap-1.5 overflow-x-auto pb-1">
      {labels.map((s, i) => (
        <li key={s} className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${i === current ? 'bg-indigo-600 text-white' : i < current ? 'bg-teal-100 text-teal-800' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
          {i < current ? '✓ ' : `${i + 1}. `}
          {s}
        </li>
      ))}
    </ol>
  );
}
