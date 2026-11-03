import type { ClinicalCase, DecisionEvent, DifferentialDiagnosis, ManagementOption, Necessity, PatientState } from '../types';

/**
 * 判分與模擬引擎（純函式；所有規則來自病例資料）
 * 每一個回饋都是一個 DecisionEvent，對應學生實際的操作。
 */
const ev = (e: DecisionEvent) => e;

/* ------------------------------ Game 1 ------------------------------ */

export function evaluateSummary(c: ClinicalCase, chosen: string[], prId: string | null): DecisionEvent[] {
  const out: DecisionEvent[] = [];
  const has = (id: string) => chosen.includes(id);
  const by = (role: string) => c.evidence.filter((e) => e.role === role);

  for (const e of by('key-positive'))
    out.push(ev({ game: 'clues', kind: 'key-positive', ref: e.id, label: e.text, quality: has(e.id) ? 'good' : 'poor', dims: ['integration'], note: has(e.id) ? `保留關鍵陽性：${e.explain}` : `漏掉關鍵陽性：${e.explain}` }));
  const negs = by('key-negative');
  const negHit = negs.filter((e) => has(e.id));
  out.push(ev({ game: 'clues', kind: 'key-negative', ref: 'negatives', label: `關鍵陰性 ${negHit.length}/${negs.length}`, quality: negHit.length >= 2 ? 'good' : negHit.length === 1 ? 'acceptable' : 'poor', dims: ['summary', 'integration'], note: negHit.length >= 2 ? '保留了能排除其他感染源的關鍵陰性發現。' : '關鍵陰性能幫助排除其他診斷（例如：沒有咳嗽、頸部柔軟、無右上腹痛），摘要至少保留兩項。' }));
  const tl = by('timeline');
  for (const e of tl) out.push(ev({ game: 'clues', kind: 'timeline', ref: e.id, label: e.text, quality: has(e.id) ? 'good' : 'poor', dims: ['summary'], note: has(e.id) ? '保留了時間特徵（症狀如何演變）。' : '缺少時間特徵：病程的演變是推理的重要線索。' }));
  const sev = by('severity');
  const sevHit = sev.filter((e) => has(e.id));
  out.push(ev({ game: 'clues', kind: 'severity', ref: 'severity', label: `嚴重度指標 ${sevHit.length}/${sev.length}`, quality: sevHit.length >= 3 ? 'good' : sevHit.length >= 1 ? 'acceptable' : 'poor', dims: ['recognition', 'summary'], note: sevHit.length >= 3 ? '摘要呈現了病況的嚴重度（低血壓、意識、乳酸、腎功能等）。' : '摘要要呈現嚴重度（例如低血壓、意識改變、乳酸、急性腎損傷），否則會低估急迫性。' }));
  const ctx = by('context');
  for (const e of ctx) out.push(ev({ game: 'clues', kind: 'context', ref: e.id, label: e.text, quality: has(e.id) ? 'good' : 'acceptable', dims: ['summary'], note: has(e.id) ? '保留背景資訊（年齡、重要共病）。' : '背景（年齡、重要共病）有助於判斷風險。' }));
  const noise = c.evidence.filter((e) => e.role === 'irrelevant' && has(e.id));
  if (noise.length) out.push(ev({ game: 'clues', kind: 'noise', ref: 'noise', label: noise.map((n) => n.text).join('、'), quality: 'poor', dims: ['summary'], note: '摘要要精簡：無關資訊會稀釋重點。' }));
  if (chosen.length > c.summaryMaxCards) out.push(ev({ game: 'clues', kind: 'length', ref: 'length', label: `${chosen.length} 張卡片`, quality: 'acceptable', dims: ['summary'], note: `問題摘要通常控制在 ${c.summaryMaxCards} 項以內的關鍵資訊。` }));
  const pr = c.problemRepresentations.find((p) => p.id === prId);
  if (pr) out.push(ev({ game: 'clues', kind: 'problem-representation', ref: pr.id, label: pr.text.slice(0, 40) + '…', quality: pr.quality === 'best' ? 'good' : pr.quality === 'ok' ? 'acceptable' : 'poor', dims: ['summary', 'recognition'], note: pr.feedback }));
  return out;
}

/* ------------------------------ Game 2 ------------------------------ */

export type Assign = Record<string, Record<string, '+' | '-'>>;

