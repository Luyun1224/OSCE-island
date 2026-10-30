import { useCallback, useEffect, useRef, useState } from 'react';
import { DragDropProvider } from '../../training/components/DragDrop';
import { ConfirmDialog, Modal, ToastStack, type ToastMessage, type ToastTone } from '../../training/components/Dialogs';
import { EventLog } from '../../training/components/EventLog';
import { HintPanel } from '../../training/components/HintPanel';
import { useHintSystem } from '../../training/hintSystem';
import { useInteractionEngine } from '../../training/interactionEngine';
import { formatClock } from '../../training/modes';
import { saveAttempt } from '../../training/storage';
import type { FeedbackReport, TrainingEvent, TrainingModeConfig } from '../../training/types';
import { WOUND_SUTURING_CASE, getStep, type StepId } from './caseData';
import { createFocusState, createInitialState, woundSuturingReducer } from './engine';
import { buildReport, toAttemptRecord } from './report';
import { DisinfectStage } from './stages/DisinfectStage';
import { DisposalStage } from './stages/DisposalStage';
import { DrapeStage } from './stages/DrapeStage';
import { DressingStage } from './stages/DressingStage';
import { GlovesStage } from './stages/GlovesStage';
import { PrepStage } from './stages/PrepStage';
import { SutureStage } from './stages/SutureStage';
import { NarrationPanel } from './ui/NarrationPanel';
import type { StageProps } from './ui/shared';

