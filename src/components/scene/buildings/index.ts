import type { ComponentType } from 'react';
import type { IslandId, IslandTheme } from '../../../types/island';
import { HistoryTakingBuildings } from './HistoryTakingBuildings';
import { PhysicalExamBuildings } from './PhysicalExamBuildings';
import { ClinicalManagementBuildings } from './ClinicalManagementBuildings';
import { CommunicationBuildings } from './CommunicationBuildings';
import { ProceduralSkillsBuildings } from './ProceduralSkillsBuildings';

export interface BuildingSetProps {
  theme: IslandTheme;
}

/**
 * 建築註冊表：島嶼 ID → 該島的建築群元件。
 * 新增島嶼時，在此註冊對應的建築元件即可。
 */
export const BUILDING_REGISTRY: Record<IslandId, ComponentType<BuildingSetProps>> = {
  'history-taking': HistoryTakingBuildings,
  'physical-exam': PhysicalExamBuildings,
  'clinical-management': ClinicalManagementBuildings,
  communication: CommunicationBuildings,
  'procedural-skills': ProceduralSkillsBuildings,
};
