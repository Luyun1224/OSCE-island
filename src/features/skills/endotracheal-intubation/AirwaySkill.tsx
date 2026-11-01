import { useCallback, useState } from 'react';
import { navigate } from '../../../router';
import { FeedbackReportView } from '../../training/components/FeedbackReportView';
import { TrainingModeSelector } from '../../training/components/TrainingModeSelector';
import { getTrainingModes } from '../../training/modes';
import { loadAttempts } from '../../training/storage';
import type { FeedbackReport, TrainingModeId } from '../../training/types';
import { AirwaySession } from './AirwaySession';
import { AIRWAY_CASE, type StepId } from './caseData';
import { AirwayDemo } from './demo/AirwayDemo';
import { CHAPTER_OF } from './demo/timeline';
import { ScenarioIntro } from './ui/Intro';

type Screen =
  | { name: 'intro' }
  | { name: 'mode' }
  | { name: 'demo'; chapter?: number; back: 'mode' | 'report' }
  | { name: 'training'; mode: TrainingModeId; focus: StepId | null; key: number }
  | { name: 'report'; report: FeedbackReport };

const MODES = getTrainingModes(AIRWAY_CASE.scenario.stationMinutes);

/** AIRWAY QUEST｜氣管內管插管：情境 → 四種模式 → 模擬室 → 回饋（可連回示範章節或重練） */
export default function AirwaySkill() {
  const [screen, setScreen] = useState<Screen>({ name: 'intro' });
  const [lastReport, setLastReport] = useState<FeedbackReport | null>(null);
  const exit = useCallback(() => navigate('/island/procedural-skills'), []);
  const start = (mode: TrainingModeId, focus: StepId | null = null) => setScreen({ name: 'training', mode, focus, key: Date.now() });
  const onFinish = useCallback((report: FeedbackReport) => {
    setLastReport(report);
    setScreen({ name: 'report', report });
  }, []);

  switch (screen.name) {
    case 'intro':
      return <ScenarioIntro onContinue={() => setScreen({ name: 'mode' })} onBack={exit} />;
    case 'mode':
      return (
        <TrainingModeSelector
          stationMinutes={AIRWAY_CASE.scenario.stationMinutes}
          demoDescription="六個章節完整示範：器材準備與檢查、插管前通氣、頭部擺位與喉頭鏡、氣管內管置入、插管後確認（含現行臨床安全補充：波形 ETCO₂）、固定與結束。旁白與字幕依動畫同步。"
          descriptions={{
            guided: '親自操作，每階段有任務、目標、漸進式提示、可點擊的器材說明與即時回饋；可隨時觀看對應的示範片段。不限時。',
            independent: '自行決定操作順序，不主動提供答案；記錄器材選擇、順序、模擬狀態、安全事件、遺漏與補救，結束後完整回饋。',
            challenge: '8 分鐘倒數，不提供即時答案與步驟提示，完整保留操作歷程；結束後依教案規準產生形成性回饋（非正式 OSCE 成績）。',
          }}
          onDemo={() => setScreen({ name: 'demo', back: 'mode' })}
          onSelect={(m) => start(m)}
          onBack={() => setScreen({ name: 'intro' })}
        />
      );
    case 'demo':
      return (
        <AirwayDemo
          startChapter={screen.chapter}
          exitLabel={screen.back === 'report' ? '← 回到回饋報告' : '← 選擇模式'}
          onExit={() => (screen.back === 'report' && lastReport ? setScreen({ name: 'report', report: lastReport }) : setScreen({ name: 'mode' }))}
          onPractice={(m) => start(m)}
        />
      );
    case 'training':
      return <AirwaySession key={screen.key} mode={MODES[screen.mode]} focusStep={screen.focus} onFinish={onFinish} onExit={exit} />;
    case 'report':
      return (
        <FeedbackReportView
          report={screen.report}
          history={loadAttempts('endotracheal-intubation')}
          onRetryStep={(id) => start('guided', id as StepId)}
          onWatchDemo={(id) => setScreen({ name: 'demo', chapter: CHAPTER_OF[id as StepId] ?? 0, back: 'report' })}
          onRestart={() => setScreen({ name: 'mode' })}
          onExit={exit}
        />
      );
  }
}
