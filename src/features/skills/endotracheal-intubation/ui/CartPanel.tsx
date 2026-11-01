import { useState } from 'react';
import { Draggable } from '../../../training/components/DragDrop';
import { Modal } from '../../../training/components/Dialogs';
import { EQUIPMENT, EQUIPMENT_MAP, type ItemId } from '../caseData';
import type { AWAction, AWState } from '../engine';
import { AWIcon } from './Icons';

/** AirwayEquipmentTray：右側器材工作車（拖曳到器材盤；輕點查看名稱與用途） */
export function CartPanel({ state, dispatch, showHints, compact }: { state: AWState; dispatch: (a: AWAction) => void; showHints: boolean; compact?: boolean }) {
  const [info, setInfo] = useState<ItemId | null>(null);
  const onCart = EQUIPMENT.filter((e) => state.items[e.id] === 'cart');
  const onTray = EQUIPMENT.filter((e) => state.items[e.id] === 'tray');
  return (
    <div className="rounded-2xl bg-white/85 p-3 ring-1 ring-slate-200">
      <p className="text-[11px] font-bold tracking-wider text-slate-400">🛒 器材工作車</p>
      <p className="text-[10px] text-slate-400">按住拖曳到器材盤；輕點看名稱與用途</p>
      <div className={`mt-2 grid gap-1.5 ${compact ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-3'}`}>
        {onCart.map((e) => (
          <Draggable key={e.id} payload={{ kind: 'aw-item', id: e.id }} preview={<div className="rounded-2xl bg-white/95 p-1 shadow-xl ring-2 ring-indigo-400"><AWIcon id={e.id} size={52} /></div>} onTap={() => setInfo(e.id)}>
            <div className="flex flex-col items-center rounded-xl bg-white p-1 text-center shadow-sm ring-1 ring-slate-200">
              <AWIcon id={e.id} size={32} />
              <span className="mt-0.5 text-[9.5px] font-bold leading-tight text-slate-700">{e.name}</span>
            </div>
          </Draggable>
        ))}
      </div>
      {onTray.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {onTray.map((e) => (
            <button key={e.id} type="button" onClick={() => setInfo(e.id)} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              {e.name}・器材盤
            </button>
          ))}
        </div>
      )}
      {info && (
        <Modal onClose={() => setInfo(null)}>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <AWIcon id={info} size={56} />
              <div>
                <h3 className="text-lg font-black text-slate-800">{EQUIPMENT_MAP[info].name}</h3>
                <p className="text-xs text-slate-400">{EQUIPMENT_MAP[info].english}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{EQUIPMENT_MAP[info].purpose}</p>
            <p className="mt-2 rounded-xl bg-slate-50 p-2 text-[12px] text-slate-500">教案道具耗材：{EQUIPMENT_MAP[info].source}</p>
            {showHints && EQUIPMENT_MAP[info].tip && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">💡 {EQUIPMENT_MAP[info].tip}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'placeItem', item: info, zone: state.items[info] === 'tray' ? 'cart' : 'tray' });
                  setInfo(null);
                }}
                className="rounded-xl bg-indigo-600 py-2 text-sm font-bold text-white"
              >
                {state.items[info] === 'tray' ? '放回工作車' : '放到器材盤'}
              </button>
              <button type="button" onClick={() => setInfo(null)} className="rounded-xl bg-slate-800 py-2 text-sm font-bold text-white">
                關閉
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
