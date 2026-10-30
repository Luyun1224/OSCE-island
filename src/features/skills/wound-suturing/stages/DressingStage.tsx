import { useRef } from 'react';
import { Draggable, useDropZone } from '../../../training/components/DragDrop';
import { MODEL } from '../caseData';
import { tapeHorizontal } from '../dressing';
import { EquipmentIcon } from '../ui/EquipmentIcon';
import { HandTopView, clientToModel } from '../ui/HandTopView';
import { GloveBadge, Stitches2D, type StageProps } from '../ui/shared';
import { DrapeShape } from './DrapeStage';

const MATERIALS = [
  { id: 'gauze', name: '滅菌 4×4 紗布' },
  { id: 'tape', name: '3M 紙膠' },
  { id: 'swabs', name: '滅菌大棉棒' },
] as const;

export function DressingStage({ state, dispatch }: StageProps) {
  const svg = useRef<SVGSVGElement>(null);
  const drapeOn = !!state.drape.center && !state.drape.removed;
  const g = state.dressing.gauze;
  const half = MODEL.gauzeSize / 2;

  const { over } = useDropZone('dressing-hand', (p, x, y) => {
    if (!svg.current) return;
    const at = clientToModel(svg.current, x, y);
    if (p.id === 'gauze') dispatch({ type: 'placeGauze', center: at });
    else if (p.id === 'tape') dispatch({ type: 'placeTape', center: at });
    else if (p.id === 'swabs') dispatch({ type: 'wrongDressing', material: 'swabs' });
  });

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] text-slate-500">縫線完成 {state.stitches.length} 針</p>
        <GloveBadge state={state} />
      </div>
      <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_14rem]">
        <div data-drop="dressing-hand" className={`relative overflow-hidden rounded-3xl bg-slate-100 shadow-inner ${over ? 'ring-4 ring-emerald-400' : ''}`}>
          <HandTopView ref={svg} className="h-full max-h-[62vh] w-full">
            <Stitches2D stitches={state.stitches} />
            {drapeOn && <DrapeShape center={state.drape.center!} />}
            {g && (
              <g>
                <rect x={g.x - half} y={g.y - half} width={MODEL.gauzeSize} height={MODEL.gauzeSize} fill="#ffffff" stroke="#cbd5e1" strokeWidth={0.08} opacity={0.96} />
                {[-3, -1, 1, 3].map((v) => (
                  <g key={v} stroke="#eef2f7" strokeWidth={0.05}>
                    <line x1={g.x + v} y1={g.y - half} x2={g.x + v} y2={g.y + half} />
                    <line x1={g.x - half} y1={g.y + v} x2={g.x + half} y2={g.y + v} />
                  </g>
                ))}
              </g>
            )}
            {state.dressing.tapes.map((t, i) => {
              const horiz = tapeHorizontal(g, t);
              return <rect key={i} x={t.x - (horiz ? 2.6 : 0.7)} y={t.y - (horiz ? 0.7 : 2.6)} width={horiz ? 5.2 : 1.4} height={horiz ? 1.4 : 5.2} rx={0.15} fill="#f8fafc" stroke="#94a3b8" strokeWidth={0.06} opacity={0.92} />;
            })}
          </HandTopView>
        </div>
        <div className="space-y-2">
          {drapeOn && (
            <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
              <p className="text-[12px] text-amber-900">洞巾還鋪在手上。</p>
              <button type="button" onClick={() => dispatch({ type: 'removeDrape' })} className="mt-2 w-full rounded-xl bg-amber-600 px-3 py-2 text-sm font-bold text-white">
                移除洞巾
              </button>
            </div>
          )}
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">覆蓋材料（拖曳到傷口上）</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 lg:grid-cols-1">
              {MATERIALS.map((m) => (
                <Draggable key={m.id} payload={{ kind: 'dressing', id: m.id }} preview={<div className="rounded-xl bg-white p-1 shadow-xl"><EquipmentIcon id={m.id} size={56} /></div>}>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
                    <EquipmentIcon id={m.id} size={34} />
                    <span className="text-[12px] font-bold text-slate-700">{m.name}</span>
                  </div>
                </Draggable>
              ))}
            </div>
            <button type="button" onClick={() => dispatch({ type: 'resetDressing' })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50">
              重新覆蓋
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
