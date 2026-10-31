import type { RubricItemDef, RubricScore, TrainingEvent } from '../../training/types';
import { COMM_OPTION_MAP, COMM_TAG_LABEL, WASTE, type CommTag } from './caseData';
import { availableWaste, lubeFromTip, type CTState } from './engine';
import { CATHETER_RUBRIC_CONFIG as CFG } from './rubricConfig';

/**
 * AssessmentRubric：導尿管置放 14 項評分規準
 * - criteria 逐字取自《技術操作－導尿管置放.pdf》考官指引「評分說明」
 * - allowedScores 依原評分表：第 7、11、12 項只有 0／2（評分表中 1 分欄位為塗黑）
 * - evaluate() 只把數位互動事件對應到原規準；網頁無法觀察的操作品質標示為「需教師實體評核」（proxy）
 * - 整體表現 1–5 分由教師評估，不與 28 分相加
 */
export interface RubricContext {
  state: CTState;
  events: TrainingEvent[];
}

const r = (score: RubricScore, evidence: string[], missing: string[]) => ({ score, evidence, missing });
const prepBreaches = (s: CTState) => s.contaminations.filter((c) => c.stepId === 'prep');

export const CATHETER_RUBRIC: RubricItemDef<RubricContext>[] = [
  {
    id: 1,
    title: '說明來意，安撫病人、解釋要做的技術',
    criteria: { 2: '有做到上述與病人互動的表現，且對話溫和', 1: '沒有完全做到與病人互動的表現，或有做到但對話不耐煩', 0: '完全沒有與病人的互動' },
    observability: 'proxy',
    physicalNote: '本版為選項式對話，實際語氣、眼神與表達需教師實體評核。',
    stepIds: ['greet'],
    evaluate: ({ state }) => {
      const chosen = state.comm.map((id) => COMM_OPTION_MAP[id]);
      if (!chosen.length) return r(0, [], ['沒有與病人互動']);
      const need: CommTag[] = ['purpose', 'reassure', 'explain'];
      const covered = need.filter((t) => chosen.some((o) => o.tags.includes(t) && o.tone === 'warm'));
      const impatient = chosen.some((o) => o.tone === 'impatient');
      const jargon = chosen.some((o) => o.tone === 'jargon');
      const missing = need.filter((t) => !covered.includes(t)).map((t) => `未做到：${COMM_TAG_LABEL[t]}`);
      if (impatient) missing.push('對話出現不耐煩的語氣');
      if (jargon) missing.push('使用病人聽不懂的術語');
      return r(covered.length === 3 && !impatient ? 2 : 1, covered.map((t) => `有${COMM_TAG_LABEL[t]}`), missing);
    },
  },
  {
    id: 2,
    title: '治療病患前洗手',
    criteria: { 2: '治療病患前有洗手，且洗手方法正確', 1: '治療病患前有洗手，但洗手方法不正確', 0: '治療病患前沒有洗手' },
    observability: 'proxy',
    physicalNote: '網頁以搓揉部位完整性代替；實際搓揉手法與時間需教師實體評核。',
    stepIds: ['hygieneBefore'],
    evaluate: ({ state }) => {
      const h = state.hygiene.before;
      if (!h || !h.beforeContact) return r(0, [], [h ? '開始接觸病人或無菌操作後才洗手' : '治療病患前沒有洗手']);
      const complete = h.areas.length === 6;
      return r(complete ? 2 : 1, ['接觸病人前完成乾洗手'], complete ? [] : [`搓揉部位不完整（${h.areas.length}/6）`]);
    },
  },
  {
    id: 3,
    title: '導尿前物品的準備',
    criteria: {
      2: '(1)打開導尿包後，準備導尿管、倒入潤滑劑、消毒棉籤(或棉花/鑷子)、取用消毒液等步驟動作完整(2)過程中有注意無菌操作',
      1: '有注意無菌操作，但物品的準備不周全',
      0: '沒有注意無菌操作',
    },
    observability: 'digital',
    stepIds: ['prep'],
    evaluate: ({ state }) => {
      const s = state;
      const parts: [boolean, string][] = [
        [s.kit.onTable && s.kit.flaps.length === 4, '打開導尿包'],
        [s.items.catheter === 'field' || s.catheter.pos !== 'none', '準備導尿管'],
        [s.kit.jelly, '倒入潤滑劑'],
        [s.kit.iodine, CFG.antisepticProvidedByAssistant ? '消毒液（考場由護理人員提供）' : '消毒棉枝取用消毒液'],
      ];
      const done = parts.filter((p) => p[0]).map((p) => p[1]);
      const missing = parts.filter((p) => !p[0]).map((p) => `未完成：${p[1]}`);
      const breaches = prepBreaches(s);
      if (breaches.length) return r(0, done, [...breaches.map((b) => `未注意無菌：${b.reason}`), ...missing]);
      if (!done.length) return r(0, [], ['沒有進行導尿前物品準備']);
      return r(missing.length ? 1 : 2, done, missing);
    },
  },
  {
    id: 4,
    title: '戴無菌手套',
    criteria: { 2: '有戴無菌手套，且方法正確', 1: '有戴無菌手套，但方法不正確', 0: '沒有戴無菌手套或有污染但未立即更換' },
    observability: 'proxy',
    physicalNote: '網頁以閉合原則的決策點代替；實際穿戴手法需教師實體評核。',
    stepIds: ['gloves'],
    evaluate: ({ state }) => {
      const g = state.gloves;
      if (!g.everSterile) return r(0, [], [g.status === 'exam' ? '使用檢診手套（非無菌）' : '沒有戴無菌手套']);
      const gloveRecs = state.contaminations.filter((c) => c.source === 'gloves');
      const notChanged = gloveRecs.filter((c) => c.usedWhileContaminated || !c.remediated);
      if (notChanged.length) return r(0, ['有戴無菌手套'], notChanged.map((c) => `手套污染但未立即更換：${c.reason}`));
      const donning = gloveRecs.filter((c) => c.stepId === 'gloves');
      if (!g.donningClean || donning.length) return r(1, ['有戴無菌手套'], ['穿戴方法不正確（穿戴過程污染）']);
      const changed = gloveRecs.length;
      return r(2, ['以閉合原則戴上無菌手套', ...(changed ? [`手套污染 ${changed} 次皆立即更換`] : [])], []);
    },
  },
  {
    id: 5,
    title: '消毒程序',
    criteria: { 2: '有消毒，且有遵守無菌技術', 1: '有消毒，但沒有遵守無菌技術', 0: '沒有消毒' },
    observability: 'proxy',
    physicalNote: '消毒範圍、方向與藥劑依院內感染管制規範，需教師實體評核。',
    stepIds: ['disinfect'],
    evaluate: ({ state }) => {
      const st = state.strokes.filter((x) => x.zones.length);
      if (!st.length) return r(0, [], ['沒有消毒']);
      const bad = st.filter((x) => !x.sterileOk);
      const reasons = new Set<string>();
      for (const b of bad) {
        if (!b.startAtMeatus) reasons.add('未從尿道口開始');
        if (b.backtrack) reasons.add('棉枝回到已消毒的中心');
        else if (!b.outward) reasons.add('由外往內消毒');
      }
      if (bad.length && reasons.size === 0) reasons.add('消毒時手套或導尿包不是無菌狀態');
      return r(bad.length ? 1 : 2, [`使用 ${st.length} 支棉枝消毒`], [...reasons]);
    },
  },
  {
    id: 6,
    title: '無菌鋪單',
    criteria: { 2: '有鋪洞巾，且方法正確，遵從無菌技術原則', 1: '有鋪洞巾，但方法不正確，沒有遵從無菌技術原則', 0: '沒有鋪洞巾' },
    observability: 'digital',
    stepIds: ['drape'],
    evaluate: ({ state }) => {
      const d = state.drape;
      if (!d.placed && !d.liftCount) return r(0, [], ['沒有鋪洞巾']);
      const issues: string[] = [];
      if (!d.sterileGloves) issues.push('鋪單時手套不是無菌狀態');
      if (d.offset > CFG.drape.alignTolerance) issues.push('洞巾開口未對準');
      if (d.inwardDrag) issues.push('洞巾接觸皮膚後又拿起調整');
      return r(issues.length ? 1 : 2, ['有鋪洞巾'], issues);
    },
  },
  {
    id: 7,
    title: '洞巾鋪設與消毒程序之順序',
    criteria: { 2: '遵守先消毒後鋪洞巾之順序', 0: '鋪洞巾後才進行消毒' },
    allowedScores: [0, 2],
    observability: 'digital',
    stepIds: ['disinfect', 'drape'],
    evaluate: ({ state }) => {
      const d = state.drape;
      const disinfected = state.strokes.some((x) => x.zones.length);
      if (!d.placed && !d.liftCount) return r(0, [], ['未鋪洞巾，無法判定順序']);
      if (!disinfected) return r(0, [], ['未消毒，無法判定順序']);
      if (d.beforeDisinfect) return r(0, [], ['鋪洞巾後才進行消毒']);
      return r(2, ['先消毒後鋪洞巾'], []);
    },
  },
  {
    id: 8,
    title: '潤滑劑塗抹',
    criteria: { 2: '有塗抹潤滑劑，且有塗抹到尿管的前半段（指前二分之一，20-25cm 左右）', 1: '有塗抹潤滑劑，但只有尿管尖端塗抹而已', 0: '沒有塗抹潤滑劑' },
    observability: 'digital',
    stepIds: ['lubricate'],
    evaluate: ({ state }) => {
      const reach = lubeFromTip(state.catheter.lube);
      if (!state.catheter.lube.length) return r(0, [], ['沒有塗抹潤滑劑']);
      if (reach >= CFG.lubrication.targetFraction) return r(2, [`由尖端塗抹約 ${Math.round(reach * 100)}% 管長`], []);
      return r(1, ['有塗抹潤滑劑'], [reach === 0 ? '潤滑未從尖端開始' : `只塗到尖端附近（約 ${Math.round(reach * 100)}%），未達${CFG.lubrication.label}`]);
    },
  },
  {
    id: 9,
    title: '正確放入導尿管',
    criteria: { 2: '導尿管緩緩置入至尿管末端', 1: '非緩慢置入導尿管，或未放至尿管末端', 0: '既非緩慢置入導尿管，且未放至尿管末端' },
    observability: 'proxy',
    physicalNote: '網頁以推進速度與模擬事件代替；實際手感、角度與置入深度需教師實體評核。',
    stepIds: ['insert'],
    evaluate: ({ state }) => {
      const c = state.catheter;
      if (c.maxDepth === 0) return r(0, [], ['沒有置入導尿管']);
      const slow = c.fastEvents === 0 && !c.forced;
      const toEnd = c.maxDepth >= 1;
      const missing: string[] = [];
      if (!slow) missing.push(c.forced ? '遇阻力仍強行推進' : `推進過快 ${c.fastEvents} 次`);
      if (!toEnd) missing.push('未放至尿管末端');
      return r(slow && toEnd ? 2 : slow || toEnd ? 1 : 0, [slow ? '緩慢、受控地置入' : '', toEnd ? '置入至尿管末端（模擬）' : ''].filter(Boolean), missing);
    },
  },
  {
    id: 10,
    title: '水球打水、拉出尿管至定位',
    criteria: { 2: '打入 5-10cc 水球，並拉出尿管至定位（卡在膀胱頸處）', 1: '打入水球的水不足或過多，或尿管未拉出至定位', 0: '沒有打水入水球，亦未將尿管拉出至定位' },
    observability: 'digital',
    stepIds: ['balloon'],
    evaluate: ({ state }) => {
      const c = state.catheter;
      const okVol = c.balloonMl >= CFG.balloon.minMl && c.balloonMl <= CFG.balloon.maxMl;
      if (!c.balloonMl && !c.positioned) return r(0, [], ['沒有打水入水球，亦未拉出至定位']);
      const missing: string[] = [];
      if (!okVol) missing.push(`水球 ${c.balloonMl} mL（教案：${CFG.balloon.label}）`);
      if (!c.positioned) missing.push('尿管未拉出至定位');
      return r(okVol && c.positioned ? 2 : 1, [c.balloonMl ? `水球打入 ${c.balloonMl} mL` : '', c.positioned ? '拉出至定位（模擬）' : ''].filter(Boolean), missing);
    },
  },
  {
    id: 11,
    title: '連接尿管與尿袋',
    criteria: { 2: '尿管連接尿袋有做到無菌技術', 0: '尿管連接尿袋沒有做到無菌操作' },
    allowedScores: [0, 2],
    observability: 'digital',
    stepIds: ['connect'],
    evaluate: ({ state }) => {
      if (!state.bag.connected) return r(0, [], ['沒有連接尿管與尿袋']);
      return state.bag.connectedSterile ? r(2, ['以無菌技術連接尿袋'], []) : r(0, ['有連接尿袋'], ['連接時沒有維持無菌']);
    },
  },
  {
    id: 12,
    title: '固定尿管及尿袋',
    criteria: { 2: '有固定尿管及尿袋', 0: '沒有固定尿管及尿袋' },
    allowedScores: [0, 2],
    observability: 'digital',
    stepIds: ['connect'],
    evaluate: ({ state }) => {
      const tape = !!state.tape.site;
      const bag = !!state.bag.hang;
      const ev = [tape ? '已固定尿管' : '', bag ? '已固定尿袋' : ''].filter(Boolean);
      const missing = [tape ? '' : '尿管未固定', bag ? '' : '尿袋未固定'].filter(Boolean);
      return r(tape && bag ? 2 : 0, ev, missing);
    },
  },
  {
    id: 13,
    title: '廢棄物的處理',
    criteria: { 2: '感染性廢棄物全數丟入感染性垃圾桶', 1: '感染性廢棄物部分丟入感染性垃圾桶，部分丟入一般垃圾桶', 0: '感染性廢棄物全都未丟入感染性垃圾桶，或沒有處理的動作' },
    observability: 'digital',
    stepIds: ['disposal'],
    evaluate: ({ state }) => {
      const inf = availableWaste(state).filter((w) => WASTE[w].correct === 'infectious');
      if (!inf.length) return r(0, [], ['沒有處理的動作']);
      const right = inf.filter((w) => state.disposal[w] === 'infectious');
      const missing = inf.filter((w) => state.disposal[w] !== 'infectious').map((w) => `${WASTE[w].name}${state.disposal[w] ? '丟入一般垃圾桶' : '未處理'}`);
      return r(right.length === inf.length ? 2 : right.length ? 1 : 0, right.map((w) => `${WASTE[w].name} → 感染性`), missing);
    },
  },
  {
    id: 14,
    title: '治療病患後洗手',
    criteria: { 2: '治療病患後有洗手，且洗手方法正確', 1: '治療病患後有洗手，但洗手方法不確實', 0: '治療病患後沒有洗手' },
    observability: 'proxy',
    physicalNote: '網頁以搓揉部位完整性代替；實際手法需教師實體評核。',
    stepIds: ['hygieneAfter'],
    evaluate: ({ state }) => {
      const h = state.hygiene.after;
      if (!h) return r(0, [], ['治療病患後沒有洗手']);
      return r(h.areas.length === 6 ? 2 : 1, ['脫手套後完成乾洗手'], h.areas.length === 6 ? [] : [`搓揉部位不完整（${h.areas.length}/6）`]);
    },
  },
];
