/**
 * CARE ISLAND（醫病溝通與衛教島）資料架構
 *
 * 引擎（engine/）只依賴這些型別；教案資料（data/、cases/）可獨立新增，
 * 不需修改引擎即可加入新的溝通情境或虛擬標準化病人（VSP）案例。
 */
import type { Activity, Lesson, Mood, PatientLook, ReviewMeta } from '../history/types';

export type { Mood, PatientLook, ReviewMeta, Lesson };

/* ------------------------------------------------------------------ */
/* CARE-6 與溝通工具                                                     */
/* ------------------------------------------------------------------ */

/** CARE-6：本平台自行整理的教學架構（參考 Calgary–Cambridge），非官方國考 SOP */
export type Care6Stage = 'connect' | 'assess' | 'respond' | 'explain' | 'engage' | 'end';

export type ToolId = 'calgary' | 'nurse' | 'spikes' | 'teachback';

/** 一張教學卡（工具中的一個要素，例如 NURSE 的 N = Naming） */
export interface FrameworkCard {
  key: string;
  title: string;
  meaning: string;
  example: string;
  /** 常見誤用 */
  pitfall?: string;
}

/** 溝通工具（Calgary–Cambridge／NURSE／SPIKES／Teach-back） */
export interface CommunicationFramework {
  id: ToolId;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  /** 適用時機：工具不是萬用公式，需依情境選用 */
  whenToUse: string[];
  whenNotEnough: string;
  cards: FrameworkCard[];
  /** 對應的 CARE-6 階段 */
  stages: Care6Stage[];
  source: string;
  miniGame: Activity;
  review: ReviewMeta;
}

/** CARE-6 單元 */
export interface CommunicationLesson {
  id: Care6Stage;
  order: number;
  letter: string;
  title: string;
  englishTitle: string;
  icon: string;
  color: string;
  goal: string;
  /** 同理心在此階段的展現方式（同理心貫穿全程） */
  empathyNote: string;
  lessons: Lesson[];
  /** 好／不佳說法對照，含理由 */
  compare: { context: string; good: string; poor: string; why: string }[];
  /** 短情境互動練習 */
  activities: Activity[];
  takeaways: string[];
  tools: ToolId[];
  review: ReviewMeta;
}

/* ------------------------------------------------------------------ */
/* 對話引擎                                                               */
/* ------------------------------------------------------------------ */

/** 形成性回饋的分析面向（非正式評分項目） */
export type DimensionId = 'opening' | 'exploring' | 'emotionRecognition' | 'empathy' | 'clarity' | 'engagement' | 'teachBack' | 'closing' | 'safety';

/** 情緒線索：語言、非語言、情境 */
export interface EmotionCue {
  type: 'verbal' | 'nonverbal' | 'context';
  text: string;
}

export type OptionQuality = 'best' | 'ok' | 'poor';

/** 學生的一個選項所展現（或缺少）的溝通行為 */
export interface Evidence {
  dim: DimensionId;
  effect: 'shown' | 'missed';
  note: string;
}

export interface ResponseOption {
  id: string;
  text: string;
  quality: OptionQuality;
  /** 對應的溝通技巧標籤（例如 NURSE-N、ICE、Chunking） */
  skills: string[];
  evidence: Evidence[];
  /** 引導模式立即回饋 */
  feedback: string;
  /** 病人（VSP）對此說法的回應 */
  reply: string;
  replyMood: Mood;
  /** 回應後病人可見的新線索 */
  replyCues?: EmotionCue[];
  setFlags?: string[];
  /** 安全旗標：例如錯誤保證、資訊錯誤 */
  safetyFlags?: string[];
  /** 直接指定下一個節點（優先於 nextNodeConditions） */
  next?: string;
}

export interface Condition {
  all?: string[];
  any?: string[];
  none?: string[];
}

export interface NextNodeCondition {
  to: string;
  when?: Condition;
}

export interface FeedbackRule {
  /** 分層提示：第 1 層觀念、第 2 層方向、第 3 層示範句型 */
  guidedHint: string[];
  /** 為什麼這一步重要 */
  why: string;
}

export interface DialogueNode {
  dialogueId: string;
  stage: Care6Stage;
  speaker: 'patient' | 'narrator';
  /** 進入節點時病人說的話（或旁白情境） */
  message: string;
  mood: Mood;
  emotionCues: EmotionCue[];
  /** 學生此刻的任務（引導模式顯示） */
  task: string;
  responseOptions: ResponseOption[];
  nextNodeConditions: NextNodeCondition[];
  communicationSkills: string[];
  feedbackRules: FeedbackRule;
  safetyFlags: string[];
  /** 依旗標改寫病人台詞（第一個符合者生效） */
  variants?: { when: Condition; message: string; mood?: Mood; emotionCues?: EmotionCue[] }[];
  end?: boolean;
}

