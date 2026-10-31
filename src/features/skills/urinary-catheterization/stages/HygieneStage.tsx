import { HandHygiene } from '../../../training/components/HandHygiene';
import type { StageProps } from '../ui/shared';

export function HygieneStage({ state, dispatch, mode, phase, demoAreas }: StageProps & { phase: 'before' | 'after' }) {
  const result = phase === 'before' ? state.hygiene.before : state.hygiene.after;
  const blocked = state.gloves.status !== 'none' ? '目前還戴著手套：請先按下方「🧤 脫下手套」，再執行手部衛生。' : null;
  return (
    <div className="space-y-3">
      {phase === 'after' && !blocked && !result && mode.showHints && <p className="rounded-2xl bg-blue-50 p-3 text-[13px] text-blue-900">手套已脫除。接著完成操作後的手部衛生。</p>}
      <HandHygiene title={phase === 'before' ? '操作前手部衛生' : '操作後手部衛生'} showLabels={mode.showHints} blockedReason={blocked} result={result} demoAreas={demoAreas} onSubmit={(areas) => dispatch({ type: 'hygiene', phase, areas })} />
    </div>
  );
}