export function evaluateDdx(c: ClinicalCase, selected: string[], order: string[], assign: Assign, flagged: string[]): DecisionEvent[] {
  const out: DecisionEvent[] = [];
  const dx = (id: string) => c.differentials.find((d) => d.id === id)!;
  const leading = c.differentials.filter((d) => d.likelihood === 'leading');
  for (const d of leading)
    out.push({ game: 'ddx', kind: 'select', ref: d.id, label: d.name, quality: selected.includes(d.id) ? 'good' : 'poor', dims: ['ddx'], note: selected.includes(d.id) ? `列入最可能的診斷：${d.reasoning}` : `漏掉最可能的診斷：${d.reasoning}` });
  for (const d of c.differentials.filter((x) => x.likelihood === 'possible'))
    out.push({ game: 'ddx', kind: 'select', ref: d.id, label: d.name, quality: selected.includes(d.id) ? 'good' : 'poor', dims: ['ddx'], note: selected.includes(d.id) ? `考慮到重要的可能診斷：${d.reasoning}` : `應考慮：${d.reasoning}` });

  order.forEach((id, i) => {
    const d = dx(id);
    if (!d.rank) return;
    const ok = i + 1 >= d.rank[0] && i + 1 <= d.rank[1];
    out.push({ game: 'ddx', kind: 'rank', ref: id, label: `${i + 1}. ${d.name}`, quality: ok ? 'good' : d.likelihood === 'unlikely' && i < 2 ? 'poor' : 'acceptable', dims: ['ddx'], note: ok ? '優先順序合理。' : d.likelihood === 'unlikely' ? `排得太前面：${d.reasoning}` : `可以再往前：${d.reasoning}` });
  });

  for (const id of Object.keys(assign)) {
    const d = dx(id);
    const a = assign[id];
    const wrong = Object.entries(a).filter(([e, s]) => (s === '+' && d.against.includes(e)) || (s === '-' && d.support.includes(e)));
    const sup = Object.entries(a).filter(([e, s]) => s === '+' && d.support.includes(e)).length;
    const ag = Object.entries(a).filter(([e, s]) => s === '-' && d.against.includes(e)).length;
    const name = (e: string) => c.evidence.find((x) => x.id === e)?.text ?? e;
    if (wrong.length)
      out.push({ game: 'ddx', kind: 'evidence', ref: id, label: d.name, quality: 'poor', dims: ['evidence'], note: `證據方向有誤：${wrong.map(([e, s]) => `「${name(e)}」${s === '+' ? '其實不支持' : '其實支持'}這個診斷`).join('；')}。${d.reasoning}` });
    const needSup = Math.min(2, d.support.length);
    const needAg = Math.min(1, d.against.length);
    const enough = sup >= needSup && ag >= needAg;
    out.push({ game: 'ddx', kind: 'evidence', ref: id, label: d.name, quality: enough && !wrong.length ? 'good' : sup + ag > 0 ? 'acceptable' : 'poor', dims: ['evidence'], note: enough ? `支持 ${sup} 項、反對 ${ag} 項，證據配置合理。` : `${d.against.length ? '支持與反對證據都要配置' : '至少配置兩項支持證據'}。參考：${d.reasoning}` });
  }

  for (const d of c.differentials) {
    const f = flagged.includes(d.id);
    if (d.mustNotMiss || f)
      out.push({ game: 'ddx', kind: 'must-not-miss', ref: d.id, label: d.name, quality: f === d.mustNotMiss ? 'good' : d.mustNotMiss ? 'poor' : 'acceptable', dims: ['ddx', 'recognition'], note: d.mustNotMiss ? (f ? `正確標示為不能漏掉：${d.nextStep}` : `這是不能漏掉的疾病：${d.reasoning} ${d.nextStep}`) : '不是本例中最需要優先排除的危險疾病。' });
  }
  return out;
}

/* ------------------------------ Game 3 ------------------------------ */

const NEC: Record<Necessity, string> = { essential: '必要', reasonable: '合理', unnecessary: '非必要', harmful: '不適當／可能有害' };

