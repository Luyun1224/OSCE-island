import type { ReactNode } from 'react';
import { navigate } from '../../../router';
import type { Crumb } from '../../history/components/Shell';
import type { Observability } from '../types';

export function ExamShell({ crumbs, children, wide }: { crumbs: Crumb[]; children: ReactNode; wide?: boolean }) {
  const all: Crumb[] = [{ label: '🏝️ 群島', to: '/' }, { label: '🩺 身體檢查島', to: '/map/physical-exam' }, ...crumbs];
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#eefaf2] via-[#f8fafc] to-[#e6f6f4]">
      <div className={`mx-auto px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))] md:px-8 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <nav className="flex flex-wrap items-center gap-1.5 py-3 text-[13px]">
          {all.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-emerald-200">/</span>}
              {c.to && i < all.length - 1 ? (
                <button type="button" onClick={() => navigate(c.to!)} className="rounded-full bg-white/85 px-3 py-1 font-bold text-slate-600 shadow-sm ring-1 ring-emerald-100 hover:bg-white">
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

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100 md:p-5 ${className}`}>{children}</div>;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900 ring-1 ring-amber-200">ℹ️ {children}</p>;
}

export const OBS: Record<Observability, { label: string; cls: string }> = {
  web: { label: '網頁可記錄', cls: 'bg-emerald-100 text-emerald-800' },
  teacher: { label: '需教師實體觀察', cls: 'bg-sky-100 text-sky-800' },
  'not-digital': { label: '無法由數位模型判定', cls: 'bg-rose-100 text-rose-800' },
};

export function GoButton({ to, children, tone = 'green' }: { to: string; children: ReactNode; tone?: 'green' | 'ghost' }) {
  return (
    <button type="button" onClick={() => navigate(to)} className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition ${tone === 'green' ? 'bg-emerald-600 text-white shadow hover:bg-emerald-700' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
      {children}
    </button>
  );
}
