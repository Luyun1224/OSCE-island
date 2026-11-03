import { logPractice, type PracticeModule } from '../../lib/practiceLog';

const KEY = 'osce-islands:exam-progress';
export type ExamKind = 'lesson' | 'game';
const MODULE: Record<ExamKind, PracticeModule> = { lesson: 'sop-unit', game: 'lab-game' };

export function doneExam(kind: ExamKind, id: string) {
  try {
    return !!JSON.parse(window.localStorage.getItem(KEY) ?? '{}')[`${kind}:${id}`];
  } catch {
    return false;
  }
}

export function recordExam(kind: ExamKind, id: string, title: string, r: { score?: number; max?: number; durationSec?: number; detail?: string } = {}) {
  try {
    const p = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    p[`${kind}:${id}`] = new Date().toISOString();
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // 略過
  }
  logPractice({ island: 'physical-exam', module: MODULE[kind], itemId: id, itemTitle: title, ...r, result: 'completed' });
}

export function logExamStart(id: string, title: string) {
  logPractice({ island: 'physical-exam', module: 'start', itemId: id, itemTitle: title });
}
