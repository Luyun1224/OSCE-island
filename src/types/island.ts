/**
 * OSCE Learning Islands — 核心型別定義
 * 之後新增教案、技能項目、互動關卡時，請優先擴充這裡的型別。
 */

export type Vec3 = [number, number, number];

/** 五大 OSCE 考試類型（島嶼 ID） */
export type IslandId =
  | 'history-taking'
  | 'physical-exam'
  | 'clinical-management'
  | 'communication'
  | 'procedural-skills';

/** 每座島的配色系統：3D 場景與 UI 共用 */
export interface IslandTheme {
  /** 主色（屋頂、主要識別） */
  primary: string;
  /** 次色（牆面、輔助） */
  secondary: string;
  /** 點綴色（燈號、標誌） */
  accent: string;
  /** 島嶼地表色 */
  ground: string;
  /** 牆面 / 建築基底色 */
  wall: string;
}

/** 學習模組類型（第二階段起使用） */
export type LearningModuleType = 'case' | 'skill' | 'checklist' | 'quiz' | 'simulation';

export type LearningModuleStatus = 'planned' | 'in-progress' | 'available';

/** 島內學習模組（目前僅為示意，之後可串接教案 / 題庫） */
export interface LearningModule {
  id: string;
  title: string;
  type: LearningModuleType;
  status: LearningModuleStatus;
  description?: string;
}

/** 單一島嶼完整設定 */
export interface IslandConfig {
  id: IslandId;
  /** 顯示順序（導航選單、動畫相位） */
  order: number;
  title: string;
  englishTitle: string;
  /** 導航選單用短標題 */
  shortTitle: string;
  /** 主題代表色（UI 使用） */
  themeColor: string;
  theme: IslandTheme;
  /** 島嶼簡介 */
  description: string;
  /** 核心概念一句話 */
  tagline: string;
  /** 主建築名稱 */
  buildingName: string;
  /** UI 圖示（emoji，之後可替換為 SVG icon） */
  icon: string;
  /** 島嶼中心世界座標 */
  position: Vec3;
  /** 島嶼半徑（大小略有差異） */
  radius: number;
  styleKeywords: string[];
  /** 考試重點（簡介面板顯示） */
  examFocus: string[];
  /** 鏡頭聚焦時相對於島嶼中心的偏移，未設定則用預設值 */
  cameraOffset?: Vec3;
  /** 學習模組（第二階段開始填入真實內容） */
  modules: LearningModule[];
}
