import type { RubricItemDef, TrainingEvent } from '../../training/types';
import { NARRATION, WASTE, type WasteId } from './caseData';
import { analyzeDisinfection, isPerpendicular, stitchSpacings, spacingOk } from './geometry';
import { availableWaste, type WSState } from './engine';
import { dressingAnalysis } from './dressing';

/**
 * AssessmentRubric：傷口縫合 10 項評分規準
 * 0 / 1 / 2 說明逐字取自《傷口縫合.pdf》考官指引「評分說明」，達標條件不另行更改。
 * evaluate() 只把數位互動事件對應到原規準；無法由網頁觀察的部分以 observability 標示。
 */
export interface RubricContext {
  state: WSState;
  events: TrainingEvent[];
}

const has = (events: TrainingEvent[], pred: (e: TrainingEvent) => boolean) => events.some(pred);

export const WOUND_SUTURING_RUBRIC: RubricItemDef<RubricContext>[] = [
  {
    id: 1,
    title: '操作過程有口述操作步驟',
    criteria: { 2: '有口述消毒、鋪單、縫合、包紮其中三項以上', 1: '僅口述其中兩項', 0: '僅口述其中一項或沒有口述' },
    observability: 'proxy',
    physicalNote: '本版為選項式口述，實際語氣與表達需實體評核。',
    stepIds: ['disinfect', 'drape', 'suture', 'dressing'],
    evaluate: ({ state }) => {
      const scored = NARRATION.filter((n) => n.scored);
      // 「有口述」：選擇了說明該步驟的內容（適當或用語偏專業皆算有口述）
      const done = scored.filter((n) => {
        const r = state.narration[n.phase];
        return r && r.quality !== 'poor';
      });
      const count = done.length;
      return {
        score: count >= 3 ? 2 : count === 2 ? 1 : 0,
        evidence: done.map((n) => `有口述：${n.title}${state.narration[n.phase]?.quality === 'jargon' ? '（用語偏專業）' : ''}`),
        missing: scored.filter((n) => !done.includes(n)).map((n) => `未口述：${n.title}`),
      };
    },
  },
  {
    id: 2,
    title: '縫合前將物品準備妥當',
    criteria: { 2: '拆好縫針外包裝置入無菌區，過程中無破壞無菌區', 1: '動作過程破壞無菌區', 0: '未準備' },
    observability: 'digital',
    stepIds: ['prep'],
    evaluate: ({ state, events }) => {
      const prepared = state.items.needleSuture === 'field';
      const breaches = events.filter((e) => e.stepId === 'prep' && e.code === 'field-breach');
      if (!prepared) return { score: 0, evidence: [], missing: ['縫針縫線未拆包置入無菌區'] };
      return {
        score: breaches.length ? 1 : 2,
        evidence: ['縫針縫線已拆包置入無菌區'],
        missing: breaches.map((b) => `破壞無菌區：${b.message}`),
      };
    },
  },
  {
    id: 3,
    title: '正確穿戴無菌手套',
    criteria: { 2: '有穿戴且保持無菌', 1: '有穿戴但未保持無菌', 0: '未穿戴' },
    observability: 'proxy',
    physicalNote: '數位版以決策選擇代表穿戴手法，實際手套技術需實體確認。',
    stepIds: ['gloves'],
    evaluate: ({ state, events }) => {
      if (!state.gloves.everSterile) return { score: 0, evidence: [], missing: ['未穿戴無菌手套'] };
      // 縫合期間的污染歸屬第 6 項，此處計算穿戴過程與縫合以外階段的污染
      const breaches = events.filter((e) => (e.code === 'glove-donning-breach' || e.code === 'gloves-contaminated') && e.stepId !== 'suture');
      const remediated = has(events, (e) => e.code === 'change-gloves');
      return {
        score: breaches.length ? 1 : 2,
        evidence: ['已穿戴無菌手套', ...(breaches.length && remediated ? ['察覺後曾更換手套'] : [])],
        missing: breaches.map((b) => `未保持無菌：${b.message}`),
      };
    },
  },
  {
    id: 4,
    title: '正確執行消毒步驟',
    criteria: { 2: '由內而外消毒且範圍大於洞巾的洞', 1: '做到上述一項', 0: '均未做到' },
    observability: 'digital',
    stepIds: ['disinfect'],
    evaluate: ({ state }) => {
      const d = analyzeDisinfection(state.disinfection.strokes);
      const met = [d.insideOut, d.coversDrapeHole].filter(Boolean).length;
      return {
        score: met as 0 | 1 | 2,
        evidence: [...(d.insideOut ? ['由內而外消毒'] : []), ...(d.coversDrapeHole ? [`消毒範圍（約 ${d.coverageRadius.toFixed(1)} cm）大於洞巾開口`] : [])],
        missing: !d.started
          ? ['未執行消毒']
          : [
              ...(d.insideOut ? [] : [d.startDist > 1 ? '未從傷口處開始消毒' : d.inwardReturns ? `由外往內回擦 ${d.inwardReturns} 次` : '消毒未由傷口逐步向外擴展']),
              ...(d.coversDrapeHole ? [] : ['部分方向的消毒範圍未超過洞巾開口']),
            ],
      };
    },
  },
  {
    id: 5,
    title: '正確執行無菌鋪單',
    criteria: { 2: '正確以無菌方式鋪上洞巾，過程無破壞無菌區', 1: '動作過程破壞無菌區', 0: '未鋪單' },
    observability: 'digital',
    stepIds: ['drape'],
    evaluate: ({ state, events }) => {
      if (!state.drape.center) return { score: 0, evidence: [], missing: ['未鋪單'] };
      const breaches = events.filter((e) => e.stepId === 'drape' && e.kind === 'contamination');
      const offset = Math.hypot(state.drape.center.x, state.drape.center.y);
      const centered = offset <= 0.8;
      return {
        score: breaches.length ? 1 : 2,
        evidence: ['已鋪上洞巾', centered ? '洞巾開口對準傷口' : `洞巾開口偏離傷口中心約 ${offset.toFixed(1)} cm`],
        missing: breaches.map((b) => `破壞無菌區：${b.message}`),
      };
    },
  },
  {
    id: 6,
    title: '縫合過程遵守無菌原則',
    criteria: { 2: '全程保持無菌', 1: '曾破壞無菌，經察覺試圖補救', 0: '完全無視無菌原則' },
    observability: 'digital',
    stepIds: ['suture'],
    evaluate: ({ state, events }) => {
      if (!state.stitches.length) return { score: 0, evidence: [], missing: ['尚未完成任何一針，無法判定縫合過程'] };
      const breaches = events.filter((e) => e.stepId === 'suture' && e.kind === 'contamination');
      if (!breaches.length) return { score: 2, evidence: ['縫合全程保持無菌'], missing: [] };
      const firstBreach = breaches[0].id;
      const remediation = events.filter((e) => e.kind === 'remediation' && e.id > firstBreach);
      return {
        score: remediation.length ? 1 : 0,
        evidence: remediation.map((r) => `補救：${r.message}`),
        missing: breaches.map((b) => `無菌破壞：${b.message}`),
      };
    },
  },
  {
    id: 7,
    title: '傷口縫合動作流暢，打三個結',
    criteria: { 2: '進針出針角度垂直，且完成打三個結', 1: '做到上述一項', 0: '均未做到' },
    observability: 'proxy',
    physicalNote: '「動作流暢」、器械控制與實際角度需實體評核；本原型將「打三個結」解讀為每一針以三個單結完成打結。',
    stepIds: ['suture'],
    evaluate: ({ state }) => {
      const st = state.stitches;
      if (!st.length) return { score: 0, evidence: [], missing: ['尚未完成縫合'] };
      const badAngle = st.filter((s) => !isPerpendicular(s.entryAngle) || !isPerpendicular(s.exitAngle));
      const badKnot = st.filter((s) => s.throws.length < 3);
      const perpendicular = badAngle.length === 0;
      const knots = badKnot.length === 0;
      return {
        score: ([perpendicular, knots].filter(Boolean).length) as 0 | 1 | 2,
        evidence: [...(perpendicular ? ['每針進針、出針皆垂直'] : []), ...(knots ? ['每針皆完成三個結'] : [])],
        missing: [
          ...badAngle.map((s) => `第 ${st.indexOf(s) + 1} 針角度：進針 ${s.entryAngle}°／出針 ${s.exitAngle}°`),
          ...badKnot.map((s) => `第 ${st.indexOf(s) + 1} 針只打 ${s.throws.length} 個結`),
        ],
      };
    },
  },
  {
    id: 8,
    title: '傷口縫合整齊，每一針之間距恰當',
    criteria: { 2: '縫合三針以上且間距約一公分', 1: '做到上述一項', 0: '均未做到' },
    observability: 'proxy',
    physicalNote: '數位版以點選位置計算針距；實際皮緣對合與組織處理需實體評核。',
    stepIds: ['suture'],
    evaluate: ({ state }) => {
      const count = state.stitches.length;
      const gaps = stitchSpacings(state.stitches);
      const threePlus = count >= 3;
      const spacing = gaps.length > 0 && gaps.every(spacingOk);
      return {
        score: ([threePlus, spacing].filter(Boolean).length) as 0 | 1 | 2,
        evidence: [`完成 ${count} 針`, ...(gaps.length ? [`針距：${gaps.map((g) => g.toFixed(1)).join('、')} cm`] : [])],
        missing: [...(threePlus ? [] : ['未達三針']), ...(spacing ? [] : gaps.length ? ['部分針距不在約一公分'] : ['針數不足，無法形成針距'])],
      };
    },
  },
  {
    id: 9,
    title: '傷口覆蓋恰當',
    criteria: { 2: '紗布覆蓋且紙膠帶黏妥', 1: '做到上述一項', 0: '均未做到' },
    observability: 'digital',
    stepIds: ['dressing'],
    evaluate: ({ state }) => {
      const d = dressingAnalysis(state);
      return {
        score: ([d.covered, d.taped].filter(Boolean).length) as 0 | 1 | 2,
        evidence: [...(d.covered ? ['紗布完整覆蓋傷口'] : []), ...(d.taped ? [`紙膠帶 ${d.securedTapes} 條跨越紗布邊緣黏妥`] : [])],
        missing: [...(d.covered ? [] : [state.dressing.gauze ? '紗布未完整蓋住傷口' : '未以紗布覆蓋']), ...(d.taped ? [] : ['紙膠帶未黏妥（需至少兩條跨越紗布邊緣）'])],
      };
    },
  },
  {
    id: 10,
    title: '廢棄物正確處理',
    criteria: { 2: '尖銳物丟收集桶且感染性廢棄物丟紅筒', 1: '做到上述一項', 0: '均未做到' },
    observability: 'digital',
    stepIds: ['disposal'],
    evaluate: ({ state }) => {
      const avail = availableWaste(state);
      const sharps = avail.filter((w) => WASTE[w].category === 'sharps');
      const infectious = avail.filter((w) => WASTE[w].category === 'infectious');
      const ok = (list: WasteId[]) => list.length > 0 && list.every((w) => state.disposal[w] === WASTE[w].correct);
      const sharpsOk = ok(sharps);
      const infOk = ok(infectious);
      return {
        score: ([sharpsOk, infOk].filter(Boolean).length) as 0 | 1 | 2,
        evidence: [...(sharpsOk ? ['尖銳物丟入收集盒'] : []), ...(infOk ? ['感染性廢棄物丟入紅筒'] : [])],
        missing: [
          ...[...sharps, ...infectious]
            .filter((w) => state.disposal[w] !== WASTE[w].correct)
            .map((w) => (state.disposal[w] ? `「${WASTE[w].name}」分類錯誤` : `「${WASTE[w].name}」未處理`)),
        ],
      };
    },
  },
];
