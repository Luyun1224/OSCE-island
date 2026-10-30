import { useCallback, useState } from 'react';
import type { NewEvent, SkillStep } from './types';

/**
 * HintSystem：逐層提示
 * 每個階段的提示依序解鎖（方向 → 具體做法 → 原因），不一次公布所有答案。
 * 每次解鎖都記錄為 hint 事件，回饋報告會呈現提示使用次數。
 */
export function useHintSystem(log: (e: NewEvent) => void) {
  const [revealed, setRevealed] = useState<Record<string, number>>({});

  const revealNext = useCallback(
    (step: SkillStep) => {
      setRevealed((r) => {
        const current = r[step.id] ?? 0;
        if (current >= step.hints.length) return r;
        log({ stepId: step.id, kind: 'hint', code: `hint-${current + 1}`, message: `查看提示：${step.hints[current].label}` });
        return { ...r, [step.id]: current + 1 };
      });
    },
    [log],
  );

  const reset = useCallback(() => setRevealed({}), []);

  return { revealed, revealNext, reset };
}
