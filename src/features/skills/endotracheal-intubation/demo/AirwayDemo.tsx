import { useCallback } from 'react';
import { logPractice } from '../../../../lib/practiceLog';
import { DemonstrationPlayer } from '../../../training/components/DemonstrationPlayer';
import { DragDropProvider } from '../../../training/components/DragDrop';
import { getTrainingModes } from '../../../training/modes';
import type { TrainingModeId } from '../../../training/types';
import { useIsMobile } from '../../../training/useIsMobile';
import { AIRWAY_CASE, type StepId } from '../caseData';
import { airwayReducer, createInitialState, type AWAction, type AWState } from '../engine';
import { AIRWAY_CONFIG as CFG } from '../rubricConfig';
import { StageView } from '../stages';
import { AirwayCameraController } from '../ui/CameraController';
import { DEMO_SUMMARY, DEMO_TIMELINE } from './timeline';

const GUIDED = getTrainingModes(AIRWAY_CASE.scenario.stationMinutes).guided;
const apply = (s: AWState, a: AWAction) => airwayReducer(s, a).state;

/** AIRWAY QUEST 正確示範（使用共用 DemonstrationPlayer） */
export function AirwayDemo({ onExit, onPractice, startChapter, exitLabel }: { onExit: () => void; onPractice?: (m: TrainingModeId) => void; startChapter?: number; exitLabel?: string }) {
  const isMobile = useIsMobile();
  const watched = useCallback(() => logPractice({ island: 'procedural-skills', module: 'demo', itemId: 'endotracheal-intubation-demo', itemTitle: '氣管內管插管｜正確示範（看完）', result: 'watched' }), []);
  return (
    <DragDropProvider>
      <DemonstrationPlayer<AWState, AWAction, (typeof DEMO_TIMELINE)[number]['steps'][number]['cameraPreset']>
        title="AIRWAY QUEST 氣管內管插管"
        chapters={DEMO_TIMELINE}
        initialState={createInitialState}
        apply={apply}
        start={startChapter !== undefined ? { chapter: startChapter } : undefined}
        exitLabel={exitLabel}
        onExit={onExit}
        onPractice={onPractice}
        onWatched={watched}
        summary={DEMO_SUMMARY}
        reviewBanner={<p className="mb-2 rounded-xl bg-violet-50 px-3 py-1.5 text-[11px] font-bold text-violet-800 ring-1 ring-violet-200">🩺 示範狀態：動畫原型・待臨床教師審核（未核准）。{CFG.review.demonstration.note}</p>}
        renderView={({ state, step, highlighted }) => (
          <div className="space-y-3">
            <AirwayCameraController state={state} preset={step.cameraPreset} highlight={highlighted} revealTube />
            <StageView stepId={step.practiceStepId as StepId} props={{ state, dispatch: () => undefined, mode: GUIDED, isMobile, demo: true, demoHighlight: highlighted.filter((h) => h.startsWith('#')).map((h) => h.slice(1)) }} />
          </div>
        )}
      />
    </DragDropProvider>
  );
}
