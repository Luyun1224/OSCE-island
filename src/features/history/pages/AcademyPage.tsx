import { navigate } from '../../../router';
import { ACTIVITY_KIND_LABEL } from '../activities/ActivityView';
import { HQShell, ReviewBadge, ScoreBar } from '../components/Shell';
import { SOP_UNITS } from '../data/sopUnits';
import { getBest, useProgress } from '../progress';

/** 01 問診 SOP 學院：六單元總覽 */
export function AcademyPage() {
  const { progress } = useProgress();
  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '01 問診 SOP 學院' }]}>
      <header className="rounded-[2rem] bg-white/90 p-6 shadow-sm ring-1 ring-teal-100 md:p-8">
        <p className="text-[12px] font-black tracking-[0.25em] text-teal-600">01｜HISTORY TAKING ACADEMY</p>
        <h1 className="mt-1 text-3xl font-black text-slate-800">問診 SOP 學院</h1>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-slate-600">
          以 <b>Calgary–Cambridge Guide</b> 為主軸，搭配 <b>OPQRST</b> 症狀分析與 <b>ICE</b> 病人觀點探索。每個單元都有簡短的核心教學、可實際操作的練習與即時回饋。初學者建議依序學習。
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-bold">
          {['開始 Initiating', '蒐集資訊 Gathering', '建立結構 Structure', '建立關係 Relationship', '說明與結束 Closing'].map((t) => (
            <span key={t} className="rounded-full bg-teal-50 px-3 py-1 text-teal-800">
              {t}
            </span>
          ))}
        </div>
      </header>

      <section className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SOP_UNITS.map((u) => {
          const best = getBest('unit', u.id, progress);
          return (
            <article key={u.id} className="flex flex-col rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">{u.icon}</span>
                <div>
                  <p className="text-[11px] font-black tracking-widest text-orange-600">UNIT {u.order}</p>
                  <h2 className="text-lg font-black leading-tight text-slate-800">{u.title}</h2>
                </div>
                {best && <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">✓ 完成</span>}
              </div>
              <p className="mt-1 text-[11px] font-medium text-slate-400">{u.englishTitle}</p>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">{u.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {u.activities.map((a) => (
                  <span key={a.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    🎯 {ACTIVITY_KIND_LABEL[a.kind]}
                  </span>
                ))}
                <ReviewBadge review={u.review} />
              </div>
              {best && (
                <div className="mt-3">
                  <p className="mb-1 text-[11px] text-slate-400">最佳練習分數（{best.attempts} 次練習）</p>
                  <ScoreBar score={best.score} max={best.max} />
                </div>
              )}
              <button type="button" onClick={() => navigate(`/history/academy/${u.id}`)} className="mt-4 rounded-2xl bg-teal-600 py-2.5 text-sm font-bold text-white shadow hover:bg-teal-700">
                {best ? '再練一次 →' : '開始學習 →'}
              </button>
            </article>
          );
        })}
      </section>
    </HQShell>
  );
}
