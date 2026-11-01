import { runRubric } from '../../training/assessment';
import { formatClock } from '../../training/modes';
import type { AttemptRecord, FeedbackReport, FeedbackSuggestion, StepReview, StepStatus, TrainingEvent, TrainingModeId } from '../../training/types';
import { AIRWAY_CASE, AUSC_LABEL, REQUIRED_AUSC, REQUIRED_KIT, TUBE_SIZE, type StepId } from './caseData';
import { breathRate, capnoFinding, chestFinding, trayItems, type AWState } from './engine';
import { AIRWAY_RUBRIC } from './rubric';
import { AIRWAY_CONFIG as CFG } from './rubricConfig';

function stepStatus(s: AWState, id: StepId): StepStatus {
  const a = s.final ?? s.attempt;
  switch (id) {
    case 'prep': {
      const kit = REQUIRED_KIT.every((k) => k.ok(trayItems(s)));
      return kit && s.scope.lightChecked && s.tube.cuffChecked && s.tube.lubed ? 'complete' : trayItems(s).length ? 'partial' : 'not-started';
    }
    case 'bvm':
      return s.preBreaths.length >= 3 ? 'complete' : s.mask.placed || s.preBreaths.length ? 'partial' : 'not-started';
    case 'position':
      return s.head.confirmedSniffing ? 'complete' : s.head.towel || s.head.confirmed ? 'partial' : 'not-started';
    case 'laryngoscopy':
      return s.scopeUse.usedLeftLift ? 'complete' : s.scopeUse.hand ? 'partial' : 'not-started';
    case 'intubate':
      return s.attempts && a.depthRead ? 'complete' : s.attempts ? 'partial' : 'not-started';
    case 'tubeCare':
      return a.cuffInflated && (s.tube.stylet === 'none' || a.styletRemoved) ? 'complete' : a.cuffInflated || a.styletRemoved ? 'partial' : 'not-started';
    case 'confirm':
      return a.chestObserved && REQUIRED_AUSC.every((p) => a.ausc.includes(p)) ? 'complete' : a.bagConnected ? 'partial' : 'not-started';
    case 'secure':
      return s.secured.tied ? 'complete' : s.secured.bite ? 'partial' : 'not-started';
  }
}

const ISSUE = new Set(['error', 'contamination', 'order']);
/** 建議補強單元 */
const UNIT: Record<StepId, string> = {
  prep: '器材準備與檢查',
  bvm: '袋瓣罩面罩通氣',
  position: '頭部擺位',
  laryngoscopy: '喉頭鏡操作',
  intubate: '氣管內管置入與深度',
  tubeCare: '通條移除與 cuff 充氣',
  confirm: '插管後位置確認',
  secure: '固定氣管內管',
};