export function evaluateOptions(items: { id: string; name: string; necessity: Necessity; rationale: string; safetyIfChosen?: string; safetyIfMissed?: string }[], chosen: string[], dims: DecisionEvent['dims'], kind: string): DecisionEvent[] {
  return items.flatMap((o): DecisionEvent[] => {
    const on = chosen.includes(o.id);
    if (o.necessity === 'essential') return [{ game: 'manage', kind, ref: o.id, label: o.name, quality: on ? 'good' : 'poor', dims, note: `${on ? '✓' : '遺漏'}（${NEC.essential}）：${o.rationale}`, safety: !on ? o.safetyIfMissed : undefined }];
    if (o.necessity === 'harmful' && on) return [{ game: 'manage', kind, ref: o.id, label: o.name, quality: 'unsafe', dims, note: `${NEC.harmful}：${o.rationale}`, safety: o.safetyIfChosen ?? `選擇了不適當或可能有害的項目：${o.name}` }];
    if (o.necessity === 'unnecessary' && on) return [{ game: 'manage', kind, ref: o.id, label: o.name, quality: 'poor', dims, note: `${NEC.unnecessary}：${o.rationale}` }];
    if (o.necessity === 'reasonable' && on) return [{ game: 'manage', kind, ref: o.id, label: o.name, quality: 'good', dims, note: `${NEC.reasonable}：${o.rationale}` }];
    return [];
  });
}

/** 第一小時的時間順序（規則來自病例資料：beforeTreatment、mustNotDelay） */
export function evaluateTimeline(c: ClinicalCase, order: string[]): DecisionEvent[] {
  const out: DecisionEvent[] = [];
  const pos = (id: string) => order.indexOf(id);
  const abx = pos('m-abx');
  if (abx < 0) return out;
  for (const i of c.investigations.filter((x) => x.beforeTreatment && order.includes(x.id)))
    out.push({ game: 'manage', kind: 'timing', ref: i.id, label: `${i.name} → 抗生素`, quality: pos(i.id) < abx ? 'good' : 'acceptable', dims: ['priority'], note: pos(i.id) < abx ? '培養在抗生素前完成。' : '培養最好在抗生素前抽取（但不能因此延誤抗生素）。' });
  for (const i of c.investigations.filter((x) => x.mustNotDelay && order.includes(x.id)))
    out.push({ game: 'manage', kind: 'timing', ref: i.id, label: `${i.name} 與抗生素的順序`, quality: pos(i.id) < abx ? 'poor' : 'good', dims: ['priority'], note: pos(i.id) < abx ? `${i.name}不應排在抗生素之前：等待檢查會延誤治療。` : '先開始抗生素，影像檢查可同步或隨後進行。' });
  const fluid = pos('m-fluid');
  if (fluid >= 0) out.push({ game: 'manage', kind: 'timing', ref: 'm-fluid', label: '輸液復甦的時間', quality: fluid <= 2 ? 'good' : 'acceptable', dims: ['priority'], note: fluid <= 2 ? '低血壓時儘早開始輸液。' : '低血壓時輸液應更早開始，可與抽血同步。' });
  return out;
}

/** 依病例的模擬後果規則計算病人狀態 */
export function simulate(c: ClinicalCase, chosen: string[]): { state: PatientState; fired: { narrative: string; safety?: string; source: string }[] } {
  let s: PatientState = { ...c.initialState, vitals: { ...c.initialState.vitals } };
  const fired: { narrative: string; safety?: string; source: string }[] = [];
  for (const o of c.outcomes) {
    const ok = (o.when.chosen ?? []).every((id) => chosen.includes(id)) && (o.when.notChosen ?? []).every((id) => !chosen.includes(id));
    if (!ok) continue;
    const { vitals, ...rest } = o.effect;
    s = { ...s, ...rest, vitals: { ...s.vitals, ...(vitals ?? {}) } };
    fired.push({ narrative: o.narrative, safety: o.safety, source: o.source });
  }
  return { state: s, fired };
}

export const MAP = (s: PatientState) => Math.round((s.vitals.sbp + 2 * s.vitals.dbp) / 3);

export function managementByPhase(c: ClinicalCase, phase: ManagementOption['phase']) {
  return c.management.filter((m) => m.phase === phase);
}

/* ------------------------------ Game 4 ------------------------------ */

export function explainEvent(elementId: string, title: string, verdict: string, text: string, feedback: string): DecisionEvent {
  const dims: DecisionEvent['dims'] = elementId === 'followup' ? ['followup', 'explanation'] : elementId === 'risks' || elementId === 'treatment' ? ['treatment', 'explanation'] : ['explanation'];
  return { game: 'explain', kind: elementId, ref: elementId, label: `${title}：${text.slice(0, 30)}…`, quality: verdict === 'accurate' ? 'good' : verdict === 'incomplete' || verdict === 'ignores-reason' ? 'acceptable' : 'poor', dims, note: feedback };
}

export function differentialById(c: ClinicalCase, id: string): DifferentialDiagnosis | undefined {
  return c.differentials.find((d) => d.id === id);
}
