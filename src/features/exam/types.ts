/**
 * PHYSICAL EXAM QUEST（身體檢查島）資料架構
 * 檢查流程、人體定位、聲音素材、案例與評量規準皆與 UI 分離；
 * 新增心臟、肺部、神經、肌肉骨骼檢查時沿用共用引擎，只補充資料與專屬模組。
 */
import type { Activity, Lesson, Mood, PatientLook, ReviewMeta } from '../history/types';

export type { Activity, Lesson, Mood, PatientLook, ReviewMeta };

/* ------------------------------ SOP ------------------------------ */

export type Pe7Stage = 'task' | 'identity' | 'prepare' | 'technique' | 'perform' | 'findings' | 'complete';
export type TechniqueId = 'inspection' | 'palpation' | 'percussion' | 'auscultation';

export interface PhysicalExamSOP {
  id: Pe7Stage;
  order: number;
  title: string;
  icon: string;
  color: string;
  points: string[];
  pitfalls: string[];
  /** 網頁可記錄／需教師觀察 */
  observability: Observability;
}

export interface TechniqueLesson {
  id: TechniqueId;
  title: string;
  english: string;
  icon: string;
  color: string;
  purpose: string;
  situations: string[];
  concepts: string[];
  errors: string[];
  cautions: string[];
  game: Activity;
  review: ReviewMeta;
}

/* ------------------------------ 系統登錄 ------------------------------ */

export type SystemId = 'cardiovascular' | 'respiratory' | 'abdomen' | 'neuro' | 'musculoskeletal' | 'headneck';

export interface PhysicalExamSystem {
  id: SystemId;
  title: string;
  icon: string;
  color: string;
  status: 'available' | 'building' | 'planned';
  summary: string;
  /** 教學順序（由各系統教師審核的 SOP 設定，非全站固定順序） */
  techniqueOrder: TechniqueId[];
  orderNote: string;
  sequenceIds: string[];
  locateTaskIds: string[];
  caseIds: string[];
  review: ReviewMeta;
}

/** PhysicalExamRegistry：系統 → 資料；新系統只需在此註冊 */
export type PhysicalExamRegistry = Record<SystemId, PhysicalExamSystem>;

/* ------------------------------ 流程排序 ------------------------------ */

export interface ExaminationAction {
  id: string;
  text: string;
  technique?: TechniqueId;
  stage: Pe7Stage;
}

export interface ExaminationSequence {
  id: string;
  system: SystemId | 'general';
  title: string;
  scenario: string;
  actions: (ExaminationAction & { rank: [number, number] })[];
  /** 先後規則：違反時顯示理由 */
  rules: { before: string; after: string; why: string }[];
  takeaway: string;
  review: ReviewMeta;
}

/* ------------------------------ 人體模型與體表定位 ------------------------------ */

export type Surface = 'front' | 'back';
export type Side = 'right' | 'left' | 'midline';

/** 體表標記（模型座標：公尺；x<0 為病人右側，y 為高度，面向 +z） */
export interface AnatomicalLandmark {
  id: string;
  name: string;
  surface: Surface;
  x: number;
  y: number;
  /** 判定半徑（公尺） */
  tolerance: number;
  definition: string;
  examAreas: string[];
  reference: string;
  review: ReviewMeta;
}

export interface AnatomicalRegion {
  id: string;
  name: string;
  short?: string;
  surface: Surface;
  scheme: 'quadrant' | 'nine' | 'thorax' | 'back';
  x: [number, number];
  y: [number, number];
  color: string;
  contents: string[];
  examAreas: string[];
}

export interface SurfaceLine {
  id: string;
  name: string;
  surface: Surface;
  points: [number, number][];
  color: string;
}

export interface AnatomyModel {
  id: string;
  label: string;
  heightM: number;
  note: string;
  landmarks: AnatomicalLandmark[];
  regions: AnatomicalRegion[];
  lines: SurfaceLine[];
  review: ReviewMeta;
}

export interface LocateTask {
  id: string;
  system: SystemId;
  prompt: string;
  target: { kind: 'landmark' | 'region'; id: string };
  side: Side;
  view: Surface;
  why: string;
}

export interface BodyHit {
  surface: Surface;
  x: number;
  y: number;
  side: Side;
  part: 'head' | 'neck' | 'torso' | 'arm' | 'leg';
  regions: AnatomicalRegion[];
  nearest?: { landmark: AnatomicalLandmark; distM: number };
}

/* ------------------------------ 器材、聲音、發現、病人回應 ------------------------------ */

export interface ExaminationTool {
  id: string;
  name: string;
  icon: string;
  techniques: TechniqueId[];
}

/** 授權聲音素材（未取得授權前清單為空，不以生成聲音冒充真實病理聲音） */
export interface AuscultationSound {
  id: string;
  label: string;
  file: string;
  license: string;
  source: string;
  review: ReviewMeta;
}

export interface PhysicalFinding {
  id: string;
  technique: TechniqueId;
  location: string;
  text: string;
  kind: 'normal' | 'abnormal' | 'needs-evaluation';
  key?: 'positive' | 'negative';
  soundId?: string;
}

export interface VirtualPatientResponse {
  trigger: string;
  line: string;
  mood: Mood;
}

export interface PhysicalExamCase {
  id: string;
  tag: 'DEMO';
  system: SystemId;
  title: string;
  patient: PatientLook & { fullName: string };
  candidateBrief: string[];
  timeLimitSec: number;
  /** Phase 5 由教師確認後填入 */
  findings: PhysicalFinding[];
  responses: VirtualPatientResponse[];
  status: 'outline' | 'ready';
  review: ReviewMeta;
}

/* ------------------------------ 評量 ------------------------------ */

/** web：網頁可記錄；teacher：需教師實體觀察；not-digital：無法由數位模型可靠判定 */
export type Observability = 'web' | 'teacher' | 'not-digital';

export interface PhysicalExamRubric {
  id: string;
  dimensions: { id: string; label: string; observability: Observability; note: string }[];
  disclaimer: string;
}

export interface FeedbackItem {
  dim: string;
  ok: boolean;
  text: string;
}

export interface FeedbackReport {
  items: FeedbackItem[];
  notAssessed: string[];
}

export type { DemoChapterDef as DemonstrationTimeline } from '../training/components/DemonstrationPlayer';
