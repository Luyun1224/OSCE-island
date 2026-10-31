import type { Activity, ActivityResult } from '../types';
import { ChoiceActivityView } from './ChoiceActivityView';
import { ClueActivityView } from './ClueActivityView';
import { MultiPickActivityView } from './MultiPickActivityView';
import { SequenceActivityView } from './SequenceActivityView';
import { SortActivityView } from './SortActivityView';
import { SummaryActivityView } from './SummaryActivityView';

/** 依互動類型選擇對應元件；新的互動形式只需在此註冊 */
export function ActivityView({ activity, onDone }: { activity: Activity; onDone: (r: ActivityResult) => void }) {
  switch (activity.kind) {
    case 'choice':
      return <ChoiceActivityView activity={activity} onDone={onDone} />;
    case 'sort':
      return <SortActivityView activity={activity} onDone={onDone} />;
    case 'multipick':
      return <MultiPickActivityView activity={activity} onDone={onDone} />;
    case 'sequence':
      return <SequenceActivityView activity={activity} onDone={onDone} />;
    case 'clue':
      return <ClueActivityView activity={activity} onDone={onDone} />;
    case 'summary':
      return <SummaryActivityView activity={activity} onDone={onDone} />;
  }
}

export const ACTIVITY_KIND_LABEL: Record<Activity['kind'], string> = {
  choice: '情境對話',
  sort: '拖曳分類',
  multipick: '優先順序',
  sequence: '流程排序',
  clue: '線索收集',
  summary: '摘要組合',
};
