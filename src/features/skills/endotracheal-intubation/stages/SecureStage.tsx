import { Draggable, useDropZone } from '../../../training/components/DragDrop';
import { AWIcon } from '../ui/Icons';
import { DropArea, Pill, type StageProps } from '../ui/shared';
import { TubePositionView } from '../ui/views';

/** 固定與結束 */
export function SecureStage({ state, dispatch, demo }: StageProps) {
  const a = state.attempt;
  const placed = a.location !== 'none';
  useDropZone('aw-mouth', (p) => {
    if (p.kind === 'aw-bite') dispatch({ type: 'placeBite' });
    if (p.kind === 'aw-ties') dispatch({ type: 'secureTube' });
  });
  return (
    <div className="space-y-3">
      {!placed && <p className="rounded-2xl bg-amber-50 p-3 text-[13px] text-amber-900">目前沒有氣管內管。</p>}
      <div className="grid gap-3 md:grid-cols-[1fr_15rem]">
        <DropArea id="aw-mouth" title="病人口部與氣管內管" sub="把咬口器、固定帶拖到這裡" className="bg-white/70">
          <div className="mx-auto aspect-[58/43] w-full max-w-lg">
            <TubePositionView attempt={a} reveal={a.confirmed} />
          </div>
          <div className="flex justify-center gap-2 pb-1">
            <Pill ok={state.secured.bite ? true : null}>咬口器</Pill>
            <Pill ok={state.secured.tied ? true : null}>固定帶</Pill>
          </div>
        </DropArea>
        <div className="space-y-2">
          {placed && !state.secured.bite && (
            <Draggable payload={{ kind: 'aw-bite', id: 'bite' }} preview={<AWIcon id="bite" size={56} />} disabled={demo}>
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-2 ring-1 ring-amber-200">
                <AWIcon id="bite" size={32} />
                <span className="text-[12px] font-bold text-amber-900">咬口器（bite）</span>
              </div>
            </Draggable>
          )}
          {placed && !state.secured.tied && (
            <Draggable payload={{ kind: 'aw-ties', id: 'ties' }} preview={<AWIcon id="ties" size={56} />} disabled={demo}>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
                <AWIcon id="ties" size={32} />
                <span className="text-[12px] font-bold text-slate-700">固定繩／固定膠帶</span>
              </div>
            </Draggable>
          )}
          {state.secured.tied && <p className="rounded-xl bg-emerald-50 p-3 text-[12px] font-bold text-emerald-800">✓ 氣管內管已固定。固定後再確認一次嘴角刻度{a.depth !== null ? `（${a.depth} cm）` : ''}。</p>}
          <div className="rounded-2xl bg-white/90 p-3 text-[12px] text-slate-600 ring-1 ring-slate-200">
            <p className="font-bold text-slate-700">結束前檢查</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              <li>位置已以胸廓與五點聽診確認</li>
              <li>（補充）持續波形 ETCO₂</li>
              <li>cuff 已充氣、空針已移除</li>
              <li>固定後刻度沒有改變</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
