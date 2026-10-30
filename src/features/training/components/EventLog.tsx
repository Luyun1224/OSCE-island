import { useEffect, useRef } from 'react';
import { formatClock } from '../modes';
import type { EventKind, TrainingEvent } from '../types';

const ICON: Record<EventKind, string> = {
  action: '•',
  error: '⚠️',
  contamination: '🦠',
  remediation: '🔁',
  order: '↕️',
  narration: '💬',
  hint: '💡',
  system: 'ℹ️',
};

/**
 * 操作紀錄區
 * 引導模式顯示全部事件（含錯誤原因）；自主 / 挑戰模式只顯示學生做了什麼，不揭露對錯。
 */
export function EventLog({ events, revealJudgement }: { events: TrainingEvent[]; revealJudgement: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const visible = events.filter((e) => e.code !== 'pause' && (revealJudgement || !['error', 'contamination', 'order'].includes(e.kind)) && e.code !== 'blocked');
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [visible.length]);
  return (
    <div ref={box} className="max-h-48 space-y-1 overflow-y-auto pr-1 text-[11px] md:max-h-72">
      {visible.length === 0 && <p className="text-slate-400">尚無操作紀錄</p>}
      {visible.map((e) => (
        <div key={e.id} className={`flex gap-2 rounded-lg px-2 py-1 ${e.kind === 'contamination' ? 'bg-rose-50 text-rose-700' : e.kind === 'error' || e.kind === 'order' ? 'bg-amber-50 text-amber-800' : 'text-slate-600'}`}>
          <span className="shrink-0 tabular-nums text-slate-400">{formatClock(e.t)}</span>
          <span className="shrink-0">{ICON[e.kind]}</span>
          <span className="min-w-0 break-words">{e.message.length > 60 ? `${e.message.slice(0, 60)}…` : e.message}</span>
        </div>
      ))}
    </div>
  );
}
