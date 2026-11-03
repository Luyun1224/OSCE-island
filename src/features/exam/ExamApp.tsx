import { useEffect } from 'react';
import { logVisit } from '../../lib/practiceLog';
import { matchPath } from '../../router';
import { AcademyPage, AnatomyPage, HubPage, LocatePage, Pe7Page, PlanPage, PracticePage, SequencePage, SystemPage, TechniquePage } from './pages/Pages';
import type { SystemId } from './types';

/** PHYSICAL EXAM QUEST 子路由（獨立 lazy chunk；3D 人體再獨立分包） */
export default function ExamApp({ path }: { path: string }) {
  useEffect(() => {
    logVisit('physical-exam', path.slice(1).replace(/\//g, ':'), `身體檢查島 ${path}`);
  }, [path]);

  const seq = matchPath('/exam/practice/sequence/:id', path);
  if (seq) return <SequencePage key={seq.id} id={seq.id} />;
  const sys = matchPath('/exam/practice/:id', path);
  if (sys) return <SystemPage key={sys.id} id={sys.id as SystemId} />;
  if (matchPath('/exam/practice', path)) return <PracticePage />;
  if (matchPath('/exam/anatomy/locate', path)) return <LocatePage />;
  if (matchPath('/exam/anatomy', path)) return <AnatomyPage />;
  if (matchPath('/exam/academy/pe7', path)) return <Pe7Page />;
  const t = matchPath('/exam/academy/:id', path);
  if (t) return <TechniquePage key={t.id} id={t.id} />;
  if (matchPath('/exam/academy', path)) return <AcademyPage />;
  if (matchPath('/exam/signs', path)) return <PlanPage id="signs" />;
  if (matchPath('/exam/vsp', path)) return <PlanPage id="vsp" />;
  if (matchPath('/exam/challenge', path)) return <PlanPage id="challenge" />;
  return <HubPage />;
}
