import type { ComponentType } from 'react';
import type { IslandId } from '../../../types/island';

export type SkillStatus = 'available' | 'planned';

export type SkillDifficulty = 'foundation' | 'intermediate' | 'advanced';

/**
 * 互動形式：不同技能適合不同操作方式，不假設所有技能都是拖曳排序。
 * 新技能可組合多種形式。
 */
export type InteractionStyle =
  | 'equipment-prep' // 器材選擇與擺放
  | 'sterile-technique' // 無菌手套、消毒、鋪單
  | 'freehand-trace' // 以滑鼠 / 手指描繪軌跡（例如消毒範圍）
  | 'precision-placement' // 精準點選位置與角度（例如進針點）
  | 'mini-game' // 小遊戲（例如打結）
  | 'sorting' // 分類（例如廢棄物）
  | 'verbal-simulation' // 選項式口述
  | 'anatomy-landmark' // 解剖定位（例如電極貼片位置）
  | 'sequence-control'; // 需要時序控制的操作（例如插管、置入深度）

/** SkillRegistry 的單一技能登錄資料 */
export interface SkillDefinition {
  id: string;
  order: number;
  /** 所屬島嶼（技能中心可擴展到其他島） */
  islandId: IslandId;
  title: string;
  englishTitle: string;
  summary: string;
  difficulty: SkillDifficulty;
  status: SkillStatus;
  /** 對應 SkillIcon 的圖示 key */
  icon: string;
  /** 考站時間（分鐘），由教案提供時填入 */
  stationMinutes?: number;
  interactionStyles: InteractionStyle[];
  /** 已開放技能的訓練模組（lazy load，避免拖慢群島首頁） */
  load?: () => Promise<{ default: ComponentType }>;
}

export const DIFFICULTY_LABEL: Record<SkillDifficulty, string> = {
  foundation: '入門',
  intermediate: '中階',
  advanced: '進階',
};
