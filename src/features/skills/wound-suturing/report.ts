import { runRubric } from '../../training/assessment';
import type { FeedbackReport, FeedbackSuggestion, StepReview, StepStatus, TrainingEvent, TrainingModeId, AttemptRecord } from '../../training/types';
import { EQUIPMENT, WOUND_SUTURING_CASE, WASTE, type StepId } from './caseData';
import { availableWaste, fieldOpen, type WSState } from './engine';
import { analyzeDisinfection, stitchSpacings, spacingOk } from './geometry';
import { dressingAnalysis } from './dressing';
import { WOUND_SUTURING_RUBRIC } from './rubric';
import { formatClock } from '../../training/modes';

function stepStatus(s: WSState, step: StepId): StepStatus {
  switch (step) {
    case 'prep': {
      const ready = fieldOpen(s) && EQUIPMENT.filter((e) => e.required && e.target !== 'open').every((e) => s.items[e.id] === e.target);
      if (ready) return 'complete';
      return s.flapsOpened.length || EQUIPMENT.some((e) => s.items[e.id] !== 'supply') ? 'partial' : 'not-started';
    }
    case 'gloves':
      return s.gloves.everSterile ? 'complete' : s.gloves.progress || s.gloves.status === 'exam' ? 'partial' : 'not-started';
    case 'disinfect': {
      const d = analyzeDisinfection(s.disinfection.strokes);
      return d.insideOut && d.coversDrapeHole ? 'complete' : d.started ? 'partial' : 'not-started';
    }
    case 'drape':
      return s.drape.center ? (Math.hypot(s.drape.center.x, s.drape.center.y) <= 0.8 ? 'complete' : 'partial') : 'not-started';
    case 'suture':
      return s.stitches.length >= 3 ? 'complete' : s.stitches.length || s.work.entry ? 'partial' : 'not-started';
    case 'dressing': {
      const d = dressingAnalysis(s);
      return d.covered && d.taped ? 'complete' : s.dressing.gauze || s.dressing.tapes.length ? 'partial' : 'not-started';
    }
    case 'disposal': {
      const avail = availableWaste(s);
      const done = avail.filter((w) => s.disposal[w]).length;
      return avail.length && done === avail.length ? 'complete' : done ? 'partial' : 'not-started';
    }
  }
}

const ISSUE_KINDS = new Set(['error', 'contamination', 'order']);

