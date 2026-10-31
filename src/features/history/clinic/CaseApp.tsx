import { useCallback, useState } from 'react';
import { navigate } from '../../../router';
import { HQShell, ReviewBadge } from '../components/Shell';
import { PatientAvatar } from '../components/PatientAvatar';
import { recordRun } from '../progress';
import type { CasePackage } from '../types';
import { CaseReport } from './CaseReport';
import { ClinicSession, type ClinicResult } from './ClinicSession';
import { evaluateCase, feedbackSentence } from './engine';
import { LabReport, type ClinicModeId } from './panels';

const MODES: { id: ClinicModeId; level: string; title: string; desc: string; tags: string[]; color: string }[] = [
  { id: 'guided', level: 'Level 1', title: '引導式練習', desc: '顯示 SOP 提示、問診構面完成度、檢驗高低標示與每一題的觀念說明。', tags: ['SOP 提示', '構面追蹤', '即時說明', '不限時'], color: '#0d9488' },
  { id: 'independent', level: 'Level 2', title: '自主問診', desc: '不顯示完整評分指標，自行決定追問與病情說明；結束後提供完整回饋。', tags: ['無提示', '結束後回饋', '不限時'], color: '#2563eb' },
  { id: 'challenge', level: 'Level 3', title: 'OSCE 模擬挑戰', desc: '8 分鐘倒數，病人依 SP 劇本回答，不提供即時答案；時間到自動結束。', tags: ['8 分鐘', '不提供答案', '結束後回饋'], color: '#ea580c' },
];

type Screen = { name: 'intro' } | { name: 'session'; mode: ClinicModeId; key: number } | { name: 'report'; result: ClinicResult };

/** 案例：考生指引 → 選擇模式 → 虛擬診間 → 個別化報告 */
export function CaseApp({ c }: { c: CasePackage }) {
  const [screen, setScreen] = useState<Screen>({ name: 'intro' });
  const back = () => navigate('/history/clinic');

  const onFinish = useCallback(
    (result: ClinicResult) => {
      const ev = evaluateCase(c, result.state);
      recordRun('case', c.id, [{ activityId: c.id, score: ev.total, max: ev.max, notes: ev.items.filter((r) => r.score < 2).map(feedbackSentence) }], {
        title: `${c.code}：${c.title}`,
        mode: result.mode,
        durationSec: result.durationSec,
        result: result.endReason,
        detail: ev.items.map((r) => `${r.item.no}:${r.score}`).join(' '),
      });
      setScreen({ name: 'report', result });
    },
    [c],
  );

  if (screen.name === 'session') return <ClinicSession key={screen.key} c={c} mode={screen.mode} onFinish={onFinish} onExit={() => setScreen({ name: 'intro' })} />;
  if (screen.name === 'report') return <CaseReport caseData={c} result={screen.result} onRetry={() => setScreen({ name: 'intro' })} onBack={back} />;

  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '03 虛擬病人診間', to: '/history/clinic' }, { label: c.code }]}>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-[2rem] bg-white/90 p-5 shadow-sm ring-1 ring-blue-100 md:p-7">
          <p className="text-[12px] font-black tracking-[0.25em] text-blue-600">{c.code}｜考生指引</p>
          <h1 className="mt-1 text-3xl font-black text-slate-800">{c.title}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-bold">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800">場景：{c.patient.setting}</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800">測驗時間：{c.candidate.minutes} 分鐘</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800">病史詢問＋病情解釋及臨床處置</span>
            <ReviewBadge review={c.review} />
          </div>
          <h2 className="mt-5 text-[12px] font-black tracking-widest text-slate-400">背景資料</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{c.candidate.background}</p>
          <h2 className="mt-4 text-[12px] font-black tracking-widest text-slate-400">測驗主題</h2>
          <ul className="mt-1 space-y-1.5">
            {c.candidate.tasks.map((t) => (
              <li key={t} className="flex gap-2 text-[15px] leading-relaxed text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-[12px] text-slate-500">{c.candidate.notes.join(' ')}</p>
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-4 rounded-[2rem] bg-white/90 p-5 shadow-sm ring-1 ring-orange-100">
            <PatientAvatar look={c.patient} mood={c.patient.baselineMood} size={120} />
            <div>
              <p className="text-lg font-black text-slate-800">
                {c.patient.name}・{c.patient.age} 歲
              </p>
              <p className="text-[13px] text-slate-500">{c.patient.occupation}</p>
              <ul className="mt-1 space-y-0.5 text-[12px] text-slate-500">
                {c.patient.behavior.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white/90 p-4 shadow-sm ring-1 ring-slate-100">
            <p className="mb-2 text-[12px] font-black tracking-widest text-slate-400">相關檢查報告</p>
            <LabReport c={c} showFlags={false} />
          </div>
        </section>
      </div>

      <section className="mt-5">
        <h2 className="text-lg font-black text-slate-800">選擇練習模式</h2>
        <p className="text-[13px] text-slate-500">三種模式使用同一份案例資料與 SP 劇本。</p>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {MODES.map((m) => (
            <button key={m.id} type="button" onClick={() => setScreen({ name: 'session', mode: m.id, key: Date.now() })} className="flex flex-col rounded-3xl bg-white/90 p-5 text-left shadow-sm ring-2 ring-transparent transition hover:-translate-y-1 hover:ring-blue-200">
              <span className="text-[11px] font-black tracking-widest" style={{ color: m.color }}>
                {m.level}
              </span>
              <span className="text-xl font-black text-slate-800">{m.title}</span>
              <span className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">{m.desc}</span>
              <span className="mt-3 flex flex-wrap gap-1">
                {m.tags.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    {t}
                  </span>
                ))}
              </span>
              <span className="mt-4 rounded-xl py-2 text-center text-sm font-bold text-white" style={{ background: m.color }}>
                進入診間
              </span>
            </button>
          ))}
        </div>
      </section>

    </HQShell>
  );
}
