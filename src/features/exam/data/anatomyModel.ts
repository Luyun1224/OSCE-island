import type { AnatomicalLandmark, AnatomicalRegion, AnatomyModel, ReviewMeta, SurfaceLine } from '../types';

const R: ReviewMeta = { status: 'draft', note: '體表標記位置依成人平均比例設定於教學示意模型上，待解剖學／臨床教師確認。' };
const REF = '依常用身體檢查教科書之體表標記定義（例：Bates’ Guide to Physical Examination）整理；座標為教學示意模型上的近似位置';

const lm = (l: Omit<AnatomicalLandmark, 'review' | 'reference' | 'tolerance'> & { tolerance?: number }): AnatomicalLandmark => ({ tolerance: 0.022, reference: REF, review: R, ...l });

/** 體表標記（x < 0 為病人右側） */
const LANDMARKS: AnatomicalLandmark[] = [
  lm({ id: 'suprasternal', name: '胸骨上切跡', surface: 'front', x: 0, y: 1.44, definition: '胸骨柄上緣、兩側鎖骨內側端之間的凹陷。', examAreas: ['氣管位置', '頸靜脈評估的參考點'] }),
  lm({ id: 'sternal-angle', name: '胸骨角（Louis 角）', surface: 'front', x: 0, y: 1.403, definition: '胸骨柄與胸骨體交界的橫向隆起，兩側連接第二肋骨，是計算肋間的起點。', examAreas: ['肋間定位', '頸靜脈壓測量參考點'] }),
  lm({ id: 'xiphoid', name: '劍突', surface: 'front', x: 0, y: 1.2, definition: '胸骨下端，兩側肋緣交會處。', examAreas: ['上腹部上界'] }),
  lm({ id: 'umbilicus', name: '肚臍', surface: 'front', x: 0, y: 1.06, definition: '腹部四象限的中心點。', examAreas: ['腹部象限劃分', '腸音聽診起點（教學常用）'] }),
  lm({ id: 'pubic', name: '恥骨聯合', surface: 'front', x: 0, y: 0.895, definition: '兩側恥骨在中線的連接處，腹部下界。', examAreas: ['膀胱觸診／叩診'] }),
  lm({ id: 'asis-r', name: '右側髂前上棘（ASIS）', surface: 'front', x: -0.125, y: 0.972, definition: '髂嵴前端的骨性突起。', examAreas: ['麥氏點定位', '右下腹範圍'] }),
  lm({ id: 'asis-l', name: '左側髂前上棘（ASIS）', surface: 'front', x: 0.125, y: 0.972, definition: '髂嵴前端的骨性突起。', examAreas: ['左下腹範圍'] }),
  lm({ id: 'mcburney', name: '麥氏點（McBurney point）', surface: 'front', x: -0.083, y: 1.001, definition: '右側髂前上棘至肚臍連線的外側三分之一處。', examAreas: ['闌尾炎壓痛評估'], tolerance: 0.02 }),
  lm({ id: 'murphy', name: '右肋緣與右鎖骨中線交點', surface: 'front', x: -0.09, y: 1.14, definition: '膽囊體表投影；Murphy sign 檢查位置。', examAreas: ['Murphy sign', '肝臟下緣觸診'] }),
  lm({ id: 'aortic', name: '主動脈瓣聽診區', surface: 'front', x: -0.028, y: 1.375, definition: '右側第二肋間、胸骨右緣。', examAreas: ['心音聽診'], tolerance: 0.016 }),
  lm({ id: 'pulmonic', name: '肺動脈瓣聽診區', surface: 'front', x: 0.028, y: 1.375, definition: '左側第二肋間、胸骨左緣。', examAreas: ['心音聽診'], tolerance: 0.016 }),
  lm({ id: 'erb', name: 'Erb 點', surface: 'front', x: 0.028, y: 1.343, definition: '左側第三肋間、胸骨左緣。', examAreas: ['心音聽診'], tolerance: 0.014 }),
  lm({ id: 'tricuspid', name: '三尖瓣聽診區', surface: 'front', x: 0.03, y: 1.305, definition: '左側第四肋間、胸骨左下緣。', examAreas: ['心音聽診'], tolerance: 0.016 }),
  lm({ id: 'mitral', name: '僧帽瓣聽診區（心尖）', surface: 'front', x: 0.088, y: 1.27, definition: '左側第五肋間、鎖骨中線（成人典型心尖位置）。', examAreas: ['心音聽診', '心尖搏動觸診'], tolerance: 0.018 }),
  lm({ id: 'spleen', name: '左前腋線下肋區', surface: 'front', x: 0.135, y: 1.15, definition: '左側肋緣下、前腋線附近，脾臟觸診與叩診的參考位置。', examAreas: ['脾臟觸診', 'Traube 空間叩診'] }),
  lm({ id: 'c7', name: '第七頸椎棘突', surface: 'back', x: 0, y: 1.462, definition: '頸部最突出的棘突，是背部定位的起點。', examAreas: ['脊椎定位'] }),
  lm({ id: 'scap-r', name: '右肩胛骨下角', surface: 'back', x: -0.1, y: 1.29, definition: '約對應第七肋骨／第七胸椎高度。', examAreas: ['背部肺野定位'] }),
  lm({ id: 'scap-l', name: '左肩胛骨下角', surface: 'back', x: 0.1, y: 1.29, definition: '約對應第七肋骨／第七胸椎高度。', examAreas: ['背部肺野定位'] }),
  lm({ id: 'cva-r', name: '右側肋脊角（CVA）', surface: 'back', x: -0.06, y: 1.13, definition: '第十二肋骨與脊椎之間形成的夾角。', examAreas: ['腎臟叩擊痛（CVA knocking tenderness）'] }),
  lm({ id: 'cva-l', name: '左側肋脊角（CVA）', surface: 'back', x: 0.06, y: 1.13, definition: '第十二肋骨與脊椎之間形成的夾角。', examAreas: ['腎臟叩擊痛（CVA knocking tenderness）'] }),
  lm({ id: 'lungbase-r', name: '右下肺野（背側）', surface: 'back', x: -0.085, y: 1.19, definition: '肩胛骨下角以下、橫膈上方的背側肺野。', examAreas: ['呼吸音聽診', '橫膈移動度叩診'], tolerance: 0.03 }),
  lm({ id: 'lungbase-l', name: '左下肺野（背側）', surface: 'back', x: 0.085, y: 1.19, definition: '肩胛骨下角以下、橫膈上方的背側肺野。', examAreas: ['呼吸音聽診', '橫膈移動度叩診'], tolerance: 0.03 }),
];

