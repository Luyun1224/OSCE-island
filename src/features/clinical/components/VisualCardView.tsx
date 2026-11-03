import type { VisualCard } from '../types';

/** 圖像化學習卡 */
export function VisualCardView({ card }: { card: VisualCard }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-950 to-indigo-800 p-4 text-white shadow-lg">
      <p className="text-[12px] font-black tracking-widest text-teal-300">🗂️ 學習卡</p>
      <h3 className="text-lg font-black">{card.title}</h3>
      {card.layout === 'steps' && (
        <div className="mt-3 flex flex-wrap items-stretch gap-1.5">
          {card.items.map((it, i) => (
            <div key={it.label} className="flex items-center gap-1.5">
              <div className="flex min-w-[4.5rem] flex-col items-center rounded-2xl px-2 py-2 text-center" style={{ background: `${it.color}33`, boxShadow: `inset 0 0 0 2px ${it.color}` }}>
                <span className="text-xl">{it.icon}</span>
                <span className="text-lg font-black" style={{ color: it.color }}>
                  {it.label}
                </span>
                <span className="text-[11px] text-indigo-100">{it.desc}</span>
              </div>
              {i < card.items.length - 1 && <span className="text-teal-300">→</span>}
            </div>
          ))}
        </div>
      )}
      {card.layout === 'grid' && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {card.items.map((it) => (
            <div key={it.label} className="rounded-2xl bg-white/10 px-3 py-2" style={{ boxShadow: `inset 4px 0 0 ${it.color}` }}>
              <p className="text-[14px] font-black">
                {it.icon} {it.label}
              </p>
              <p className="text-[12px] text-indigo-100">{it.desc}</p>
            </div>
          ))}
        </div>
      )}
      {card.layout === 'ladder' && (
        <div className="mt-3 space-y-1.5">
          {card.items.map((it, i) => (
            <div key={it.label} className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2" style={{ marginLeft: `${i * 0.75}rem`, boxShadow: `inset 4px 0 0 ${it.color}` }}>
              <span className="text-lg">{it.icon}</span>
              <span className="text-[14px] font-black">{it.label}</span>
              <span className="text-[12px] text-indigo-100">{it.desc}</span>
            </div>
          ))}
        </div>
      )}
      {card.footnote && <p className="mt-3 text-[12px] text-teal-200">💡 {card.footnote}</p>}
    </div>
  );
}
