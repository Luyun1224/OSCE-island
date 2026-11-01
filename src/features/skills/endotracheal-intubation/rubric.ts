import type { RubricItemDef, RubricScore, TrainingEvent } from '../../training/types';
import { AUSC_LABEL, REQUIRED_AUSC, REQUIRED_KIT, TUBE_SIZE } from './caseData';
import { breathRate, rateOk, trayItems, tooDeep, tooShallow, type AWState } from './engine';
import { AIRWAY_CONFIG as CFG } from './rubricConfig';

/**
 * AssessmentRubric：氣管插管 14 項評分規準
 * - criteria 逐字取自《氣管插管(1).pdf》第 4–5 頁考官指引「評分說明」
 * - allowedScores 依第 3 頁評分表（1 分欄位塗黑者只有 0／2）；評分表與考官指引不一致者標示 reviewNote，待教師確認，不自行補齊或更改
 * - observableEvents：數位互動中用來判斷的事件；requiresTeacherAssessment 以 observability: 'proxy' 表示
 * - 整體表現 1–5 分由教師評估，不與 28 分相加
 */
export interface RubricContext {
  state: AWState;
  events: TrainingEvent[];
}

const r = (score: RubricScore, evidence: string[], missing: string[]) => ({ score, evidence, missing });
const finalAttempt = (s: AWState) => s.final ?? s.attempt;

