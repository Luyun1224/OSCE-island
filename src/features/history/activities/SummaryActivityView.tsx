import { useMemo, useState } from 'react';
import { PrimaryButton, shuffle } from '../components/Shell';
import type { ActivityResult, SummaryActivity } from '../types';
import { ChoiceStepView } from './ChoiceActivityView';

const TYPE_LABEL = { positive: '重要陽性', negative: '重要陰性', concern: '病人擔憂', irrelevant: '與主訴無關', incorrect: '資訊錯誤' } as const;
const POINTS = { best: 2, ok: 1, poor: 0 } as const;

/**
 * 病史摘要挑戰：依「內容是否適當」評估（選入了哪些資訊），而非比對固定用詞。
 * 接著選擇結束問診的方式。
 */
export function SummaryActivityView({ activity, onDone }: { activity: SummaryActivity; onDone: (r: ActivityResult) => void }) {
  const facts = useMemo(() => shuffle(activity.facts), [activity]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [stage, setStage] = useState<'build' | 'review' | 'closing'>('build');
  const [closing, setClosing] = useState<string | null>(null);

  const keys = activity.facts.filter((f) => f.key);
  const keyIn = keys.filter((f) => chosen.includes(f.id));
  const wrongIn = activity.facts.filter((f) => !f.key && chosen.includes(f.id));
  const summaryScore = Math.max(0, keyIn.length - wrongIn.length);

  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <div className="space-y-4">
      {stage !== 'closing' && (
        <>
          <div className="rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-orange-100">
            <p className="text-[15px] font-bold leading-relaxed text-slate-800">{activity.context}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-[12px] font-bold text-slate-500">問診中取得的資訊（點選加入摘要）</p>
              <div className="space-y-2">
                {facts.map((f) => {
                  const on = chosen.includes(f.id);
                  const reviewed = stage === 'review';
                  return (
                    <button
                      key={f.id}
                      type="button"
                      disabled={reviewed}
                      onClick={() => toggle(f.id)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-[13px] ring-1 transition ${on ? 'bg-teal-50 ring-teal-400' : 'bg-white ring-slate-200 hover:ring-teal-300'} ${reviewed ? 'cursor-default' : ''}`}
                    >
                      <span className="text-slate-800">
                        {on ? '☑' : '☐'} {f.text}
                      </span>
                      {reviewed && (
                        <span className={`mt-1 block text-[12px] ${f.key ? (on ? 'text-emerald-700' : 'text-orange-700') : on ? 'text-rose-700' : 'text-slate-500'}`}>
                          {TYPE_LABEL[f.type]}・{f.key ? (on ? '✓ 有放進摘要' : '△ 應該放進摘要') : on ? '✗ 不應放進摘要' : '✓ 沒有放進摘要'}：{f.explain}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl bg-[#fffaf2] p-4 ring-1 ring-orange-200">
              <p className="text-[12px] font-bold text-orange-700">📝 我的摘要</p>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-700">
                {chosen.length === 0 ? (
                  <span className="text-slate-400">尚未選擇內容</span>
                ) : (
                  <>
                    「我整理一下您剛剛說的：
                    {chosen.map((id) => activity.facts.find((f) => f.id === id)!.text).join('；')}。」
                  </>
                )}
              </p>
              {stage === 'review' && (
                <div className="mt-3 rounded-2xl bg-white p-3 text-[13px] text-slate-700 ring-1 ring-slate-100">
                  <p className="font-black">
                    重要資訊 {keyIn.length}/{keys.length}・不需要的內容 {wrongIn.length} 項
                  </p>
                  <p className="mt-1 text-slate-600">好的摘要涵蓋主訴與時間、重要陽性與陰性發現，並說出病人的擔憂；錯誤或無關的資訊會模糊重點。</p>
                </div>
              )}
            </div>
          </div>
          {stage === 'build' ? (
            <PrimaryButton disabled={chosen.length === 0} onClick={() => setStage('review')} tone="orange">
              完成摘要
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={() => setStage('closing')} tone="orange">
              下一步：結束問診 →
            </PrimaryButton>
          )}
        </>
      )}

      {stage === 'closing' && (
        <ChoiceStepView
          step={activity.closing}
          first={closing}
          onFirst={setClosing}
          footer={
            <PrimaryButton
              tone="orange"
              onClick={() => {
                const c = activity.closing.options.find((o) => o.id === closing)!;
                onDone({
                  activityId: activity.id,
                  score: summaryScore + POINTS[c.quality],
                  max: keys.length + 2,
                  notes: [
                    ...keys.filter((k) => !chosen.includes(k.id)).map((k) => `摘要遺漏：${k.text}`),
                    ...wrongIn.map((w) => `摘要不應包含：${w.text}（${TYPE_LABEL[w.type]}）`),
                    ...(c.quality !== 'best' ? [`結束問診：${c.feedback}`] : []),
                  ],
                });
              }}
            >
              完成這個練習 →
            </PrimaryButton>
          }
        />
      )}
    </div>
  );
}
