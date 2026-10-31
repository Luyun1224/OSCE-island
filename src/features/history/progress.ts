import { useCallback, useState } from 'react';
import type { ActivityResult } from './types';

/**
 * HISTORY QUEST 本機學習紀錄（只存在學員自己的瀏覽器，不上傳、不含個資）
 */
const KEY = 'osce-islands:history-progress';
const MAX_HISTORY = 40;

export interface RunRecord {
  kind: 'unit' | 'game';
  id: string;
  score: number;
  max: number;
  at: string;
  notes: string[];
}

export interface ProgressState {
  best: Record<string, { score: number; max: number; completedAt: string; attempts: number }>;
  history: RunRecord[];
}

const empty = (): ProgressState => ({ best: {}, history: [] });

export function loadProgress(): ProgressState {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...empty(), ...(JSON.parse(raw) as ProgressState) } : empty();
  } catch {
    return empty();
  }
}

function save(p: ProgressState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // 私密瀏覽等情況略過
  }
}

const keyOf = (kind: RunRecord['kind'], id: string) => `${kind}:${id}`;

export function recordRun(kind: RunRecord['kind'], id: string, results: ActivityResult[]) {
  const p = loadProgress();
  const score = results.reduce((s, r) => s + r.score, 0);
  const max = results.reduce((s, r) => s + r.max, 0);
  const at = new Date().toISOString();
  const k = keyOf(kind, id);
  const prev = p.best[k];
  p.best[k] = {
    score: prev && prev.score / prev.max >= score / max ? prev.score : score,
    max: prev && prev.score / prev.max >= score / max ? prev.max : max,
    completedAt: at,
    attempts: (prev?.attempts ?? 0) + 1,
  };
  p.history = [{ kind, id, score, max, at, notes: results.flatMap((r) => r.notes).slice(0, 8) }, ...p.history].slice(0, MAX_HISTORY);
  save(p);
  return p;
}

export function getBest(kind: RunRecord['kind'], id: string, p: ProgressState = loadProgress()) {
  return p.best[keyOf(kind, id)] ?? null;
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 略過
  }
}

export function useProgress() {
  const [p, setP] = useState(loadProgress);
  const refresh = useCallback(() => setP(loadProgress()), []);
  return { progress: p, refresh };
}
