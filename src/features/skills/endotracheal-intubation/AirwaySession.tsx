import { useCallback, useEffect, useRef, useState } from 'react';
import { logPractice } from '../../../lib/practiceLog';
import { DragDropProvider } from '../../training/components/DragDrop';
import { ConfirmDialog, Modal, ToastStack, type ToastMessage, type ToastTone } from '../../training/components/Dialogs';
import { EventLog } from '../../training/components/EventLog';
import { HintPanel } from '../../training/components/HintPanel';
import { PatientCommunication } from '../../training/components/PatientCommunication';
import { useHintSystem } from '../../training/hintSystem';
import { useInteractionEngine } from '../../training/interactionEngine';
import { formatClock } from '../../training/modes';
import { saveAttempt } from '../../training/storage';
import type { FeedbackReport, TrainingEvent, TrainingModeConfig } from '../../training/types';
import { useIsMobile } from '../../training/useIsMobile';
import { AIRWAY_CASE, getStep, VERBAL_SECTIONS, type StepId } from './caseData';
import { AirwayDemo } from './demo/AirwayDemo';
import { CHAPTER_OF } from './demo/timeline';
import { airwayReducer, createFocusState, createInitialState, type AWAction } from './engine';
import { buildReport, toAttemptRecord } from './report';
import { StageView } from './stages';
import { SimViewport } from './ui/SimViewport';
import { CartPanel } from './ui/CartPanel';

