import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { TrainingModeId } from '../types';
import { useNarrator } from '../useNarrator';

/**
 * DemonstrationPlayer：資料驅動的正確示範時間軸（技能共用）
 *
 * NarrationTrack：每一句字幕（cue）依序朗讀；有 narrationAudio 時改播放錄音檔。
 * SubtitleTrack：畫面上的字幕永遠是「正在朗讀的那一句」。
 * 同步原則：一個步驟要等「最短動畫時間」與「旁白」都結束才前進，
 * 每一句字幕開始時才套用該句的動畫動作，因此旁白不會跑到畫面前面。
 * ChapterNavigator：可跳到任一章節或步驟；跳轉時以確定性的動作序列重建畫面狀態。
 */
export interface DemoCue<A> {
  text: string;
  /** 這一句旁白開始時套用的動畫動作 */
  actions?: A[];
}

export interface DemoStep<A, Cam extends string = string> {
  stepId: string;
  /** 對應練習模式的階段（觀看示範、回饋連結用） */
  practiceStepId: string;
  title: string;
  /** 最短時間（毫秒，1 倍速） */
  duration: number;
  narrationText: string;
  /** 已審核的錄音檔（選填）；沒有時使用瀏覽器語音 */
  narrationAudio?: string;
  subtitles: string[];
  cues: DemoCue<A>[];
  cameraPreset: Cam;
  /** 步驟開始時套用的動畫動作 */
  animationAction: A[];
  highlightedObjects: string[];
  teachingPoints: string[];
  safetyNotes: string[];
  /** case：教案原始要求；supplement：現行臨床安全補充 */
  source: 'case' | 'supplement';
}

export interface DemoChapterDef<A, Cam extends string = string> {
  id: string;
  title: string;
  steps: DemoStep<A, Cam>[];
  /** 已審核的實拍影片（選填，有則優先播放） */
  videoUrl?: string;
}

/** 由字幕陣列建立步驟（narrationText、subtitles 自動同步） */
export function demoStep<A, Cam extends string>(s: Omit<DemoStep<A, Cam>, 'narrationText' | 'subtitles'>): DemoStep<A, Cam> {
  return { ...s, narrationText: s.cues.map((c) => c.text).join(''), subtitles: s.cues.map((c) => c.text) };
}

export const DEMO_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface Pos {
  chapter: number;
  step: number;
}

