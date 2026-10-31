/**
 * HISTORY QUEST 型別
 * 教材（SOP 單元）、互動練習（activities）與 Phase 4 起的案例包共用。
 */

/* ------------------------------------------------------------------ */
/* 審核                                                                  */
/* ------------------------------------------------------------------ */

export type ReviewStatus = 'draft' | 'reviewed';

export interface ReviewMeta {
  status: ReviewStatus;
  reviewer?: string;
  reviewedAt?: string;
  note?: string;
}

/* ------------------------------------------------------------------ */
/* 虛擬病人外觀                                                           */
/* ------------------------------------------------------------------ */

export type Mood = 'neutral' | 'calm' | 'anxious' | 'worried' | 'confused' | 'upset' | 'relieved' | 'pained' | 'dizzy';

export interface PatientLook {
  name: string;
  age: number;
  sex: 'F' | 'M';
  hair: 'short' | 'long' | 'bun' | 'bald';
  hairColor: string;
  shirt: string;
  glasses?: boolean;
}

/* ------------------------------------------------------------------ */
/* 互動練習                                                               */
/* ------------------------------------------------------------------ */

/** best：適當；ok：可行但可再加強；poor：不適當 */
export type OptionQuality = 'best' | 'ok' | 'poor';

export interface ChoiceOption {
  id: string;
  text: string;
  quality: OptionQuality;
  feedback: string;
  /** 病人（SP）對此說法的回應 */
  reply?: string;
  replyMood?: Mood;
}

export interface ChoiceStep {
  id: string;
  /** 情境或任務說明 */
  prompt: string;
  /** 病人此刻說的話（可省略） */
  patientLine?: string;
  mood?: Mood;
  options: ChoiceOption[];
  /** 完成此步驟後顯示的觀念重點 */
  takeaway?: string;
}

export interface ChoiceActivity {
  kind: 'choice';
  id: string;
  title: string;
  intro: string;
  patient?: PatientLook;
  steps: ChoiceStep[];
}

export interface SortBin {
  id: string;
  label: string;
  hint?: string;
  color: string;
}

export interface SortCard {
  id: string;
  text: string;
  bin: string;
  explain: string;
}

export interface SortActivity {
  kind: 'sort';
  id: string;
  title: string;
  intro: string;
  bins: SortBin[];
  cards: SortCard[];
  /** 每回合抽題數（未設定則全部） */
  drawCount?: number;
}

export interface MultiPickOption {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  explain: string;
}

export interface MultiPickActivity {
  kind: 'multipick';
  id: string;
  title: string;
  intro: string;
  scenario: string;
  pick: number;
  options: MultiPickOption[];
  takeaway: string;
}

/** 彈性排序：rank 為可接受的階段範圍，A 排在 B 前面且 A.min > B.max 才算順序問題 */
export interface SequenceCard {
  id: string;
  text: string;
  rank: [number, number];
  note: string;
}

export interface SequenceActivity {
  kind: 'sequence';
  id: string;
  title: string;
  intro: string;
  cards: SequenceCard[];
  phases: string[];
  takeaway: string;
}

export interface ClueQuestion {
  id: string;
  text: string;
  answer: string;
  /** 取得的線索面向；leading / stacked / low-yield 不產生線索 */
  dimension?: string;
  clue?: string;
  flag?: 'leading' | 'stacked' | 'low-yield';
  explain: string;
}

export interface ClueActivity {
  kind: 'clue';
  id: string;
  title: string;
  intro: string;
  patient: PatientLook;
  complaint: string;
  budget: number;
  dimensions: { id: string; label: string; short: string }[];
  questions: ClueQuestion[];
  synthesis: string;
}

export interface SummaryFact {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'concern' | 'irrelevant' | 'incorrect';
  key: boolean;
  explain: string;
}

export interface SummaryActivity {
  kind: 'summary';
  id: string;
  title: string;
  intro: string;
  context: string;
  facts: SummaryFact[];
  closing: ChoiceStep;
}

export type Activity = ChoiceActivity | SortActivity | MultiPickActivity | SequenceActivity | ClueActivity | SummaryActivity;

export interface ActivityResult {
  activityId: string;
  score: number;
  max: number;
  /** 回饋重點（供報告與分析中心使用） */
  notes: string[];
}

/* ------------------------------------------------------------------ */
/* SOP 單元與遊戲                                                        */
/* ------------------------------------------------------------------ */

export interface Lesson {
  title: string;
  body: string;
  bullets?: string[];
  good?: string;
  bad?: string;
}

export interface SopUnit {
  id: string;
  order: number;
  title: string;
  englishTitle: string;
  icon: string;
  frameworks: string[];
  summary: string;
  lessons: Lesson[];
  takeaways: string[];
  activities: Activity[];
  review: ReviewMeta;
}

export interface LabGame {
  id: string;
  letter: string;
  title: string;
  englishTitle: string;
  icon: string;
  summary: string;
  /** 對應的 SOP 單元（建議重練） */
  relatedUnits: string[];
  activity: Activity;
  review: ReviewMeta;
}

/* ------------------------------------------------------------------ */
/* 案例包（Phase 4 起使用；正式教案為受限資料，不進公開 repo）            */
/* ------------------------------------------------------------------ */

export type QuestionTopic =
  | 'opening'
  | 'chief-complaint'
  | 'hpi'
  | 'ob-gyn'
  | 'bleeding'
  | 'past-history'
  | 'surgery'
  | 'medication'
  | 'family'
  | 'social'
  | 'explanation';

export interface QuestionNode {
  id: string;
  topic: QuestionTopic;
  /** 學生可選擇的問句（同義變體） */
  variants: string[];
  /** SP 回答；null 表示教案未提供明確答案（待教案作者補充） */
  answer: string | null;
  mood?: Mood;
  /** 條件式追問：需先問過這些節點才會出現 */
  unlockAfter?: string[];
  /** 對應評分要項（例如 'R5.cycle'） */
  rubricLinks?: string[];
  /** 問了之後病歷資料板記錄的線索 */
  record?: string;
}

/** SP 主動提問：滿足條件時觸發 */
export interface SpPrompt {
  id: string;
  text: string;
  trigger: { afterAny?: string[]; afterAll?: string[]; afterExplanation?: string[] };
}

export interface LabItem {
  id: string;
  name: string;
  value: string;
  unit: string;
  reference: string;
  /** 項目基本意義（不含本案診斷結論） */
  meaning: string;
}

export interface RubricLevel {
  score: 0 | 1 | 2;
  text: string;
}

export interface CaseRubricItem {
  id: string;
  title: string;
  levels: RubricLevel[];
  /** 子要項：例如月經史的週期／天數／棉墊量 */
  subItems?: { id: string; label: string }[];
  review: ReviewMeta;
}

export interface CasePackage {
  id: string;
  title: string;
  version: string;
  license: { publicApproved: boolean; approvedBy?: string; note?: string };
  patient: PatientLook & { setting: string; posture: string; baselineMood: Mood; emotionIntensity: number };
  station: { minutes: number; tasks: string[]; notes: string[] };
  questions: QuestionNode[];
  spPrompts: SpPrompt[];
  labs: LabItem[];
  rubric: CaseRubricItem[];
  globalRating: { min: 1; max: 5; separateFromTotal: true };
  review: ReviewMeta;
}
