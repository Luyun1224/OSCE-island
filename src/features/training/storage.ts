import type { AttemptRecord } from './types';

/** 本機練習紀錄：僅存在使用者瀏覽器，不上傳、不含個資 */
const key = (skillId: string) => `osce-islands:attempts:${skillId}`;
const MAX_RECORDS = 30;

export function loadAttempts(skillId: string): AttemptRecord[] {
  try {
    const raw = window.localStorage.getItem(key(skillId));
    return raw ? (JSON.parse(raw) as AttemptRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(record: AttemptRecord) {
  try {
    const list = [record, ...loadAttempts(record.skillId)].slice(0, MAX_RECORDS);
    window.localStorage.setItem(key(record.skillId), JSON.stringify(list));
  } catch {
    // 私密瀏覽或儲存空間被封鎖時略過，不影響練習
  }
}

export function clearAttempts(skillId: string) {
  try {
    window.localStorage.removeItem(key(skillId));
  } catch {
    // 略過
  }
}
