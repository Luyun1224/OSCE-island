import { useEffect, useState } from 'react';
import { SITE } from '../../config/site';
import type { TimeOfDay } from '../scene/timeOfDay';

const COUNTED_KEY = 'osce-islands:view-counted';

/**
 * 瀏覽次數：每個瀏覽工作階段只計一次（在站內切換頁面不重複計算），其餘時候只讀取。
 * 不收集任何個人資料，只記錄次數。
 */
function useViewCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!SITE.viewCounterUrl) return;
    let counted = false;
    try {
      counted = window.sessionStorage.getItem(COUNTED_KEY) === '1';
    } catch {
      // 無法使用 sessionStorage 時視為未計數
    }
    const url = `${SITE.viewCounterUrl}${SITE.viewCounterUrl.includes('?') ? '&' : '?'}action=${counted ? 'get' : 'hit'}`;
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { total?: number }) => {
        if (typeof d.total === 'number') setCount(d.total);
        if (!counted) {
          try {
            window.sessionStorage.setItem(COUNTED_KEY, '1');
          } catch {
            // 略過
          }
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  return count;
}

/** 群島右下角：製作單位與瀏覽次數 */
export function SiteCredit({ time }: { time: TimeOfDay }) {
  const views = useViewCount();
  const night = time === 'night';
  return (
    <div
      className={`pointer-events-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-glass ring-1 backdrop-blur-md md:text-xs ${
        night ? 'bg-slate-900/60 text-slate-200 ring-white/10' : 'bg-white/70 text-slate-600 ring-white/60'
      }`}
    >
      <span>{SITE.credit}</span>
      {views !== null && (
        <>
          <span className="opacity-40">|</span>
          <span title="累計瀏覽次數" className="tabular-nums">
            👁 {views.toLocaleString('zh-TW')}
          </span>
        </>
      )}
    </div>
  );
}
