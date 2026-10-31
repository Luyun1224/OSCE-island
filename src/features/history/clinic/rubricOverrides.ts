import type { CasePackage, CaseRubricItem, ReviewMeta } from '../types';

/**
 * 評分規準審核：教師在瀏覽器中修改規準文字、標記審核狀態，並可匯出 JSON 交給管理者更新案例檔。
 * 只影響顯示的文字與審核狀態；計分規則仍以案例檔中的宣告式規則為準。
 */
export interface RubricOverride {
  levels?: Record<number, string>;
  mappingNote?: string;
  review?: ReviewMeta;
}

const key = (caseId: string) => `osce-islands:rubric-review:${caseId}`;

export function loadOverrides(caseId: string): Record<string, RubricOverride> {
  try {
    const raw = window.localStorage.getItem(key(caseId));
    return raw ? (JSON.parse(raw) as Record<string, RubricOverride>) : {};
  } catch {
    return {};
  }
}

export function saveOverrides(caseId: string, o: Record<string, RubricOverride>) {
  try {
    window.localStorage.setItem(key(caseId), JSON.stringify(o));
  } catch {
    // 略過
  }
}

export function applyOverrides(c: CasePackage): CasePackage {
  const o = loadOverrides(c.id);
  if (!Object.keys(o).length) return c;
  const rubric: CaseRubricItem[] = c.rubric.map((it) => {
    const x = o[it.id];
    if (!x) return it;
    return {
      ...it,
      levels: it.levels.map((l) => ({ ...l, text: x.levels?.[l.score] ?? l.text })),
      mappingNote: x.mappingNote ?? it.mappingNote,
      review: x.review ?? it.review,
    };
  });
  return { ...c, rubric };
}

export function exportRubric(c: CasePackage) {
  const merged = applyOverrides(c);
  const data = merged.rubric.map(({ id, no, title, levels, rule, mappingNote, review }) => ({ id, no, title, levels, rule, mappingNote, review }));
  const blob = new Blob([JSON.stringify({ caseId: c.id, exportedAt: new Date().toISOString(), rubric: data }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${c.id}-rubric-review.json`;
  a.click();
  URL.revokeObjectURL(url);
}
