import { useCallback, useState } from 'react';
import { logPractice, type PracticeModule } from '../../lib/practiceLog';

/**
 * CARE ISLAND 本機學習紀錄（只存在學員自己的瀏覽器）＋匿名練習紀錄上傳
 */
const KEY = 'osce-islands:care-progress';

export type CareKind = 'lesson' | 'game' | 'tool' | 'scene' | 'vsp';

export interface CareProgress {
  done: Record<string, { at: string; attempts: number; score?: number; max?: number }>;
}

const MODULE: Record<CareKind, PracticeModule> = { lesson: 'sop-unit', game: 'lab-game', tool: 'lab-game', scene: 'lab-game', vsp: 'case' };

export function loadCare(): CareProgress {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { done: (JSON.parse(raw) as Partial<CareProgress>).done ?? {} } : { done: {} };
  } catch {
    return { done: {} };
  }
}

export function recordCare(kind: CareKind, id: string, title: string, r: { score?: number; max?: number; mode?: string; durationSec?: number; result?: string; detail?: string } = {}) {
  const p = loadCare();
  const k = `${kind}:${id}`;
  p.done[k] = { at: new Date().toISOString(), attempts: (p.done[k]?.attempts ?? 0) + 1, score: r.score, max: r.max };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // 私密瀏覽略過
  }
  logPractice({ island: 'communication', module: MODULE[kind], itemId: id, itemTitle: title, mode: r.mode, score: r.score, max: r.max, durationSec: r.durationSec, result: r.result ?? 'completed', detail: r.detail });
}

/** 開始一次練習（與完成紀錄對照可算完成率） */
export function logCareStart(id: string, title: string, mode?: string) {
  logPractice({ island: 'communication', module: 'start', itemId: id, itemTitle: title, mode });
}

export const isDone = (p: CareProgress, kind: CareKind, id: string) => !!p.done[`${kind}:${id}`];

export function useCareProgress() {
  const [p, setP] = useState(loadCare);
  const refresh = useCallback(() => setP(loadCare()), []);
  return { progress: p, refresh };
}
