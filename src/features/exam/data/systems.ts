import type { PhysicalExamRegistry, ReviewMeta } from '../types';

const R: ReviewMeta = { status: 'draft', note: '平台教學分類，不代表國考固定考題；各系統 SOP 待教師審核。' };

/** PhysicalExamRegistry：六個系統入口；第一階段只完整實作腹部 */
export const EXAM_SYSTEMS: PhysicalExamRegistry = {
  abdomen: { id: 'abdomen', title: '腹部檢查', icon: '🫃', color: '#16a34a', status: 'building', summary: '視診、聽診、叩診、觸診；腹部分區定位；DEMO 案例建置中。', techniqueOrder: ['inspection', 'auscultation', 'percussion', 'palpation'], orderNote: '腹部檢查教學上常採「視 → 聽 → 叩 → 觸」，以免觸診與叩診改變腸音。', sequenceIds: ['seq-abdomen', 'seq-abdomen-pain'], locateTaskIds: ['loc-ruq', 'loc-llq', 'loc-umb', 'loc-epi', 'loc-mcburney', 'loc-murphy', 'loc-cva-r'], caseIds: ['demo-abdomen'], review: R },
  cardiovascular: { id: 'cardiovascular', title: '心臟血管系統檢查', icon: '❤️', color: '#ef4444', status: 'planned', summary: '心前區視診與觸診、四個瓣膜聽診區、周邊脈搏。', techniqueOrder: ['inspection', 'palpation', 'percussion', 'auscultation'], orderNote: '心臟教學上常採「視 → 觸 →（叩）→ 聽」。', sequenceIds: [], locateTaskIds: ['loc-aortic', 'loc-mitral'], caseIds: [], review: R },
  respiratory: { id: 'respiratory', title: '呼吸系統檢查', icon: '🫁', color: '#0ea5e9', status: 'planned', summary: '胸廓視診、觸覺震顫、叩診、呼吸音聽診與左右比較。', techniqueOrder: ['inspection', 'palpation', 'percussion', 'auscultation'], orderNote: '肺部教學上常採「視 → 觸 → 叩 → 聽」。', sequenceIds: [], locateTaskIds: ['loc-lungbase-l'], caseIds: [], review: R },
  neuro: { id: 'neuro', title: '神經學檢查', icon: '🧠', color: '#8b5cf6', status: 'planned', summary: '意識、腦神經、運動、感覺、反射、協調與步態。', techniqueOrder: ['inspection'], orderNote: '神經學檢查依功能領域進行，不以視觸叩聽為主軸。', sequenceIds: [], locateTaskIds: [], caseIds: [], review: R },
  musculoskeletal: { id: 'musculoskeletal', title: '肌肉骨骼檢查', icon: '🦴', color: '#f59e0b', status: 'planned', summary: 'Look、Feel、Move 與特殊檢查。', techniqueOrder: ['inspection', 'palpation'], orderNote: '常採 Look → Feel → Move → 特殊檢查。', sequenceIds: [], locateTaskIds: [], caseIds: [], review: R },
  headneck: { id: 'headneck', title: '頭頸部檢查', icon: '👂', color: '#0d9488', status: 'planned', summary: '眼、耳、鼻、口咽、頸部淋巴結與甲狀腺。', techniqueOrder: ['inspection', 'palpation', 'auscultation'], orderNote: '依部位進行，視診與觸診為主。', sequenceIds: [], locateTaskIds: [], caseIds: [], review: R },
};

export const SYSTEM_ORDER = ['cardiovascular', 'respiratory', 'abdomen', 'neuro', 'musculoskeletal', 'headneck'] as const;
