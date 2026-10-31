import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNarrator } from '../../../training/useNarrator';
import { DragDropProvider } from '../../../training/components/DragDrop';
import { getTrainingModes } from '../../../training/modes';
import type { TrainingModeId } from '../../../training/types';
import { WOUND_SUTURING_CASE, getStep, type StepId } from '../caseData';
import { createInitialState, woundSuturingReducer, type WSAction, type WSState } from '../engine';
import { DisinfectStage } from '../stages/DisinfectStage';
import { DisposalStage } from '../stages/DisposalStage';
import { DrapeStage } from '../stages/DrapeStage';
import { DressingStage } from '../stages/DressingStage';
import { GlovesStage } from '../stages/GlovesStage';
import { PrepStage } from '../stages/PrepStage';
import { SutureStage } from '../stages/SutureStage';
import { useIsMobile } from '../TrainingSession';
import type { StageProps } from '../ui/shared';
import { DEMO_CHAPTERS, actionsBefore, frameAction, patientLine } from './demoScript';
import { logPractice } from '../../../../lib/practiceLog';

const GUIDED = getTrainingModes(WOUND_SUTURING_CASE.scenario.stationMinutes).guided;
const SPEEDS = [0.75, 1, 1.5, 2];
const noop = () => undefined;

const reduceAll = (s: WSState, actions: WSAction[]) => actions.reduce((acc, a) => woundSuturingReducer(acc, a).state, s);

