import { navigate } from '../../../router';
import { CareShell, FrameworkNote } from '../components/CareShell';
import { Care6Ring } from '../components/Care6Ring';
import { CARE_BUILDINGS } from '../data/buildings';
import { CARE6 } from '../data/care6';
import { isDone, useCareProgress } from '../progress';

/** CARE ISLAND 總覽 */
export function HubPage() {
  const { progress } = useCareProgress();
  const lessonsDone = CARE6.filter((l) => isDone(progress, 'lesson', l.id)).length;
  const next = CARE6.find((l) => !isDone(progress, 'lesson', l.id));
  return (
    <CareShell crumbs={[{ label: 'CARE ISLAND' }]}>
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#fb7c6b] via-[#f59e7a] to-[#2bb3a3] p-6 text-white shadow-glass md:p-10">
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-yellow-200/30 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-teal-200/30 blur-3xl" />
        <p className="text-[12px] font-black tracking-[0.3em] text-orange-50">CARE ISLAND</p>
        <h1 className="mt-1 text-3xl font-black md:text-5xl">醫病溝通與衛教島</h1>
        <p className="mt-3 text-lg font-bold text-yellow-50 md:text-xl">「讓病人感到被理解，也讓衛教真正被聽懂。」</p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/90">
          從 CARE-6 學會一次會談的架構，在劇場練習回應情緒，在工坊練習 Teach-back，認識四種溝通工具，最後與虛擬標準化病人完成一次完整的對話。
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-[13px]">
          <div className="min-w-[10rem] rounded-2xl bg-white/15 px-4 py-2 backdrop-blur">
            <p className="text-orange-50">CARE-6 單元</p>
            <p className="text-xl font-black">
              {lessonsDone} / {CARE6.length}
            </p>
          </div>
          {next && (
            <button type="button" onClick={() => navigate(`/care/academy/${next.id}`)} className="rounded-2xl bg-white px-5 py-2 text-left font-bold text-orange-600 shadow-lg hover:bg-orange-50">
              <span className="block text-[11px] text-orange-400">建議下一步</span>
              {next.letter}｜{next.englishTitle} {next.title} →
            </button>
          )}
          <button type="button" onClick={() => navigate('/care/vsp')} className="rounded-2xl bg-teal-700/80 px-5 py-2 text-left font-bold shadow-lg hover:bg-teal-700">
            <span className="block text-[11px] text-teal-100">已有經驗？</span>
            直接挑戰 Virtual SP →
          </button>
        </div>
      </header>

      <section className="mt-5">
        <Care6Ring done={(id) => isDone(progress, 'lesson', id)} />
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARE_BUILDINGS.map((b) => (
          <article key={b.id} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-xl">
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
            </div>
            <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-600">{b.description}</p>
            <button type="button" onClick={() => navigate(b.route)} className="mt-4 rounded-2xl py-2.5 text-sm font-bold text-white shadow transition hover:brightness-110" style={{ background: b.color }}>
              進入{b.title} →
            </button>
          </article>
        ))}
      </section>

      <div className="mt-6">
        <FrameworkNote />
      </div>
    </CareShell>
  );
}
