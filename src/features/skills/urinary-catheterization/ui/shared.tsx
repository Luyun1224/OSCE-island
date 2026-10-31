import type { ReactNode } from 'react';
import { useDropState } from '../../../training/components/DragDrop';
import type { HandAreaId } from '../../../training/sterile';
import type { TrainingModeConfig } from '../../../training/types';
import { HOTSPOTS, type HotspotId } from '../caseData';
import type { CTAction, CTState } from '../engine';

export interface StageProps {
  state: CTState;
  dispatch: (a: CTAction) => void;
  mode: TrainingModeConfig;
  hintLevel: number;
  isMobile: boolean;
  /** 示範模式：標示正確選項的 id */
  demoHighlight?: string;
  /** 示範模式：手部衛生已搓揉的部位 */
  demoAreas?: HandAreaId[];
  /** 示範模式（畫面唯讀，顯示示意軌跡） */
  demo?: boolean;
}

export function DropArea({ id, title, sub, children, className }: { id: string; title: string; sub?: string; children: ReactNode; className?: string }) {
  const { active, over } = useDropState(id);
  return (
    <div data-drop={id} className={`relative rounded-2xl border-2 border-dashed p-2 transition ${over ? 'border-blue-500 bg-blue-50/80' : active ? 'border-blue-300 bg-white/60' : 'border-transparent'} ${className ?? ''}`}>
      <p className="text-[11px] font-bold text-slate-500">
        {title} {sub && <span className="font-normal text-slate-400">{sub}</span>}
      </p>
      {children}
    </div>
  );
}

/** 診間中的非無菌物：戴無菌手套後碰觸會造成污染 */
export function Hotspots({ ids, dispatch }: { ids: HotspotId[]; dispatch: (a: CTAction) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-bold text-slate-400">診間環境</span>
      {ids.map((id) => (
        <button key={id} type="button" onClick={() => dispatch({ type: 'touch', hotspot: id })} className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:border-slate-300">
          {HOTSPOTS[id].icon} {HOTSPOTS[id].label}
        </button>
      ))}
    </div>
  );
}

export function GloveBadge({ state }: { state: CTState }) {
  const g = state.gloves;
  const label = g.status === 'sterile' ? '無菌手套' : g.status === 'exam' ? '檢診手套' : g.progress > 0 ? '穿戴中' : '徒手';
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${g.status === 'sterile' ? 'bg-yellow-100 text-yellow-800' : g.status === 'exam' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>🧤 {label}</span>;
}

export function Pill({ ok, children }: { ok: boolean | null; children: ReactNode }) {
  const cls = ok === null ? 'bg-slate-100 text-slate-500' : ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>{children}</span>;
}

export function ReviewNote({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-violet-50 px-3 py-1.5 text-[11px] leading-relaxed text-violet-800">🩺 待臨床教師審核：{children}</p>;
}
