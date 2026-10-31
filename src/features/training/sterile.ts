/**
 * SterileFieldManager / ContaminationEventTracker 的共用資料結構
 * 各技能自行決定污染來源與補救方式，狀態判斷與呈現方式共用。
 */
export type SterileStatus = 'idle' | 'preparing' | 'sterile' | 'contaminated' | 'recognized' | 'remediated';

export const STERILE_STATUS_LABEL: Record<SterileStatus, { label: string; cls: string; icon: string }> = {
  idle: { label: '未開始無菌準備', cls: 'bg-slate-100 text-slate-600', icon: '⚪' },
  preparing: { label: '正在準備', cls: 'bg-sky-100 text-sky-800', icon: '🔵' },
  sterile: { label: '無菌狀態正常', cls: 'bg-emerald-100 text-emerald-800', icon: '🟢' },
  contaminated: { label: '發生污染', cls: 'bg-rose-100 text-rose-800', icon: '🔴' },
  recognized: { label: '已辨識污染・待補救', cls: 'bg-amber-100 text-amber-900', icon: '🟠' },
  remediated: { label: '已完成適當補救', cls: 'bg-teal-100 text-teal-800', icon: '🟢' },
};

export interface ContaminationRecord<Source extends string = string> {
  id: number;
  source: Source;
  reason: string;
  stepId: string;
  t: number;
  /** 學員自己標示「發現污染」 */
  recognized: boolean;
  /** 已完成對應的補救（換手套、換器材…） */
  remediated: boolean;
  /** 污染後未補救就繼續執行無菌操作 */
  usedWhileContaminated: boolean;
}

/** 依污染紀錄推導目前的無菌狀態 */
export function sterileStatusOf(records: ContaminationRecord[], ready: boolean, preparing: boolean, lastWasRemedy: boolean): SterileStatus {
  const open = records.filter((r) => !r.remediated);
  if (open.length) return open.some((r) => !r.recognized) ? 'contaminated' : 'recognized';
  if (lastWasRemedy && records.length) return 'remediated';
  if (ready) return 'sterile';
  return preparing ? 'preparing' : 'idle';
}

/** 穿戴無菌手套（閉合原則）的決策點：技能共用 */
export interface GloveDecision {
  id: string;
  title: string;
  prompt: string;
  options: { id: string; text: string; correct: boolean; why: string }[];
}

export const STERILE_GLOVE_DECISIONS: GloveDecision[] = [
  {
    id: 'open',
    title: '打開手套包',
    prompt: '外包裝已撕開，要怎麼攤開內包裝紙？',
    options: [
      { id: 'edge', text: '捏住內包裝紙外緣的摺角向兩側攤開', correct: true, why: '內包裝紙中央接觸手套，只碰外緣摺角可保持手套周圍無菌。' },
      { id: 'center', text: '把手伸進內包裝紙中央攤平', correct: false, why: '裸手碰觸內包裝紙中央，會污染放置手套的無菌面。' },
    ],
  },
  {
    id: 'first',
    title: '戴第一隻手套',
    prompt: '用裸手拿起第一隻手套，要捏哪裡？',
    options: [
      { id: 'inner-cuff', text: '捏住反折袖口的內面（會貼著皮膚的那一面）', correct: true, why: '反折內面之後會貼著皮膚，本來就不需要保持無菌，裸手碰觸它是安全的。' },
      { id: 'outer-palm', text: '抓住手套掌心的外表面', correct: false, why: '手套外表面之後會接觸無菌區與導尿管，裸手一碰就污染了。' },
    ],
  },
  {
    id: 'second',
    title: '戴第二隻手套',
    prompt: '第一隻已戴好，第二隻要怎麼拿？',
    options: [
      { id: 'under-cuff', text: '戴好手套的四指伸入第二隻的反折袖口「下方」撐開套入', correct: true, why: '反折下方是手套外表面，戴手套的手碰外表面＝無菌對無菌。' },
      { id: 'inner-cuff-gloved', text: '用戴好手套的手捏住第二隻反折袖口的內面', correct: false, why: '反折內面會貼皮膚、屬非無菌面，戴手套的手碰到就被污染。' },
      { id: 'bare-outer', text: '用還沒戴手套的手抓第二隻手套的外表面', correct: false, why: '裸手碰觸手套外表面，第二隻手套被污染。' },
    ],
  },
  {
    id: 'adjust',
    title: '整理反折',
    prompt: '最後要把兩手的反折翻上來，怎麼做？',
    options: [
      { id: 'gloved-under', text: '戴手套的手指伸入另一手反折下方往上翻，不碰手腕皮膚', correct: true, why: '只接觸手套外表面，雙手維持無菌。' },
      { id: 'touch-skin', text: '直接把反折往上拉，手指順勢碰到手腕皮膚', correct: false, why: '手腕皮膚不是無菌的，碰觸後手套即被污染。' },
    ],
  },
];

/** 手部衛生的搓揉部位（依 WHO 乾洗手步驟示意；實施細節依院內感染管制規範） */
export const HAND_AREAS = [
  { id: 'palms', title: '掌心對掌心', desc: '兩手掌心相對搓揉' },
  { id: 'backs', title: '手背', desc: '掌心搓揉另一手手背，手指交錯' },
  { id: 'between', title: '指縫', desc: '掌心相對，手指交錯搓揉指縫' },
  { id: 'fingerBacks', title: '指背', desc: '手指彎曲，指背在另一手掌心搓揉' },
  { id: 'thumbs', title: '拇指', desc: '一手握住另一手拇指旋轉搓揉' },
  { id: 'tips', title: '指尖', desc: '指尖在另一手掌心旋轉搓揉' },
] as const;

export type HandAreaId = (typeof HAND_AREAS)[number]['id'];
