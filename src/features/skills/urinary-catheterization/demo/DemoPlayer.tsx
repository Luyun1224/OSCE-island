import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logPractice } from '../../../../lib/practiceLog';
import { DragDropProvider } from '../../../training/components/DragDrop';
import { getTrainingModes } from '../../../training/modes';
import type { HandAreaId } from '../../../training/sterile';
import type { TrainingModeId } from '../../../training/types';
import { useIsMobile } from '../../../training/useIsMobile';
import { useNarrator } from '../../../training/useNarrator';
import { CATHETER_CASE, getStep } from '../caseData';
import { catheterReducer, createInitialState, type CTAction, type CTState } from '../engine';
import { BalloonStage } from '../stages/BalloonStage';
import { ConnectStage } from '../stages/ConnectStage';
import { DisinfectStage } from '../stages/DisinfectStage';
import { DisposalStage } from '../stages/DisposalStage';
import { DrapeStage } from '../stages/DrapeStage';
import { GlovesStage } from '../stages/GlovesStage';
import { GreetStage } from '../stages/GreetStage';
import { HygieneStage } from '../stages/HygieneStage';
import { InsertStage } from '../stages/InsertStage';
import { LubricateStage } from '../stages/LubricateStage';
import { PrepStage } from '../stages/PrepStage';
import type { StageProps } from '../ui/shared';
import { actionsBefore, DEMO_CHAPTERS, frameAction, studentLine } from './demoScript';

const GUIDED = getTrainingModes(CATHETER_CASE.scenario.stationMinutes).guided;
const SPEEDS = [0.75, 1, 1.5, 2];
const noop = () => undefined;
const fresh = () => createInitialState({ resistance: true });
const reduceAll = (s: CTState, actions: CTAction[]) => actions.reduce((acc, a) => catheterReducer(acc, a).state, s);

