import { useRef, useState } from 'react';
import type { MeatusZone } from '../engine';
import { CATHETER_RUBRIC_CONFIG as CFG } from '../rubricConfig';
import { distFromMeatus, MaleModel, svgPoint, zoneAt } from '../ui/MaleModel';
import { GloveBadge, Hotspots, ReviewNote, type StageProps } from '../ui/shared';

type P = { x: number; y: number };

/** 分析一筆棉枝軌跡：經過的部位、是否從尿道口開始、是否由內往外、是否回頭 */
export function analyzeStroke(pts: P[]) {
  const zones: MeatusZone[] = [];
  for (const p of pts) {
    const z = zoneAt(p.x, p.y);
    if (z && zones[zones.length - 1] !== z && !zones.includes(z)) zones.push(z);
  }
  const d = pts.map((p) => distFromMeatus(p.x, p.y));
  const startAtMeatus = d[0] <= 16;
  let max = 0;
  let backtrack = false;
  for (const x of d) {
    max = Math.max(max, x);
    if (max - x > 28) backtrack = true;
  }
  const outward = d[d.length - 1] - d[0] > 12;
  return { zones, startAtMeatus, outward, backtrack };
}

/** 第四階段（上）：消毒（棉枝在模型上實際拖曳） */
export function DisinfectStage({ state, dispatch, mode }: StageProps) {
  const svg = useRef<SVGSVGElement>(null);
  const [holding, setHolding] = useState(false);
  const [path, setPath] = useState<P[]>([]);
  const [trails, setTrails] = useState<P[][]>([]);
  const drawing = useRef(false);
  const tint = [...new Set(state.strokes.flatMap((s) => s.zones))];

  const pt = (e: React.PointerEvent) => svgPoint(svg.current!, e.clientX, e.clientY);
  const finish = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const pts = path;
    setPath([]);
    if (pts.length < 3) return;
    setTrails((t) => [...t.slice(-5), pts]);
    setHolding(false);
    dispatch({ type: 'swabStroke', ...analyzeStroke(pts) });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <GloveBadge state={state} />
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">棉枝剩 {state.kit.swabsLeft} 支{state.kit.iodine ? '（已沾優碘）' : '（未沾消毒液）'}</span>
        {state.drape.placed && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">洞巾已鋪上</span>}
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
        <div className="relative mx-auto aspect-[32/30] w-full max-w-lg rounded-3xl bg-white/80 p-2 ring-1 ring-slate-200">
          <MaleModel
            svgRef={svg}
            tint={mode.showHints ? tint : tint}
            drape={state.drape.placed ? { offset: state.drape.offset } : null}
            highlightMeatus={mode.showHints && holding && state.strokes.length === 0}
            svgProps={{
              onPointerDown: (e) => {
                if (!holding) return;
                (e.target as Element).setPointerCapture?.(e.pointerId);
                drawing.current = true;
                setPath([pt(e)]);
              },
              onPointerMove: (e) => drawing.current && setPath((p) => [...p, pt(e)]),
              onPointerUp: finish,
              onPointerCancel: finish,
              style: { cursor: holding ? 'crosshair' : 'default' },
            }}
          >
            {trails.map((t, i) => (
              <polyline key={i} points={t.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#b45309" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
            ))}
            {path.length > 1 && <polyline points={path.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#92400e" strokeWidth="6" strokeLinecap="round" opacity="0.7" />}
            {path.length > 0 && <circle cx={path[path.length - 1].x} cy={path[path.length - 1].y} r="7" fill="#b45309" stroke="#fff" />}
          </MaleModel>
          {!holding && <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[12px] font-bold text-slate-500">先在右側取一支棉枝，再在模型上拖曳消毒</p>}
        </div>
        <div className="space-y-2">
          <button
            type="button"
            disabled={holding}
            onClick={() => {
              if (!state.kit.iodine || state.kit.swabsLeft <= 0 || state.kit.flaps.length < 4) {
                dispatch({ type: 'swabStroke', zones: [], startAtMeatus: false, outward: false, backtrack: false });
                return;
              }
              setHolding(true);
            }}
            className="w-full rounded-2xl bg-amber-700 px-3 py-3 text-sm font-bold text-white shadow disabled:bg-amber-100 disabled:text-amber-900"
          >
            {holding ? '🟤 手持棉枝：在模型上拖曳一次' : '🟤 從導尿包取一支棉枝'}
          </button>
          {mode.showHints && (
            <div className="rounded-2xl bg-white/90 p-3 text-[12px] text-slate-600 ring-1 ring-slate-200">
              <p className="font-bold text-slate-700">本模擬的消毒示意規則</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {CFG.disinfect.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          <Hotspots ids={['gown', 'bedrail']} dispatch={dispatch} />
          <ReviewNote>{CFG.disinfect.review.note}</ReviewNote>
        </div>
      </div>
    </div>
  );
}
