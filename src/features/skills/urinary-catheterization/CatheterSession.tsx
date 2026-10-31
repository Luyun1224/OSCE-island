import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { logPractice } from '../../../lib/practiceLog';
import { DragDropProvider } from '../../training/components/DragDrop';
import { ConfirmDialog, Modal, ToastStack, type ToastMessage, type ToastTone } from '../../training/components/Dialogs';
import { EventLog } from '../../training/components/EventLog';
import { HintPanel } from '../../training/components/HintPanel';
import { PatientCommunication } from '../../training/components/PatientCommunication';
import { SterileStatusCard } from '../../training/components/SterileStatusCard';
import { useHintSystem } from '../../training/hintSystem';
import { useInteractionEngine } from '../../training/interactionEngine';
import { formatClock } from '../../training/modes';
import { saveAttempt } from '../../training/storage';
import type { FeedbackReport, TrainingEvent, TrainingModeConfig } from '../../training/types';
import { useIsMobile } from '../../training/useIsMobile';
import { CATHETER_CASE, getStep, type StepId } from './caseData';
import { catheterReducer, createFocusState, createInitialState, openRecords, SOURCE_LABEL, sterileStatus, type CTAction } from './engine';
import { buildReport, toAttemptRecord } from './report';
import { BalloonStage } from './stages/BalloonStage';
import { ConnectStage } from './stages/ConnectStage';
import { DisinfectStage } from './stages/DisinfectStage';
import { DisposalStage } from './stages/DisposalStage';
import { DrapeStage } from './stages/DrapeStage';
import { GlovesStage } from './stages/GlovesStage';
import { commSections, GreetStage } from './stages/GreetStage';
import { HygieneStage } from './stages/HygieneStage';
import { InsertStage } from './stages/InsertStage';
import { LubricateStage } from './stages/LubricateStage';
import { PrepStage } from './stages/PrepStage';
import { CartPanel } from './ui/CartPanel';
import type { StageProps } from './ui/shared';

const Scene = lazy(() => import('./scene/CatheterizationScene'));

const COMM_PHASE: Partial<Record<StepId, string>> = { disinfect: 'disinfect', drape: 'disinfect', lubricate: 'disinfect', insert: 'insert', balloon: 'insert', connect: 'after', disposal: 'after', hygieneAfter: 'after' };

const REMEDIES: { kind: 'changeGloves' | 'replaceCatheter' | 'rebuildField' | 'replaceBag' | 'wipe'; label: string }[] = [
  { kind: 'changeGloves', label: '🧤 脫下手套，重新穿戴新的無菌手套' },
  { kind: 'replaceCatheter', label: '🔁 更換新的導尿管（重新拆包、潤滑）' },
  { kind: 'rebuildField', label: '♻️ 更換新的導尿包，重新建立無菌區' },
  { kind: 'replaceBag', label: '🧷 更換新的尿袋' },
  { kind: 'wipe', label: '🧻 用無菌紗布擦一擦污染處，繼續操作' },
];

