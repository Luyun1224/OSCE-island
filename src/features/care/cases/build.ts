import type { Care6Stage, DialogueNode, EmotionCue, Evidence, Mood, ResponseOption } from '../types';

/** 撰寫案例資料用的小工具（只填預設值，不含任何邏輯） */
export const cue = (type: EmotionCue['type'], text: string): EmotionCue => ({ type, text });
export const ev = (dim: Evidence['dim'], effect: Evidence['effect'], note: string): Evidence => ({ dim, effect, note });

export function opt(o: Omit<ResponseOption, 'skills' | 'evidence'> & Partial<Pick<ResponseOption, 'skills' | 'evidence'>>): ResponseOption {
  return { skills: [], evidence: [], ...o };
}

export function node(
  n: Omit<DialogueNode, 'speaker' | 'communicationSkills' | 'safetyFlags' | 'emotionCues' | 'nextNodeConditions' | 'feedbackRules'> &
    Partial<Pick<DialogueNode, 'speaker' | 'communicationSkills' | 'safetyFlags' | 'emotionCues' | 'nextNodeConditions' | 'feedbackRules'>>,
): DialogueNode {
  return {
    speaker: 'patient',
    communicationSkills: [],
    safetyFlags: [],
    emotionCues: [],
    nextNodeConditions: [],
    feedbackRules: { guidedHint: [], why: '' },
    ...n,
  };
}

export function endNode(id: string, stage: Care6Stage, message: string, mood: Mood): DialogueNode {
  return node({ dialogueId: id, stage, message, mood, task: '', responseOptions: [], end: true });
}