export function useIsMobile() {
  const q = '(max-width: 767px)';
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

const GLOVE_CODES = new Set(['gloves-contaminated', 'glove-donning-breach', 'suture-nonsterile']);

export function TrainingSession({
  mode,
  focusStep,
  onFinish,
  onExit,
}: {
  mode: TrainingModeConfig;
  focusStep: StepId | null;
  onFinish: (r: FeedbackReport) => void;
  onExit: () => void;
}) {
  const createInitial = useCallback(() => (focusStep ? createFocusState(focusStep) : createInitialState()), [focusStep]);
  const engine = useInteractionEngine(woundSuturingReducer, createInitial, mode);
  const hints = useHintSystem(engine.log);
  const { domain: state, events, elapsed, paused, finished } = engine.state;
  const isMobile = useIsMobile();

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [contamination, setContamination] = useState<TrainingEvent | null>(null);
  const [narrating, setNarrating] = useState(false);
  const [confirm, setConfirm] = useState<null | 'exit' | 'restart' | 'finish'>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const toastId = useRef(0);

  const toast = useCallback((tone: ToastTone, title: string, body?: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, title, body }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 6500 : 3800);
  }, []);

  // 事件 → 即時回饋（依模式決定是否揭露）
  const seen = useRef(0);
  useEffect(() => {
    const fresh = events.slice(seen.current);
    seen.current = events.length;
    for (const e of fresh) {
      if (e.code === 'blocked') toast('warn', e.message);
      else if (!mode.immediateFeedback) continue;
      else if (e.kind === 'contamination') setContamination(e);
      else if (e.kind === 'error' || e.kind === 'order') toast('error', e.message, e.why);
      else if (e.code === 'waste-advisory') toast('info', e.message, e.why);
      else if (e.code === 'stitch-complete' || e.code === 'gloved' || e.code === 'field-ready') toast('good', e.message);
    }
    if (events.length === 0) seen.current = 0;
  }, [events, mode.immediateFeedback, toast]);

  // 結束 → 產生回饋報告並儲存本機紀錄
  const reported = useRef(false);
  useEffect(() => {
    if (!finished || reported.current) return;
    reported.current = true;
    const report = buildReport({ state, events, mode: mode.id, durationSec: elapsed, endReason: finished, focusStepId: focusStep });
    saveAttempt(toAttemptRecord(report, state));
    onFinish(report);
  }, [finished, state, events, mode.id, elapsed, focusStep, onFinish]);

  const step = getStep(state.activeStep);
  const remaining = mode.timeLimitSec !== null ? mode.timeLimitSec - elapsed : null;
  const stageProps: StageProps = { state, dispatch: engine.dispatch, mode, hintLevel: hints.revealed[step.id] ?? 0, isMobile };

  const stage = (() => {
    switch (state.activeStep) {
      case 'prep':
        return <PrepStage {...stageProps} />;
      case 'gloves':
        return <GlovesStage {...stageProps} />;
      case 'disinfect':
        return <DisinfectStage {...stageProps} />;
      case 'drape':
        return <DrapeStage {...stageProps} />;
      case 'suture':
        return <SutureStage {...stageProps} onNotice={(m) => toast('warn', m)} />;
      case 'dressing':
        return <DressingStage {...stageProps} />;
      case 'disposal':
        return <DisposalStage {...stageProps} />;
    }
  })();

  const stepList = (
    <ol className="flex gap-1.5 overflow-x-auto md:flex-col md:overflow-visible">
      {WOUND_SUTURING_CASE.steps.map((s) => {
        const active = s.id === state.activeStep;
        const issues = mode.immediateFeedback ? events.filter((e) => e.stepId === s.id && ['error', 'contamination', 'order'].includes(e.kind)).length : 0;
        return (
          <li key={s.id} className="shrink-0">
            <button
              type="button"
              onClick={() => engine.dispatch({ type: 'setStep', step: s.id as StepId })}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] font-bold transition ${active ? 'bg-blue-700 text-white shadow' : 'bg-white/70 text-slate-600 hover:bg-white'}`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${active ? 'bg-white text-blue-700' : state.visited[s.id as StepId] ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>{s.order}</span>
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
        {WOUND_SUTURING_CASE.scenario.tasks.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-slate-400">{mode.id === 'challenge' ? '挑戰模式不提供即時提示，結束後檢視回饋。' : '自主練習不主動提示順序，可自由選擇階段與器材。'}</p>
    </div>
  );

  return (
    <DragDropProvider>
      <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
        {/* 頂部列 */}
        <header className="flex items-center gap-2 border-b border-white/60 bg-white/80 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:px-5">
          <button type="button" onClick={() => setConfirm('exit')} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
            ← 技能中心
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-800">
              傷口縫合 <span className="font-medium text-slate-400">｜{mode.title}{focusStep ? `・單項練習：${getStep(focusStep).title}` : ''}</span>
            </p>
          </div>
          <div className={`rounded-xl px-3 py-1 font-mono text-sm font-bold tabular-nums ${remaining !== null && remaining < 60 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
            {remaining !== null ? `⏱ ${formatClock(remaining)}` : `⏱ ${formatClock(elapsed)}`}
          </div>
          <button type="button" onClick={() => engine.setPaused(!paused)} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
            {paused ? '▶ 繼續' : '⏸ 暫停'}
          </button>
          <button type="button" onClick={() => setConfirm('restart')} className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200 sm:block">
            ↺ 重新開始
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* 左側：任務、提示與操作紀錄 */}
          <aside className="shrink-0 space-y-3 overflow-y-auto border-white/60 p-3 md:w-72 md:border-r md:bg-white/40">
            {stepList}
            <div className="md:hidden">
              <button type="button" onClick={() => setPanelOpen((v) => !v)} className="w-full rounded-xl bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600">
                {panelOpen ? '收合' : mode.showHints ? '💡 學習目標與提示' : '📋 任務與紀錄'}
              </button>
            </div>
            <div className={`${panelOpen ? 'block' : 'hidden'} space-y-3 md:block`}>
              {guidance}
              <div className="rounded-2xl bg-white/80 p-3">
                <p className="mb-1.5 text-[11px] font-bold tracking-wider text-slate-400">操作紀錄</p>
                <EventLog events={events} revealJudgement={mode.immediateFeedback} />
              </div>
            </div>
          </aside>

          {/* 中央工作區 */}
          <main className="relative min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="text-lg font-black text-slate-800">
                {step.order}. {step.title}
              </h2>
              <span className="text-[11px] font-medium text-slate-400">{step.englishTitle}</span>
            </div>
            <div className="min-h-[60vh]">{stage}</div>
            {paused && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-800">已暫停</p>
                  <p className="mt-1 text-sm text-slate-500">{mode.id === 'challenge' ? '計時已停止；暫停次數會記錄在操作紀錄中。' : '計時已停止。'}</p>
                  <button type="button" onClick={() => engine.setPaused(false)} className="mt-4 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-bold text-white">
                    ▶ 繼續練習
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* 底部工具列 */}
        <footer className="flex items-center gap-2 overflow-x-auto border-t border-white/60 bg-white/85 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:px-5">
          <button type="button" onClick={() => setNarrating(true)} className="shrink-0 rounded-xl bg-sky-600 px-3 py-2 text-[13px] font-bold text-white shadow hover:bg-sky-700">
            💬 向病人說明
          </button>
          <button
            type="button"
            onClick={() => {
              engine.dispatch({ type: 'changeGloves' });
              engine.dispatch({ type: 'setStep', step: 'gloves' });
            }}
            className="shrink-0 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            🧤 脫下／更換手套
          </button>
          <button type="button" onClick={() => engine.dispatch({ type: 'rebuildField' })} className="shrink-0 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
            ♻️ 更換污染物品
          </button>
          <button type="button" onClick={() => setConfirm('restart')} className="shrink-0 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200 sm:hidden">
            ↺ 重來
          </button>
          <div className="flex-1" />
          <button type="button" onClick={() => setConfirm('finish')} className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white shadow hover:bg-emerald-700">
            ✅ 結束並查看回饋
          </button>
        </footer>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />

      {narrating && <NarrationPanel state={state} dispatch={engine.dispatch} guided={mode.immediateFeedback} onClose={() => setNarrating(false)} />}

      {contamination && (
        <Modal onClose={() => setContamination(null)}>
          <div className="p-5">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🦠</span>
              <div>
                <p className="text-[11px] font-bold tracking-wider text-rose-500">無菌污染事件</p>
                <h3 className="text-base font-black text-slate-800">{contamination.message}</h3>
              </div>
            </div>
            {contamination.why && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-[13px] leading-relaxed text-rose-900">為什麼？{contamination.why}</p>}
            <p className="mt-3 text-[12px] font-bold text-slate-500">你要如何處理？</p>
            <div className="mt-2 grid gap-2">
              {GLOVE_CODES.has(contamination.code) || state.gloves.contaminated ? (
                <button
                  type="button"
                  onClick={() => {
                    engine.dispatch({ type: 'changeGloves' });
                    engine.dispatch({ type: 'setStep', step: 'gloves' });
                    setContamination(null);
                  }}
                  className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"
                >
                  🧤 脫下手套，重新穿戴無菌手套
                </button>
              ) : null}
              {state.fieldContaminated && (
                <button
                  type="button"
                  onClick={() => {
                    engine.dispatch({ type: 'rebuildField' });
                    setContamination(null);
                  }}
                  className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"
                >
                  ♻️ 更換污染物品，重新建立無菌區
                </button>
              )}
              <button type="button" onClick={() => setContamination(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">
                先繼續（稍後處理）
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirm === 'exit' && (
        <ConfirmDialog title="離開訓練？" message="本次練習尚未結束，離開後進度不會保留。" confirmLabel="離開" danger onConfirm={onExit} onCancel={() => setConfirm(null)} />
      )}
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
          message="結束後將產生模擬練習回饋。未完成的步驟會列為漏項。"
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
