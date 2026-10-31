import { useMemo, useState } from 'react';
import { MOOD_LABEL, PatientAvatar } from '../components/PatientAvatar';
import { PrimaryButton, QUALITY_STYLE, QualityTag, shuffle } from '../components/Shell';
import type { ActivityResult, ChoiceActivity, ChoiceStep, Mood, OptionQuality, PatientLook } from '../types';

const POINTS: Record<OptionQuality, number> = { best: 2, ok: 1, poor: 0 };

/**
 * 單一步驟：病人說話 → 學生選擇說法 → 病人依選項回應＋觀念說明
 * 第一次的選擇計分；之後可以點其他說法比較病人的不同反應（不影響分數）。
 */
export function ChoiceStepView({
  step,
  patient,
  first,
  onFirst,
  footer,
}: {
  step: ChoiceStep;
  patient?: PatientLook;
  first: string | null;
  onFirst: (optionId: string) => void;
  footer?: React.ReactNode;
}) {
  const options = useMemo(() => shuffle(step.options), [step]);
  const [viewing, setViewing] = useState<string | null>(null);
  const shown = step.options.find((o) => o.id === (viewing ?? first));
  const mood: Mood = shown?.replyMood ?? step.mood ?? 'neutral';
  const line = shown?.reply ?? step.patientLine;

  const pick = (id: string) => {
    if (!first) onFirst(id);
    setViewing(id);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[17rem_1fr]">
      {/* 病人 */}
      <div className="flex flex-col items-center rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-orange-100">
        <PatientAvatar look={patient} mood={mood} size={150} />
        <p className="mt-1 text-sm font-black text-slate-800">{patient ? `${patient.name}・${patient.age} 歲` : '病人'}</p>
        <span className="mt-0.5 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700">情緒：{MOOD_LABEL[mood]}</span>
        {line && (
          <div key={line} className="relative mt-3 w-full animate-fade-up rounded-2xl rounded-tl-sm bg-teal-50 px-3 py-2.5 text-[14px] leading-relaxed text-slate-700 ring-1 ring-teal-100">
            {line}
          </div>
        )}
      </div>

      {/* 選項 */}
      <div className="space-y-3">
        <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-[15px] font-bold leading-relaxed text-slate-800">{step.prompt}</p>
        </div>
        <div className="space-y-2">
          {options.map((o) => {
            const isFirst = first === o.id;
            const isViewing = (viewing ?? first) === o.id;
            const revealed = !!first;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => pick(o.id)}
                className={`w-full rounded-2xl border-2 px-4 py-3 text-left text-[14px] leading-relaxed transition ${
                  revealed && isViewing ? QUALITY_STYLE[o.quality].cls : 'border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/40'
                }`}
              >
                <span className="text-slate-800">{o.text}</span>
                {revealed && isViewing && (
                  <span className="mt-2 block space-y-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <QualityTag q={o.quality} />
                      {isFirst ? <span className="text-[11px] font-bold text-slate-500">你的第一個選擇</span> : <span className="text-[11px] font-bold text-slate-400">比較看看（不計分）</span>}
                    </span>
                    <span className="block text-[13px] text-slate-600">💡 {o.feedback}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {first && (
          <div className="space-y-2">
            {step.takeaway && <p className="rounded-xl bg-teal-600/10 px-3 py-2 text-[13px] font-bold text-teal-800">📌 {step.takeaway}</p>}
            <p className="text-[12px] text-slate-400">可以點其他說法，看看病人會有什麼不同反應。</p>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChoiceActivityView({ activity, onDone }: { activity: ChoiceActivity; onDone: (r: ActivityResult) => void }) {
  const [idx, setIdx] = useState(0);
  const [firsts, setFirsts] = useState<Record<string, string>>({});
  const step = activity.steps[idx];
  const last = idx === activity.steps.length - 1;

  const finish = () => {
    let score = 0;
    const notes: string[] = [];
    for (const s of activity.steps) {
      const o = s.options.find((x) => x.id === firsts[s.id]);
      if (!o) continue;
      score += POINTS[o.quality];
      if (o.quality !== 'best') notes.push(`${activity.title}：${o.feedback}`);
    }
    onDone({ activityId: activity.id, score, max: activity.steps.length * 2, notes });
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {activity.steps.map((s, i) => (
          <span key={s.id} className={`h-1.5 flex-1 rounded-full ${i < idx ? 'bg-teal-500' : i === idx ? 'bg-orange-400' : 'bg-slate-200'}`} />
        ))}
        <span className="text-[12px] font-bold text-slate-500">
          {idx + 1}/{activity.steps.length}
        </span>
      </div>
      <ChoiceStepView
        key={step.id}
        step={step}
        patient={activity.patient}
        first={firsts[step.id] ?? null}
        onFirst={(id) => setFirsts((f) => ({ ...f, [step.id]: id }))}
        footer={
          <PrimaryButton onClick={() => (last ? finish() : setIdx((i) => i + 1))} tone="orange">
            {last ? '完成這個練習 →' : '下一步 →'}
          </PrimaryButton>
        }
      />
    </div>
  );
}
