import { useMemo, useRef, useState } from 'react';
import { MOOD_LABEL, PatientAvatar } from '../../history/components/PatientAvatar';
import { shuffle } from '../../history/components/Shell';
import { explainEvent } from '../engine/evaluate';
import type { ClinicalCase, DecisionEvent, GameResult } from '../types';
import { Btn, EventList, Panel, Steps } from '../components/ui';

/**
 * Game 4：病情解釋挑戰（重點：醫學內容正確性與完整性）
 * 溝通技巧（同理、語氣）由醫病溝通島負責，此處不重複評分。
 */
export function ExplainChallenge({ c, defer, onComplete }: { c: ClinicalCase; defer?: boolean; onComplete: (r: GameResult) => void }) {
  const ex = c.explanation;
  const total = ex.elements.length + ex.concerns.length;
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [reasonShown, setReasonShown] = useState(false);
  const [shown, setShown] = useState(false);
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const t0 = useRef(Date.now());
  const isElement = i < ex.elements.length;
  const el = isElement ? ex.elements[i] : null;
  const co = !isElement ? ex.concerns[i - ex.elements.length] : null;
  const stmts = useMemo(() => (el ? shuffle(el.statements) : []), [el]);
  const resps = useMemo(() => (co ? shuffle(co.responses) : []), [co]);
  const reasons = useMemo(() => (co ? shuffle(co.reasons) : []), [co]);

  const current = (): DecisionEvent[] => {
    if (el) {
      const s = el.statements.find((x) => x.id === pick)!;
      return [explainEvent(el.id, el.title, s.verdict, s.text, s.feedback)];
    }
    const r = co!.reasons.find((x) => x.id === reason)!;
    const s = co!.responses.find((x) => x.id === pick)!;
    return [
      { game: 'explain', kind: 'concern-reason', ref: co!.id, label: `找出顧慮的原因：${r.text}`, quality: r.correct ? 'good' : 'acceptable', dims: ['explanation'], note: r.feedback },
      { ...explainEvent('concern', '回應病人的顧慮', s.verdict, s.text, s.feedback), safety: s.verdict === 'inaccurate' && co!.id === 'c-home' ? '同意敗血症休克徵象病人返家' : undefined, quality: s.verdict === 'inaccurate' && co!.id === 'c-home' ? 'unsafe' : explainEvent('concern', '', s.verdict, s.text, '').quality },
    ];
  };

  const next = () => {
    const all = [...events, ...current()];
    setEvents(all);
    setPick(null);
    setReason(null);
    setReasonShown(false);
    setShown(false);
    if (i + 1 >= total) onComplete({ game: 'explain', events: all, durationSec: (Date.now() - t0.current) / 1000 });
    else setI(i + 1);
    window.scrollTo?.(0, 0);
  };
  const confirm = () => (defer ? next() : setShown(true));
  const chosenResp = co?.responses.find((r) => r.id === pick);

  return (
    <div className="space-y-4">
      <Steps labels={[...ex.elements.map((e) => e.title), ...ex.concerns.map((_, k) => `病人疑問 ${k + 1}`)]} current={i} />
      <p className="rounded-2xl bg-cyan-50 px-3 py-2 text-[12.5px] text-cyan-900 ring-1 ring-cyan-200">🎯 本關評估「醫學內容是否正確、完整、確定程度是否適當」。溝通技巧（同理、語氣）請到醫病溝通島練習。</p>
      <div className="grid gap-4 md:grid-cols-[15rem_1fr]">
        <Panel className="flex flex-col items-center text-center">
          <PatientAvatar look={c.patient} mood={shown && chosenResp ? chosenResp.replyMood : co ? 'worried' : 'neutral'} size={130} />
          <p className="text-sm font-black text-slate-800">{c.patient.name}與太太</p>
          {co && <p className="mt-2 rounded-2xl bg-orange-50 px-3 py-2 text-left text-[13.5px] text-slate-800">{co.patientLine}</p>}
          {shown && chosenResp && (
            <p className="mt-2 rounded-2xl bg-teal-50 px-3 py-2 text-left text-[13px] text-slate-700">
              {chosenResp.reply}
              <span className="block text-[11px] text-slate-400">（{MOOD_LABEL[chosenResp.replyMood]}）</span>
            </p>
          )}
        </Panel>

        <Panel>
          {el && (
            <>
              <p className="text-[12px] font-black tracking-widest text-cyan-700">元素 {i + 1}／{ex.elements.length}：{el.title}</p>
              <p className="text-[15px] font-black text-slate-800">{el.prompt}</p>
              <div className="mt-3 space-y-2">
                {stmts.map((s) => (
                  <button key={s.id} type="button" disabled={shown} onClick={() => setPick(s.id)} className={`w-full rounded-2xl border-2 px-3 py-2.5 text-left text-[14px] leading-relaxed ${pick === s.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-white hover:border-cyan-300'} ${shown && s.verdict === 'accurate' ? 'ring-2 ring-emerald-400' : ''}`}>
                    {s.text}
                    {shown && (pick === s.id || s.verdict === 'accurate') && <span className={`mt-1 block text-[12.5px] ${s.verdict === 'accurate' ? 'text-emerald-700' : 'text-rose-700'}`}>{s.verdict === 'accurate' ? '✓ 正確' : s.verdict === 'overconfident' ? '△ 過度確定' : s.verdict === 'incomplete' ? '△ 不完整' : '✗ 不正確'}：{s.feedback}</span>}
                  </button>
                ))}
              </div>
            </>
          )}
          {co && (
            <>
              <p className="text-[12px] font-black tracking-widest text-orange-600">病人的疑問</p>
              {!reasonShown ? (
                <>
                  <p className="text-[15px] font-black text-slate-800">先問清楚：你認為病人不理解或不願配合的原因最可能是？</p>
                  <div className="mt-3 space-y-2">
                    {reasons.map((r) => (
                      <button key={r.id} type="button" onClick={() => setReason(r.id)} className={`w-full rounded-2xl border-2 px-3 py-2.5 text-left text-[14px] ${reason === r.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-300'}`}>
                        {r.text}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Btn tone="orange" disabled={!reason} onClick={() => setReasonShown(true)}>
                      詢問病人
                    </Btn>
                  </div>
                </>
              ) : (
                <>
                  <p className="rounded-2xl bg-orange-50 px-3 py-2 text-[13px] text-orange-900">🔎 {co.reasons.find((r) => r.correct)!.feedback.replace(/^.*?：/, '詢問後得知：')}</p>
                  <p className="mt-3 text-[15px] font-black text-slate-800">選擇你的說明：</p>
                  <div className="mt-2 space-y-2">
                    {resps.map((s) => (
                      <button key={s.id} type="button" disabled={shown} onClick={() => setPick(s.id)} className={`w-full rounded-2xl border-2 px-3 py-2.5 text-left text-[14px] leading-relaxed ${pick === s.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-white hover:border-cyan-300'} ${shown && s.verdict === 'accurate' ? 'ring-2 ring-emerald-400' : ''}`}>
                        {s.text}
                        {shown && (pick === s.id || s.verdict === 'accurate') && <span className={`mt-1 block text-[12.5px] ${s.verdict === 'accurate' ? 'text-emerald-700' : 'text-rose-700'}`}>{s.feedback}</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          {shown && (
            <div className="mt-3">
              <EventList events={current()} />
            </div>
          )}
          {(el || reasonShown) && (
            <div className="mt-3">
              {!shown ? (
                <Btn disabled={!pick} onClick={confirm}>
                  確認
                </Btn>
              ) : (
                <Btn onClick={next}>{i + 1 >= total ? '完成 Game 4 →' : '下一步 →'}</Btn>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
