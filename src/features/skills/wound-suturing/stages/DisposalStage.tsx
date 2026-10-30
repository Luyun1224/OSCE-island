import { Draggable, useDropZone, type DragPayload } from '../../../training/components/DragDrop';
import { BINS, WASTE, type BinId, type WasteId } from '../caseData';
import { availableWaste } from '../engine';
import { EquipmentIcon } from '../ui/EquipmentIcon';
import type { StageProps } from '../ui/shared';

const WASTE_ICON: Record<WasteId, string> = {
  needle: 'needleSuture',
  usedSwabs: 'swabs',
  drapeUsed: 'drape',
  glovesUsed: 'sterileGloves',
  sutureWrapper: 'needleSuture',
  gauzeWrapper: 'gauze',
};

function Bin({ id, items, reveal, onDrop }: { id: BinId; items: WasteId[]; reveal: boolean; onDrop: (p: DragPayload) => void }) {
  const { over, active } = useDropZone(`bin-${id}`, (p) => onDrop(p));
  const b = BINS[id];
  return (
    <div
      data-drop={`bin-${id}`}
      className={`flex flex-col items-center rounded-3xl border-2 p-3 text-center transition ${over ? 'scale-[1.03] border-blue-500 bg-blue-50' : active ? 'border-dashed border-slate-300 bg-white/80' : 'border-transparent bg-white/80'}`}
    >
      <EquipmentIcon id={id} size={72} />
      <p className="mt-1 text-sm font-black text-slate-800">{b.name}</p>
      <p className="text-[11px] text-slate-500">{b.note}</p>
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

export function DisposalStage({ state, dispatch, mode }: StageProps) {
  const avail = availableWaste(state);
  const pending = avail.filter((w) => !state.disposal[w]);
  const drop = (bin: BinId) => (p: DragPayload) => p.kind === 'waste' && dispatch({ type: 'dispose', waste: p.id as WasteId, bin });
  const inBin = (bin: BinId) => avail.filter((w) => state.disposal[w] === bin);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
        <p className="text-[11px] font-bold text-slate-500">操作後的物品（拖曳到容器）</p>
        {avail.length === 0 && <p className="mt-2 text-[12px] text-slate-400">尚未使用任何器材，目前沒有需要丟棄的物品。</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {pending.map((w) => (
            <Draggable key={w} payload={{ kind: 'waste', id: w }} preview={<div className="rounded-xl bg-white p-1 shadow-xl"><EquipmentIcon id={WASTE_ICON[w]} size={52} /></div>}>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2 py-1.5 ring-1 ring-slate-200">
                <EquipmentIcon id={WASTE_ICON[w]} size={30} />
                <span className="text-[12px] font-bold text-slate-700">{WASTE[w].name}</span>
              </div>
            </Draggable>
          ))}
          {avail.length > 0 && pending.length === 0 && <p className="text-[12px] font-bold text-emerald-700">所有物品都已處理</p>}
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2 md:gap-3">
        {(['sharps', 'infectious', 'general'] as BinId[]).map((b) => (
          <Bin key={b} id={b} items={inBin(b)} reveal={mode.immediateFeedback} onDrop={drop(b)} />
        ))}
      </div>
      <p className="px-1 text-[11px] text-slate-400">持針器、鑷子、剪刀等器械依院內規範送回清洗消毒，本模擬不納入廢棄物分類。</p>
    </div>
  );
}