/** CATHETER QUEST 正確示範：以引擎自動重播完整正確流程（動畫＋字幕＋語音旁白） */
export function CatheterDemoPlayer({ onExit, onPractice }: { onExit: () => void; onPractice: (m: TrainingModeId) => void }) {
  const isMobile = useIsMobile();
  const narrator = useNarrator();
  const [chapter, setChapter] = useState(0);
  const [frame, setFrame] = useState(0);
  const [state, setState] = useState<CTState>(fresh);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  // 旁白預設開啟（由「觀看示範」按鈕進入，符合瀏覽器需使用者操作才能發聲的規定）
  const [voice, setVoice] = useState(true);
  const [caption, setCaption] = useState('');
  const [bubble, setBubble] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | undefined>();
  const [hand, setHand] = useState<HandAreaId[] | undefined>();
  const [done, setDone] = useState(false);
  const applied = useRef('');
  const token = useRef(0);

  const ch = DEMO_CHAPTERS[chapter];
  const totalFrames = useMemo(() => DEMO_CHAPTERS.reduce((n, c) => n + c.frames.length, 0), []);
  const doneFrames = DEMO_CHAPTERS.slice(0, chapter).reduce((n, c) => n + c.frames.length, 0) + frame;

  const reset = () => {
    setCaption('');
    setBubble(null);
    setHighlight(undefined);
    setHand(undefined);
  };

  const goChapter = useCallback(
    (i: number, autoplay = true) => {
      narrator.stop();
      token.current++;
      applied.current = '';
      setState(reduceAll(fresh(), actionsBefore(i)));
      setChapter(i);
      setFrame(0);
      reset();
      setDone(false);
      setPlaying(autoplay);
    },
    [narrator],
  );

  useEffect(() => {
    if (!playing || done) return;
    const f = ch.frames[frame];
    if (!f) {
      if (chapter < DEMO_CHAPTERS.length - 1) {
        setChapter(chapter + 1);
        setFrame(0);
        setBubble(null);
        setHighlight(undefined);
        setHand(undefined);
      } else {
        setDone(true);
        setPlaying(false);
        logPractice({ island: 'procedural-skills', module: 'demo', itemId: 'urinary-catheterization-demo', itemTitle: '導尿管置入｜正確示範（看完）', result: 'watched' });
      }
      return;
    }
    const key = `${chapter}:${frame}`;
    if (applied.current !== key) {
      applied.current = key;
      const a = frameAction(f);
      if (a) setState((s) => catheterReducer(s, a).state);
      if (f.kind === 'say') setCaption(f.text);
      if (f.kind === 'patient') setBubble(studentLine(f.optionId));
      if (f.kind === 'highlight') setHighlight(f.id);
      if (f.kind === 'hand') setHand(f.areas as HandAreaId[]);
      if (f.kind === 'act' && f.action.type === 'gloveDecision') setHighlight(undefined);
      if (f.kind === 'act' && f.action.type === 'hygiene') setHand(undefined);
    }
    const my = ++token.current;
    const wait = new Promise<void>((r) => window.setTimeout(r, f.ms / speed));
    const speech = voice && (f.kind === 'say' || f.kind === 'patient') ? narrator.speak(f.kind === 'say' ? f.text : studentLine(f.optionId), speed) : Promise.resolve();
    Promise.all([wait, speech]).then(() => {
      if (token.current === my) setFrame((x) => x + 1);
    });
    return () => {
      token.current++;
    };
  }, [playing, done, chapter, frame, ch, speed, voice, narrator]);

  useEffect(() => () => narrator.stop(), [narrator]);
  useEffect(() => {
    logPractice({ island: 'procedural-skills', module: 'start', itemId: 'urinary-catheterization-demo', itemTitle: '導尿管置入｜正確示範', mode: 'demo' });
  }, []);

  const togglePlay = () => {
    if (done) return goChapter(0);
    if (playing) narrator.stop();
    setPlaying((p) => !p);
  };

  const step = getStep(state.activeStep);
  const props: StageProps = { state, dispatch: noop, mode: GUIDED, hintLevel: 3, isMobile, demoHighlight: highlight, demoAreas: hand, demo: true };
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

  const concepts = (
    <>
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
    </>
  );

  return (
    <DragDropProvider>
      <div className="flex h-full flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50">
        <header className="flex items-center gap-2 border-b border-white/60 bg-white/85 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:px-5">
          <button type="button" onClick={onExit} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
            ← 選擇模式
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">
            CATHETER QUEST <span className="font-medium text-slate-400">｜正確示範模式</span>
          </p>
          <span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 sm:block">
            第 {chapter + 1} / {DEMO_CHAPTERS.length} 章
          </span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
          <aside className="shrink-0 border-white/60 p-3 md:w-56 md:overflow-y-auto md:border-r md:bg-white/40">
            <ol className="flex gap-1.5 overflow-x-auto md:flex-col md:overflow-visible">
              {DEMO_CHAPTERS.map((c, i) => (
                <li key={c.id} className="shrink-0">
                  <button type="button" onClick={() => goChapter(i)} className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[12.5px] font-bold transition ${i === chapter ? 'bg-emerald-600 text-white shadow' : 'bg-white/70 text-slate-600 hover:bg-white'}`}>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${i === chapter ? 'bg-white text-emerald-700' : i < chapter ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{i < chapter ? '✓' : i + 1}</span>
                    <span className="whitespace-nowrap">{c.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <main className="relative shrink-0 p-3 md:min-h-0 md:flex-1 md:shrink md:overflow-y-auto md:p-4">
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="text-lg font-black text-slate-800">{ch.title}</h2>
              <span className="text-[11px] font-medium text-slate-400">示範畫面・{step.title}</span>
            </div>
            {ch.videoUrl ? <video src={ch.videoUrl} controls className="w-full rounded-3xl bg-black" /> : <div className="pointer-events-none relative select-none md:min-h-[55vh]">{stage}</div>}

            <div className="sticky bottom-2 z-10 mx-auto mt-3 max-w-3xl space-y-2">
              {bubble && (
                <div key={bubble} className="ml-auto max-w-xl animate-fade-up rounded-2xl rounded-br-sm bg-sky-600 px-4 py-3 text-[13px] leading-relaxed text-white shadow-xl">
                  <p className="mb-1 text-[10px] font-bold tracking-wider text-sky-100">💬 對楊先生說明</p>
                  {bubble}
                  {state.patientLine && <p className="mt-2 rounded-xl bg-white/15 px-3 py-1.5 text-[12px]">🧓 {state.patientLine}</p>}
                </div>
              )}
              {caption && (
                <div key={caption} className="animate-fade-up rounded-2xl bg-slate-900/85 px-5 py-3 text-center text-[15px] font-bold leading-relaxed text-white shadow-xl backdrop-blur md:text-base">
                  {caption}
                </div>
              )}
            </div>
            <div className="mt-3 space-y-2 md:hidden">{concepts}</div>
          </main>

          <aside className="hidden shrink-0 space-y-3 overflow-y-auto border-white/60 p-3 md:block md:w-72 md:border-l md:bg-white/40">
            {concepts}
            <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-slate-200">
              <p className="text-[11px] font-bold tracking-wider text-slate-400">❓ 為什麼？</p>
              {getStep(ch.stepId).why.map((w) => (
                <div key={w.title} className="mt-1.5">
                  <p className="text-[12px] font-bold text-slate-700">{w.title}</p>
                  <p className="text-[12px] leading-relaxed text-slate-600">{w.text}</p>
                </div>
              ))}
            </div>
            <p className="px-1 text-[11px] leading-relaxed text-slate-400">本示範為數位模擬動畫，呈現流程與觀念；阻力、見尿與定位為教學模擬事件。實際手法、力道與臨床細節依院內 SOP，需在模具上實作並由臨床教師指導。</p>
          </aside>
        </div>

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
            <p className="mt-1 text-sm text-slate-500">你已看完導尿管置入的完整正確流程。接下來換你動手操作吧！</p>
            <div className="mt-5 grid gap-2">
              <button type="button" onClick={() => onPractice('guided')} className="rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white">
                🧭 用引導練習模式練習
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
