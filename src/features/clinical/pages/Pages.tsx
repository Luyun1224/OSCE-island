import { useEffect, useState } from 'react';
import { navigate } from '../../../router';
import { ReviewBadge } from '../../history/components/Shell';
import { ActivityRun } from '../../care/components/ActivityRun';
import { ReportView } from '../components/ReportView';
import { Btn, ClinicalShell, DemoNote, Panel, VitalsMonitor } from '../components/ui';
import { VisualCardView } from '../components/VisualCardView';
import { CLINICAL_CASES, DEMO_UROSEPSIS } from '../cases/demo-urosepsis';
import { CLINICAL_BUILDINGS } from '../data/buildings';
import { CLINICAL6, CLINICAL6_NOTE, getClinicalLesson } from '../data/clinical6';
import { CluePuzzle } from '../games/CluePuzzle';
import { DdxArena } from '../games/DdxArena';
import { ExplainChallenge } from '../games/ExplainChallenge';
import { ManagementSim } from '../games/ManagementSim';
import { doneClinical, logClinicalStart, recordClinical } from '../progress';
import type { ClinicalCase, DecisionEvent, GameResult } from '../types';

const CRUMB = { label: 'CLINICAL DECISION', to: '/clinical' };

/* ------------------------------------------------------------------ */

export function HubPage() {
  return (
    <ClinicalShell crumbs={[{ label: 'CLINICAL DECISION ISLAND' }]}>
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#312e81] via-[#4338ca] to-[#0f766e] p-6 text-white shadow-glass md:p-10">
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-orange-400/25 blur-3xl" />
        <p className="text-[12px] font-black tracking-[0.3em] text-teal-200">CLINICAL DECISION ISLAND</p>
        <h1 className="mt-1 text-3xl font-black md:text-5xl">病情解釋與臨床處置島</h1>
        <p className="mt-3 text-lg font-bold text-orange-200 md:text-xl">「為什麼這樣判斷？為什麼這樣處理？」</p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-indigo-100">從辨識危急狀況、整理問題摘要、比較鑑別診斷，到選擇檢查與處置、向病人解釋——練習完整的臨床推理過程，而不只是選出正確診斷。</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate('/clinical/academy')} className="rounded-2xl bg-white px-5 py-2 font-bold text-indigo-700 shadow-lg">
            從 CLINICAL-6 開始 →
          </button>
          <button type="button" onClick={() => navigate('/clinical/challenge')} className="rounded-2xl bg-orange-500 px-5 py-2 font-bold shadow-lg hover:bg-orange-400">
            直接挑戰整合病例 →
          </button>
        </div>
      </header>
      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CLINICAL_BUILDINGS.map((b) => (
          <article key={b.id} className="relative flex flex-col overflow-hidden rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-indigo-100 transition hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: b.color }} />
            <div className="flex items-start gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: `${b.color}1a` }}>
                {b.icon}
              </span>
              <div>
                <p className="text-[12px] font-black tracking-widest" style={{ color: b.color }}>
                  {b.no}｜{b.englishTitle}
                </p>
                <h2 className="text-xl font-black text-slate-800">{b.title}</h2>
              </div>
            </div>
            <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-600">{b.description}</p>
            <button type="button" onClick={() => navigate(b.route)} className="mt-4 rounded-2xl py-2.5 text-sm font-bold text-white shadow hover:brightness-110" style={{ background: b.color }}>
              進入{b.title} →
            </button>
          </article>
        ))}
      </section>
      <div className="mt-6 space-y-2">
        <DemoNote text={CLINICAL6_NOTE} />
        <DemoNote />
      </div>
    </ClinicalShell>
  );
}

/* ------------------------------------------------------------------ */

