import type { LocateTask } from '../types';

/** Game 2：人體定位挑戰題目（定位依據見 anatomyModel 的標記定義） */
export const LOCATE_TASKS: LocateTask[] = [
  { id: 'loc-ruq', system: 'abdomen', prompt: '點出病人的「右上腹（RUQ）」', target: { kind: 'region', id: 'ruq' }, side: 'right', view: 'front', why: '肝臟與膽囊位於右上腹；病人的右側在檢查者面對病人時的左手邊。' },
  { id: 'loc-llq', system: 'abdomen', prompt: '點出病人的「左下腹（LLQ）」', target: { kind: 'region', id: 'llq' }, side: 'left', view: 'front', why: '乙狀結腸位於左下腹。' },
  { id: 'loc-umb', system: 'abdomen', prompt: '點出「肚臍」（腹部四象限的中心）', target: { kind: 'landmark', id: 'umbilicus' }, side: 'midline', view: 'front', why: '以肚臍為中心的水平與垂直線劃分四象限。' },
  { id: 'loc-mcburney', system: 'abdomen', prompt: '點出「麥氏點」', target: { kind: 'landmark', id: 'mcburney' }, side: 'right', view: 'front', why: '右側髂前上棘至肚臍連線的外側三分之一處。' },
  { id: 'loc-epi', system: 'abdomen', prompt: '點出「上腹區（epigastric）」', target: { kind: 'region', id: 'epi' }, side: 'midline', view: 'front', why: '九分區中，兩側鎖骨中線之間、肋下平面以上的區域。' },
  { id: 'loc-murphy', system: 'abdomen', prompt: '點出 Murphy sign 的檢查位置（右肋緣與右鎖骨中線交點）', target: { kind: 'landmark', id: 'murphy' }, side: 'right', view: 'front', why: '膽囊的體表投影位置。' },
  { id: 'loc-cva-r', system: 'abdomen', prompt: '轉到背側，點出病人的「右側肋脊角」', target: { kind: 'landmark', id: 'cva-r' }, side: 'right', view: 'back', why: '第十二肋骨與脊椎的夾角；從背後看時，病人的右側在你的右手邊。' },
  { id: 'loc-aortic', system: 'cardiovascular', prompt: '點出「主動脈瓣聽診區」', target: { kind: 'landmark', id: 'aortic' }, side: 'right', view: 'front', why: '右側第二肋間、胸骨右緣；從胸骨角找到第二肋骨。' },
  { id: 'loc-mitral', system: 'cardiovascular', prompt: '點出「僧帽瓣聽診區（心尖）」', target: { kind: 'landmark', id: 'mitral' }, side: 'left', view: 'front', why: '左側第五肋間、鎖骨中線。' },
  { id: 'loc-lungbase-l', system: 'respiratory', prompt: '轉到背側，點出「左下肺野」', target: { kind: 'landmark', id: 'lungbase-l' }, side: 'left', view: 'back', why: '肩胛骨下角以下的背側肺野，下葉聽診的重要位置。' },
];
