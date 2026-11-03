import type { AuscultationSound, ExaminationTool, PhysicalExamCase, PhysicalExamRubric } from '../types';

export const TOOLS: ExaminationTool[] = [
  { id: 'stethoscope', name: '聽診器', icon: '🩺', techniques: ['auscultation'] },
  { id: 'hands', name: '雙手', icon: '🖐️', techniques: ['palpation', 'percussion'] },
  { id: 'light', name: '照明', icon: '💡', techniques: ['inspection'] },
];

/** 授權聲音素材：尚未取得經授權並經教師確認的素材，因此清單為空（Phase 6 加入） */
export const SOUNDS: AuscultationSound[] = [];

/** PhysicalExamRubric（示範規準；正式教案提供後以個別教案規準取代） */
export const PE_RUBRIC: PhysicalExamRubric = {
  id: 'pe-demo-rubric',
  disclaimer: '以下為平台教學構面，並非國考官方統一評分表；正式教案提供後，以個別教案的評分規準取代。網頁操作結果不等同實際身體檢查能力。',
  dimensions: [
    { id: 'prep', label: '檢查前準備', observability: 'web', note: '可記錄是否選擇了準備步驟與順序。' },
    { id: 'consent', label: '病人身分與同意', observability: 'web', note: '可記錄步驟是否完成；說法與態度需教師觀察。' },
    { id: 'hygiene', label: '手部衛生', observability: 'teacher', note: '網頁只能記錄「有選擇」；實際手部衛生技術需教師觀察。' },
    { id: 'technique', label: '檢查手法選擇', observability: 'web', note: '可記錄選擇了哪種手法。' },
    { id: 'order', label: '檢查順序', observability: 'web', note: '可由排序與操作事件記錄。' },
    { id: 'location', label: '檢查位置', observability: 'web', note: '可由 3D 模型點擊位置記錄（不代表真實定位技巧）。' },
    { id: 'compare', label: '左右比較', observability: 'web', note: '可記錄是否檢查兩側。' },
    { id: 'safety', label: '病人安全及舒適', observability: 'teacher', note: '需教師觀察互動與動作。' },
    { id: 'signs', label: '異常徵象辨識', observability: 'web', note: '可由判讀選擇記錄。' },
    { id: 'report', label: '結果報告', observability: 'web', note: '可記錄整理內容；口語報告需教師觀察。' },
    { id: 'force', label: '觸診／叩診力道、手感與流暢度', observability: 'not-digital', note: '無法由滑鼠或觸控可靠判定，保留教師實體評核。' },
  ],
};

/** DEMO 腹部案例（大綱）：檢查發現待教師確認後於 Phase 5 加入 */
export const DEMO_ABDOMEN: PhysicalExamCase = {
  id: 'demo-abdomen',
  tag: 'DEMO',
  system: 'abdomen',
  title: '腹部不適的成人：腹部身體檢查',
  patient: { name: '黃先生', fullName: '黃建國', age: 46, sex: 'M', hair: 'short', hairColor: '#44403c', shirt: '#bae6fd' },
  candidateBrief: ['考站任務：請為病人進行腹部身體檢查，並報告你的發現。', '（DEMO 原創情境；檢查發現與評分規準待臨床教師確認後加入）'],
  timeLimitSec: 420,
  findings: [],
  responses: [],
  status: 'outline',
  review: { status: 'draft', note: 'DEMO 案例大綱；檢查發現、病人回應與規準待教師確認。' },
};
