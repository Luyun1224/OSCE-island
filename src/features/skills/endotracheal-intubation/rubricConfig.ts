/**
 * 教案專屬、可由教師調整的評分參數與案例規則（與評分邏輯 rubric.ts、遊戲事件 engine.ts 分開）
 * - caseRequirement：《氣管插管(1).pdf》原始要求，只適用本教案評分
 * - caseRule：本模擬用來決定畫面結果的教學情境規則，不是真實生理模型
 * - supplement：現行臨床安全補充，不計入 14 項評分
 */
export type ReviewStatus = 'draft' | 'pending-teacher' | 'reviewed';

export const AIRWAY_CONFIG = {
  source: '《氣管插管(1).pdf》第 3–5 頁評分表與考官指引',
  caseRequirement: {
    /** 評分項目 2：正確選擇氣管內管大小（內徑 7.0 或 7.5） */
    tubeSizes: [7.0, 7.5],
    /** 評分項目 6：正確吹氣速度 10–12 次/分 */
    ventRate: { min: 10, max: 12 },
    /** 評分項目 9：嘴角刻度約 20–22 cm */
    depth: { min: 20, max: 22 },
  },
  caseRule: {
    /** 計算給氣速度所需的最少擠壓次數 */
    minBreathsForRate: 3,
    /** 速度判斷容許誤差（次/分），教師可調整 */
    rateTolerance: 0.5,
    note: '胸廓起伏、聽診結果與二氧化碳波形依「管路位置與深度」的案例規則決定：氣管內且深度符合教案 → 雙側對稱；超過教案深度 → 以右側單側為主；食道 → 無胸廓起伏、胃部氣過水聲、無持續波形。',
  },
  review: {
    demonstration: { status: 'pending-teacher' as ReviewStatus, note: '正確示範為可替換的動畫原型，尚未經臨床教師核准；核准後可在各章節加入實拍影片（videoUrl）。' },
    technique: { status: 'pending-teacher' as ReviewStatus, note: '喉頭鏡持握、置入與上提方式、頭部擺位、通條與 cuff 處理細節以教學示意呈現，正式操作方式需臨床教師審核。' },
    stylet: { status: 'pending-teacher' as ReviewStatus, note: '「通條前端不超出管尖」為現行臨床安全補充，不在教案評分中。' },
    cuffVolume: { status: 'pending-teacher' as ReviewStatus, note: '教案只要求 cuff 充氣，未指定充氣量；實際依產品與院內規範。' },
  },
};
