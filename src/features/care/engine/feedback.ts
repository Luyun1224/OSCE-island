import { CARE_RUBRIC } from '../data/rubric';
import type { Care6Stage, DialogueScenario, DialogueState, DimensionLevel, DimensionResult, FeedbackReport, ToolId } from '../types';

/**
 * 形成性回饋（分析面向，不是正式評分）
 * - 以學生「實際選擇的說法」所展現的溝通行為為證據，不做關鍵字比對
 * - 不從病人情緒數值反推同理心：同理心的證據來自學生的回應本身
 * - 每個面向回傳實際說法、病人的反應與較佳的替代說法
 */
export function buildReport(sc: DialogueScenario, st: DialogueState, mode: string, durationSec: number): FeedbackReport {
  const dims: DimensionResult[] = CARE_RUBRIC.dimensions.map((dim) => {
    const shown: DimensionResult['shown'] = [];
    const missed: DimensionResult['missed'] = [];
    for (const t of st.turns) {
      for (const e of t.evidence.filter((x) => x.dim === dim.id)) {
        if (e.effect === 'shown') shown.push({ utterance: t.text, note: e.note });
        else missed.push({ utterance: t.text, note: e.note, better: bestAlt(sc, t.nodeId, t.optionId) });
      }
    }
    const level: DimensionLevel = !shown.length && !missed.length ? 'unobserved' : !missed.length ? 'shown' : !shown.length ? 'needs' : 'partial';
    return { dim, level, shown, missed };
  });

  const strengths = st.turns
    .filter((t) => t.quality === 'best')
    .map((t) => ({ utterance: t.text, note: t.evidence.filter((e) => e.effect === 'shown').map((e) => e.note).join('；') || '恰當的回應', patient: t.reply }));
  const improvements = st.turns
    .filter((t) => t.quality !== 'best')
    .map((t) => ({
      utterance: t.text,
      note: t.evidence.filter((e) => e.effect === 'missed').map((e) => e.note).join('；') || '可以更貼近病人的需要',
      better: bestAlt(sc, t.nodeId, t.optionId),
      patient: t.reply,
    }));
  const safety = st.turns.flatMap((t) => t.safetyFlags.map((flag) => ({ utterance: t.text, flag })));

  const weak = dims.filter((d) => d.level === 'needs' || d.level === 'partial');
  const lessons = [...new Set(weak.flatMap((d) => d.dim.lessons))] as Care6Stage[];
  const tools = [...new Set(weak.flatMap((d) => d.dim.tools))] as ToolId[];

  const limitations = [...CARE_RUBRIC.limitations];
  if (st.endReason === 'timeout') limitations.unshift('本次在時間到時結束，未完成的階段標示為「未觀察」，不代表做不到。');

  return { scenarioId: sc.id, mode, endReason: st.endReason, durationSec, dimensions: dims, strengths, improvements, safety, suggestedLessons: lessons, suggestedTools: tools, limitations };
}

/** 同一節點中的最佳說法（作為對照，不代表唯一正解） */
function bestAlt(sc: DialogueScenario, nodeId: string, chosen: string) {
  const n = sc.nodes[nodeId];
  return n?.responseOptions.find((o) => o.quality === 'best' && o.id !== chosen)?.text;
}

export const LEVEL_LABEL: Record<DimensionLevel, { label: string; cls: string }> = {
  shown: { label: '已展現', cls: 'bg-emerald-100 text-emerald-800' },
  partial: { label: '部分展現', cls: 'bg-amber-100 text-amber-800' },
  needs: { label: '待加強', cls: 'bg-rose-100 text-rose-800' },
  unobserved: { label: '未觀察', cls: 'bg-slate-100 text-slate-500' },
};
