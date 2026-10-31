import { runRubric } from '../../training/assessment';
import { formatClock } from '../../training/modes';
import { HAND_AREAS } from '../../training/sterile';
import type { AttemptRecord, FeedbackReport, FeedbackSuggestion, StepReview, StepStatus, TrainingEvent, TrainingModeId } from '../../training/types';
import { CATHETER_CASE, COMM_OPTION_MAP, WASTE, type StepId } from './caseData';
import { availableWaste, kitOpen, lubeFromTip, POS_LABEL, SOURCE_LABEL, type CTState } from './engine';
import { CATHETER_RUBRIC } from './rubric';
import { CATHETER_RUBRIC_CONFIG as CFG } from './rubricConfig';

function stepStatus(s: CTState, step: StepId): StepStatus {
  const c = s.catheter;
  switch (step) {
    case 'greet':
      return s.comm.length >= 3 ? 'complete' : s.comm.length ? 'partial' : 'not-started';
    case 'hygieneBefore':
      return s.hygiene.before ? (s.hygiene.before.areas.length === 6 && s.hygiene.before.beforeContact ? 'complete' : 'partial') : 'not-started';
    case 'prep':
      return kitOpen(s) && s.items.catheter !== 'cart' && s.kit.jelly && s.kit.iodine ? 'complete' : s.kit.onTable ? 'partial' : 'not-started';
    case 'gloves':
      return s.gloves.everSterile ? 'complete' : s.gloves.donningStarted || s.gloves.status === 'exam' ? 'partial' : 'not-started';
    case 'disinfect':
      return s.strokes.some((x) => x.zones.length) ? (s.strokes.every((x) => x.sterileOk) ? 'complete' : 'partial') : 'not-started';
    case 'drape':
      return s.drape.placed ? 'complete' : s.drape.liftCount ? 'partial' : 'not-started';
    case 'lubricate':
      return lubeFromTip(c.lube) >= CFG.lubrication.targetFraction ? 'complete' : c.lube.length ? 'partial' : 'not-started';
    case 'insert':
      return c.maxDepth >= 1 ? 'complete' : c.pos !== 'none' ? 'partial' : 'not-started';
    case 'balloon':
      return c.positioned ? 'complete' : c.balloonTool ? 'partial' : 'not-started';
    case 'connect':
      return s.bag.connected && s.tape.site && s.bag.hang ? 'complete' : s.bag.capOff || s.tape.site ? 'partial' : 'not-started';
    case 'disposal': {
      const avail = availableWaste(s);
      const n = avail.filter((w) => s.disposal[w]).length;
      return avail.length && n === avail.length ? 'complete' : n ? 'partial' : 'not-started';
    }
    case 'hygieneAfter':
      return s.hygiene.after ? (s.hygiene.after.areas.length === 6 ? 'complete' : 'partial') : 'not-started';
  }
}

const ISSUE = new Set(['error', 'contamination', 'order']);

