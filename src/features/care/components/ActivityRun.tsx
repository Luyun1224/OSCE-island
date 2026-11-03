import { useState } from 'react';
import { ActivityView, ACTIVITY_KIND_LABEL } from '../../history/activities/ActivityView';
import { FormativeNote, PrimaryButton, ScoreBar } from '../../history/components/Shell';
import type { Activity, ActivityResult } from '../../history/types';

/** 依序執行多個互動練習，結束後顯示形成性結果（重練／返回） */
export function ActivityRun({ activities, onFinish, finishSlot }: { activities: Activity[]; onFinish: (r: ActivityResult[]) => void; finishSlot?: (r: ActivityResult[], retry: () => void) => React.ReactNode }) {
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<ActivityResult[]>([]);
  const [run, setRun] = useState(0);
  const done = idx >= activities.length;

  const retry = () => {
    setIdx(0);
    setResults([]);
    setRun((r) => r + 1);
  };

  if (done) {
    const score = results.reduce((s, r) => s + r.score, 0);
    const max = results.reduce((s, r) => s + r.max, 0);
    return (
      <div className="animate-fade-up space-y-4">
        <div className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-orange-100">
          <p className="text-[12px] font-black tracking-widest text-orange-600">練習結果｜模擬形成性評量</p>
          <div className="mt-2">
            <ScoreBar score={score} max={max} />
          </div>
          <ul className="mt-3 space-y-1.5 text-[13px] text-slate-600">
            {results.flatMap((r) => r.notes).slice(0, 8).map((n, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-teal-600">•</span>
                {n}
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <FormativeNote />
          </div>
        </div>
        {finishSlot ? finishSlot(results, retry) : <PrimaryButton onClick={retry}>↺ 再練一次</PrimaryButton>}
      </div>
    );
  }

  const a = activities[idx];
  return (
    <div key={`${run}-${idx}`}>
      <div className="mb-3 rounded-3xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-orange-100">
        <p className="text-[11px] font-black tracking-widest text-orange-600">
          {activities.length > 1 ? `第 ${idx + 1} / ${activities.length} 關｜` : ''}
          {ACTIVITY_KIND_LABEL[a.kind]}
        </p>
        <h2 className="text-lg font-black text-slate-800">{a.title}</h2>
        <p className="mt-0.5 text-[13.5px] leading-relaxed text-slate-600">{a.intro}</p>
      </div>
      <ActivityView
        activity={a}
        onDone={(r) => {
          const all = [...results, r];
          setResults(all);
          setIdx(idx + 1);
          if (idx + 1 >= activities.length) onFinish(all);
          window.scrollTo?.(0, 0);
        }}
      />
    </div>
  );
}
