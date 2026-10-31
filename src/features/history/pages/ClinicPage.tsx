import { navigate } from '../../../router';
import { HQShell, ReviewBadge, ScoreBar } from '../components/Shell';
import { PatientAvatar } from '../components/PatientAvatar';
import { CASES } from '../cases/case001-dizziness';
import { getBest, useProgress } from '../progress';

/** 03 虛擬病人診間：病例清單 */
export function ClinicPage() {
  const { progress } = useProgress();
  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '03 虛擬病人診間' }]}>
      <header className="rounded-[2rem] bg-gradient-to-br from-blue-700 to-sky-500 p-6 text-white shadow-glass md:p-8">
        <p className="text-[12px] font-black tracking-[0.25em] text-sky-100">03｜VIRTUAL PATIENT CLINIC</p>
        <h1 className="mt-1 text-3xl font-black">虛擬病人診間</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-sky-50">
          選擇病例，與虛擬標準化病人自由問診、依回答追問、判讀檢驗、說明病情並回應病人的疑問。病人依 SP 劇本回答，結束後獲得個別化回饋。
        </p>
      </header>

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        {CASES.map((c) => {
          const best = getBest('case', c.id, progress);
          return (
            <article key={c.id} className="flex flex-col rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start gap-3">
                <PatientAvatar look={c.patient} mood={c.patient.baselineMood} size={88} />
                <div className="min-w-0">
                  <p className="text-[11px] font-black tracking-widest text-blue-600">{c.code}</p>
                  <h2 className="text-xl font-black text-slate-800">{c.title}</h2>
                  <p className="text-[13px] text-slate-500">
                    {c.patient.setting}・{c.candidate.minutes} 分鐘・病史詢問＋病情解釋
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">已開放</span>
                    <ReviewBadge review={c.review} />
                  </div>
                </div>
              </div>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-600">{c.candidate.background}</p>
              {best && (
                <div className="mt-3">
                  <p className="mb-1 text-[11px] text-slate-400">最佳模擬評量（{best.attempts} 次）</p>
                  <ScoreBar score={best.score} max={best.max} />
                </div>
              )}
              <button type="button" onClick={() => navigate(`/history/clinic/${c.id}`)} className="mt-4 rounded-2xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700">
                {best ? '再次問診 →' : '進入診間 →'}
              </button>
            </article>
          );
        })}
        <article className="flex flex-col justify-center rounded-3xl border-2 border-dashed border-slate-200 p-5 text-center text-slate-400">
          <p className="text-3xl">＋</p>
          <p className="mt-1 text-sm font-bold">更多病例規劃中</p>
          <p className="text-[12px]">胸痛、腹痛、呼吸困難……新增病例只需新增案例資料檔，不需重新開發問診引擎。</p>
        </article>
      </section>
    </HQShell>
  );
}
