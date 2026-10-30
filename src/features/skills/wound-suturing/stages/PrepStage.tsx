import { useState } from 'react';
import { Draggable, useDropState, useDropZone, type DragPayload } from '../../../training/components/DragDrop';
import { Modal } from '../../../training/components/Dialogs';
import { EQUIPMENT, EQUIPMENT_MAP, INSTRUMENTS, type ItemId, type Zone } from '../caseData';
import { FLAP_LABEL, fieldOpen, type Flap, type PlaceMethod } from '../engine';
import { EquipmentIcon } from '../ui/EquipmentIcon';
import { RoomHotspots, StatusPill, type StageProps } from '../ui/shared';

const ITEM_PREVIEW = (id: string) => (
  <div className="rounded-2xl bg-white/95 p-1 shadow-xl ring-2 ring-blue-400">
    <EquipmentIcon id={id} size={52} />
  </div>
);

/** 無菌包布：四個角依序打開（俯視，下方為考生） */
function SterileWrap({ opened, onFlap, contaminated }: { opened: Flap[]; onFlap: (f: Flap) => void; contaminated: boolean }) {
  const isOpen = (f: Flap) => opened.includes(f);
  // 每個角在 100×100 的座標中，閉合時蓋向中心，打開後翻到外側
  const flaps: { f: Flap; closed: string; open: string; label: [number, number] }[] = [
    { f: 'far', closed: '20,20 80,20 50,52', open: '20,20 80,20 50,-6', label: [50, 30] },
    { f: 'left', closed: '20,20 20,80 52,50', open: '20,20 20,80 -6,50', label: [30, 50] },
    { f: 'right', closed: '80,20 80,80 48,50', open: '80,20 80,80 106,50', label: [70, 50] },
    { f: 'near', closed: '20,80 80,80 50,48', open: '20,80 80,80 50,106', label: [50, 70] },
  ];
  const order: Flap[] = ['near', 'left', 'right', 'far'];
  return (
    <svg viewBox="-10 -10 120 120" className="h-full w-full overflow-visible">
      <rect x="20" y="20" width="60" height="60" fill={contaminated ? '#fde68a' : '#cdeee0'} stroke="#2f7a64" strokeWidth="0.8" />
      {opened.length === 4 && (
        <g>
          {INSTRUMENTS.map((ins, i) => (
            <g key={ins.id} transform={`translate(${27 + (i % 2) * 24} ${26 + Math.floor(i / 2) * 24}) scale(0.4)`}>
              <EquipmentIconG id={ins.id} />
            </g>
          ))}
        </g>
      )}
      {flaps.filter((x) => isOpen(x.f)).map((x) => (
        <polygon key={x.f} points={x.open} fill="#a7d7c5" stroke="#2f7a64" strokeWidth="0.6" />
      ))}
      {order
        .filter((f) => !isOpen(f))
        .map((f) => {
          const x = flaps.find((v) => v.f === f)!;
          return (
            <g key={f} onClick={() => onFlap(f)} className="cursor-pointer">
              <polygon points={x.closed} fill="#8fcab4" stroke="#2f7a64" strokeWidth="0.6" className="transition hover:fill-[#b5e2d1]" />
              <text x={x.label[0]} y={x.label[1]} textAnchor="middle" dominantBaseline="middle" fontSize="4.5" fontWeight="700" fill="#1f5c4a" pointerEvents="none">
                {FLAP_LABEL[f]}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

/** SVG 內嵌器械圖示 */
function EquipmentIconG({ id }: { id: string }) {
  return (
    <foreignObject width="48" height="48">
      <EquipmentIcon id={id} size={48} />
    </foreignObject>
  );
}

function DropArea({ id, title, sub, children, className }: { id: string; title: string; sub?: string; children: React.ReactNode; className?: string }) {
  const { active, over } = useDropState(id);
  return (
    <div
      data-drop={id}
      className={`relative rounded-2xl border-2 border-dashed p-2 transition ${over ? 'border-blue-500 bg-blue-50/80' : active ? 'border-blue-300 bg-white/60' : 'border-transparent'} ${className ?? ''}`}
    >
      <p className="text-[11px] font-bold text-slate-500">
        {title} {sub && <span className="font-normal text-slate-400">{sub}</span>}
      </p>
      {children}
    </div>
  );
}

const METHODS: { id: PlaceMethod; text: string }[] = [
  { id: 'hand-transfer', text: '撕開包裝，用手取出內容物放進無菌區' },
  { id: 'peel-drop', text: '撕開外包裝，讓內容物直接落入無菌區（手不越過無菌區）' },
  { id: 'with-wrapper', text: '整包（含外包裝）放進無菌區' },
];

export function PrepStage({ state, dispatch, mode }: StageProps) {
  const [pending, setPending] = useState<ItemId | null>(null);
  const [info, setInfo] = useState<ItemId | null>(null);
  const open = fieldOpen(state);
  const wrapOnTable = state.items.sterileWrap !== 'supply';

  const drop = (zone: Zone | 'wear') => (p: DragPayload) => {
    if (p.kind !== 'item') return;
    const item = p.id as ItemId;
    if (item === 'mask') {
      if (zone === 'wear') dispatch({ type: 'wearMask' });
      else dispatch({ type: 'placeItem', item, zone: zone as Zone });
      return;
    }
    if (zone === 'wear') return;
    if (item === 'sterileWrap') {
      dispatch({ type: 'placeItem', item, zone: 'field' });
      return;
    }
    if (zone === 'field' && open && EQUIPMENT_MAP[item].sterile && state.items[item] !== 'field') {
      setPending(item);
      return;
    }
    dispatch({ type: 'placeItem', item, zone });
  };

  useDropZone('prep-field', drop('field'));
  useDropZone('prep-clean', drop('clean'));
  useDropZone('prep-supply', drop('supply'));
  useDropZone('prep-wear', drop('wear'));

  const itemsIn = (zone: Zone) => EQUIPMENT.filter((e) => state.items[e.id] === zone && e.id !== 'sterileWrap' && !(e.id === 'mask' && state.maskOn));

  const tile = (id: ItemId, fixed?: boolean) => (
    <Draggable key={id} payload={{ kind: 'item', id }} preview={ITEM_PREVIEW(id)} onTap={() => setInfo(id)} disabled={fixed}>
      <div className="flex w-[4.6rem] flex-col items-center rounded-xl bg-white/90 p-1 text-center shadow-sm ring-1 ring-slate-200">
        <EquipmentIcon id={id} size={38} />
        <span className="mt-0.5 text-[10px] font-bold leading-tight text-slate-700">{EQUIPMENT_MAP[id].name}</span>
      </div>
    </Draggable>
  );

  const required = EQUIPMENT.filter((e) => e.required && e.target !== 'open');

  return (
    <div className="flex h-full flex-col gap-3">
      <RoomHotspots ids={['lamp']} dispatch={dispatch} gloved={state.gloves.status === 'sterile'} />
      <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_15rem]">
        {/* 操作台面 */}
        <div className="relative flex flex-col rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200 p-3 shadow-inner">
          <p className="text-center text-[11px] font-bold tracking-widest text-slate-400">操作台面</p>
          <div className="grid flex-1 grid-cols-[1fr_9rem] gap-3">
            <DropArea id="prep-field" title={open ? '無菌區' : '無菌包布'} sub={open ? '（包布內面）' : wrapOnTable ? '依序點擊四個角打開' : '把包布拖到這裡'} className="flex flex-col">
              <div className="relative mx-auto aspect-square w-full max-w-[17rem] flex-1">
                {wrapOnTable ? (
                  <SterileWrap opened={state.flapsOpened} onFlap={(f) => dispatch({ type: 'openFlap', flap: f })} contaminated={state.fieldContaminated && mode.immediateFeedback} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-xs text-slate-400">空的操作區</div>
                )}
                {open && (
                  <div className="absolute inset-x-[18%] bottom-[18%] flex flex-wrap justify-center gap-1">
                    {itemsIn('field').map((e) => (
                      <div key={e.id} className="rounded-lg bg-white/80 p-0.5" title={e.name}>
                        <EquipmentIcon id={e.id} size={28} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {open && state.items.swabs === 'field' && state.items.antiseptic !== 'supply' && (
                <button
                  type="button"
                  disabled={state.disinfection.swabWet}
                  onClick={() => dispatch({ type: 'wetSwab' })}
                  className="mx-auto mt-1 rounded-full bg-amber-700 px-3 py-1 text-[11px] font-bold text-white shadow-sm disabled:bg-amber-100 disabled:text-amber-800"
                >
                  {state.disinfection.swabWet ? '🧴 棉棒已沾消毒溶液' : '🧴 將消毒溶液倒在無菌區內的棉棒上'}
                </button>
              )}
              {open && (
                <button type="button" onClick={() => dispatch({ type: 'arrangeField' })} className="mx-auto mt-1 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:bg-white">
                  ✋ 伸手整理無菌區內器械
                </button>
              )}
            </DropArea>
            <DropArea id="prep-clean" title="清潔檯面" sub="（無菌區外）" className="flex flex-col">
              <div className="flex flex-1 flex-wrap content-start gap-1.5 pt-1">{itemsIn('clean').map((e) => tile(e.id))}</div>
            </DropArea>
          </div>
          <DropArea id="prep-wear" title="你（考生）" sub={state.maskOn ? '— 已戴口罩 😷' : '— 可把口罩拖到這裡戴上'} className="mt-2 text-center" >
            <span />
          </DropArea>
        </div>

        {/* 備物檯（器材盤） */}
        <DropArea id="prep-supply" title="備物檯" sub="拖曳器材；輕點可查看名稱與用途" className="bg-white/60">
          <div className="grid grid-cols-3 gap-1.5 pt-1 lg:grid-cols-3">
            {wrapOnTable ? null : tile('sterileWrap')}
            {itemsIn('supply').map((e) => tile(e.id))}
          </div>
        </DropArea>
      </div>

      {mode.showHints && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/80 p-2">
          <span className="text-[11px] font-bold text-slate-500">準備清單</span>
          <StatusPill ok={open}>無菌區</StatusPill>
          {required.map((e) => (
            <StatusPill key={e.id} ok={state.items[e.id] === e.target ? true : state.items[e.id] === 'supply' ? null : false}>
              {e.name}
            </StatusPill>
          ))}
        </div>
      )}

      {pending && (
        <Modal onClose={() => setPending(null)}>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <EquipmentIcon id={pending} size={48} />
              <div>
                <p className="text-xs text-slate-500">置入無菌區</p>
                <h3 className="text-lg font-black text-slate-800">{EQUIPMENT_MAP[pending].name}</h3>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">你要怎麼把它放進無菌區？</p>
            <div className="mt-3 space-y-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'placeItem', item: pending, zone: 'field', method: m.id });
                    setPending(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                >
                  {m.text}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {info && (
        <Modal onClose={() => setInfo(null)}>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <EquipmentIcon id={info} size={56} />
              <div>
                <h3 className="text-lg font-black text-slate-800">{EQUIPMENT_MAP[info].name}</h3>
                <p className="text-xs text-slate-400">{EQUIPMENT_MAP[info].english}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{EQUIPMENT_MAP[info].purpose}</p>
            {mode.showHints && EQUIPMENT_MAP[info].tip && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">💡 {EQUIPMENT_MAP[info].tip}</p>}
            {mode.showHints && (
              <p className="mt-2 text-[12px] text-slate-500">{EQUIPMENT_MAP[info].sterile ? '🟢 滅菌物品' : '⚪ 非無菌物品'}</p>
            )}
            <button type="button" onClick={() => setInfo(null)} className="mt-4 w-full rounded-xl bg-slate-800 py-2 text-sm font-bold text-white">
              關閉
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
