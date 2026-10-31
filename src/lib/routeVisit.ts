import { ISLAND_MAP } from '../data/islandData';
import { getSkill } from '../features/skills/registry/skillRegistry';
import { matchPath } from '../router';
import { logVisit } from './practiceLog';

/** 依網址記錄頁面瀏覽（病史詢問島的頁面由 HistoryQuestApp 記錄，以取得單元／案例標題） */
export function logRouteVisit(path: string) {
  if (matchPath('/island/procedural-skills', path)) {
    logVisit('procedural-skills', 'skill-center', '技能訓練中心');
    return;
  }
  const skill = matchPath('/skill/:skillId', path);
  if (skill) {
    const def = getSkill(skill.skillId);
    logVisit('procedural-skills', `skill:${skill.skillId}`, `${def?.title ?? skill.skillId}（進入關卡）`);
    return;
  }
  const map = matchPath('/map/:islandId', path);
  if (map && map.islandId in ISLAND_MAP) return; // 由地圖選取島嶼時記錄
  if (path === '/' || path === '') logVisit('map', 'map', '群島地圖');
}
