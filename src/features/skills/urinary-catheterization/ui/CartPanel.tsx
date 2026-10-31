import { useState } from 'react';
import { Draggable } from '../../../training/components/DragDrop';
import { Modal } from '../../../training/components/Dialogs';
import { EQUIPMENT, EQUIPMENT_MAP, FIXTURES, type ItemId } from '../caseData';
import type { CTState } from '../engine';
import { CTIcon } from './Icons';

const LOC_LABEL = { cart: '工作車', table: '工作台', field: '無菌區', worn: '穿戴中' } as const;

/** InstrumentTray：右側器材工作車（拖曳到工作台／無菌區；輕點查看名稱與用途） */
export function CartPanel({ state, showHints, compact }: { state: CTState; showHints: boolean; compact?: boolean }) {
  const [info, setInfo] = useState<ItemId | null>(null);
  const onCart = EQUIPMENT.filter((e) => state.items[e.id] === 'cart');
  const elsewhere = EQUIPMENT.filter((e) => state.items[e.id] !== 'cart');
  return (
    <div className="rounded-2xl bg-white/85 p-3 ring-1 ring-slate-200">
      <p className="text-[11px] font-bold tracking-wider text-slate-400">🛒 器材工作車</p>
      <p className="text-[10px] text-slate-400">按住拖曳到工作台或無菌區；輕點看用途</p>
      <div className={`mt-2 grid gap-1.5 ${compact ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-3'}`}>
        {onCart.map((e) => (
          <Draggable key={e.id} payload={{ kind: 'ct-item', id: e.id }} preview={<div className="rounded-2xl bg-white/95 p-1 shadow-xl ring-2 ring-blue-400"><CTIcon id={e.id} size={52} /></div>} onTap={() => setInfo(e.id)}>
            <div className="flex flex-col items-center rounded-xl bg-white p-1 text-center shadow-sm ring-1 ring-slate-200">
              <CTIcon id={e.id} size={34} />
              <span className="mt-0.5 text-[9.5px] font-bold leading-tight text-slate-700">{e.name}</span>
            </div>
          </Draggable>
        ))}
        {!onCart.length && <p className="col-span-full text-[11px] text-slate-400">工作車上的物品都已取用</p>}
      </div>
      {elsewhere.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {elsewhere.map((e) => (
            <button key={e.id} type="button" onClick={() => setInfo(e.id)} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {e.name}・{LOC_LABEL[state.items[e.id]]}
            </button>
          ))}
        </div>
      )}
      {!compact && (
        <details className="mt-2 text-[10px] text-slate-500">
          <summary className="cursor-pointer font-bold">診間固定設備</summary>
          <ul className="mt-1 space-y-0.5">
            {FIXTURES.map((f) => (
              <li key={f.id}>• {f.name}</li>
            ))}
          </ul>
        </details>
      )}
      {info && (
        <Modal onClose={() => setInfo(null)}>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <CTIcon id={info} size={56} />
              <div>
                <h3 className="text-lg font-black text-slate-800">{EQUIPMENT_MAP[info].name}</h3>
                <p className="text-xs text-slate-400">{EQUIPMENT_MAP[info].english}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{EQUIPMENT_MAP[info].purpose}</p>
            <p className="mt-2 rounded-xl bg-slate-50 p-2 text-[12px] text-slate-500">教案耗材表：{EQUIPMENT_MAP[info].source}</p>
            {showHints && EQUIPMENT_MAP[info].tip && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">💡 {EQUIPMENT_MAP[info].tip}</p>}
            {showHints && <p className="mt-2 text-[12px] text-slate-500">{EQUIPMENT_MAP[info].sterile ? '🟢 滅菌物品' : '⚪ 非無菌物品'}</p>}
            <button type="button" onClick={() => setInfo(null)} className="mt-4 w-full rounded-xl bg-slate-800 py-2 text-sm font-bold text-white">
              關閉
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
