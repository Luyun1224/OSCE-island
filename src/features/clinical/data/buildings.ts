/** CLINICAL DECISION ISLAND 五棟建築（3D 島嶼與總覽頁共用；保持輕量） */
export interface ClinicalBuilding {
  id: 'academy' | 'lab' | 'decision' | 'explain' | 'challenge';
  no: string;
  title: string;
  englishTitle: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

export const CLINICAL_BUILDINGS: ClinicalBuilding[] = [
  { id: 'academy', no: '01', title: '臨床推理學院', englishTitle: 'CLINICAL-6 Academy', description: 'CLINICAL-6 六個單元：Assess、Summarize、Differentiate、Investigate、Manage、Explain & Follow up。每單元有圖像化學習卡、臨床情境、小遊戲與安全提醒。', icon: '🎓', route: '/clinical/academy', color: '#4f46e5' },
  { id: 'lab', no: '02', title: '診斷線索實驗室', englishTitle: 'Diagnostic Clue Lab', description: 'Game 1 臨床線索拼圖：從病歷與檢驗資料組成問題摘要。Game 2 鑑別診斷擂台：排序診斷、配置支持與反對證據、標示不能漏掉的疾病。', icon: '🧪', route: '/clinical/lab', color: '#0d9488' },
  { id: 'decision', no: '03', title: '臨床處置決策中心', englishTitle: 'Management Decision Center', description: 'Game 3 臨床處置模擬器：立即處置、檢查、初步處置與時間順序、治療與監測。不同選擇會引發經病例設定的模擬後果。', icon: '🩺', route: '/clinical/decision', color: '#7c3aed' },
  { id: 'explain', no: '04', title: '病情解釋模擬診間', englishTitle: 'Explanation Clinic', description: 'Game 4 病情解釋挑戰：向病人與家屬說明判斷、確定程度、檢查理由、處置、風險與追蹤，並處理病人的疑問與顧慮。', icon: '🗣️', route: '/clinical/explain', color: '#0891b2' },
  { id: 'challenge', no: '05', title: 'OSCE 臨床決策挑戰館', englishTitle: 'Integrated Decision Challenge', description: '同一個病例連續完成四關，過程中不顯示答案，結束後查看整合的形成性回饋與病人安全事件。', icon: '🏆', route: '/clinical/challenge', color: '#ea580c' },
];
