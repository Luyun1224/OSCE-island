import type { NewEvent } from '../../training/types';
import type { DomainResult } from '../../training/interactionEngine';
import type { CasePackage, CaseRubricItem, Mood, QuestionNode, SubItem } from '../types';

/**
 * 虛擬病人問診引擎（與案例內容無關，換案例只需換 CasePackage）
 */
export interface TranscriptLine {
  id: number;
  who: 'doctor' | 'patient';
  text: string;
  kind: 'question' | 'answer' | 'statement' | 'prompt' | 'pending';
  ref: string;
}

export interface ClinicState {
  asked: string[];
  said: string[];
  prompts: { id: string; answered: boolean }[];
  lines: TranscriptLine[];
  mood: Mood;
  lastNote: { ref: string; text: string } | null;
}

export type ClinicAction = { type: 'ask'; id: string } | { type: 'say'; id: string };

export function createClinicState(c: CasePackage): ClinicState {
  return { asked: [], said: [], prompts: [], lines: [], mood: c.patient.baselineMood, lastNote: null };
}

export const isUnlocked = (q: QuestionNode, asked: string[]) => !q.unlockAfter || q.unlockAfter.some((id) => asked.includes(id));

/** 已涵蓋的評分子要項 */
export function coveredSubs(c: CasePackage, s: Pick<ClinicState, 'asked' | 'said'>) {
  const set = new Set<string>();
  for (const id of s.asked) c.questions.find((q) => q.id === id)?.covers?.forEach((x) => set.add(x));
  for (const id of s.said) c.statements.find((q) => q.id === id)?.covers?.forEach((x) => set.add(x));
  return set;
}

export function makeClinicReducer(c: CasePackage) {
  return (s: ClinicState, a: ClinicAction): DomainResult<ClinicState> => {
    let next: ClinicState = { ...s };
    const events: NewEvent[] = [];
    let nid = (s.lines[s.lines.length - 1]?.id ?? 0) + 1;
    const push = (l: Omit<TranscriptLine, 'id'>) => {
      next.lines = [...next.lines, { ...l, id: nid++ }];
    };

    if (a.type === 'ask') {
      const q = c.questions.find((x) => x.id === a.id);
      if (!q || s.asked.includes(q.id) || !isUnlocked(q, s.asked)) return { state: s };
      next.asked = [...s.asked, q.id];
      push({ who: 'doctor', text: q.text, kind: 'question', ref: q.id });
      if (q.answer === null) {
        push({ who: 'patient', text: '（教案未提供此題的病人回答，待教案作者補充）', kind: 'pending', ref: q.id });
      } else {
        push({ who: 'patient', text: q.answer, kind: 'answer', ref: q.id });
      }
      next.mood = q.mood ?? s.mood;
      next.lastNote = q.note ? { ref: q.id, text: q.note } : null;
      events.push({ stepId: q.topic, kind: 'action', code: `ask:${q.id}`, message: q.text });
    } else {
      const st = c.statements.find((x) => x.id === a.id);
      if (!st || s.said.includes(st.id)) return { state: s };
      next.said = [...s.said, st.id];
      push({ who: 'doctor', text: st.text, kind: 'statement', ref: st.id });
      next.mood = st.mood ?? s.mood;
      next.lastNote = { ref: st.id, text: st.feedback };
      events.push({ stepId: st.topic, kind: st.incorrect ? 'error' : 'narration', code: `say:${st.id}`, message: st.text, why: st.feedback });
    }

    // 回應 SP 已提出的問題
    next.prompts = next.prompts.map((p) => {
      if (p.answered) return p;
      const def = c.spPrompts.find((x) => x.id === p.id)!;
      return def.answeredBy.some((id) => next.said.includes(id)) ? { ...p, answered: true } : p;
    });

    // 觸發新的 SP 提問（依情境，例如尚未提到鐵劑就不會問副作用）
    for (const p of c.spPrompts) {
      if (next.prompts.some((x) => x.id === p.id)) continue;
      const bySay = p.afterStatements?.some((id) => next.said.includes(id));
      const byCount = p.afterQuestionCount !== undefined && next.asked.length >= p.afterQuestionCount;
      if (bySay || byCount) {
        const answered = p.answeredBy.some((id) => next.said.includes(id));
        next.prompts = [...next.prompts, { id: p.id, answered }];
        if (!answered) {
          push({ who: 'patient', text: p.text, kind: 'prompt', ref: p.id });
          next.mood = 'worried';
          events.push({ stepId: 'explain', kind: 'system', code: `prompt:${p.id}`, message: `病人提問：${p.text}` });
        }
      }
    }
    return { state: next, events };
  };
}

/* ------------------------------------------------------------------ */
/* 評分                                                                 */
/* ------------------------------------------------------------------ */

export interface ItemResult {
  item: CaseRubricItem;
  score: 0 | 1 | 2;
  covered: SubItem[];
  missing: SubItem[];
}

export function evaluateItem(c: CasePackage, item: CaseRubricItem, covered: Set<string>): ItemResult {
  const sub = (id: string) => c.subItems.find((x) => x.id === id)!;
  const r = item.rule;
  if (r.type === 'count') {
    const hit = r.subs.filter((id) => covered.has(id));
    const score = hit.length >= r.full ? 2 : r.partial !== undefined && hit.length >= r.partial ? 1 : 0;
    return { item, score, covered: hit.map(sub), missing: r.subs.filter((id) => !covered.has(id)).map(sub) };
  }
  const fullHit = r.full.filter((id) => covered.has(id));
  const partialHit = (r.partial ?? []).filter((id) => covered.has(id));
  const score = fullHit.length ? 2 : partialHit.length ? 1 : 0;
  return { item, score, covered: [...fullHit, ...partialHit].map(sub), missing: fullHit.length ? [] : r.full.map(sub) };
}

export function evaluateCase(c: CasePackage, s: Pick<ClinicState, 'asked' | 'said'>) {
  const covered = coveredSubs(c, s);
  const items = c.rubric.map((it) => evaluateItem(c, it, covered));
  return { items, total: items.reduce((n, i) => n + i.score, 0), max: c.rubric.length * 2 };
}

/** 依實際問診產生的教學性回饋句 */
export function feedbackSentence(r: ItemResult): string {
  const isExplain = r.item.no >= 12;
  const verb = isExplain ? '說明' : r.item.no <= 2 ? '' : '詢問';
  const list = (xs: SubItem[]) => xs.map((x) => x.label).join('、');
  if (r.score === 2) return `✓ ${r.item.title}：已完整做到（${list(r.covered)}）。`;
  if (r.score === 0) {
    return r.missing.length ? `尚未${verb}${list(r.missing)}（第 ${r.item.no} 項：${r.item.title}）。` : `第 ${r.item.no} 項「${r.item.title}」尚未做到。`;
  }
  if (r.item.rule.type === 'count') {
    const need = r.item.rule.full - r.covered.length;
    if (need < r.missing.length) return `你已經${verb}${list(r.covered)}，還需要再${verb}其中 ${need} 項（${list(r.missing)}）。`;
    return `你已經${verb}${list(r.covered)}，但尚未${verb}${list(r.missing)}。`;
  }
  return `你已經做到「${list(r.covered)}」，若要完全做到，需要${verb}${list(r.missing)}。`;
}
