/**
 * 網站設定
 * VIEW_COUNTER_URL：Google Apps Script 網頁應用程式網址（設定方式見 docs/view-counter.md）。
 * 可直接填在這裡，或在 GitHub repo 的 Actions 變數設定 VIEW_COUNTER_URL（建置時注入）。
 * 留空時不顯示瀏覽次數。
 */
export const SITE = {
  credit: '奇美醫院教學部｜臨床技能中心 製作',
  viewCounterUrl: (import.meta.env.VITE_VIEW_COUNTER_URL as string | undefined) ?? '',
};
