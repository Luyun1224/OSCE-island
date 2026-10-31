import { PatientAvatar } from '../../../history/components/PatientAvatar';
import { PatientCommunication } from '../../../training/components/PatientCommunication';
import { COMM_TAG_LABEL, COMMUNICATION, PATIENT_LOOK, type CommTag } from '../caseData';
import type { CTState } from '../engine';
import { Pill, type StageProps } from '../ui/shared';

export const moodOf = (s: CTState) => (s.pain >= 2 ? 'pained' : s.anxiety >= 4 ? 'upset' : s.anxiety === 3 ? 'anxious' : s.anxiety === 2 ? 'worried' : s.anxiety === 1 ? 'calm' : 'relieved');

export const commSections = (phases?: string[]) =>
  COMMUNICATION.filter((g) => !phases || phases.includes(g.phase)).map((g) => ({
    id: g.phase,
    title: g.title,
    note: g.note,
    options: g.options.map((o) => ({ id: o.id, text: o.text, feedback: o.feedback, reply: o.reply, quality: (o.tone === 'warm' ? 'good' : o.tone === 'impatient' || o.tags.length === 0 ? 'poor' : 'fair') as 'good' | 'fair' | 'poor' })),
  }));

/** 第一階段：病人溝通（說明來意、安撫、解釋技術、隱私） */
export function GreetStage({ state, dispatch, mode }: StageProps) {
  const covered = new Set<CommTag>(state.comm.flatMap((id) => COMMUNICATION.flatMap((g) => g.options).find((o) => o.id === id)?.tags ?? []));
  return (
    <div className="grid gap-3 lg:grid-cols-[15rem_1fr]">
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/90 p-4 ring-1 ring-orange-100">
        <PatientAvatar look={PATIENT_LOOK} mood={moodOf(state) as never} size={150} />
        <p className="text-sm font-black text-slate-800">楊大偉・65 歲</p>
        <p className="text-center text-[12px] text-slate-500">尿滯留，躺在急診病床上，等待接受導尿</p>
        <div className="flex w-full items-center gap-1 text-[11px] text-slate-500">
          焦慮
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all" style={{ width: `${(state.anxiety / 4) * 100}%` }} />
          </div>
        </div>
        <div className="grid w-full gap-1.5">
          <button type="button" disabled={state.curtain} onClick={() => dispatch({ type: 'curtain' })} className="rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-slate-700 ring-1 ring-slate-200 disabled:bg-emerald-50 disabled:text-emerald-700">
            {state.curtain ? '✓ 隔簾已拉上' : '🪟 拉上隔簾保護隱私'}
          </button>
          <button type="button" disabled={state.maskOn} onClick={() => dispatch({ type: 'wearMask' })} className="rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-slate-700 ring-1 ring-slate-200 disabled:bg-emerald-50 disabled:text-emerald-700">
            {state.maskOn ? '✓ 已戴外科口罩' : '😷 戴上外科手術口罩'}
          </button>
        </div>
      </div>
      <div className="rounded-3xl bg-white/90 p-4 ring-1 ring-slate-200">
        <PatientCommunication
          sections={commSections(['before'])}
          chosen={state.comm}
          guided={mode.immediateFeedback}
          onChoose={(id) => dispatch({ type: 'comm', optionId: id })}
          lastReply={state.patientLine}
          patient={<span className="text-2xl">🗨️</span>}
        />
        {mode.showHints && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(['purpose', 'reassure', 'explain', 'privacy'] as CommTag[]).map((t) => (
              <Pill key={t} ok={covered.has(t) ? true : null}>
                {COMM_TAG_LABEL[t]}
              </Pill>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11px] text-slate-400">整個操作過程中都可以按下方「💬 向病人說明」繼續與病人溝通。選項式模擬無法評估實際語氣。</p>
      </div>
    </div>
  );
}
