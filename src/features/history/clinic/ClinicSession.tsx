import { useEffect, useMemo, useRef, useState } from 'react';
import { logPractice } from '../../../lib/practiceLog';
import { ConfirmDialog } from '../../training/components/Dialogs';
import { useInteractionEngine } from '../../training/interactionEngine';
import { formatClock, getTrainingModes } from '../../training/modes';
import type { TrainingEvent } from '../../training/types';
import { MOOD_LABEL, PatientAvatar } from '../components/PatientAvatar';
import type { CasePackage } from '../types';
import { createClinicState, isUnlocked, makeClinicReducer, type ClinicState } from './engine';
import { LabReport, RecordBoard, type ClinicModeId } from './panels';

export interface ClinicResult {
  state: ClinicState;
  events: TrainingEvent[];
  durationSec: number;
  endReason: 'finished' | 'timeout';
  mode: ClinicModeId;
}

const MODE_TITLE: Record<ClinicModeId, string> = { guided: 'Level 1 引導式練習', independent: 'Level 2 自主問診', challenge: 'Level 3 OSCE 模擬挑戰' };

export function ClinicSession({ c, mode, onFinish, onExit }: { c: CasePackage; mode: ClinicModeId; onFinish: (r: ClinicResult) => void; onExit: () => void }) {
  const config = getTrainingModes(c.candidate.minutes)[mode];
  const reducer = useMemo(() => makeClinicReducer(c), [c]);
  const init = useMemo(() => () => createClinicState(c), [c]);
  const engine = useInteractionEngine(reducer, init, config);
  const { domain: s, events, elapsed, paused, finished } = engine.state;
  const [topic, setTopic] = useState(c.topics[0].id);
  const [tab, setTab] = useState<'record' | 'lab'>('record');
  const [confirm, setConfirm] = useState<null | 'exit' | 'finish'>(null);
  const chat = useRef<HTMLDivElement>(null);
  const guided = mode === 'guided';
  const current = c.topics.find((t) => t.id === topic)!;
  const remaining = config.timeLimitSec !== null ? config.timeLimitSec - elapsed : null;
  const openPrompts = s.prompts.filter((p) => !p.answered).map((p) => c.spPrompts.find((x) => x.id === p.id)!);

  useEffect(() => {
    if (chat.current) chat.current.scrollTop = chat.current.scrollHeight;
  }, [s.lines.length]);

  useEffect(() => {
    logPractice({ island: 'history-taking', module: 'start', itemId: c.id, itemTitle: `${c.code}：${c.title}`, mode });
  }, [c, mode]);

  const reported = useRef(false);
  useEffect(() => {
    if (!finished || reported.current) return;
    reported.current = true;
    onFinish({ state: s, events, durationSec: elapsed, endReason: finished, mode });
  }, [finished, s, events, elapsed, mode, onFinish]);

  const questions = c.questions.filter((q) => q.topic === topic && isUnlocked(q, s.asked));
  const statements = c.statements.filter((q) => q.topic === topic);
  const groups = [...new Set(statements.map((x) => x.group))];
  const askedIn = (t: string) => c.questions.filter((q) => q.topic === t && s.asked.includes(q.id)).length + c.statements.filter((q) => q.topic === t && s.said.includes(q.id)).length;

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-[#fdf6ec] via-[#fbfaf7] to-[#eaf6f4]">
      {/* 頂部列 */}
      <header className="flex items-center gap-2 border-b border-white/70 bg-white/85 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:px-5">
        <button type="button" onClick={() => setConfirm('exit')} className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
          ← 離開
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">
          {c.code}｜{c.title} <span className="font-medium text-slate-400">・{MODE_TITLE[mode]}</span>
        </p>
        <span className={`rounded-xl px-3 py-1 font-mono text-sm font-bold tabular-nums ${remaining !== null && remaining < 60 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
          ⏱ {formatClock(remaining ?? elapsed)}
        </span>
        <button type="button" onClick={() => engine.setPaused(!paused)} className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600 sm:block">
          {paused ? '▶ 繼續' : '⏸ 暫停'}
        </button>
        <button type="button" onClick={() => setConfirm('finish')} className="rounded-full bg-orange-500 px-3 py-1.5 text-[12px] font-bold text-white shadow hover:bg-orange-600">
          結束問診
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-[90rem] gap-3 p-3 md:p-4 lg:grid-cols-[13.5rem_1fr_23rem]">
          {/* 左：問診導航 */}
          <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {c.topics.map((t) => {
              const n = askedIn(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-left text-[13px] font-bold transition ${topic === t.id ? 'bg-teal-600 text-white shadow' : t.explanation ? 'bg-orange-50 text-orange-800 ring-1 ring-orange-200' : 'bg-white/80 text-slate-700 hover:bg-white'}`}
                >
                  <span>{t.icon}</span>
                  <span className="whitespace-nowrap">{t.label}</span>
                  {n > 0 && <span className={`ml-auto rounded-full px-1.5 text-[10px] ${topic === t.id ? 'bg-white/25' : 'bg-teal-100 text-teal-800'}`}>{n}</span>}
                </button>
              );
            })}
          </nav>

          {/* 中：虛擬病人與對話 */}
          <section className="flex min-h-[24rem] flex-col rounded-3xl bg-white/90 p-3 shadow-sm ring-1 ring-orange-100 md:p-4">
            <div className="flex items-center gap-3">
              <PatientAvatar look={c.patient} mood={s.mood} size={110} />
              <div className="min-w-0">
                <p className="text-lg font-black text-slate-800">
                  {c.patient.name}・{c.patient.age} 歲
                </p>
                <p className="text-[12px] text-slate-500">
                  {c.patient.setting}・{c.patient.posture}
                </p>
                <span className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                  情緒：{MOOD_LABEL[s.mood]}
                  {guided && `（起始強度 ${c.patient.emotionIntensity}/10）`}
                </span>
              </div>
            </div>
            <div ref={chat} className="mt-3 max-h-[46vh] min-h-[14rem] flex-1 space-y-2 overflow-y-auto rounded-2xl bg-[#f7f4ee] p-3">
              <p className="text-center text-[12px] text-slate-400">{c.openingLine}</p>
              {s.lines.map((l) => (
                <div key={l.id} className={`flex ${l.who === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                  <p
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-[14px] leading-relaxed ${
                      l.who === 'doctor'
                        ? 'rounded-tr-sm bg-teal-600 text-white'
                        : l.kind === 'prompt'
                          ? 'rounded-tl-sm bg-orange-100 text-orange-900 ring-2 ring-orange-300'
                          : l.kind === 'pending'
                            ? 'rounded-tl-sm bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                            : 'rounded-tl-sm bg-white text-slate-700 ring-1 ring-slate-200'
                    }`}
                  >
                    {l.kind === 'prompt' && <span className="mb-0.5 block text-[10px] font-black text-orange-600">病人提問</span>}
                    {l.text}
                  </p>
                </div>
              ))}
            </div>
            {openPrompts.length > 0 && (
              <div className="mt-2 rounded-2xl bg-orange-50 px-3 py-2 text-[12px] text-orange-900 ring-1 ring-orange-200">
                💬 病人等待回答：{openPrompts.map((p) => `「${p.text}」`).join(' ')}
                {guided && <button type="button" onClick={() => setTopic('explain')} className="ml-2 font-bold underline">到病情說明回答 →</button>}
              </div>
            )}
            {guided && s.lastNote && <p className="mt-2 rounded-2xl bg-teal-600/10 px-3 py-2 text-[12px] text-teal-900">💡 {s.lastNote.text}</p>}
          </section>

          {/* 右：可選擇的問題與追問 */}
          <section className="rounded-3xl bg-white/90 p-3 shadow-sm ring-1 ring-slate-100 md:p-4">
            <p className="text-[11px] font-black tracking-widest text-teal-600">
              {current.icon} {current.label}
            </p>
            {guided && <p className="mt-1 rounded-xl bg-teal-50 px-3 py-2 text-[12px] leading-relaxed text-teal-900">SOP 提示：{current.hint}</p>}
            {!current.explanation ? (
              <div className="mt-2 space-y-2">
                {questions.map((q) => {
                  const asked = s.asked.includes(q.id);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      disabled={asked}
                      onClick={() => engine.dispatch({ type: 'ask', id: q.id })}
                      className={`w-full rounded-2xl px-3 py-2.5 text-left text-[14px] leading-relaxed transition ${asked ? 'bg-slate-50 text-slate-400 ring-1 ring-slate-100' : 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-teal-50 hover:ring-teal-300'}`}
                    >
                      {q.unlockAfter && <span className="mr-1 rounded bg-orange-100 px-1.5 text-[10px] font-black text-orange-700">↳ 追問</span>}
                      {q.text}
                      {asked && <span className="ml-1 text-[11px]">✓ 已問</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-2 space-y-3">
                {groups.map((g) => (
                  <div key={g}>
                    <p className="mb-1 text-[11px] font-bold text-slate-400">{g}</p>
                    <div className="space-y-1.5">
                      {statements
                        .filter((x) => x.group === g)
                        .map((x) => {
                          const said = s.said.includes(x.id);
                          return (
                            <button
                              key={x.id}
                              type="button"
                              disabled={said}
                              onClick={() => engine.dispatch({ type: 'say', id: x.id })}
                              className={`w-full rounded-2xl px-3 py-2 text-left text-[13px] leading-relaxed transition ${said ? (guided && x.incorrect ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-100') : 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-orange-50 hover:ring-orange-300'}`}
                            >
                              {x.text}
                              {said && <span className="ml-1 text-[11px]">✓ 已說明</span>}
                              {guided && said && <span className="mt-0.5 block text-[11px]">{x.feedback}</span>}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 下：病歷線索板／檢驗報告 */}
        <div className="mx-auto max-w-[90rem] px-3 pb-6 md:px-4">
          <div className="rounded-3xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-100 md:p-4">
            <div className="mb-3 flex gap-2">
              {(
                [
                  ['record', '📋 病歷線索板'],
                  ['lab', '🧪 檢驗報告'],
                ] as const
              ).map(([k, label]) => (
                <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full px-3 py-1.5 text-[13px] font-bold ${tab === k ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {label}
                </button>
              ))}
            </div>
            {tab === 'record' ? <RecordBoard c={c} state={s} mode={mode} /> : <LabReport c={c} showFlags={guided} />}
          </div>
        </div>
      </div>

      {paused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur">
          <div className="text-center">
            <p className="text-2xl font-black text-slate-800">已暫停</p>
            <button type="button" onClick={() => engine.setPaused(false)} className="mt-4 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white">
              ▶ 繼續問診
            </button>
          </div>
        </div>
      )}
      {confirm === 'exit' && <ConfirmDialog title="離開診間？" message="這次問診尚未結束，離開後不會保留紀錄。" confirmLabel="離開" danger onConfirm={onExit} onCancel={() => setConfirm(null)} />}
      {confirm === 'finish' && (
        <ConfirmDialog
          title="結束這次問診？"
          message="結束後會產生模擬形成性評量與個別化回饋。"
          confirmLabel="結束並查看回饋"
          onConfirm={() => {
            setConfirm(null);
            engine.finish();
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
