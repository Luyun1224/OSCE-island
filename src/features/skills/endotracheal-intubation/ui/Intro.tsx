import { lazy, Suspense } from 'react';
import { AIRWAY_CASE, EQUIPMENT } from '../caseData';
import { createInitialState } from '../engine';
import { AIRWAY_RUBRIC } from '../rubric';
import { AWIcon } from './Icons';
import { SagittalAirway } from './SagittalAirway';
import { AirwayComparison } from './views';

const Scene = lazy(() => import('../scene/AirwayScene'));
const sc = AIRWAY_CASE.scenario;
const PREVIEW = createInitialState();

export function ScenarioIntro({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-indigo-50 via-slate-50 to-sky-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
        <button type="button" onClick={onBack} className="mt-2 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600 shadow-sm hover:bg-white">
          ← 技能訓練中心
        </button>
        <header className="mt-4">
          <p className="text-[11px] font-bold tracking-[0.25em] text-indigo-700">{sc.stationTitle}</p>
          <h1 className="mt-1 text-3xl font-black text-slate-800">
            氣管內管插管 <span className="text-lg font-bold text-slate-400">Endotracheal Intubation Simulator</span>
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-bold">
            {[`測驗場景：${sc.setting}`, `測驗時間：${sc.stationMinutes} 分鐘`, '單項技能操作', '評分 14 項・總分 28 分', '整體表現 1–5 分由教師評估'].map((t) => (
              <span key={t} className="rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm">
                {t}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <section className="rounded-3xl bg-white/90 p-5 shadow-glass">
            <h2 className="text-[11px] font-bold tracking-widest text-slate-400">考生指引｜背景資料</h2>
            <p className="mt-1 text-base font-black text-slate-800">{sc.patient}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-700">{sc.background}</p>
            <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-900">教案未提供血液氣體分析的實際數值，本模擬不顯示、也不編造任何檢驗結果。</p>
            <h2 className="mt-5 text-[11px] font-bold tracking-widest text-slate-400">測驗任務</h2>
            <ol className="mt-2 space-y-2">
              {sc.tasks.map((t, i) => (
                <li key={t} className="flex gap-2 text-[14px] leading-relaxed text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-[12px] font-bold text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <h2 className="mt-5 text-[11px] font-bold tracking-widest text-slate-400">操作階段</h2>
            <div className="mt-2 flex flex-wrap gap-1">
              {AIRWAY_CASE.steps.map((s) => (
                <span key={s.id} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-800">
                  {s.order}. {s.title}
                </span>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-[12px] text-slate-500">{sc.sourceNote}</p>
          </section>
          <section className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-white/90 shadow-glass">
              <Suspense fallback={<div className="h-64 animate-pulse bg-indigo-100" />}>
                <Scene state={PREVIEW} preset="panorama" className="h-64" />
              </Suspense>
              <p className="px-4 py-2 text-[11px] text-slate-500">🏥 急診呼吸道處置模擬室：氣道管理訓練模型（雙肺與胃袋外露，可拖曳旋轉）</p>
            </div>
            <div className="rounded-3xl bg-white/90 p-5 shadow-glass">
              <h2 className="text-[11px] font-bold tracking-widest text-slate-400">道具與耗材（教案第 6 頁）</h2>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {EQUIPMENT.map((e) => (
                  <div key={e.id} className="flex flex-col items-center text-center">
                    <AWIcon id={e.id} size={30} />
                    <span className="text-[9.5px] leading-tight text-slate-600">{e.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-3xl bg-white/90 p-5 shadow-glass">
          <h2 className="text-[11px] font-bold tracking-widest text-slate-400">插管示意圖（矢狀切面）</h2>
          <div className="mt-2 grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="aspect-[58/43] overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <SagittalAirway tube="trachea" />
            </div>
            <ul className="space-y-1.5 self-center text-[13px] leading-relaxed text-slate-700">
              <li>• 氣管內管由口部進入，經過舌頭上方與會厭後方，通過聲帶進入<b>氣管（前側）</b>；食道在氣管的<b>後側</b>。</li>
              <li>• 氣囊（cuff）位於聲帶下方的氣管內，充氣後密封呼吸道；由口外的<b>氣囊充氣處（pilot balloon）</b>打氣。</li>
              <li>• 管路外端的 15 mm 接頭連接 Ambu bag 或呼吸器。</li>
              <li className="text-[11px] text-slate-400">原創教學示意圖，非真實解剖影像。</li>
            </ul>
          </div>
          <h2 className="mt-5 text-[11px] font-bold tracking-widest text-slate-400">三種管路位置比較</h2>
          <div className="mt-2">
            <AirwayComparison />
          </div>
        </section>

        <section className="mt-4 rounded-3xl bg-white/90 p-5 shadow-glass">
          <h2 className="text-[11px] font-bold tracking-widest text-slate-400">評分規準（14 項，每項最高 2 分）</h2>
          <ol className="mt-2 grid gap-1 text-[13px] text-slate-700 md:grid-cols-2">
            {AIRWAY_RUBRIC.map((r) => (
              <li key={r.id} className="flex items-center gap-1.5">
                <span className="w-5 text-right font-bold text-slate-400">{r.id}.</span>
                <span className="min-w-0 flex-1 truncate" title={r.title}>
                  {r.title.split('（')[0].split('：')[0]}
                </span>
                {r.allowedScores && <span className="shrink-0 rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">0／2</span>}
                {r.reviewNote && <span className="shrink-0 rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-800">待教師確認</span>}
                {r.observability === 'proxy' && <span className="shrink-0 rounded-full bg-violet-100 px-1.5 text-[10px] font-bold text-violet-700">實體評核</span>}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/80 p-4">
          <h2 className="text-[12px] font-bold text-amber-800">數位模擬的限制與安全說明</h2>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[12px] leading-relaxed text-amber-900">
            {AIRWAY_CASE.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-amber-800">資料標籤：「教案原始要求」依 PDF；「現行臨床安全補充」另行標示，不更動 14 項評分。</p>
        </section>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onContinue} className="rounded-2xl bg-indigo-700 px-6 py-3 text-base font-bold text-white shadow-lg hover:bg-indigo-800">
            已閱讀，選擇訓練模式 →
          </button>
        </div>
      </div>
    </div>
  );
}
