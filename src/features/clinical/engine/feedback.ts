import { CLINICAL_RUBRIC } from '../data/rubric';
import type { Clinical6Stage, DecisionEvent, FeedbackReport, Level } from '../types';

/** 依決策事件產生形成性回饋；安全事件另行呈現，不會被其他面向的表現掩蓋 */
export function buildFeedback(caseId: string, events: DecisionEvent[]): FeedbackReport {
  const dimensions = CLINICAL_RUBRIC.dimensions.map((d) => {
    const mine = events.filter((e) => e.dims.includes(d.id));
    const good = mine.filter((e) => e.quality === 'good');
    const weak = mine.filter((e) => e.quality !== 'good');
    const bad = weak.filter((e) => e.quality === 'poor' || e.quality === 'unsafe');
    const level: Level = !mine.length ? 'unobserved' : !bad.length && weak.length <= good.length / 3 ? 'shown' : good.length >= bad.length ? 'partial' : 'needs';
    return { id: d.id, label: d.label, level, good, weak, lesson: d.lesson };
  });
  const safety = events.filter((e) => e.safety);
  const suggestedLessons = [...new Set(dimensions.filter((d) => d.level === 'needs' || d.level === 'partial').map((d) => d.lesson))] as Clinical6Stage[];
  return { caseId, dimensions, safety, suggestedLessons, limitations: CLINICAL_RUBRIC.limitations };
}

export const LEVEL: Record<Level, { label: string; cls: string }> = {
  shown: { label: '已展現', cls: 'bg-emerald-100 text-emerald-800' },
  partial: { label: '部分展現', cls: 'bg-amber-100 text-amber-800' },
  needs: { label: '待加強', cls: 'bg-rose-100 text-rose-800' },
  unobserved: { label: '未觀察', cls: 'bg-slate-100 text-slate-500' },
};
