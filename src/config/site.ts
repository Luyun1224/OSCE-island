/**
 * 網站設定
 * VIEW_COUNTER_URL：Google Apps Script 網頁應用程式網址（設定方式見 docs/view-counter.md）。
 * 預設使用下方網址；若在 GitHub repo 的 Actions 變數設定 VIEW_COUNTER_URL，建置時會優先使用該變數。
 * 改成空字串即不顯示瀏覽次數。
 */
const GAS_URL =
  (import.meta.env.VITE_VIEW_COUNTER_URL as string | undefined) ||
  'https://script.google.com/macros/s/AKfycbwmdGRzaeqywzqwybnhBlxEYUsaaoqyW-cHsujS_2z__JXJ8J0p5zbrTPx4qPkyyhP_/exec';

export const SITE = {
  credit: '奇美醫院教學部｜臨床技能中心 製作',
  viewCounterUrl: GAS_URL,
  /** 練習紀錄上傳（同一個 Apps Script，設定見 docs/practice-log.md）；改成空字串即停止上傳 */
  practiceLogUrl: GAS_URL,
};