export function CatheterSession({ mode, focusStep, onFinish, onExit }: { mode: TrainingModeConfig; focusStep: StepId | null; onFinish: (r: FeedbackReport) => void; onExit: () => void }) {
  const createInitial = useCallback(() => (focusStep ? createFocusState(focusStep) : createInitialState({ resistance: mode.id === 'guided' || Math.random() < 0.5 })), [focusStep, mode.id]);
  const engine = useInteractionEngine(catheterReducer, createInitial, mode);
  const hints = useHintSystem(engine.log);
  const { domain: state, events, elapsed, paused, finished } = engine.state;
  const isMobile = useIsMobile();
  const dispatch = engine.dispatch as (a: CTAction) => void;

  const title = focusStep ? `導尿管置入（單項練習：${getStep(focusStep).title}）` : '導尿管置入';
  useEffect(() => {
    logPractice({ island: 'procedural-skills', module: 'start', itemId: 'urinary-catheterization', itemTitle: title, mode: mode.id });
  }, [title, mode.id]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [contamination, setContamination] = useState<TrainingEvent | null>(null);
  const [safety, setSafety] = useState<TrainingEvent | null>(null);
  const [remedyOpen, setRemedyOpen] = useState(false);
  const [commOpen, setCommOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | 'exit' | 'restart' | 'finish'>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sceneOpen, setSceneOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const toastId = useRef(0);

  const toast = useCallback((tone: ToastTone, t: string, body?: string) => {
    const id = ++toastId.current;
    setToasts((x) => [...x.slice(-2), { id, tone, title: t, body }]);
    window.setTimeout(() => setToasts((x) => x.filter((m) => m.id !== id)), tone === 'error' ? 6500 : 3800);
  }, []);

  // 事件 → 即時回饋（依模式決定是否揭露）；安全中止在所有模式都會提示
  const seen = useRef(0);
  useEffect(() => {
    const fresh = events.slice(seen.current);
    seen.current = events.length;
    for (const e of fresh) {
      if (e.code === 'blocked') toast('warn', e.message);
      else if (e.code === 'safety-stop') setSafety(e);
      else if (e.code === 'resistance' || e.code === 'urine' || e.code === 'teacher') toast(e.code === 'resistance' ? 'warn' : 'info', e.message);
      else if (!mode.immediateFeedback) continue;
      else if (e.kind === 'contamination') setContamination(e);
      else if (e.kind === 'error' || e.kind === 'order') toast('error', e.message, e.why);
      else if (e.code === 'waste-advisory') toast('info', e.message, e.why);
      else if (e.kind === 'remediation' || ['gloved', 'field-ready', 'inserted', 'positioned', 'connected'].includes(e.code)) toast('good', e.message);
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
      itemId: 'urinary-catheterization',
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
  const props: StageProps = { state, dispatch, mode, hintLevel: hints.revealed[step.id] ?? 0, isMobile };
  const setStep = (s: StepId) => dispatch({ type: 'setStep', step: s });

  const stage = (() => {
    switch (state.activeStep) {
      case 'greet':
        return <GreetStage {...props} />;
      case 'hygieneBefore':
        return <HygieneStage {...props} phase="before" />;
      case 'prep':
        return <PrepStage {...props} />;
      case 'gloves':
        return <GlovesStage {...props} />;
      case 'disinfect':
        return <DisinfectStage {...props} />;
      case 'drape':
        return <DrapeStage {...props} />;
      case 'lubricate':
        return <LubricateStage {...props} />;
      case 'insert':
        return <InsertStage {...props} />;
      case 'balloon':
        return <BalloonStage {...props} />;
      case 'connect':
        return <ConnectStage {...props} />;
      case 'disposal':
        return <DisposalStage {...props} />;
      case 'hygieneAfter':
        return <HygieneStage {...props} phase="after" />;
    }
  })();

  const issuesOf = (id: string) => (mode.immediateFeedback ? events.filter((e) => e.stepId === id && ['error', 'contamination', 'order'].includes(e.kind)).length : 0);
  const stepList = (
    <ol className="flex gap-1.5 overflow-x-auto md:flex-col md:overflow-visible">
      {CATHETER_CASE.steps.map((s) => {
        const active = s.id === state.activeStep;
        const issues = issuesOf(s.id);
        return (
          <li key={s.id} className="shrink-0">
            <button type="button" onClick={() => setStep(s.id as StepId)} className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[12.5px] font-bold transition ${active ? 'bg-teal-700 text-white shadow' : 'bg-white/70 text-slate-600 hover:bg-white'}`}>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${active ? 'bg-white text-teal-700' : state.visited[s.id as StepId] ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'}`}>{s.order}</span>
              <span className="whitespace-nowrap">{s.title}</span>
              {issues > 0 && <span className="ml-auto rounded-full bg-amber-400 px-1.5 text-[10px] text-amber-950">{issues}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );

  const guidance = mode.showHints ? (
    <HintPanel step={step} revealed={hints.revealed[step.id] ?? 0} onReveal={() => hints.revealNext(step)} />
  ) : (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className="text-[11px] font-bold tracking-wider text-slate-400">測驗任務</p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-slate-600">
        {CATHETER_CASE.scenario.tasks.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-slate-400">{mode.id === 'challenge' ? '挑戰模式不提供即時答案；可能傷害病人的操作仍會安全中止。' : '自主練習不公布正確步驟，可自由決定順序；錯誤與污染會在結束後回饋。'}</p>
    </div>
  );

  const openContam = openRecords(state);
  const sterilePanel = (
    <SterileStatusCard status={sterileStatus(state)} records={state.contaminations} labels={SOURCE_LABEL} revealUnrecognized={mode.immediateFeedback}>
      <button type="button" onClick={() => setRemedyOpen(true)} className="rounded-xl bg-rose-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-rose-700">
        🦠 我發現污染了／處理污染
      </button>
    </SterileStatusCard>
  );

  return (
    <DragDropProvider>
      <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-teal-50 to-sky-50">
        <header className="flex items-center gap-2 border-b border-white/60 bg-white/80 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:px-5">
          <button type="button" onClick={() => setConfirm('exit')} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
            ← 技能中心
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-800">
              CATHETER QUEST <span className="font-medium text-slate-400">｜{mode.title}{focusStep ? `・單項練習：${getStep(focusStep).title}` : ''}</span>
            </p>
          </div>
          <div className={`rounded-xl px-3 py-1 font-mono text-sm font-bold tabular-nums ${remaining !== null && remaining < 60 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>⏱ {formatClock(remaining ?? elapsed)}</div>
          <button type="button" onClick={() => engine.setPaused(!paused)} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
            {paused ? '▶ 繼續' : '⏸ 暫停'}
          </button>
          <button type="button" onClick={() => setSceneOpen((v) => !v)} className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200 sm:block">
            {sceneOpen ? '收合 3D 診間' : '🏥 3D 診間'}
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
          {/* 左：階段、提示與教學目標 */}
          <aside className="shrink-0 space-y-3 border-white/60 p-3 md:w-64 md:overflow-y-auto md:border-r md:bg-white/40">
            {stepList}
            <button type="button" onClick={() => setPanelOpen((v) => !v)} className="w-full rounded-xl bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600 md:hidden">
              {panelOpen ? '收合' : mode.showHints ? '💡 學習目標與提示' : '📋 任務'}
            </button>
            <div className={`${panelOpen ? 'block' : 'hidden'} space-y-3 md:block`}>{guidance}</div>
          </aside>

          {/* 中：病人模型與主要操作區 */}
          <main className="relative shrink-0 p-3 md:min-h-0 md:flex-1 md:shrink md:overflow-y-auto md:p-4">
            {sceneOpen && (
              <Suspense fallback={<div className="mb-3 h-56 animate-pulse rounded-3xl bg-sky-100" />}>
                <Scene state={state} onPick={setStep} className="mb-3 h-56 overflow-hidden rounded-3xl ring-1 ring-sky-200 lg:h-64" />
              </Suspense>
            )}
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="text-lg font-black text-slate-800">
                {step.order}. {step.title}
              </h2>
              <span className="text-[11px] font-medium text-slate-400">{step.englishTitle}</span>
            </div>
            {isMobile && state.activeStep === 'prep' && (
              <div className="mb-3">
                <CartPanel state={state} showHints={mode.showHints} compact />
              </div>
            )}
            <div className="md:min-h-[50vh]">{stage}</div>
            {paused && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-800">已暫停</p>
                  <button type="button" onClick={() => engine.setPaused(false)} className="mt-4 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-bold text-white">
                    ▶ 繼續練習
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* 右：無菌狀態與器材工作車 */}
          <aside className="shrink-0 space-y-3 p-3 md:w-64 md:overflow-y-auto md:border-l md:border-white/60 md:bg-white/40">
            {sterilePanel}
            {!(isMobile && state.activeStep === 'prep') && <CartPanel state={state} showHints={mode.showHints} compact={isMobile} />}
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="mb-1.5 text-[11px] font-bold tracking-wider text-slate-400">操作紀錄</p>
              <EventLog events={events} revealJudgement={mode.immediateFeedback} />
            </div>
          </aside>
        </div>

        {/* 下：溝通、補救、返回與重試 */}
        <footer className="flex items-center gap-2 overflow-x-auto border-t border-white/60 bg-white/85 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:px-5">
          <button type="button" onClick={() => setCommOpen(true)} className="shrink-0 rounded-xl bg-sky-600 px-3 py-2 text-[13px] font-bold text-white shadow hover:bg-sky-700">
            💬 向病人說明
          </button>
          <button type="button" onClick={() => dispatch({ type: 'removeGloves' })} disabled={state.gloves.status === 'none' && state.gloves.progress === 0} className="shrink-0 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40">
            🧤 脫下手套
          </button>
          <button type="button" onClick={() => setRemedyOpen(true)} className="shrink-0 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
            ♻️ 處理污染
          </button>
          <button type="button" onClick={() => dispatch({ type: 'requestHelp' })} className="shrink-0 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">
            ✋ 尋求教師協助
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

      {commOpen && (
        <Modal onClose={() => setCommOpen(false)} wide>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">💬 向病人說明</h3>
                <p className="text-[12px] text-slate-500">假想楊先生在場。選擇你此刻要對他說的話。</p>
              </div>
              <button type="button" onClick={() => setCommOpen(false)} className="text-2xl leading-none text-slate-400">
                ×
              </button>
            </div>
            <div className="mt-3">
              <PatientCommunication sections={commSections()} initial={COMM_PHASE[state.activeStep] ?? 'before'} chosen={state.comm} guided={mode.immediateFeedback} onChoose={(id) => dispatch({ type: 'comm', optionId: id })} lastReply={state.patientLine} patient={<span className="text-2xl">🧓</span>} />
            </div>
          </div>
        </Modal>
      )}

      {(remedyOpen || contamination) && (
        <Modal
          onClose={() => {
            setRemedyOpen(false);
            setContamination(null);
          }}
        >
          <div className="p-5">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🦠</span>
              <div>
                <p className="text-[11px] font-bold tracking-wider text-rose-500">{contamination ? '無菌污染事件' : '處理污染'}</p>
                <h3 className="text-base font-black text-slate-800">{contamination ? contamination.message : '你發現哪裡被污染了？要怎麼處理？'}</h3>
              </div>
            </div>
            {contamination?.why && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-[13px] leading-relaxed text-rose-900">為什麼？{contamination.why}</p>}
            {mode.immediateFeedback && openContam.length > 0 && (
              <ul className="mt-2 space-y-1 text-[12px] text-rose-800">
                {openContam.map((c) => (
                  <li key={c.id}>⚠ {SOURCE_LABEL[c.source]}：{c.reason}</li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[12px] font-bold text-slate-500">選擇處理方式（先判斷再處理）</p>
            <div className="mt-2 grid gap-2">
              {REMEDIES.map((r) => (
                <button
                  key={r.kind}
                  type="button"
                  onClick={() => {
                    if (openContam.length) dispatch({ type: 'recognize' });
                    dispatch({ type: 'remedy', kind: r.kind });
                    if (r.kind === 'changeGloves') setStep('gloves');
                    if (r.kind === 'replaceCatheter' || r.kind === 'rebuildField') setStep('prep');
                    setRemedyOpen(false);
                    setContamination(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                >
                  {r.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setRemedyOpen(false);
                  setContamination(null);
                }}
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500"
              >
                先繼續（稍後處理）
              </button>
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
            <p className="mt-3 rounded-xl bg-rose-50 p-3 text-[13px] leading-relaxed text-rose-900">{mode.immediateFeedback ? safety.why : '這個動作可能傷害病人，模擬已阻止。請重新評估目前狀況，必要時停止並尋求臨床教師協助。'}</p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setSafety(null);
                  setRemedyOpen(true);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                處理污染／更換器材
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'requestHelp' });
                  setSafety(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
              >
                ✋ 停止操作，尋求臨床教師協助
              </button>
              <button type="button" onClick={() => setSafety(null)} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500">
                關閉
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirm === 'exit' && <ConfirmDialog title="離開訓練？" message="本次練習尚未結束，離開後進度不會保留。" confirmLabel="離開" danger onConfirm={onExit} onCancel={() => setConfirm(null)} />}
      {confirm === 'restart' && (
        <ConfirmDialog
          title="重新開始？"
          message="目前的操作與紀錄將被清除，從頭開始本次練習。"
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
          message="結束後將產生模擬形成性評量與操作回放。未完成的步驟會列為漏項。"
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
