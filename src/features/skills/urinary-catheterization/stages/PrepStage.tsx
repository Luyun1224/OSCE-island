import { useState } from 'react';
import { useDropZone, type DragPayload } from '../../../training/components/DragDrop';
import { Modal } from '../../../training/components/Dialogs';
import { EQUIPMENT, EQUIPMENT_MAP, type ItemId } from '../caseData';
import { FLAP_LABEL, kitOpen, type Flap } from '../engine';
import { CATHETER_RUBRIC_CONFIG as CFG } from '../rubricConfig';
import { CTIcon } from '../ui/Icons';
import { DropArea, Pill, type StageProps } from '../ui/shared';

/** 導尿包外層：四個角依序打開（俯視，下方為考生） */
function KitWrap({ opened, onFlap, children }: { opened: Flap[]; onFlap: (f: Flap) => void; children?: React.ReactNode }) {
  const isOpen = (f: Flap) => opened.includes(f);
  const flaps: { f: Flap; closed: string; open: string; label: [number, number] }[] = [
    { f: 'far', closed: '20,20 80,20 50,52', open: '20,20 80,20 50,-6', label: [50, 30] },
    { f: 'left', closed: '20,20 20,80 52,50', open: '20,20 20,80 -6,50', label: [30, 50] },
    { f: 'right', closed: '80,20 80,80 48,50', open: '80,20 80,80 106,50', label: [70, 50] },
    { f: 'near', closed: '20,80 80,80 50,48', open: '20,80 80,80 50,106', label: [50, 70] },
  ];
  const draw: Flap[] = ['near', 'left', 'right', 'far'];
  return (
    <svg viewBox="-10 -10 120 120" className="h-full w-full overflow-visible">
      <rect x="20" y="20" width="60" height="60" fill="#d1fae5" stroke="#047857" strokeWidth="0.8" />
      {opened.length === 4 && children}
      {flaps.filter((x) => isOpen(x.f)).map((x) => (
        <polygon key={x.f} points={x.open} fill="#a7f3d0" stroke="#047857" strokeWidth="0.6" />
      ))}
      {draw
        .filter((f) => !isOpen(f))
        .map((f) => {
          const x = flaps.find((v) => v.f === f)!;
          return (
            <g key={f} onClick={() => onFlap(f)} className="cursor-pointer" role="button" aria-label={`打開${FLAP_LABEL[f]}`}>
              <polygon points={x.closed} fill="#6ee7b7" stroke="#047857" strokeWidth="0.6" className="transition hover:fill-[#a7f3d0]" />
              <text x={x.label[0]} y={x.label[1]} textAnchor="middle" dominantBaseline="middle" fontSize="4.5" fontWeight="700" fill="#065f46" pointerEvents="none">
                {FLAP_LABEL[f]}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

const METHODS = [
  { id: 'peel-drop', text: '撕開外包裝，讓內容物直接落入無菌區（手不越過無菌區）' },
  { id: 'hand-transfer', text: '撕開包裝，用手取出內容物放進無菌區' },
  { id: 'with-wrapper', text: '整包（含外包裝）放進無菌區' },
] as const;

const POUR = [
  { id: 'above', text: '瓶口／管口不碰觸無菌區，由上方倒入' },
  { id: 'inside', text: '把瓶子拿進導尿包內再倒，比較不會灑出來' },
  { id: 'touch', text: '管口靠在集尿碗邊緣擠出，比較好控制' },
] as const;

export function PrepStage({ state, dispatch, mode }: StageProps) {
  const [pending, setPending] = useState<ItemId | null>(null);
  const [pour, setPour] = useState<null | 'iodine' | 'jelly'>(null);
  const open = kitOpen(state);

  const toTable = (p: DragPayload) => {
    if (p.kind !== 'ct-item') return;
    dispatch({ type: 'placeItem', item: p.id as ItemId, zone: 'table' });
  };
  const toField = (p: DragPayload) => {
    if (p.kind !== 'ct-item') return;
    const item = p.id as ItemId;
    if (item === 'kit') return dispatch({ type: 'placeItem', item, zone: 'table' });
    if (open && EQUIPMENT_MAP[item].sterile && item !== 'gloves' && state.items[item] !== 'field') return setPending(item);
    dispatch({ type: 'placeItem', item, zone: 'field' });
  };
  const toMe = (p: DragPayload) => {
    if (p.kind !== 'ct-item') return;
    if (p.id === 'mask') dispatch({ type: 'wearMask' });
    else if (p.id === 'examGloves') dispatch({ type: 'wearExamGloves' });
    else if (p.id === 'gloves') {
      dispatch({ type: 'placeItem', item: 'gloves', zone: 'table' });
      dispatch({ type: 'setStep', step: 'gloves' });
    }
  };
  useDropZone('ct-table', toTable);
  useDropZone('ct-field', toField);
  useDropZone('ct-me', toMe);

  const onTable = EQUIPMENT.filter((e) => state.items[e.id] === 'table' && e.id !== 'kit');
  const inField = EQUIPMENT.filter((e) => state.items[e.id] === 'field');
  const req: [boolean, string][] = [
    [open, '打開導尿包'],
    [state.items.catheter === 'field', '導尿管入無菌區'],
    [state.kit.jelly, '擠入潤滑劑'],
    [state.kit.iodine, '棉枝沾消毒液'],
    [state.items.syringe === 'table', '空針（工作台）'],
    [state.items.bag === 'table', '尿袋（工作台）'],
    [state.items.tape === 'table', '紙膠（工作台）'],
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex flex-col rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200 p-3 shadow-inner">
        <p className="text-center text-[11px] font-bold tracking-widest text-slate-400">換藥車桌面（工作台）</p>
        <div className="grid gap-3 md:grid-cols-[1fr_11rem]">
          <DropArea id="ct-field" title={open ? '無菌區（導尿包內面）' : '導尿包'} sub={open ? '把無菌物品拖進來' : state.kit.onTable ? '依序點擊四個角打開' : '把導尿包從工作車拖到這裡'} className="flex flex-col">
            <div className="relative mx-auto aspect-square w-full max-w-[18rem]">
              {state.kit.onTable ? (
                <KitWrap opened={state.kit.flaps} onFlap={(f) => dispatch({ type: 'openFlap', flap: f })}>
                  {/* 導尿包內容：集尿碗、洞巾、棉枝×6、放入的物品 */}
                  <ellipse cx="36" cy="34" rx="11" ry="7" fill="#e2e8f0" stroke="#475569" strokeWidth="0.5" />
                  {state.kit.jelly && <ellipse cx="36" cy="34" rx="5" ry="3" fill="#bbf7d0" stroke="#16a34a" strokeWidth="0.4" />}
                  {!state.drape.placed && (
                    <g>
                      <rect x="54" y="26" width="20" height="16" rx="1" fill="#4ade80" stroke="#15803d" strokeWidth="0.5" />
                      <text x="64" y="36" textAnchor="middle" fontSize="3.5" fill="#14532d">洞巾</text>
                    </g>
                  )}
                  {Array.from({ length: state.kit.swabsLeft }, (_, i) => (
                    <g key={i} transform={`translate(${27 + i * 4} 46)`}>
                      <line x1="0" y1="0" x2="0" y2="12" stroke="#e2e8f0" strokeWidth="1" />
                      <ellipse cx="0" cy="0" rx="1.4" ry="2.2" fill={state.kit.iodine ? '#b45309' : '#f8fafc'} stroke="#94a3b8" strokeWidth="0.3" />
                    </g>
                  ))}
                  {state.items.catheter === 'field' && <path d="M26 72 C 40 62, 56 76, 74 66" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />}
                  {state.items.gauze === 'field' && <rect x="58" y="48" width="10" height="10" fill="#fff" stroke="#94a3b8" strokeWidth="0.4" />}
                  {inField
                    .filter((e) => !e.sterile)
                    .map((e, i) => (
                      <foreignObject key={e.id} x={22 + i * 12} y={58} width="12" height="12">
                        <CTIcon id={e.id} size={12} />
                      </foreignObject>
                    ))}
                </KitWrap>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-xs text-slate-400">空的工作台</div>
              )}
            </div>
            {open && (
              <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                <button type="button" disabled={state.kit.jelly} onClick={() => setPour('jelly')} className="rounded-full bg-emerald-700 px-3 py-1 text-[11px] font-bold text-white shadow-sm disabled:bg-emerald-100 disabled:text-emerald-800">
                  {state.kit.jelly ? '✓ 潤滑劑已擠入' : '🧴 擠潤滑劑到導尿包內'}
                </button>
                <button type="button" disabled={state.kit.iodine} onClick={() => setPour('iodine')} className="rounded-full bg-amber-700 px-3 py-1 text-[11px] font-bold text-white shadow-sm disabled:bg-amber-100 disabled:text-amber-800">
                  {state.kit.iodine ? (CFG.antisepticProvidedByAssistant ? '✓ 消毒液由護理人員提供' : '✓ 棉枝已沾優碘') : '🟤 倒優碘在沖洗棉枝上'}
                </button>
              </div>
            )}
          </DropArea>
          <div className="flex flex-col gap-2">
            <DropArea id="ct-table" title="清潔區" sub="（無菌區外）" className="flex-1 bg-white/40">
              <div className="flex flex-wrap gap-1 pt-1">
                {onTable.map((e) => (
                  <div key={e.id} className="flex w-[4.4rem] flex-col items-center rounded-xl bg-white/90 p-1 text-center shadow-sm" title={e.name}>
                    <CTIcon id={e.id} size={28} />
                    <span className="text-[9px] font-bold leading-tight text-slate-600">{e.name}</span>
                  </div>
                ))}
                {!onTable.length && <span className="text-[11px] text-slate-400">把需要的物品拖到這裡備用</span>}
              </div>
            </DropArea>
            <DropArea id="ct-me" title="你（考生）" sub={state.maskOn ? '— 已戴口罩 😷' : '— 口罩可拖到這裡戴上'} className="bg-white/40">
              <span />
            </DropArea>
          </div>
        </div>
      </div>

      {mode.showHints ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/80 p-2">
          <span className="text-[11px] font-bold text-slate-500">準備清單</span>
          {req.map(([ok, label]) => (
            <Pill key={label} ok={ok ? true : null}>
              {label}
            </Pill>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-500">系統不會替你補齊物品。物品是否齊全、是否污染會在結束後回饋。</p>
      )}

      {pending && (
        <Modal onClose={() => setPending(null)}>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <CTIcon id={pending} size={48} />
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                >
                  {m.text}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
      {pour && (
        <Modal onClose={() => setPour(null)}>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <CTIcon id={pour} size={48} />
              <h3 className="text-lg font-black text-slate-800">{pour === 'iodine' ? '倒優碘在沖洗棉枝上' : '擠潤滑劑到導尿包內'}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">要怎麼倒？</p>
            <div className="mt-3 space-y-2">
              {POUR.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'pour', what: pour, method: m.id });
                    setPour(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                >
                  {m.text}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
