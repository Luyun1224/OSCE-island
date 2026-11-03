import { useState } from 'react';
import { navigate } from '../../../router';
import { ChoiceStepView } from '../../history/activities/ChoiceActivityView';
import { PatientAvatar } from '../../history/components/PatientAvatar';
import { FormativeNote, PrimaryButton, QualityTag, ReviewBadge, ScoreBar } from '../../history/components/Shell';
import type { ChoiceStep, OptionQuality } from '../../history/types';
import { Card, CareShell } from '../components/CareShell';
import { TEACHBACK_STEPS, TEACHBACK_TASK as T } from '../data/teachback';
import { logCareStart, recordCare } from '../progress';
import type { ExplainStyle, TBChoice } from '../types';

const CRUMB = { label: 'CARE ISLAND', to: '/care' };
const PTS: Record<OptionQuality, number> = { best: 2, ok: 1, poor: 0 };

const asStep = (id: string, c: TBChoice): ChoiceStep => ({ id, prompt: c.prompt, patientLine: c.patientLine, mood: 'neutral', options: c.options });

const ASK_STEP = asStep('ask', T.steps.ask);
const INVITE_STEP = asStep('invite', T.steps.invite);
const TEACH_STEP: ChoiceStep = { ...asStep('teach', T.steps.teachBack), takeaway: '病人說「我懂了」不算數：請病人用自己的話說一次。' };
const CLOSE_STEP = asStep('close', T.steps.close);

const EXPLAIN_STEP: ChoiceStep = {
  id: 'explain',
  prompt: '步驟 2：說明第一個重點「怎麼吃」。你會怎麼說？',
  patientLine: '「以前沒吃過，只知道血壓高。」',
  mood: 'neutral',
  options: T.steps.explain.map((e) => ({
    id: e.style,
    text: e.text,
    quality: e.style === 'plain' ? 'best' : 'poor',
    feedback: e.feedback,
    reply: e.style === 'plain' ? '「喔，早上起床吃一顆。」' : e.style === 'jargon' ? '「A……什麼？QD 是什麼？」' : '（眉頭越皺越緊）「副作用這麼多喔……」',
    replyMood: e.style === 'plain' ? 'calm' : e.style === 'jargon' ? 'confused' : 'anxious',
  })),
  takeaway: '日常語言、具體可執行：「每天早上起床吃一顆」比「QD 服用」好記得多。',
};

/** 03 衛教互動工坊（Game 3：Teach-back 七步驟） */
export function WorkshopPage() {
  const [run, setRun] = useState(0);
  return <Workshop key={run} onRestart={() => setRun((r) => r + 1)} />;
}

