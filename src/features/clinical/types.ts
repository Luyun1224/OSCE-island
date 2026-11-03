/**
 * CLINICAL DECISION ISLAND（病情解釋與臨床處置島）資料架構
 * 畫面元件只讀取這些資料；判分與模擬後果在 engine/，病例在 cases/。
 * 新增病例：新增一個 ClinicalCase 檔案即可，四個遊戲會自動使用。
 */
import type { Activity, Lesson, Mood, PatientLook, ReviewMeta } from '../history/types';

export type { Activity, Lesson, Mood, PatientLook, ReviewMeta };

/** CLINICAL-6：本平台整理的教學架構（非國考官方 SOP） */
export type Clinical6Stage = 'assess' | 'summarize' | 'differentiate' | 'investigate' | 'manage' | 'explain';

/** 圖像化學習卡 */
export interface VisualCard {
  title: string;
  layout: 'steps' | 'grid' | 'ladder';
  items: { label: string; desc: string; color: string; icon?: string }[];
  footnote?: string;
}

export interface ClinicalLesson {
  id: Clinical6Stage;
  order: number;
  letter: string;
  title: string;
  englishTitle: string;
  icon: string;
  color: string;
  goal: string;
  lessons: Lesson[];
  visual: VisualCard;
  scenario: { title: string; text: string };
  activities: Activity[];
  safety: string[];
  takeaways: string[];
  review: ReviewMeta;
}

/* ------------------------------------------------------------------ */
/* 病例                                                                  */
/* ------------------------------------------------------------------ */

export type EvidenceCategory = 'history' | 'vitals' | 'exam' | 'lab';

/**
 * 臨床證據卡
 * role：key-positive 關鍵陽性；key-negative 關鍵陰性；severity 嚴重度指標；context 背景；minor 次要；irrelevant 無關
 */
export interface ClinicalEvidence {
  id: string;
  category: EvidenceCategory;
  text: string;
  role: 'key-positive' | 'key-negative' | 'severity' | 'context' | 'timeline' | 'minor' | 'irrelevant';
  explain: string;
}

export interface VitalSigns {
  temp: number;
  hr: number;
  sbp: number;
  dbp: number;
  rr: number;
  spo2: number;
  gcs: number;
}

/** 模擬中的病人狀態（依決策事件與後果規則演變） */
export interface PatientState {
  vitals: VitalSigns;
  /** 臨床描述（例如：意識較清楚、尿量增加） */
  status: string;
  lactate?: number;
  urineMlPerHr?: number;
  trend: 'better' | 'same' | 'worse';
}

export interface ProblemRepresentation {
  id: string;
  text: string;
  quality: 'best' | 'ok' | 'poor';
  feedback: string;
}

export interface DifferentialDiagnosis {
  id: string;
  name: string;
  /** 本病例中的可能性 */
  likelihood: 'leading' | 'possible' | 'unlikely';
  /** 可接受的優先順序範圍（1 = 最優先） */
  rank?: [number, number];
  mustNotMiss: boolean;
  support: string[];
  against: string[];
  reasoning: string;
  /** 下一步如何確認或排除 */
  nextStep: string;
}

export type Necessity = 'essential' | 'reasonable' | 'unnecessary' | 'harmful';

export interface InvestigationOption {
  id: string;
  name: string;
  necessity: Necessity;
  /** 是否應在開始抗生素等治療之前完成（例如血液培養） */
  beforeTreatment?: boolean;
  /** 不應因等待此檢查而延誤治療 */
  mustNotDelay?: boolean;
  result?: string;
  rationale: string;
}

export interface ManagementOption {
  id: string;
  name: string;
  phase: 'immediate' | 'initial' | 'treatment' | 'monitor';
  necessity: Necessity;
  /** 理想的優先順序（數字越小越早；同數字代表可同步進行） */
  priority?: number;
  rationale: string;
  /** 安全事件：選了 harmful 選項或缺少 essential 選項時的說明 */
  safetyIfChosen?: string;
  safetyIfMissed?: string;
}

/** 學生的每一個決策（所有回饋都對應到這些事件） */
export interface DecisionEvent {
  game: 'clues' | 'ddx' | 'manage' | 'explain';
  kind: string;
  ref: string;
  label: string;
  quality: 'good' | 'acceptable' | 'poor' | 'unsafe';
  dims: DimensionId[];
  note: string;
  /** 重大病人安全事件（另行呈現） */
  safety?: string;
}

/** 經審核的模擬後果規則：條件成立時改變病人狀態 */
export interface SimulationOutcome {
  id: string;
  when: { chosen?: string[]; notChosen?: string[] };
  effect: Partial<Omit<PatientState, 'vitals'>> & { vitals?: Partial<VitalSigns> };
  narrative: string;
  safety?: string;
  source: string;
}

export interface ExplainStatement {
  id: string;
  text: string;
  verdict: 'accurate' | 'overconfident' | 'inaccurate' | 'incomplete';
  feedback: string;
}

export interface PatientConcern {
  id: string;
  patientLine: string;
  /** 病人不理解或不願配合的真正原因（選項） */
  reasons: { id: string; text: string; correct: boolean; feedback: string }[];
  responses: { id: string; text: string; verdict: 'accurate' | 'inaccurate' | 'ignores-reason'; feedback: string; reply: string; replyMood: Mood }[];
}

/** 病情解釋：六個必要元素＋病人的疑問 */
export interface PatientExplanation {
  elements: { id: string; title: string; prompt: string; statements: ExplainStatement[] }[];
  concerns: PatientConcern[];
}

export interface ClinicalCase {
  id: string;
  code: string;
  title: string;
  tag: 'DEMO';
  setting: string;
  patient: PatientLook & { fullName: string };
  chiefComplaint: string;
  candidateBrief: string[];
  initialState: PatientState;
  evidence: ClinicalEvidence[];
  summaryMaxCards: number;
  problemRepresentations: ProblemRepresentation[];
  differentials: DifferentialDiagnosis[];
  investigations: InvestigationOption[];
  management: ManagementOption[];
  outcomes: SimulationOutcome[];
  explanation: PatientExplanation;
  /** 依案例設定的挑戰時間（秒） */
  timeLimitSec: number;
  safetyPoints: string[];
  references: string[];
  license: { publicApproved: boolean; note: string };
  review: ReviewMeta;
}

/* ------------------------------------------------------------------ */
/* 回饋                                                                  */
/* ------------------------------------------------------------------ */

export type DimensionId = 'recognition' | 'integration' | 'summary' | 'ddx' | 'evidence' | 'investigation' | 'priority' | 'treatment' | 'explanation' | 'followup';

export interface ClinicalRubric {
  id: string;
  dimensions: { id: DimensionId; label: string; description: string; lesson: Clinical6Stage }[];
  limitations: string[];
}

export type Level = 'shown' | 'partial' | 'needs' | 'unobserved';

export interface FeedbackReport {
  caseId: string;
  dimensions: { id: DimensionId; label: string; level: Level; good: DecisionEvent[]; weak: DecisionEvent[]; lesson: Clinical6Stage }[];
  safety: DecisionEvent[];
  suggestedLessons: Clinical6Stage[];
  limitations: string[];
}

/** 遊戲完成時回傳 */
export interface GameResult {
  game: DecisionEvent['game'];
  events: DecisionEvent[];
  durationSec: number;
}

/** 示範時間軸（Phase 6 正確示範模式使用，沿用技能站共用的 DemonstrationPlayer） */
export type { DemoChapterDef as DemonstrationChapter } from '../training/components/DemonstrationPlayer';
