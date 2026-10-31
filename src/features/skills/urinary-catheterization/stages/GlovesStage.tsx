import { useMemo } from 'react';
import { STERILE_GLOVE_DECISIONS } from '../../../training/sterile';
import { CTIcon } from '../ui/Icons';
import { GloveBadge, Hotspots, type StageProps } from '../ui/shared';

/** 第三階段：無菌手套（閉合原則的決策點） */
export function GlovesStage({ state, dispatch, mode, demoHighlight }: StageProps) {
  const g = state.gloves;
  const d = STERILE_GLOVE_DECISIONS[g.progress];
  const options = useMemo(() => (d ? [...d.options].sort((a, b) => (a.id.length % 3) - (b.id.length % 3)) : []), [d]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <GloveBadge state={state} />
        {state.maskOn ? <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">😷 已戴口罩</span> : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">尚未戴口罩</span>}
      </div>

      {g.status === 'exam' && (
        <div className="rounded-3xl bg-indigo-50 p-4 ring-1 ring-indigo-200">
          <p className="text-sm font-black text-indigo-900">目前戴的是檢診手套（非無菌）</p>
          <p className="mt-1 text-[13px] text-indigo-800">若要進行無菌操作，請先脫下，再穿戴無菌手套。</p>
          <button type="button" onClick={() => dispatch({ type: 'removeGloves' })} className="mt-2 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-bold text-white">
            脫下檢診手套
          </button>
        </div>
      )}

      {g.status === 'sterile' ? (
        <div className="rounded-3xl bg-yellow-50 p-4 ring-1 ring-yellow-200">
          <div className="flex items-center gap-3">
            <CTIcon id="gloves" size={56} />
            <div>
              <p className="text-base font-black text-slate-800">無菌手套已戴好</p>
              <p className="text-[13px] text-slate-600">從現在起，雙手只接觸無菌區內的物品。下方是診間中常見的非無菌物。</p>
            </div>
          </div>
          <div className="mt-3">
            <Hotspots ids={['bedrail', 'gown', 'cart', 'mask', 'curtain']} dispatch={dispatch} />
          </div>
        </div>
      ) : (
        g.status !== 'exam' &&
        d && (
          <div className="grid gap-3 md:grid-cols-[12rem_1fr]">
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white/90 p-4 ring-1 ring-slate-200">
              <svg viewBox="0 0 160 120" className="w-full">
                <rect x="8" y="14" width="144" height="94" rx="6" fill="#fefce8" stroke="#ca8a04" />
                {[0, 1].map((i) => (
                  <g key={i} transform={`translate(${30 + i * 66} 24)`}>
                    <path d="M10 76 V42 l-5 -22 a4 4 0 0 1 8 -2 l4 18 V8 a4 4 0 0 1 8 0 v24 V4 a4 4 0 0 1 8 0 v28 V8 a4 4 0 0 1 8 0 v32 l6 -10 a4 4 0 0 1 7 3 l-9 22 v21 z" fill={g.progress > i + 1 ? '#fde047' : '#fef08a'} stroke="#a16207" strokeWidth="1.2" />
                    <rect x="4" y="66" width="44" height="12" rx="2" fill="#facc15" stroke="#a16207" />
                  </g>
                ))}
              </svg>
              <p className="text-[12px] font-bold text-slate-500">
                步驟 {g.progress + 1} / {STERILE_GLOVE_DECISIONS.length}
              </p>
            </div>
            <div className="rounded-3xl bg-white/90 p-4 ring-1 ring-slate-200">
              <p className="text-[11px] font-bold tracking-wider text-blue-500">{d.title}</p>
              <p className="mt-1 text-base font-black text-slate-800">{d.prompt}</p>
              <div className="mt-3 space-y-2">
                {options.map((o) => (
                  <button key={o.id} type="button" onClick={() => dispatch({ type: 'gloveDecision', decision: d.id, option: o.id })} className={`w-full rounded-xl border px-4 py-3 text-left text-sm text-slate-700 hover:border-blue-400 hover:bg-blue-50 ${demoHighlight === o.id ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400' : 'border-slate-200 bg-white'}`}>
                    {o.text}
                    {demoHighlight === o.id && <span className="ml-1 font-bold text-emerald-700">✓</span>}
                  </button>
                ))}
              </div>
              {g.progress === 0 && (
                <p className="mt-3 text-[11px] text-slate-500">
                  {mode.showHints ? '建議先完成器材準備（倒溶液、拆包）再戴無菌手套；戴上後碰觸非無菌物品會造成污染。' : '準備好就開始穿戴。'}
                </p>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
