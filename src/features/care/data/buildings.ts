/**
 * CARE ISLAND 五棟建築（3D 島嶼與總覽頁共用；保持輕量，不引用其他模組）
 */
export interface CareBuilding {
  id: 'academy' | 'theater' | 'workshop' | 'gallery' | 'vsp';
  no: string;
  title: string;
  englishTitle: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

export const CARE_BUILDINGS: CareBuilding[] = [
  {
    id: 'academy',
    no: '01',
    title: '溝通 SOP 學院',
    englishTitle: 'CARE-6 Academy',
    description: 'CARE-6 六個階段：Connect、Assess、Respond、Explain、Engage、End。每單元有觀念、短情境、互動練習、好／不佳說法對照，再挑戰 Game 1 溝通 SOP 挑戰。',
    icon: '🎓',
    route: '/care/academy',
    color: '#f97362',
  },
  {
    id: 'theater',
    no: '02',
    title: '同理心對話劇場',
    englishTitle: 'Empathy Theater',
    description: 'Game 2：焦慮、生氣、害怕、悲傷四種情緒場景。觀察情緒線索、選擇回應、看見病人的反應與後續發展，學習 NURSE。',
    icon: '🎭',
    route: '/care/theater',
    color: '#e11d48',
  },
  {
    id: 'workshop',
    no: '03',
    title: '衛教互動工坊',
    englishTitle: 'Teach-back Workshop',
    description: 'Game 3：用七個步驟完成一次衛教。病人說「我懂了」不算數，要請病人用自己的話說一次，再針對誤解補充。',
    icon: '🧩',
    route: '/care/workshop',
    color: '#f59e0b',
  },
  {
    id: 'gallery',
    no: '04',
    title: '困難溝通情境館',
    englishTitle: 'Communication Toolkit Gallery',
    description: 'Calgary–Cambridge、NURSE、SPIKES、Teach-back 四種工具的教學卡與小遊戲。認識每個工具適合的時機，而不是一套公式套用所有情境。',
    icon: '🧰',
    route: '/care/tools',
    color: '#0d9488',
  },
  {
    id: 'vsp',
    no: '05',
    title: 'Virtual SP 挑戰中心',
    englishTitle: 'Virtual SP Challenge',
    description: '與虛擬標準化病人進行多分支對話。正確示範、教學引導、自主練習、OSCE 模擬挑戰四種模式，結束後有形成性回饋報告。',
    icon: '🗣️',
    route: '/care/vsp',
    color: '#0f766e',
  },
];
