import { Draggable, useDropZone } from '../../../training/components/DragDrop';
import { AIRWAY_CONFIG as CFG } from '../rubricConfig';
import { AWIcon } from '../ui/Icons';
import { Choice, DropArea, ReviewNote, type StageProps } from '../ui/shared';

/** 通條移除與 cuff 充氣 */
export function TubeCareStage({ state, dispatch, demo, demoHighlight }: StageProps) {
  const a = state.attempt;
  const placed = a.location !== 'none';
  useDropZone('aw-pilot2', (p) => p.kind === 'aw-syringe' && dispatch({ type: 'inflateCuff' }));
  return (
    <div className="space-y-3">
      {!placed && <p className="rounded-2xl bg-amber-50 p-3 text-[13px] text-amber-900">尚未置入氣管內管。</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5 rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
          <p className="text-[12px] font-black text-slate-700">① 通條</p>
          {state.tube.stylet === 'none' ? (
            <p className="text-[12px] text-slate-500">本次沒有使用通條。</p>
          ) : a.styletRemoved ? (
            <p className="text-[12px] font-bold text-emerald-700">✓ 通條已移除</p>
          ) : (
            <>
              <Choice id="stylet-held" demoHighlight={demoHighlight} onClick={() => dispatch({ type: 'removeStylet', held: true })}>
                一手固定氣管內管，另一手移除通條
              </Choice>
              <Choice id="stylet-unheld" demoHighlight={demoHighlight} onClick={() => dispatch({ type: 'removeStylet', held: false })}>
                直接把通條拉出來
              </Choice>
            </>
          )}
        </div>
        <div className="space-y-2 rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
          <p className="text-[12px] font-black text-slate-700">② cuff 充氣</p>
          <DropArea id="aw-pilot2" title="pilot balloon" sub="把空針拖到這裡充氣" className="bg-sky-50">
            <div className="flex items-center gap-2 py-1">
              <svg viewBox="0 0 120 40" className="h-10">
                <path d="M4 20 H80" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                <ellipse cx="24" cy="20" rx="16" ry={a.cuffInflated ? 14 : 7} fill="#bae6fd" opacity="0.85" />
                <circle cx="104" cy="12" r={a.cuffInflated ? 8 : 5} fill="#bae6fd" stroke="#0369a1" />
              </svg>
              <span className="text-[12px] font-bold text-sky-900">{a.cuffInflated ? 'cuff 已充氣' : 'cuff 未充氣'}</span>
            </div>
          </DropArea>
          <div className="flex flex-wrap gap-1.5">
            {placed && !a.cuffInflated && (
              <Draggable payload={{ kind: 'aw-syringe', id: 'syringe' }} preview={<AWIcon id="syringe" size={56} />} disabled={demo}>
                <div className="flex items-center gap-1.5 rounded-xl bg-white px-2 py-1 ring-1 ring-slate-200">
                  <AWIcon id="syringe" size={26} />
                  <span className="text-[11px] font-bold text-slate-700">10 mL 空針</span>
                </div>
              </Draggable>
            )}
            {a.cuffInflated && !a.syringeRemoved && (
              <button type="button" onClick={() => dispatch({ type: 'removeSyringe' })} className="rounded-xl bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 ring-1 ring-slate-200">
                移除空針
              </button>
            )}
            {a.cuffInflated && (
              <button type="button" onClick={() => dispatch({ type: 'deflateCuff' })} className="rounded-xl bg-white px-3 py-1.5 text-[12px] font-bold text-slate-500 ring-1 ring-slate-200">
                cuff 放氣
              </button>
            )}
          </div>
        </div>
      </div>
      <ReviewNote>{CFG.review.cuffVolume.note}</ReviewNote>
    </div>
  );
}
