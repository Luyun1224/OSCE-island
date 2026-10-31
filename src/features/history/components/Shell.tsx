import type { ReactNode } from 'react';
import { navigate } from '../../../router';
import type { OptionQuality, ReviewMeta } from '../types';

export interface Crumb {
  label: string;
  to?: string;
}

/** HISTORY QUEST 頁面外框：麵包屑＋暖色背景 */
export function HQShell({ crumbs, children, wide }: { crumbs: Crumb[]; children: ReactNode; wide?: boolean }) {
  const all: Crumb[] = [{ label: '🏝️ 群島', to: '/' }, { label: '💬 病史詢問島', to: '/map/history-taking' }, ...crumbs];
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#fdf6ec] via-[#fbfaf7] to-[#eef8f6]">
      <div className={`mx-auto px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))] md:px-8 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <nav className="flex flex-wrap items-center gap-1.5 py-3 text-[13px]">
          {all.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-300">/</span>}
              {c.to && i < all.length - 1 ? (
                <button type="button" onClick={() => navigate(c.to!)} className="rounded-full bg-white/80 px-3 py-1 font-bold text-slate-600 shadow-sm hover:bg-white">
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

export function ReviewBadge({ review }: { review: ReviewMeta }) {
  if (review.status === 'reviewed') {
    return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">✓ 已審核{review.reviewer ? `｜${review.reviewer}` : ''}</span>;
  }
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800" title={review.note}>
      📝 教材草稿・待教師審核
    </span>
  );
}

export const QUALITY_STYLE: Record<OptionQuality, { label: string; cls: string; dot: string }> = {
  best: { label: '適當', cls: 'border-emerald-400 bg-emerald-50', dot: 'bg-emerald-500' },
  ok: { label: '可再加強', cls: 'border-amber-400 bg-amber-50', dot: 'bg-amber-500' },
  poor: { label: '不適當', cls: 'border-rose-300 bg-rose-50', dot: 'bg-rose-500' },
};

export function QualityTag({ q }: { q: OptionQuality }) {
  const s = QUALITY_STYLE[q];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-700 ring-1 ring-slate-200">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/** 形成性練習分數條 */
export function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max ? Math.round((score / max) * 100) : 0;
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-orange-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 text-right text-[12px] font-bold tabular-nums text-slate-600">
        {score}/{max}
      </span>
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, tone = 'teal' }: { children: ReactNode; onClick: () => void; disabled?: boolean; tone?: 'teal' | 'orange' | 'ghost' }) {
  const cls =
    tone === 'teal'
      ? 'bg-teal-600 text-white shadow hover:bg-teal-700'
      : tone === 'orange'
        ? 'bg-orange-500 text-white shadow hover:bg-orange-600'
        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50';
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}>
      {children}
    </button>
  );
}

/** 練習結果的共同聲明 */
export function FormativeNote() {
  return <p className="text-[11px] text-slate-400">練習分數為「模擬形成性評量」，用於自我學習，不等同正式 OSCE 考官評分。</p>;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
