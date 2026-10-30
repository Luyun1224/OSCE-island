import { useState } from 'react';
import { formatClock } from '../modes';
import type { AttemptRecord, FeedbackReport, StepStatus, TrainingModeId } from '../types';

const MODE_LABEL: Record<TrainingModeId, string> = { guided: '教學引導', independent: '自主練習', challenge: 'OSCE 模擬挑戰' };
const STATUS_STYLE: Record<StepStatus, { label: string; cls: string }> = {
  complete: { label: '完成', cls: 'bg-emerald-500 text-white' },
  partial: { label: '部分', cls: 'bg-amber-400 text-amber-950' },
  'not-started': { label: '未做', cls: 'bg-slate-200 text-slate-500' },
};
const SCORE_LABEL = ['沒有做到', '部分做到', '完全做到'];

/** FeedbackReport：個別化形成性回饋（與技能無關的呈現元件） */
export function FeedbackReportView({
  report,
  history,
  onRetryStep,
  onRestart,
  onExit,
}: {
  report: FeedbackReport;
  history: AttemptRecord[];
  onRetryStep: (stepId: string) => void;
  onRestart: () => void;
  onExit: () => void;
}) {
  const [showEvents, setShowEvents] = useState(false);
  const a = report.assessment;
  const improve = report.suggestions.filter((s) => s.tone === 'improve');
  const strengths = report.suggestions.filter((s) => s.tone === 'strength');
  const stepTitle = (id: string) => report.stepReview.find((s) => s.stepId === id)?.title ?? id;
  const prev = history.slice(1, 6);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-sky-100 via-slate-50 to-blue-50">
      <div className="mx-auto max-w-5xl space-y-4 px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
        <header className="mt-2 rounded-3xl bg-gradient-to-br from-blue-800 to-slate-900 p-5 text-white shadow-glass md:p-6">
          <p className="text-[11px] font-bold tracking-[0.2em] text-sky-300">模擬練習評量・形成性回饋</p>
          <h1 className="mt-1 text-2xl font-black">傷口縫合｜{MODE_LABEL[report.mode]}</h1>
          {report.endReason === 'timeout' && <p className="mt-2 inline-block rounded-lg bg-rose-500/30 px-2 py-1 text-[12px] font-bold">考站時間到，本次模擬已結束</p>}
          {report.focusStepId && <p className="mt-2 inline-block rounded-lg bg-white/15 px-2 py-1 text-[12px] font-bold">單項練習：{stepTitle(report.focusStepId)}（其他階段已預先完成，分數僅供參考）</p>}
          <div className="mt-4 flex flex-wrap items-end gap-6">
            <div>
              <p className="text-[11px] text-sky-200">模擬練習評量</p>
              <p className="text-4xl font-black tabular-nums">
                {a.total}
                <span className="text-lg text-sky-200"> / {a.max}</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] text-sky-200">整體表現（1–5 分）</p>
              <p className="text-base font-bold">尚未評核・由教師評估</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-sky-100/80">本分數依《傷口縫合.pdf》評分說明對應數位互動事件計算，僅供自我學習，不等同現場 OSCE 實作成績。</p>
        </header>

        <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {report.metrics.map((m) => (
            <div key={m.label} className="rounded-2xl bg-white/90 p-3 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400">{m.label}</p>
              <p className={`mt-0.5 text-sm font-black ${m.tone === 'good' ? 'text-emerald-700' : m.tone === 'warn' ? 'text-amber-700' : 'text-slate-800'}`}>{m.value}</p>
            </div>
          ))}
        </section>

        {/* 流程回顧 */}
        <section className="rounded-3xl bg-white/90 p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-black text-slate-800">流程回顧</h2>
          <p className="text-[11px] text-slate-500">點擊任一階段可直接以引導模式重新練習</p>
          <div className="mt-3 flex items-stretch gap-1 overflow-x-auto pb-1">
            {report.stepReview.map((s, i) => (
              <div key={s.stepId} className="flex items-center gap-1">
                <button type="button" onClick={() => onRetryStep(s.stepId)} className="flex w-24 shrink-0 flex-col items-center rounded-2xl bg-slate-50 p-2 text-center ring-1 ring-slate-200 hover:ring-blue-400 md:w-28">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[s.status].cls}`}>{STATUS_STYLE[s.status].label}</span>
                  <span className="mt-1 text-[12px] font-bold text-slate-700">{s.title}</span>
                  <span className={`mt-0.5 text-[10px] font-bold ${s.issues ? 'text-rose-600' : 'text-slate-400'}`}>{s.issues ? `⚠ ${s.issues} 個事件` : '無異常事件'}</span>
                </button>
                {i < report.stepReview.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            ))}
          </div>
        </section>

        {/* 個別化建議 */}
        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl bg-white/90 p-4 shadow-sm md:p-5">
            <h2 className="text-sm font-black text-slate-800">🌱 補強建議</h2>
            {improve.length === 0 && <p className="mt-2 text-[13px] text-slate-500">這次沒有需要特別補強的項目，試試挑戰模式吧！</p>}
            <ul className="mt-2 space-y-2">
              {improve.map((s, i) => (
                <li key={i} className="rounded-2xl bg-amber-50 p-3 text-[13px] leading-relaxed text-slate-700">
                  {s.message}
                  <button type="button" onClick={() => onRetryStep(s.stepId)} className="mt-1 block text-[12px] font-bold text-blue-700 hover:underline">
                    ↻ 重新練習「{stepTitle(s.stepId)}」
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl bg-white/90 p-4 shadow-sm md:p-5">
              <h2 className="text-sm font-black text-slate-800">✨ 做得好的地方</h2>
              {strengths.length === 0 ? (
                <p className="mt-2 text-[13px] text-slate-500">完成更多步驟後，這裡會列出你的優勢。</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="rounded-2xl bg-emerald-50 p-3 text-[13px] leading-relaxed text-slate-700">
                      {s.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-3xl bg-white/90 p-4 shadow-sm md:p-5">
              <h2 className="text-sm font-black text-slate-800">🖐 需要實體操作確認</h2>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-slate-600">
                {report.physicalChecks.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 10 項規準對照 */}
        <section className="rounded-3xl bg-white/90 p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-black text-slate-800">教案 10 項評分規準對照</h2>
          <p className="text-[11px] text-slate-500">0 沒有做到・1 部分做到・2 完全做到（規準文字取自考官指引）</p>
          <div className="mt-3 space-y-2">
            {a.items.map((it) => (
              <details key={it.id} className="group rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-black ${it.score === 2 ? 'bg-emerald-500 text-white' : it.score === 1 ? 'bg-amber-400 text-amber-950' : 'bg-slate-300 text-slate-700'}`}>{it.score}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-slate-800">
                      {it.id}. {it.title}
                    </span>
                    <span className="text-[11px] text-slate-500">{SCORE_LABEL[it.score]}</span>
                  </span>
                  {it.observability === 'proxy' && <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">需實體操作評核</span>}
                  <span className="text-slate-400 group-open:rotate-90">›</span>
                </summary>
                <div className="space-y-2 border-t border-slate-200 p-3 text-[12px]">
                  <div className="grid gap-1">
                    {([2, 1, 0] as const).map((lv) => (
                      <p key={lv} className={`rounded-lg px-2 py-1 ${it.score === lv ? 'bg-blue-50 font-bold text-blue-800' : 'text-slate-500'}`}>
                        {lv} {SCORE_LABEL[lv]}：{it.criteria[lv]}
                      </p>
                    ))}
                  </div>
                  {it.evidence.length > 0 && <p className="text-emerald-700">✓ {it.evidence.join('；')}</p>}
                  {it.missing.length > 0 && <p className="text-amber-700">△ {it.missing.join('；')}</p>}
                  {it.physicalNote && <p className="text-violet-700">🖐 {it.physicalNote}</p>}
                  <button type="button" onClick={() => onRetryStep(it.stepIds[0])} className="font-bold text-blue-700 hover:underline">
                    ↻ 練習相關階段
                  </button>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* 前後比較 */}
        <section className="rounded-3xl bg-white/90 p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-black text-slate-800">練習紀錄比較</h2>
          <p className="text-[11px] text-slate-500">紀錄僅存在此瀏覽器中，不上傳、不含個資。</p>
          {prev.length === 0 ? (
            <p className="mt-2 text-[13px] text-slate-500">這是你的第一次練習紀錄。</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[30rem] text-[12px]">
                <thead>
                  <tr className="text-left text-[11px] text-slate-400">
                    <th className="py-1 font-medium">時間</th>
                    <th className="font-medium">模式</th>
                    <th className="font-medium">模擬評量</th>
                    <th className="font-medium">針數</th>
                    <th className="font-medium">污染事件</th>
                    <th className="font-medium">用時</th>
                  </tr>
                </thead>
                <tbody>
                  {[history[0], ...prev].map((h, i) => (
                    <tr key={h.id} className={`border-t border-slate-100 ${i === 0 ? 'font-bold text-blue-800' : 'text-slate-600'}`}>
                      <td className="py-1">{i === 0 ? '本次' : new Date(h.finishedAt).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        {MODE_LABEL[h.mode]}
                        {h.focusStepId ? '（單項）' : ''}
                      </td>
                      <td>
                        {h.total}/{h.max}
                      </td>
                      <td>{h.highlights.stitches}</td>
                      <td>{h.highlights.contaminations}</td>
                      <td>{formatClock(h.durationSec)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white/90 p-4 shadow-sm md:p-5">
          <button type="button" onClick={() => setShowEvents((v) => !v)} className="text-sm font-black text-slate-800">
            {showEvents ? '▾' : '▸'} 完整事件紀錄（{report.events.length}）
          </button>
          {showEvents && (
            <ul className="mt-2 max-h-80 space-y-1 overflow-y-auto text-[12px]">
              {report.events.map((e) => (
                <li key={e.id} className={`rounded-lg px-2 py-1 ${e.kind === 'contamination' ? 'bg-rose-50 text-rose-800' : e.kind === 'error' || e.kind === 'order' ? 'bg-amber-50 text-amber-900' : e.kind === 'remediation' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600'}`}>
                  <span className="mr-2 tabular-nums text-slate-400">{formatClock(e.t)}</span>
                  {e.message}
                  {e.why && (e.kind === 'contamination' || e.kind === 'error' || e.kind === 'order') && <span className="block pl-12 text-[11px] opacity-80">→ {e.why}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onExit} className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700">
            回到技能訓練中心
          </button>
          <button type="button" onClick={onRestart} className="rounded-2xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow">
            再練一次
          </button>
        </div>
      </div>
    </div>
  );
}
