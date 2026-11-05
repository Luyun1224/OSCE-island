import { EXTERNAL_LINKS } from '../../config/site';
import { logVisit } from '../../lib/practiceLog';

const L = EXTERNAL_LINKS.skillsIsland;

/** 記錄點擊（sendBeacon，不阻擋換頁）；不呼叫 preventDefault，交給瀏覽器正常導覽 */
const track = () => logVisit('map', 'external:skills-island', '前往臨床技能島（外部網站）');

/**
 * 「前往臨床技能島」入口（外部網站）
 * 使用一般 <a>、target="_self"：在目前分頁開啟，瀏覽器上一頁可返回；不使用 window.open 或 target="_blank"。
 * 外部網址不經過本站 hash 路由（navigate）。
 */
export function SkillsIslandLink({ compact }: { compact?: boolean }) {
  if (compact)
    return (
      <a
        href={L.url}
        target="_self"
        onClick={track}
        aria-label={`${L.label}：${L.description}`}
        className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-black text-white shadow-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        ⛵ {L.label}
      </a>
    );
  return (
    <a
      href={L.url}
      target="_self"
      onClick={track}
      aria-label={`${L.label}：${L.description}`}
      className="group mt-1 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2.5 ring-1 ring-orange-200 outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl shadow-sm">⛵</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-black text-orange-700">{L.label}</span>
        <span className="block truncate text-[11px] text-slate-500">搭船前往另一座島（外部網站）</span>
      </span>
      <span className="text-orange-500 transition group-hover:translate-x-0.5" aria-hidden>
        →
      </span>
    </a>
  );
}
