import { useEffect } from 'react';
import { logVisit } from '../../lib/practiceLog';
import { matchPath } from '../../router';
import { getGame } from './data/labGames';
import { getUnit } from './data/sopUnits';
import { AcademyPage } from './pages/AcademyPage';
import { ClinicPage } from './pages/ClinicPage';
import { HubPage } from './pages/HubPage';
import { GamePage, LabPage } from './pages/LabPages';
import { ReviewPage } from './pages/ReviewPage';
import { UnitPage } from './pages/UnitPage';
import { CaseApp } from './clinic/CaseApp';
import { getCase } from './cases/case001-dizziness';

/** HISTORY QUEST 子路由（整個病史詢問島為獨立 lazy chunk） */
const PAGES: Record<string, string> = {
  '/history': 'HISTORY QUEST 總覽',
  '/history/academy': '01 問診 SOP 學院',
  '/history/lab': '02 問診技巧訓練場',
  '/history/clinic': '03 虛擬病人診間',
  '/history/review': '04 問診能力分析中心',
};

/** 瀏覽紀錄：建築與單元／遊戲／案例頁面 */
function visitOf(path: string): [string, string] | null {
  if (PAGES[path]) return [path.slice(1).replace(/\//g, ':'), PAGES[path]];
  const unit = matchPath('/history/academy/:unitId', path);
  if (unit) return [`unit:${unit.unitId}`, `SOP 單元：${getUnit(unit.unitId)?.title ?? unit.unitId}`];
  const game = matchPath('/history/lab/:gameId', path);
  if (game) return [`game:${game.gameId}`, `訓練場遊戲：${getGame(game.gameId)?.title ?? game.gameId}`];
  const cs = matchPath('/history/clinic/:caseId', path);
  const c = cs && getCase(cs.caseId);
  if (c) return [`case:${c.id}`, `虛擬病人案例：${c.code}：${c.title}`];
  return null;
}

export default function HistoryQuestApp({ path }: { path: string }) {
  useEffect(() => {
    const v = visitOf(path);
    if (v) logVisit('history-taking', v[0], v[1]);
  }, [path]);

  const unit = matchPath('/history/academy/:unitId', path);
  if (unit) return <UnitPage key={unit.unitId} unitId={unit.unitId} />;
  if (matchPath('/history/academy', path)) return <AcademyPage />;
  const game = matchPath('/history/lab/:gameId', path);
  if (game) return <GamePage key={game.gameId} gameId={game.gameId} />;
  if (matchPath('/history/lab', path)) return <LabPage />;
  const cs = matchPath('/history/clinic/:caseId', path);
  if (cs && getCase(cs.caseId)) return <CaseApp key={cs.caseId} c={getCase(cs.caseId)!} />;
  if (matchPath('/history/clinic', path)) return <ClinicPage />;
  if (matchPath('/history/review', path)) return <ReviewPage />;
  return <HubPage />;
}
