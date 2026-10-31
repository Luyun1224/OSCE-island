import { useState } from 'react';
import type { CasePackage } from '../types';
import { coveredSubs, evaluateItem, type ClinicState } from './engine';

export type ClinicModeId = 'guided' | 'independent' | 'challenge';

/** 檢驗報告：可點擊查看項目意義；引導模式才標示高低 */
export function LabReport({ c, showFlags }: { c: CasePackage; showFlags: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div>
      <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
        <div className="flex flex-wrap items-baseline justify-between gap-1 border-b border-dashed border-slate-200 pb-2">
          <p className="text-[13px] font-black text-slate-800">{c.labs.title}</p>
          <p className="text-[11px] text-slate-400">{c.labs.note}</p>
        </div>
        <table className="mt-1 w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] text-slate-400">
              <th className="py-1 font-medium">項目</th>
              <th className="font-medium">結果</th>
              <th className="font-medium">參考區間</th>
            </tr>
          </thead>
          <tbody>
            {c.labs.items.map((l) => {
              const flag = l.numeric < l.low ? 'L' : l.numeric > l.high ? 'H' : '';
              return (
                <tr key={l.id} onClick={() => setOpen(open === l.id ? null : l.id)} className="cursor-pointer border-t border-slate-100 hover:bg-teal-50/50">
                  <td className="py-1.5 font-bold text-slate-700">
                    {l.name}
                    {open === l.id && <span className="mt-0.5 block text-[11px] font-normal leading-snug text-teal-700">{l.meaning}</span>}
                  </td>
                  <td className="align-top tabular-nums text-slate-800">
                    {l.value} <span className="text-[11px] text-slate-400">{l.unit}</span>
                    {showFlags && flag && <span className={`ml-1 rounded px-1 text-[10px] font-black ${flag === 'L' ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'}`}>{flag === 'L' ? '↓' : '↑'}</span>}
                  </td>
                  <td className="align-top tabular-nums text-slate-500">({l.reference})</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">點擊項目可查看檢驗的基本意義。</p>
    </div>
  );
}

const STATUS = {
  full: { label: '已完成', cls: 'bg-emerald-100 text-emerald-800' },
  partial: { label: '未完整', cls: 'bg-amber-100 text-amber-800' },
  none: { label: '尚未詢問', cls: 'bg-slate-100 text-slate-500' },
} as const;

/**
 * 病歷資料板
 * 引導：顯示各問診構面狀態與缺少的子要項；自主：只顯示已觸及構面的完成度；挑戰：只顯示已取得的資訊。
 */
export function RecordBoard({ c, state, mode }: { c: CasePackage; state: ClinicState; mode: ClinicModeId }) {
  const covered = coveredSubs(c, state);
  const historyItems = c.rubric.filter((r) => r.no <= 11);
  const results = historyItems.map((it) => evaluateItem(c, it, covered));
  const topics = c.topics.filter((t) => !t.explanation);
  return (
    <div className="space-y-3">
      {mode !== 'challenge' && (
        <div className="flex flex-wrap gap-1.5">
          {results
            .filter((r) => mode === 'guided' || r.score > 0)
            .map((r) => {
              const st = r.score === 2 ? STATUS.full : r.score === 1 ? STATUS.partial : STATUS.none;
              return (
                <span key={r.item.id} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${st.cls}`} title={mode === 'guided' && r.missing.length ? `尚缺：${r.missing.map((m) => m.label).join('、')}` : undefined}>
                  {r.item.no}. {r.item.title.replace(/（.*）/, '')}・{st.label}
                  {mode === 'guided' && r.score === 1 && r.missing.length > 0 && <span className="font-medium">（缺：{r.missing.map((m) => m.label).join('、')}）</span>}
                </span>
              );
            })}
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {topics.map((t) => {
          const asked = c.questions.filter((q) => q.topic === t.id && state.asked.includes(q.id) && q.record);
          if (!asked.length && mode !== 'guided') return null;
          return (
            <div key={t.id} className="rounded-2xl bg-white p-2.5 ring-1 ring-slate-200">
              <p className="text-[12px] font-black text-slate-700">
                {t.icon} {t.label}
              </p>
              {asked.length === 0 && <p className="text-[11px] text-slate-400">尚未詢問</p>}
              {asked.map((q) => (
                <p key={q.id} className={`mt-0.5 text-[12px] leading-snug ${q.answer === null ? 'text-amber-700' : 'text-slate-600'}`}>
                  {q.answer === null ? `⚠ ${q.record}：教案未提供明確答案（待教案作者補充）` : `• ${q.record}`}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
