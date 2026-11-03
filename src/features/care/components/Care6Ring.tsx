import { navigate } from '../../../router';
import { CARE6 } from '../data/care6';
import type { Care6Stage } from '../types';

/** CARE-6 導覽列：六個階段＋貫穿全程的同理心帶 */
export function Care6Ring({ active, done, onPick, compact }: { active?: Care6Stage; done?: (id: Care6Stage) => boolean; onPick?: (id: Care6Stage) => void; compact?: boolean }) {
  return (
    <div className="rounded-3xl bg-white/80 p-3 shadow-sm ring-1 ring-orange-100">
      <div className={`grid gap-1.5 ${compact ? 'grid-cols-6' : 'grid-cols-3 md:grid-cols-6'}`}>
        {CARE6.map((l) => {
          const on = active === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => (onPick ? onPick(l.id) : navigate(`/care/academy/${l.id}`))}
              className={`relative flex flex-col items-center rounded-2xl px-1 py-2 text-center transition ${on ? 'scale-[1.03] text-white shadow-lg' : 'bg-white text-slate-700 ring-1 ring-slate-100 hover:-translate-y-0.5'}`}
              style={on ? { background: l.color } : undefined}
              aria-current={on ? 'step' : undefined}
            >
              <span className="text-[20px] font-black leading-none" style={on ? undefined : { color: l.color }}>
                {l.letter}
              </span>
              <span className={`mt-0.5 text-[10px] font-bold tracking-wide ${on ? 'text-white/85' : 'text-slate-400'}`}>{l.englishTitle}</span>
              {!compact && <span className="mt-0.5 text-[12px] font-black">{l.title}</span>}
              {done?.(l.id) && <span className="absolute right-1 top-1 rounded-full bg-emerald-500 px-1 text-[9px] font-black text-white">✓</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-100 via-orange-100 to-teal-100 px-3 py-1 text-[11px] font-bold text-rose-700">
        <span>💗</span>
        <span>同理心貫穿全程：每一個階段都有同理的展現方式</span>
      </div>
    </div>
  );
}