const Q = (id: string, name: string, short: string, x: [number, number], y: [number, number], color: string, contents: string[]): AnatomicalRegion => ({ id, name, short, surface: 'front', scheme: 'quadrant', x, y, color, contents, examAreas: ['腹部視診', '聽診', '叩診', '觸診'] });
const NINE_COLORS: Record<string, string> = { 'r-hypo': '#22c55e', epi: '#0ea5e9', 'l-hypo': '#22c55e', 'r-lumbar': '#f59e0b', umb: '#a855f7', 'l-lumbar': '#f59e0b', 'r-iliac': '#22c55e', hypogastric: '#0ea5e9', 'l-iliac': '#22c55e' };
const N = (id: string, name: string, x: [number, number], y: [number, number], contents: string[]): AnatomicalRegion => ({ id, name, surface: 'front', scheme: 'nine', x, y, color: NINE_COLORS[id], contents, examAreas: ['腹部觸診與叩診的定位描述'] });

const MCL = 0.09;
const REGIONS: AnatomicalRegion[] = [
  Q('ruq', '右上腹（RUQ）', 'RUQ', [-0.17, 0], [1.06, 1.2], '#f97316', ['肝臟', '膽囊', '十二指腸', '右腎上極', '結腸肝曲']),
  Q('luq', '左上腹（LUQ）', 'LUQ', [0, 0.17], [1.06, 1.2], '#0ea5e9', ['胃', '脾臟', '胰尾', '左腎上極', '結腸脾曲']),
  Q('rlq', '右下腹（RLQ）', 'RLQ', [-0.17, 0], [0.895, 1.06], '#a855f7', ['盲腸', '闌尾', '右側卵巢／輸卵管', '右輸尿管']),
  Q('llq', '左下腹（LLQ）', 'LLQ', [0, 0.17], [0.895, 1.06], '#10b981', ['乙狀結腸', '左側卵巢／輸卵管', '左輸尿管']),
  N('r-hypo', '右季肋區', [-0.17, -MCL], [1.12, 1.2], ['肝臟右葉', '膽囊']),
  N('epi', '上腹區', [-MCL, MCL], [1.12, 1.2], ['胃', '肝臟左葉', '胰臟']),
  N('l-hypo', '左季肋區', [MCL, 0.17], [1.12, 1.2], ['脾臟', '胃底']),
  N('r-lumbar', '右腰區', [-0.17, -MCL], [0.99, 1.12], ['升結腸', '右腎']),
  N('umb', '臍區', [-MCL, MCL], [0.99, 1.12], ['小腸', '橫結腸', '腹主動脈']),
  N('l-lumbar', '左腰區', [MCL, 0.17], [0.99, 1.12], ['降結腸', '左腎']),
  N('r-iliac', '右髂區', [-0.17, -MCL], [0.895, 0.99], ['盲腸', '闌尾']),
  N('hypogastric', '恥骨上區', [-MCL, MCL], [0.895, 0.99], ['膀胱', '子宮（女性）']),
  N('l-iliac', '左髂區', [MCL, 0.17], [0.895, 0.99], ['乙狀結腸']),
  { id: 'precordium', name: '心前區', surface: 'front', scheme: 'thorax', x: [-0.04, 0.11], y: [1.24, 1.4], color: '#ef4444', contents: ['心臟'], examAreas: ['心臟視診、觸診、聽診'] },
  { id: 'chest-r', name: '右前胸', surface: 'front', scheme: 'thorax', x: [-0.17, -0.005], y: [1.2, 1.44], color: '#38bdf8', contents: ['右肺上、中葉'], examAreas: ['呼吸音聽診', '叩診'] },
  { id: 'chest-l', name: '左前胸', surface: 'front', scheme: 'thorax', x: [0.005, 0.17], y: [1.2, 1.44], color: '#38bdf8', contents: ['左肺上葉', '心臟'], examAreas: ['呼吸音聽診', '叩診'] },
  { id: 'back-lung-r', name: '右背側肺野', surface: 'back', scheme: 'back', x: [-0.16, -0.012], y: [1.17, 1.44], color: '#38bdf8', contents: ['右肺（以下葉為主）'], examAreas: ['呼吸音聽診', '叩診', '觸覺震顫'] },
  { id: 'back-lung-l', name: '左背側肺野', surface: 'back', scheme: 'back', x: [0.012, 0.16], y: [1.17, 1.44], color: '#38bdf8', contents: ['左肺（以下葉為主）'], examAreas: ['呼吸音聽診', '叩診', '觸覺震顫'] },
  { id: 'flank-r', name: '右側腰背（腎區）', surface: 'back', scheme: 'back', x: [-0.13, -0.012], y: [1.06, 1.17], color: '#f59e0b', contents: ['右腎'], examAreas: ['肋脊角叩擊痛'] },
  { id: 'flank-l', name: '左側腰背（腎區）', surface: 'back', scheme: 'back', x: [0.012, 0.13], y: [1.06, 1.17], color: '#f59e0b', contents: ['左腎'], examAreas: ['肋脊角叩擊痛'] },
];

