/** 身體檢查島六棟建築（3D 島嶼與總覽頁共用） */
export interface ExamBuilding {
  id: 'academy' | 'anatomy' | 'practice' | 'signs' | 'vsp' | 'challenge';
  no: string;
  title: string;
  englishTitle: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  phase: string;
}

export const EXAM_BUILDINGS: ExamBuilding[] = [
  { id: 'academy', no: '01', title: '身體檢查 SOP 學院', englishTitle: 'PE-7 Academy', description: 'PE-7 七階段，以及視診、觸診、叩診、聽診四種基本手法的教學與小遊戲。', icon: '🎓', route: '/exam/academy', color: '#16a34a', phase: '已開放' },
  { id: 'anatomy', no: '02', title: '3D 人體解剖探索館', englishTitle: '3D Anatomy Explorer', description: '可旋轉、縮放、點擊的 3D 人體：腹部四象限與九分區、心臟聽診區、背側肺野與體表標記。Game 2 人體定位挑戰。', icon: '🧍', route: '/exam/anatomy', color: '#0d9488', phase: '已開放' },
  { id: 'practice', no: '03', title: '身體檢查實作館', englishTitle: 'Examination Practice Hall', description: '六個系統入口（腹部優先建置）。Game 1 檢查流程排序。', icon: '🩺', route: '/exam/practice', color: '#0ea5e9', phase: '部分開放' },
  { id: 'signs', no: '04', title: '異常徵象辨識館', englishTitle: 'Abnormal Signs Gallery', description: 'Game 5 異常徵象辨識：視覺、聲音與檢查結果卡片（需授權素材與教師審核）。', icon: '🔎', route: '/exam/signs', color: '#f59e0b', phase: '規劃中' },
  { id: 'vsp', no: '05', title: 'Virtual SP 模擬診間', englishTitle: 'Virtual SP Exam Room', description: '腹部 DEMO 關卡：檢查前準備、視診、聽診、叩診、觸診與結果整理，搭配虛擬病人回應。', icon: '🛏️', route: '/exam/vsp', color: '#8b5cf6', phase: '規劃中' },
  { id: 'challenge', no: '06', title: 'OSCE 身體檢查挑戰館', englishTitle: 'OSCE Exam Challenge', description: '依個別教案設定時間與規準的模擬挑戰，結束後提供模擬回饋。', icon: '🏆', route: '/exam/challenge', color: '#ef4444', phase: '規劃中' },
];