export const AIRWAY_RUBRIC: RubricItemDef<RubricContext>[] = [
  {
    id: 1,
    title: '準備插管時所需的物品：喉頭鏡、氣管內管、stylet、10cc 空針、咬口器、固定膠帶',
    criteria: { 2: '以上備品皆有準備', 1: '以上備品有一項未準備', 0: '以上備品 2 項以上未準備，或未備喉頭鏡' },
    observability: 'digital',
    observableEvents: ['tray'],
    sourcePage: 4,
    reviewStatus: 'reviewed',
    stepIds: ['prep'],
    evaluate: ({ state }) => {
      const tray = trayItems(state);
      const ok = REQUIRED_KIT.filter((k) => k.ok(tray));
      const miss = REQUIRED_KIT.filter((k) => !k.ok(tray));
      const noScope = !REQUIRED_KIT[0].ok(tray);
      return r(noScope || miss.length >= 2 ? 0 : miss.length === 1 ? 1 : 2, ok.map((k) => `已備：${k.label}`), miss.map((k) => `未備：${k.label}`));
    },
  },
  {
    id: 2,
    title: '正確選擇氣管內管大小（內徑 7.0 或 7.5）',
    criteria: { 2: '2 項均做到', 1: '只做到 1 項', 0: '2 項均未做到' },
    observability: 'digital',
    observableEvents: ['tube'],
    sourcePage: 4,
    reviewStatus: 'pending-teacher',
    reviewNote: '考官指引寫「2 項均做到」，但未說明是哪 2 項。本模擬僅依「選擇內徑 7.0 或 7.5」判斷（符合給 2 分、不符合給 0 分），不自行補充第 2 項。',
    stepIds: ['prep'],
    evaluate: ({ state }) => {
      if (!state.tube.size) return r(0, [], ['未選擇氣管內管']);
      const size = TUBE_SIZE[state.tube.size]!;
      const ok = CFG.caseRequirement.tubeSizes.includes(size);
      return r(ok ? 2 : 0, ok ? [`選擇 ID ${size.toFixed(1)}`] : [], ok ? [] : [`選擇 ID ${size.toFixed(1)}（教案：7.0 或 7.5）`]);
    },
  },
  {
    id: 3,
    title: '正確組裝喉頭鏡及檢查喉頭鏡燈泡是否會亮',
    criteria: { 2: '2 項均做到', 1: '只做到 1 項', 0: '2 項均未做到' },
    observability: 'digital',
    observableEvents: ['assemble', 'light'],
    sourcePage: 4,
    reviewStatus: 'reviewed',
    stepIds: ['prep'],
    evaluate: ({ state }) => {
      const parts: [boolean, string][] = [
        [state.scope.assembled, '組裝喉頭鏡'],
        [state.scope.lightChecked, '檢查燈泡'],
      ];
      const n = parts.filter((p) => p[0]).length;
      return r(n === 2 ? 2 : n === 1 ? 1 : 0, parts.filter((p) => p[0]).map((p) => p[1]), parts.filter((p) => !p[0]).map((p) => `未${p[1]}`));
    },
  },
  {
    id: 4,
    title: '確認氣管內管的 cuff 是否完整，並於管端塗抹潤滑液',
    criteria: { 2: '有用空針確認氣管內管的 cuff 是否完整，且確實將潤滑液塗抹於管端', 1: '僅做到其中一項（如僅確認 cuff 完整，或僅塗抹潤滑液）', 0: '兩項均未做到' },
    observability: 'digital',
    observableEvents: ['cuff-check', 'lube'],
    sourcePage: 4,
    reviewStatus: 'reviewed',
    stepIds: ['prep'],
    evaluate: ({ state }) => {
      const parts: [boolean, string][] = [
        [state.tube.cuffChecked, '用空針確認 cuff 完整'],
        [state.tube.lubed, '管端塗抹潤滑液'],
      ];
      const n = parts.filter((p) => p[0]).length;
      return r(n === 2 ? 2 : n === 1 ? 1 : 0, parts.filter((p) => p[0]).map((p) => p[1]), parts.filter((p) => !p[0]).map((p) => `未${p[1]}`));
    },
  },
  {
    id: 5,
    title: '正確扣袋瓣罩之面罩（面罩需尖端朝頭側並避免壓到眼睛，單雙手操作皆可）',
    criteria: { 2: '面罩尖端朝頭側並避免壓到眼睛', 1: '只做到 1 項', 0: '2 項均未做到' },
    observability: 'proxy',
    physicalNote: '面罩密合手勢（E-C 手法等）需於實體模型評核。',
    observableEvents: ['mask'],
    sourcePage: 4,
    reviewStatus: 'reviewed',
    stepIds: ['bvm'],
    evaluate: ({ events }) => {
      const masks = events.filter((e) => e.code === 'mask');
      if (!masks.length) return r(0, [], ['未放置面罩']);
      const upside = events.some((e) => e.code === 'mask-upside');
      const eyes = events.some((e) => e.code === 'mask-eyes');
      const n = (upside ? 0 : 1) + (eyes ? 0 : 1);
      return r(n === 2 ? 2 : n === 1 ? 1 : 0, [upside ? '' : '尖端朝頭側', eyes ? '' : '未壓到眼睛'].filter(Boolean), [upside ? '面罩方向放反' : '', eyes ? '面罩壓到眼睛' : ''].filter(Boolean));
    },
  },
  {
    id: 6,
    title: '正確先以袋瓣罩吹氣給氧及正確吹氣速度（10-12 次/分）',
    criteria: { 2: '正確給氣（胸腔有明顯及規律起伏）且適當給氣速度（10-12 次/分）', 1: '只做到一項', 0: '兩項均未做到' },
    observability: 'proxy',
    physicalNote: '網頁以擠壓時間點計算速度，以面罩方向／位置／固定判斷是否有胸廓起伏；實際潮氣量與手感需實體評核。',
    observableEvents: ['squeeze'],
    sourcePage: 4,
    reviewStatus: 'reviewed',
    stepIds: ['bvm'],
    evaluate: ({ state }) => {
      const b = state.preBreaths.length;
      if (!b) return r(0, [], ['插管前沒有以袋瓣罩給氧']);
      const rise = state.preRise >= Math.min(3, b) && state.preRise >= b / 2;
      const rate = breathRate(state.preBreaths);
      const okRate = rateOk(rate);
      const n = (rise ? 1 : 0) + (okRate ? 1 : 0);
      const rateText = rate === null ? `擠壓 ${b} 次，次數不足以計算速度` : `給氣速度約 ${rate.toFixed(1)} 次/分`;
      return r(n === 2 ? 2 : n === 1 ? 1 : 0, [rise ? '胸廓有明顯起伏' : '', okRate ? rateText : ''].filter(Boolean), [rise ? '' : '胸廓起伏不明顯（面罩方向、位置或固定不正確）', okRate ? '' : `${rateText}（教案：10–12 次/分）`].filter(Boolean));
    },
  },
  {
    id: 7,
    title: '正確將頭擺成 sniffing position',
    criteria: { 2: '有執行擺位動作且擺位正確', 0: '未執行擺位動作或擺位錯誤' },
    allowedScores: [0, 2],
    observability: 'proxy',
    physicalNote: '擺位以示意選項呈現，實際手法需教師於模型評核。',
    observableEvents: ['position'],
    sourcePage: 5,
    reviewStatus: 'reviewed',
    stepIds: ['position'],
    evaluate: ({ state }) => {
      if (!state.head.confirmed) return r(0, [], ['未執行擺位動作']);
      return state.head.confirmedSniffing ? r(2, ['擺成 sniffing position'], []) : r(0, ['有執行擺位'], ['擺位不是 sniffing position']);
    },
  },
  {
    id: 8,
    title: '正確手持喉頭鏡及確實執行插管',
    criteria: { 2: '以左手把持喉頭鏡且插管時以將喉頭鏡適當上提方式進行插管', 1: '只做到一項', 0: '兩項均做錯' },
    observability: 'proxy',
    physicalNote: '持握位置、上提方向與力道需於實體模型由教師評核；網頁僅記錄選擇。',
    observableEvents: ['hand', 'lift', 'teeth-lever'],
    safetyCritical: true,
    sourcePage: 5,
    reviewStatus: 'reviewed',
    stepIds: ['laryngoscopy', 'intubate'],
    evaluate: ({ events, state }) => {
      if (!state.attempts) return r(0, [], ['未執行插管']);
      const left = !events.some((e) => e.code === 'right-hand') && events.some((e) => e.code === 'hand');
      const lift = !events.some((e) => e.code === 'teeth-lever') && events.some((e) => e.code === 'lift');
      const n = (left ? 1 : 0) + (lift ? 1 : 0);
      return r(n === 2 ? 2 : n === 1 ? 1 : 0, [left ? '左手持喉頭鏡' : '', lift ? '適當上提' : ''].filter(Boolean), [left ? '' : '未以左手持喉頭鏡', lift ? '' : '以牙齒為支點撬動或未上提'].filter(Boolean));
    },
  },
  {
    id: 9,
    title: '氣管內管置入後深度正確（嘴角刻度約 20 - 22 cm）',
    criteria: { 2: '深度正確', 1: '深度不正確（太深或太淺）', 0: '未確認深度' },
    observability: 'digital',
    observableEvents: ['depth-read'],
    sourcePage: 5,
    reviewStatus: 'reviewed',
    stepIds: ['intubate'],
    evaluate: ({ state }) => {
      const a = finalAttempt(state);
      if (!a.depthRead || a.depth === null) return r(0, [], ['未確認深度']);
      const ok = !tooDeep(a) && !tooShallow(a);
      return r(ok ? 2 : 1, [`嘴角刻度 ${a.depth} cm`], ok ? [] : [`深度${tooDeep(a) ? '太深' : '太淺'}（教案：約 20–22 cm）`]);
    },
  },
  {
    id: 10,
    title: '(1)如插管時有置入通條，將通條移除 (2)將氣管內管的 cuff 充氣',
    criteria: { 2: '執行正確', 1: '僅完成其中一項', 0: '未做到' },
    observability: 'digital',
    observableEvents: ['stylet-out', 'cuff-in'],
    sourcePage: 5,
    reviewStatus: 'reviewed',
    stepIds: ['tubeCare'],
    evaluate: ({ state }) => {
      const a = finalAttempt(state);
      if (!state.attempts) return r(0, [], ['未插管']);
      const styletOk = state.tube.stylet === 'none' || a.styletRemoved;
      const parts: [boolean, string][] = [
        [styletOk, state.tube.stylet === 'none' ? '未使用通條' : '移除通條'],
        [a.cuffInflated, 'cuff 充氣'],
      ];
      const n = parts.filter((p) => p[0]).length;
      return r(n === 2 ? 2 : n === 1 ? 1 : 0, parts.filter((p) => p[0]).map((p) => p[1]), parts.filter((p) => !p[0]).map((p) => `未${p[1]}`));
    },
  },
  {
    id: 11,
    title: '插管後接上 Ambu bag，壓袋確認胸廓是否有起伏',
    criteria: { 2: '插管完成後，優先正確連接 Ambu bag 壓袋，並以視覺確認兩側胸廓有明顯且規律起伏', 0: '未連接 Ambu bag、未壓袋，或未觀察胸廓起伏即直接進行其他處置' },
    observability: 'digital',
    observableEvents: ['bag', 'bag-squeeze', 'chest'],
    sourcePage: 5,
    reviewStatus: 'pending-teacher',
    reviewNote: '評分表第 3 頁此項的 1 分欄位未塗黑，但考官指引只有「完全做到／沒有做到」兩種說明；本模擬依考官指引只給 0 或 2 分，待教師確認。',
    stepIds: ['confirm'],
    evaluate: ({ state }) => {
      const a = finalAttempt(state);
      if (!a.bagConnected) return r(0, [], ['未連接 Ambu bag']);
      if (!a.postBreaths) return r(0, ['已連接 Ambu bag'], ['未壓袋']);
      if (!a.chestObserved) return r(0, ['已連接並壓袋'], ['未觀察胸廓起伏']);
      if (a.otherBeforeChest) return r(0, ['已觀察胸廓'], ['觀察胸廓前已先進行其他處置']);
      return r(2, ['優先接上 Ambu bag 壓袋並觀察胸廓'], []);
    },
  },
  {
    id: 12,
    title: '正確聽診確認插管位置，包含胃部、雙側肺尖及雙側肺底共五點',
    criteria: { 2: '於壓袋通氣同時，正確使用聽診器確認五點位置（必須包含胃部、雙側肺尖及雙側肺底）', 1: '聽診位置有一至兩個不正確', 0: '三至五個聽診位置不正確或未聽診' },
    allowedScores: [0, 2],
    observability: 'digital',
    observableEvents: ['ausc', 'ausc-wrong', 'ausc-novent'],
    sourcePage: 5,
    reviewStatus: 'pending-teacher',
    reviewNote: '評分表第 3 頁此項的 1 分欄位塗黑（只有 0／2），但考官指引列有「部分做到：聽診位置有一至兩個不正確」。本模擬依評分表只給 0 或 2 分（符合部分做到者會顯示為 0 分並註明），待教師確認。',
    stepIds: ['confirm'],
    evaluate: ({ state }) => {
      const a = finalAttempt(state);
      const done = REQUIRED_AUSC.filter((p) => a.ausc.includes(p));
      const wrong = REQUIRED_AUSC.length - done.length;
      const missing = REQUIRED_AUSC.filter((p) => !a.ausc.includes(p)).map((p) => `${AUSC_LABEL[p]}未於壓袋通氣時聽診`);
      if (a.wrongAusc.length) missing.push(`聽診了非教案位置：${a.wrongAusc.map((p) => AUSC_LABEL[p]).join('、')}`);
      if (wrong >= 1 && wrong <= 2) missing.push('（依考官指引屬「部分做到」，評分表無 1 分欄位）');
      return r(wrong === 0 ? 2 : wrong <= 2 ? 1 : 0, done.map((p) => `已聽診${AUSC_LABEL[p]}`), missing);
    },
  },
  {
    id: 13,
    title: '固定氣管內管',
    criteria: { 2: '有用膠（布）帶固定氣管內管', 0: '沒有固定氣管內管或固定方式不正確' },
    allowedScores: [0, 2],
    observability: 'proxy',
    physicalNote: '固定的鬆緊與方式需教師實體評核。',
    observableEvents: ['secured'],
    sourcePage: 5,
    reviewStatus: 'reviewed',
    stepIds: ['secure'],
    evaluate: ({ state }) => (state.secured.tied ? r(2, ['以固定帶固定氣管內管'], []) : r(0, [], [state.secured.esophagealBlocked ? '嘗試固定食道插管（安全中止）' : '沒有固定氣管內管'])),
  },
  {
    id: 14,
    title: '插管位置正確',
    criteria: { 2: '第一次插管位置即正確', 1: '執行第二次插管位置才正確', 0: '執行三次以上的插管位置才正確，或一直插管不成功' },
    observability: 'digital',
    observableEvents: ['intubate', 'confirmed', 'secured'],
    safetyCritical: true,
    sourcePage: 5,
    reviewStatus: 'reviewed',
    stepIds: ['intubate', 'confirm'],
    evaluate: ({ state }) => {
      const n = state.firstSuccessAttempt;
      if (n === null) return r(0, [], [state.attempts ? `嘗試 ${state.attempts} 次，未確認氣管內管位置正確` : '未插管']);
      return r(n === 1 ? 2 : n === 2 ? 1 : 0, [`第 ${n} 次插管位置正確（模擬）`], n === 1 ? [] : [`共嘗試 ${state.attempts} 次`]);
    },
  },
];
