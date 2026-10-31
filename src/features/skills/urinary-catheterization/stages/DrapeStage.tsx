import { useRef } from 'react';
import { Draggable, useDropZone } from '../../../training/components/DragDrop';
import { kitOpen } from '../engine';
import { MaleModel, MODEL, svgPoint } from '../ui/MaleModel';
import { CTIcon } from '../ui/Icons';
import { DropArea, GloveBadge, type StageProps } from '../ui/shared';

/** 第四階段（下）：鋪洞巾（拖曳洞巾，開口對準尿道口） */
export function DrapeStage({ state, dispatch, mode }: StageProps) {
  const svg = useRef<SVGSVGElement>(null);
  useDropZone('ct-model', (p, x, y) => {
    if (p.kind !== 'ct-drape' || !svg.current) return;
    const q = svgPoint(svg.current, x, y);
    dispatch({ type: 'placeDrape', offset: Math.round(Math.hypot(q.x - MODEL.meatus.x, q.y - (MODEL.glans.cy - 6))) });
  });
  const tint = [...new Set(state.strokes.flatMap((s) => s.zones))];
  const available = kitOpen(state) && !state.drape.placed;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <GloveBadge state={state} />
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${state.strokes.length ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>{state.strokes.length ? `已消毒（${state.strokes.length} 支棉枝）` : '尚未消毒'}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_13rem]">
        <DropArea id="ct-model" title="男性導尿模型" sub="把洞巾拖到模型上，開口對準尿道口">
          <div className="mx-auto aspect-[32/30] w-full max-w-lg">
            <MaleModel svgRef={svg} tint={tint} drape={state.drape.placed ? { offset: state.drape.offset } : null} highlightMeatus={mode.showHints && available} />
          </div>
        </DropArea>
        <div className="space-y-2">
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">導尿包內的無菌洞巾</p>
            {available ? (
              <Draggable payload={{ kind: 'ct-drape', id: 'drape' }} preview={<div className="rounded-2xl bg-white p-1 shadow-xl ring-2 ring-emerald-400"><CTIcon id="drape" size={72} /></div>}>
                <div className="mt-1 flex flex-col items-center rounded-xl bg-emerald-50 p-2 ring-1 ring-emerald-200">
                  <CTIcon id="drape" size={56} />
                  <span className="text-[11px] font-bold text-emerald-800">按住拖曳到模型</span>
                </div>
              </Draggable>
            ) : (
              <p className="mt-1 text-[12px] text-slate-500">{state.drape.placed ? '洞巾已鋪上。' : '導尿包尚未打開。'}</p>
            )}
          </div>
          {state.drape.placed && (
            <button type="button" onClick={() => dispatch({ type: 'liftDrape' })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-bold text-slate-600">
              ↕️ 拿起洞巾重新調整
            </button>
          )}
          {mode.showHints && <p className="rounded-2xl bg-blue-50 p-3 text-[12px] leading-relaxed text-blue-900">本教案第 7 項：先消毒，後鋪洞巾。洞巾一次對準放下，接觸皮膚後不要再從外往內調整。</p>}
        </div>
      </div>
    </div>
  );
}
