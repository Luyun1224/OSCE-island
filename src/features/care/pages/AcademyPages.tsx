import { useState } from 'react';
import { navigate } from '../../../router';
import { PrimaryButton, ReviewBadge } from '../../history/components/Shell';
import { ActivityRun } from '../components/ActivityRun';
import { Card, CareShell, FrameworkNote, SkillChip } from '../components/CareShell';
import { Care6Ring } from '../components/Care6Ring';
import { CARE6, getLesson } from '../data/care6';
import { FRAMEWORKS } from '../data/frameworks';
import { SOP_CHALLENGE } from '../data/sopChallenge';
import { isDone, logCareStart, recordCare, useCareProgress } from '../progress';

const CRUMB = { label: 'CARE ISLAND', to: '/care' };

/** 01 溝通 SOP 學院：CARE-6 總覽＋Game 1 入口 */
export function AcademyPage() {
  const { progress } = useCareProgress();
  return (
    <CareShell crumbs={[CRUMB, { label: '01 溝通 SOP 學院' }]}>
      <h1 className="text-2xl font-black text-slate-800 md:text-3xl">🎓 溝通 SOP 學院｜CARE-6</h1>
      <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-slate-600">六個階段組成一次完整的醫病會談。每個單元包含觀念、短情境、互動練習、好／不佳說法對照與理由，完成後可以重新練習。</p>
      <div className="mt-3">
        <FrameworkNote />
      </div>
      <div className="mt-4">
        <Care6Ring done={(id) => isDone(progress, 'lesson', id)} />
      </div>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARE6.map((l) => (
          <button key={l.id} type="button" onClick={() => navigate(`/care/academy/${l.id}`)} className="flex flex-col rounded-3xl bg-white/90 p-4 text-left shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-lg">
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
              {isDone(progress, 'lesson', l.id) && <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">✓ 完成</span>}
            </span>
            <span className="mt-2 text-[13px] leading-relaxed text-slate-600">{l.goal}</span>
            <span className="mt-2 text-[12px] text-rose-600">💗 {l.empathyNote}</span>
          </button>
        ))}
      </section>
      <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 p-5 text-white shadow-lg md:flex md:items-center md:gap-6">
        <div className="text-5xl">🎯</div>
        <div className="mt-2 flex-1 md:mt-0">
          <p className="text-[12px] font-black tracking-widest text-orange-100">GAME 1</p>
          <h2 className="text-xl font-black">溝通 SOP 挑戰</h2>
          <p className="mt-1 text-[13px] text-orange-50">三關：說法分類 → 彈性排序 → 選擇下一步。允許多條合理路徑，每個選擇都會說明理由。</p>
        </div>
        <button type="button" onClick={() => navigate('/care/academy/game-sop')} className="mt-3 rounded-2xl bg-white px-5 py-2.5 text-sm font-black text-orange-600 shadow md:mt-0">
          開始挑戰 →
        </button>
      </section>
    </CareShell>
  );
}

type Stage = 'learn' | 'practice' | 'result';

