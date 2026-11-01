import type { ReactNode } from 'react';
import { useDropState } from '../../../training/components/DragDrop';
import type { TrainingModeConfig } from '../../../training/types';
import type { AWAction, AWState } from '../engine';

export interface StageProps {
  state: AWState;
  dispatch: (a: AWAction) => void;
  mode: TrainingModeConfig;
  isMobile: boolean;
  /** 示範模式（畫面唯讀） */
  demo?: boolean;
  /** 示範模式：標示正確選項 */
  demoHighlight?: string[];
}

export function DropArea({ id, title, sub, children, className }: { id: string; title: string; sub?: string; children: ReactNode; className?: string }) {
  const { active, over } = useDropState(id);
  return (
    <div data-drop={id} className={`relative rounded-2xl border-2 border-dashed p-2 transition ${over ? 'border-indigo-500 bg-indigo-50/80' : active ? 'border-indigo-300 bg-white/60' : 'border-transparent'} ${className ?? ''}`}>
      <p className="text-[11px] font-bold text-slate-500">
        {title} {sub && <span className="font-normal text-slate-400">{sub}</span>}
      </p>
      {children}
    </div>
  );
}

export function Pill({ ok, children }: { ok: boolean | null; children: ReactNode }) {
  const cls = ok === null ? 'bg-slate-100 text-slate-500' : ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>{children}</span>;
}

export function ReviewNote({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-violet-50 px-3 py-1.5 text-[11px] leading-relaxed text-violet-800">🩺 待臨床教師審核：{children}</p>;
}

export function SupplementNote({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-cyan-50 px-3 py-1.5 text-[11px] leading-relaxed text-cyan-900 ring-1 ring-cyan-200">➕ 現行臨床安全補充（不在教案 14 項評分內）：{children}</p>;
}

/** 選擇題按鈕：示範模式會標示正確選項 */
export function Choice({ id, onClick, children, demoHighlight, active, tone = 'slate' }: { id: string; onClick: () => void; children: ReactNode; demoHighlight?: string[]; active?: boolean; tone?: 'slate' | 'rose' }) {
  const hl = demoHighlight?.includes(id);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-3 py-2.5 text-left text-[13px] text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 ${hl ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400' : active ? 'border-indigo-500 bg-indigo-50' : tone === 'rose' ? 'border-rose-200 bg-white' : 'border-slate-200 bg-white'}`}
    >
      {children}
      {hl && <span className="ml-1 font-bold text-emerald-700">✓</span>}
    </button>
  );
}
