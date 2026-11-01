import { useRef, useState } from 'react';
import { Draggable, useDropZone } from '../../../training/components/DragDrop';
import { breathRate, maskSealed, type Grip, type MaskZone } from '../engine';
import { AIRWAY_CONFIG as CFG } from '../rubricConfig';
import { AWIcon } from '../ui/Icons';
import { Choice, DropArea, ReviewNote, type StageProps } from '../ui/shared';
import { ChestView, FaceTopView } from '../ui/views';

/** VentilationSimulation：面罩方向／位置／固定 → 擠壓 → 案例規則決定胸廓起伏 */
export function BvmStage({ state, dispatch, mode, demo, demoHighlight }: StageProps) {
  const face = useRef<HTMLDivElement>(null);
  const [apex, setApex] = useState(true);
  const [pulse, setPulse] = useState(0);
  const intubated = state.attempt.location !== 'none';

  useDropZone('aw-face', (p, _x, y) => {
    if (p.kind !== 'aw-mask' || !face.current) return;
    const r = face.current.getBoundingClientRect();
    const f = (y - r.top) / r.height;
    const zone: MaskZone = f < 0.42 ? 'eyes' : f > 0.66 ? 'low' : 'correct';
    dispatch({ type: 'placeMask', zone, apexToHead: apex });
  });

  const rate = breathRate(state.preBreaths);
  const sealed = maskSealed(state);
  const squeeze = () => {
    dispatch({ type: 'squeezeMask', at: performance.now() / 1000 });
    setPulse((n) => n + 1);
  };

  return (
    <div className="space-y-3">
      {intubated && <p className="rounded-2xl bg-amber-50 p-3 text-[13px] text-amber-900">目前已插管。插管後的通氣請到「插管後確認」接上 Ambu bag。</p>}
      {state.needReox && <p className="rounded-2xl bg-sky-50 p-3 text-[13px] font-bold text-sky-900">已拔管：請先以袋瓣罩重新給氧（至少數次有效通氣），再重新嘗試插管。</p>}
      <div className="grid gap-3 md:grid-cols-[1fr_15rem]">
        <DropArea id="aw-face" title="病人臉部（俯視）" sub="把面罩拖到臉上" className="bg-white/70">
          <div ref={face} className="mx-auto aspect-[6/5] w-full max-w-md">
            <FaceTopView state={state} />
          </div>
        </DropArea>
        <div className="space-y-2">
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">① 面罩方向</p>
            <div className="mt-1 flex items-center gap-2">
              <Draggable payload={{ kind: 'aw-mask', id: 'mask' }} preview={<div className="rounded-xl bg-white p-1 shadow-xl"><AWIcon id="bvm" size={56} /></div>} disabled={demo || intubated}>
                <div className="flex flex-col items-center rounded-xl bg-sky-50 p-1.5 ring-1 ring-sky-200">
                  <svg viewBox="0 0 60 60" width="44" height="44" style={{ transform: `rotate(${apex ? 0 : 180}deg)` }}>
                    <path d="M30 6 C 44 8, 52 36, 48 48 Q30 56 12 48 C 8 36, 16 8, 30 6 Z" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="2" />
                    <text x="30" y="18" textAnchor="middle" fontSize="7" fontWeight="800" fill="#1e3a8a">
                      尖端
                    </text>
                  </svg>
                  <span className="text-[10px] font-bold text-sky-900">拖到臉上</span>
                </div>
              </Draggable>
              <button type="button" onClick={() => setApex((v) => !v)} className="rounded-xl bg-white px-2 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                ↻ 旋轉面罩
                <span className="block text-[10px] font-normal text-slate-400">尖端朝{apex ? '上（頭側）' : '下（腳側）'}</span>
              </button>
            </div>
            {state.mask.placed && (
              <button type="button" onClick={() => dispatch({ type: 'removeMask' })} className="mt-1.5 text-[11px] font-bold text-slate-500 underline">
                移開面罩重新放
              </button>
            )}
          </div>
          <div className="space-y-1.5 rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">② 固定面罩</p>
            {(
              [
                ['one', '單手固定（拇指與食指壓面罩，其餘手指托下顎）'],
                ['two', '雙手固定，由他人擠壓袋子'],
                ['fingertip', '只用指尖按住面罩中央'],
              ] as [Grip, string][]
            ).map(([g, t]) => (
              <Choice key={g} id={`grip-${g}`} demoHighlight={demoHighlight} active={state.mask.grip === g} onClick={() => dispatch({ type: 'setGrip', grip: g })}>
                {t}
              </Choice>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_15rem]">
        <div className="mx-auto aspect-[6/5] w-full max-w-sm">
          <ChestView preRise={sealed} animate={pulse > 0 && pulse % 2 === 1} key={pulse} />
        </div>
        <div className="space-y-2 rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
          <p className="text-[11px] font-bold text-slate-500">③ 擠壓袋子給氧</p>
          <button type="button" onClick={squeeze} disabled={intubated} className="w-full rounded-2xl bg-sky-600 py-4 text-base font-black text-white shadow active:scale-95 disabled:bg-slate-200">
            🫁 擠壓一次
          </button>
          <p className="text-[12px] text-slate-600">已擠壓 {state.attempts === 0 ? state.preBreaths.length : state.reoxBreaths} 次{state.attempts === 0 && state.preRise ? `・胸廓起伏 ${state.preRise} 次` : ''}</p>
          {mode.showHints && <p className="text-[12px] text-slate-600">{rate === null ? `至少擠壓 ${CFG.caseRule.minBreathsForRate} 次才能估算速度` : `目前速度約 ${rate.toFixed(1)} 次/分（教案：${CFG.caseRequirement.ventRate.min}–${CFG.caseRequirement.ventRate.max}）`}</p>}
          {mode.showHints && <p className="text-[11px] text-slate-400">約每 5–6 秒擠壓一次即為 10–12 次/分。</p>}
        </div>
      </div>
      <ReviewNote>通氣頻率 10–12 次/分為本教案評分參數；實際給氣依病人狀況與現行急救指引，由臨床教師確認。</ReviewNote>
    </div>
  );
}
