import type { AssessmentResult, RubricItemDef } from './types';

/** AssessmentRubric 執行器：只負責依規準計算，不含任何 UI */
export function runRubric<C>(items: RubricItemDef<C>[], ctx: C): AssessmentResult {
  const results = items.map((item) => {
    const r = item.evaluate(ctx);
    return {
      id: item.id,
      title: item.title,
      criteria: item.criteria,
      observability: item.observability,
      physicalNote: item.physicalNote,
      stepIds: item.stepIds,
      ...r,
    };
  });
  return {
    items: results,
    total: results.reduce((sum, r) => sum + r.score, 0),
    max: items.length * 2,
    globalRating: null,
  };
}
