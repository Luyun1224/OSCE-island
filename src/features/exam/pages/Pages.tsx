import { lazy, Suspense, useState } from 'react';
import { navigate } from '../../../router';
import { ActivityRun } from '../../care/components/ActivityRun';
import { ReviewBadge } from '../../history/components/Shell';
import type { Overlay, View } from '../anatomy/BodyViewer';
import { HitCard } from '../components/HitCard';
import { Card, ExamShell, GoButton, Note, OBS } from '../components/ExamShell';
import { BODY_MODEL } from '../data/anatomyModel';
import { EXAM_BUILDINGS } from '../data/buildings';
import { LOCATE_TASKS } from '../data/locateTasks';
import { DEMO_ABDOMEN, PE_RUBRIC, SOUNDS } from '../data/misc';
import { PE7, PE7_GAMES, PE7_NOTE, PE7_REVIEW } from '../data/pe7';
import { SEQUENCES, getSequence } from '../data/sequences';
import { EXAM_SYSTEMS, SYSTEM_ORDER } from '../data/systems';
import { TECHNIQUES, getTechnique } from '../data/techniques';
import { SequenceGame } from '../games/SequenceGame';
import { doneExam, logExamStart, recordExam } from '../progress';
import type { BodyHit, SystemId } from '../types';

// 3D 相關元件獨立分包，只在需要時載入
const BodyViewer = lazy(() => import('../anatomy/BodyViewer').then((m) => ({ default: m.BodyViewer })));
const LocateGame = lazy(() => import('../games/LocateGame').then((m) => ({ default: m.LocateGame })));
const Loading3D = () => <div className="flex h-[60vh] items-center justify-center rounded-3xl bg-emerald-50 text-sm font-bold text-emerald-700">正在載入 3D 人體模型…</div>;

const CRUMB = { label: 'PHYSICAL EXAM QUEST', to: '/exam' };
const TECH_NAME = Object.fromEntries(TECHNIQUES.map((t) => [t.id, `${t.icon} ${t.title}`]));

