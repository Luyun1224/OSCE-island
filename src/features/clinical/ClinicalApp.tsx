import { useEffect } from 'react';
import { logVisit } from '../../lib/practiceLog';
import { matchPath } from '../../router';
import { getClinicalLesson } from './data/clinical6';
import { AcademyPage, ChallengePage, GamePage, HubPage, LabPage, LessonPage } from './pages/Pages';

/** CLINICAL DECISION ISLAND 子路由（獨立 lazy chunk） */
const PAGES: Record<string, string> = {
  '/clinical': 'CLINICAL DECISION 總覽',
  '/clinical/academy': '01 臨床推理學院',
  '/clinical/lab': '02 診斷線索實驗室',
  '/clinical/lab/clues': 'Game 1 臨床線索拼圖',
  '/clinical/lab/ddx': 'Game 2 鑑別診斷擂台',
  '/clinical/decision': '03 臨床處置決策中心（Game 3）',
  '/clinical/explain': '04 病情解釋模擬診間（Game 4）',
  '/clinical/challenge': '05 OSCE 臨床決策挑戰館',
};

export default function ClinicalApp({ path }: { path: string }) {
  useEffect(() => {
    const l = matchPath('/clinical/academy/:id', path);
    if (PAGES[path]) logVisit('clinical-management', path.slice(1).replace(/\//g, ':'), PAGES[path]);
    else if (l) logVisit('clinical-management', `lesson:${l.id}`, `CLINICAL-6 單元：${getClinicalLesson(l.id)?.englishTitle ?? l.id}`);
  }, [path]);

  if (matchPath('/clinical/lab/clues', path)) return <GamePage key="clues" id="clues" />;
  if (matchPath('/clinical/lab/ddx', path)) return <GamePage key="ddx" id="ddx" />;
  if (matchPath('/clinical/lab', path)) return <LabPage />;
  if (matchPath('/clinical/decision', path)) return <GamePage key="manage" id="manage" />;
  if (matchPath('/clinical/explain', path)) return <GamePage key="explain" id="explain" />;
  if (matchPath('/clinical/challenge', path)) return <ChallengePage />;
  const l = matchPath('/clinical/academy/:id', path);
  if (l) return <LessonPage key={l.id} id={l.id} />;
  if (matchPath('/clinical/academy', path)) return <AcademyPage />;
  return <HubPage />;
}
