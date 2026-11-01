import { useEffect, useRef, useState } from 'react';
import { Draggable, useDropZone, useDropState } from '../../../training/components/DragDrop';
import { AIRWAY_CONFIG as CFG } from '../rubricConfig';
import { AWIcon } from '../ui/Icons';
import { ReviewNote, type StageProps } from '../ui/shared';
import { LaryngoscopeView, TubePositionView } from '../ui/views';

function Target({ id, label, className, show }: { id: string; label: string; className: string; show: boolean }) {
  const { active, over } = useDropState(id);
  if (!show) return null;
  return (
    <div data-drop={id} className={`absolute flex items-center justify-center rounded-full border-2 border-dashed text-[10px] font-bold ${over ? 'border-emerald-400 bg-emerald-300/40 text-white' : active ? 'border-white/70 text-white/90' : 'border-transparent text-transparent'} ${className}`}>
      {label}
    </div>
  );
}

/** IntubationSimulation／TubePositionState：把管尖放到看到的位置，再讀取嘴角刻度 */
export function IntubateStage({ state, dispatch, mode, demo }: StageProps) {
  const view = useRef<HTMLDivElement>(null);
  const a = state.attempt;
  const v = state.scopeUse.view;
  useDropZone('aw-glottis', (p) => p.kind === 'aw-ett' && dispatch({ type: 'intubate', target: 'glottis' }));
  useDropZone('aw-esophagus', (p) => p.kind === 'aw-ett' && dispatch({ type: 'intubate', target: 'esophagus' }));
  useDropZone('aw-blind', (p) => p.kind === 'aw-ett' && dispatch({ type: 'intubate', target: 'esophagus' }));
  const placed = a.location !== 'none';
  const canDrop = state.scopeUse.inserted && !placed;
  const [depth, setDepth] = useState(a.depth ?? 16);
  useEffect(() => setDepth(a.depth ?? 16), [a.depth]);
  const commitDepth = () => depth !== a.depth && dispatch({ type: 'setDepth', cm: depth });
  const reveal = a.confirmed || (mode.immediateFeedback && a.chestObserved && a.ausc.length >= 3);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">插管嘗試：{state.attempts} 次</span>
        <span className={`rounded-full px-2 py-0.5 ${v === 'glottis' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{v === 'glottis' ? '看得到聲門' : v === 'poor' ? '看不到聲門' : '喉頭鏡未置入'}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_16rem]">
        <div ref={view} className="relative mx-auto aspect-square w-full max-w-xs">
          <LaryngoscopeView state={state} showTube targets={canDrop && mode.showHints} />
          <Target id="aw-glottis" label="聲門" className="left-[38%] top-[34%] h-[32%] w-[24%]" show={canDrop && v === 'glottis'} />
          <Target id="aw-esophagus" label="後方開口" className="left-[36%] top-[74%] h-[14%] w-[28%]" show={canDrop && v === 'glottis'} />
          <Target id="aw-blind" label="往下放" className="left-[30%] top-[40%] h-[40%] w-[40%]" show={canDrop && v !== 'glottis'} />
        </div>
        <div className="space-y-2">
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">① 右手持氣管內管，拖曳管尖到喉頭鏡視野中</p>
            {canDrop ? (
              <Draggable payload={{ kind: 'aw-ett', id: 'ett' }} preview={<AWIcon id={state.tube.size ?? 'ett75'} size={60} />} disabled={demo}>
                <div className="mt-1 flex items-center gap-2 rounded-xl bg-sky-50 p-2 ring-1 ring-sky-200">
                  <AWIcon id={state.tube.size ?? 'ett75'} size={36} />
                  <span className="text-[12px] font-bold text-sky-900">按住拖曳管尖</span>
                </div>
              </Draggable>
            ) : (
              <p className="mt-1 text-[12px] text-slate-500">{placed ? `氣管內管已置入（第 ${state.attempts} 次）。` : '請先在「喉頭鏡操作」置入葉片。'}</p>
            )}
            {!canDrop && !placed && v === 'none' && <p className="text-[11px] text-slate-400">看不到聲門時不要盲目放管。</p>}
          </div>
          {placed && (
            <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
              <p className="text-[11px] font-bold text-slate-500">② 深度：調整到你認為的嘴角刻度</p>
              <input type="range" min={16} max={28} step={0.5} value={depth} disabled={a.cuffInflated} onChange={(e) => setDepth(Number(e.target.value))} onPointerUp={commitDepth} onBlur={commitDepth} className="w-full accent-sky-600" aria-label="氣管內管深度" />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>16</span>
                <span>22</span>
                <span>28 cm</span>
              </div>
              <button type="button" onClick={() => {
                  commitDepth();
                  dispatch({ type: 'readDepth' });
                }} className="mt-1 w-full rounded-xl bg-sky-600 px-3 py-1.5 text-[12px] font-bold text-white">
                👁 讀取嘴角刻度{a.depthRead && a.depth !== null ? `：${a.depth} cm` : ''}
              </button>
              {a.cuffInflated && <p className="mt-1 text-[11px] text-amber-700">cuff 已充氣，需先放氣才能調整深度。</p>}
              {mode.showHints && <p className="mt-1 text-[11px] text-slate-400">本教案：嘴角刻度約 {CFG.caseRequirement.depth.min}–{CFG.caseRequirement.depth.max} cm</p>}
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto aspect-[58/43] w-full max-w-xl">
        <TubePositionView attempt={a} reveal={reveal} />
      </div>
      <ReviewNote>{CFG.review.technique.note} 置管結果由「你放的位置」與案例規則決定，拖曳本身不代表真實插管技巧。</ReviewNote>
    </div>
  );
}
