import { useMemo, useState } from 'react';
import { navigate } from '../../../router';
import { DemonstrationPlayer, demoStep, type DemoChapterDef } from '../../training/components/DemonstrationPlayer';
import { MOOD_LABEL, PatientAvatar } from '../../history/components/PatientAvatar';
import { PrimaryButton, QualityTag, ReviewBadge } from '../../history/components/Shell';
import type { Mood } from '../../history/types';
import { Card, CareShell, FrameworkNote, SkillChip } from '../components/CareShell';
import { DialoguePlayer, type PlayMode } from '../components/DialoguePlayer';
import { getVspCase, VSP_CASES } from '../cases/case-lin-anxiety';
import { CARE6 } from '../data/care6';
import { FRAMEWORKS } from '../data/frameworks';
import { choose, currentNode, nodeView, repeats, startDialogue } from '../engine/dialogue';
import { buildReport, LEVEL_LABEL } from '../engine/feedback';
import type { DialogueScenario, DialogueState, FeedbackReport } from '../types';
import { logCareStart, recordCare } from '../progress';

const CRUMB = { label: 'CARE ISLAND', to: '/care' };
/** 選項文字多已含「」，避免重複加引號 */
const say = (t: string) => (/^[「（]/.test(t) ? t : `「${t}」`);
const clip = (t: string, n = 40) => (t.length > n ? `${t.slice(0, n)}…` : t);
type VspMode = Exclude<PlayMode, 'theater'>;

const MODES: { id: VspMode; icon: string; title: string; en: string; color: string; desc: string; tags: string[] }[] = [
  { id: 'guided', icon: '🧭', title: '教學引導模式', en: 'Guided', color: '#0d9488', desc: '顯示 CARE-6 導覽與情緒線索，可分層查看提示；每一步立即回饋，並可重新選擇。', tags: ['CARE-6 導覽', '分層提示', '立即回饋'] },
  { id: 'independent', icon: '🛠️', title: '自主練習模式', en: 'Independent', color: '#1e40af', desc: '對話中不顯示正誤與提示，只能觀察病人的反應；結束後才有完整回饋。', tags: ['不顯示答案', '結束後回饋'] },
  { id: 'challenge', icon: '⏱️', title: 'OSCE 模擬挑戰', en: 'OSCE Challenge', color: '#dc2626', desc: '依本案例設定的時間倒數，時間到即結束；結束後回饋（模擬形成性評量）。', tags: ['案例計時', '一次完成'] },
];

/** 05 Virtual SP 挑戰中心 */
export function VspCenterPage() {
  return (
    <CareShell crumbs={[CRUMB, { label: '05 Virtual SP 挑戰中心' }]}>
      <h1 className="text-2xl font-black text-slate-800 md:text-3xl">🗣️ Virtual SP 挑戰中心</h1>
      <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-slate-600">與虛擬標準化病人進行多分支對話：你的每一句話都會影響病人的反應與後續發展。以選項式對話練習，不使用付費 AI。</p>
      <div className="mt-3">
        <FrameworkNote />
      </div>
      <section className="mt-5 grid gap-4 md:grid-cols-2">
        {VSP_CASES.map((c) => (
          <button key={c.id} type="button" onClick={() => navigate(`/care/vsp/${c.id}`)} className="flex gap-4 rounded-3xl bg-white/90 p-5 text-left shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-xl">
            <PatientAvatar look={c.patient} mood={c.patient.baselineMood} size={96} />
            <span className="min-w-0">
              <span className="block text-[11px] font-black tracking-widest text-teal-700">{c.code}｜原型案例</span>
              <span className="block text-lg font-black text-slate-800">{c.title}</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-slate-600">{c.summary}</span>
              <span className="mt-2 flex flex-wrap gap-1">
                <SkillChip tone="amber">📝 待教師審核</SkillChip>
                <SkillChip>{Object.keys(c.nodes).length - 1} 個對話節點</SkillChip>
                <SkillChip tone="coral">挑戰 {Math.round(c.timeLimitSec / 60)} 分鐘</SkillChip>
              </span>
            </span>
          </button>
        ))}
        <div className="flex flex-col justify-center rounded-3xl border-2 border-dashed border-orange-200 p-5 text-[13px] leading-relaxed text-slate-500">
          <p className="font-bold text-slate-600">➕ 新增案例</p>
          <p className="mt-1">案例資料與對話引擎分離：新增一個 DialogueScenario 檔案並加入 VSP_CASES 即可，不需修改引擎。正式考題與 SP 劇本須經授權後才能放入公開網站。</p>
        </div>
      </section>
    </CareShell>
  );
}

