import { useMemo, useState } from 'react';
import { PrimaryButton, shuffle } from '../components/Shell';
import type { ActivityResult, SequenceActivity, SequenceCard } from '../types';

const conflict = (a: SequenceCard, b: SequenceCard) => a.rank[0] > b.rank[1];

/**
 * 找出「需要移動」的卡片：保留目前順序下最大的一組彼此相容的卡片，其餘才標示。
 * （A 在 B 前面但 A 最早的階段晚於 B 最晚的階段，即為不相容）
 * 卡片數少（≤ 16），直接列舉所有子集合即可。
 */
export function sequenceIssues(order: SequenceCard[]) {
  const n = order.length;
  let bestMask = 0;
  let bestSize = -1;
  for (let mask = 0; mask < 1 << n; mask++) {
    let size = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) size++;
    if (size <= bestSize) continue;
    let ok = true;
    for (let i = 0; i < n && ok; i++) {
      if (!(mask & (1 << i))) continue;
      for (let j = i + 1; j < n; j++) {
        if (mask & (1 << j) && conflict(order[i], order[j])) {
          ok = false;
          break;
        }
      }
    }
    if (ok) {
      bestSize = size;
      bestMask = mask;
    }
  }
  return new Set(order.filter((_, i) => !(bestMask & (1 << i))).map((c) => c.id));
}

/**
 * 彈性排序：不要求唯一正確順序。
 * 每張卡片有可接受的階段範圍，只有明顯違反基本架構的前後關係才標示。
 */
export function SequenceActivityView({ activity, onDone }: { activity: SequenceActivity; onDone: (r: ActivityResult) => void }) {
  const initial = useMemo(() => shuffle(activity.cards), [activity]);
  const [order, setOrder] = useState(initial);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const bad = sequenceIssues(order);

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const n = [...order];
    [n[i], n[j]] = [n[j], n[i]];
    setOrder(n);
    setChecked(false);
  };

  const tap = (i: number) => {
    if (sel === null) return setSel(i);
    if (sel !== i) {
      const n = [...order];
      [n[sel], n[i]] = [n[i], n[sel]];
      setOrder(n);
      setChecked(false);
    }
    setSel(null);
  };

  const phaseLabel = (c: SequenceCard) => (c.rank[0] === c.rank[1] ? activity.phases[c.rank[0] - 1] : `${activity.phases[c.rank[0] - 1]}～${activity.phases[c.rank[1] - 1]}`);
  const reference = [...activity.cards].sort((a, b) => a.rank[0] - b.rank[0] || a.rank[1] - b.rank[1]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {activity.phases.map((p, i) => (
          <span key={p} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
            {i + 1}. {p}
          </span>
        ))}
      </div>
      <ol className="space-y-2">
        {order.map((c, i) => {
          const isBad = checked && bad.has(c.id);
          return (
            <li
              key={c.id}
              className={`flex items-center gap-2 rounded-2xl border-2 bg-white px-3 py-2.5 shadow-sm transition ${sel === i ? 'border-orange-400 bg-orange-50' : isBad ? 'border-rose-300 bg-rose-50' : checked ? 'border-emerald-300 bg-emerald-50/60' : 'border-transparent'}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[12px] font-black text-white">{i + 1}</span>
              <button type="button" onClick={() => tap(i)} className="min-w-0 flex-1 text-left text-[14px] text-slate-800">
                {c.text}
                {checked && (
                  <span className={`mt-0.5 block text-[12px] ${isBad ? 'text-rose-700' : 'text-slate-500'}`}>
                    {isBad ? '⚠ ' : '✓ '}建議階段：{phaseLabel(c)}。{c.note}
                  </span>
                )}
              </button>
              <div className="flex flex-col gap-0.5">
                <button type="button" aria-label="上移" onClick={() => move(i, -1)} className="rounded-lg bg-slate-100 px-2 text-[12px] text-slate-600 hover:bg-slate-200">
                  ▲
                </button>
                <button type="button" aria-label="下移" onClick={() => move(i, 1)} className="rounded-lg bg-slate-100 px-2 text-[12px] text-slate-600 hover:bg-slate-200">
                  ▼
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      {!checked ? (
        <PrimaryButton onClick={() => setChecked(true)} tone="orange">
          檢查流程
        </PrimaryButton>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-base font-black text-slate-800">{bad.size === 0 ? '流程合理！' : `有 ${bad.size} 張卡片需要移動位置`}</p>
            <p className="mt-1 text-[13px] text-slate-600">{activity.takeaway}</p>
            <details className="mt-2 text-[13px] text-slate-600">
              <summary className="cursor-pointer font-bold text-teal-700">查看一種參考流程</summary>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                {reference.map((c) => (
                  <li key={c.id}>
                    {c.text}
                    {c.rank[0] !== c.rank[1] && <span className="text-[11px] text-orange-600">（彈性）</span>}
                  </li>
                ))}
              </ol>
            </details>
          </div>
          <div className="flex flex-wrap gap-2">
            <PrimaryButton
              tone="orange"
              onClick={() =>
                onDone({
                  activityId: activity.id,
                  score: activity.cards.length - bad.size,
                  max: activity.cards.length,
                  notes: order.filter((c) => bad.has(c.id)).map((c) => `流程：「${c.text}」建議在${phaseLabel(c)}階段。${c.note}`),
                })
              }
            >
              完成這個練習 →
            </PrimaryButton>
            <PrimaryButton tone="ghost" onClick={() => setChecked(false)}>
              繼續調整
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