export function DemonstrationPlayer<S, A, Cam extends string>({
  title,
  chapters,
  initialState,
  apply,
  renderView,
  start,
  reviewBanner,
  onExit,
  onPractice,
  onWatched,
  exitLabel = '← 選擇模式',
  summary,
}: {
  title: string;
  chapters: DemoChapterDef<A, Cam>[];
  initialState: () => S;
  apply: (s: S, a: A) => S;
  renderView: (ctx: { state: S; step: DemoStep<A, Cam>; highlighted: string[]; cue: number }) => ReactNode;
  start?: { chapter: number; step?: number };
  reviewBanner?: ReactNode;
  onExit: () => void;
  onPractice?: (m: TrainingModeId) => void;
  onWatched?: () => void;
  exitLabel?: string;
  /** 示範完成後的重點摘要 */
  summary?: string[];
}) {
  const narrator = useNarrator();
  const [pos, setPos] = useState<Pos>({ chapter: start?.chapter ?? 0, step: start?.step ?? 0 });
  const [cue, setCue] = useState(-1);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState(true);
  const [done, setDone] = useState(false);
  const token = useRef(0);
  const audio = useRef<HTMLAudioElement | null>(null);

  const flat = useMemo(() => chapters.flatMap((c, ci) => c.steps.map((s, si) => ({ ci, si, s }))), [chapters]);
  const indexOf = (p: Pos) => flat.findIndex((f) => f.ci === p.chapter && f.si === p.step);

  /** 指定步驟開始前的畫面狀態（確定性重建） */
  const stateBefore = useCallback(
    (p: Pos) => {
      let s = initialState();
      for (const f of flat) {
        if (f.ci === p.chapter && f.si === p.step) break;
        for (const a of f.s.animationAction) s = apply(s, a);
        for (const c of f.s.cues) for (const a of c.actions ?? []) s = apply(s, a);
      }
      return s;
    },
    [flat, initialState, apply],
  );

  const [state, setState] = useState<S>(() => stateBefore(pos));
  const chapter = chapters[pos.chapter];
  const step = chapter.steps[pos.step];

  const stopMedia = useCallback(() => {
    narrator.stop();
    audio.current?.pause();
  }, [narrator]);

  const jump = useCallback(
    (p: Pos, autoplay = true) => {
      stopMedia();
      token.current++;
      setState(stateBefore(p));
      setPos(p);
      setCue(-1);
      setDone(false);
      setPlaying(autoplay);
    },
    [stateBefore, stopMedia],
  );

  // 播放主迴圈：一次處理一個步驟
  useEffect(() => {
    if (!playing || done) return;
    const my = ++token.current;
    const alive = () => token.current === my;
    const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
    (async () => {
      const t0 = performance.now();
      setState((s) => step.animationAction.reduce(apply, s));
      if (step.narrationAudio && voice) {
        // 錄音檔：字幕依錄音長度平均分配
        const el = new Audio(step.narrationAudio);
        audio.current = el;
        el.playbackRate = speed;
        const ended = new Promise<void>((r) => {
          el.onended = () => r();
          el.onerror = () => r();
        });
        await el.play().catch(() => undefined);
        const per = ((el.duration || step.duration / 1000) * 1000) / speed / Math.max(1, step.cues.length);
        for (let i = 0; i < step.cues.length && alive(); i++) {
          setCue(i);
          setState((s) => (step.cues[i].actions ?? []).reduce(apply, s));
          await sleep(per);
        }
        await ended;
      } else {
        for (let i = 0; i < step.cues.length; i++) {
          if (!alive()) return;
          setCue(i);
          setState((s) => (step.cues[i].actions ?? []).reduce(apply, s));
          const c = step.cues[i];
          const minRead = Math.max(1600, c.text.length * 210) / speed;
          await Promise.all([sleep(minRead), voice ? narrator.speak(c.text, speed) : Promise.resolve()]);
        }
      }
      const left = step.duration / speed - (performance.now() - t0);
      if (left > 0) await sleep(left);
      if (!alive()) return;
      const i = indexOf(pos);
      if (i < flat.length - 1) {
        const n = flat[i + 1];
        setPos({ chapter: n.ci, step: n.si });
        setCue(-1);
      } else {
        setDone(true);
        setPlaying(false);
        onWatched?.();
      }
    })();
    return () => {
      token.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, done, pos, speed, voice]);

  useEffect(() => () => stopMedia(), [stopMedia]);

  const toggle = () => {
    if (done) return jump({ chapter: 0, step: 0 });
    if (playing) stopMedia();
    setPlaying((p) => !p);
  };

  const index = indexOf(pos);
  const subtitle = cue >= 0 ? step.cues[cue]?.text : '';

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50">
      <header className="flex items-center gap-2 border-b border-white/60 bg-white/85 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:px-5">
        <button type="button" onClick={onExit} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
          {exitLabel}
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">
          {title} <span className="font-medium text-slate-400">｜正確示範模式</span>
        </p>
        <span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 sm:block">
          CHAPTER {String(pos.chapter + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* ChapterNavigator */}
        <aside className="shrink-0 border-white/60 p-3 md:w-60 md:overflow-y-auto md:border-r md:bg-white/40">
          <ol className="flex gap-1.5 overflow-x-auto md:flex-col md:overflow-visible">
            {chapters.map((c, ci) => (
              <li key={c.id} className="shrink-0">
                <button type="button" onClick={() => jump({ chapter: ci, step: 0 })} className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[12.5px] font-bold transition ${ci === pos.chapter ? 'bg-emerald-600 text-white shadow' : 'bg-white/70 text-slate-600 hover:bg-white'}`}>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${ci === pos.chapter ? 'bg-white text-emerald-700' : ci < pos.chapter ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{ci < pos.chapter ? '✓' : ci + 1}</span>
                  <span className="whitespace-nowrap">{c.title}</span>
                </button>
                {ci === pos.chapter && (
                  <ul className="mt-1 hidden space-y-0.5 pl-7 md:block">
                    {c.steps.map((s, si) => (
                      <li key={s.stepId}>
                        <button type="button" onClick={() => jump({ chapter: ci, step: si })} className={`w-full rounded-lg px-2 py-0.5 text-left text-[11.5px] ${si === pos.step ? 'bg-emerald-100 font-bold text-emerald-800' : 'text-slate-500 hover:bg-white'}`}>
                          {s.source === 'supplement' && '➕ '}
                          {s.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </aside>

        <main className="relative shrink-0 p-3 md:min-h-0 md:flex-1 md:shrink md:overflow-y-auto md:p-4">
          {reviewBanner}
          <div className="mb-2 flex flex-wrap items-baseline gap-2">
            <h2 className="text-lg font-black text-slate-800">{step.title}</h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${step.source === 'supplement' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-600'}`}>{step.source === 'supplement' ? '現行臨床安全補充（不在教案評分內）' : '教案原始要求'}</span>
          </div>
          {chapter.videoUrl ? <video src={chapter.videoUrl} controls className="w-full rounded-3xl bg-black" /> : <div className="pointer-events-none select-none">{renderView({ state, step, highlighted: step.highlightedObjects, cue })}</div>}

          <div className="sticky bottom-2 z-10 mx-auto mt-3 max-w-3xl space-y-2">
            {step.safetyNotes.length > 0 && cue >= 0 && (
              <div className="animate-fade-up rounded-2xl border-2 border-rose-400 bg-rose-50/95 px-4 py-2 text-[13px] font-bold text-rose-800 shadow-lg">
                ⚠️ 安全提醒：{step.safetyNotes.join('；')}
              </div>
            )}
            {subtitle && (
              <div key={subtitle} className="animate-fade-up rounded-2xl bg-slate-900/85 px-5 py-3 text-center text-[15px] font-bold leading-relaxed text-white shadow-xl backdrop-blur md:text-base">
                {subtitle}
              </div>
            )}
          </div>
        </main>

        <aside className="shrink-0 space-y-3 p-3 md:w-72 md:overflow-y-auto md:border-l md:border-white/60 md:bg-white/40">
          <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
            <p className="text-[11px] font-bold tracking-wider text-emerald-700">✅ 臨床觀念</p>
            <ul className="mt-1.5 space-y-1.5 text-[13px] leading-relaxed text-slate-700">
              {step.teachingPoints.map((k) => (
                <li key={k} className="flex gap-1.5">
                  <span className="text-emerald-600">•</span>
                  {k}
                </li>
              ))}
            </ul>
          </div>
          {step.highlightedObjects.some((h) => !h.startsWith('#')) && (
            <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-slate-200">
              <p className="text-[11px] font-bold tracking-wider text-slate-400">🔎 本段重點器材</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {step.highlightedObjects.filter((h) => !h.startsWith('#')).map((h) => (
                  <span key={h} className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
          <details className="rounded-2xl bg-white/80 p-3 text-[12px] text-slate-600 ring-1 ring-slate-200">
            <summary className="cursor-pointer font-bold text-slate-500">📝 本步驟完整旁白</summary>
            <p className="mt-1 leading-relaxed">{step.narrationText}</p>
          </details>
        </aside>
      </div>

      <footer className="border-t border-white/60 bg-white/90 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:px-5">
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${((index + (done ? 1 : 0)) / flat.length) * 100}%` }} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={pos.chapter === 0} onClick={() => jump({ chapter: pos.chapter - 1, step: 0 })} className="rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40">
            ⏮ 上一章
          </button>
          <button type="button" onClick={toggle} className="min-w-[6.5rem] rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white shadow hover:bg-emerald-700">
            {done ? '↺ 重新觀看' : playing ? '⏸ 暫停' : '▶ 播放'}
          </button>
          <button type="button" disabled={pos.chapter === chapters.length - 1} onClick={() => jump({ chapter: pos.chapter + 1, step: 0 })} className="rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40">
            下一章 ⏭
          </button>
          <button type="button" onClick={() => jump({ chapter: pos.chapter, step: 0 })} className="rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200">
            ↺ 重播本章
          </button>
          <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-1">
            {DEMO_SPEEDS.map((s) => (
              <button key={s} type="button" onClick={() => setSpeed(s)} className={`rounded-lg px-1.5 py-1 text-[12px] font-bold ${speed === s ? 'bg-white text-emerald-700 shadow' : 'text-slate-500'}`}>
                {s}x
              </button>
            ))}
          </div>
          {narrator.supported && (
            <button
              type="button"
              onClick={() => {
                if (voice) stopMedia();
                setVoice((v) => !v);
              }}
              className={`rounded-xl px-3 py-2 text-[13px] font-bold ring-1 ${voice ? 'bg-sky-600 text-white ring-sky-600' : 'bg-white text-slate-700 ring-slate-200'}`}
            >
              {voice ? '🔊 旁白開' : '🔈 旁白關'}
            </button>
          )}
        </div>
      </footer>

      {done && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="text-5xl">🎬</div>
            <h3 className="mt-2 text-xl font-black text-slate-800">示範完成</h3>
            {summary && (
              <ol className="mt-3 space-y-1 text-left text-[13px] text-slate-700">
                {summary.map((s, i) => (
                  <li key={s} className="flex gap-2">
                    <span className="font-bold text-emerald-600">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-5 grid gap-2">
              {onPractice ? (
                <>
                  <button type="button" onClick={() => onPractice('guided')} className="rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white">
                    🧭 進入教學引導模式
                  </button>
                  <button type="button" onClick={() => onPractice('independent')} className="rounded-xl bg-blue-800 py-2.5 text-sm font-bold text-white">
                    🛠️ 自主練習
                  </button>
                  <button type="button" onClick={() => onPractice('challenge')} className="rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white">
                    ⏱️ OSCE 模擬挑戰
                  </button>
                </>
              ) : (
                <button type="button" onClick={onExit} className="rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white">
                  回到練習
                </button>
              )}
              <button type="button" onClick={() => jump({ chapter: 0, step: 0 })} className="rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600">
                ↺ 重新觀看示範
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
