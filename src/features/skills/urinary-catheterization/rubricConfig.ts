/**
 * 教案專屬、可由教師調整的評分參數（與評分邏輯 rubric.ts、遊戲事件 engine.ts 分開）
 *
 * - 「教案規準」數值逐字取自《技術操作－導尿管置放.pdf》考官指引，只適用本教案評分，
 *   不代表所有導尿管型號或所有病人皆適用的臨床通則。
 * - 「介面參數」只控制網頁互動的手感（例如推進速度上限），不是臨床數值。
 * - reviewStatus 為 draft 的項目，畫面會標示「待臨床教師審核」。
 */
export type ReviewStatus = 'draft' | 'reviewed';

export interface ReviewMeta {
  reviewStatus: ReviewStatus;
  reviewer: string | null;
  note: string;
}

export const CATHETER_RUBRIC_CONFIG = {
  source: '《技術操作－導尿管置放.pdf》考官指引・評分說明',
  /** 教案原文：備物請依考場臨床常規評分，如貴考場消毒液一般由護理人員協助提供則不予扣分 */
  antisepticProvidedByAssistant: false,

  lubrication: {
    /** 教案規準：塗抹到尿管的前半段（指前二分之一，20–25 cm 左右） */
    targetFraction: 0.5,
    label: '前半段（前二分之一，20–25 cm 左右）',
    review: { reviewStatus: 'draft', reviewer: null, note: '範圍取自本教案；實際依導尿管產品說明與院內 SOP。' } as ReviewMeta,
  },

  balloon: {
    /** 教案規準：打入 5–10 cc 水球 */
    minMl: 5,
    maxMl: 10,
    label: '5–10 cc（本教案）',
    review: { reviewStatus: 'draft', reviewer: null, note: '容量取自本教案；實際依導尿管產品標示與院內 SOP。' } as ReviewMeta,
  },

  /** 置入模擬：介面參數（進度以 0–1 表示流程進度，非長度） */
  insertion: {
    /** 每秒推進超過此進度比例即提醒「過快」 */
    maxSafeRate: 0.22,
    /** 拖曳方向偏離軸線的容許比例 */
    directionTolerance: 0.35,
    /** 模擬見尿事件出現的進度 */
    urineAt: 0.72,
    /** 模擬阻力事件出現的進度（若本次情境有安排） */
    resistanceAt: 0.38,
    /** 回拉到「卡住」的模擬定位距離 */
    seatPull: 0.08,
    review: { reviewStatus: 'draft', reviewer: null, note: '阻力、見尿與定位為教學模擬事件，由教師審核情境設定；不代表真實組織阻力或解剖位置。' } as ReviewMeta,
  },

  /** 消毒：教學示意規則，需院內感染管制教師審核 */
  disinfect: {
    rules: ['從尿道口開始', '由內往外，不回到已消毒的中心', '每支棉枝只用一次'],
    review: { reviewStatus: 'draft', reviewer: null, note: '消毒藥劑、範圍與細部動作依院內感染管制規範，待教師審核。' } as ReviewMeta,
  },

  drape: {
    /** 洞巾開口中心與尿道口的距離（示意座標單位）在此範圍內視為對準 */
    alignTolerance: 22,
  },

  handHygiene: {
    review: { reviewStatus: 'draft', reviewer: null, note: '依 WHO 乾洗手步驟示意，實施細節依院內感染管制規範。' } as ReviewMeta,
  },
};
