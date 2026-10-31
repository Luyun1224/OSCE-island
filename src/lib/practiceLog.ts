import { SITE } from '../config/site';

/**
 * 練習紀錄上傳到 Google 試算表（透過 Apps Script，設定見 docs/practice-log.md）
 * - 匿名：每個瀏覽器一組隨機代碼，不收集姓名、學號或任何個資
 * - 使用 sendBeacon：學員關閉頁面也能送出；失敗時靜默略過，不影響練習
 */
export type PracticeModule = 'skill' | 'demo' | 'sop-unit' | 'lab-game' | 'case';

export interface PracticeLog {
  island: string;
  module: PracticeModule;
  itemId: string;
  itemTitle: string;
  mode?: string;
  score?: number;
  max?: number;
  durationSec?: number;
  result?: string;
  /** 補充資訊，例如各評分項目得分 */
  detail?: string;
}

const VISITOR_KEY = 'osce-islands:visitor';

function visitorId() {
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = `v-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'v-anonymous';
  }
}

function device() {
  return window.matchMedia?.('(max-width: 767px)').matches ? 'mobile' : 'desktop';
}

export function logPractice(r: PracticeLog) {
  const url = SITE.practiceLogUrl;
  if (!url) return;
  const body = JSON.stringify({
    action: 'log',
    visitor: visitorId(),
    device: device(),
    ...r,
    durationSec: r.durationSec !== undefined ? Math.round(r.durationSec) : undefined,
  });
  try {
    // text/plain 不會觸發 CORS 預檢，Apps Script 的 doPost 可直接讀取
    if (navigator.sendBeacon?.(url, new Blob([body], { type: 'text/plain;charset=utf-8' }))) return;
  } catch {
    // 改用 fetch
  }
  fetch(url, { method: 'POST', mode: 'no-cors', body, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, keepalive: true }).catch(() => undefined);
}
