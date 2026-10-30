import { useRef, useState } from 'react';
import { Draggable, useDropZone } from '../../../training/components/DragDrop';
import { MODEL } from '../caseData';
import { fieldOpen } from '../engine';
import type { Pt } from '../geometry';
import { EquipmentIcon } from '../ui/EquipmentIcon';
import { HandTopView, clientToModel } from '../ui/HandTopView';
import { GloveBadge, RoomHotspots, type StageProps } from '../ui/shared';
import { IodineTrail } from './DisinfectStage';

/** 洞巾（俯視）：方形無菌巾中央有圓形開口 */
export function DrapeShape({ center, ghost }: { center: Pt; ghost?: boolean }) {
  const w = 15;
  const h = 13;
  const r = MODEL.drapeHoleRadius;
  const { x, y } = center;
  const d = `M${x - w / 2} ${y - h / 2} h${w} v${h} h${-w} Z M${x + r} ${y} A${r} ${r} 0 1 0 ${x - r} ${y} A${r} ${r} 0 1 0 ${x + r} ${y} Z`;
  return (
    <g opacity={ghost ? 0.55 : 0.95}>
      <path d={d} fill="url(#steril)" fillRule="evenodd" stroke="#2f7a64" strokeWidth={0.1} />
      <circle cx={x} cy={y} r={r} fill="none" stroke="#2f7a64" strokeWidth={0.12} />
    </g>
  );
}

export function DrapeStage({ state, dispatch, mode }: StageProps) {
  const svg = useRef<SVGSVGElement>(null);
  const [dragPos, setDragPos] = useState<Pt | null>(null);
  const grab = useRef<Pt | null>(null);
  const placed = state.drape.center && !state.drape.removed ? state.drape.center : null;

  const { over } = useDropZone('drape-hand', (p, x, y) => {
    if (p.id !== 'drape' || !svg.current) return;
    dispatch({ type: 'placeDrape', center: clientToModel(svg.current, x, y) });
  });

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!placed) return;
    const p = clientToModel(svg.current!, e.clientX, e.clientY);
    // 只有點在洞巾布面上才能拖動
    const inCloth = Math.abs(p.x - placed.x) < 7.5 && Math.abs(p.y - placed.y) < 6.5 && Math.hypot(p.x - placed.x, p.y - placed.y) > MODEL.drapeHoleRadius;
    if (!inCloth) return;
    grab.current = { x: p.x - placed.x, y: p.y - placed.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragPos(placed);
  };
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!grab.current) return;
    const p = clientToModel(svg.current!, e.clientX, e.clientY);
    setDragPos({ x: p.x - grab.current.x, y: p.y - grab.current.y });
  };
  const up = () => {
    if (!grab.current || !dragPos) return;
    grab.current = null;
    if (placed && Math.hypot(dragPos.x - placed.x, dragPos.y - placed.y) > 0.1) dispatch({ type: 'placeDrape', center: dragPos });
    setDragPos(null);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RoomHotspots ids={['sleeve', 'lamp']} dispatch={dispatch} gloved={state.gloves.status === 'sterile'} />
        <GloveBadge state={state} />
      </div>
      <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_14rem]">
        <div data-drop="drape-hand" className={`relative overflow-hidden rounded-3xl bg-slate-100 shadow-inner ${over ? 'ring-4 ring-emerald-400' : ''}`}>
          <HandTopView ref={svg} className="h-full max-h-[62vh] w-full" onPointerDown={down} onPointerMove={move} onPointerUp={up}>
            <IodineTrail strokes={state.disinfection.strokes} />
            {(dragPos ?? placed) && <DrapeShape center={(dragPos ?? placed)!} ghost={!!dragPos} />}
          </HandTopView>
          {placed && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-slate-900/70 px-3 py-1 text-[12px] text-white">
              洞巾已鋪上（可拖動布面調整位置）
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">無菌區內</p>
            {fieldOpen(state) ? (
              placed ? (
                <p className="mt-2 text-[12px] text-slate-500">洞巾已使用</p>
              ) : (
                <Draggable payload={{ kind: 'drape', id: 'drape' }} preview={<div className="rounded-xl bg-white p-1 shadow-xl"><EquipmentIcon id="drape" size={64} /></div>}>
                  <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 p-2 ring-1 ring-emerald-200">
                    <EquipmentIcon id="drape" size={44} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">洞巾</p>
                      <p className="text-[11px] text-slate-500">拖曳到手上鋪單</p>
                    </div>
                  </div>
                </Draggable>
              )
            ) : (
              <p className="mt-2 text-[12px] text-slate-500">洞巾在無菌包布內，包布尚未打開。</p>
            )}
          </div>
          {mode.showHints && placed && (
            <div className="rounded-2xl bg-white/90 p-3 text-[12px] text-slate-600 ring-1 ring-slate-200">
              開口偏離傷口中心 {Math.hypot(placed.x, placed.y).toFixed(1)} cm
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
