import { useRef, useState } from 'react';
import { lubeFromTip } from '../engine';
import { CATHETER_RUBRIC_CONFIG as CFG } from '../rubricConfig';
import { GloveBadge, ReviewNote, type StageProps } from '../ui/shared';

const X0 = 30;
const X1 = 330;
const Y = 70;
const toFrac = (x: number) => Math.max(0, Math.min(1, (x - X0) / (X1 - X0)));

/** 第五階段：潤滑劑（沿導尿管拖曳塗抹，系統計算由尖端起的塗抹範圍） */
export function LubricateStage({ state, dispatch, mode }: StageProps) {
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<[number, number] | null>(null);
  const ready = state.items.catheter === 'field' && state.kit.jelly;
  const reach = lubeFromTip(state.catheter.lube);
  const target = CFG.lubrication.targetFraction;

  const x = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 360;
  };
  const end = () => {
    if (!drag) return;
    const [a, b] = drag;
    setDrag(null);
    if (Math.abs(b - a) < 0.02) return;
    dispatch({ type: 'lubricate', from: Math.min(a, b), to: Math.max(a, b) });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <GloveBadge state={state} />
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${state.kit.jelly ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{state.kit.jelly ? '導尿包內已有潤滑劑' : '導尿包內沒有潤滑劑'}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${state.items.catheter === 'field' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{state.items.catheter === 'field' ? '導尿管在無菌區' : '導尿管尚未放入無菌區'}</span>
      </div>
      <div className="rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
        <p className="text-[12px] font-bold text-slate-500">{ready ? '在導尿管上按住並拖曳，塗抹潤滑劑（左端為尖端）' : '需要：導尿管已在無菌區、導尿包內已擠入潤滑劑'}</p>
        <svg
          ref={svg}
          viewBox="0 0 360 140"
          className="mt-1 w-full touch-none select-none"
          onPointerDown={(e) => {
            if (!ready) {
              dispatch({ type: 'lubricate', from: 0, to: 0 });
              return;
            }
            (e.target as Element).setPointerCapture?.(e.pointerId);
            const f = toFrac(x(e));
            setDrag([f, f]);
          }}
          onPointerMove={(e) => drag && setDrag([drag[0], toFrac(x(e))])}
          onPointerUp={end}
          onPointerCancel={end}
        >
          <rect x="0" y="0" width="360" height="140" rx="14" fill="#f0fdf4" />
          {/* 導尿管：尖端在左，尾端分叉 */}
          <path d={`M${X0} ${Y} H${X1 - 40}`} stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" />
          <path d={`M${X1 - 40} ${Y} L${X1} ${Y - 18} M${X1 - 40} ${Y} L${X1} ${Y + 18}`} stroke="#fbbf24" strokeWidth="10" strokeLinecap="round" />
          <circle cx={X0 + 10} cy={Y - 2} r="2" fill="#92400e" />
          <text x={X1 + 4} y={Y - 22} fontSize="8" fill="#92400e">引流</text>
          <text x={X1 + 4} y={Y + 28} fontSize="8" fill="#92400e">水球</text>
          {state.catheter.lube.map(([a, b], i) => (
            <rect key={i} x={X0 + a * (X1 - X0) - 2} y={Y - 9} width={(b - a) * (X1 - X0) + 4} height="18" rx="9" fill="#86efac" opacity="0.6" />
          ))}
          {drag && <rect x={X0 + Math.min(...drag) * (X1 - X0)} y={Y - 10} width={Math.abs(drag[1] - drag[0]) * (X1 - X0)} height="20" rx="10" fill="#22c55e" opacity="0.5" />}
          <text x={X0 - 4} y={Y + 26} fontSize="9" fontWeight="700" fill="#475569">尖端</text>
          {mode.measuringAids && (
            <g>
              <line x1={X0} x2={X1} y1={112} y2={112} stroke="#94a3b8" />
              {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                <g key={f}>
                  <line x1={X0 + f * (X1 - X0)} x2={X0 + f * (X1 - X0)} y1={108} y2={116} stroke="#94a3b8" />
                  <text x={X0 + f * (X1 - X0)} y={128} textAnchor="middle" fontSize="8" fill="#64748b">
                    {f === 0.5 ? '1/2' : f === 1 ? '尾端' : ''}
                  </text>
                </g>
              ))}
              {mode.showHints && <line x1={X0 + target * (X1 - X0)} x2={X0 + target * (X1 - X0)} y1={44} y2={96} stroke="#16a34a" strokeDasharray="4 3" />}
            </g>
          )}
        </svg>
        <p className="text-[12px] text-slate-600">
          由尖端連續塗抹範圍：<b>{Math.round(reach * 100)}%</b> 管長
          {mode.showHints && <span className="text-slate-400">（本教案規準：{CFG.lubrication.label}）</span>}
        </p>
      </div>
      <ReviewNote>{CFG.lubrication.review.note}</ReviewNote>
    </div>
  );
}
