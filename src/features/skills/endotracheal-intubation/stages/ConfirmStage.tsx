import { useState } from 'react';
import { Draggable, useDropZone } from '../../../training/components/DragDrop';
import { AUSC_LABEL, REQUIRED_AUSC, type AuscPoint } from '../caseData';
import { auscFinding } from '../engine';
import { AWIcon } from '../ui/Icons';
import { DropArea, SupplementNote, type StageProps } from '../ui/shared';
import { AuscultationMap, CapnoView, ChestView, TubePositionView } from '../ui/views';

/** PlacementVerification：接 Ambu bag → 壓袋 → 胸廓 → 五點聽診 →（補充）波形 ETCO₂ → 判斷 */
export function ConfirmStage({ state, dispatch, mode, demo }: StageProps) {
  const a = state.attempt;
  const placed = a.location !== 'none';
  const [pulse, setPulse] = useState(0);
  const [depth, setDepth] = useState(a.depth ?? 21);
  useDropZone('aw-connector', (p) => p.kind === 'aw-bag' && dispatch({ type: 'connectBag' }));
  const results = Object.fromEntries(a.ausc.map((p) => [p, auscFinding(a, p)])) as Partial<Record<AuscPoint, string>>;
  const reveal = a.confirmed || state.final?.confirmed === true;

  if (!placed)
    return (
      <div className="space-y-3">
        <p className="rounded-2xl bg-amber-50 p-3 text-[13px] text-amber-900">目前沒有氣管內管。{state.needReox ? '請先以袋瓣罩重新給氧，再重新插管。' : ''}</p>
        {state.final && <TubePositionView attempt={state.final} reveal />}
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2 rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
          <p className="text-[12px] font-black text-slate-700">① 接上 Ambu bag 並壓袋</p>
          {a.bagConnected ? (
            <p className="text-[12px] font-bold text-emerald-700">✓ 已接上 Ambu bag</p>
          ) : (
            <div className="flex items-center gap-2">
              <Draggable payload={{ kind: 'aw-bag', id: 'bvm' }} preview={<AWIcon id="bvm" size={56} />} disabled={demo}>
                <div className="flex items-center gap-1.5 rounded-xl bg-sky-50 px-2 py-1 ring-1 ring-sky-200">
                  <AWIcon id="bvm" size={30} />
                  <span className="text-[11px] font-bold text-sky-900">拖到管路接頭</span>
                </div>
              </Draggable>
              <DropArea id="aw-connector" title="氣管內管接頭" className="flex-1 bg-slate-50">
                <span className="text-[10px] text-slate-400">15 mm 接頭</span>
              </DropArea>
            </div>
          )}
          <button
            type="button"
            disabled={!a.bagConnected}
            onClick={() => {
              dispatch({ type: 'squeezeTube' });
              setPulse((n) => n + 1);
            }}
            className="w-full rounded-xl bg-sky-600 py-2.5 text-[13px] font-black text-white disabled:bg-slate-200 disabled:text-slate-500"
          >
            🫁 壓袋通氣（{a.postBreaths}）
          </button>
          <button type="button" disabled={!a.postBreaths} onClick={() => dispatch({ type: 'observeChest' })} className="w-full rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40">
            👀 觀察兩側胸廓起伏
          </button>
        </div>
        <div className="aspect-[6/5] rounded-3xl bg-white/90 p-1 ring-1 ring-slate-200">
          {a.chestObserved ? <ChestView attempt={a} animate={pulse > 0} key={pulse} /> : <div className="flex h-full items-center justify-center text-[12px] text-slate-400">尚未觀察胸廓</div>}
        </div>
        <div className="aspect-[6/5] rounded-3xl bg-white/90 p-1 ring-1 ring-slate-200">
          <TubePositionView attempt={a} reveal={reveal} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_16rem]">
        <div className="rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
          <p className="text-[12px] font-black text-slate-700">② 聽診：點選你要放聽診器的位置（請邊壓袋邊聽）</p>
          <div className="mx-auto aspect-[6/5] w-full max-w-sm">
            <AuscultationMap checked={a.ausc} wrong={[...a.wrongAusc, ...a.auscNoVent]} labels={mode.showHints} onPick={(p) => !demo && dispatch({ type: 'auscultate', point: p })} results={results} />
          </div>
        </div>
        <div className="space-y-1 rounded-3xl bg-white/90 p-3 text-[12px] ring-1 ring-slate-200">
          <p className="font-black text-slate-700">聽診結果</p>
          {a.ausc.length === 0 && <p className="text-slate-400">尚未聽診</p>}
          {a.ausc.map((p) => (
            <p key={p} className="rounded-lg bg-slate-50 px-2 py-1">
              <b>{AUSC_LABEL[p]}</b>：{results[p]}
            </p>
          ))}
          {mode.showHints && <p className="pt-1 text-[11px] text-slate-400">教案五點：{REQUIRED_AUSC.map((p) => AUSC_LABEL[p]).join('、')}（已完成 {REQUIRED_AUSC.filter((p) => a.ausc.includes(p)).length}/5）</p>}
        </div>
      </div>

      <div className="rounded-3xl bg-cyan-50/70 p-3 ring-1 ring-cyan-200">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[12px] font-black text-cyan-900">③ 波形二氧化碳監測（ETCO₂）</p>
          <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-800">現行臨床安全補充</span>
          <button type="button" disabled={!a.bagConnected || a.capno} onClick={() => dispatch({ type: 'attachCapno' })} className="ml-auto rounded-xl bg-cyan-700 px-3 py-1.5 text-[12px] font-bold text-white disabled:bg-slate-200 disabled:text-slate-500">
            {a.capno ? '✓ 已連接' : '連接 ETCO₂ 感測器'}
          </button>
        </div>
        <div className="mx-auto mt-2 aspect-[24/11] w-full max-w-md">
          <CapnoView attempt={a} />
        </div>
        <SupplementNote>不得僅憑胸廓起伏、聽診或插管深度數字就認定位置完全正確；持續波形 ETCO₂ 是現行臨床確認氣管內管位置的重要工具。此模組不影響教案 14 項評分。</SupplementNote>
      </div>

      <div className="rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
        <p className="text-[12px] font-black text-slate-700">④ 你的判斷</p>
        <div className="mt-2 grid gap-1.5 md:grid-cols-3">
          <button type="button" onClick={() => dispatch({ type: 'confirmPlacement' })} className="rounded-xl bg-emerald-600 px-3 py-2 text-[12px] font-bold text-white">
            ✓ 位置正確，準備固定
          </button>
          <button type="button" onClick={() => dispatch({ type: 'removeTube' })} className="rounded-xl bg-rose-600 px-3 py-2 text-[12px] font-bold text-white">
            ✕ 懷疑食道插管：拔管並重新給氧
          </button>
          <div className="rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-600">調整深度（需先將 cuff 放氣）</p>
            <div className="mt-1 flex items-center gap-1">
              <button type="button" onClick={() => dispatch({ type: 'deflateCuff' })} className="rounded-lg bg-white px-2 py-1 text-[11px] font-bold ring-1 ring-slate-200">
                放氣
              </button>
              <input type="range" min={16} max={28} step={0.5} value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="w-20 accent-sky-600" aria-label="調整深度" />
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'setDepth', cm: depth });
                  dispatch({ type: 'readDepth' });
                }}
                className="rounded-lg bg-white px-2 py-1 text-[11px] font-bold ring-1 ring-slate-200"
              >
                設為 {depth}
              </button>
              <button type="button" onClick={() => dispatch({ type: 'inflateCuff' })} className="rounded-lg bg-white px-2 py-1 text-[11px] font-bold ring-1 ring-slate-200">
                充氣
              </button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">胸廓、聽診與波形的結果都依「管路位置與深度」的案例規則決定，不是隨機生理數據。</p>
      </div>
    </div>
  );
}