/** 正確示範模式：自動重播完整正確流程（動畫＋字幕＋可選語音旁白） */
export function DemoPlayer({ onExit, onPractice }: { onExit: () => void; onPractice: (m: TrainingModeId) => void }) {
  const isMobile = useIsMobile();
  const narrator = useNarrator();
  const [chapter, setChapter] = useState(0);
  const [frame, setFrame] = useState(0);
  const [state, setState] = useState<WSState>(createInitialState);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  // 旁白預設開啟（由「觀看示範」按鈕進入，符合瀏覽器需使用者操作才能發聲的規定）
  const [voice, setVoice] = useState(true);
  const [caption, setCaption] = useState('');
  const [bubble, setBubble] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | undefined>();
  const [done, setDone] = useState(false);
  const applied = useRef('');
  const token = useRef(0);

  const ch = DEMO_CHAPTERS[chapter];
  const totalFrames = useMemo(() => DEMO_CHAPTERS.reduce((n, c) => n + c.frames.length, 0), []);
  const doneFrames = DEMO_CHAPTERS.slice(0, chapter).reduce((n, c) => n + c.frames.length, 0) + frame;

  const goChapter = useCallback(
    (i: number, autoplay = true) => {
      narrator.stop();
      token.current++;
      applied.current = '';
      setState(reduceAll(createInitialState(), actionsBefore(i)));
      setChapter(i);
      setFrame(0);
      setCaption('');
      setBubble(null);
      setHighlight(undefined);
      setDone(false);
      setPlaying(autoplay);
    },
    [narrator],
  );

  // 播放主迴圈：進入每個畫格時套用動作，等待時間後前進
  useEffect(() => {
    if (!playing || done) return;
    const f = ch.frames[frame];
    if (!f) {
      if (chapter < DEMO_CHAPTERS.length - 1) {
        const next = chapter + 1;
        setChapter(next);
        setFrame(0);
        setBubble(null);
        setHighlight(undefined);
      } else {
        setDone(true);
        setPlaying(false);
        logPractice({ island: 'procedural-skills', module: 'demo', itemId: 'wound-suturing-demo', itemTitle: '傷口縫合｜正確示範（看完）', result: 'watched' });
      }
      return;
    }
    const key = `${chapter}:${frame}`;
    if (applied.current !== key) {
      applied.current = key;
      const a = frameAction(f);
      if (a) setState((s) => woundSuturingReducer(s, a).state);
      if (f.kind === 'say') setCaption(f.text);
      if (f.kind === 'patient') setBubble(patientLine(f.phase));
      if (f.kind === 'highlight') setHighlight(f.id);
      if (f.kind === 'act' && f.action.type === 'gloveDecision') setHighlight(undefined);
    }
    const my = ++token.current;
    const wait = new Promise<void>((r) => window.setTimeout(r, f.ms / speed));
    const speech = voice && (f.kind === 'say' || f.kind === 'patient') ? narrator.speak(f.kind === 'say' ? f.text : patientLine(f.phase), speed) : Promise.resolve();
    Promise.all([wait, speech]).then(() => {
      if (token.current === my) setFrame((x) => x + 1);
    });
    return () => {
      token.current++;
    };
  }, [playing, done, chapter, frame, ch, speed, voice, narrator]);

  useEffect(() => () => narrator.stop(), [narrator]);

  useEffect(() => {
    logPractice({ island: 'procedural-skills', module: 'start', itemId: 'wound-suturing-demo', itemTitle: '傷口縫合｜正確示範', mode: 'demo' });
  }, []);

  const togglePlay = () => {
    if (done) return goChapter(0);
    if (playing) narrator.stop();
    setPlaying((p) => !p);
  };

  const stepId: StepId = state.activeStep;
  const step = getStep(stepId);
  const props: StageProps = { state, dispatch: noop, mode: GUIDED, hintLevel: 3, isMobile, demoHighlight: highlight };
  const stage = (() => {
    switch (stepId) {
      case 'prep':
        return <PrepStage {...props} />;
      case 'gloves':
        return <GlovesStage {...props} />;
      case 'disinfect':
        return <DisinfectStage {...props} />;
      case 'drape':
        return <DrapeStage {...props} />;
      case 'suture':
        return <SutureStage {...props} onNotice={noop} />;
      case 'dressing':
        return <DressingStage {...props} />;
      case 'disposal':
        return <DisposalStage {...props} />;
    }
  })();

  return (
    <DragDropProvider>
      <div className="flex h-full flex-col bg-gradient-to-br from-emerald-50 via-sky-50 to-blue-50">
        <header className="flex items-center gap-2 border-b border-white/60 bg-white/85 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:px-5">
          <button type="button" onClick={onExit} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
            ← 選擇模式
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">
            傷口縫合 <span className="font-medium text-slate-400">｜正確示範模式</span>
          </p>
          <span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 sm:block">
            第 {chapter + 1} / {DEMO_CHAPTERS.length} 章
          </span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* 章節 */}
          <aside className="shrink-0 overflow-y-auto border-white/60 p-3 md:w-60 md:border-r md:bg-white/40">
            <ol className="flex gap-1.5 overflow-x-auto md:flex-col md:overflow-visible">
              {DEMO_CHAPTERS.map((c, i) => (
                <li key={c.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => goChapter(i)}
                    className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] font-bold transition ${i === chapter ? 'bg-emerald-600 text-white shadow' : 'bg-white/70 text-slate-600 hover:bg-white'}`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${i === chapter ? 'bg-white text-emerald-700' : i < chapter ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {i < chapter ? '✓' : i + 1}
                    </span>
                    <span className="whitespace-nowrap">{c.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          {/* 示範畫面 */}
          <main className="relative min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="text-lg font-black text-slate-800">
                {ch.title}
              </h2>
              <span className="text-[11px] font-medium text-slate-400">示範畫面・{step.title}</span>
            </div>
            {ch.videoUrl ? (
              <video src={ch.videoUrl} controls className="w-full rounded-3xl bg-black" />
            ) : (
              <div className={`relative min-h-[55vh] ${stepId === 'suture' ? '' : 'pointer-events-none select-none'}`}>{stage}</div>
            )}

            <div className="sticky bottom-2 z-10 mx-auto mt-3 max-w-3xl space-y-2">
              {bubble && (
                <div key={bubble} className="ml-auto max-w-xl animate-fade-up rounded-2xl rounded-br-sm bg-sky-600 px-4 py-3 text-[13px] leading-relaxed text-white shadow-xl">
                  <p className="mb-1 text-[10px] font-bold tracking-wider text-sky-100">💬 對病人說明</p>
                  {bubble}
                </div>
              )}
              {caption && (
                <div key={caption} className="animate-fade-up rounded-2xl bg-slate-900/85 px-5 py-3 text-center text-[15px] font-bold leading-relaxed text-white shadow-xl backdrop-blur md:text-base">
                  {caption}
                </div>
              )}
            </div>

            {/* 手機版：重點觀念顯示在示範畫面下方 */}
            <div className="mt-3 space-y-2 md:hidden">
              <div className="rounded-2xl bg-emerald-50 p-3 text-[13px] text-slate-700 ring-1 ring-emerald-200">
                <p className="text-[11px] font-bold text-emerald-700">✅ 正確觀念</p>
                {ch.keyPoints.map((k) => (
                  <p key={k}>• {k}</p>
                ))}
              </div>
              <div className="rounded-2xl bg-rose-50 p-3 text-[13px] text-slate-700 ring-1 ring-rose-200">
                <p className="text-[11px] font-bold text-rose-600">⚠️ 常見錯誤</p>
                {ch.commonMistakes.map((k) => (
                  <p key={k}>✕ {k}</p>
                ))}
              </div>
            </div>
          </main>

          {/* 重點觀念 */}
          <aside className="hidden shrink-0 space-y-3 overflow-y-auto border-white/60 p-3 md:block md:w-72 md:border-l md:bg-white/40">
            <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
              <p className="text-[11px] font-bold tracking-wider text-emerald-700">✅ 正確觀念</p>
              <ul className="mt-1.5 space-y-1.5 text-[13px] leading-relaxed text-slate-700">
                {ch.keyPoints.map((k) => (
                  <li key={k} className="flex gap-1.5">
                    <span className="text-emerald-600">•</span>
                    {k}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-200">
              <p className="text-[11px] font-bold tracking-wider text-rose-600">⚠️ 常見錯誤</p>
              <ul className="mt-1.5 space-y-1.5 text-[13px] leading-relaxed text-slate-700">
                {ch.commonMistakes.map((k) => (
                  <li key={k} className="flex gap-1.5">
                    <span className="text-rose-500">✕</span>
                    {k}
                  </li>
                ))}
              </ul>
            </div>
            {ch.stepId && ch.id !== 'intro' && (
              <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-slate-200">
                <p className="text-[11px] font-bold tracking-wider text-slate-400">❓ 為什麼？</p>
                {getStep(ch.stepId).why.map((w) => (
                  <div key={w.title} className="mt-1.5">
                    <p className="text-[12px] font-bold text-slate-700">{w.title}</p>
                    <p className="text-[12px] leading-relaxed text-slate-600">{w.text}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="px-1 text-[11px] leading-relaxed text-slate-400">本示範為數位模擬動畫，呈現流程與觀念；實際器械手勢、力道與組織處理仍需在模具上實作練習。</p>
          </aside>
        </div>

        {/* 播放控制 */}
        <footer className="border-t border-white/60 bg-white/90 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:px-5">
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(100, (doneFrames / totalFrames) * 100)}%` }} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={chapter === 0} onClick={() => goChapter(chapter - 1)} className="rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40">
              ⏮ 上一章
            </button>
            <button type="button" onClick={togglePlay} className="min-w-[6.5rem] rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white shadow hover:bg-emerald-700">
              {done ? '↺ 重新觀看' : playing ? '⏸ 暫停' : '▶ 播放'}
            </button>
            <button type="button" disabled={chapter === DEMO_CHAPTERS.length - 1} onClick={() => goChapter(chapter + 1)} className="rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40">
              下一章 ⏭
            </button>
            <button type="button" onClick={() => goChapter(chapter)} className="rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200">
              ↺ 重播本章
            </button>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              {SPEEDS.map((s) => (
                <button key={s} type="button" onClick={() => setSpeed(s)} className={`rounded-lg px-2 py-1 text-[12px] font-bold ${speed === s ? 'bg-white text-emerald-700 shadow' : 'text-slate-500'}`}>
                  {s}x
                </button>
              ))}
            </div>
            {narrator.supported && (
              <button
                type="button"
                onClick={() => {
                  if (voice) narrator.stop();
                  setVoice((v) => !v);
                }}
                className={`rounded-xl px-3 py-2 text-[13px] font-bold ring-1 ${voice ? 'bg-sky-600 text-white ring-sky-600' : 'bg-white text-slate-700 ring-slate-200'}`}
              >
                {voice ? '🔊 旁白開' : '🔈 旁白關'}
              </button>
            )}
          </div>
        </footer>
      </div>

      {done && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg animate-fade-up rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="text-5xl">🎬</div>
            <h3 className="mt-2 text-xl font-black text-slate-800">示範完成</h3>
            <p className="mt-1 text-sm text-slate-500">你已看完傷口縫合的完整正確流程。接下來換你動手操作吧！</p>
            <div className="mt-5 grid gap-2">
              <button type="button" onClick={() => onPractice('guided')} className="rounded-xl bg-sky-500 py-2.5 text-sm font-bold text-white">
                🧭 用教學引導模式練習
              </button>
              <button type="button" onClick={() => onPractice('independent')} className="rounded-xl bg-blue-800 py-2.5 text-sm font-bold text-white">
                🛠️ 自主練習
              </button>
              <button type="button" onClick={() => onPractice('challenge')} className="rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white">
                ⏱️ 8 分鐘模擬挑戰
              </button>
              <button type="button" onClick={() => goChapter(0)} className="rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600">
                ↺ 重新觀看示範
              </button>
            </div>
          </div>
        </div>
      )}
    </DragDropProvider>
  );
}