/** 依評分結果產生形成性建議（指出具體事件與可重練的階段） */
function suggestionsFor(report: Omit<FeedbackReport, 'suggestions'>, s: WSState): FeedbackSuggestion[] {
  const out: FeedbackSuggestion[] = [];
  const item = (id: number) => report.assessment.items.find((i) => i.id === id)!;

  const i2 = item(2);
  if (i2.score === 0) out.push({ stepId: 'prep', tone: 'improve', message: '這次縫針縫線沒有置入無菌區。建議重新練習器材準備：先打開無菌包布，再撕開縫線外包裝讓它落入無菌區。' });
  else if (i2.score === 1) out.push({ stepId: 'prep', tone: 'improve', message: `你在建立無菌區時發生污染（${i2.missing.map((m) => m.replace('破壞無菌區：', '')).join('；')}），建議重新練習無菌包布的打開順序與無菌物品的置入方式。` });
  else out.push({ stepId: 'prep', tone: 'strength', message: '縫針縫線已正確拆包置入無菌區，準備過程沒有破壞無菌。' });

  const i3 = item(3);
  if (i3.score === 0) out.push({ stepId: 'gloves', tone: 'improve', message: '這次沒有穿戴無菌手套。縫合屬無菌操作，建議練習閉合原則：裸手只碰手套反折內面。' });
  else if (i3.score === 1) out.push({ stepId: 'gloves', tone: 'improve', message: `手套有戴上，但過程中失去無菌（${i3.missing.map((m) => m.replace('未保持無菌：', '')).join('；')}）。建議重練手套穿戴，並留意戴好後雙手不碰非無菌物。` });

  const i4 = item(4);
  if (i4.score < 2) out.push({ stepId: 'disinfect', tone: 'improve', message: i4.score === 0 && !s.disinfection.strokes.length ? '這次沒有消毒。建議練習以棉棒由傷口開始向外畫圈消毒。' : `消毒還差一點：${i4.missing.join('；')}。建議練習「從傷口開始、一圈比一圈大、最外圈超過洞巾開口」。` });

  const i5 = item(5);
  if (i5.score === 0) out.push({ stepId: 'drape', tone: 'improve', message: '這次沒有鋪單。鋪上洞巾可以擴大無菌操作面，建議重練鋪單。' });
  else if (i5.score === 1) out.push({ stepId: 'drape', tone: 'improve', message: `鋪單過程破壞無菌（${i5.missing.map((m) => m.replace('破壞無菌區：', '')).join('；')}）。建議練習戴無菌手套持洞巾外緣，一次對準放下。` });

  const i6 = item(6);
  if (i6.score === 1) out.push({ stepId: 'suture', tone: 'improve', message: '縫合中曾破壞無菌，但你有察覺並補救，這是很重要的安全意識。下次試著在縫合前就讓雙手只停留在無菌區。' });
  else if (i6.score === 0 && s.stitches.length) out.push({ stepId: 'suture', tone: 'improve', message: `縫合過程有無菌破壞且沒有補救（${i6.missing.map((m) => m.replace('無菌破壞：', '')).join('；')}）。發現污染時，應立即更換手套或污染物品。` });

  const i7 = item(7);
  if (s.stitches.length && i7.score < 2) {
    out.push({ stepId: 'suture', tone: 'improve', message: `${i7.missing.join('；')}。建議在截面圖中練習：進針時針尖垂直皮膚，穿針時順著針的弧度旋轉；每針打三個結。` });
  }
  const gaps = stitchSpacings(s.stitches);
  if (s.stitches.length >= 3 && gaps.some((g) => !spacingOk(g))) {
    out.push({ stepId: 'suture', tone: 'improve', message: `已完成 ${s.stitches.length} 針縫合，但模擬針距不一致（${gaps.map((g) => g.toFixed(1)).join('、')} cm），建議練習進針位置的規劃：先在傷口上目測三個等分點再下針。` });
  } else if (s.stitches.length > 0 && s.stitches.length < 3) {
    out.push({ stepId: 'suture', tone: 'improve', message: `這次完成 ${s.stitches.length} 針，教案要求至少三針。建議重練縫合並注意時間分配。` });
  } else if (s.stitches.length === 0) {
    out.push({ stepId: 'suture', tone: 'improve', message: '這次沒有完成縫合。縫合是本站核心，建議先用引導模式熟悉進針、穿針、打結與剪線的流程。' });
  }
  const squareIssues = s.stitches.filter((st) => st.throws.some((t) => !t.alternated)).length;
  if (squareIssues) out.push({ stepId: 'suture', tone: 'improve', message: `有 ${squareIssues} 針的結沒有交替方向，容易形成祖母結而鬆脫。可以到「打結練習場」反覆練習繞線與拉線方向。` });
  if (s.stitches.length >= 3 && i7.score === 2 && gaps.every(spacingOk)) out.push({ stepId: 'suture', tone: 'strength', message: '三針以上、角度垂直、每針三個結、針距約一公分，縫合規劃做得很好。' });

  const i9 = item(9);
  if (i9.score < 2) out.push({ stepId: 'dressing', tone: 'improve', message: `傷口覆蓋：${i9.missing.join('；')}。記得先移除洞巾、紗布蓋住整條縫線，再用紙膠帶跨越紗布邊緣固定。` });

  const i10 = item(10);
  if (i10.score < 2) out.push({ stepId: 'disposal', tone: 'improve', message: `廢棄物處理：${i10.missing.join('；')}。縫針放錯容器可能造成清潔人員針扎，請再練習一次分類。` });
  const advisories = Object.entries(s.disposal).filter(([w, b]) => WASTE[w as keyof typeof WASTE].category === 'general' && b !== 'general');
  if (advisories.length) out.push({ stepId: 'disposal', tone: 'improve', message: '未污染的外包裝紙可丟一般垃圾，放入紅筒雖不影響評分，但會增加醫療廢棄物處理量。' });

  const i1 = item(1);
  if (i1.score < 2) out.push({ stepId: 'disinfect', tone: 'improve', message: `口述：${i1.missing.join('、')}。可以在每個階段開始前點「向病人說明」，讓病人知道接下來的感受。` });
  const jargon = Object.values(s.narration).filter((n) => n?.quality === 'jargon').length;
  if (jargon) out.push({ stepId: 'disinfect', tone: 'improve', message: `有 ${jargon} 次口述使用了英文術語，病人可能聽不懂，建議改用日常用語。` });

  return out;
}

