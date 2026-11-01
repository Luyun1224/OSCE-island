import { AIRWAY_CONFIG as CFG } from '../rubricConfig';
import { Choice, ReviewNote, type StageProps } from '../ui/shared';
import { LaryngoscopeView } from '../ui/views';

/** LaryngoscopeInteraction：持握手 → 置入葉片 → 上提方式（案例規則決定教學示意視野） */
export function LaryngoscopyStage({ state, dispatch, demoHighlight }: StageProps) {
  const u = state.scopeUse;
  const placed = state.attempt.location !== 'none';
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[1fr_16rem]">
        <div className="mx-auto aspect-square w-full max-w-xs">
          <LaryngoscopeView state={state} />
        </div>
        <div className="space-y-2">
          <div className="space-y-1.5 rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">① 用哪一隻手持喉頭鏡？</p>
            <div className="grid grid-cols-2 gap-1.5">
              <Choice id="hand-left" demoHighlight={demoHighlight} active={u.hand === 'left'} onClick={() => dispatch({ type: 'selectHand', hand: 'left' })}>
                🫲 左手
              </Choice>
              <Choice id="hand-right" demoHighlight={demoHighlight} active={u.hand === 'right'} onClick={() => dispatch({ type: 'selectHand', hand: 'right' })}>
                🫱 右手
              </Choice>
            </div>
          </div>
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">② 置入葉片</p>
            <button type="button" disabled={placed} onClick={() => dispatch({ type: 'insertBlade' })} className="mt-1 w-full rounded-xl bg-slate-700 px-3 py-2 text-[12px] font-bold text-white disabled:bg-slate-200 disabled:text-slate-500">
              {u.inserted ? '✓ 葉片已置入（可重新置入）' : '由口腔置入喉頭鏡葉片'}
            </button>
          </div>
          <div className="space-y-1.5 rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">③ 如何顯露聲門？</p>
            <Choice id="lift-lift" demoHighlight={demoHighlight} active={u.lift === 'lift'} onClick={() => dispatch({ type: 'lift', how: 'lift' })}>
              沿握把方向向前上方提起
            </Choice>
            <Choice id="lift-lever" demoHighlight={demoHighlight} active={u.lift === 'lever'} onClick={() => dispatch({ type: 'lift', how: 'lever' })}>
              以上排牙齒當支點，把握把往後撬
            </Choice>
          </div>
          <button type="button" onClick={() => dispatch({ type: 'abort' })} className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-[12px] font-bold text-rose-700">
            ✋ 停止插管，改以袋瓣罩給氧並尋求協助
          </button>
        </div>
      </div>
      <ReviewNote>{CFG.review.technique.note} 喉頭鏡畫面為教學示意，不是真實喉部影像；真實技巧請以經教師核准的影片或實體模型學習。</ReviewNote>
    </div>
  );
}
