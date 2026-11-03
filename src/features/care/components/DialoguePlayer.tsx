import { useEffect, useMemo, useRef, useState } from 'react';
import { MOOD_LABEL, PatientAvatar } from '../../history/components/PatientAvatar';
import { QUALITY_STYLE, QualityTag, shuffle } from '../../history/components/Shell';
import { choose, currentNode, endDialogue, nodeView, repeats, startDialogue, undoLast } from '../engine/dialogue';
import type { DialogueScenario, DialogueState, EmotionCue } from '../types';
import { Care6Ring } from './Care6Ring';
import { SkillChip } from './CareShell';

export type PlayMode = 'theater' | 'guided' | 'independent' | 'challenge';

const CUE_LABEL: Record<EmotionCue['type'], string> = { verbal: '語言', nonverbal: '非語言', context: '情境' };

/**
 * 對話播放器（劇場與 VSP 共用）
 * theater／guided：作答後立即回饋，可重新選擇（引導模式另有分層提示與 CARE-6 導覽）
 * independent：作答中不顯示正誤，結束後才有回饋
 * challenge：同 independent，另有依案例設定的倒數計時
 */
export function DialoguePlayer({ scenario, mode, onEnd }: { scenario: DialogueScenario; mode: PlayMode; onEnd: (st: DialogueState, durationSec: number) => void }) {
  const [st, setSt] = useState<DialogueState>(() => startDialogue(scenario));
  const [pending, setPending] = useState(false);
  const [hints, setHints] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const t0 = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const feedbackNow = mode === 'theater' || mode === 'guided';
  const elapsed = Math.floor((now - t0.current) / 1000);
  const left = scenario.timeLimitSec - elapsed;
  const ended = useRef(false);

  useEffect(() => {
    if (mode !== 'challenge') return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [mode]);

  const finish = (s: DialogueState) => {
    if (ended.current) return;
    ended.current = true;
    onEnd(s, (Date.now() - t0.current) / 1000);
  };

  useEffect(() => {
    if (mode === 'challenge' && left <= 0 && !st.ended) finish(endDialogue(st, 'timeout'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  useEffect(() => {
    if (st.ended && !pending) finish(st);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st, pending]);

  const node = st.ended ? null : currentNode(scenario, st);
  const view = node ? nodeView(node, st.flags) : null;
  const options = useMemo(() => (node ? shuffle(node.responseOptions) : []), [node]);
  const last = st.turns[st.turns.length - 1];
  const shownMood = pending && last ? last.replyMood : (view?.mood ?? last?.replyMood ?? scenario.patient.baselineMood);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo?.({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [st.turns.length, pending]);

  const pick = (id: string) => {
    const next = choose(scenario, st, id, { atSec: Math.floor((Date.now() - t0.current) / 1000), hintsUsed: hints, retried: retrying });
    setSt(next);
    setHints(0);
    setRetrying(false);
    if (feedbackNow) setPending(true);
  };

  const cuesToShow = view ? (mode === 'independent' || mode === 'challenge' ? view.cues.filter((c) => c.type !== 'verbal') : view.cues) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      {/* 病人 */}
      <aside className="space-y-3 lg:sticky lg:top-2 lg:self-start">
        <div className="flex flex-col items-center rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-orange-100">
          <PatientAvatar look={scenario.patient} mood={shownMood} size={140} />
          <p className="mt-1 text-sm font-black text-slate-800">
            {scenario.patient.name}・{scenario.patient.age} 歲
          </p>
          <span className="mt-0.5 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700">{mode === 'independent' || mode === 'challenge' ? '請自行觀察病人的反應' : `情緒：${MOOD_LABEL[shownMood]}`}</span>
        </div>
        {mode === 'challenge' && (
          <div className={`rounded-2xl px-4 py-2 text-center font-black tabular-nums shadow-sm ${left <= 60 ? 'bg-rose-600 text-white' : 'bg-white text-slate-800 ring-1 ring-slate-200'}`}>
            ⏱️ {String(Math.max(0, Math.floor(left / 60))).padStart(2, '0')}:{String(Math.max(0, left % 60)).padStart(2, '0')}
            <span className="block text-[10px] font-bold opacity-70">本案例設定 {Math.round(scenario.timeLimitSec / 60)} 分鐘</span>
          </div>
        )}
        {cuesToShow.length > 0 && !pending && (
          <div className="rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-rose-100">
            <p className="text-[11px] font-black tracking-wider text-rose-600">{mode === 'independent' || mode === 'challenge' ? '👀 你觀察到' : '🔍 情緒線索'}</p>
            <ul className="mt-1 space-y-1 text-[12.5px] text-slate-700">
              {cuesToShow.map((c) => (
                <li key={c.text} className="flex gap-1.5">
                  {feedbackNow && <span className="shrink-0 rounded bg-rose-50 px-1 text-[10px] font-bold text-rose-700">{CUE_LABEL[c.type]}</span>}
                  {c.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* 對話 */}
      <section className="min-w-0 space-y-3">
        {mode === 'guided' && node && <Care6Ring active={node.stage} compact onPick={() => undefined} />}
        <div ref={scroller} className="max-h-[46vh] space-y-2 overflow-y-auto rounded-3xl bg-white/70 p-3 ring-1 ring-orange-100 md:max-h-[52vh]">
          {st.turns.map((t, i) => (
            <div key={i} className="space-y-2">
              {(i === 0 || !repeats(st.turns[i - 1].reply, t.patientLine)) && <Bubble who="patient" text={t.patientLine} />}
              <Bubble who="me" text={t.text} />
              {!(pending && i === st.turns.length - 1) && <Bubble who="patient" text={t.reply} soft live={!!view && i === st.turns.length - 1 && repeats(t.reply, view.message)} />}
            </div>
          ))}
          {view && !pending && !repeats(last?.reply, view.message) && <Bubble who="patient" text={view.message} live />}
        </div>

        {pending && last && (
          <div className={`animate-fade-up rounded-3xl border-2 p-4 ${QUALITY_STYLE[last.quality].cls}`}>
            <div className="flex flex-wrap items-center gap-1.5">
              <QualityTag q={last.quality} />
              {last.skills.map((s) => (
                <SkillChip key={s}>{s}</SkillChip>
              ))}
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-700">💡 {scenario.nodes[last.nodeId].responseOptions.find((o) => o.id === last.optionId)?.feedback}</p>
            <div className="mt-3 flex items-start gap-2 rounded-2xl bg-white/90 p-3 ring-1 ring-slate-100">
              <span className="text-xl">🗨️</span>
              <div>
                <p className="text-[11px] font-bold text-slate-400">
                  病人的反應（{MOOD_LABEL[last.replyMood]}）
                </p>
                <p className="text-[14px] text-slate-800">{last.reply}</p>
              </div>
            </div>
            {last.safetyFlags.length > 0 && <p className="mt-2 rounded-xl bg-rose-100 px-3 py-1.5 text-[12.5px] font-bold text-rose-800">⚠️ 安全提醒：{last.safetyFlags.join('；')}</p>}
            {scenario.nodes[last.nodeId].feedbackRules.why && <p className="mt-2 text-[12.5px] text-slate-500">為什麼重要：{scenario.nodes[last.nodeId].feedbackRules.why}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setPending(false)} className="rounded-2xl bg-teal-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-teal-700">
                {st.ended ? '看回饋 →' : '繼續對話 →'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSt(undoLast(scenario, st));
                  setPending(false);
                  setRetrying(true);
                }}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                ↺ 重新選擇這一步
              </button>
            </div>
          </div>
        )}

        {node && !pending && (
          <div className="space-y-2">
            {mode !== 'independent' && mode !== 'challenge' && (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/90 px-4 py-2.5 ring-1 ring-slate-100">
                <p className="flex-1 text-[14px] font-bold text-slate-800">🎯 {node.task}</p>
                {mode === 'guided' && node.feedbackRules.guidedHint.length > 0 && (
                  <button type="button" disabled={hints >= node.feedbackRules.guidedHint.length} onClick={() => setHints((h) => h + 1)} className="rounded-full bg-amber-100 px-3 py-1 text-[12px] font-bold text-amber-800 disabled:opacity-50">
                    💡 提示 {hints}/{node.feedbackRules.guidedHint.length}
                  </button>
                )}
              </div>
            )}
            {mode === 'guided' && hints > 0 && (
              <ol className="space-y-1 rounded-2xl bg-amber-50 p-3 text-[13px] text-amber-900 ring-1 ring-amber-200">
                {node.feedbackRules.guidedHint.slice(0, hints).map((h, i) => (
                  <li key={h}>
                    <b>提示 {i + 1}：</b>
                    {h}
                  </li>
                ))}
              </ol>
            )}
            <p className="text-[12px] font-bold text-slate-500">選擇你要說的話：</p>
            {options.map((o) => (
              <button key={o.id} type="button" onClick={() => pick(o.id)} className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-left text-[14px] leading-relaxed text-slate-800 transition hover:border-teal-400 hover:bg-teal-50/40">
                {o.text}
              </button>
            ))}
            {mode !== 'theater' && (
              <button type="button" onClick={() => finish(endDialogue(st, 'quit'))} className="text-[12px] font-bold text-slate-400 underline">
                結束練習並查看回饋
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Bubble({ who, text, soft, live }: { who: 'patient' | 'me'; text: string; soft?: boolean; live?: boolean }) {
  if (who === 'me')
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-teal-600 px-3 py-2 text-[13.5px] leading-relaxed text-white shadow-sm">{text}</p>
      </div>
    );
  return (
    <div className="flex">
      <p className={`max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-2 text-[13.5px] leading-relaxed shadow-sm ${live ? 'animate-fade-up bg-orange-50 font-bold text-slate-800 ring-2 ring-orange-200' : soft ? 'bg-orange-50/70 text-slate-700' : 'bg-white text-slate-600 ring-1 ring-slate-100'}`}>{text}</p>
    </div>
  );
}
