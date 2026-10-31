import { Suspense, lazy, useEffect, useMemo, type ComponentType, type LazyExoticComponent } from 'react';
import { ISLAND_MAP } from './data/islandData';
import { IslandMapPage } from './pages/IslandMapPage';
import { SkillCenterPage } from './features/skills/SkillCenterPage';
import { getSkill } from './features/skills/registry/skillRegistry';
import { logRouteVisit } from './lib/routeVisit';
import { matchPath, navigate, useHashPath } from './router';
import type { IslandId } from './types/island';

/**
 * 路由表
 *  #/                         群島地圖
 *  #/map/:islandId            群島地圖並聚焦指定島嶼
 *  #/island/procedural-skills 技能訓練中心
 *  #/skill/:skillId           技能訓練關卡
 *  #/history/...              病史詢問島 HISTORY QUEST
 */
const lazyCache = new Map<string, LazyExoticComponent<ComponentType>>();
const HistoryQuestApp = lazy(() => import('./features/history/HistoryQuestApp'));

function Loading({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      {text}
    </div>
  );
}

function SkillRoute({ skillId }: { skillId: string }) {
  const skill = getSkill(skillId);
  const Module = useMemo(() => {
    if (!skill?.load || skill.status !== 'available') return null;
    if (!lazyCache.has(skill.id)) lazyCache.set(skill.id, lazy(skill.load));
    return lazyCache.get(skill.id)!;
  }, [skill]);

  if (!Module) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg font-bold text-slate-700">此技能關卡尚在規劃中</p>
        <button type="button" onClick={() => navigate('/island/procedural-skills')} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">
          回到技能訓練中心
        </button>
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          正在準備模擬診間…
        </div>
      }
    >
      <Module />
    </Suspense>
  );
}

export default function App() {
  const path = useHashPath();
  useEffect(() => logRouteVisit(path), [path]);

  if (matchPath('/island/procedural-skills', path)) return <SkillCenterPage />;

  if (path === '/history' || path.startsWith('/history/')) {
    return (
      <Suspense fallback={<Loading text="正在前往病史偵探學院…" />}>
        <HistoryQuestApp path={path} />
      </Suspense>
    );
  }

  const skill = matchPath('/skill/:skillId', path);
  if (skill) return <SkillRoute key={skill.skillId} skillId={skill.skillId} />;

  const map = matchPath('/map/:islandId', path);
  const islandId = map && map.islandId in ISLAND_MAP ? (map.islandId as IslandId) : null;
  return <IslandMapPage key={islandId ?? 'overview'} initialIslandId={islandId} />;
}
