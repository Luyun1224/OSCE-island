import { useMemo, useState } from 'react';
import { PrimaryButton, shuffle } from '../components/Shell';
import type { ActivityResult, MultiPickActivity } from '../types';

const PRIORITY = {
  high: { label: '優先', cls: 'bg-emerald-100 text-emerald-800' },
  medium: { label: '稍後補問', cls: 'bg-amber-100 text-amber-800' },
  low: { label: '較低', cls: 'bg-slate-100 text-slate-600' },
} as const;

/** 優先順序多選：在情境限制下挑出最該先問的項目 */
export function MultiPickActivityView({ activity, onDone }: { activity: MultiPickActivity; onDone: (r: ActivityResult) => void }) {
  const options = useMemo(() => shuffle(activity.options), [activity]);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const highs = activity.options.filter((o) => o.priority === 'high');
  const max = Math.min(activity.pick, highs.length);
  const score = picked.filter((id) => activity.options.find((o) => o.id === id)?.priority === 'high').length;

  const toggle = (id: string) => {
    if (checked) return;
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < activity.pick ? [...p, id] : p));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-orange-100">
        <p className="text-[11px] font-bold tracking-wider text-orange-600">臨床情境</p>
        <p className="mt-1 text-[15px] font-bold leading-relaxed text-slate-800">{activity.scenario}</p>
        <p className="mt-2 text-[12px] text-slate-500">
          已選 {picked.length} / {activity.pick}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const on = picked.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={`rounded-2xl border-2 px-4 py-3 text-left text-[14px] leading-relaxed transition ${on ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-300'}`}
            >
              <span className="flex items-start gap-2">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[12px] ${on ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'}`}>{on ? '✓' : ''}</span>
                <span className="text-slate-800">{o.text}</span>
              </span>
              {checked && (
                <span className="mt-2 block text-[12px] text-slate-600">
                  <span className={`mr-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${PRIORITY[o.priority].cls}`}>{PRIORITY[o.priority].label}</span>
                  {o.explain}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!checked ? (
        <PrimaryButton disabled={picked.length !== activity.pick} onClick={() => setChecked(true)} tone="orange">
          確認選擇
        </PrimaryButton>
      ) : (
        <div className="space-y-3">
          <p className="rounded-xl bg-teal-600/10 px-3 py-2 text-[13px] font-bold text-teal-800">📌 {activity.takeaway}</p>
          <PrimaryButton
            tone="orange"
            onClick={() =>
              onDone({
                activityId: activity.id,
                score,
                max,
                notes: highs.filter((h) => !picked.includes(h.id)).map((h) => `優先病史遺漏：${h.text}（${h.explain}）`),
              })
            }
          >
            完成這個練習 →
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
