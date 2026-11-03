import type { IslandConfig, IslandId, Vec3 } from '../types/island';

/**
 * IslandData — 五大 OSCE 主題島設定
 * 新增 / 修改島嶼內容時，只需改動此檔案；3D 場景與 UI 會自動套用。
 */
export const ISLANDS: IslandConfig[] = [
  {
    id: 'history-taking',
    order: 1,
    title: '病史詢問島',
    englishTitle: 'History Taking Island',
    shortTitle: '病史詢問',
    themeColor: '#3b82f6',
    theme: {
      primary: '#3b82f6',
      secondary: '#7dd3fc',
      accent: '#22d3ee',
      ground: '#a7e3c4',
      wall: '#f8fbff',
    },
    tagline: 'HISTORY QUEST｜每一個問題，都是通往診斷的一條線索',
    description:
      '這裡是臨床推理的起點。在門診診間群與諮詢室中，練習主訴探索、現病史追問（OPQRST）、過去病史、家族史與社會史的系統性詢問，並在對話中逐步建立鑑別診斷。',
    buildingName: 'HISTORY QUEST 病史偵探學院',
    icon: '💬',
    position: [-23, 0, -7],
    radius: 8,
    styleKeywords: ['門診診間', '對話氣泡', '問題樹路徑', '理性安靜'],
    examFocus: ['主訴與現病史', 'OPQRST 症狀追問', '系統性回顧', '鑑別診斷思考'],
    learningRoute: '/history',
    modules: [
      { id: 'hq-academy', title: '01 問診 SOP 學院（六單元）', type: 'checklist', status: 'available' },
      { id: 'hq-lab', title: '02 問診技巧訓練場（四種遊戲）', type: 'quiz', status: 'available' },
      { id: 'hq-clinic', title: '03 虛擬病人診間（Case 001 頭暈）', type: 'case', status: 'available' },
      { id: 'hq-review', title: '04 問診能力分析中心', type: 'checklist', status: 'available' },
    ],
  },
  {
    id: 'physical-exam',
    order: 2,
    title: '身體檢查島',
    englishTitle: 'Physical Examination Island',
    shortTitle: '身體檢查',
    themeColor: '#16a34a',
    theme: {
      primary: '#22a35a',
      secondary: '#86efac',
      accent: '#10b981',
      ground: '#b9e8a6',
      wall: '#f4f7f5',
    },
    tagline: '視、觸、叩、聽，讓雙手成為診斷工具',
    description:
      '綠色的醫學校園小島。六個區域：身體檢查 SOP 學院（PE-7）、3D 人體解剖探索館、身體檢查實作館、異常徵象辨識館、Virtual SP 模擬診間與 OSCE 身體檢查挑戰館。',
    buildingName: 'PHYSICAL EXAM QUEST 身體檢查學院',
    icon: '🩺',
    position: [0, 0, -25],
    radius: 8.6,
    styleKeywords: ['檢查床', '聽診器', '人體模型', '考站動線'],
    examFocus: ['視診 / 觸診 / 叩診 / 聽診', '檢查前說明與隱私', '系統性檢查順序', '異常發現描述'],
    learningRoute: '/exam',
    modules: [
      { id: 'pe-academy', title: '01 身體檢查 SOP 學院（PE-7＋四大手法）', type: 'checklist', status: 'available' },
      { id: 'pe-anatomy', title: '02 3D 人體解剖探索館（人體定位）', type: 'simulation', status: 'available' },
      { id: 'pe-practice', title: '03 身體檢查實作館（流程排序；腹部建置中）', type: 'skill', status: 'available' },
      { id: 'pe-signs', title: '04 異常徵象辨識館', type: 'quiz', status: 'planned' },
      { id: 'pe-vsp', title: '05 Virtual SP 模擬診間（腹部 DEMO）', type: 'case', status: 'planned' },
      { id: 'pe-challenge', title: '06 OSCE 身體檢查挑戰館', type: 'case', status: 'planned' },
    ],
  },
  {
    id: 'clinical-management',
    order: 3,
    title: '病情解釋與臨床處置島',
    englishTitle: 'Clinical Explanation & Management Island',
    shortTitle: '臨床處置',
    themeColor: '#7c3aed',
    theme: {
      primary: '#7c3aed',
      secondary: '#c4b5fd',
      accent: '#f97316',
      ground: '#c9e6b0',
      wall: '#fbf9ff',
    },
    tagline: '整合資訊，做出清楚且安全的臨床決策',
    description:
      '靛紫與青綠的臨床決策中心。五個區域：臨床推理學院（CLINICAL-6）、診斷線索實驗室、臨床處置決策中心、病情解釋模擬診間與 OSCE 臨床決策挑戰館，完整練習「為什麼這樣判斷、為什麼這樣處理」。',
    buildingName: 'CLINICAL DECISION 臨床決策中心',
    icon: '🧭',
    position: [23, 0, -7],
    radius: 8.2,
    styleKeywords: ['急診情境', '決策節點', '警示燈號', '處置路線'],
    examFocus: ['初步診斷與鑑別', '檢查與處置安排', '病情說明', '紅旗徵象辨識'],
    learningRoute: '/clinical',
    modules: [
      { id: 'cm-academy', title: '01 臨床推理學院（CLINICAL-6）', type: 'checklist', status: 'available' },
      { id: 'cm-lab', title: '02 診斷線索實驗室（Game 1、2）', type: 'quiz', status: 'available' },
      { id: 'cm-decision', title: '03 臨床處置決策中心（Game 3）', type: 'simulation', status: 'available' },
      { id: 'cm-explain', title: '04 病情解釋模擬診間（Game 4）', type: 'case', status: 'available' },
      { id: 'cm-challenge', title: '05 OSCE 臨床決策挑戰館（DEMO 病例）', type: 'case', status: 'available' },
    ],
  },
  {
    id: 'communication',
    order: 4,
    title: '醫病溝通與衛教島',
    englishTitle: 'Communication & Patient Education Island',
    shortTitle: '醫病溝通',
    themeColor: '#f97362',
    theme: {
      primary: '#fb7c6b',
      secondary: '#fcd34d',
      accent: '#f9a8d4',
      ground: '#c8e9a8',
      wall: '#fff8ee',
    },
    tagline: '用同理心連結病人，讓衛教真正被理解',
    description:
      '珊瑚橘與青綠色的溫暖小島。五棟建築：溝通 SOP 學院（CARE-6）、同理心對話劇場、衛教互動工坊（Teach-back）、困難溝通情境館（Calgary–Cambridge、NURSE、SPIKES、Teach-back）與 Virtual SP 挑戰中心。',
    buildingName: 'CARE ISLAND 醫病溝通學院',
    icon: '🤝',
    position: [14, 0, 19],
    radius: 8.4,
    styleKeywords: ['溝通劇場', '圓桌座談', '衛教看板', '溫暖人性'],
    examFocus: ['同理心與傾聽', '壞消息告知 SPIKES', '共享決策 SDM', 'Teach-back 衛教確認'],
    learningRoute: '/care',
    modules: [
      { id: 'care-academy', title: '01 溝通 SOP 學院（CARE-6＋Game 1）', type: 'checklist', status: 'available' },
      { id: 'care-theater', title: '02 同理心對話劇場（Game 2）', type: 'quiz', status: 'available' },
      { id: 'care-workshop', title: '03 衛教互動工坊（Game 3 Teach-back）', type: 'quiz', status: 'available' },
      { id: 'care-tools', title: '04 困難溝通情境館（四種工具）', type: 'checklist', status: 'available' },
      { id: 'care-vsp', title: '05 Virtual SP 挑戰中心（原型案例）', type: 'case', status: 'available' },
    ],
  },
  {
    id: 'procedural-skills',
    order: 5,
    title: '技能操作島',
    englishTitle: 'Procedural Skills Island',
    shortTitle: '技能操作',
    themeColor: '#1e3a8a',
    theme: {
      primary: '#1e40af',
      secondary: '#94a3b8',
      accent: '#ef4444',
      ground: '#b4dfb4',
      wall: '#e2e8f0',
    },
    tagline: '標準流程 × 無菌觀念 × 熟練操作',
    description:
      '以操作技能為核心的模擬訓練中心。在技能訓練中心練習傷口縫合、導尿管置入、靜脈留置針置入、心電圖操作等八項單項技能，熟悉器材準備、無菌技術與標準操作流程。',
    buildingName: '技能操作中心',
    icon: '🛠️',
    position: [-14, 0, 19],
    radius: 7.8,
    styleKeywords: ['模擬器材', '操作平台', '訓練艙', '機械感'],
    examFocus: ['器材準備與核對', '無菌技術', '標準操作流程', '病人安全'],
    learningRoute: '/island/procedural-skills',
    modules: [
      { id: 'wound-suturing', title: '傷口縫合', type: 'skill', status: 'available' },
      { id: 'urinary-catheterization', title: '導尿管置入', type: 'skill', status: 'available' },
      { id: 'endotracheal-intubation', title: '氣管內管插管', type: 'skill', status: 'available' },
      { id: 'iv-cannulation', title: '靜脈留置針置入', type: 'skill', status: 'planned' },
    ],
  },
];

export const ISLAND_MAP: Record<IslandId, IslandConfig> = Object.fromEntries(
  ISLANDS.map((island) => [island.id, island]),
) as Record<IslandId, IslandConfig>;

export const getIsland = (id: IslandId | null) => (id ? ISLAND_MAP[id] : null);

/** 全景鏡頭設定 */
export const OVERVIEW_CAMERA = {
  position: [0, 56, 66] as Vec3,
  target: [0, 0, -2] as Vec3,
};

/** 聚焦島嶼時的預設鏡頭偏移（島嶼建築正面朝 +Z） */
export const DEFAULT_FOCUS_OFFSET: Vec3 = [0, 15, 23];

/** 中央導航廣場 */
export const CENTRAL_PLAZA = {
  title: '導航廣場',
  englishTitle: 'Navigation Plaza',
  position: [0, 0, 0] as Vec3,
  radius: 4.6,
};
