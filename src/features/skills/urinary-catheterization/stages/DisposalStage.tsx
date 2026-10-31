import { Draggable, useDropZone, type DragPayload } from '../../../training/components/DragDrop';
import { BINS, WASTE, WRAP_UP, type BinId, type WasteId } from '../caseData';
import { availableWaste } from '../engine';
import { CTIcon } from '../ui/Icons';
import type { StageProps } from '../ui/shared';

function Bin({ id, items, reveal, onDrop }: { id: BinId; items: WasteId[]; reveal: boolean; onDrop: (p: DragPayload) => void }) {
  const { over, active } = useDropZone(`ct-bin-${id}`, onDrop);
  return (
    <div data-drop={`ct-bin-${id}`} className={`flex flex-col items-center rounded-3xl border-2 p-3 text-center transition ${over ? 'scale-[1.03] border-blue-500 bg-blue-50' : active ? 'border-dashed border-slate-300 bg-white/80' : 'border-transparent bg-white/80'}`}>
      <CTIcon id={id} size={72} />
      <p className="mt-1 text-sm font-black text-slate-800">{BINS[id].name}</p>
      <p className="text-[11px] text-slate-500">{BINS[id].note}</p>
      <div className="mt-2 flex min-h-[2rem] flex-wrap justify-center gap-1">
        {items.map((w) => (
          <span key={w} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${reveal ? (WASTE[w].correct === id ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700') : 'bg-slate-100 text-slate-600'}`}>
            {WASTE[w].name}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 第九階段：廢棄物分類與操作結束 */
export function DisposalStage({ state, dispatch, mode }: StageProps) {
  const avail = availableWaste(state);
  const pending = avail.filter((w) => !state.disposal[w]);
  const drop = (bin: BinId) => (p: DragPayload) => p.kind === 'ct-waste' && dispatch({ type: 'dispose', waste: p.id as WasteId, bin });
  const inBin = (bin: BinId) => avail.filter((w) => state.disposal[w] === bin);
  const gloved = state.gloves.status !== 'none';

  return (
    <div className="space-y-3">
      {gloved && (
        <div className="flex items-center gap-2 rounded-2xl bg-yellow-50 p-3 ring-1 ring-yellow-200">
          <span className="text-[13px] text-yellow-900">目前還戴著手套。</span>
          <button type="button" onClick={() => dispatch({ type: 'removeGloves' })} className="ml-auto rounded-xl bg-yellow-600 px-3 py-1.5 text-[12px] font-bold text-white">
            🧤 脫除手套
          </button>
        </div>
      )}
      <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
        <p className="text-[11px] font-bold text-slate-500">操作後的物品（拖曳到垃圾桶）</p>
        {avail.length === 0 && <p className="mt-2 text-[12px] text-slate-400">尚未使用任何器材，目前沒有需要丟棄的物品。</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {pending.map((w) => (
            <Draggable key={w} payload={{ kind: 'ct-waste', id: w }} preview={<div className="rounded-xl bg-white p-1 shadow-xl"><CTIcon id={WASTE[w].icon} size={52} /></div>}>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2 py-1.5 ring-1 ring-slate-200">
                <CTIcon id={WASTE[w].icon} size={30} />
                <span className="text-[12px] font-bold text-slate-700">{WASTE[w].name}</span>
              </div>
            </Draggable>
          ))}
          {avail.length > 0 && pending.length === 0 && <p className="text-[12px] font-bold text-emerald-700">所有物品都已處理</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(['infectious', 'general'] as BinId[]).map((b) => (
          <Bin key={b} id={b} items={inBin(b)} reveal={mode.immediateFeedback} onDrop={drop(b)} />
        ))}
      </div>
      <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
        <p className="text-[11px] font-bold text-slate-500">結束前的整理（病人舒適與安全）</p>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
          {WRAP_UP.map((w) => (
            <button key={w.id} type="button" disabled={state.wrapUp.includes(w.id)} onClick={() => dispatch({ type: 'wrapUp', id: w.id })} className="rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-slate-700 ring-1 ring-slate-200 disabled:bg-emerald-50 disabled:text-emerald-700">
              {state.wrapUp.includes(w.id) ? '✓ ' : ''}
              {w.text}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">最後別忘了：脫除手套後完成「操作後手部衛生」。廢棄物分類細節依院內規範。</p>
      </div>
    </div>
  );
}