function Clinical6Bar({ active }: { active?: string }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-3xl bg-white/80 p-2 shadow-sm ring-1 ring-indigo-100 md:grid-cols-6">
      {CLINICAL6.map((l) => {
        const on = active === l.id;
        return (
          <button key={l.id} type="button" onClick={() => navigate(`/clinical/academy/${l.id}`)} className={`flex flex-col items-center rounded-2xl px-1 py-2 ${on ? 'text-white shadow-lg' : 'bg-white ring-1 ring-slate-100 hover:-translate-y-0.5'}`} style={on ? { background: l.color } : undefined}>
            <span className="text-[18px] font-black" style={on ? undefined : { color: l.color }}>
              {l.letter}
            </span>
            <span className={`text-[10px] font-bold ${on ? 'text-white/85' : 'text-slate-500'}`}>{l.englishTitle}</span>
            {doneClinical('lesson', l.id) && <span className="text-[9px] font-black text-emerald-500">{on ? '' : '✓'}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function AcademyPage() {
  return (
    <ClinicalShell crumbs={[CRUMB, { label: '01 臨床推理學院' }]}>
      <h1 className="text-2xl font-black text-slate-800 md:text-3xl">🎓 臨床推理學院｜CLINICAL-6</h1>
      <p className="mt-1 max-w-3xl text-[14px] text-slate-600">六個單元：每單元有核心教學、臨床情境、圖像化學習卡、小遊戲、即時回饋、重新練習與安全提醒。</p>
      <div className="mt-3">
        <DemoNote text={CLINICAL6_NOTE} />
      </div>
      <div className="mt-4">
        <Clinical6Bar />
      </div>
      <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CLINICAL6.map((l) => (
          <button key={l.id} type="button" onClick={() => navigate(`/clinical/academy/${l.id}`)} className="flex flex-col rounded-3xl bg-white/90 p-4 text-left shadow-sm ring-1 ring-indigo-100 transition hover:-translate-y-1 hover:shadow-lg">
            <span className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl font-black text-white" style={{ background: l.color }}>
                {l.letter}
              </span>
              <span>
                <span className="block text-[11px] font-black tracking-widest text-slate-400">UNIT {l.order}｜{l.englishTitle}</span>
                <span className="block text-lg font-black text-slate-800">
                  {l.icon} {l.title}
                </span>
              </span>
            </span>
            <span className="mt-2 text-[13px] text-slate-600">{l.goal}</span>
          </button>
        ))}
      </section>
    </ClinicalShell>
  );
}

export function LessonPage({ id }: { id: string }) {
  const l = getClinicalLesson(id);
  const [practice, setPractice] = useState(false);
  const [t0, setT0] = useState(Date.now());
  if (!l)
    return (
      <ClinicalShell crumbs={[CRUMB, { label: '找不到單元' }]}>
        <p>找不到這個單元。</p>
      </ClinicalShell>
    );
  const next = CLINICAL6.find((x) => x.order === l.order + 1);
  return (
    <ClinicalShell crumbs={[CRUMB, { label: '01 臨床推理學院', to: '/clinical/academy' }, { label: `${l.letter}｜${l.englishTitle}` }]}>
      <Clinical6Bar active={l.id} />
      <header className="mt-4 flex flex-wrap items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black text-white shadow" style={{ background: l.color }}>
          {l.letter}
        </span>
        <div>
          <p className="text-[11px] font-black tracking-widest" style={{ color: l.color }}>
            UNIT {l.order}｜{l.englishTitle}
          </p>
          <h1 className="text-2xl font-black text-slate-800 md:text-3xl">
            {l.icon} {l.title}
          </h1>
        </div>
        <span className="ml-auto">
          <ReviewBadge review={l.review} />
        </span>
      </header>
      <p className="mt-2 text-[15px] font-bold text-slate-700">🎯 {l.goal}</p>

      {!practice ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              {l.lessons.map((c) => (
                <Panel key={c.title}>
                  <h3 className="text-lg font-black text-slate-800">{c.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate-600">{c.body}</p>
                  {c.bullets && (
                    <ul className="mt-2 space-y-1 text-[13.5px] text-slate-700">
                      {c.bullets.map((b) => (
                        <li key={b}>
                          <span style={{ color: l.color }}>● </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {c.good && <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-[13px] text-emerald-800">✅ {c.good}</p>}
                  {c.bad && <p className="mt-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-[13px] text-rose-800">⚠️ {c.bad}</p>}
                </Panel>
              ))}
            </div>
            <div className="space-y-4">
              <VisualCardView card={l.visual} />
              <Panel>
                <p className="text-[12px] font-black tracking-widest text-indigo-600">🏥 臨床情境：{l.scenario.title}</p>
                <p className="mt-1 text-[14px] text-slate-700">{l.scenario.text}</p>
              </Panel>
              <Panel className="ring-2 ring-orange-200">
                <p className="text-[12px] font-black tracking-widest text-orange-600">⚠️ 安全提醒</p>
                <ul className="mt-1 space-y-1 text-[13.5px] text-slate-700">
                  {l.safety.map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>
          <Btn
            tone="orange"
            onClick={() => {
              logClinicalStart(`lesson:${l.id}`, `CLINICAL-6 ${l.englishTitle}`);
              setT0(Date.now());
              setPractice(true);
            }}
          >
            🎮 開始小遊戲 →
          </Btn>
        </div>
      ) : (
        <div className="mt-4">
          <ActivityRun
            activities={l.activities}
            onFinish={(rs) => recordClinical('lesson', l.id, `CLINICAL-6 ${l.letter} ${l.englishTitle}：${l.title}`, { score: rs.reduce((s, r) => s + r.score, 0), max: rs.reduce((s, r) => s + r.max, 0), durationSec: (Date.now() - t0) / 1000 })}
            finishSlot={(_, retry) => (
              <div className="space-y-3">
                <Panel>
                  <p className="text-[12px] font-black tracking-widest text-teal-700">📌 本單元重點</p>
                  <ul className="mt-1 space-y-1 text-[14px] text-slate-700">
                    {l.takeaways.map((t) => (
                      <li key={t}>✓ {t}</li>
                    ))}
                  </ul>
                </Panel>
                <div className="flex flex-wrap gap-2">
                  <Btn
                    tone="ghost"
                    onClick={() => {
                      setT0(Date.now());
                      retry();
                    }}
                  >
                    ↺ 重新練習
                  </Btn>
                  <Btn tone="ghost" onClick={() => setPractice(false)}>
                    📖 回到教學
                  </Btn>
                  {next ? (
                    <Btn onClick={() => navigate(`/clinical/academy/${next.id}`)}>
                      下一單元：{next.letter} {next.title} →
                    </Btn>
                  ) : (
                    <Btn tone="orange" onClick={() => navigate('/clinical/lab')}>
                      前往診斷線索實驗室 →
                    </Btn>
                  )}
                </div>
              </div>
            )}
          />
        </div>
      )}
    </ClinicalShell>
  );
}

/* ------------------------------------------------------------------ */

const GAMES = {
  clues: { no: 'Game 1', title: '臨床線索拼圖', icon: '🧩', building: '02 診斷線索實驗室', to: '/clinical/lab', next: '/clinical/lab/ddx' },
  ddx: { no: 'Game 2', title: '鑑別診斷擂台', icon: '⚖️', building: '02 診斷線索實驗室', to: '/clinical/lab', next: '/clinical/decision' },
  manage: { no: 'Game 3', title: '臨床處置模擬器', icon: '🩺', building: '03 臨床處置決策中心', to: '/clinical/decision', next: '/clinical/explain' },
  explain: { no: 'Game 4', title: '病情解釋挑戰', icon: '🗣️', building: '04 病情解釋模擬診間', to: '/clinical/explain', next: '/clinical/challenge' },
} as const;
type GameId = keyof typeof GAMES;

function CaseBrief({ c, compact }: { c: ClinicalCase; compact?: boolean }) {
  return (
    <Panel>
      <p className="flex flex-wrap items-center gap-2 text-[12px] font-black tracking-widest text-indigo-600">
        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-white">{c.tag}</span>
        {c.code}｜{c.setting}
        <span className="ml-auto">
          <ReviewBadge review={c.review} />
        </span>
      </p>
      <h2 className="mt-1 text-xl font-black text-slate-800">{c.title}</h2>
      {!compact && (
        <ul className="mt-2 space-y-1 text-[14px] text-slate-700">
          {c.candidateBrief.map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function GameView({ id, c, defer, onComplete }: { id: GameId; c: ClinicalCase; defer?: boolean; onComplete: (r: GameResult) => void }) {
  if (id === 'clues') return <CluePuzzle c={c} defer={defer} onComplete={onComplete} />;
  if (id === 'ddx') return <DdxArena c={c} defer={defer} onComplete={onComplete} />;
  if (id === 'manage') return <ManagementSim c={c} defer={defer} onComplete={onComplete} />;
  return <ExplainChallenge c={c} defer={defer} onComplete={onComplete} />;
}

export function LabPage() {
  return (
    <ClinicalShell crumbs={[CRUMB, { label: '02 診斷線索實驗室' }]}>
      <h1 className="text-2xl font-black text-slate-800 md:text-3xl">🧪 診斷線索實驗室</h1>
      <p className="mt-1 text-[14px] text-slate-600">用 DEMO 病例練習：先把資料整理成問題摘要，再比較鑑別診斷。</p>
      <div className="mt-4">
        <CaseBrief c={DEMO_UROSEPSIS} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(['clues', 'ddx'] as GameId[]).map((g) => (
          <button key={g} type="button" onClick={() => navigate(`/clinical/lab/${g}`)} className="rounded-3xl bg-white/90 p-5 text-left shadow-sm ring-1 ring-indigo-100 transition hover:-translate-y-1 hover:shadow-xl">
            <span className="text-4xl">{GAMES[g].icon}</span>
            <p className="mt-2 text-[12px] font-black tracking-widest text-teal-700">{GAMES[g].no}</p>
            <p className="text-xl font-black text-slate-800">{GAMES[g].title}</p>
            <p className="mt-1 text-[13px] text-slate-600">{g === 'clues' ? '拖曳或點選病歷、生命徵象與檢驗卡片，組成保留關鍵陽性／陰性、時間特徵與嚴重度的問題摘要。' : '選擇並排序診斷，為診斷配置支持與反對證據，標示不能漏掉的疾病；回饋說明每個診斷的推理理由。'}</p>
            {doneClinical('game', g) && <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">✓ 已完成</span>}
          </button>
        ))}
      </div>
    </ClinicalShell>
  );
}

/** 單一遊戲頁（教學模式：每一步即時回饋） */
export function GamePage({ id }: { id: GameId }) {
  const g = GAMES[id];
  const c = DEMO_UROSEPSIS;
  const [run, setRun] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [logged] = useState(() => logClinicalStart(`game:${id}`, `${g.no} ${g.title}`, 'guided'));
  void logged;
  return (
    <ClinicalShell crumbs={[CRUMB, { label: g.building, to: g.to }, { label: `${g.no} ${g.title}` }]} wide>
      <h1 className="text-2xl font-black text-slate-800">
        {g.icon} {g.no}｜{g.title}
      </h1>
      <div className="mt-3">
        <CaseBrief c={c} compact={!!result} />
      </div>
      {!result && (id === 'clues' || id === 'ddx') && (
        <div className="mt-3">
          <VitalsMonitor s={c.initialState} title="到院時" wide />
        </div>
      )}
      <div className="mt-4">
        {!result ? (
          <GameView
            key={run}
            id={id}
            c={c}
            onComplete={(r) => {
              setResult(r);
              const good = r.events.filter((e) => e.quality === 'good').length;
              recordClinical('game', id, `${g.no} ${g.title}`, { score: good, max: r.events.length, durationSec: r.durationSec, mode: 'guided', result: r.events.some((e) => e.safety) ? 'safety-event' : 'completed' });
              window.scrollTo?.(0, 0);
            }}
          />
        ) : (
          <div className="space-y-4">
            <ReportView caseId={c.id} events={result.events} only={[id]} />
            <div className="flex flex-wrap gap-2">
              <Btn
                tone="ghost"
                onClick={() => {
                  logClinicalStart(`game:${id}`, `${g.no} ${g.title}`, 'guided');
                  setResult(null);
                  setRun((r) => r + 1);
                }}
              >
                ↺ 重新練習
              </Btn>
              <Btn onClick={() => navigate(g.next)}>下一關 →</Btn>
            </div>
          </div>
        )}
      </div>
    </ClinicalShell>
  );
}

/* ------------------------------------------------------------------ */

const SEQ: GameId[] = ['clues', 'ddx', 'manage', 'explain'];

/** 05 OSCE 臨床決策挑戰館：同一病例連續四關、過程不顯示答案、依病例時間計時 */
export function ChallengePage() {
  const [stage, setStage] = useState<'intro' | number | 'report'>('intro');
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const [t0, setT0] = useState(0);
  const [now, setNow] = useState(0);
  const c = DEMO_UROSEPSIS;
  const elapsed = Math.floor((now - t0) / 1000);

  const start = () => {
    logClinicalStart(`challenge:${c.id}`, `${c.code} 整合挑戰`, 'challenge');
    setEvents([]);
    setT0(Date.now());
    setNow(Date.now());
    setStage(0);
  };

  if (typeof stage === 'number') {
    const g = SEQ[stage];
    return (
      <ClinicalShell crumbs={[CRUMB, { label: '05 OSCE 臨床決策挑戰館' }]} wide>
        <Ticker onTick={setNow} />
        <header className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-500 px-3 py-1 text-[12px] font-black text-white">
            第 {stage + 1} / 4 關｜{GAMES[g].title}
          </span>
          <span className={`ml-auto rounded-full px-3 py-1 text-[13px] font-black tabular-nums ${elapsed > c.timeLimitSec ? 'bg-red-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
            ⏱️ {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} / 建議 {Math.round(c.timeLimitSec / 60)} 分鐘
          </span>
        </header>
        <p className="mb-3 text-[12.5px] text-slate-500">挑戰模式：過程中不顯示答案，完成四關後查看整合回饋。</p>
        {(g === 'clues' || g === 'ddx') && (
          <div className="mb-3">
            <VitalsMonitor s={c.initialState} title="到院時" wide />
          </div>
        )}
        <GameView
          key={g}
          id={g}
          c={c}
          defer
          onComplete={(r) => {
            const all = [...events, ...r.events];
            setEvents(all);
            if (stage + 1 < SEQ.length) setStage(stage + 1);
            else {
              const good = all.filter((e) => e.quality === 'good').length;
              recordClinical('challenge', c.id, `${c.code} 整合挑戰`, { mode: 'challenge', score: good, max: all.length, durationSec: (Date.now() - t0) / 1000, result: all.some((e) => e.safety) ? 'safety-event' : 'completed' });
              setStage('report');
            }
            window.scrollTo?.(0, 0);
          }}
        />
      </ClinicalShell>
    );
  }

  return (
    <ClinicalShell crumbs={[CRUMB, { label: '05 OSCE 臨床決策挑戰館' }]}>
      <h1 className="text-2xl font-black text-slate-800 md:text-3xl">🏆 OSCE 臨床決策挑戰館</h1>
      {stage === 'report' ? (
        <div className="mt-4 space-y-4">
          <Panel className="bg-gradient-to-r from-indigo-700 to-teal-600 text-white">
            <p className="text-[12px] font-black tracking-widest text-teal-100">整合回饋｜模擬形成性評量</p>
            <p className="text-xl font-black">{c.title}</p>
            <p className="text-[13px] text-indigo-100">
              用時 {Math.floor(elapsed / 60)} 分 {elapsed % 60} 秒（本病例建議 {Math.round(c.timeLimitSec / 60)} 分鐘）・{events.length} 個決策事件
            </p>
          </Panel>
          <ReportView caseId={c.id} events={events} />
          <div className="flex flex-wrap gap-2">
            <Btn tone="orange" onClick={start}>
              ↺ 再挑戰一次
            </Btn>
            <Btn tone="ghost" onClick={() => navigate('/clinical/academy')}>
              回臨床推理學院
            </Btn>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-[14px] text-slate-600">選擇病例，連續完成四關：線索拼圖 → 鑑別診斷 → 處置模擬 → 病情解釋。過程中不顯示答案，結束後查看整合回饋；病人安全事件會獨立列出。</p>
          {CLINICAL_CASES.map((cs) => (
            <div key={cs.id} className="space-y-3">
              <CaseBrief c={cs} />
              <VitalsMonitor s={cs.initialState} title="到院時" wide />
              <Panel>
                <p className="text-[13px] text-slate-600">本病例建議完成時間：{Math.round(cs.timeLimitSec / 60)} 分鐘（依病例設定）。</p>
                <div className="mt-2">
                  <Btn tone="orange" onClick={start}>
                    開始整合挑戰 →
                  </Btn>
                </div>
              </Panel>
            </div>
          ))}
          <Panel className="border-2 border-dashed border-indigo-200 bg-transparent shadow-none">
            <p className="text-[13px] font-bold text-slate-600">➕ 更多病例</p>
            <p className="mt-1 text-[12.5px] text-slate-500">病例資料與遊戲引擎分離：新增一個 ClinicalCase 檔案即可使用四個遊戲。正式考題與評分標準須經授權，不放入公開網站。</p>
          </Panel>
          <DemoNote />
        </div>
      )}
    </ClinicalShell>
  );
}

function Ticker({ onTick }: { onTick: (n: number) => void }) {
  useEffect(() => {
    const id = window.setInterval(() => onTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [onTick]);
  return null;
}
