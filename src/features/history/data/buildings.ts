/**
 * HISTORY QUEST 四棟建築（3D 島嶼與總覽頁共用；保持輕量，不引用其他模組）
 */
export interface HQBuilding {
  id: 'academy' | 'lab' | 'clinic' | 'review';
  no: string;
  title: string;
  englishTitle: string;
  description: string;
  icon: string;
  route: string;
  status: 'open' | 'building';
  color: string;
}

export const HQ_BUILDINGS: HQBuilding[] = [
  {
    id: 'academy',
    no: '01',
    title: '問診 SOP 學院',
    englishTitle: 'History Taking Academy',
    description: '六個單元學習病史詢問的架構、順序與臨床思考：開場、開放式問診、OPQRST、相關病史、危險徵象、ICE 與摘要。',
    icon: '🎓',
    route: '/history/academy',
    status: 'open',
    color: '#0d9488',
  },
  {
    id: 'lab',
    no: '02',
    title: '問診技巧訓練場',
    englishTitle: 'Interactive Training Lab',
    description: '四種小遊戲：問診排序、OPQRST 線索收集、病史分類拼圖、病人情緒回應。',
    icon: '🎮',
    route: '/history/lab',
    status: 'open',
    color: '#f97316',
  },
  {
    id: 'clinic',
    no: '03',
    title: '虛擬病人診間',
    englishTitle: 'Virtual Patient Clinic',
    description: '選擇病例，與虛擬標準化病人進行自由問診、追問、判讀檢驗並說明病情。',
    icon: '🩺',
    route: '/history/clinic',
    status: 'building',
    color: '#2563eb',
  },
  {
    id: 'review',
    no: '04',
    title: '問診能力分析中心',
    englishTitle: 'Performance Review Center',
    description: '查看練習歷程、各單元與遊戲成績、遺漏的重點與建議重練的單元。',
    icon: '📊',
    route: '/history/review',
    status: 'open',
    color: '#7c3aed',
  },
];
