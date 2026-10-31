import { navigate } from '../../../router';
import { HQShell, ScoreBar } from '../components/Shell';
import { HQ_BUILDINGS } from '../data/buildings';
import { LAB_GAMES } from '../data/labGames';
import { SOP_UNITS } from '../data/sopUnits';
import { getBest, useProgress } from '../progress';

/** HISTORY QUEST 總覽：四棟建築與學習路徑 */
export function HubPage() {
  const { progress } = useProgress();
  const unitsDone = SOP_UNITS.filter((u) => getBest('unit', u.id, progress)).length;
  const gamesDone = LAB_GAMES.filter((g) => getBest('game', g.id, progress)).length;
  const nextUnit = SOP_UNITS.find((u) => !getBest('unit', u.id, progress));

  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST' }]}>
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f3b3a] via-[#115e59] to-[#0e7490] p-6 text-white shadow-glass md:p-10">
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
        <p className="text-[12px] font-black tracking-[0.3em] text-teal-200">HISTORY QUEST</p>
        <h1 className="mt-1 text-3xl font-black md:text-5xl">病史偵探學院</h1>
        <p className="mt-3 text-lg font-bold text-orange-200 md:text-xl">「每一個問題，都是通往診斷的一條線索。」</p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-teal-50/90">
          先在 SOP 學院理解問診邏輯，到訓練場用遊戲熟練技巧，再進入虛擬診間自主問診，最後在分析中心檢視自己的成長。已有問診經驗的同學，可以直接挑選想練習的區域。
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-[13px]">
          <div className="min-w-[12rem] rounded-2xl bg-white/10 px-4 py-2 backdrop-blur">
            <p className="text-teal-100">SOP 單元</p>
            <p className="text-xl font-black">
              {unitsDone} / {SOP_UNITS.length}
            </p>
          </div>
          <div className="min-w-[12rem] rounded-2xl bg-white/10 px-4 py-2 backdrop-blur">
            <p className="text-teal-100">訓練場遊戲</p>
            <p className="text-xl font-black">
              {gamesDone} / {LAB_GAMES.length}
            </p>
          </div>
          {nextUnit && (
            <button type="button" onClick={() => navigate(`/history/academy/${nextUnit.id}`)} className="rounded-2xl bg-orange-500 px-5 py-2 text-left font-bold shadow-lg hover:bg-orange-400">
              <span className="block text-[11px] text-orange-100">建議下一步</span>
              單元 {nextUnit.order}：{nextUnit.title} →
            </button>
          )}
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {HQ_BUILDINGS.map((b) => {
          const open = b.status === 'open';
          const pct = b.id === 'academy' ? [unitsDone, SOP_UNITS.length] : b.id === 'lab' ? [gamesDone, LAB_GAMES.length] : null;
          return (
            <article key={b.id} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl">
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
                <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${open ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{open ? '已開放' : '🚧 建置中'}</span>
              </div>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-600">{b.description}</p>
              {pct && (
                <div className="mt-3">
                  <ScoreBar score={pct[0]} max={pct[1]} />
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate(b.route)}
                className="mt-4 rounded-2xl py-2.5 text-sm font-bold text-white shadow transition hover:brightness-110"
                style={{ background: b.color }}
              >
                {open ? `進入${b.title} →` : '查看規劃與案例狀態 →'}
              </button>
            </article>
          );
        })}
      </section>

      <p className="mt-6 text-center text-[12px] text-slate-400">本區教材與題庫為教學示範內容，尚待臨床教師審核；練習分數為模擬形成性評量，不等同正式 OSCE 評分。</p>
    </HQShell>
  );
}
