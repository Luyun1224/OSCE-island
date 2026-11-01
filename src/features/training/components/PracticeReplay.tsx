import { useEffect, useRef, useState } from 'react';
import { formatClock } from '../modes';
import type { TrainingEvent } from '../types';

const ISSUE = new Set(['error', 'contamination', 'order']);
const TONE: Record<string, string> = {
  contamination: 'bg-rose-50 text-rose-800 ring-rose-200',
  error: 'bg-amber-50 text-amber-900 ring-amber-200',
  order: 'bg-amber-50 text-amber-900 ring-amber-200',
  remediation: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  narration: 'bg-sky-50 text-sky-800 ring-sky-100',
};
const LABEL: Record<string, string> = { contamination: '污染', error: '錯誤', order: '順序', remediation: '補救', narration: '溝通', hint: '提示', action: '操作', system: '系統' };

/**
 * PracticeReplay：操作歷程回放
 * 依實際事件時間排列；可自動播放，點擊錯誤事件查看教學說明並直接重練該階段。
 */
export function PracticeReplay({ events, stepTitles, onRetryStep, onWatchDemo }: { events: TrainingEvent[]; stepTitles: Record<string, string>; onRetryStep: (stepId: string) => void; onWatchDemo?: (stepId: string) => void }) {
  const list = events.filter((e) => e.code !== 'pause' && e.code !== 'blocked' && e.kind !== 'hint');
  const [cursor, setCursor] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [onlyIssues, setOnlyIssues] = useState(false);
  const box = useRef<HTMLOListElement>(null);
  const shown = onlyIssues ? list.filter((e) => ISSUE.has(e.kind) || e.kind === 'remediation') : list;

  useEffect(() => {
    if (!playing) return;
    if (cursor >= shown.length - 1) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setCursor((c) => c + 1), 900);
    return () => window.clearTimeout(id);
  }, [playing, cursor, shown.length]);

  useEffect(() => {
    const el = box.current?.querySelector<HTMLElement>(`[data-i="${cursor}"]`);
    if (el && box.current) box.current.scrollTop = el.offsetTop - box.current.offsetTop - 60;
  }, [cursor]);

  return (
    <section className="rounded-3xl bg-white/90 p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-black text-slate-800">🎞️ 操作歷程回放</h2>
        <span className="text-[11px] text-slate-500">時間來自本次實際操作；點擊錯誤事件可看說明並重練該段</span>
        <div className="ml-auto flex gap-1.5">
          <button type="button" onClick={() => setOnlyIssues((v) => !v)} className={`rounded-full px-3 py-1 text-[12px] font-bold ${onlyIssues ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {onlyIssues ? '只看錯誤與補救' : '全部事件'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!playing && cursor >= shown.length - 1) setCursor(-1);
              setPlaying((p) => !p);
            }}
            className="rounded-full bg-blue-700 px-3 py-1 text-[12px] font-bold text-white"
          >
            {playing ? '⏸ 暫停' : cursor >= 0 && cursor < shown.length - 1 ? '▶ 繼續回放' : '▶ 播放'}
          </button>
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="mt-2 text-[13px] text-slate-500">本次沒有可回放的事件。</p>
      ) : (
        <ol ref={box} className="relative mt-3 max-h-96 space-y-1.5 overflow-y-auto border-l-2 border-slate-200 pl-4">
          {shown.map((e, i) => {
            const issue = ISSUE.has(e.kind);
            const active = i === cursor;
            return (
              <li key={e.id} data-i={i} className={`relative transition ${cursor >= 0 && i > cursor ? 'opacity-35' : ''}`}>
                <span className={`absolute -left-[1.4rem] top-2 h-3 w-3 rounded-full ring-2 ring-white ${issue ? 'bg-rose-500' : e.kind === 'remediation' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <button
                  type="button"
                  onClick={() => {
                    setCursor(i);
                    setPlaying(false);
                    setOpen(open === e.id ? null : e.id);
                  }}
                  className={`w-full rounded-xl px-3 py-1.5 text-left text-[12px] ring-1 ${TONE[e.kind] ?? 'bg-white text-slate-600 ring-slate-100'} ${active ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="mr-2 font-mono tabular-nums text-slate-400">{formatClock(e.t)}</span>
                  <span className="mr-1.5 rounded bg-white/70 px-1 text-[10px] font-bold">{LABEL[e.kind] ?? e.kind}</span>
                  {e.safety && <span className="mr-1.5 rounded bg-rose-600 px-1 text-[10px] font-bold text-white">🛑 安全</span>}
                  {stepTitles[e.stepId] && <span className="mr-1.5 text-[10px] font-bold text-slate-400">{stepTitles[e.stepId]}</span>}
                  {e.message}
                </button>
                {open === e.id && (issue || e.why) && (
                  <div className="mt-1 rounded-xl bg-slate-50 p-3 text-[12px] leading-relaxed text-slate-700">
                    {e.why ? <p>📘 {e.why}</p> : <p>這個事件沒有額外說明。</p>}
                    {stepTitles[e.stepId] && (
                      <div className="mt-1 flex flex-wrap gap-3">
                        {onWatchDemo && (
                          <button type="button" onClick={() => onWatchDemo(e.stepId)} className="font-bold text-emerald-700 hover:underline">
                            🎬 觀看對應的正確示範
                          </button>
                        )}
                        <button type="button" onClick={() => onRetryStep(e.stepId)} className="font-bold text-blue-700 hover:underline">
                          ↻ 以引導模式重練「{stepTitles[e.stepId]}」
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