export function buildReport(params: {
  state: WSState;
  events: TrainingEvent[];
  mode: TrainingModeId;
  durationSec: number;
  endReason: 'finished' | 'timeout';
  focusStepId: StepId | null;
}): FeedbackReport {
  const { state, events, mode, durationSec, endReason, focusStepId } = params;
  const assessment = runRubric(WOUND_SUTURING_RUBRIC, { state, events });
  const contaminations = events.filter((e) => e.kind === 'contamination');
  const remediations = events.filter((e) => e.kind === 'remediation');
  const knotsComplete = state.stitches.filter((s) => s.throws.length >= 3).length;
  const square = state.stitches.filter((s) => s.throws.length >= 3 && s.throws.every((t) => t.alternated)).length;
  const gaps = stitchSpacings(state.stitches);

  const stepReview: StepReview[] = WOUND_SUTURING_CASE.steps.map((st) => ({
    stepId: st.id,
    title: st.title,
    status: stepStatus(state, st.id as StepId),
    issues: events.filter((e) => e.stepId === st.id && ISSUE_KINDS.has(e.kind)).length,
  }));

  const physicalChecks = [
    ...assessment.items.filter((i) => i.observability === 'proxy').map((i) => `第 ${i.id} 項「${i.title}」：${i.physicalNote}`),
    '整體表現（1–5 分）：尚未評核，需由教師依實作表現評估。',
  ];

  const base: Omit<FeedbackReport, 'suggestions'> = {
    skillId: 'wound-suturing',
    mode,
    endReason,
    focusStepId,
    durationSec,
    metrics: [
      { label: '模擬完成時間', value: formatClock(durationSec), tone: mode === 'challenge' && endReason === 'timeout' ? 'warn' : 'neutral' },
      { label: '已完成針數', value: `${state.stitches.length} 針`, tone: state.stitches.length >= 3 ? 'good' : 'warn' },
      { label: '打結完成', value: state.stitches.length ? `${knotsComplete}/${state.stitches.length} 針三個結（方結 ${square}）` : '—', tone: state.stitches.length && knotsComplete === state.stitches.length ? 'good' : 'warn' },
      { label: '針距', value: gaps.length ? `${gaps.map((g) => g.toFixed(1)).join(' / ')} cm` : '—', tone: gaps.length && gaps.every(spacingOk) ? 'good' : 'neutral' },
      { label: '無菌污染事件', value: `${contaminations.length} 次`, tone: contaminations.length ? 'warn' : 'good' },
      { label: '察覺並補救', value: `${remediations.length} 次`, tone: 'neutral' },
      { label: '使用提示', value: `${events.filter((e) => e.kind === 'hint').length} 次`, tone: 'neutral' },
    ],
    assessment,
    stepReview,
    physicalChecks,
    events,
  };
  return { ...base, suggestions: suggestionsFor(base, state) };
}

export function toAttemptRecord(report: FeedbackReport, state: WSState): AttemptRecord {
  return {
    id: `${Date.now()}`,
    skillId: report.skillId,
    mode: report.mode,
    focusStepId: report.focusStepId,
    finishedAt: new Date().toISOString(),
    durationSec: Math.round(report.durationSec),
    total: report.assessment.total,
    max: report.assessment.max,
    itemScores: report.assessment.items.map((i) => i.score),
    highlights: {
      stitches: state.stitches.length,
      contaminations: report.events.filter((e) => e.kind === 'contamination').length,
    },
  };
}
