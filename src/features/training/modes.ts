import type { TrainingModeConfig, TrainingModeId } from './types';

/** TrainingMode：三種訓練模式的行為設定 */
export function getTrainingModes(stationMinutes: number): Record<TrainingModeId, TrainingModeConfig> {
  return {
    guided: {
      id: 'guided',
      title: '教學引導模式',
      englishTitle: 'Guided Practice',
      description: '第一次接觸技術適用。每個階段顯示學習目標，可逐層查看提示與原因，錯誤操作會即時說明並提供修正選項，不限時。',
      showHints: true,
      immediateFeedback: true,
      timeLimitSec: null,
      measuringAids: true,
    },
    independent: {
      id: 'independent',
      title: '自主練習模式',
      englishTitle: 'Independent Practice',
      description: '已有基本概念適用。不主動提示順序，自由選擇器材與動作；污染、漏步驟與順序問題會記錄下來，結束後提供完整回饋。',
      showHints: false,
      immediateFeedback: false,
      timeLimitSec: null,
      measuringAids: true,
    },
    challenge: {
      id: 'challenge',
      title: 'OSCE 模擬挑戰',
      englishTitle: `${stationMinutes}-min Station Challenge`,
      description: `依教案設定 ${stationMinutes} 分鐘倒數。不提供即時答案與量尺，超時即結束本次模擬，結束後顯示形成性回饋。`,
      showHints: false,
      immediateFeedback: false,
      timeLimitSec: stationMinutes * 60,
      measuringAids: false,
    },
  };
}

export const formatClock = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
