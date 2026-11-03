import { navigate } from '../../../router';
import { CLINICAL6 } from '../data/clinical6';
import { buildFeedback, LEVEL } from '../engine/feedback';
import type { DecisionEvent } from '../types';
import { EventList, Panel } from './ui';

/** 形成性回饋報告：病人安全置頂、九＋一面向、建議重練單元 */
export function ReportView({ caseId, events, only }: { caseId: string; events: DecisionEvent[]; only?: DecisionEvent['game'][] }) {
  const r = buildFeedback(caseId, events);
  const dims = only ? r.dimensions.filter((d) => d.good.length + d.weak.length > 0) : r.dimensions;
  return (
    <div className="space-y-4">
      <Panel className={r.safety.length ? 'ring-2 ring-red-400' : ''}>
        <h2 className={`text-lg font-black ${r.safety.length ? 'text-red-700' : 'text-emerald-700'}`}>{r.safety.length ? `⚠️ 病人安全事件（${r.safety.length}）` : '✅ 本次沒有病人安全事件'}</h2>
        {r.safety.length > 0 && (
          <>
            <p className="mt-1 text-[12.5px] text-red-700">安全事件獨立呈現：即使其他面向表現良好，也應優先檢討這些決策。</p>
            <div className="mt-2">
              <EventList events={r.safety} />
            </div>
          </>
        )}
      </Panel>
      <Panel>
        <h2 className="text-lg font-black text-slate-800">📊 形成性評量面向</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {dims.map((d) => (
            <details key={d.id} className="rounded-2xl bg-white p-3 ring-1 ring-slate-100 open:ring-indigo-200">
              <summary className="flex cursor-pointer list-none items-center gap-2">
                <span className="flex-1 text-[14px] font-black text-slate-800">{d.label}</span>
                <span className="text-[11px] text-slate-400">
                  ✓{d.good.length}　△{d.weak.length}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${LEVEL[d.level].cls}`}>{LEVEL[d.level].label}</span>
              </summary>
              <div className="mt-2">
                <EventList events={[...d.weak, ...d.good]} />
              </div>
            </details>
          ))}
        </div>
      </Panel>
      {r.suggestedLessons.length > 0 && (
        <Panel>
          <h2 className="text-lg font-black text-slate-800">📚 建議補強的 CLINICAL-6 單元</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {r.suggestedLessons.map((id) => {
              const l = CLINICAL6.find((x) => x.id === id)!;
              return (
                <button key={id} type="button" onClick={() => navigate(`/clinical/academy/${id}`)} className="rounded-2xl px-3 py-2 text-[13px] font-bold text-white shadow" style={{ background: l.color }}>
                  {l.letter} {l.englishTitle}｜{l.title} →
                </button>
              );
            })}
          </div>
        </Panel>
      )}
      <Panel className="bg-slate-50/90">
        <ul className="space-y-1 text-[12.5px] text-slate-500">
          {r.limitations.map((l) => (
            <li key={l}>• {l}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