export function HubPage() {
  return (
    <ExamShell crumbs={[{ label: 'PHYSICAL EXAM QUEST' }]}>
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#14532d] via-[#15803d] to-[#0f766e] p-6 text-white shadow-glass md:p-10">
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl" />
        <p className="text-[12px] font-black tracking-[0.3em] text-emerald-200">PHYSICAL EXAM QUEST</p>
        <h1 className="mt-1 text-3xl font-black md:text-5xl">身體檢查島</h1>
        <p className="mt-3 text-lg font-bold text-lime-200 md:text-xl">「視、觸、叩、聽，先知道在哪裡、為什麼，再動手。」</p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-emerald-50">先學 PE-7 與四種基本手法，再到 3D 人體上練習體表定位與檢查流程。網頁練習的是流程、位置與判讀觀念；真實的手法、力道與手感仍需教師實體指導與評核。</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate('/exam/academy')} className="rounded-2xl bg-white px-5 py-2 font-bold text-emerald-700 shadow-lg">從 PE-7 開始 →</button>
          <button type="button" onClick={() => navigate('/exam/anatomy')} className="rounded-2xl bg-emerald-500/80 px-5 py-2 font-bold shadow-lg hover:bg-emerald-500">直接操作 3D 人體 →</button>
        </div>
      </header>
      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXAM_BUILDINGS.map((b) => (
          <article key={b.id} className="relative flex flex-col overflow-hidden rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-emerald-100 transition hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: b.color }} />
            <div className="flex items-start gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: `${b.color}1a` }}>
                {b.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-black tracking-widest" style={{ color: b.color }}>
                  {b.no}｜{b.englishTitle}
                </p>
                <h2 className="text-xl font-black text-slate-800">{b.title}</h2>
              </div>
              <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${b.phase === '規劃中' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>{b.phase}</span>
            </div>
            <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-600">{b.description}</p>
            <button type="button" onClick={() => navigate(b.route)} className="mt-4 rounded-2xl py-2.5 text-sm font-bold text-white shadow hover:brightness-110" style={{ background: b.color }}>
              進入{b.title} →
            </button>
          </article>
        ))}
      </section>
      <div className="mt-6">
        <Note>{PE7_NOTE} 所有教學內容與體表標記待臨床教師審核；示範案例標示 DEMO。</Note>
      </div>
    </ExamShell>
  );
}

/* ------------------------------ 01 SOP 學院 ------------------------------ */

export function AcademyPage() {
  return (
    <ExamShell crumbs={[CRUMB, { label: '01 身體檢查 SOP 學院' }]}>
      <h1 className="text-2xl font-black text-slate-800 md:text-3xl">🎓 身體檢查 SOP 學院</h1>
      <div className="mt-3">
        <Note>{PE7_NOTE}</Note>
      </div>
      <h2 className="mt-5 text-xl font-black text-slate-800">PE-7 七階段</h2>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {PE7.map((s) => (
          <div key={s.id} className="min-w-[9.5rem] flex-1 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-emerald-100" style={{ boxShadow: `inset 0 4px 0 ${s.color}` }}>
            <p className="text-2xl">{s.icon}</p>
            <p className="text-[11px] font-black" style={{ color: s.color }}>
              STEP {s.order}
            </p>
            <p className="text-[13px] font-bold text-slate-800">{s.title}</p>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <GoButton to="/exam/academy/pe7">進入 PE-7 教學與小遊戲 →</GoButton>
      </div>
      <h2 className="mt-7 text-xl font-black text-slate-800">四種基本檢查手法</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TECHNIQUES.map((t) => (
          <button key={t.id} type="button" onClick={() => navigate(`/exam/academy/${t.id}`)} className="rounded-3xl bg-white/90 p-4 text-left shadow-sm ring-1 ring-emerald-100 transition hover:-translate-y-1 hover:shadow-lg" style={{ boxShadow: `inset 0 4px 0 ${t.color}` }}>
            <p className="text-3xl">{t.icon}</p>
            <p className="mt-1 text-lg font-black text-slate-800">
              {t.title} <span className="text-[12px] font-bold text-slate-400">{t.english}</span>
            </p>
            <p className="mt-1 text-[13px] text-slate-600">{t.purpose}</p>
            {doneExam('lesson', t.id) && <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">✓ 已練習</span>}
          </button>
        ))}
      </div>
      <Card className="mt-5">
        <p className="text-[14px] font-black text-slate-800">⚠️ 各系統的操作順序不同</p>
        <ul className="mt-2 grid gap-1 text-[13px] text-slate-700 md:grid-cols-2">
          {SYSTEM_ORDER.map((id) => (
            <li key={id}>
              <b>{EXAM_SYSTEMS[id].icon} {EXAM_SYSTEMS[id].title}：</b>
              {EXAM_SYSTEMS[id].orderNote}
            </li>
          ))}
        </ul>
      </Card>
    </ExamShell>
  );
}

export function Pe7Page() {
  const [play, setPlay] = useState(false);
  const [t0, setT0] = useState(Date.now());
  return (
    <ExamShell crumbs={[CRUMB, { label: '01 SOP 學院', to: '/exam/academy' }, { label: 'PE-7' }]}>
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-black text-slate-800">📋 PE-7 七階段</h1>
        <span className="ml-auto">
          <ReviewBadge review={PE7_REVIEW} />
        </span>
      </header>
      <div className="mt-2">
        <Note>{PE7_NOTE}</Note>
      </div>
      {!play ? (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {PE7.map((s) => (
              <Card key={s.id}>
                <p className="flex flex-wrap items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-white" style={{ background: s.color }}>
                    {s.order}
                  </span>
                  <span className="text-[16px] font-black text-slate-800">
                    {s.icon} {s.title}
                  </span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${OBS[s.observability].cls}`}>{OBS[s.observability].label}</span>
                </p>
                <ul className="mt-2 space-y-1 text-[13.5px] text-slate-700">
                  {s.points.map((p) => (
                    <li key={p}>✓ {p}</li>
                  ))}
                </ul>
                <ul className="mt-2 space-y-1 text-[12.5px] text-rose-700">
                  {s.pitfalls.map((p) => (
                    <li key={p}>✗ 常見錯誤：{p}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                logExamStart('lesson:pe7', 'PE-7 小遊戲');
                setT0(Date.now());
                setPlay(true);
              }}
              className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow"
            >
              🎮 開始 PE-7 小遊戲 →
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4">
          <ActivityRun
            activities={PE7_GAMES}
            onFinish={(rs) => recordExam('lesson', 'pe7', 'PE-7 小遊戲', { score: rs.reduce((s, r) => s + r.score, 0), max: rs.reduce((s, r) => s + r.max, 0), durationSec: (Date.now() - t0) / 1000 })}
            finishSlot={(_, retry) => (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={retry} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                  ↺ 重新練習
                </button>
                <button type="button" onClick={() => setPlay(false)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                  📖 回到教學
                </button>
                <GoButton to="/exam/academy/inspection">下一課：視診 →</GoButton>
              </div>
            )}
          />
        </div>
      )}
    </ExamShell>
  );
}

export function TechniquePage({ id }: { id: string }) {
  const t = getTechnique(id);
  const [play, setPlay] = useState(false);
  const [t0, setT0] = useState(Date.now());
  if (!t)
    return (
      <ExamShell crumbs={[CRUMB, { label: '找不到' }]}>
        <p>找不到這個手法。</p>
      </ExamShell>
    );
  const idx = TECHNIQUES.findIndex((x) => x.id === t.id);
  const next = TECHNIQUES[idx + 1];
  const block = (title: string, items: string[], cls: string) => (
    <Card>
      <p className={`text-[12px] font-black tracking-widest ${cls}`}>{title}</p>
      <ul className="mt-1 space-y-1 text-[13.5px] text-slate-700">
        {items.map((x) => (
          <li key={x}>• {x}</li>
        ))}
      </ul>
    </Card>
  );
  return (
    <ExamShell crumbs={[CRUMB, { label: '01 SOP 學院', to: '/exam/academy' }, { label: `${t.title} ${t.english}` }]}>
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: `${t.color}22` }}>
          {t.icon}
        </span>
        <div>
          <p className="text-[12px] font-black tracking-widest" style={{ color: t.color }}>
            {t.english}
          </p>
          <h1 className="text-2xl font-black text-slate-800 md:text-3xl">{t.title}</h1>
        </div>
        <span className="ml-auto">
          <ReviewBadge review={t.review} />
        </span>
      </header>
      {!play ? (
        <div className="mt-4 space-y-3">
          <Card>
            <p className="text-[12px] font-black tracking-widest text-emerald-700">🎯 教學目的</p>
            <p className="mt-1 text-[15px] font-bold text-slate-800">{t.purpose}</p>
          </Card>
          <div className="grid gap-3 md:grid-cols-2">
            {block('🏥 典型適用情境', t.situations, 'text-sky-700')}
            {block('✅ 正確操作概念', t.concepts, 'text-emerald-700')}
            {block('✗ 常見錯誤', t.errors, 'text-rose-700')}
            {block('⚠️ 注意事項', t.cautions, 'text-amber-700')}
          </div>
          <Note>各器官系統的操作順序可能不同（例：腹部常採視 → 聽 → 叩 → 觸，心肺常採視 → 觸 → 叩 → 聽）。請依教師審核的各系統 SOP。</Note>
          <button
            type="button"
            onClick={() => {
              logExamStart(`lesson:${t.id}`, `${t.title}小遊戲`);
              setT0(Date.now());
              setPlay(true);
            }}
            className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow"
          >
            🎮 開始小遊戲 →
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <ActivityRun
            activities={[t.game]}
            onFinish={(rs) => recordExam('lesson', t.id, `${t.title}小遊戲`, { score: rs[0].score, max: rs[0].max, durationSec: (Date.now() - t0) / 1000 })}
            finishSlot={(_, retry) => (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={retry} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                  ↺ 重新練習
                </button>
                <button type="button" onClick={() => setPlay(false)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                  📖 回到教學
                </button>
                {next ? <GoButton to={`/exam/academy/${next.id}`}>下一課：{next.title} →</GoButton> : <GoButton to="/exam/anatomy">前往 3D 人體解剖探索館 →</GoButton>}
              </div>
            )}
          />
        </div>
      )}
    </ExamShell>
  );
}

/* ------------------------------ 02 3D 人體 ------------------------------ */

const OVERLAY_LABEL: Record<Overlay, string> = { quadrant: '腹部四象限', nine: '腹部九分區', thorax: '胸前區域', back: '背側區域', lines: '體表參考線', landmarks: '體表標記點' };

export function AnatomyPage() {
  const [view, setView] = useState<View>('front');
  const [overlays, setOverlays] = useState<Overlay[]>(['quadrant', 'lines', 'landmarks']);
  const [hit, setHit] = useState<BodyHit | null>(null);
  const [marker, setMarker] = useState<[number, number, number] | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const toggle = (o: Overlay) => setOverlays((x) => (x.includes(o) ? x.filter((y) => y !== o) : [...x, o]));
  return (
    <ExamShell crumbs={[CRUMB, { label: '02 3D 人體解剖探索館' }]} wide>
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-black text-slate-800">🧍 3D 人體解剖探索館</h1>
        <span className="ml-auto">
          <ReviewBadge review={BODY_MODEL.review} />
        </span>
      </header>
      <div className="mt-2">
        <Note>{BODY_MODEL.note}</Note>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(['front', 'side', 'back'] as View[]).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} className={`rounded-full px-3 py-1.5 text-[12.5px] font-bold ${view === v ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
                {v === 'front' ? '正面' : v === 'side' ? '側面（左）' : '背面'}
              </button>
            ))}
            <span className="mx-1 w-px bg-slate-200" />
            {(Object.keys(OVERLAY_LABEL) as Overlay[]).map((o) => (
              <button key={o} type="button" aria-pressed={overlays.includes(o)} onClick={() => toggle(o)} className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${overlays.includes(o) ? 'bg-teal-100 text-teal-800 ring-1 ring-teal-300' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>
                {overlays.includes(o) ? '✓ ' : ''}
                {OVERLAY_LABEL[o]}
              </button>
            ))}
          </div>
          <Suspense fallback={<Loading3D />}>
            <BodyViewer
              view={view}
              overlays={overlays}
              highlightLandmarks={focus ? [focus] : []}
              marker={marker ? { point: marker } : null}
              onHit={(h, p) => {
                setHit(h);
                setMarker(p);
                setFocus(h.nearest && h.nearest.distM <= h.nearest.landmark.tolerance * 2.5 ? h.nearest.landmark.id : null);
              }}
            />
          </Suspense>
          <p className="text-[11.5px] text-slate-400">拖曳旋轉、滾輪或雙指縮放（可局部放大）；點擊模型查看部位、左右側、區域與體表標記。</p>
        </div>
        <div className="space-y-3">
          {hit ? <HitCard hit={hit} /> : <Card><p className="text-[13.5px] text-slate-600">👆 點擊模型上的任一位置，查看該處的部位、左右側、區域與相關檢查。</p></Card>}
          <Card>
            <p className="text-[12px] font-black tracking-widest text-emerald-700">📍 體表標記清單</p>
            <div className="mt-2 flex max-h-64 flex-wrap gap-1 overflow-y-auto">
              {BODY_MODEL.landmarks.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setFocus(l.id);
                    setView(l.surface === 'back' ? 'back' : 'front');
                  }}
                  className={`rounded-full px-2 py-1 text-[11.5px] font-bold ${focus === l.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {l.name}
                </button>
              ))}
            </div>
            {focus && <p className="mt-2 text-[12.5px] text-slate-600">{BODY_MODEL.landmarks.find((l) => l.id === focus)?.definition}</p>}
          </Card>
          <GoButton to="/exam/anatomy/locate">🎯 Game 2 人體定位挑戰 →</GoButton>
        </div>
      </div>
    </ExamShell>
  );
}

export function LocatePage() {
  const [sys, setSys] = useState<SystemId | null>(null);
  const [run, setRun] = useState(0);
  const groups: SystemId[] = ['abdomen', 'cardiovascular', 'respiratory'];
  const tasks = sys ? LOCATE_TASKS.filter((t) => EXAM_SYSTEMS[sys].locateTaskIds.includes(t.id)) : [];
  const [t0, setT0] = useState(Date.now());
  return (
    <ExamShell crumbs={[CRUMB, { label: '02 3D 人體解剖探索館', to: '/exam/anatomy' }, { label: 'Game 2 人體定位挑戰' }]} wide>
      <h1 className="text-2xl font-black text-slate-800">🎯 Game 2｜人體定位挑戰</h1>
      <p className="mt-1 text-[13.5px] text-slate-600">在 3D 模型上點出指定的區域或體表標記；系統會判斷部位、左右側、體表標記與相關檢查區域。</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              logExamStart(`locate:${g}`, `人體定位：${EXAM_SYSTEMS[g].title}`);
              setT0(Date.now());
              setSys(g);
              setRun((r) => r + 1);
            }}
            className={`rounded-2xl px-4 py-2 text-[13.5px] font-bold ${sys === g ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}
          >
            {EXAM_SYSTEMS[g].icon} {EXAM_SYSTEMS[g].title}（{EXAM_SYSTEMS[g].locateTaskIds.length} 題）
          </button>
        ))}
      </div>
      <div className="mt-4">
        {!sys ? (
          <Card>
            <p className="text-[14px] text-slate-600">選擇一組題目開始。腹部為本階段的主要題組。</p>
          </Card>
        ) : (
          <Suspense fallback={<Loading3D />}>
            <LocateGame key={run} tasks={tasks} onDone={(s) => recordExam('game', `locate-${sys}`, `人體定位：${EXAM_SYSTEMS[sys].title}`, { score: s.firstTry, max: s.total, durationSec: (Date.now() - t0) / 1000, detail: `sideErrors=${s.sideErrors}` })} />
          </Suspense>
        )}
      </div>
    </ExamShell>
  );
}

/* ------------------------------ 03 實作館 ------------------------------ */

const STATUS = { available: { t: '已開放', c: 'bg-emerald-100 text-emerald-700' }, building: { t: '建置中', c: 'bg-amber-100 text-amber-800' }, planned: { t: '規劃中', c: 'bg-slate-100 text-slate-500' } } as const;

export function PracticePage() {
  return (
    <ExamShell crumbs={[CRUMB, { label: '03 身體檢查實作館' }]}>
      <h1 className="text-2xl font-black text-slate-800 md:text-3xl">🩺 身體檢查實作館</h1>
      <div className="mt-2">
        <Note>以下為平台教學分類，不代表國考固定六種考題。第一階段優先建置腹部檢查。</Note>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SYSTEM_ORDER.map((id) => {
          const s = EXAM_SYSTEMS[id];
          return (
            <button key={id} type="button" onClick={() => navigate(`/exam/practice/${id}`)} className="flex flex-col rounded-3xl bg-white/90 p-4 text-left shadow-sm ring-1 ring-emerald-100 transition hover:-translate-y-1 hover:shadow-lg" style={{ boxShadow: `inset 0 4px 0 ${s.color}` }}>
              <span className="flex items-center gap-2">
                <span className="text-3xl">{s.icon}</span>
                <span className="text-lg font-black text-slate-800">{s.title}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS[s.status].c}`}>{STATUS[s.status].t}</span>
              </span>
              <span className="mt-2 text-[13px] text-slate-600">{s.summary}</span>
              <span className="mt-2 flex flex-wrap gap-1 text-[11px] font-bold text-slate-500">
                {s.techniqueOrder.map((t, i) => (
                  <span key={t}>
                    {i > 0 && '→ '}
                    {TECH_NAME[t]}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <Card className="mt-5">
        <p className="text-[14px] font-black text-slate-800">🎮 Game 1｜檢查流程排序</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SEQUENCES.map((q) => (
            <GoButton key={q.id} to={`/exam/practice/sequence/${q.id}`} tone="ghost">
              {EXAM_SYSTEMS[q.system as SystemId]?.icon} {q.title} {doneExam('game', q.id) ? '✓' : ''}
            </GoButton>
          ))}
        </div>
      </Card>
    </ExamShell>
  );
}

export function SystemPage({ id }: { id: SystemId }) {
  const s = EXAM_SYSTEMS[id];
  if (!s)
    return (
      <ExamShell crumbs={[CRUMB, { label: '找不到' }]}>
        <p>找不到這個系統。</p>
      </ExamShell>
    );
  const seqs = SEQUENCES.filter((q) => q.system === id);
  return (
    <ExamShell crumbs={[CRUMB, { label: '03 身體檢查實作館', to: '/exam/practice' }, { label: s.title }]}>
      <header className="flex flex-wrap items-center gap-3">
        <span className="text-4xl">{s.icon}</span>
        <h1 className="text-2xl font-black text-slate-800 md:text-3xl">{s.title}</h1>
        <span className={`rounded-full px-2 py-0.5 text-[12px] font-bold ${STATUS[s.status].c}`}>{STATUS[s.status].t}</span>
        <span className="ml-auto">
          <ReviewBadge review={s.review} />
        </span>
      </header>
      <Card className="mt-4">
        <p className="text-[12px] font-black tracking-widest text-emerald-700">教學順序（依本系統 SOP）</p>
        <p className="mt-1 text-[16px] font-black text-slate-800">{s.techniqueOrder.map((t) => TECH_NAME[t]).join('  →  ')}</p>
        <p className="mt-1 text-[13px] text-slate-600">{s.orderNote}</p>
      </Card>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Card>
          <p className="text-[14px] font-black text-slate-800">🎮 Game 1 流程排序</p>
          {seqs.length ? (
            <div className="mt-2 flex flex-col gap-2">
              {seqs.map((q) => (
                <GoButton key={q.id} to={`/exam/practice/sequence/${q.id}`} tone="ghost">
                  {q.title} →
                </GoButton>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-[13px] text-slate-500">本系統的排序題待教師審核後加入。</p>
          )}
        </Card>
        <Card>
          <p className="text-[14px] font-black text-slate-800">🎯 Game 2 人體定位</p>
          {s.locateTaskIds.length ? (
            <p className="mt-1 text-[13px] text-slate-600">本系統有 {s.locateTaskIds.length} 題定位練習。</p>
          ) : (
            <p className="mt-1 text-[13px] text-slate-500">本系統的體表標記將隨關卡加入。</p>
          )}
          {s.locateTaskIds.length > 0 && (
            <div className="mt-2">
              <GoButton to="/exam/anatomy/locate" tone="ghost">
                前往人體定位挑戰 →
              </GoButton>
            </div>
          )}
        </Card>
      </div>
      {id === 'abdomen' && (
        <Card className="mt-4">
          <p className="flex flex-wrap items-center gap-2 text-[14px] font-black text-slate-800">
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] text-white">{DEMO_ABDOMEN.tag}</span>
            {DEMO_ABDOMEN.title}
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">Phase 5 建置中</span>
          </p>
          <ul className="mt-2 space-y-1 text-[13px] text-slate-600">
            {DEMO_ABDOMEN.candidateBrief.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-slate-600">完整關卡將包含：檢查前準備 → 視診 → 聽診 → 叩診 → 觸診 → 結果整理，以及四種訓練模式。檢查發現須由臨床教師確認後加入；腸音需使用有授權的教學素材（目前授權聲音素材：{SOUNDS.length} 筆）。</p>
        </Card>
      )}
      {s.status === 'planned' && (
        <div className="mt-4">
          <Note>此系統關卡規劃中：資料結構（PhysicalExamSystem、ExaminationSequence、AnatomicalLandmark、PhysicalExamCase）已可擴充，待教師提供並審核 SOP 與案例後建置。</Note>
        </div>
      )}
    </ExamShell>
  );
}

export function SequencePage({ id }: { id: string }) {
  const q = getSequence(id);
  const [run, setRun] = useState(0);
  const [t0] = useState(() => {
    logExamStart(`seq:${id}`, `流程排序：${q?.title}`);
    return Date.now();
  });
  if (!q)
    return (
      <ExamShell crumbs={[CRUMB, { label: '找不到' }]}>
        <p>找不到這個排序題。</p>
      </ExamShell>
    );
  const others = SEQUENCES.filter((x) => x.id !== id);
  return (
    <ExamShell crumbs={[CRUMB, { label: '03 身體檢查實作館', to: '/exam/practice' }, { label: `Game 1：${q.title}` }]}>
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-black text-slate-800">🎮 Game 1｜{q.title}</h1>
        <span className="ml-auto">
          <ReviewBadge review={q.review} />
        </span>
      </header>
      <div className="mt-4">
        <SequenceGame key={run} seq={q} onDone={(r) => recordExam('game', q.id, `流程排序：${q.title}`, { score: r.score, max: r.max, durationSec: (Date.now() - t0) / 1000, detail: `violations=${r.violations.length}` })} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setRun((r) => r + 1)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
          ↺ 重新開始
        </button>
        {others.map((o) => (
          <GoButton key={o.id} to={`/exam/practice/sequence/${o.id}`} tone="ghost">
            {o.title} →
          </GoButton>
        ))}
      </div>
    </ExamShell>
  );
}

/* ------------------------------ 04–06 規劃中的建築 ------------------------------ */

const PLAN: Record<'signs' | 'vsp' | 'challenge', { needs: string[]; links: [string, string][] }> = {
  signs: { needs: ['取得授權的視覺與聲音教學素材', '臨床教師審核每張卡片的判讀與參考教材', '區分：正常、異常、需進一步評估、尚不能單憑結果推定的診斷'], links: [['/exam/academy/inspection', '複習視診'], ['/exam/academy/auscultation', '複習聽診']] },
  vsp: { needs: ['臨床教師確認 DEMO 腹部案例的檢查發現與病人回應', '授權腸音素材（虛擬聽診）', '虛擬病人回應規則（同意、姿勢、疼痛時的安全機制）'], links: [['/exam/practice/abdomen', '腹部檢查入口'], ['/exam/anatomy/locate', '先練腹部定位']] },
  challenge: { needs: ['個別教案的時間、任務與評分規準（將取代示範規準）', '四種訓練模式整合（示範、引導、自主、OSCE 挑戰）', '區分網頁可記錄、需教師觀察、無法數位判定的能力'], links: [['/exam/practice/sequence/seq-abdomen', '練習腹部流程排序']] },
};

export function PlanPage({ id }: { id: 'signs' | 'vsp' | 'challenge' }) {
  const b = EXAM_BUILDINGS.find((x) => x.id === id)!;
  const p = PLAN[id];
  return (
    <ExamShell crumbs={[CRUMB, { label: `${b.no} ${b.title}` }]}>
      <header className="flex flex-wrap items-center gap-3">
        <span className="text-4xl">{b.icon}</span>
        <h1 className="text-2xl font-black text-slate-800 md:text-3xl">{b.title}</h1>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-bold text-slate-500">規劃中</span>
      </header>
      <Card className="mt-4">
        <p className="text-[14px] text-slate-700">{b.description}</p>
        <p className="mt-3 text-[12px] font-black tracking-widest text-emerald-700">建置前需要</p>
        <ul className="mt-1 space-y-1 text-[13.5px] text-slate-700">
          {p.needs.map((n) => (
            <li key={n}>• {n}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {p.links.map(([to, label]) => (
            <GoButton key={to} to={to} tone="ghost">
              {label} →
            </GoButton>
          ))}
        </div>
      </Card>
      {id === 'challenge' && (
        <Card className="mt-4">
          <p className="text-[14px] font-black text-slate-800">📊 示範評量構面（PhysicalExamRubric）</p>
          <p className="mt-1 text-[12.5px] text-slate-500">{PE_RUBRIC.disclaimer}</p>
          <ul className="mt-2 divide-y divide-slate-100">
            {PE_RUBRIC.dimensions.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2 py-1.5 text-[13px]">
                <b className="text-slate-800">{d.label}</b>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${OBS[d.observability].cls}`}>{OBS[d.observability].label}</span>
                <span className="w-full text-slate-500 md:w-auto md:flex-1">{d.note}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </ExamShell>
  );
}