/** CARE-6 單元頁：觀念 → 好／不佳對照 → 短情境互動 → 結果與重練 */
export function LessonPage({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const { progress, refresh } = useCareProgress();
  const [stage, setStage] = useState<Stage>('learn');
  const [startedAt, setStartedAt] = useState(Date.now());
  if (!lesson)
    return (
      <CareShell crumbs={[CRUMB, { label: '找不到單元' }]}>
        <p>找不到這個單元。</p>
      </CareShell>
    );
  const next = CARE6.find((l) => l.order === lesson.order + 1);
  const tools = FRAMEWORKS.filter((f) => lesson.tools.includes(f.id));

  return (
    <CareShell crumbs={[CRUMB, { label: '01 溝通 SOP 學院', to: '/care/academy' }, { label: `${lesson.letter}｜${lesson.englishTitle}` }]}>
      <Care6Ring active={lesson.id} done={(id) => isDone(progress, 'lesson', id)} compact />
      <header className="mt-4 flex flex-wrap items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black text-white shadow" style={{ background: lesson.color }}>
          {lesson.letter}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-black tracking-widest" style={{ color: lesson.color }}>
            UNIT {lesson.order}｜{lesson.englishTitle}
          </p>
          <h1 className="text-2xl font-black text-slate-800 md:text-3xl">
            {lesson.icon} {lesson.title}
          </h1>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {tools.map((t) => (
            <SkillChip key={t.id}>{t.name}</SkillChip>
          ))}
          <ReviewBadge review={lesson.review} />
        </div>
      </header>

      <ol className="mt-4 flex gap-1.5">
        {(['learn', 'practice', 'result'] as Stage[]).map((s, i) => (
          <li key={s} className={`rounded-full px-3 py-1 text-[12px] font-bold ${s === stage ? 'bg-orange-500 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
            {['觀念與對照', '短情境練習', '回饋'][i]}
          </li>
        ))}
      </ol>

      <div className="mt-4">
        {stage === 'learn' && (
          <div className="animate-fade-up space-y-4">
            <Card>
              <p className="text-[12px] font-black tracking-widest text-orange-600">🎯 學習目標</p>
              <p className="mt-1 text-[15px] font-bold text-slate-800">{lesson.goal}</p>
              <p className="mt-2 rounded-2xl bg-rose-50 px-3 py-2 text-[13px] text-rose-800 ring-1 ring-rose-100">💗 同理心在這個階段：{lesson.empathyNote}</p>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              {lesson.lessons.map((c) => (
                <Card key={c.title}>
                  <h3 className="text-lg font-black text-slate-800">{c.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate-600">{c.body}</p>
                  {c.bullets && (
                    <ul className="mt-2 space-y-1 text-[13.5px] text-slate-700">
                      {c.bullets.map((b) => (
                        <li key={b} className="flex gap-1.5">
                          <span style={{ color: lesson.color }}>●</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {c.good && <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-[13px] text-emerald-800">✅ {c.good}</p>}
                  {c.bad && <p className="mt-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-[13px] text-rose-800">⚠️ {c.bad}</p>}
                </Card>
              ))}
            </div>
            <Card>
              <h3 className="text-lg font-black text-slate-800">⚖️ 好／不佳說法對照</h3>
              <div className="mt-3 space-y-3">
                {lesson.compare.map((c) => (
                  <div key={c.context} className="rounded-2xl bg-orange-50/50 p-3 ring-1 ring-orange-100">
                    <p className="text-[12px] font-bold text-slate-500">情境：{c.context}</p>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <p className="rounded-xl bg-white px-3 py-2 text-[13.5px] text-slate-700 ring-2 ring-emerald-300">✅ {c.good}</p>
                      <p className="rounded-xl bg-white px-3 py-2 text-[13.5px] text-slate-700 ring-2 ring-rose-200">✗ {c.poor}</p>
                    </div>
                    <p className="mt-2 text-[13px] text-slate-600">💡 為什麼：{c.why}</p>
                  </div>
                ))}
              </div>
            </Card>
            <PrimaryButton
              tone="orange"
              onClick={() => {
                setStartedAt(Date.now());
                logCareStart(`lesson:${lesson.id}`, `CARE-6 ${lesson.englishTitle}`);
                setStage('practice');
              }}
            >
              開始短情境練習 →
            </PrimaryButton>
          </div>
        )}
        {stage !== 'learn' && (
          <ActivityRun
            key="run"
            activities={lesson.activities}
            onFinish={(rs) => {
              const score = rs.reduce((s, r) => s + r.score, 0);
              const max = rs.reduce((s, r) => s + r.max, 0);
              recordCare('lesson', lesson.id, `CARE-6 ${lesson.letter} ${lesson.englishTitle}：${lesson.title}`, { score, max, durationSec: (Date.now() - startedAt) / 1000 });
              refresh();
              setStage('result');
            }}
            finishSlot={(_, retry) => (
              <div className="space-y-3">
                <Card>
                  <p className="text-[12px] font-black tracking-widest text-teal-700">📌 本單元重點</p>
                  <ul className="mt-1 space-y-1 text-[14px] text-slate-700">
                    {lesson.takeaways.map((t) => (
                      <li key={t}>✓ {t}</li>
                    ))}
                  </ul>
                </Card>
                <div className="flex flex-wrap gap-2">
                  <PrimaryButton
                    tone="ghost"
                    onClick={() => {
                      setStartedAt(Date.now());
                      setStage('practice');
                      retry();
                    }}
                  >
                    ↺ 再練一次
                  </PrimaryButton>
                  <PrimaryButton tone="ghost" onClick={() => setStage('learn')}>
                    📖 回到觀念
                  </PrimaryButton>
                  {next ? (
                    <PrimaryButton tone="orange" onClick={() => navigate(`/care/academy/${next.id}`)}>
                      下一單元：{next.letter} {next.title} →
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton tone="orange" onClick={() => navigate('/care/academy/game-sop')}>
                      挑戰 Game 1 溝通 SOP →
                    </PrimaryButton>
                  )}
                </div>
              </div>
            )}
          />
        )}
      </div>
    </CareShell>
  );
}

/** Game 1：溝通 SOP 挑戰 */
export function SopChallengePage() {
  const [startedAt, setStartedAt] = useState(() => {
    logCareStart('game:sop', 'Game 1 溝通 SOP 挑戰');
    return Date.now();
  });
  return (
    <CareShell crumbs={[CRUMB, { label: '01 溝通 SOP 學院', to: '/care/academy' }, { label: 'Game 1 溝通 SOP 挑戰' }]}>
      <h1 className="text-2xl font-black text-slate-800">🎯 Game 1｜溝通 SOP 挑戰</h1>
      <p className="mt-1 text-[14px] text-slate-600">CARE-6 不是死板的步驟：有些說法可以出現在不同階段，回應情緒可以在任何時候發生。每一關都會說明為什麼。</p>
      <div className="mt-4">
        <ActivityRun
          activities={SOP_CHALLENGE}
          onFinish={(rs) => {
            const score = rs.reduce((s, r) => s + r.score, 0);
            const max = rs.reduce((s, r) => s + r.max, 0);
            recordCare('game', 'sop', 'Game 1 溝通 SOP 挑戰', { score, max, durationSec: (Date.now() - startedAt) / 1000 });
          }}
          finishSlot={(_, retry) => (
            <div className="flex flex-wrap gap-2">
              <PrimaryButton
                tone="ghost"
                onClick={() => {
                  setStartedAt(Date.now());
                  logCareStart('game:sop', 'Game 1 溝通 SOP 挑戰');
                  retry();
                }}
              >
                ↺ 再挑戰一次
              </PrimaryButton>
              <PrimaryButton tone="orange" onClick={() => navigate('/care/theater')}>
                前往同理心對話劇場 →
              </PrimaryButton>
            </div>
          )}
        />
      </div>
    </CareShell>
  );
}
