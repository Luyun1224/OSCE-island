import { useEffect } from 'react';
import { logVisit } from '../../lib/practiceLog';
import { matchPath } from '../../router';
import { getScene } from './cases/theaterScenes';
import { getVspCase } from './cases/case-lin-anxiety';
import { getLesson } from './data/care6';
import { getFramework } from './data/frameworks';
import { AcademyPage, LessonPage, SopChallengePage } from './pages/AcademyPages';
import { HubPage } from './pages/HubPage';
import { TheaterPage } from './pages/TheaterPage';
import { ToolPage, ToolsPage } from './pages/ToolPages';
import { VspCasePage, VspCenterPage } from './pages/VspPages';
import { WorkshopPage } from './pages/WorkshopPage';

/** CARE ISLAND 子路由（整個醫病溝通島為獨立 lazy chunk） */
const PAGES: Record<string, string> = {
  '/care': 'CARE ISLAND 總覽',
  '/care/academy': '01 溝通 SOP 學院',
  '/care/academy/game-sop': 'Game 1 溝通 SOP 挑戰',
  '/care/theater': '02 同理心對話劇場',
  '/care/workshop': '03 衛教互動工坊',
  '/care/tools': '04 困難溝通情境館',
  '/care/vsp': '05 Virtual SP 挑戰中心',
};

function visitOf(path: string): [string, string] | null {
  if (PAGES[path]) return [path.slice(1).replace(/\//g, ':'), PAGES[path]];
  const l = matchPath('/care/academy/:id', path);
  if (l) return [`lesson:${l.id}`, `CARE-6 單元：${getLesson(l.id)?.englishTitle ?? l.id}`];
  const sc = matchPath('/care/theater/:id', path);
  if (sc) return [`scene:${sc.id}`, `劇場：${getScene(sc.id)?.title ?? sc.id}`];
  const t = matchPath('/care/tools/:id', path);
  if (t) return [`tool:${t.id}`, `工具：${getFramework(t.id)?.name ?? t.id}`];
  const v = matchPath('/care/vsp/:id', path);
  if (v) return [`vsp:${v.id}`, `VSP：${getVspCase(v.id)?.title ?? v.id}`];
  return null;
}

export default function CareApp({ path }: { path: string }) {
  useEffect(() => {
    const v = visitOf(path);
    if (v) logVisit('communication', v[0], v[1]);
  }, [path]);

  if (matchPath('/care/academy/game-sop', path)) return <SopChallengePage />;
  const l = matchPath('/care/academy/:id', path);
  if (l) return <LessonPage key={l.id} lessonId={l.id} />;
  if (matchPath('/care/academy', path)) return <AcademyPage />;
  const sc = matchPath('/care/theater/:id', path);
  if (sc) return <TheaterPage key={sc.id} sceneId={sc.id} />;
  if (matchPath('/care/theater', path)) return <TheaterPage />;
  if (matchPath('/care/workshop', path)) return <WorkshopPage />;
  const t = matchPath('/care/tools/:id', path);
  if (t) return <ToolPage key={t.id} toolId={t.id} />;
  if (matchPath('/care/tools', path)) return <ToolsPage />;
  const v = matchPath('/care/vsp/:id', path);
  if (v) return <VspCasePage key={v.id} caseId={v.id} />;
  if (matchPath('/care/vsp', path)) return <VspCenterPage />;
  return <HubPage />;
}
