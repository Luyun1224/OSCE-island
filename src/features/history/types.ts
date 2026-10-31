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
/* 案例包（虛擬病人診間）                                                  */
/* ------------------------------------------------------------------ */

export interface CaseTopic {
  id: string;
  label: string;
  icon: string;
  /** 引導模式顯示的問診提示 */
  hint: string;
  /** 是否為病情說明（說明句，而非問句） */
  explanation?: boolean;
}

/** 問題節點：學生的一個問句與 SP 的回答 */
export interface QuestionNode {
  id: string;
  topic: string;
  text: string;
  /** SP 回答；null 表示教案未提供明確答案（待教案作者補充） */
  answer: string | null;
  mood?: Mood;
  /** 條件式追問：需先問過其中任一節點才會出現 */
  unlockAfter?: string[];
  /** 涵蓋的評分子要項 */
  covers?: string[];
  /** 病歷資料板記錄 */
  record?: string;
  /** 引導模式的觀念說明 */
  note?: string;
}

/** 病情說明節點：學生要對病人說的話 */
export interface StatementNode {
  id: string;
  topic: string;
  group: string;
  text: string;
  covers?: string[];
  /** 不正確或不適當的說法 */
  incorrect?: boolean;
  feedback: string;
  mood?: Mood;
  /** 屬於原教案評分要求，或一般臨床衛教（需教師確認） */
  source: 'case' | 'clinical';
}

/** SP 主動提問 */
export interface SpPrompt {
  id: string;
  text: string;
  /** 觸發：說過任一說明句，或已詢問的問題數達到門檻 */
  afterStatements?: string[];
  afterQuestionCount?: number;
  /** 視為已回應：之後說過任一句 */
  answeredBy: string[];
}

export interface LabItem {
  id: string;
  name: string;
  value: string;
  unit: string;
  reference: string;
  low: number;
  high: number;
  numeric: number;
  /** 項目基本意義（不含本案診斷結論） */
  meaning: string;
}

export interface RubricLevel {
  score: 0 | 1 | 2;
  text: string;
}

/** 評分子要項：例如月經史的週期／天數／棉墊量 */
export interface SubItem {
  id: string;
  label: string;
}

/**
 * 宣告式評分規則
 * count：涵蓋子要項數 ≥ full 得 2 分、≥ partial 得 1 分
 * tiers：涵蓋 full 中任一項得 2 分；否則涵蓋 partial 中任一項得 1 分
 */
export type RubricRule = { type: 'count'; subs: string[]; full: number; partial?: number } | { type: 'tiers'; full: string[]; partial?: string[] };

export interface CaseRubricItem {
  id: string;
  no: number;
  title: string;
  levels: RubricLevel[];
  rule: RubricRule;
  /** 建議重練的 SOP 單元 */
  units: string[];
  /** 對應規則的補充說明（待審核之處） */
  mappingNote?: string;
  review: ReviewMeta;
}

export interface CasePackage {
  id: string;
  code: string;
  title: string;
  version: string;
  license: { publicApproved: boolean; approvedBy?: string; note?: string };
  patient: PatientLook & { fullName: string; birthday: string; occupation: string; setting: string; posture: string; baselineMood: Mood; emotionIntensity: number; behavior: string[] };
  candidate: { background: string; tasks: string[]; minutes: number; notes: string[] };
  openingLine: string;
  topics: CaseTopic[];
  questions: QuestionNode[];
  statements: StatementNode[];
  spPrompts: SpPrompt[];
  labs: { title: string; note: string; items: LabItem[] };
  subItems: SubItem[];
  rubric: CaseRubricItem[];
  globalRating: { labels: string[]; separateFromTotal: true };
  teachingReference: { title: string; items: string[] }[];
  pending: string[];
  review: ReviewMeta;
}
