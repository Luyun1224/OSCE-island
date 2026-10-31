import { navigate } from '../../../router';
import { formatClock } from '../../training/modes';
import { FormativeNote, HQShell, PrimaryButton, ReviewBadge, ScoreBar } from '../components/Shell';
import { getUnit } from '../data/sopUnits';
import type { CasePackage } from '../types';
import type { ClinicResult } from './ClinicSession';
import { coveredSubs, evaluateCase, feedbackSentence } from './engine';

const MODE_TITLE = { guided: '引導式練習', independent: '自主問診', challenge: 'OSCE 模擬挑戰（8 分鐘）' } as const;
const SCORE_LABEL = ['沒有做到', '部分做到', '完全做到'];

/** 個別化學習報告：依學生實際的問句與說明產生 */
export function CaseReport({ caseData, result, onRetry, onBack }: { caseData: CasePackage; result: ClinicResult; onRetry: () => void; onBack: () => void }) {
  const c = caseData;
  const { state, durationSec, endReason, mode } = result;
  const ev = evaluateCase(c, state);
  const covered = coveredSubs(c, state);
  const history = ev.items.filter((r) => r.item.no <= 11);
  const explain = ev.items.filter((r) => r.item.no >= 12);
  const missedHistory = history.filter((r) => r.score < 2).flatMap((r) => r.missing);
  const weakUnits = [...new Set(ev.items.filter((r) => r.score < 2).flatMap((r) => r.item.units))];
  const pendingAsked = c.questions.filter((q) => q.answer === null && state.asked.includes(q.id));
  const saidStatements = state.said.map((id) => c.statements.find((x) => x.id === id)!);
  const records = c.questions.filter((q) => state.asked.includes(q.id) && q.record);

  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '03 虛擬病人診間', to: '/history/clinic' }, { label: `${c.code} 回饋` }]}>
      <header className="rounded-[2rem] bg-gradient-to-br from-[#0f3b3a] to-[#0e7490] p-6 text-white shadow-glass md:p-8">
        <p className="text-[12px] font-black tracking-[0.25em] text-teal-200">模擬形成性評量・個別化學習報告</p>
        <h1 className="mt-1 text-2xl font-black md:text-3xl">
          {c.code}｜{c.title}
        </h1>
        <p className="mt-1 text-[13px] text-teal-100">
          {MODE_TITLE[mode]}・完成時間 {formatClock(durationSec)}
          {endReason === 'timeout' && '・考站時間到'}
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-[11px] text-teal-200">15 項評分規準（模擬）</p>
            <p className="text-4xl font-black tabular-nums">
              {ev.total}
              <span className="text-lg text-teal-200"> / {ev.max}</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] text-teal-200">整體表現（1–5 分，獨立欄位）</p>
            <p className="text-base font-bold">尚未評核・由教師評估（不與 30 分相加）</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-teal-100/80">本報告依你在虛擬診間實際選擇的問句與說明計算，為模擬形成性評量，不等同正式 OSCE 考官評分。</p>
      </header>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['問診提問', `${state.asked.length} 題`],
          ['病情說明', `${state.said.length} 句`],
          ['病人提問', `${state.prompts.filter((p) => p.answered).length}/${state.prompts.length} 已回應`],
          ['病史構面', `${history.filter((r) => r.score === 2).length}/${history.length} 完整`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white/90 p-3 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400">{k}</p>
            <p className="text-lg font-black text-slate-800">{v}</p>
          </div>
        ))}
      </section>

      {/* 需補強的能力 */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-orange-50 p-5 ring-1 ring-orange-200">
          <h2 className="text-lg font-black text-orange-900">🌱 病史詢問回饋</h2>
          <ul className="mt-2 space-y-2">
            {history
              .filter((r) => r.score < 2)
              .map((r) => (
                <li key={r.item.id} className="text-[13px] leading-relaxed text-slate-700">
                  • {feedbackSentence(r)}
                </li>
              ))}
            {history.every((r) => r.score === 2) && <li className="text-[13px] text-slate-700">病史詢問的 11 個構面都完整做到了！</li>}
          </ul>
        </div>
        <div className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-lg font-black text-slate-800">🩺 初步診斷與病情說明</h2>
          <ul className="mt-2 space-y-2">
            {explain.map((r) => (
              <li key={r.item.id} className={`text-[13px] leading-relaxed ${r.score === 2 ? 'text-emerald-800' : 'text-slate-700'}`}>
                • {feedbackSentence(r)}
              </li>
            ))}
          </ul>
          {saidStatements.some((x) => x.incorrect) && (
            <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-[13px] text-rose-900">
              {saidStatements
                .filter((x) => x.incorrect)
                .map((x) => (
                  <p key={x.id}>
                    ✗ 你說：{x.text} → {x.feedback}
                  </p>
                ))}
            </div>
          )}
          <div className="mt-3">
            <p className="text-[12px] font-bold text-slate-500">病人的提問</p>
            {state.prompts.length === 0 && <p className="text-[12px] text-slate-400">本次問診中病人尚未提出問題。</p>}
            {state.prompts.map((p) => (
              <p key={p.id} className={`text-[13px] ${p.answered ? 'text-emerald-800' : 'text-orange-800'}`}>
                {p.answered ? '✓' : '△'} 「{c.spPrompts.find((x) => x.id === p.id)!.text}」{p.answered ? '已回應' : '尚未回應'}
              </p>
            ))}
          </div>
        </div>
      </section>

      {weakUnits.length > 0 && (
        <section className="mt-4 rounded-3xl bg-teal-700 p-5 text-white">
          <h2 className="text-lg font-black">🎯 建議重新練習的 SOP 單元</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakUnits.map((id) => {
              const u = getUnit(id);
              return u ? (
                <button key={id} type="button" onClick={() => navigate(`/history/academy/${id}`)} className="rounded-2xl bg-white/15 px-4 py-2 text-left text-[13px] font-bold hover:bg-white/25">
                  {u.icon} 單元 {u.order}：{u.title} →
                </button>
              ) : null;
            })}
          </div>
        </section>
      )}

      {/* 15 項規準 */}
      <section className="mt-4 rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-black text-slate-800">15 項評分規準對照</h2>
          <ReviewBadge review={c.review} />
        </div>
        <p className="text-[12px] text-slate-500">判準文字依原教案考官指引；0 沒有做到・1 部分做到・2 完全做到。</p>
        <div className="mt-3 space-y-2">
          {ev.items.map((r) => (
            <details key={r.item.id} className="group rounded-2xl bg-slate-50 ring-1 ring-slate-200">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-black ${r.score === 2 ? 'bg-emerald-500 text-white' : r.score === 1 ? 'bg-amber-400 text-amber-950' : 'bg-slate-300 text-slate-700'}`}>{r.score}</span>
                <span className="min-w-0 flex-1 text-[13px] font-bold text-slate-800">
                  {r.item.no}. {r.item.title}
                  <span className="block text-[11px] font-medium text-slate-500">{SCORE_LABEL[r.score]}</span>
                </span>
                <span className="text-slate-400 group-open:rotate-90">›</span>
              </summary>
              <div className="space-y-1 border-t border-slate-200 p-3 text-[12px]">
                {r.item.levels.map((l) => (
                  <p key={l.score} className={`rounded-lg px-2 py-1 ${l.score === r.score ? 'bg-teal-50 font-bold text-teal-900' : 'text-slate-500'}`}>
                    {l.score} {SCORE_LABEL[l.score]}：{l.text}
                  </p>
                ))}
                {r.covered.length > 0 && <p className="text-emerald-700">✓ 已做到：{r.covered.map((x) => x.label).join('、')}</p>}
                {r.missing.length > 0 && r.score < 2 && <p className="text-orange-700">△ 尚缺：{r.missing.map((x) => x.label).join('、')}</p>}
                {r.item.mappingNote && <p className="text-violet-700">📝 {r.item.mappingNote}</p>}
              </div>
            </details>
          ))}
        </div>
        <div className="mt-3">
          <FormativeNote />
        </div>
      </section>

      {/* 線索與紀錄 */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-lg font-black text-slate-800">📋 已蒐集的線索</h2>
          <ul className="mt-2 space-y-1">
            {records.map((q) => (
              <li key={q.id} className={`text-[13px] ${q.answer === null ? 'text-amber-700' : 'text-slate-700'}`}>
                • {q.answer === null ? `${q.record}：教案未提供明確答案（待教案作者補充）` : q.record}
              </li>
            ))}
          </ul>
          {missedHistory.length > 0 && (
            <>
              <h3 className="mt-4 text-sm font-black text-orange-800">遺漏的重要病史</h3>
              <p className="mt-1 text-[13px] text-slate-700">{missedHistory.map((x) => x.label).join('、')}</p>
            </>
          )}
          {pendingAsked.length > 0 && <p className="mt-3 rounded-xl bg-amber-50 p-2 text-[12px] text-amber-900">你詢問了 {pendingAsked.length} 個教案未提供病人回答的問題；評分依「是否詢問」計算。</p>}
        </div>
        <div className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-lg font-black text-slate-800">💬 問診紀錄</h2>
          <div className="mt-2 max-h-96 space-y-1.5 overflow-y-auto pr-1">
            {state.lines.map((l) => (
              <p key={l.id} className={`text-[13px] leading-relaxed ${l.who === 'doctor' ? 'text-teal-800' : l.kind === 'prompt' ? 'font-bold text-orange-700' : 'text-slate-600'}`}>
                <span className="font-black">{l.who === 'doctor' ? '你：' : '病人：'}</span>
                {l.text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-black text-slate-800">📚 教案臨床參考</h2>
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          {c.teachingReference.map((t) => (
            <div key={t.title} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[13px] font-black text-slate-700">{t.title}</p>
              {t.items.map((i) => (
                <p key={i} className="text-[13px] text-slate-600">
                  • {i}
                </p>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-2xl bg-violet-50 p-3 text-[12px] leading-relaxed text-violet-900">
          <p className="font-black">原教案評分要求 與 臨床衛教 的區別</p>
          <p>「鐵劑空腹使用」「與果汁併服」為本教案的評分要求與例句；正式衛教內容需由臨床教師依最新用藥指引、病人耐受性與個別情況確認，不宜直接套用於所有病人。</p>
          {saidStatements.some((x) => x.source === 'clinical') && <p className="mt-1">你使用的說法中，標示為「臨床衛教」者（例如飲食建議）為一般衛教內容，同樣需教師確認。</p>}
        </div>
        <div className="mt-2 text-[12px] text-slate-500">
          <p className="font-bold">教案保留項目（待教案作者補充或教師確認）</p>
          {c.pending.map((p) => (
            <p key={p}>• {p}</p>
          ))}
        </div>
      </section>

      <div className="mt-5 flex flex-wrap gap-2">
        <PrimaryButton tone="orange" onClick={onRetry}>
          ↺ 再練一次
        </PrimaryButton>
        <PrimaryButton tone="ghost" onClick={onBack}>
          返回虛擬病人診間
        </PrimaryButton>
        <PrimaryButton tone="ghost" onClick={() => navigate('/history/review')}>
          前往分析中心
        </PrimaryButton>
      </div>
      <div className="mt-2 max-w-sm">
        <ScoreBar score={ev.total} max={ev.max} />
      </div>
      {covered.size === 0 && <p className="mt-2 text-[12px] text-slate-400">本次尚未取得任何評分要項。</p>}
    </HQShell>
  );
}