const LINES: SurfaceLine[] = [
  { id: 'midline', name: '前正中線', surface: 'front', points: [[0, 1.44], [0, 0.895]], color: '#334155' },
  { id: 'mcl-r', name: '右鎖骨中線', surface: 'front', points: [[-MCL, 1.43], [-MCL, 0.92]], color: '#0f766e' },
  { id: 'mcl-l', name: '左鎖骨中線', surface: 'front', points: [[MCL, 1.43], [MCL, 0.92]], color: '#0f766e' },
  { id: 'costal-r', name: '右肋緣', surface: 'front', points: [[0, 1.2], [-0.04, 1.18], [-0.09, 1.14], [-0.13, 1.122], [-0.15, 1.115]], color: '#b45309' },
  { id: 'costal-l', name: '左肋緣', surface: 'front', points: [[0, 1.2], [0.04, 1.18], [0.09, 1.14], [0.13, 1.122], [0.15, 1.115]], color: '#b45309' },
  { id: 'umb-line', name: '經臍水平線', surface: 'front', points: [[-0.16, 1.06], [0.16, 1.06]], color: '#334155' },
  { id: 'spine', name: '脊椎中線', surface: 'back', points: [[0, 1.46], [0, 0.95]], color: '#334155' },
  { id: 'rib12-r', name: '右第十二肋', surface: 'back', points: [[-0.02, 1.14], [-0.07, 1.125], [-0.12, 1.1]], color: '#b45309' },
  { id: 'rib12-l', name: '左第十二肋', surface: 'back', points: [[0.02, 1.14], [0.07, 1.125], [0.12, 1.1]], color: '#b45309' },
];

export const BODY_MODEL: AnatomyModel = {
  id: 'teaching-body-v1',
  label: '教學示意人體（程式建模）',
  heightM: 1.7,
  note: '以體型剖面表產生連續曲面的教學示意模型（低多邊形校園風格），比例參考成人平均；不是解剖精確模型。體表標記待教師確認，取得授權 3D 人體模型後需重新校正。',
  landmarks: LANDMARKS,
  regions: REGIONS,
  lines: LINES,
  review: R,
};

export const landmarkById = (id: string) => LANDMARKS.find((l) => l.id === id);
export const regionById = (id: string) => REGIONS.find((r) => r.id === id);
