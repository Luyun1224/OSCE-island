import { useCallback, useState } from 'react';
import { navigate } from '../../../router';
import { FeedbackReportView } from '../../training/components/FeedbackReportView';
import { getTrainingModes } from '../../training/modes';
import { loadAttempts } from '../../training/storage';
import type { FeedbackReport, TrainingModeId } from '../../training/types';
import { WOUND_SUTURING_CASE, type StepId } from './caseData';
import { TrainingSession } from './TrainingSession';
import { ModeSelect, ScenarioIntro } from './ui/Intro';

type Screen = { name: 'intro' } | { name: 'mode' } | { name: 'training'; mode: TrainingModeId; focus: StepId | null; key: number } | { name: 'report'; report: FeedbackReport; mode: TrainingModeId };

const MODES = getTrainingModes(WOUND_SUTURING_CASE.scenario.stationMinutes);

/** 傷口縫合關卡：情境介紹 → 模式選擇 → 模擬診間 → 回饋報告 */
export default function WoundSuturingSkill() {
  const [screen, setScreen] = useState<Screen>({ name: 'intro' });
  const exit = useCallback(() => navigate('/island/procedural-skills'), []);
  const start = (mode: TrainingModeId, focus: StepId | null = null) => setScreen({ name: 'training', mode, focus, key: Date.now() });
  const onFinish = useCallback((report: FeedbackReport) => setScreen({ name: 'report', report, mode: report.mode }), []);

  switch (screen.name) {
    case 'intro':
      return <ScenarioIntro onContinue={() => setScreen({ name: 'mode' })} onBack={exit} />;
    case 'mode':
      return <ModeSelect onSelect={(m) => start(m)} onBack={() => setScreen({ name: 'intro' })} />;
    case 'training':
      return <TrainingSession key={screen.key} mode={MODES[screen.mode]} focusStep={screen.focus} onFinish={onFinish} onExit={exit} />;
    case 'report':
      return (
        <FeedbackReportView
          report={screen.report}
          history={loadAttempts('wound-suturing')}
          onRetryStep={(stepId) => start('guided', stepId as StepId)}
          onRestart={() => setScreen({ name: 'mode' })}
          onExit={exit}
        />
      );
  }
}
