import type { ReactNode } from 'react';
import { navigate } from '../../../router';
import type { Crumb } from '../../history/components/Shell';

/** CARE ISLAND 頁面外框：珊瑚橘／奶油白／暖黃／青綠 */
export function CareShell({ crumbs, children, wide }: { crumbs: Crumb[]; children: ReactNode; wide?: boolean }) {
  const all: Crumb[] = [{ label: '🏝️ 群島', to: '/' }, { label: '🤝 醫病溝通島', to: '/map/communication' }, ...crumbs];
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#fff4ea] via-[#fffaf3] to-[#eaf7f4]">
      <div className={`mx-auto px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))] md:px-8 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <nav className="flex flex-wrap items-center gap-1.5 py-3 text-[13px]">
          {all.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-orange-200">/</span>}
              {c.to && i < all.length - 1 ? (
                <button type="button" onClick={() => navigate(c.to!)} className="rounded-full bg-white/85 px-3 py-1 font-bold text-slate-600 shadow-sm ring-1 ring-orange-100 hover:bg-white">
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

export function FrameworkNote() {
  return (
    <p className="rounded-2xl bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900 ring-1 ring-amber-200">
      ℹ️ CARE-6 是本平台參考 Calgary–Cambridge 指引自行整理的教學架構，並非官方西醫師 OSCE 國考 SOP。所有情境皆為原創教學示範，非正式考題，內容待臨床教師審核。
    </p>
  );
}

export function SkillChip({ children, tone = 'teal' }: { children: ReactNode; tone?: 'teal' | 'coral' | 'amber' | 'slate' }) {
  const cls = { teal: 'bg-teal-50 text-teal-800 ring-teal-200', coral: 'bg-orange-50 text-orange-800 ring-orange-200', amber: 'bg-amber-50 text-amber-800 ring-amber-200', slate: 'bg-slate-50 text-slate-600 ring-slate-200' }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${cls}`}>{children}</span>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-orange-100 md:p-5 ${className}`}>{children}</div>;
}
