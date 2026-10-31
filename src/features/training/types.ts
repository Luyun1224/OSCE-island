/**
 * 技能訓練框架的共用型別（與特定技能無關）
 * SkillCase → SkillStep → TrainingEvent → AssessmentRubric → FeedbackReport
 */

export type TrainingModeId = 'guided' | 'independent' | 'challenge';

export interface TrainingModeConfig {
  id: TrainingModeId;
  title: string;
  englishTitle: string;
  description: string;
  /** 是否顯示逐層提示與「為什麼？」 */
  showHints: boolean;
  /** 錯誤時是否即時回饋原因與修正選項 */
  immediateFeedback: boolean;
  /** 倒數時間（秒），null 代表不限時 */
  timeLimitSec: number | null;
  /** 是否可顯示量尺等輔助工具 */
  measuringAids: boolean;
}

/** 逐層提示：1 方向 → 2 具體做法 → 3 原因 */
export interface HintLayer {
  label: string;
  text: string;
}

/** SkillStep：一個操作階段（可自由切換，不強制順序） */
export interface SkillStep {
  id: string;
  order: number;
  title: string;
  englishTitle: string;
  /** 學習目標（引導模式顯示） */
  goal: string;
  hints: HintLayer[];
  /** 「為什麼？」重要觀念 */
  why: { title: string; text: string }[];
  /** 對應評分項目編號 */
  rubricItems: number[];
}

export interface ScenarioInfo {
  stationTitle: string;
  setting: string;
  stationMinutes: number;
  patient: string;
  background: string;
  tasks: string[];
  /** 教案來源與限制說明 */
  sourceNote: string;
}

/** SkillCase：一個技能的教學案例 */
export interface SkillCase {
  skillId: string;
  title: string;
  englishTitle: string;
  scenario: ScenarioInfo;
  steps: SkillStep[];
  /** 數位模擬的限制說明 */
  limitations: string[];
}

export type EventKind =
  | 'action' // 一般操作
  | 'error' // 操作錯誤
  | 'contamination' // 無菌破壞
  | 'remediation' // 察覺並補救
  | 'order' // 順序問題
  | 'narration' // 口述
  | 'hint' // 使用提示
  | 'system';

export interface TrainingEvent {
  id: number;
  /** 發生時間（模擬經過秒數） */
  t: number;
  stepId: string;
  kind: EventKind;
  code: string;
  message: string;
  /** 教學說明：引導模式即時顯示，其他模式只在報告中呈現 */
  why?: string;
}

export type NewEvent = Omit<TrainingEvent, 'id' | 't'>;

export type RubricScore = 0 | 1 | 2;

/**
 * digital：網頁互動可直接觀察
 * proxy：只能以代理指標觀察，需實體操作評核確認
 */
export type Observability = 'digital' | 'proxy';

/** 逐字保留教案的評分說明；教案只有 0 / 2 的項目不提供 1 分 */
export type RubricCriteria = Partial<Record<RubricScore, string>>;

export interface RubricItemDef<C> {
  id: number;
  title: string;
  criteria: RubricCriteria;
  /** 教案允許的分數（預設 0 / 1 / 2） */
  allowedScores?: RubricScore[];
  observability: Observability;
  physicalNote?: string;
  stepIds: string[];
  evaluate: (ctx: C) => { score: RubricScore; evidence: string[]; missing: string[] };
}

export interface RubricItemResult {
  id: number;
  title: string;
  criteria: RubricCriteria;
  allowedScores: RubricScore[];
  score: RubricScore;
  evidence: string[];
  missing: string[];
  observability: Observability;
  physicalNote?: string;
  stepIds: string[];
}

export interface AssessmentResult {
  items: RubricItemResult[];
  total: number;
  max: number;
  /** 整體表現 1–5 分：由教師評估，程式不自動產生 */
  globalRating: null;
}

export type StepStatus = 'complete' | 'partial' | 'not-started';

export interface StepReview {
  stepId: string;
  title: string;
  status: StepStatus;
  issues: number;
}

export interface FeedbackSuggestion {
  stepId: string;
  message: string;
  tone: 'strength' | 'improve';
}

export interface FeedbackMetric {
  label: string;
  value: string;
  tone?: 'good' | 'warn' | 'neutral';
}

/** FeedbackReport：個別化回饋 */
export interface FeedbackReport {
  skillId: string;
  mode: TrainingModeId;
  endReason: 'finished' | 'timeout';
  focusStepId: string | null;
  durationSec: number;
  metrics: FeedbackMetric[];
  assessment: AssessmentResult;
  stepReview: StepReview[];
  suggestions: FeedbackSuggestion[];
  physicalChecks: string[];
  events: TrainingEvent[];
  /** 以下為選填，未提供時沿用傷口縫合的呈現 */
  skillTitle?: string;
  sourceNote?: string;
  /** 練習紀錄比較表的欄位（對應 AttemptRecord.highlights） */
  historyColumns?: { key: string; label: string }[];
  /** 技能專屬的狀態摘要卡 */
  statusCards?: { title: string; rows: { label: string; value: string; tone?: 'good' | 'warn' | 'neutral' }[] }[];
  /** 實際操作先後順序（依各階段第一次操作時間） */
  sequence?: { stepId: string; title: string; t: number }[];
  /** 各階段標題（回放時標示事件所屬階段） */
  stepTitles?: Record<string, string>;
}

/** 本機練習紀錄（不含個資） */
export interface AttemptRecord {
  id: string;
  skillId: string;
  mode: TrainingModeId;
  focusStepId: string | null;
  finishedAt: string;
  durationSec: number;
  total: number;
  max: number;
  itemScores: number[];
  highlights: Record<string, number>;
}