export function AirwaySession({ mode, focusStep, onFinish, onExit }: { mode: TrainingModeConfig; focusStep: StepId | null; onFinish: (r: FeedbackReport) => void; onExit: () => void }) {
  const createInitial = useCallback(() => (focusStep ? createFocusState(focusStep) : createInitialState()), [focusStep]);
  const engine = useInteractionEngine(airwayReducer, createInitial, mode);
  const hints = useHintSystem(engine.log);
  const { domain: state, events, elapsed, paused, finished } = engine.state;
  const isMobile = useIsMobile();
  const dispatch = engine.dispatch as (a: AWAction) => void;
  const title = focusStep ? `氣管內管插管（單項練習：${getStep(focusStep).title}）` : '氣管內管插管';

  useEffect(() => {
    logPractice({ island: 'procedural-skills', module: 'start', itemId: 'endotracheal-intubation', itemTitle: title, mode: mode.id });
  }, [title, mode.id]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [safety, setSafety] = useState<TrainingEvent | null>(null);
  const [verbalOpen, setVerbalOpen] = useState(false);
  const [demoChapter, setDemoChapter] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<null | 'exit' | 'restart' | 'finish'>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(true);
  const toastId = useRef(0);


  const toast = useCallback((tone: ToastTone, t: string, body?: string) => {
    const id = ++toastId.current;
    setToasts((x) => [...x.slice(-2), { id, tone, title: t, body }]);
    window.setTimeout(() => setToasts((x) => x.filter((m) => m.id !== id)), tone === 'error' ? 6500 : 3800);
  }, []);

  // 事件 → 即時回饋（安全中止在所有模式都會提示）
  const seen = useRef(0);
  useEffect(() => {
    const fresh = events.slice(seen.current);
    seen.current = events.length;
    for (const e of fresh) {
      if (e.code === 'blocked') toast('warn', e.message);
      else if (e.code === 'safety-stop') setSafety(e);
      else if (!mode.immediateFeedback) continue;
      else if (e.kind === 'error' || e.kind === 'order') toast('error', `${e.safety ? '🛑 ' : ''}${e.message}`, e.why);
      else if (e.kind === 'remediation' || ['light', 'cuff-check', 'confirmed', 'secured'].includes(e.code)) toast('good', e.message);
    }
    if (events.length === 0) seen.current = 0;
  }, [events, mode.immediateFeedback, toast]);

  const reported = useRef(false);
  useEffect(() => {
    if (!finished || reported.current) return;
    reported.current = true;
    const report = buildReport({ state, events, mode: mode.id, durationSec: elapsed, endReason: finished, focusStepId: focusStep });
    saveAttempt(toAttemptRecord(report, state));
    logPractice({
      island: 'procedural-skills',
      module: 'skill',
      itemId: 'endotracheal-intubation',
      itemTitle: title,
      mode: mode.id,
      score: report.assessment.total,
      max: report.assessment.max,
      durationSec: elapsed,
      result: finished,
      detail: report.assessment.items.map((i) => `${i.id}:${i.score}`).join(' '),
    });
    onFinish(report);
  }, [finished, state, events, mode.id, elapsed, focusStep, onFinish, title]);

  const step = getStep(state.activeStep);
  const remaining = mode.timeLimitSec !== null ? mode.timeLimitSec - elapsed : null;
  const setStep = (s: StepId) => dispatch({ type: 'setStep', step: s });
  const openDemo = () => {
    engine.setPaused(true);
    setDemoChapter(CHAPTER_OF[state.activeStep]);
  };

  const issuesOf = (id: string) => (mode.immediateFeedback ? events.filter((e) => e.stepId === id && ['error', 'order'].includes(e.kind)).length : 0);

  if (demoChapter !== null)
    return (
      <AirwayDemo
        startChapter={demoChapter}
        exitLabel="← 回到練習"
        onExit={() => {
          setDemoChapter(null);
          engine.setPaused(false);
        }}
      />
    );

  return (
    <DragDropProvider>
      <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50">
        <header className="flex items-center gap-2 border-b border-white/60 bg-white/80 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:px-5">
          <button type="button" onClick={() => setConfirm('exit')} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
            ← 技能中心
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">
            AIRWAY QUEST <span className="font-medium text-slate-400">｜{mode.title}{focusStep ? `・單項練習：${getStep(focusStep).title}` : ''}</span>
          </p>
          {/* OSCEChallengeTimer */}
          <div className={`rounded-xl px-3 py-1 font-mono text-sm font-bold tabular-nums ${remaining !== null && remaining < 60 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>⏱ {formatClock(remaining ?? elapsed)}</div>
          <button type="button" onClick={() => engine.setPaused(!paused)} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
            {paused ? '▶ 繼續' : '⏸ 暫停'}
          </button>
          <button type="button" onClick={() => setCameraOpen((v) => !v)} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
            {cameraOpen ? '收合 3D 場景' : '🏥 3D 場景'}
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
          {/* 左：任務、提示 */}
          <aside className="shrink-0 space-y-3 border-white/60 p-3 md:w-64 md:overflow-y-auto md:border-r md:bg-white/40">
            <ol className="flex gap-1.5 overflow-x-auto md:flex-col md:overflow-visible">
              {AIRWAY_CASE.steps.map((s) => {
                const active = s.id === state.activeStep;
                const n = issuesOf(s.id);
                return (
                  <li key={s.id} className="shrink-0">
                    <button type="button" onClick={() => setStep(s.id as StepId)} className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[12.5px] font-bold transition ${active ? 'bg-indigo-700 text-white shadow' : 'bg-white/70 text-slate-600 hover:bg-white'}`}>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${active ? 'bg-white text-indigo-700' : state.visited[s.id as StepId] ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>{s.order}</span>
                      <span className="whitespace-nowrap">{s.title}</span>
                      {n > 0 && <span className="ml-auto rounded-full bg-amber-400 px-1.5 text-[10px] text-amber-950">{n}</span>}
                    </button>
                  </li>
                );
              })}
            </ol>
            <button type="button" onClick={() => setPanelOpen((v) => !v)} className="w-full rounded-xl bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600 md:hidden">
              {panelOpen ? '收合' : mode.showHints ? '💡 學習目標與提示' : '📋 任務'}
            </button>
            <div className={`${panelOpen ? 'block' : 'hidden'} space-y-3 md:block`}>
              {mode.showHints ? (
                <>
                  <HintPanel step={step} revealed={hints.revealed[step.id] ?? 0} onReveal={() => hints.revealNext(step)} />
                  <button type="button" onClick={openDemo} className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-[12px] font-bold text-white">
                    🎬 觀看這一段的正確示範
                  </button>
                </>
              ) : (
                <div className="rounded-2xl bg-white/80 p-3">
                  <p className="text-[11px] font-bold tracking-wider text-slate-400">測驗任務</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-slate-600">
                    {AIRWAY_CASE.scenario.tasks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-slate-400">{mode.id === 'challenge' ? '挑戰模式不提供即時答案與步驟提示；可能傷害病人的操作仍會安全中止。' : '自主練習不主動提供正確答案；所有操作、遺漏與安全事件會在結束後回饋。'}</p>
                </div>
              )}
            </div>
          </aside>

          {/* 中：訓練模型與操作區 */}
          <main className="relative shrink-0 p-3 md:min-h-0 md:flex-1 md:shrink md:overflow-y-auto md:p-4">
            {cameraOpen && (
              <SimViewport
                className="mb-3 h-[46vh] min-h-[340px] md:h-[54vh] lg:h-[58vh]"
                state={state}
                showHints={mode.showHints}
                stepTitle={`${step.order}. ${step.title}`}
                onStep={setStep}
                onVerbal={() => setVerbalOpen(true)}
                onDemo={mode.showHints ? openDemo : undefined}
              />
            )}
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="text-lg font-black text-slate-800">
                {step.order}. {step.title}
              </h2>
              <span className="text-[11px] font-medium text-slate-400">{step.englishTitle}</span>
            </div>
            {isMobile && state.activeStep === 'prep' && (
              <div className="mb-3">
                <CartPanel state={state} dispatch={dispatch} showHints={mode.showHints} compact />
              </div>
            )}
            <StageView stepId={state.activeStep} props={{ state, dispatch, mode, isMobile }} />
            {paused && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-800">已暫停</p>
                  <button type="button" onClick={() => engine.setPaused(false)} className="mt-4 rounded-xl bg-indigo-700 px-6 py-2.5 text-sm font-bold text-white">
                    ▶ 繼續練習
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* 右：器材盤 */}
          <aside className="shrink-0 space-y-3 p-3 md:w-64 md:overflow-y-auto md:border-l md:border-white/60 md:bg-white/40">
            {!(isMobile && state.activeStep === 'prep') && <CartPanel state={state} dispatch={dispatch} showHints={mode.showHints} compact={isMobile} />}
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="mb-1.5 text-[11px] font-bold tracking-wider text-slate-400">操作紀錄</p>
              <EventLog events={events} revealJudgement={mode.immediateFeedback} />
            </div>
          </aside>
        </div>

        {/* 下：操作工具列、口述、計時 */}
        <footer className="flex items-center gap-2 overflow-x-auto border-t border-white/60 bg-white/85 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:px-5">
          <button type="button" onClick={() => setVerbalOpen(true)} className="shrink-0 rounded-xl bg-sky-600 px-3 py-2 text-[13px] font-bold text-white shadow hover:bg-sky-700">
            🗣️ 同步口述步驟
          </button>
          <button type="button" onClick={() => dispatch({ type: 'abort' })} className="shrink-0 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">
            ✋ 停止・給氧・求助
          </button>
          <button type="button" onClick={() => setConfirm('restart')} className="shrink-0 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200">
            ↺ 重新開始
          </button>
          <div className="flex-1" />
          <button type="button" onClick={() => setConfirm('finish')} className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white shadow hover:bg-emerald-700">
            ✅ 結束並查看回饋
          </button>
        </footer>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />

      {verbalOpen && (
        <Modal onClose={() => setVerbalOpen(false)} wide>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">🗣️ 同步說明步驟</h3>
                <p className="text-[12px] text-slate-500">教案任務：請在進行中同步說明步驟。選擇你此刻要說的話。</p>
              </div>
              <button type="button" onClick={() => setVerbalOpen(false)} className="text-2xl leading-none text-slate-400">
                ×
              </button>
            </div>
            <div className="mt-3">
              <PatientCommunication sections={VERBAL_SECTIONS} initial={VERBAL_SECTIONS.find((s) => s.id === state.activeStep)?.id} chosen={state.verbal} guided={mode.immediateFeedback} onChoose={(id) => dispatch({ type: 'verbal', id })} />
            </div>
          </div>
        </Modal>
      )}

      {safety && (
        <Modal onClose={() => setSafety(null)}>
          <div className="p-5">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🛑</span>
              <div>
                <p className="text-[11px] font-bold tracking-wider text-rose-600">病人安全・模擬中止此動作</p>
                <h3 className="text-base font-black text-slate-800">{safety.message}</h3>
              </div>
            </div>
            <p className="mt-3 rounded-xl bg-rose-50 p-3 text-[13px] leading-relaxed text-rose-900">{mode.immediateFeedback ? safety.why : '這個動作可能傷害病人，模擬已阻止。請停止、重新評估，必要時尋求協助。'}</p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'abort' });
                  setStep('bvm');
                  setSafety(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                ✋ 停止，以袋瓣罩重新給氧並尋求協助
              </button>
              <button type="button" onClick={() => setSafety(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">
                重新評估目前狀況
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirm === 'exit' && <ConfirmDialog title="離開訓練？" message="本次練習尚未結束，離開後進度不會保留。" confirmLabel="離開" danger onConfirm={onExit} onCancel={() => setConfirm(null)} />}
      {confirm === 'restart' && (
        <ConfirmDialog
          title="重新開始？"
          message="目前的操作與紀錄將被清除。"
          confirmLabel="重新開始"
          onConfirm={() => {
            engine.reset();
            hints.reset();
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'finish' && (
        <ConfirmDialog
          title="結束本次練習？"
          message="結束後將產生模擬形成性評量、安全警示與操作回放。"
          confirmLabel="結束並查看回饋"
          onConfirm={() => {
            setConfirm(null);
            engine.finish();
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </DragDropProvider>
  );
}
