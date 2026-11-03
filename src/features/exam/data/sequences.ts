import type { ExaminationSequence } from '../types';

const R = { status: 'draft' as const, note: '流程排序規準待臨床教師依各系統 SOP 審核。' };

/** Game 1：檢查流程排序（rank 為可接受的位置範圍；rules 提供違反時的理由） */
export const SEQUENCES: ExaminationSequence[] = [
  {
    id: 'seq-abdomen',
    system: 'abdomen',
    title: '一般腹部身體檢查',
    scenario: '考站任務：為一位腹部不適、生命徵象穩定的成人進行腹部身體檢查（無明確局部疼痛）。',
    actions: [
      { id: 'intro', text: '自我介紹、確認身分、說明並取得同意', stage: 'identity', rank: [0, 1] },
      { id: 'hand', text: '手部衛生', stage: 'prepare', rank: [0, 2] },
      { id: 'pos', text: '拉簾、病人平躺、暴露乳頭線至恥骨上', stage: 'prepare', rank: [1, 2] },
      { id: 'insp', text: '視診：輪廓、皮膚、蠕動與搏動', technique: 'inspection', stage: 'perform', rank: [3, 3] },
      { id: 'ausc', text: '聽診：腸音、血管雜音', technique: 'auscultation', stage: 'perform', rank: [4, 4] },
      { id: 'perc', text: '叩診：四象限、肝臟大小', technique: 'percussion', stage: 'perform', rank: [5, 5] },
      { id: 'light', text: '淺觸診四象限', technique: 'palpation', stage: 'perform', rank: [6, 6] },
      { id: 'deep', text: '深觸診與肝脾觸診', technique: 'palpation', stage: 'perform', rank: [7, 7] },
      { id: 'finish', text: '協助整理衣物、感謝、手部衛生並報告', stage: 'complete', rank: [8, 8] },
    ],
    rules: [
      { before: 'intro', after: 'insp', why: '暴露與碰觸病人之前，需先說明並取得同意。' },
      { before: 'hand', after: 'ausc', why: '接觸病人前要完成手部衛生。' },
      { before: 'pos', after: 'insp', why: '視診需要適當體位與暴露。' },
      { before: 'insp', after: 'ausc', why: '每個系統都從不接觸病人的視診開始。' },
      { before: 'ausc', after: 'perc', why: '叩診與觸診可能改變腸蠕動，腹部教學上常先聽診。' },
      { before: 'ausc', after: 'light', why: '觸診可能改變腸音，先聽診。' },
      { before: 'light', after: 'deep', why: '先淺後深：先找出壓痛與肌肉防禦，再深觸診。' },
      { before: 'deep', after: 'finish', why: '完成檢查後才整理與報告。' },
    ],
    takeaway: '腹部：視 → 聽 → 叩 → 觸，先淺後深。這是腹部的教學順序，不是所有系統都一樣。',
    review: R,
  },
  {
    id: 'seq-abdomen-pain',
    system: 'abdomen',
    title: '右下腹痛病人的觸診順序',
    scenario: '同一個腹部檢查，但病人主訴右下腹痛。請排出「觸診」的區域順序。',
    actions: [
      { id: 'luq', text: '左上腹淺觸診', technique: 'palpation', stage: 'perform', rank: [0, 1] },
      { id: 'llq', text: '左下腹淺觸診', technique: 'palpation', stage: 'perform', rank: [0, 2] },
      { id: 'ruq', text: '右上腹淺觸診', technique: 'palpation', stage: 'perform', rank: [0, 2] },
      { id: 'rlq', text: '右下腹（疼痛處）淺觸診', technique: 'palpation', stage: 'perform', rank: [3, 3] },
      { id: 'deep', text: '深觸診（疼痛處最後、動作輕柔）', technique: 'palpation', stage: 'perform', rank: [4, 4] },
    ],
    rules: [
      { before: 'luq', after: 'rlq', why: '從離疼痛最遠的部位開始，最後才檢查疼痛處。' },
      { before: 'llq', after: 'rlq', why: '疼痛處最後檢查，避免一開始就引起疼痛與肌肉防禦。' },
      { before: 'ruq', after: 'rlq', why: '疼痛處最後檢查。' },
      { before: 'rlq', after: 'deep', why: '先淺後深。' },
    ],
    takeaway: '相同系統，情境不同順序也不同：疼痛處最後、先淺後深。',
    review: R,
  },
  {
    id: 'seq-cardio',
    system: 'cardiovascular',
    title: '心臟檢查（對照：與腹部的順序不同）',
    scenario: '為一位成人進行心前區身體檢查。',
    actions: [
      { id: 'prep', text: '說明、同意、手部衛生、適當暴露（維護隱私）', stage: 'identity', rank: [0, 0] },
      { id: 'insp', text: '視診：心前區、頸靜脈', technique: 'inspection', stage: 'perform', rank: [1, 1] },
      { id: 'palp', text: '觸診：心尖搏動、震顫', technique: 'palpation', stage: 'perform', rank: [2, 2] },
      { id: 'ausc', text: '聽診：主動脈、肺動脈、三尖瓣、僧帽瓣區', technique: 'auscultation', stage: 'perform', rank: [3, 3] },
      { id: 'finish', text: '整理衣物、感謝、報告', stage: 'complete', rank: [4, 4] },
    ],
    rules: [
      { before: 'prep', after: 'insp', why: '先說明與取得同意。' },
      { before: 'insp', after: 'palp', why: '視診在前。' },
      { before: 'palp', after: 'ausc', why: '心臟教學上常先觸診找到心尖，再依序聽診；觸診不會改變心音。' },
    ],
    takeaway: '心臟常採視 → 觸 → 聽；與腹部不同，說明了「沒有全站唯一的固定順序」。',
    review: R,
  },
];

export const getSequence = (id: string) => SEQUENCES.find((s) => s.id === id);