type View = { name: 'intro' } | { name: 'demo' } | { name: 'play'; mode: VspMode; run: number } | { name: 'report'; report: FeedbackReport; st: DialogueState; mode: VspMode };

export function VspCasePage({ caseId }: { caseId: string }) {
  const sc = getVspCase(caseId);
  const [view, setView] = useState<View>({ name: 'intro' });
  if (!sc)
    return (
      <CareShell crumbs={[CRUMB, { label: '找不到案例' }]}>
        <p>找不到這個案例。</p>
      </CareShell>
    );

  const start = (mode: VspMode) => {
    logCareStart(`vsp:${sc.id}`, `${sc.code} ${sc.title}`, mode);
    setView({ name: 'play', mode, run: Date.now() });
    window.scrollTo?.(0, 0);
  };

  if (view.name === 'demo')
    return (
      <div className="fixed inset-0 z-50">
        <VspDemo sc={sc} onExit={() => setView({ name: 'intro' })} onPractice={(m) => start(m)} />
      </div>
    );

  const crumbs = [CRUMB, { label: '05 Virtual SP', to: '/care/vsp' }, { label: sc.code }];
  if (view.name === 'play') {
    const m = MODES.find((x) => x.id === view.mode)!;
    return (
      <CareShell crumbs={crumbs} wide>
        <header className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full px-3 py-1 text-[12px] font-black text-white" style={{ background: m.color }}>
            {m.icon} {m.title}
          </span>
          <h1 className="text-lg font-black text-slate-800 md:text-xl">{sc.title}</h1>
          <button type="button" onClick={() => setView({ name: 'intro' })} className="ml-auto rounded-full bg-white px-3 py-1 text-[12px] font-bold text-slate-500 ring-1 ring-slate-200">
            ← 回到情境說明
          </button>
        </header>
        <DialoguePlayer
          key={view.run}
          scenario={sc}
          mode={view.mode}
          onEnd={(st, sec) => {
            const report = buildReport(sc, st, view.mode, sec);
            const shown = report.dimensions.filter((d) => d.level === 'shown').length;
            const observed = report.dimensions.filter((d) => d.level !== 'unobserved').length;
            recordCare('vsp', sc.id, `${sc.code} ${sc.title}`, {
              mode: view.mode,
              score: shown,
              max: observed,
              durationSec: sec,
              result: st.endReason ?? 'completed',
              detail: report.dimensions.map((d) => `${d.dim.id}:${d.level}`).join(','),
            });
            setView({ name: 'report', report, st, mode: view.mode });
            window.scrollTo?.(0, 0);
          }}
        />
      </CareShell>
    );
  }
  if (view.name === 'report')
    return (
      <CareShell crumbs={crumbs} wide>
        <VspReport sc={sc} report={view.report} st={view.st} onRetry={() => start(view.mode)} onModes={() => setView({ name: 'intro' })} onDemo={() => setView({ name: 'demo' })} />
      </CareShell>
    );

  return (
    <CareShell crumbs={crumbs}>
      <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
        <Card className="flex flex-col items-center text-center">
          <PatientAvatar look={sc.patient} mood={sc.patient.baselineMood} size={150} />
          <p className="mt-1 text-lg font-black text-slate-800">
            {sc.patient.name}・{sc.patient.age} 歲
          </p>
          <div className="mt-2">
            <ReviewBadge review={sc.review} />
          </div>
        </Card>
        <Card>
          <p className="text-[11px] font-black tracking-widest text-teal-700">{sc.code}｜考生說明（原型案例，非正式考題）</p>
          <h1 className="text-2xl font-black text-slate-800">{sc.title}</h1>
          <ul className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-slate-700">
            {sc.candidateBrief.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] font-black tracking-widest text-orange-600">本次任務</p>
          <ol className="mt-1 grid gap-1 text-[13.5px] text-slate-700 sm:grid-cols-2">
            {sc.tasks.map((t, i) => (
              <li key={t}>
                {i + 1}. {t}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[12px] text-slate-400">OSCE 模擬挑戰時間：本案例設定 {Math.round(sc.timeLimitSec / 60)} 分鐘（依案例設定；正式考站時間以教師設定為準）。</p>
        </Card>
      </div>

      <h2 className="mt-6 text-xl font-black text-slate-800">選擇模式</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <button type="button" onClick={() => setView({ name: 'demo' })} className="relative flex flex-col rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-5 text-left shadow-sm ring-2 ring-emerald-300 transition hover:-translate-y-1">
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">原型・待審核</span>
          <span className="text-3xl">🎬</span>
          <span className="mt-2 text-lg font-black text-slate-800">正確示範模式</span>
          <span className="text-[11px] font-bold text-emerald-700">Demonstration</span>
          <span className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">觀看一條示範對話路徑：旁白、字幕、可暫停與調整速度，依 CARE-6 章節跳轉，並標示每句話使用的溝通技巧。</span>
          <span className="mt-3 flex flex-wrap gap-1">
            <SkillChip>旁白＋字幕</SkillChip>
            <SkillChip>章節</SkillChip>
            <SkillChip>技巧標籤</SkillChip>
          </span>
        </button>
        {MODES.map((m) => (
          <button key={m.id} type="button" onClick={() => start(m.id)} className="flex flex-col rounded-3xl bg-white/90 p-5 text-left shadow-sm ring-2 ring-transparent transition hover:-translate-y-1 hover:ring-orange-300">
            <span className="text-3xl">{m.icon}</span>
            <span className="mt-2 text-lg font-black text-slate-800">{m.title}</span>
            <span className="text-[11px] font-bold" style={{ color: m.color }}>
              {m.en}
            </span>
            <span className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">{m.desc}</span>
            <span className="mt-3 flex flex-wrap gap-1">
              {m.tags.map((t) => (
                <SkillChip key={t} tone="slate">
                  {t}
                </SkillChip>
              ))}
            </span>
          </button>
        ))}
      </div>
    </CareShell>
  );
}

/* ------------------------------------------------------------------ */
/* 示範模式（DemonstrationTimeline：由案例的示範路徑產生）                    */
/* ------------------------------------------------------------------ */

interface Line {
  who: 'patient' | 'doctor';
  text: string;
  mood?: Mood;
  skills?: string[];
}
type DemoAction = { type: 'say'; line: Line };

function buildDemo(sc: DialogueScenario): DemoChapterDef<DemoAction>[] {
  let st = startDialogue(sc);
  const chapters: DemoChapterDef<DemoAction>[] = [];
  for (const p of sc.demoPath) {
    const n = currentNode(sc, st);
    if (n.dialogueId !== p.node) throw new Error(`示範路徑不一致：預期 ${p.node}，實際 ${n.dialogueId}`);
    const v = nodeView(n, st.flags);
    const o = n.responseOptions.find((x) => x.id === p.option)!;
    const lesson = CARE6.find((l) => l.id === n.stage)!;
    const title = `${lesson.letter} ${lesson.englishTitle}｜${lesson.title}`;
    const step = demoStep<DemoAction, string>({
      stepId: `${n.dialogueId}-${o.id}`,
      practiceStepId: n.stage,
      title: n.task,
      duration: 2500,
      cameraPreset: 'dialogue',
      animationAction: [],
      cues: [
        ...p.narration.map((t) => ({ text: t })),
        ...(repeats(st.turns[st.turns.length - 1]?.reply, v.message) ? [] : [{ text: `病人：${v.message}`, actions: [{ type: 'say' as const, line: { who: 'patient' as const, text: v.message, mood: v.mood } }] }]),
        { text: `醫師：${o.text}`, actions: [{ type: 'say' as const, line: { who: 'doctor' as const, text: o.text, skills: o.skills } }] },
        { text: `病人：${o.reply}`, actions: [{ type: 'say' as const, line: { who: 'patient' as const, text: o.reply, mood: o.replyMood } }] },
      ],
      highlightedObjects: o.skills,
      teachingPoints: [o.feedback, n.feedbackRules.why].filter(Boolean),
      safetyNotes: [],
      source: 'case',
    });
    const last = chapters[chapters.length - 1];
    if (last && last.title === title) last.steps.push(step);
    else chapters.push({ id: `${n.stage}-${chapters.length}`, title, steps: [step] });
    st = choose(sc, st, o.id);
  }
  return chapters;
}

function VspDemo({ sc, onExit, onPractice }: { sc: DialogueScenario; onExit: () => void; onPractice: (m: VspMode) => void }) {
  const chapters = useMemo(() => buildDemo(sc), [sc]);
  return (
    <DemonstrationPlayer<Line[], DemoAction, string>
      title={`${sc.code} ${sc.title}`}
      chapters={chapters}
      initialState={() => []}
      apply={(s, a) => [...s, a.line]}
      sourceLabels={{ case: '示範路徑（原型・待教師審核）', supplement: '補充' }}
      highlightTitle="🏷️ 這一句使用的溝通技巧"
      reviewBanner={<p className="mb-2 rounded-2xl bg-amber-50 px-3 py-1.5 text-[12px] font-bold text-amber-800 ring-1 ring-amber-200">📝 示範原型・待教師審核：這是其中一條適當的對話路徑，不是唯一標準答案；選項式示範無法呈現語氣與非語言溝通。</p>}
      renderView={({ state }) => (
        <div className="grid gap-3 md:grid-cols-[11rem_1fr]">
          <div className="flex flex-col items-center rounded-3xl bg-white/90 p-3 shadow-sm">
            <PatientAvatar look={sc.patient} mood={[...state].reverse().find((l) => l.who === 'patient')?.mood ?? sc.patient.baselineMood} size={130} />
            <p className="text-[13px] font-black text-slate-700">{sc.patient.name}</p>
          </div>
          <div className="space-y-2 rounded-3xl bg-white/70 p-3">
            {state.slice(-6).map((l, i) => (
              <div key={`${state.length}-${i}`} className={`flex ${l.who === 'doctor' ? 'justify-end' : ''}`}>
                <div className={`max-w-[88%] animate-fade-up rounded-2xl px-3 py-2 text-[14px] leading-relaxed shadow-sm ${l.who === 'doctor' ? 'rounded-tr-sm bg-teal-600 text-white' : 'rounded-tl-sm bg-orange-50 text-slate-800'}`}>
                  {l.text}
                  {l.skills && l.skills.length > 0 && (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {l.skills.map((s) => (
                        <span key={s} className="rounded-full bg-white/25 px-1.5 text-[10px] font-bold">
                          {s}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {state.length === 0 && <p className="text-[13px] text-slate-400">示範即將開始……</p>}
          </div>
        </div>
      )}
      onExit={onExit}
      exitLabel="← 回到情境說明"
      onPractice={(m) => onPractice(m)}
      summary={['開場：自我介紹、確認身分、說明目的', '先了解病人已知的資訊與擔心（Ask before tell、ICE）', '情緒出現時先回應（NURSE）', '確認資訊偏好，用日常語言說明並誠實面對不確定性', '把病人的生活考量納入計畫，並用 teach-back 確認理解', '摘要、等待期間的支持與聯絡方式、最後提問']}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 形成性回饋報告                                                          */
/* ------------------------------------------------------------------ */

function VspReport({ sc, report, st, onRetry, onModes, onDemo }: { sc: DialogueScenario; report: FeedbackReport; st: DialogueState; onRetry: () => void; onModes: () => void; onDemo: () => void }) {
  const mode = MODES.find((m) => m.id === report.mode);
  const mm = Math.floor(report.durationSec / 60);
  const ss = Math.round(report.durationSec % 60);
  return (
    <div className="animate-fade-up space-y-4">
      <header className="rounded-[2rem] bg-gradient-to-br from-[#fb7c6b] to-[#2bb3a3] p-5 text-white shadow-lg md:p-7">
        <p className="text-[12px] font-black tracking-widest text-orange-50">溝通表現回饋｜模擬形成性評量</p>
        <h1 className="mt-1 text-2xl font-black md:text-3xl">{sc.title}</h1>
        <p className="mt-1 text-[13px] text-white/90">
          {mode?.icon} {mode?.title}・用時 {mm} 分 {ss} 秒・{report.endReason === 'timeout' ? '時間到結束' : report.endReason === 'quit' ? '提前結束' : '完成對話'}・{st.turns.length} 次回應
        </p>
        <p className="mt-2 rounded-2xl bg-white/15 px-3 py-1.5 text-[12px] font-bold">這不是正式 OSCE 分數；以下為學習用的分析面向，不取代教師與 SP 的回饋。</p>
      </header>

      <Card>
        <h2 className="text-lg font-black text-slate-800">📊 九個分析面向</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {report.dimensions.map((d) => (
            <details key={d.dim.id} className="group rounded-2xl bg-white p-3 ring-1 ring-slate-100 open:ring-orange-200">
              <summary className="flex cursor-pointer list-none items-center gap-2">
                <span className="flex-1 text-[14px] font-black text-slate-800">{d.dim.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${LEVEL_LABEL[d.level].cls}`}>{LEVEL_LABEL[d.level].label}</span>
              </summary>
              <p className="mt-1 text-[12px] text-slate-500">{d.dim.description}</p>
              {d.shown.map((x, i) => (
                <p key={`s${i}`} className="mt-1.5 text-[12.5px] text-emerald-800">
                  ✓ {x.note}
                  <span className="block text-slate-500">{say(clip(x.utterance))}</span>
                </p>
              ))}
              {d.missed.map((x, i) => (
                <p key={`m${i}`} className="mt-1.5 text-[12.5px] text-rose-800">
                  △ {x.note}
                  <span className="block text-slate-500">{say(clip(x.utterance))}</span>
                </p>
              ))}
              {d.level === 'unobserved' && <p className="mt-1.5 text-[12px] text-slate-400">本次對話中沒有觀察到相關的回應。</p>}
            </details>
          ))}
        </div>
      </Card>

      {report.safety.length > 0 && (
        <Card className="ring-2 ring-rose-200">
          <h2 className="text-lg font-black text-rose-700">⚠️ 專業與安全溝通提醒</h2>
          <ul className="mt-2 space-y-2">
            {report.safety.map((s, i) => (
              <li key={i} className="rounded-2xl bg-rose-50 px-3 py-2 text-[13.5px]">
                <b className="text-rose-800">{s.flag}</b>
                <span className="block text-slate-600">你說：{say(s.utterance)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-black text-emerald-700">🌟 做得好的地方</h2>
          {report.strengths.length === 0 && <p className="mt-2 text-[13px] text-slate-500">這次沒有特別突出的回應，參考下方建議再試一次。</p>}
          <ul className="mt-2 space-y-2">
            {report.strengths.map((s, i) => (
              <li key={i} className="rounded-2xl bg-emerald-50/70 p-3 text-[13px]">
                <p className="text-slate-800">你說：{say(s.utterance)}</p>
                <p className="mt-1 text-emerald-800">✓ {s.note}</p>
                <p className="mt-1 text-slate-500">病人：{s.patient}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-lg font-black text-amber-700">🔧 可以再加強</h2>
          {report.improvements.length === 0 && <p className="mt-2 text-[13px] text-slate-500">每一步都選擇了適當的回應。可以試試自主練習或挑戰模式。</p>}
          <ul className="mt-2 space-y-2">
            {report.improvements.map((s, i) => (
              <li key={i} className="rounded-2xl bg-amber-50/70 p-3 text-[13px]">
                <p className="text-slate-800">你說：{say(s.utterance)}</p>
                <p className="mt-1 text-slate-500">病人：{s.patient}</p>
                <p className="mt-1 text-amber-900">△ {s.note}</p>
                {s.better && <p className="mt-1 text-teal-800">💬 可參考說法：{s.better}</p>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-black text-slate-800">🗂️ 對話紀錄</h2>
        <ol className="mt-2 space-y-2">
          {st.turns.map((t, i) => {
            const stage = CARE6.find((l) => l.id === t.stage)!;
            return (
              <li key={i} className="grid gap-2 rounded-2xl bg-orange-50/40 p-3 text-[13px] md:grid-cols-[6rem_1fr]">
                <span className="text-[11px] font-black" style={{ color: stage.color }}>
                  {stage.letter} {stage.englishTitle}
                  {t.atSec > 0 && <span className="block font-bold text-slate-400">{Math.floor(t.atSec / 60)}:{String(t.atSec % 60).padStart(2, '0')}</span>}
                </span>
                <span className="space-y-1">
                  <span className="block text-slate-500">病人：{t.patientLine}</span>
                  <span className="flex flex-wrap items-center gap-1.5 text-slate-800">
                    你：{t.text} <QualityTag q={t.quality} />
                    {t.retried && <SkillChip tone="slate">重新選擇</SkillChip>}
                    {!!t.hintsUsed && <SkillChip tone="amber">提示 {t.hintsUsed}</SkillChip>}
                  </span>
                  <span className="block text-slate-600">
                    病人反應（{MOOD_LABEL[t.replyMood]}）：{t.reply}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      {(report.suggestedLessons.length > 0 || report.suggestedTools.length > 0) && (
        <Card>
          <h2 className="text-lg font-black text-slate-800">📚 建議重練</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {report.suggestedLessons.map((id) => {
              const l = CARE6.find((x) => x.id === id)!;
              return (
                <button key={id} type="button" onClick={() => navigate(`/care/academy/${id}`)} className="rounded-2xl px-3 py-2 text-[13px] font-bold text-white shadow" style={{ background: l.color }}>
                  CARE-6 {l.letter} {l.title} →
                </button>
              );
            })}
            {report.suggestedTools.map((id) => {
              const f = FRAMEWORKS.find((x) => x.id === id)!;
              return (
                <button key={id} type="button" onClick={() => navigate(`/care/tools/${id}`)} className="rounded-2xl bg-white px-3 py-2 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200">
                  {f.icon} {f.name} →
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="bg-slate-50/90">
        <h2 className="text-[14px] font-black text-slate-600">ℹ️ 本回饋的限制</h2>
        <ul className="mt-1 space-y-1 text-[12.5px] leading-relaxed text-slate-500">
          {report.limitations.map((l) => (
            <li key={l}>• {l}</li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap gap-2">
        <PrimaryButton tone="orange" onClick={onRetry}>
          ↺ 再練一次（同模式）
        </PrimaryButton>
        <PrimaryButton tone="ghost" onClick={onModes}>
          切換模式
        </PrimaryButton>
        <PrimaryButton tone="ghost" onClick={onDemo}>
          🎬 觀看示範
        </PrimaryButton>
      </div>
    </div>
  );
}
