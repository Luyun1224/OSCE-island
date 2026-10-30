import { useRef, useState } from 'react';
import { MODEL } from '../caseData';
import { analyzeDisinfection, type Pt } from '../geometry';
import { HandTopView, clientToModel } from '../ui/HandTopView';
import { GloveBadge, RoomHotspots, StatusPill, type StageProps } from '../ui/shared';

/** 消毒軌跡（棉棒沾消毒溶液後的痕跡） */
export function IodineTrail({ strokes, current }: { strokes: Pt[][]; current?: Pt[] }) {
  const toPath = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  return (
    <g opacity={0.45}>
      {[...strokes, ...(current?.length ? [current] : [])].map((s, i) => (
        <path key={i} d={toPath(s)} fill="none" stroke="#9a4a1c" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </g>
  );
}

export function DisinfectStage({ state, dispatch, mode, hintLevel }: StageProps) {
  const svg = useRef<SVGSVGElement>(null);
  const [current, setCurrent] = useState<Pt[]>([]);
  const drawing = useRef(false);
  const d = state.disinfection;
  const analysis = analyzeDisinfection(d.strokes);
  const showHole = mode.showHints && hintLevel >= 2;

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!d.swabWet) {
      dispatch({ type: 'disinfectStroke', points: [] }); // 未沾消毒液：由引擎產生提示
      return;
    }
    drawing.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setCurrent([clientToModel(svg.current!, e.clientX, e.clientY)]);
  };
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawing.current) return;
    const p = clientToModel(svg.current!, e.clientX, e.clientY);
    setCurrent((c) => {
      const last = c[c.length - 1];
      return last && Math.hypot(last.x - p.x, last.y - p.y) < 0.15 ? c : [...c, p];
    });
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    dispatch({ type: 'disinfectStroke', points: current });
    setCurrent([]);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RoomHotspots ids={['antiseptic-bottle', 'sleeve', 'lamp']} dispatch={dispatch} gloved={state.gloves.status === 'sterile'} />
        <GloveBadge state={state} />
      </div>
      <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_14rem]">
        <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-inner">
          <HandTopView ref={svg} className={`h-full max-h-[62vh] w-full ${d.swabWet ? 'cursor-crosshair' : 'cursor-not-allowed'}`} onPointerDown={down} onPointerMove={move} onPointerUp={up}>
            <IodineTrail strokes={d.strokes} current={current} />
            {showHole && <circle cx={0} cy={0} r={MODEL.drapeHoleRadius} fill="none" stroke="#2f7a64" strokeWidth={0.06} strokeDasharray="0.3 0.2" />}
            {state.drape.center && !state.drape.removed && (
              <circle cx={state.drape.center.x} cy={state.drape.center.y} r={MODEL.drapeHoleRadius} fill="none" stroke="#2f7a64" strokeWidth={0.4} opacity={0.6} />
            )}
          </HandTopView>
          {!d.swabWet && (
            <div className="pointer-events-none absolute inset-x-0 top-3 mx-auto w-fit rounded-full bg-slate-900/70 px-3 py-1 text-[12px] text-white">先讓棉棒沾取消毒溶液</div>
          )}
          {d.swabWet && d.strokes.length === 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-slate-900/70 px-3 py-1 text-[12px] text-white">以滑鼠或手指在皮膚上拖曳塗抹</div>
          )}
        </div>
        <div className="space-y-2">
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">消毒用品</p>
            <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-600">
              <span className="text-2xl">🧴</span>消毒溶液＋滅菌大棉棒
            </div>
            <button
              type="button"
              disabled={d.swabWet}
              onClick={() => dispatch({ type: 'wetSwab' })}
              className="mt-2 w-full rounded-xl bg-amber-700 px-3 py-2 text-sm font-bold text-white disabled:bg-slate-200 disabled:text-slate-500"
            >
              {d.swabWet ? '棉棒已沾消毒溶液' : '倒消毒溶液於棉棒'}
            </button>
            <button type="button" onClick={() => dispatch({ type: 'clearDisinfection' })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50">
              換新棉棒，重新消毒
            </button>
          </div>
          {mode.showHints && d.strokes.length > 0 && (
            <div className="space-y-1.5 rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
              <p className="text-[11px] font-bold text-slate-500">即時回饋</p>
              <StatusPill ok={analysis.insideOut}>{analysis.insideOut ? '由內而外' : analysis.inwardReturns ? `往回擦 ${analysis.inwardReturns} 次` : '從傷口開始向外擴展'}</StatusPill>
              <br />
              <StatusPill ok={analysis.coversDrapeHole}>範圍 {analysis.coverageRadius.toFixed(1)} cm {analysis.coversDrapeHole ? '＞' : '≦'} 洞巾開口</StatusPill>
            </div>
          )}
          <p className="px-1 text-[11px] leading-relaxed text-slate-400">模擬限制：以軌跡判斷消毒方向與範圍，無法模擬實際塗抹力道與待乾時間。</p>
        </div>
      </div>
    </div>
  );
}
