import { logPractice, type PracticeModule } from '../../lib/practiceLog';

/** CLINICAL DECISION ISLAND 本機紀錄＋匿名練習紀錄 */
const KEY = 'osce-islands:clinical-progress';
export type ClinicalKind = 'lesson' | 'game' | 'challenge';
const MODULE: Record<ClinicalKind, PracticeModule> = { lesson: 'sop-unit', game: 'lab-game', challenge: 'case' };

export function loadClinical(): Record<string, { at: string; attempts: number }> {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function recordClinical(kind: ClinicalKind, id: string, title: string, r: { score?: number; max?: number; durationSec?: number; result?: string; detail?: string; mode?: string } = {}) {
  const p = loadClinical();
  const k = `${kind}:${id}`;
  p[k] = { at: new Date().toISOString(), attempts: (p[k]?.attempts ?? 0) + 1 };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // 略過
  }
  logPractice({ island: 'clinical-management', module: MODULE[kind], itemId: id, itemTitle: title, ...r, result: r.result ?? 'completed' });
}

export function logClinicalStart(id: string, title: string, mode?: string) {
  logPractice({ island: 'clinical-management', module: 'start', itemId: id, itemTitle: title, mode });
}

export const doneClinical = (kind: ClinicalKind, id: string) => !!loadClinical()[`${kind}:${id}`];