export interface VirtualPatient extends PatientLook {
  fullName: string;
  background: string;
  /** 病人的想法、擔心、期待（ICE），供教師與報告參考 */
  ice: { ideas: string; concerns: string; expectations: string };
  baselineMood: Mood;
}

export interface DialogueScenario {
  id: string;
  code: string;
  title: string;
  summary: string;
  patient: VirtualPatient;
  /** 給學生的情境說明（不含病人內心資訊） */
  candidateBrief: string[];
  tasks: string[];
  /** 本案例的挑戰模式時間（依案例設定，非預設 8 分鐘） */
  timeLimitSec: number;
  startNode: string;
  nodes: Record<string, DialogueNode>;
  /** 示範模式使用的最佳路徑（節點 → 選項） */
  demoPath: { node: string; option: string; narration: string[] }[];
  /** 情境劇場用：情緒主題 */
  emotion?: 'anxious' | 'angry' | 'afraid' | 'sad';
  license: { publicApproved: boolean; note: string };
  review: ReviewMeta;
}

/** 一次對話的狀態（純資料，可重播） */
export interface DialogueTurn {
  nodeId: string;
  stage: Care6Stage;
  patientLine: string;
  optionId: string;
  text: string;
  quality: OptionQuality;
  skills: string[];
  evidence: Evidence[];
  reply: string;
  replyMood: Mood;
  safetyFlags: string[];
  /** 第幾秒作答（挑戰模式） */
  atSec: number;
  /** 引導模式中重新選擇過 */
  retried?: boolean;
  /** 使用的提示層數 */
  hintsUsed?: number;
}

export interface DialogueState {
  scenarioId: string;
  nodeId: string;
  flags: string[];
  turns: DialogueTurn[];
  ended: boolean;
  endReason?: 'completed' | 'timeout' | 'quit';
}

/* ------------------------------------------------------------------ */
/* 衛教工坊（Teach-back）                                                 */
/* ------------------------------------------------------------------ */

export type ExplainStyle = 'plain' | 'jargon' | 'overload';

export interface TeachBackTask {
  id: string;
  title: string;
  patient: PatientLook & { fullName: string; context: string };
  /** 衛教主題的關鍵訊息（病人必須帶回家的） */
  keyPoints: { id: string; text: string }[];
  /** 可選擇說明的資訊（含次要資訊，用於「避免資訊過量」） */
  infoPool: { id: string; text: string; key: boolean; why: string }[];
  maxPick: number;
  steps: { ask: TBChoice; explain: TBExplain[]; invite: TBChoice; teachBack: TBChoice; close: TBChoice };
  /** 依說明方式產生的病人復述；每段標示是否正確 */
  restatements: Record<ExplainStyle, RestateSegment[]>;
  /** 每個錯誤的正確再說明 */
  reExplain: Record<string, { prompt: string; options: { id: string; text: string; quality: OptionQuality; feedback: string }[] }>;
  finalRestatement: string;
  review: ReviewMeta;
}

export interface TBChoice {
  prompt: string;
  patientLine: string;
  options: { id: string; text: string; quality: OptionQuality; feedback: string; reply: string; replyMood: Mood }[];
}

export interface TBExplain {
  style: ExplainStyle;
  text: string;
  feedback: string;
}

export interface RestateSegment {
  id: string;
  text: string;
  /** null 表示正確；否則為錯誤代碼（對應 reExplain） */
  error: string | null;
  explain: string;
}

/* ------------------------------------------------------------------ */
/* 回饋                                                                   */
/* ------------------------------------------------------------------ */

export interface RubricDimension {
  id: DimensionId;
  label: string;
  description: string;
  /** 建議重練的 CARE-6 單元與工具 */
  lessons: Care6Stage[];
  tools: ToolId[];
}

export interface CommunicationRubric {
  id: string;
  title: string;
  dimensions: RubricDimension[];
  /** 本分析的限制（無法觀察語氣、非語言等） */
  limitations: string[];
}

export type DimensionLevel = 'shown' | 'partial' | 'needs' | 'unobserved';

export interface DimensionResult {
  dim: RubricDimension;
  level: DimensionLevel;
  shown: { utterance: string; note: string }[];
  missed: { utterance: string; note: string; better?: string }[];
}

export interface FeedbackReport {
  scenarioId: string;
  mode: string;
  endReason: DialogueState['endReason'];
  durationSec: number;
  dimensions: DimensionResult[];
  strengths: { utterance: string; note: string; patient: string }[];
  improvements: { utterance: string; note: string; better?: string; patient: string }[];
  safety: { utterance: string; flag: string }[];
  suggestedLessons: Care6Stage[];
  suggestedTools: ToolId[];
  limitations: string[];
}
