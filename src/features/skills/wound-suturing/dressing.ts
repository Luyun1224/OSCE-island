import { MODEL } from './caseData';
import { HALF_WOUND, type Pt } from './geometry';
import type { WSState } from './engine';

const HALF_GAUZE = MODEL.gauzeSize / 2;

/** 紙膠帶是否跨越紗布邊緣（膠帶中心落在紗布邊界附近） */
export function tapeSecures(gauze: Pt, tape: Pt) {
  const dx = Math.abs(tape.x - gauze.x);
  const dy = Math.abs(tape.y - gauze.y);
  const nearVertical = Math.abs(dx - HALF_GAUZE) <= 1.6 && dy <= HALF_GAUZE;
  const nearHorizontal = Math.abs(dy - HALF_GAUZE) <= 1.6 && dx <= HALF_GAUZE;
  return nearVertical || nearHorizontal;
}

/** 膠帶應沿著最近的紗布邊緣垂直跨越：回傳是否為水平擺放 */
export function tapeHorizontal(gauze: Pt | null, tape: Pt) {
  if (!gauze) return true;
  const dx = Math.abs(tape.x - gauze.x) - HALF_GAUZE;
  const dy = Math.abs(tape.y - gauze.y) - HALF_GAUZE;
  return Math.abs(dx) < Math.abs(dy);
}

export function dressingAnalysis(s: WSState) {
  const g = s.dressing.gauze;
  const covered = !!g && Math.abs(g.x) + HALF_WOUND + 0.4 <= HALF_GAUZE && Math.abs(g.y) + 0.8 <= HALF_GAUZE;
  const securedTapes = g ? s.dressing.tapes.filter((t) => tapeSecures(g, t)).length : 0;
  return { covered, securedTapes, taped: securedTapes >= 2 };
}
