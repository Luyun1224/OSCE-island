import { useEffect, useMemo, useRef, useState } from 'react';
import { PatientAvatar } from '../components/PatientAvatar';
import { PrimaryButton, shuffle } from '../components/Shell';
import type { ActivityResult, ClueActivity, Mood } from '../types';

const FLAG_LABEL = { leading: '誘導性提問', stacked: '一次問太多', 'low-yield': '關聯性低' } as const;

/** 線索收集：選問題 → 病人回答 → 線索進入記錄板（提問次數有限） */
export function ClueActivityView({ activity, onDone }: { activity: ClueActivity; onDone: (r: ActivityResult) => void }) {
  const questions = useMemo(() => shuffle(activity.questions), [activity]);
  const [asked, setAsked] = useState<string[]>([]);
  const [ended, setEnded] = useState(false);
  const chat = useRef<HTMLDivElement>(null);
  const left = activity.budget - asked.length;
  const askedQs = asked.map((id) => activity.questions.find((q) => q.id === id)!);
  const clues = (dim: string) => askedQs.filter((q) => q.dimension === dim && q.clue);
  const mood: Mood = asked.length === 0 ? 'pained' : askedQs[askedQs.length - 1].flag ? 'confused' : 'pained';

  useEffect(() => {
    if (chat.current) chat.current.scrollTop = chat.current.scrollHeight;
  }, [asked.length]);

  useEffect(() => {
    if (left === 0) setEnded(true);
  }, [left]);

  const opqrst = activity.dimensions.filter((d) => d.id !== 'A');
  const covered = opqrst.filter((d) => clues(d.id).length > 0);
  const assoc = clues('A').length;
  const score = covered.length + Math.min(2, assoc);
  const max = opqrst.length + 2;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        {/* 對話 */}
        <div className="flex flex-col rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-orange-100">
          <div className="flex items-center gap-3">
            <PatientAvatar look={activity.patient} mood={mood} size={84} />
            <div>
              <p className="text-sm font-black text-slate-800">
                {activity.patient.name}・{activity.patient.age} 歲
              </p>
              <p className="text-[14px] text-slate-600">{activity.complaint}</p>
            </div>
            <span className={`ml-auto rounded-full px-3 py-1 text-[12px] font-black ${left <= 2 ? 'bg-orange-100 text-orange-700' : 'bg-teal-50 text-teal-700'}`}>剩 {left} 次提問</span>
          </div>
          <div ref={chat} className="mt-3 max-h-72 min-h-[8rem] space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-3">
            {askedQs.length === 0 && <p className="text-[13px] text-slate-400">從右側選擇你要問的問題。</p>}
            {askedQs.map((q) => (
              <div key={q.id} className="space-y-1">
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-teal-600 px-3 py-1.5 text-[13px] text-white">{q.text}</p>
                <p className="w-fit max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-1.5 text-[13px] text-slate-700 ring-1 ring-slate-200">{q.answer}</p>
                {ended && q.flag && <p className="text-[11px] font-bold text-orange-600">⚠ {FLAG_LABEL[q.flag]}：{q.explain}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* 記錄板 */}
        <div className="rounded-3xl bg-[#0f3b3a] p-4 text-white shadow-sm">
          <p className="text-[11px] font-bold tracking-widest text-teal-200">症狀線索記錄板</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {opqrst.map((d) => {
              const c = clues(d.id);
              return (
                <div key={d.id} className={`rounded-xl p-2 transition ${c.length ? 'bg-teal-500/30 ring-1 ring-teal-300' : 'bg-white/5 ring-1 ring-white/10'}`}>
                  <p className={`text-xl font-black ${c.length ? 'text-teal-200' : 'text-white/30'}`}>{d.short}</p>
                  <p className="text-[10px] text-white/60">{d.label}</p>
                  {c.map((x) => (
                    <p key={x.id} className="mt-1 text-[11px] leading-snug text-white">
                      {x.clue}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="mt-2 rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
            <p className="text-[10px] font-bold text-orange-200">＋ 伴隨症狀</p>
            {clues('A').length === 0 && <p className="text-[11px] text-white/40">尚未取得</p>}
            {clues('A').map((x) => (
              <p key={x.id} className="text-[11px] text-white">
                • {x.clue}
              </p>
            ))}
          </div>
        </div>
      </div>

      {!ended ? (
        <div className="rounded-3xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-100">
          <p className="mb-2 text-[12px] font-bold text-slate-500">你想問什麼？</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {questions
              .filter((q) => !asked.includes(q.id))
              .map((q) => (
                <button key={q.id} type="button" onClick={() => setAsked((a) => [...a, q.id])} className="rounded-xl bg-white px-3 py-2.5 text-left text-[13px] text-slate-800 ring-1 ring-slate-200 transition hover:bg-teal-50 hover:ring-teal-300">
                  {q.text}
                </button>
              ))}
          </div>
          <div className="mt-3">
            <PrimaryButton tone="ghost" onClick={() => setEnded(true)}>
              我問完了
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-base font-black text-slate-800">
              收集到 OPQRST {covered.length}/{opqrst.length} 個面向・伴隨症狀 {assoc} 項
            </p>
            {covered.length < opqrst.length && (
              <p className="mt-1 text-[13px] text-orange-700">
                尚未問到：{opqrst.filter((d) => !covered.includes(d)).map((d) => d.label).join('、')}
              </p>
            )}
            {askedQs.some((q) => q.flag) && <p className="mt-1 text-[13px] text-slate-600">有 {askedQs.filter((q) => q.flag).length} 次提問沒有得到有用線索，上方對話已標示原因。</p>}
            <p className="mt-2 rounded-xl bg-teal-600/10 px-3 py-2 text-[13px] text-teal-900">🧠 {activity.synthesis}</p>
          </div>
          <PrimaryButton
            tone="orange"
            onClick={() =>
              onDone({
                activityId: activity.id,
                score,
                max,
                notes: [
                  ...opqrst.filter((d) => !covered.includes(d)).map((d) => `線索收集：尚未問到「${d.label}」`),
                  ...askedQs.filter((q) => q.flag).map((q) => `線索收集：${q.text}（${FLAG_LABEL[q.flag!]}）`),
                ],
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