function Workshop({ onRestart }: { onRestart: () => void }) {
  const [step, setStep] = useState(0);
  const [firsts, setFirsts] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string[]>([]);
  const [pickChecked, setPickChecked] = useState(false);
  const [marked, setMarked] = useState<string[]>([]);
  const [markChecked, setMarkChecked] = useState(false);
  const [reFix, setReFix] = useState<Record<string, string>>({});
  const [teachForced, setTeachForced] = useState(false);
  const [t0] = useState(() => {
    logCareStart('game:teachback', 'Game 3 Teach-back 衛教工坊');
    return Date.now();
  });
  const [finished, setFinished] = useState(false);

  const explainStyle = (firsts.explain ?? 'plain') as ExplainStyle;
  const nonKey = picked.filter((id) => !T.infoPool.find((x) => x.id === id)?.key).length;
  const restateStyle: ExplainStyle = explainStyle !== 'plain' ? explainStyle : nonKey >= 2 ? 'overload' : 'plain';
  const segments = T.restatements[restateStyle];
  const errors = segments.filter((s) => s.error);

  const q = (id: string, opts: { id: string; quality: OptionQuality }[]) => opts.find((o) => o.id === firsts[id])?.quality;
  const scoreOf = () => {
    const parts: { label: string; score: number; max: number; note?: string }[] = [];
    parts.push({ label: TEACHBACK_STEPS[0], score: PTS[q('ask', T.steps.ask.options) ?? 'poor'], max: 2 });
    parts.push({ label: TEACHBACK_STEPS[1], score: firsts.explain === 'plain' ? 2 : 0, max: 2 });
    const keys = picked.filter((id) => T.infoPool.find((x) => x.id === id)?.key).length;
    parts.push({ label: TEACHBACK_STEPS[2], score: keys === T.keyPoints.length && nonKey === 0 ? 2 : keys >= 2 && nonKey <= 1 ? 1 : 0, max: 2 });
    parts.push({ label: TEACHBACK_STEPS[3], score: PTS[q('invite', T.steps.invite.options) ?? 'poor'], max: 2 });
    parts.push({ label: TEACHBACK_STEPS[4], score: PTS[q('teach', T.steps.teachBack.options) ?? 'poor'], max: 2, note: teachForced ? '第一次接受了「我懂了」，之後改用 teach-back' : undefined });
    const hit = segments.filter((s) => !!s.error === marked.includes(s.id)).length;
    const fix = errors.reduce((s, e) => s + PTS[T.reExplain[e.error!].options.find((o) => o.id === reFix[e.id])?.quality ?? 'poor'], 0);
    parts.push({ label: TEACHBACK_STEPS[5], score: (hit === segments.length ? 2 : hit >= segments.length - 1 ? 1 : 0) + fix, max: 2 + errors.length * 2 });
    parts.push({ label: TEACHBACK_STEPS[6], score: PTS[q('close', T.steps.close.options) ?? 'poor'], max: 2 });
    return parts;
  };

  const next = () => {
    setStep((s) => s + 1);
    window.scrollTo?.(0, 0);
  };

  const choiceFooter = (label = '下一步 →', onClick = next) => (
    <PrimaryButton tone="orange" onClick={onClick}>
      {label}
    </PrimaryButton>
  );

  if (finished) {
    const parts = scoreOf();
    const score = parts.reduce((s, p) => s + p.score, 0);
    const max = parts.reduce((s, p) => s + p.max, 0);
    return (
      <CareShell crumbs={[CRUMB, { label: '03 衛教互動工坊' }]}>
        <h1 className="text-2xl font-black text-slate-800">🧩 衛教工坊回饋</h1>
        <Card className="mt-4">
          <p className="text-[12px] font-black tracking-widest text-orange-600">七個步驟｜模擬形成性評量</p>
          <div className="mt-2">
            <ScoreBar score={score} max={max} />
          </div>
          <ol className="mt-3 space-y-1.5">
            {parts.map((p, i) => (
              <li key={p.label} className="flex flex-wrap items-center gap-2 text-[13.5px]">
                <span className="w-6 text-center font-black text-orange-500">{i + 1}</span>
                <span className="flex-1 font-bold text-slate-700">{p.label}</span>
                {p.note && <span className="text-[12px] text-amber-700">{p.note}</span>}
                <span className="tabular-nums text-slate-500">
                  {p.score}/{p.max}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 rounded-2xl bg-teal-50 px-3 py-2 text-[13px] text-teal-900">
            🔁 你的說明方式讓王伯伯的第一次復述出現 {errors.length} 個誤解（{restateStyle === 'plain' ? '日常語言說明：仍有一個常見誤解，teach-back 幫你找到了它' : restateStyle === 'jargon' ? '術語說明：病人記住的不多' : '資訊過量：重點被淹沒，還引起擔心'}）。
          </p>
          <div className="mt-3">
            <FormativeNote />
          </div>
        </Card>
        <div className="mt-4 flex flex-wrap gap-2">
          <PrimaryButton tone="ghost" onClick={onRestart}>
            ↺ 換一種說明方式再練一次
          </PrimaryButton>
          <PrimaryButton tone="ghost" onClick={() => navigate('/care/tools/teachback')}>
            📖 Teach-back 教學卡
          </PrimaryButton>
          <PrimaryButton tone="orange" onClick={() => navigate('/care/vsp')}>
            前往 Virtual SP 挑戰中心 →
          </PrimaryButton>
        </div>
      </CareShell>
    );
  }

  return (
    <CareShell crumbs={[CRUMB, { label: '03 衛教互動工坊' }]} wide>
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-black text-slate-800 md:text-2xl">🧩 Game 3｜{T.title}</h1>
        <span className="ml-auto">
          <ReviewBadge review={T.review} />
        </span>
      </header>
      <p className="mt-2 rounded-2xl bg-white/80 px-4 py-2 text-[13.5px] text-slate-600 ring-1 ring-orange-100">🎬 {T.patient.context}</p>
      <ol className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {TEACHBACK_STEPS.map((s, i) => (
          <li key={s} className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${i === step ? 'bg-amber-500 text-white' : i < step ? 'bg-teal-100 text-teal-800' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
            {i < step ? '✓ ' : `${i + 1}. `}
            {s}
          </li>
        ))}
      </ol>

      <div className="mt-4">
        {step === 0 && <ChoiceStepView step={ASK_STEP} patient={T.patient} first={firsts.ask ?? null} onFirst={(id) => setFirsts((f) => ({ ...f, ask: id }))} footer={choiceFooter()} />}
        {step === 1 && <ChoiceStepView step={EXPLAIN_STEP} patient={T.patient} first={firsts.explain ?? null} onFirst={(id) => setFirsts((f) => ({ ...f, explain: id }))} footer={choiceFooter()} />}
        {step === 2 && (
          <Card>
            <p className="text-[15px] font-bold text-slate-800">步驟 3：避免資訊過量。今天最多說 {T.maxPick} 件事，你會選哪些？</p>
            <p className="mt-1 text-[13px] text-slate-500">病人一次能記住的有限。選出王伯伯今天「回家一定要做到」的事。</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {T.infoPool.map((x) => {
                const on = picked.includes(x.id);
                return (
                  <button
                    key={x.id}
                    type="button"
                    disabled={pickChecked}
                    onClick={() => setPicked((p) => (on ? p.filter((i) => i !== x.id) : p.length < T.maxPick ? [...p, x.id] : p))}
                    className={`rounded-2xl border-2 px-3 py-2.5 text-left text-[14px] transition ${pickChecked ? (x.key ? 'border-emerald-400 bg-emerald-50' : on ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white opacity-70') : on ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white hover:border-amber-300'}`}
                    aria-pressed={on}
                  >
                    <span className="font-bold text-slate-800">
                      {on ? '☑' : '☐'} {x.text}
                    </span>
                    {pickChecked && <span className="mt-1 block text-[12.5px] text-slate-600">{x.key ? '✅ 今天的重點：' : '➖ 可以之後再說：'}{x.why}</span>}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {!pickChecked ? (
                <PrimaryButton tone="orange" disabled={picked.length === 0} onClick={() => setPickChecked(true)}>
                  確認選擇（{picked.length}/{T.maxPick}）
                </PrimaryButton>
              ) : (
                choiceFooter()
              )}
            </div>
          </Card>
        )}
        {step === 3 && <ChoiceStepView step={INVITE_STEP} patient={T.patient} first={firsts.invite ?? null} onFirst={(id) => setFirsts((f) => ({ ...f, invite: id }))} footer={choiceFooter()} />}
        {step === 4 && (
          <ChoiceStepView
            step={TEACH_STEP}
            patient={T.patient}
            first={firsts.teach ?? null}
            onFirst={(id) => setFirsts((f) => ({ ...f, teach: id }))}
            footer={
              firsts.teach === 'a' ? (
                choiceFooter('聽聽王伯伯怎麼說 →')
              ) : (
                <div className="space-y-2">
                  <p className="rounded-xl bg-rose-50 px-3 py-2 text-[13px] font-bold text-rose-800">⚠️ 王伯伯說「懂了」或沒有說出內容——這還不能算確認理解。請改用 teach-back，請他用自己的話說一次。</p>
                  {choiceFooter('改用 teach-back 再問一次 →', () => {
                    setTeachForced(true);
                    next();
                  })}
                </div>
              )
            }
          />
        )}
        {step === 5 && (
          <div className="grid gap-4 md:grid-cols-[15rem_1fr]">
            <div className="flex flex-col items-center rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-orange-100">
              <PatientAvatar look={T.patient} mood="neutral" size={130} />
              <p className="mt-1 text-sm font-black text-slate-800">王伯伯用自己的話說：</p>
            </div>
            <Card>
              <p className="text-[15px] font-bold text-slate-800">步驟 6：點出王伯伯說錯或遺漏的地方</p>
              <div className="mt-3 space-y-2">
                {segments.map((s) => {
                  const on = marked.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={markChecked}
                      onClick={() => setMarked((m) => (on ? m.filter((x) => x !== s.id) : [...m, s.id]))}
                      className={`w-full rounded-2xl border-2 px-3 py-2.5 text-left text-[14.5px] ${markChecked ? (s.error ? 'border-rose-400 bg-rose-50' : 'border-emerald-300 bg-emerald-50') : on ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-300'}`}
                      aria-pressed={on}
                    >
                      <span className="text-slate-800">
                        {on ? '🚩 ' : ''}
                        {s.text}
                      </span>
                      {markChecked && (
                        <span className="mt-1 block text-[12.5px] text-slate-600">
                          {s.error ? '❌ ' : '✅ '}
                          {s.explain}
                          {on !== !!s.error && <b className="ml-1 text-amber-700">{s.error ? '（你沒有標出）' : '（這句其實是正確的）'}</b>}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {!markChecked ? (
                <div className="mt-3">
                  <PrimaryButton tone="orange" onClick={() => setMarkChecked(true)}>
                    確認
                  </PrimaryButton>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <p className="text-[13px] font-bold text-teal-800">針對每一個誤解，選擇你的再說明方式：</p>
                  {errors.map((e) => {
                    const r = T.reExplain[e.error!];
                    const chosen = r.options.find((o) => o.id === reFix[e.id]);
                    return (
                      <div key={e.id} className="rounded-2xl bg-orange-50/50 p-3 ring-1 ring-orange-100">
                        <p className="text-[13.5px] font-bold text-slate-800">{r.prompt}</p>
                        <div className="mt-2 space-y-1.5">
                          {r.options.map((o) => (
                            <button key={o.id} type="button" disabled={!!chosen} onClick={() => setReFix((x) => ({ ...x, [e.id]: o.id }))} className={`w-full rounded-xl border-2 px-3 py-2 text-left text-[13.5px] ${chosen?.id === o.id ? 'border-teal-400 bg-white' : 'border-slate-200 bg-white hover:border-teal-300 disabled:opacity-60'}`}>
                              {o.text}
                              {chosen?.id === o.id && (
                                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-600">
                                  <QualityTag q={o.quality} /> {o.feedback}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {errors.every((e) => reFix[e.id]) && choiceFooter('請王伯伯再說一次 →')}
                </div>
              )}
            </Card>
          </div>
        )}
        {step === 6 && (
          <div className="space-y-3">
            <Card>
              <p className="text-[12px] font-black tracking-widest text-teal-700">🔁 再確認：王伯伯第二次用自己的話說</p>
              <p className="mt-2 rounded-2xl bg-teal-50 px-3 py-2 text-[14.5px] text-slate-800">{T.finalRestatement}</p>
              <p className="mt-1 text-[12.5px] text-slate-500">三個重點都正確了。接下來結束這次衛教。</p>
            </Card>
            <ChoiceStepView
              step={CLOSE_STEP}
              patient={T.patient}
              first={firsts.close ?? null}
              onFirst={(id) => setFirsts((f) => ({ ...f, close: id }))}
              footer={choiceFooter('完成衛教，看回饋 →', () => {
                const parts = scoreOf();
                recordCare('game', 'teachback', 'Game 3 Teach-back 衛教工坊', {
                  score: parts.reduce((s, p) => s + p.score, 0),
                  max: parts.reduce((s, p) => s + p.max, 0),
                  durationSec: (Date.now() - t0) / 1000,
                  detail: `style=${restateStyle};errors=${errors.length};forced=${teachForced}`,
                });
                setFinished(true);
                window.scrollTo?.(0, 0);
              })}
            />
          </div>
        )}
      </div>
    </CareShell>
  );
}