export function buildReport(p: { state: AWState; events: TrainingEvent[]; mode: TrainingModeId; durationSec: number; endReason: 'finished' | 'timeout'; focusStepId: StepId | null }): FeedbackReport {
  const { state: s, events, mode, durationSec, endReason, focusStepId } = p;
  const assessment = runRubric(AIRWAY_RUBRIC, { state: s, events });
  const stepReview: StepReview[] = AIRWAY_CASE.steps.map((st) => ({ stepId: st.id, title: st.title, status: stepStatus(s, st.id as StepId), issues: events.filter((e) => e.stepId === st.id && ISSUE.has(e.kind)).length }));
  const stepTitles = Object.fromEntries(AIRWAY_CASE.steps.map((st) => [st.id, st.title]));
  const firstAt = new Map<string, number>();
  for (const e of events) if (stepTitles[e.stepId] && e.kind !== 'hint' && e.kind !== 'system' && !firstAt.has(e.stepId)) firstAt.set(e.stepId, e.t);
  const sequence = [...firstAt.entries()].sort((a, b) => a[1] - b[1]).map(([stepId, t]) => ({ stepId, title: stepTitles[stepId], t }));

  const a = s.final ?? s.attempt;
  const tray = trayItems(s);
  const kitOk = REQUIRED_KIT.filter((k) => k.ok(tray)).length;
  const rate = breathRate(s.preBreaths);
  const safetyEvents = events.filter((e) => e.safety);
  const chest = chestFinding(a);

  // 個別化建議：依未滿分規準與安全事件，指向建議補強單元
  const suggestions: FeedbackSuggestion[] = [];
  for (const it of assessment.items) {
    if (it.score < 2) suggestions.push({ stepId: it.stepIds[0], tone: 'improve', message: `第 ${it.id} 項「${it.title.split('（')[0]}」：${it.missing.join('；') || '未完成'}。建議補強單元：${UNIT[it.stepIds[0] as StepId]}。` });
  }
  const strong = assessment.items.filter((i) => i.score === 2);
  if (strong.length) suggestions.push({ stepId: strong[0].stepIds[0], tone: 'strength', message: `做得好：${strong.map((i) => `第 ${i.id} 項`).join('、')} 達到完全做到。` });
  if (events.some((e) => e.code === 'removeTube' || e.code === 'abort')) suggestions.push({ stepId: 'confirm', tone: 'strength', message: '你在發現問題或無法完成時選擇拔管／停止並重新給氧，這是正確的病人安全行為。' });
  if (!a.capno && s.attempts) suggestions.push({ stepId: 'confirm', tone: 'improve', message: '【現行臨床安全補充】這次沒有使用波形二氧化碳監測。胸廓與聽診都可能誤判，現行臨床建議以持續波形 ETCO₂ 輔助確認管路位置（不影響教案評分）。' });

  const base: Omit<FeedbackReport, 'suggestions'> = {
    skillId: 'endotracheal-intubation',
    skillTitle: '氣管內管插管',
    sourceNote: '本分數依《氣管插管(1).pdf》評分說明對應數位互動事件計算（模擬形成性評量），不是正式考官評核結果；整體表現 1–5 分由教師評估，不與 28 分相加。',
    mode,
    endReason,
    focusStepId,
    durationSec,
    metrics: [
      { label: '模擬完成時間', value: formatClock(durationSec), tone: endReason === 'timeout' ? 'warn' : 'neutral' },
      { label: '器材準備完整度', value: `${kitOk} / ${REQUIRED_KIT.length}`, tone: kitOk === REQUIRED_KIT.length ? 'good' : 'warn' },
      { label: '插管嘗試', value: `${s.attempts} 次`, tone: s.attempts === 1 ? 'good' : s.attempts ? 'warn' : 'neutral' },
      { label: '安全事件', value: `${safetyEvents.length} 次`, tone: safetyEvents.length ? 'warn' : 'good' },
      { label: '插管前給氣速度', value: rate === null ? `${s.preBreaths.length} 次擠壓` : `${rate.toFixed(1)} 次/分`, tone: 'neutral' },
      { label: '五點聽診', value: `${REQUIRED_AUSC.filter((x) => a.ausc.includes(x)).length} / 5`, tone: REQUIRED_AUSC.every((x) => a.ausc.includes(x)) ? 'good' : 'warn' },
      { label: '同步口述', value: `${s.verbal.length} 次`, tone: s.verbal.length ? 'neutral' : 'warn' },
      { label: '使用提示', value: `${events.filter((e) => e.kind === 'hint').length} 次`, tone: 'neutral' },
    ],
    statusCards: [
      {
        title: '🧰 器材準備與檢查',
        rows: [
          ...REQUIRED_KIT.map((k) => ({ label: k.label, value: k.ok(tray) ? '✓' : '未備', tone: (k.ok(tray) ? 'good' : 'warn') as 'good' | 'warn' })),
          { label: '氣管內管', value: s.tube.size ? `ID ${TUBE_SIZE[s.tube.size]!.toFixed(1)}` : '未選', tone: s.tube.size && CFG.caseRequirement.tubeSizes.includes(TUBE_SIZE[s.tube.size]!) ? 'good' : 'warn' },
          { label: '燈泡／cuff／潤滑', value: `${s.scope.lightChecked ? '✓' : '✗'}／${s.tube.cuffChecked ? '✓' : '✗'}／${s.tube.lubed ? '✓' : '✗'}`, tone: s.scope.lightChecked && s.tube.cuffChecked && s.tube.lubed ? 'good' : 'warn' },
        ],
      },
      {
        title: '🫁 模擬呼吸道操作結果',
        rows: [
          { label: '面罩密合', value: s.preRise ? `胸廓起伏 ${s.preRise}/${s.preBreaths.length} 次` : '未見起伏', tone: s.preRise ? 'good' : 'warn' },
          { label: '頭部擺位', value: s.head.confirmedSniffing ? 'sniffing position' : s.head.confirmed ? '不正確' : '未擺位', tone: s.head.confirmedSniffing ? 'good' : 'warn' },
          { label: '喉頭鏡', value: s.scopeUse.usedLeftLift ? '左手・適當上提' : s.scopeUse.hand ? '持握或上提不正確' : '未使用', tone: s.scopeUse.usedLeftLift ? 'good' : 'warn' },
          { label: '管路位置（最後）', value: a.location === 'trachea' ? '氣管（模擬）' : a.location === 'esophagus' ? '食道（模擬）' : '已拔除／未插管', tone: a.location === 'trachea' ? 'good' : 'warn' },
          { label: '嘴角刻度', value: a.depth !== null ? `${a.depth} cm${a.depthRead ? '' : '（未確認）'}` : '—', tone: a.depthRead ? 'neutral' : 'warn' },
          { label: '通條／cuff', value: `${s.tube.stylet === 'none' ? '未使用' : a.styletRemoved ? '已移除' : '未移除'}／${a.cuffInflated ? '已充氣' : '未充氣'}`, tone: a.cuffInflated ? 'good' : 'warn' },
        ],
      },
      {
        title: '🩺 位置確認項目',
        rows: [
          { label: 'Ambu bag', value: a.bagConnected ? `已連接・壓袋 ${a.postBreaths} 次` : '未連接', tone: a.bagConnected ? 'good' : 'warn' },
          { label: '胸廓', value: a.chestObserved ? chest.text : '未觀察', tone: a.chestObserved && chest.rise === 'both' ? 'good' : 'warn' },
          ...REQUIRED_AUSC.map((x) => ({ label: AUSC_LABEL[x], value: a.ausc.includes(x) ? '已聽診' : a.auscNoVent.includes(x) ? '未壓袋時聽' : '未聽診', tone: (a.ausc.includes(x) ? 'good' : 'warn') as 'good' | 'warn' })),
          { label: '固定', value: s.secured.tied ? `已固定${s.secured.bite ? '（含咬口器）' : ''}` : '未固定', tone: s.secured.tied ? 'good' : 'warn' },
        ],
      },
    ],
    safetyAlerts: safetyEvents.map((e) => ({ title: e.message, detail: e.why ?? '', stepId: e.stepId })),
    supplements: [
      {
        title: '📈 波形二氧化碳監測（ETCO₂）',
        tag: '現行臨床安全補充・不計入教案 14 項',
        rows: [
          { label: '是否使用', value: a.capno ? '已連接' : '未使用', tone: a.capno ? 'good' : 'neutral' },
          { label: '模擬波形', value: a.capno ? capnoFinding(a) : '—', tone: a.capno ? (a.location === 'trachea' ? 'good' : 'warn') : 'neutral' },
        ],
        note: '胸廓起伏、聽診與插管深度都可能誤判；現行臨床建議以持續波形呼氣末二氧化碳監測輔助確認氣管內管位置。本項依現行臨床安全觀念補充，未更動原教案評分規準，內容待臨床教師審核。',
      },
    ],
    sequence,
    stepTitles,
    historyColumns: [
      { key: 'attempts', label: '插管次數' },
      { key: 'safety', label: '安全事件' },
    ],
    assessment,
    stepReview,
    physicalChecks: [
      ...assessment.items.filter((i) => i.observability === 'proxy').map((i) => `第 ${i.id} 項「${i.title.split('（')[0]}」：${i.physicalNote}`),
      '真實插管技巧（喉頭鏡置入、上提力道、置管手感）無法由網頁確認，需在實體插管模型上由臨床教師評核。',
      '整體表現（1–5 分）：尚未評核，需由教師依實作表現評估，不與 28 分相加。',
    ],
    events,
  };
  return { ...base, suggestions };
}

export function toAttemptRecord(report: FeedbackReport, s: AWState): AttemptRecord {
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
    highlights: { attempts: s.attempts, safety: report.events.filter((e) => e.safety).length },
  };
}
