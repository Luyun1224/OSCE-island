import { matchPath } from '../../router';
import { AcademyPage } from './pages/AcademyPage';
import { ClinicPage } from './pages/ClinicPage';
import { HubPage } from './pages/HubPage';
import { GamePage, LabPage } from './pages/LabPages';
import { ReviewPage } from './pages/ReviewPage';
import { UnitPage } from './pages/UnitPage';
import { CaseApp } from './clinic/CaseApp';
import { getCase } from './cases/case001-dizziness';

/** HISTORY QUEST 子路由（整個病史詢問島為獨立 lazy chunk） */
export default function HistoryQuestApp({ path }: { path: string }) {
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
