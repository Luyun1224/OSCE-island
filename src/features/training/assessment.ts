import type { AssessmentResult, RubricItemDef } from './types';

/** AssessmentRubric 執行器：只負責依規準計算，不含任何 UI */
export function runRubric<C>(items: RubricItemDef<C>[], ctx: C): AssessmentResult {
  const results = items.map((item) => {
    const r = item.evaluate(ctx);
    const allowedScores = item.allowedScores ?? [0, 1, 2];
    // 教案不允許的分數一律往下取（例如只有 0 / 2 的項目不會出現 1 分）
    const score = allowedScores.includes(r.score) ? r.score : (Math.max(...allowedScores.filter((x) => x <= r.score)) as typeof r.score);
    return {
      id: item.id,
      title: item.title,
      criteria: item.criteria,
      observability: item.observability,
      physicalNote: item.physicalNote,
      stepIds: item.stepIds,
      allowedScores,
      ...r,
      score,
    };
  });
  return {
    items: results,
    total: results.reduce((sum, r) => sum + r.score, 0),
    max: items.length * 2,
    globalRating: null,
  };
}