function suggestions(report: Omit<FeedbackReport, 'suggestions'>, s: CTState, events: TrainingEvent[]): FeedbackSuggestion[] {
  const out: FeedbackSuggestion[] = [];
  const it = (id: number) => report.assessment.items.find((i) => i.id === id)!;
  const add = (step: StepId, tone: FeedbackSuggestion['tone'], message: string) => out.push({ stepId: step, tone, message });

  const i1 = it(1);
  if (i1.score < 2) add('greet', 'improve', `病人溝通：${i1.missing.join('；') || '尚未與病人互動'}。可以先說明來意，回應他的不舒服，再用日常用語解釋導尿過程。`);
  else add('greet', 'strength', '有說明來意、安撫並解釋技術，語氣溫和。');
  if (!s.curtain) add('greet', 'improve', '這次沒有拉上隔簾或提到隱私。導尿涉及私密部位，保護隱私是病人中心照護的一部分（不在 14 項評分中）。');

  const i2 = it(2);
  if (i2.score < 2) add('hygieneBefore', 'improve', `操作前手部衛生：${i2.missing.join('；')}。請在接觸病人與無菌物品前完成，並搓到指尖、拇指與指縫。`);
  const i3 = it(3);
  if (i3.score < 2) add('prep', 'improve', `器材準備：${i3.missing.join('；')}。建議依序：導尿包由遠到近打開 → 導尿管撕包落入 → 由上方擠入潤滑劑、倒消毒液，瓶口不碰無菌區。`);
  else add('prep', 'strength', '導尿包、導尿管、潤滑劑與消毒液準備完整，過程注意無菌。');
  if (s.items.bag === 'cart' || s.items.syringe === 'cart') add('prep', 'improve', '尿袋或空針直到需要時才從工作車拿取；建議戴手套前就把它們放上工作台，避免戴著無菌手套碰工作車。');

  const i4 = it(4);
  if (i4.score < 2) add('gloves', 'improve', `無菌手套：${i4.missing.join('；')}。發現手套污染時，應立即脫下並更換新的手套。`);

  const contam = s.contaminations;
  const unrecognized = contam.filter((c) => !c.recognized && !c.remediated);
  const notFixed = contam.filter((c) => c.recognized && !c.remediated);
  if (contam.length && contam.every((c) => c.remediated)) add('gloves', 'strength', `這次發生 ${contam.length} 次污染，你都有察覺並完成補救，這是很重要的無菌觀念。`);
  if (notFixed.length) add(notFixed[0].stepId as StepId, 'improve', `有 ${notFixed.length} 次污染你有察覺，但沒有完成補救（${notFixed.map((c) => c.reason).join('；')}）。擦拭無法恢復無菌，應更換手套或受污染的器材。`);
  if (unrecognized.length) add(unrecognized[0].stepId as StepId, 'improve', `有 ${unrecognized.length} 次污染沒有察覺（${unrecognized.map((c) => c.reason).join('；')}）。請練習在每個動作前確認：手套、導尿包、導尿管是否仍是無菌。`);

  const i5 = it(5);
  if (i5.score < 2) add('disinfect', 'improve', `消毒：${i5.missing.join('；') || '未消毒'}。本模擬示意由尿道口開始、由內往外，每支棉枝只用一次（細節依院內感染管制規範）。`);
  const i6 = it(6);
  if (i6.score < 2) add('drape', 'improve', `鋪洞巾：${i6.missing.join('；')}。戴無菌手套持洞巾，開口對準後一次放下。`);
  const i7 = it(7);
  if (i7.score < 2) add('drape', 'improve', `順序：${i7.missing.join('；')}。本教案第 7 項要求先消毒、後鋪洞巾。`);
  const i8 = it(8);
  if (i8.score < 2) add('lubricate', 'improve', `潤滑：${i8.missing.join('；')}。本教案要求塗抹到${CFG.lubrication.label}。`);
  const i9 = it(9);
  if (i9.score < 2) add('insert', 'improve', `置入：${i9.missing.join('；')}。小幅度、穩定推進；遇不明阻力時停止並尋求協助。`);
  else add('insert', 'strength', '緩慢、受控地把導尿管置入至末端。');
  if (s.catheter.helpRequests) add('insert', 'strength', `遇到狀況時有 ${s.catheter.helpRequests} 次主動停止並尋求臨床教師協助，這是正確的病人安全行為。`);
  if (events.some((e) => e.code === 'safety-stop')) add('insert', 'improve', '這次出現「安全中止」事件：受污染的導尿管或強行推進都可能傷害病人。請先完成補救，或停下來尋求協助。');
  const i10 = it(10);
  if (i10.score < 2) add('balloon', 'improve', `水球與定位：${i10.missing.join('；')}。確認見尿並置入至末端後，以空針接水球管腔打入${CFG.balloon.label}，再輕拉至卡住。`);
  if (s.catheter.balloonBlocked) add('balloon', 'improve', `有 ${s.catheter.balloonBlocked} 次在未達模擬定位條件時嘗試打水球。水球在尿道內撐開會造成嚴重傷害，請先確認置入位置。`);
  const i11 = it(11);
  if (i11.score < 2) add('connect', 'improve', `尿袋連接：${i11.missing.join('；')}。取下保護蓋時不碰接頭尖端，並在手套仍無菌時連接。`);
  const i12 = it(12);
  if (i12.score < 2) add('connect', 'improve', `固定：${i12.missing.join('；')}。尿管與尿袋要分別固定。`);
  if (s.bag.hang && s.bag.hang !== 'bedFrame') add('connect', 'improve', '尿袋應低於膀胱、避免逆流（固定細節依院內 SOP；此項不影響評分）。');
  const i13 = it(13);
  if (i13.score < 2) add('disposal', 'improve', `廢棄物：${i13.missing.join('；')}。接觸病人、體液或消毒液的物品都屬感染性廢棄物。`);
  const i14 = it(14);
  if (i14.score < 2) add('hygieneAfter', 'improve', `操作後手部衛生：${i14.missing.join('；')}。脫手套後仍需完成手部衛生。`);
  return out;
}

