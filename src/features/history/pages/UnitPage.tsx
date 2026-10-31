import { useState } from 'react';
import { navigate } from '../../../router';
import { ActivityView } from '../activities/ActivityView';
import { FormativeNote, HQShell, PrimaryButton, ReviewBadge, ScoreBar } from '../components/Shell';
import { SOP_UNITS, getUnit } from '../data/sopUnits';
import { recordRun } from '../progress';
import type { ActivityResult } from '../types';

type Stage = { name: 'learn' } | { name: 'practice'; index: number } | { name: 'result' };

/** SOP 單元：核心教學 → 互動練習 → 即時回饋 → 重新練習／回總覽 */
export function UnitPage({ unitId }: { unitId: string }) {
  const unit = getUnit(unitId);
  const [stage, setStage] = useState<Stage>({ name: 'learn' });
  const [results, setResults] = useState<ActivityResult[]>([]);
  const [runKey, setRunKey] = useState(0);

  if (!unit) {
    return (
      <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '找不到單元' }]}>
        <p className="text-slate-600">找不到這個單元。</p>
      </HQShell>
    );
  }

  const next = SOP_UNITS.find((u) => u.order === unit.order + 1);
  const total = results.reduce((s, r) => s + r.score, 0);
  const max = results.reduce((s, r) => s + r.max, 0);

  const onActivityDone = (r: ActivityResult) => {
    const all = [...results.filter((x) => x.activityId !== r.activityId), r];
    setResults(all);
    if (stage.name === 'practice' && stage.index < unit.activities.length - 1) {
      setStage({ name: 'practice', index: stage.index + 1 });
    } else {
      recordRun('unit', unit.id, all);
      setStage({ name: 'result' });
    }
    window.scrollTo?.(0, 0);
  };

  const restart = (toLearn = false) => {
    setResults([]);
    setRunKey((k) => k + 1);
    setStage(toLearn ? { name: 'learn' } : { name: 'practice', index: 0 });
  };

  const steps = ['核心教學', ...unit.activities.map((_, i) => `練習 ${i + 1}`), '回饋'];
  const current = stage.name === 'learn' ? 0 : stage.name === 'practice' ? stage.index + 1 : steps.length - 1;

  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '01 SOP 學院', to: '/history/academy' }, { label: `單元 ${unit.order}` }]}>
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">{unit.icon}</span>
        <div className="min-w-0">
          <p className="text-[11px] font-black tracking-widest text-orange-600">UNIT {unit.order}｜{unit.englishTitle}</p>
          <h1 className="text-2xl font-black text-slate-800 md:text-3xl">{unit.title}</h1>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {unit.frameworks.map((f) => (
            <span key={f} className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800">
              {f}
            </span>
          ))}
          <ReviewBadge review={unit.review} />
        </div>
      </header>

      <ol className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <li key={s} className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${i === current ? 'bg-orange-500 text-white' : i < current ? 'bg-teal-100 text-teal-800' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
            {i < current ? '✓ ' : ''}
            {s}
          </li>
        ))}
      </ol>

      <div className="mt-5">
        {stage.name === 'learn' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {unit.lessons.map((l) => (
                <section key={l.title} className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
                  <h2 className="text-lg font-black text-slate-800">{l.title}</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{l.body}</p>
                  {l.bullets && (
                    <ul className="mt-3 space-y-1.5">
                      {l.bullets.map((b) => (
                        <li key={b} className="flex gap-2 text-[14px] leading-relaxed text-slate-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {(l.good || l.bad) && (
                    <div className="mt-3 space-y-2">
                      {l.good && <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-[13px] leading-relaxed text-emerald-900">👍 {l.good}</p>}
                      {l.bad && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-[13px] leading-relaxed text-rose-900">👎 {l.bad}</p>}
                    </div>
                  )}
                </section>
              ))}
            </div>
            <div className="rounded-3xl bg-teal-700 p-5 text-white shadow-sm">
              <p className="text-[12px] font-black tracking-widest text-teal-200">記住這三件事</p>
              <ul className="mt-2 space-y-1">
                {unit.takeaways.map((t) => (
                  <li key={t} className="text-[15px] font-bold">
                    ✦ {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton tone="orange" onClick={() => setStage({ name: 'practice', index: 0 })}>
                開始練習（{unit.activities.length} 個互動）→
              </PrimaryButton>
              <PrimaryButton tone="ghost" onClick={() => navigate('/history/academy')}>
                ← 返回 SOP 總覽
              </PrimaryButton>
            </div>
          </div>
        )}

        {stage.name === 'practice' && (
          <div>
            <div className="mb-4 rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-orange-100">
              <p className="text-[11px] font-black tracking-widest text-orange-600">
                練習 {stage.index + 1} / {unit.activities.length}
              </p>
              <h2 className="text-xl font-black text-slate-800">{unit.activities[stage.index].title}</h2>
              <p className="mt-1 text-[14px] text-slate-600">{unit.activities[stage.index].intro}</p>
            </div>
            <ActivityView key={`${runKey}-${stage.index}`} activity={unit.activities[stage.index]} onDone={onActivityDone} />
            <div className="mt-4 flex flex-wrap gap-2">
              <PrimaryButton tone="ghost" onClick={() => setStage({ name: 'learn' })}>
                ← 回到教學
              </PrimaryButton>
            </div>
          </div>
        )}

        {stage.name === 'result' && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
              <p className="text-[12px] font-black tracking-widest text-teal-600">單元回饋</p>
              <h2 className="mt-1 text-2xl font-black text-slate-800">
                {max && total / max >= 0.8 ? '做得很好！' : max && total / max >= 0.5 ? '掌握了大部分重點' : '再練一次會更熟練'}
              </h2>
              <div className="mt-3 max-w-md">
                <ScoreBar score={total} max={max} />
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {unit.activities.map((a) => {
                  const r = results.find((x) => x.activityId === a.id);
                  return (
                    <div key={a.id} className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-[13px] font-bold text-slate-700">{a.title}</p>
                      {r && <ScoreBar score={r.score} max={r.max} />}
                    </div>
                  );
                })}
              </div>
              <FormativeNote />
            </div>
            {results.some((r) => r.notes.length) && (
              <div className="rounded-3xl bg-orange-50 p-5 ring-1 ring-orange-200">
                <p className="text-sm font-black text-orange-800">🌱 可以再加強的地方</p>
                <ul className="mt-2 space-y-1.5">
                  {results
                    .flatMap((r) => r.notes)
                    .slice(0, 8)
                    .map((n, i) => (
                      <li key={i} className="text-[13px] leading-relaxed text-slate-700">
                        • {n}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            <div className="rounded-3xl bg-teal-700 p-5 text-white">
              <p className="text-[12px] font-black tracking-widest text-teal-200">本單元重點</p>
              {unit.takeaways.map((t) => (
                <p key={t} className="mt-1 text-[15px] font-bold">
                  ✦ {t}
                </p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton tone="orange" onClick={() => restart(false)}>
                ↺ 重新練習
              </PrimaryButton>
              <PrimaryButton tone="ghost" onClick={() => restart(true)}>
                重看教學
              </PrimaryButton>
              {next && (
                <PrimaryButton tone="teal" onClick={() => navigate(`/history/academy/${next.id}`)}>
                  下一單元：{next.title} →
                </PrimaryButton>
              )}
              <PrimaryButton tone="ghost" onClick={() => navigate('/history/academy')}>
                返回 SOP 總覽
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </HQShell>
  );
}
