import type { ClinicalRubric } from '../types';

/** 形成性評量面向（教學用，非國考評分標準） */
export const CLINICAL_RUBRIC: ClinicalRubric = {
  id: 'clinical-formative-v1',
  dimensions: [
    { id: 'recognition', label: '危急狀況辨識', description: '辨識不穩定的生命徵象與器官功能障礙，判斷急迫性', lesson: 'assess' },
    { id: 'integration', label: '資訊整合', description: '從病史、檢查與檢驗中找出關鍵陽性與陰性發現', lesson: 'summarize' },
    { id: 'summary', label: '問題摘要', description: '精簡、有時間特徵、呈現嚴重度的問題摘要', lesson: 'summarize' },
    { id: 'ddx', label: '鑑別診斷合理性', description: '列出並排序合理的鑑別診斷，不漏掉危險疾病', lesson: 'differentiate' },
    { id: 'evidence', label: '推理證據', description: '為每個診斷配置支持與反對的證據', lesson: 'differentiate' },
    { id: 'investigation', label: '檢查選擇適切性', description: '選擇會改變處置的檢查，避免不必要或有害的檢查', lesson: 'investigate' },
    { id: 'priority', label: '處置優先順序', description: '危急處置優先、不因檢查延誤治療', lesson: 'manage' },
    { id: 'treatment', label: '治療與替代方案', description: '選擇合理的治療，避免有害處置，了解替代方案', lesson: 'manage' },
    { id: 'explanation', label: '病情解釋正確性', description: '向病人說明的醫學內容正確、確定程度適當', lesson: 'explain' },
    { id: 'followup', label: '風險與追蹤安排', description: '監測、追蹤、用藥調整與後續安排', lesson: 'explain' },
  ],
  limitations: [
    '本回饋是「模擬形成性評量」，不是國考或正式 OSCE 評分標準。',
    '病例與模擬後果為 DEMO 教學設定，須經臨床教師審核；真實臨床需依病人狀況與在地規範調整。',
    '本島評估的是醫學內容與臨床推理；溝通技巧（同理、語氣、互動）請到醫病溝通島練習。',
  ],
};