export function buildReport(p: { state: CTState; events: TrainingEvent[]; mode: TrainingModeId; durationSec: number; endReason: 'finished' | 'timeout'; focusStepId: StepId | null }): FeedbackReport {
  const { state: s, events, mode, durationSec, endReason, focusStepId } = p;
  const assessment = runRubric(CATHETER_RUBRIC, { state: s, events });
  const stepReview: StepReview[] = CATHETER_CASE.steps.map((st) => ({
    stepId: st.id,
    title: st.title,
    status: stepStatus(s, st.id as StepId),
    issues: events.filter((e) => e.stepId === st.id && ISSUE.has(e.kind)).length,
  }));
  const stepTitles = Object.fromEntries(CATHETER_CASE.steps.map((st) => [st.id, st.title]));
  const firstAt = new Map<string, number>();
  for (const e of events) if (stepTitles[e.stepId] && e.kind !== 'hint' && e.kind !== 'system' && !firstAt.has(e.stepId)) firstAt.set(e.stepId, e.t);
  const sequence = [...firstAt.entries()].sort((a, b) => a[1] - b[1]).map(([stepId, t]) => ({ stepId, title: stepTitles[stepId], t }));

  const c = s.catheter;
  const avail = availableWaste(s);
  const sorted = avail.filter((w) => s.disposal[w] === WASTE[w].correct).length;
  const contam = s.contaminations;
  const done = stepReview.filter((x) => x.status === 'complete').length;
  const comm = s.comm.map((id) => COMM_OPTION_MAP[id]);
  const hb = s.hygiene.before;
  const ha = s.hygiene.after;

  const base: Omit<FeedbackReport, 'suggestions'> = {
    skillId: 'urinary-catheterization',
    skillTitle: '導尿管置入',
    sourceNote: '本分數依《技術操作－導尿管置放.pdf》評分說明對應數位互動事件計算（模擬形成性評量），僅供自我學習，不等同現場 OSCE 實作成績；整體表現 1–5 分由教師評估，不與 28 分相加。',
    mode,
    endReason,
    focusStepId,
    durationSec,
    metrics: [
      { label: '操作時間', value: formatClock(durationSec), tone: endReason === 'timeout' ? 'warn' : 'neutral' },
      { label: '完成階段', value: `${done} / ${stepReview.length}`, tone: done === stepReview.length ? 'good' : 'warn' },
      { label: '無菌污染', value: `${contam.length} 次`, tone: contam.length ? 'warn' : 'good' },
      { label: '察覺並補救', value: `${contam.filter((x) => x.remediated).length} / ${contam.length}`, tone: contam.some((x) => !x.remediated) ? 'warn' : 'neutral' },
      { label: '安全中止事件', value: `${events.filter((e) => e.code === 'safety-stop').length} 次`, tone: events.some((e) => e.code === 'safety-stop') ? 'warn' : 'good' },
      { label: '尋求協助', value: `${c.helpRequests} 次`, tone: 'neutral' },
      { label: '病人溝通', value: `${comm.length} 句`, tone: comm.length ? 'neutral' : 'warn' },
      { label: '使用提示', value: `${events.filter((e) => e.kind === 'hint').length} 次`, tone: 'neutral' },
    ],
    statusCards: [
      {
        title: '🧪 無菌與污染',
        rows: contam.length
          ? contam.map((x, i) => ({ label: `${i + 1}. ${SOURCE_LABEL[x.source]}`, value: `${x.reason.slice(0, 18)}${x.reason.length > 18 ? '…' : ''}｜${x.remediated ? '已補救' : x.recognized ? '已察覺' : '未察覺'}`, tone: x.remediated ? 'good' : 'warn' }))
          : [{ label: '污染事件', value: '無', tone: 'good' }],
      },
      {
        title: '🩺 導尿管與水球（模擬狀態）',
        rows: [
          { label: '潤滑範圍', value: c.lube.length ? `由尖端約 ${Math.round(lubeFromTip(c.lube) * 100)}%` : '未潤滑', tone: lubeFromTip(c.lube) >= CFG.lubrication.targetFraction ? 'good' : 'warn' },
          { label: '置入狀態', value: POS_LABEL[c.pos], tone: c.maxDepth >= 1 ? 'good' : 'warn' },
          { label: '見尿（模擬）', value: c.urineReturned ? '有' : '無', tone: c.urineReturned ? 'good' : 'neutral' },
          { label: '推進過快／偏離', value: `${c.fastEvents}／${c.directionEvents} 次`, tone: c.fastEvents || c.directionEvents ? 'warn' : 'good' },
          { label: '水球', value: c.balloonMl ? `${c.balloonMl} mL` : '未打水', tone: c.balloonMl >= CFG.balloon.minMl && c.balloonMl <= CFG.balloon.maxMl ? 'good' : 'warn' },
          { label: '定位', value: c.positioned ? '已拉至定位（模擬）' : '未定位', tone: c.positioned ? 'good' : 'warn' },
        ],
      },
      {
        title: '🧷 尿袋・廢棄物・手部衛生',
        rows: [
          { label: '尿袋連接', value: s.bag.connected ? (s.bag.connectedSterile ? '已連接（無菌）' : '已連接（未維持無菌）') : '未連接', tone: s.bag.connectedSterile ? 'good' : 'warn' },
          { label: '固定尿管／尿袋', value: `${s.tape.site ? '✓' : '✗'}／${s.bag.hang ? '✓' : '✗'}`, tone: s.tape.site && s.bag.hang ? 'good' : 'warn' },
          { label: '廢棄物分類', value: avail.length ? `${sorted}/${avail.length} 正確` : '無', tone: avail.length && sorted === avail.length ? 'good' : 'warn' },
          { label: '操作前手部衛生', value: hb ? `${hb.areas.length}/${HAND_AREAS.length} 部位${hb.beforeContact ? '' : '（太晚）'}` : '未執行', tone: hb && hb.beforeContact && hb.areas.length === 6 ? 'good' : 'warn' },
          { label: '操作後手部衛生', value: ha ? `${ha.areas.length}/${HAND_AREAS.length} 部位` : '未執行', tone: ha && ha.areas.length === 6 ? 'good' : 'warn' },
          { label: '整理與病人舒適', value: `${s.wrapUp.length}/3`, tone: s.wrapUp.length === 3 ? 'good' : 'neutral' },
        ],
      },
    ],
    sequence,
    stepTitles,
    historyColumns: [
      { key: 'contaminations', label: '污染' },
      { key: 'fast', label: '過快推進' },
      { key: 'balloon', label: '水球 mL' },
    ],
    assessment,
    stepReview,
    physicalChecks: [
      ...assessment.items.filter((i) => i.observability === 'proxy').map((i) => `第 ${i.id} 項「${i.title}」：${i.physicalNote}`),
      '整體表現（1–5 分）：尚未評核，需由教師依實作表現評估，不與 28 分相加。',
    ],
    events,
  };
  return { ...base, suggestions: suggestions(base, s, events) };
}

export function toAttemptRecord(report: FeedbackReport, s: CTState): AttemptRecord {
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
    highlights: { contaminations: s.contaminations.length, fast: s.catheter.fastEvents, balloon: s.catheter.balloonMl },
  };
}
