import type { DomainReducer } from '../../training/interactionEngine';
import { sterileStatusOf, STERILE_GLOVE_DECISIONS, type ContaminationRecord, type HandAreaId, HAND_AREAS } from '../../training/sterile';
import type { NewEvent } from '../../training/types';
import { COMM_OPTION_MAP, EQUIPMENT_MAP, HOTSPOTS, STEP_IDS, WASTE, type BinId, type HotspotId, type ItemId, type StepId, type WasteId, type WrapUpId } from './caseData';
import { CATHETER_RUBRIC_CONFIG as CFG } from './rubricConfig';

/**
 * CATHETER QUEST 互動引擎（純函式 reducer）
 * 只處理「學員做了什麼」與「模擬狀態如何改變」，並產生事件；評分在 rubric.ts，教學文字在 caseData.ts。
 *
 * 子模組：
 *  - SterileFieldManager：導尿包無菌區、手套、污染紀錄與補救（ContaminationEventTracker）
 *  - CatheterPositionState：導尿管模擬位置（置入／阻力／見尿／末端／定位），由事件推進
 *  - BalloonSafetyGate：未達模擬定位條件時阻擋水球操作
 *  - DrainageBagConnector：保護蓋、接頭無菌、連接、固定
 */

export type Loc = 'cart' | 'table' | 'field' | 'worn';
export type Flap = 'far' | 'left' | 'right' | 'near';
export const FLAP_LABEL: Record<Flap, string> = { far: '遠側', left: '左側', right: '右側', near: '近側' };
const FLAP_RANK: Record<Flap, number> = { far: 3, left: 2, right: 2, near: 1 };

export type ContamSource = 'gloves' | 'field' | 'catheter' | 'connector';
export const SOURCE_LABEL: Record<ContamSource, string> = { gloves: '無菌手套', field: '無菌區（導尿包）', catheter: '導尿管', connector: '尿袋接頭' };

export type GloveStatus = 'none' | 'exam' | 'sterile';
export type MeatusZone = 'meatus' | 'glans' | 'shaft';

/** CatheterPositionState：皆為教學模擬狀態，不代表真實解剖位置 */
export type CatheterPos = 'none' | 'at-meatus' | 'inserting' | 'resistance' | 'help' | 'inserted';
export const POS_LABEL: Record<CatheterPos, string> = {
  none: '尚未置入',
  'at-meatus': '尖端已對準尿道口',
  inserting: '置入中',
  resistance: '模擬阻力事件・已暫停',
  help: '已暫停・等待臨床教師協助',
  inserted: '已置入至導尿管末端（模擬）',
};

export interface Stroke {
  zones: MeatusZone[];
  startAtMeatus: boolean;
  outward: boolean;
  backtrack: boolean;
  sterileOk: boolean;
  afterDrape: boolean;
}

export interface CatheterState {
  loc: Loc;
  peeled: boolean;
  spareUsed: number;
  /** 已塗潤滑的區段（0＝尖端，1＝尾端） */
  lube: [number, number][];
  pos: CatheterPos;
  depth: number;
  maxDepth: number;
  urineReturned: boolean;
  fastEvents: number;
  directionEvents: number;
  forced: boolean;
  helpRequests: number;
  resistancePlanned: boolean;
  resistanceDone: boolean;
  /** 水球 */
  balloonTool: ItemId | null;
  syringePort: 'none' | 'balloon' | 'drain';
  balloonMl: number;
  balloonBlocked: number;
  /** 安全中止後，補救前不重複記錄 */
  safetyHold: boolean;
  pulled: number;
  positioned: boolean;
}

export interface CTState {
  activeStep: StepId;
  visited: Partial<Record<StepId, boolean>>;
  items: Record<ItemId, Loc>;
  maskOn: boolean;
  curtain: boolean;
  /** 溝通紀錄（選項 id，依時間順序） */
  comm: string[];
  anxiety: number;
  patientLine: string | null;
  pain: number;
  hygiene: {
    before: { done: boolean; areas: HandAreaId[]; beforeContact: boolean } | null;
    after: { done: boolean; areas: HandAreaId[] } | null;
  };
  /** 曾經接觸病人或開始無菌操作 */
  contactStarted: boolean;
  kit: { onTable: boolean; flaps: Flap[]; jelly: boolean; iodine: boolean; swabsLeft: number };
  gloves: { status: GloveStatus; progress: number; donningClean: boolean; everSterile: boolean; removedCount: number; donningStarted: boolean };
  contaminations: ContaminationRecord<ContamSource>[];
  lastWasRemedy: boolean;
  strokes: Stroke[];
  drape: { placed: boolean; offset: number; inwardDrag: boolean; sterileGloves: boolean; beforeDisinfect: boolean; liftCount: number };
  catheter: CatheterState;
  bag: { capOff: boolean; connectorContaminated: boolean; connected: boolean; connectedSterile: boolean; hang: null | 'bedFrame' | 'abdomen' | 'rail'; spareUsed: number };
  tape: { site: null | 'thigh' | 'abdomen' };
  disposal: Partial<Record<WasteId, BinId>>;
  wrapUp: WrapUpId[];
  /** 已關閉引流系統（尿袋已連接）後，不再要求手套無菌 */
  seq: number;
}

export type CTAction =
  | { type: 'setStep'; step: StepId }
  | { type: 'comm'; optionId: string }
  | { type: 'curtain' }
  | { type: 'wearMask' }
  | { type: 'hygiene'; phase: 'before' | 'after'; areas: HandAreaId[] }
  | { type: 'placeItem'; item: ItemId; zone: Loc; method?: 'peel-drop' | 'hand-transfer' | 'with-wrapper' }
  | { type: 'openFlap'; flap: Flap }
  | { type: 'pour'; what: 'iodine' | 'jelly'; method: 'above' | 'inside' | 'touch' }
  | { type: 'touch'; hotspot: HotspotId }
  | { type: 'gloveDecision'; decision: string; option: string }
  | { type: 'wearExamGloves' }
  | { type: 'removeGloves' }
  | { type: 'recognize' }
  | { type: 'remedy'; kind: 'changeGloves' | 'replaceCatheter' | 'rebuildField' | 'replaceBag' | 'wipe' }
  | { type: 'swabStroke'; zones: MeatusZone[]; startAtMeatus: boolean; outward: boolean; backtrack: boolean }
  | { type: 'placeDrape'; offset: number }
  | { type: 'liftDrape' }
  | { type: 'lubricate'; from: number; to: number }
  | { type: 'catheterToMeatus'; target: 'meatus' | 'thigh' | 'drape-edge' | 'bed' }
  | { type: 'advance'; delta: number; rate: number; deviation: number }
  | { type: 'withdraw'; delta: number }
  | { type: 'resistanceChoice'; choice: 'stop-help' | 'force' | 'withdraw-out' }
  | { type: 'requestHelp' }
  | { type: 'teacherResume' }
  | { type: 'balloonTool'; tool: ItemId }
  | { type: 'syringePort'; port: 'balloon' | 'drain' }
  | { type: 'inflate'; ml: number }
  | { type: 'deflate' }
  | { type: 'pullBack'; delta: number; rate: number }
  | { type: 'capOff'; method: 'cap' | 'tip' }
  | { type: 'connectBag' }
  | { type: 'tapeCatheter'; site: 'thigh' | 'abdomen' }
  | { type: 'hangBag'; site: 'bedFrame' | 'abdomen' | 'rail' }
  | { type: 'dispose'; waste: WasteId; bin: BinId }
  | { type: 'wrapUp'; id: WrapUpId };

const ALL_ITEMS: ItemId[] = ['kit', 'catheter', 'gloves', 'examGloves', 'mask', 'iodine', 'saline', 'water', 'syringe', 'jelly', 'gauze', 'bag', 'tape'];

function newCatheter(resistancePlanned: boolean, spareUsed = 0): CatheterState {
  return {
    loc: 'cart',
    peeled: false,
    spareUsed,
    lube: [],
    pos: 'none',
    depth: 0,
    maxDepth: 0,
    urineReturned: false,
    fastEvents: 0,
    directionEvents: 0,
    forced: false,
    helpRequests: 0,
    resistancePlanned,
    resistanceDone: false,
    balloonTool: null,
    syringePort: 'none',
    balloonMl: 0,
    balloonBlocked: 0,
    safetyHold: false,
    pulled: 0,
    positioned: false,
  };
}

export function createInitialState(opts: { resistance: boolean }): CTState {
  return {
    activeStep: 'greet',
    visited: { greet: true },
    items: Object.fromEntries(ALL_ITEMS.map((i) => [i, 'cart'])) as Record<ItemId, Loc>,
    maskOn: false,
    curtain: false,
    comm: [],
    anxiety: 3,
    patientLine: '（皺著眉、手按著下腹）醫生……我肚子好脹，尿不出來……',
    pain: 0,
    hygiene: { before: null, after: null },
    contactStarted: false,
    kit: { onTable: false, flaps: [], jelly: false, iodine: CFG.antisepticProvidedByAssistant, swabsLeft: 6 },
    gloves: { status: 'none', progress: 0, donningClean: true, everSterile: false, removedCount: 0, donningStarted: false },
    contaminations: [],
    lastWasRemedy: false,
    strokes: [],
    drape: { placed: false, offset: 0, inwardDrag: false, sterileGloves: false, beforeDisinfect: false, liftCount: 0 },
    catheter: newCatheter(opts.resistance),
    bag: { capOff: false, connectorContaminated: false, connected: false, connectedSterile: false, hang: null, spareUsed: 0 },
    tape: { site: null },
    disposal: {},
    wrapUp: [],
    seq: 0,
  };
}

/* ---------------- 推導狀態 ---------------- */
export const kitOpen = (s: CTState) => s.kit.onTable && s.kit.flaps.length === 4;
export const openRecords = (s: CTState, source?: ContamSource) => s.contaminations.filter((c) => !c.remediated && (!source || c.source === source));
export const glovesSterileNow = (s: CTState) => s.gloves.status === 'sterile' && openRecords(s, 'gloves').length === 0;
export const closedSystem = (s: CTState) => s.bag.connected;
export const sterileStatus = (s: CTState) =>
  sterileStatusOf(s.contaminations, s.gloves.status === 'sterile' && kitOpen(s), s.kit.onTable || s.gloves.donningStarted, s.lastWasRemedy);

export function lubeFromTip(lube: [number, number][]) {
  const sorted = [...lube].sort((a, b) => a[0] - b[0]);
  let reach = 0;
  for (const [a, b] of sorted) {
    if (a > reach + 0.02) break;
    reach = Math.max(reach, b);
  }
  return reach;
}
export const lubeTotal = (lube: [number, number][]) => {
  const sorted = [...lube].sort((a, b) => a[0] - b[0]);
  let total = 0;
  let end = 0;
  for (const [a, b] of sorted) {
    const st = Math.max(a, end);
    if (b > st) total += b - st;
    end = Math.max(end, b);
  }
  return total;
};

export const balloonGateOpen = (s: CTState) => s.catheter.pos === 'inserted' && s.catheter.urineReturned;

/** 依實際使用過的器材決定需要處理的廢棄物 */
export function availableWaste(s: CTState): WasteId[] {
  const out: WasteId[] = [];
  if (s.strokes.length) out.push('swabs');
  if (s.drape.placed) out.push('drape');
  if (s.kit.onTable && s.kit.flaps.length) out.push('tray');
  if (s.gloves.removedCount > 0) out.push('gloves');
  if (s.catheter.balloonTool === 'syringe' && s.catheter.syringePort !== 'none') out.push('syringe');
  if (s.catheter.peeled) out.push('catheterWrap');
  if (s.gloves.donningStarted) out.push('gloveWrap');
  return out;
}

const ev = (stepId: StepId | 'system', kind: NewEvent['kind'], code: string, message: string, why?: string): NewEvent => ({ stepId, kind, code, message, why });
const blocked = (stepId: StepId, message: string) => ev(stepId, 'system', 'blocked', message);

function contaminate(s: CTState, source: ContamSource, reason: string, stepId: StepId, why: string): NewEvent {
  s.seq += 1;
  s.contaminations = [...s.contaminations, { id: s.seq, source, reason, stepId, t: s.seq, recognized: false, remediated: false, usedWhileContaminated: false }];
  s.lastWasRemedy = false;
  return ev(stepId, 'contamination', `${source}-contaminated`, `${SOURCE_LABEL[source]}污染：${reason}`, why);
}

/** 用受污染的手套／器材繼續無菌操作：記錄「未立即更換」 */
function markUsed(s: CTState, sources: ContamSource[], stepId: StepId, what: string): NewEvent[] {
  const open = s.contaminations.filter((c) => !c.remediated && !c.usedWhileContaminated && sources.includes(c.source));
  if (!open.length) return [];
  s.contaminations = s.contaminations.map((c) => (open.includes(c) ? { ...c, usedWhileContaminated: true } : c));
  return [ev(stepId, 'error', 'used-contaminated', `在${open.map((o) => SOURCE_LABEL[o.source]).join('、')}已污染的情況下${what}`, '發現污染應立即補救（更換手套或器材），再繼續無菌操作。')];
}

/** 戴著無菌手套碰觸非無菌物 */
function gloveTouch(s: CTState, stepId: StepId, reason: string, why: string): NewEvent[] {
  if (s.gloves.status !== 'sterile' || closedSystem(s)) return [];
  if (openRecords(s, 'gloves').length) return [ev(stepId, 'action', 'touch', reason)];
  return [contaminate(s, 'gloves', reason, stepId, why)];
}

function clone(s: CTState): CTState {
  return { ...s, items: { ...s.items }, kit: { ...s.kit }, gloves: { ...s.gloves }, drape: { ...s.drape }, catheter: { ...s.catheter }, bag: { ...s.bag }, tape: { ...s.tape }, disposal: { ...s.disposal }, hygiene: { ...s.hygiene }, visited: { ...s.visited } };
}

export const catheterReducer: DomainReducer<CTState, CTAction> = (prev, a) => {
  const s = clone(prev);
  const step = s.activeStep;
  const out: NewEvent[] = [];
  const done = () => ({ state: s, events: out });

  switch (a.type) {
    case 'setStep':
      s.activeStep = a.step;
      s.visited[a.step] = true;
      return done();

    /* ---------------- 病人溝通 ---------------- */
    case 'comm': {
      const o = COMM_OPTION_MAP[a.optionId];
      if (!o) return done();
      s.comm = [...s.comm, o.id];
      s.anxiety = Math.max(0, Math.min(4, s.anxiety + o.anxiety));
      s.patientLine = o.reply;
      if (o.tags.includes('privacy')) s.curtain = true;
      out.push(ev(step, 'narration', `comm-${o.id}`, `向病人說明：「${o.text.length > 28 ? `${o.text.slice(0, 28)}…` : o.text}」`, o.tone === 'impatient' ? '語氣不耐煩會增加病人焦慮，評分項目 1 要求對話溫和。' : o.tone === 'jargon' ? '專業術語病人聽不懂，請改用日常用語。' : undefined));
      if (o.tone === 'impatient' || o.tone === 'jargon') out.push(ev(step, 'error', `comm-${o.tone}`, o.tone === 'impatient' ? '對話語氣不耐煩' : '說明使用病人聽不懂的術語', o.feedback));
      return done();
    }
    case 'curtain':
      if (s.curtain) return done();
      s.curtain = true;
      s.anxiety = Math.max(0, s.anxiety - 1);
      out.push(...gloveTouch(s, step, '戴著無菌手套拉隔簾', HOTSPOTS.curtain.why));
      out.push(ev(step, 'action', 'curtain', '拉上隔簾，保護病人隱私'));
      return done();
    case 'wearMask':
      if (s.maskOn) return done();
      if (s.gloves.status === 'sterile') out.push(...gloveTouch(s, step, '戴無菌手套後才戴口罩', HOTSPOTS.mask.why));
      s.maskOn = true;
      s.items.mask = 'worn';
      out.push(ev(step, 'action', 'mask', '戴上外科手術口罩'));
      return done();

    /* ---------------- 手部衛生 ---------------- */
    case 'hygiene': {
      if (s.gloves.status !== 'none') {
        out.push(blocked(step, '請先脫除手套，再執行手部衛生。'));
        return done();
      }
      const complete = HAND_AREAS.every((h) => a.areas.includes(h.id));
      const missing = HAND_AREAS.filter((h) => !a.areas.includes(h.id)).map((h) => h.title);
      if (a.phase === 'before') {
        const beforeContact = !s.contactStarted;
        s.hygiene.before = { done: true, areas: a.areas, beforeContact };
        out.push(ev('hygieneBefore', 'action', 'hygiene-before', `操作前乾洗手（搓揉 ${a.areas.length}/${HAND_AREAS.length} 個部位）`));
        if (!complete) out.push(ev('hygieneBefore', 'error', 'hygiene-incomplete', `手部衛生未搓到：${missing.join('、')}`, '指尖、拇指與指縫最容易漏掉，需完整搓揉才算方法正確。'));
        if (!beforeContact) out.push(ev('hygieneBefore', 'order', 'hygiene-late', '已開始接觸病人或無菌操作後才做手部衛生', '應在接觸病人與無菌物品「之前」執行手部衛生。'));
      } else {
        s.hygiene.after = { done: true, areas: a.areas };
        out.push(ev('hygieneAfter', 'action', 'hygiene-after', `操作後乾洗手（搓揉 ${a.areas.length}/${HAND_AREAS.length} 個部位）`));
        if (!complete) out.push(ev('hygieneAfter', 'error', 'hygiene-incomplete', `手部衛生未搓到：${missing.join('、')}`, '操作後同樣需要完整搓揉所有部位。'));
      }
      return done();
    }

    /* ---------------- 器材準備（SterileFieldManager） ---------------- */
    case 'placeItem': {
      const item = a.item;
      const eq = EQUIPMENT_MAP[item];
      const from = s.items[item];
      if (from === a.zone) return done();
      if (from === 'cart') out.push(...gloveTouch(s, step, `戴著無菌手套到工作車拿取${eq.name}`, HOTSPOTS.cart.why));
      if (item === 'kit') {
        if (a.zone === 'table' || a.zone === 'field') {
          s.kit.onTable = true;
          s.items.kit = 'table';
          out.push(ev('prep', 'action', 'kit-table', '把導尿包放上工作台面'));
        }
        return done();
      }
      if (a.zone === 'field') {
        if (!kitOpen(s)) {
          out.push(blocked(step, '請先把導尿包放上工作台並完全打開，建立無菌區。'));
          return done();
        }
        if (!eq.sterile) {
          s.items[item] = 'field';
          out.push(contaminate(s, 'field', `把非無菌的${eq.name}放進無菌區`, 'prep', '瓶身、管身與外包裝都不是無菌的，放進導尿包後整個無菌區都被污染。'));
          return done();
        }
        if (item === 'gloves') {
          out.push(blocked(step, '無菌手套請放在工作台（清潔區）上打開穿戴，不需放進導尿包。'));
          return done();
        }
        s.items[item] = 'field';
        if (item === 'catheter') s.catheter.peeled = true;
        if (s.gloves.status === 'sterile') {
          out.push(...gloveTouch(s, 'prep', `戴著無菌手套撕開${eq.name}外包裝`, '外包裝外層不是無菌的，應在戴手套前完成拆包。'));
        }
        if (a.method === 'hand-transfer' && s.gloves.status !== 'sterile') {
          out.push(contaminate(s, 'field', `裸手伸進無菌區放入${eq.name}`, 'prep', '裸手越過或碰觸無菌區會造成污染；應撕開包裝讓物品直接落入無菌區。'));
        } else if (a.method === 'with-wrapper') {
          out.push(contaminate(s, 'field', `${eq.name}連同外包裝放進無菌區`, 'prep', '外包裝外層不是無菌的。'));
        } else {
          out.push(ev('prep', 'action', 'place-field', `${eq.name}撕開包裝落入無菌區`));
        }
        return done();
      }
      if (s.items[item] === 'field') {
        out.push(blocked(step, '已放進無菌區的物品不要再拿出來；若受污染請使用「更換污染物品」。'));
        return done();
      }
      s.items[item] = a.zone;
      if (a.zone === 'table') out.push(ev('prep', 'action', 'place-table', `把${eq.name}放上工作台面`));
      if (item === 'examGloves' && a.zone === 'table') out.push(ev('prep', 'error', 'wrong-item', '準備了檢診手套（非無菌）', '導尿屬無菌操作，應準備無菌手套；檢診手套不適用。'));
      return done();
    }
    case 'openFlap': {
      if (!s.kit.onTable || s.kit.flaps.includes(a.flap)) return done();
      out.push(...gloveTouch(s, 'prep', '戴著無菌手套打開導尿包外層', '導尿包外層包布的外面不是無菌的。'));
      const reachOver = s.kit.flaps.some((f) => FLAP_RANK[f] < FLAP_RANK[a.flap]);
      s.kit.flaps = [...s.kit.flaps, a.flap];
      out.push(ev('prep', 'action', 'flap', `打開導尿包${FLAP_LABEL[a.flap]}`));
      if (reachOver) out.push(contaminate(s, 'field', `打開${FLAP_LABEL[a.flap]}時手臂越過已打開的無菌面`, 'prep', '應先開離身體最遠的一角、最後開近側，手臂才不會越過無菌區。'));
      if (s.kit.flaps.length === 4) out.push(ev('prep', 'action', 'field-ready', '導尿包已打開，建立無菌區'));
      return done();
    }
    case 'pour': {
      const item: ItemId = a.what === 'iodine' ? 'iodine' : 'jelly';
      if (!kitOpen(s)) {
        out.push(blocked(step, '請先打開導尿包。'));
        return done();
      }
      if (s.items[item] === 'cart') out.push(...gloveTouch(s, step, `戴著無菌手套到工作車拿${EQUIPMENT_MAP[item].name}`, HOTSPOTS.cart.why));
      else out.push(...gloveTouch(s, step, `戴著無菌手套拿${EQUIPMENT_MAP[item].name}`, '瓶身與管身不是無菌的，應在戴手套前倒好。'));
      if (s.items[item] === 'cart') s.items[item] = 'table';
      if (a.what === 'iodine') s.kit.iodine = true;
      else s.kit.jelly = true;
      const name = a.what === 'iodine' ? '優碘倒在沖洗棉枝上' : '潤滑劑擠入導尿包';
      if (a.method === 'above') out.push(ev('prep', 'action', `pour-${a.what}`, name));
      else out.push(contaminate(s, 'field', a.method === 'inside' ? `把${EQUIPMENT_MAP[item].name}拿進無菌區內倒` : `${EQUIPMENT_MAP[item].name}的管口／瓶口碰到無菌區`, 'prep', '瓶身與管口不是無菌的，應由上方倒入、不接觸無菌區。'));
      return done();
    }
    case 'touch': {
      const h = HOTSPOTS[a.hotspot];
      if (a.hotspot === 'curtain') return catheterReducer(prev, { type: 'curtain' });
      if (a.hotspot === 'mask' && !s.maskOn) return catheterReducer(prev, { type: 'wearMask' });
      const evs = gloveTouch(s, step, `${h.label}（戴無菌手套時）`, h.why);
      out.push(...(evs.length ? evs : [ev(step, 'action', 'touch', h.label)]));
      return done();
    }

    /* ---------------- 手套 ---------------- */
    case 'gloveDecision': {
      const d = STERILE_GLOVE_DECISIONS[s.gloves.progress];
      if (!d || d.id !== a.decision) return done();
      if (s.gloves.status === 'exam') {
        out.push(blocked('gloves', '請先脫下檢診手套。'));
        return done();
      }
      const o = d.options.find((x) => x.id === a.option)!;
      s.gloves.donningStarted = true;
      s.contactStarted = true;
      if (s.items.gloves === 'cart') s.items.gloves = 'table';
      s.gloves.progress += 1;
      if (o.correct) out.push(ev('gloves', 'action', `glove-${d.id}`, `${d.title}：${o.text}`));
      else {
        s.gloves.donningClean = false;
        out.push(contaminate(s, 'gloves', `${d.title}時${o.text}`, 'gloves', o.why));
      }
      if (s.gloves.progress >= STERILE_GLOVE_DECISIONS.length) {
        s.gloves.status = 'sterile';
        s.gloves.everSterile = true;
        s.items.gloves = 'worn';
        // 換上新手套：手套相關污染完成補救
        const had = s.contaminations.some((c) => c.source === 'gloves' && !c.remediated && c.recognized);
        if (had) {
          s.contaminations = s.contaminations.map((c) => (c.source === 'gloves' && c.recognized ? { ...c, remediated: true } : c));
          s.lastWasRemedy = true;
          out.push(ev('gloves', 'remediation', 'gloves-replaced', '已換上新的無菌手套，完成補救'));
        }
        out.push(ev('gloves', 'action', 'gloved', '無菌手套穿戴完成'));
      }
      return done();
    }
    case 'wearExamGloves':
      if (s.gloves.status !== 'none') return done();
      s.gloves.status = 'exam';
      s.items.examGloves = 'worn';
      s.contactStarted = true;
      out.push(ev(step, 'error', 'exam-gloves', '戴上檢診手套（非無菌）準備導尿', '導尿是無菌操作，需要穿戴無菌手套。這是不適當的器材選擇。'));
      return done();
    case 'removeGloves': {
      if (s.gloves.status === 'none' && s.gloves.progress === 0) return done();
      const wasSterile = s.gloves.status === 'sterile';
      s.gloves = { ...s.gloves, status: 'none', progress: 0 };
      s.gloves.removedCount += 1;
      if (s.items.examGloves === 'worn') s.items.examGloves = 'table';
      // 脫下手套＝辨識手套污染
      s.contaminations = s.contaminations.map((c) => (c.source === 'gloves' && !c.remediated ? { ...c, recognized: true } : c));
      out.push(ev(step, 'action', 'gloves-off', wasSterile ? '脫下手套' : '脫下手套'));
      return done();
    }

    /* ---------------- 污染辨識與補救 ---------------- */
    case 'recognize': {
      const open = openRecords(s);
      if (!open.length) {
        out.push(blocked(step, '目前沒有未處理的污染紀錄。'));
        return done();
      }
      s.contaminations = s.contaminations.map((c) => (c.remediated ? c : { ...c, recognized: true }));
      out.push(ev(step, 'remediation', 'recognized', `察覺污染：${open.map((o) => SOURCE_LABEL[o.source]).join('、')}`));
      return done();
    }
    case 'remedy': {
      const markFixed = (sources: ContamSource[], msg: string) => {
        const had = s.contaminations.some((c) => !c.remediated && sources.includes(c.source));
        s.contaminations = s.contaminations.map((c) => (!c.remediated && sources.includes(c.source) ? { ...c, recognized: true, remediated: true } : c));
        if (had) {
          s.lastWasRemedy = true;
          out.push(ev(step, 'remediation', `remedy-${a.kind}`, msg));
        } else out.push(ev(step, 'action', `remedy-${a.kind}`, msg));
      };
      switch (a.kind) {
        case 'wipe':
          out.push(ev(step, 'error', 'wipe', '以擦拭代替更換受污染的物品', '擦拭或消毒手套、器材都無法恢復無菌，應更換新的。'));
          return done();
        case 'changeGloves':
          return catheterReducer(prev, { type: 'removeGloves' });
        case 'replaceCatheter':
          if (s.catheter.pos !== 'none' && s.catheter.pos !== 'at-meatus') {
            out.push(blocked(step, '導尿管已置入，模擬中不提供更換；若置入後懷疑污染，請停止並尋求臨床教師協助。'));
            return done();
          }
          s.catheter = { ...newCatheter(s.catheter.resistancePlanned && !s.catheter.resistanceDone, s.catheter.spareUsed + 1), peeled: s.catheter.peeled };
          s.items.catheter = 'cart';
          markFixed(['catheter'], '更換新的導尿管（需重新拆包、潤滑）');
          return done();
        case 'rebuildField':
          if (s.catheter.pos !== 'none' && s.catheter.pos !== 'at-meatus') {
            out.push(blocked(step, '導尿管已置入，無法重建導尿包；請尋求臨床教師協助。'));
            return done();
          }
          s.kit = { onTable: false, flaps: [], jelly: false, iodine: CFG.antisepticProvidedByAssistant, swabsLeft: 6 };
          s.items.kit = 'cart';
          for (const id of ALL_ITEMS) if (s.items[id] === 'field') s.items[id] = 'cart';
          if (!s.drape.placed) s.drape = { ...s.drape };
          s.catheter = { ...newCatheter(s.catheter.resistancePlanned && !s.catheter.resistanceDone, s.catheter.spareUsed + 1), peeled: s.catheter.peeled };
          markFixed(['field', 'catheter'], '更換新的導尿包，重新建立無菌區（需重新備物）');
          return done();
        case 'replaceBag':
          s.bag = { ...s.bag, capOff: false, connectorContaminated: false, spareUsed: s.bag.spareUsed + 1 };
          markFixed(['connector'], '更換新的尿袋');
          return done();
      }
      return done();
    }

    /* ---------------- 消毒 ---------------- */
    case 'swabStroke': {
      if (!kitOpen(s)) {
        out.push(blocked('disinfect', '沖洗棉枝在導尿包內，請先打開導尿包。'));
        return done();
      }
      if (!s.kit.iodine) {
        out.push(blocked('disinfect', '棉枝還是乾的：請先在器材準備階段把優碘倒在棉枝上。'));
        return done();
      }
      if (s.kit.swabsLeft <= 0) {
        out.push(blocked('disinfect', '導尿包內的 6 支棉枝已用完。'));
        return done();
      }
      s.kit.swabsLeft -= 1;
      s.contactStarted = true;
      const gloveOk = glovesSterileNow(s);
      const fieldOk = openRecords(s, 'field').length === 0;
      if (s.gloves.status !== 'sterile') out.push(ev('disinfect', 'error', 'disinfect-no-sterile-gloves', s.gloves.status === 'exam' ? '戴檢診手套進行消毒' : '未戴無菌手套進行消毒', '消毒屬無菌操作，持棉枝的手應戴無菌手套。'));
      else out.push(...markUsed(s, ['gloves'], 'disinfect', '進行消毒'));
      if (!fieldOk) out.push(...markUsed(s, ['field'], 'disinfect', '使用導尿包內的棉枝消毒'));
      const sterileOk = gloveOk && fieldOk && a.startAtMeatus && a.outward && !a.backtrack;
      s.strokes = [...s.strokes, { zones: a.zones, startAtMeatus: a.startAtMeatus, outward: a.outward, backtrack: a.backtrack, sterileOk, afterDrape: s.drape.placed }];
      out.push(ev('disinfect', 'action', 'swab', `第 ${s.strokes.length} 支棉枝消毒（${a.zones.map((z) => ({ meatus: '尿道口', glans: '龜頭', shaft: '陰莖體' })[z]).join('→') || '未接觸消毒部位'}）`));
      if (!a.zones.length) out.push(ev('disinfect', 'error', 'swab-miss', '棉枝沒有接觸到需要消毒的部位'));
      if (a.zones.length && !a.startAtMeatus) out.push(ev('disinfect', 'error', 'swab-start', '消毒沒有從尿道口開始', '本模擬依教學示意：從尿道口開始、由內往外（細節依院內感染管制規範）。'));
      if (a.backtrack) out.push(ev('disinfect', 'error', 'swab-backtrack', '棉枝回到已消毒的中心', '由外回到中心會把周圍的菌帶回尿道口；每支棉枝只用一次、一個方向。'));
      else if (a.zones.length && !a.outward) out.push(ev('disinfect', 'error', 'swab-inward', '消毒方向由外往內', '應由內往外消毒。'));
      if (s.drape.placed && s.strokes.filter((x) => !x.afterDrape).length === 0) out.push(ev('disinfect', 'order', 'disinfect-after-drape', '鋪洞巾後才進行消毒', '本教案第 7 項要求「先消毒後鋪洞巾」。'));
      if (s.anxiety >= 3 && !s.comm.some((c) => COMM_OPTION_MAP[c].phase === 'disinfect')) s.patientLine = '欸？好冰！你在做什麼？';
      return done();
    }

    /* ---------------- 鋪洞巾 ---------------- */
    case 'placeDrape': {
      if (!kitOpen(s)) {
        out.push(blocked('drape', '洞巾在導尿包內，請先打開導尿包。'));
        return done();
      }
      if (s.drape.placed) return done();
      s.contactStarted = true;
      const gloveOk = glovesSterileNow(s);
      if (s.gloves.status !== 'sterile') out.push(ev('drape', 'error', 'drape-no-sterile-gloves', '未戴無菌手套鋪洞巾', '洞巾是無菌物品，應戴無菌手套拿取。'));
      else out.push(...markUsed(s, ['gloves'], 'drape', '鋪洞巾'));
      out.push(...markUsed(s, ['field'], 'drape', '使用導尿包內的洞巾'));
      const beforeDisinfect = s.strokes.length === 0;
      s.drape = { ...s.drape, placed: true, offset: a.offset, sterileGloves: gloveOk, beforeDisinfect: s.drape.liftCount ? s.drape.beforeDisinfect : beforeDisinfect };
      const aligned = a.offset <= CFG.drape.alignTolerance;
      out.push(ev('drape', 'action', 'drape', aligned ? '鋪上洞巾，開口對準尿道口' : '鋪上洞巾，但開口沒有對準尿道口'));
      if (!aligned) out.push(ev('drape', 'error', 'drape-misaligned', '洞巾開口未對準操作部位', '洞巾應一次對準放下；放歪後不能從外往內拖動調整。'));
      if (beforeDisinfect) out.push(ev('drape', 'order', 'drape-before-disinfect', '尚未消毒就先鋪洞巾', '本教案第 7 項要求「先消毒後鋪洞巾」；鋪單後再消毒容易碰觸洞巾邊緣。'));
      return done();
    }
    case 'liftDrape':
      if (!s.drape.placed) return done();
      s.drape = { ...s.drape, placed: false, inwardDrag: true, liftCount: s.drape.liftCount + 1 };
      out.push(ev('drape', 'error', 'drape-adjust', '已接觸皮膚的洞巾拿起來重新調整', '洞巾接觸皮膚後邊緣已不再無菌，重新調整會把外圍的菌帶進開口；應一次放好，必要時更換新的洞巾。'));
      return done();

    /* ---------------- 潤滑 ---------------- */
    case 'lubricate': {
      if (s.items.catheter !== 'field') {
        out.push(blocked('lubricate', '導尿管還沒有放進無菌區。'));
        return done();
      }
      if (!s.kit.jelly) {
        out.push(blocked('lubricate', '導尿包內還沒有潤滑劑：請先在器材準備階段擠入 Jelly。'));
        return done();
      }
      if (s.catheter.pos !== 'none') {
        out.push(blocked('lubricate', '導尿管已在置入流程中。'));
        return done();
      }
      const before = lubeFromTip(s.catheter.lube);
      s.catheter.lube = [...s.catheter.lube, [Math.min(a.from, a.to), Math.max(a.from, a.to)]];
      if (s.gloves.status !== 'sterile') out.push(ev('lubricate', 'error', 'lube-no-sterile-gloves', '未戴無菌手套拿導尿管塗抹潤滑劑', '導尿管是無菌物品，應戴無菌手套操作。'));
      else out.push(...markUsed(s, ['gloves'], 'lubricate', '拿導尿管塗潤滑劑'));
      out.push(...markUsed(s, ['field', 'catheter'], 'lubricate', '塗抹潤滑劑'));
      const after = lubeFromTip(s.catheter.lube);
      if (after > before + 0.01 || before === 0) out.push(ev('lubricate', 'action', 'lube', `塗抹潤滑劑（由尖端起約 ${Math.round(after * 100)}% 管長）`));
      return done();
    }

    /* ---------------- 置入（CatheterInsertionSimulator） ---------------- */
    case 'catheterToMeatus': {
      const c = s.catheter;
      if (s.items.catheter !== 'field') {
        out.push(blocked('insert', '請先把導尿管拆包放進無菌區並完成潤滑。'));
        return done();
      }
      if (c.pos !== 'none') return done();
      s.contactStarted = true;
      if (a.target !== 'meatus') {
        const where = { thigh: '病人大腿（未消毒區）', 'drape-edge': '洞巾外緣', bed: '床單' }[a.target];
        out.push(contaminate(s, 'catheter', `導尿管尖端碰到${where}`, 'insert', '導尿管尖端碰觸非無菌區即受污染，需更換新的導尿管。'));
        return done();
      }
      c.pos = 'at-meatus';
      out.push(ev('insert', 'action', 'at-meatus', '導尿管尖端移至尿道口'));
      if (lubeFromTip(c.lube) === 0) out.push(ev('insert', 'error', 'no-lube', '導尿管未塗潤滑劑就準備置入', '未潤滑會增加摩擦與疼痛，也可能造成損傷。'));
      return done();
    }
    case 'advance': {
      const c = s.catheter;
      if (c.pos === 'resistance' || c.pos === 'help') {
        out.push(blocked('insert', c.pos === 'resistance' ? '目前有模擬阻力事件，請先選擇處理方式。' : '已暫停，等待臨床教師協助。'));
        return done();
      }
      if (c.pos === 'none') {
        out.push(blocked('insert', '請先把導尿管尖端移到尿道口。'));
        return done();
      }
      if (c.pos === 'inserted') return done();
      // 安全中止：受污染的導尿管或手套不可置入
      const unsafe = openRecords(s, 'catheter').length || s.gloves.status !== 'sterile' || openRecords(s, 'gloves').length || openRecords(s, 'field').length;
      if (unsafe) {
        if (c.safetyHold) {
          out.push(blocked('insert', '安全中止中：請先完成補救（更換手套、導尿包或導尿管）再置入。'));
          return done();
        }
        c.safetyHold = true;
        out.push(...markUsed(s, ['gloves', 'catheter', 'field'], 'insert', '準備置入'));
        out.push(
          ev(
            'insert',
            'error',
            'safety-stop',
            s.gloves.status !== 'sterile' ? '安全中止：未戴無菌手套不可置入導尿管' : '安全中止：手套、導尿包或導尿管已受污染，不可置入',
            '將受污染的導尿管置入膀胱可能造成泌尿道感染。模擬已阻止此動作，請先完成補救。',
          ),
        );
        return done();
      }
      c.safetyHold = false;
      if (a.deviation > CFG.insertion.directionTolerance) {
        c.directionEvents += 1;
        out.push(ev('insert', 'error', 'direction', '推進方向偏離導尿管軸線', '沿著導尿管與尿道口的軸線推進，偏離方向會增加摩擦與損傷風險。'));
        return done();
      }
      let delta = a.delta;
      if (a.rate > CFG.insertion.maxSafeRate) {
        c.fastEvents += 1;
        delta = Math.min(delta, 0.01);
        s.pain = 2;
        s.patientLine = '啊——好痛！慢一點……';
        s.anxiety = Math.min(4, s.anxiety + 1);
        out.push(ev('insert', 'error', 'too-fast', '推進速度過快', '導尿管應緩慢、受控地置入；快速推進可能造成尿道損傷與疼痛。'));
      }
      const firstMove = c.depth === 0;
      if (firstMove) {
        c.pos = 'inserting';
        out.push(ev('insert', 'action', 'insert-start', '開始置入導尿管'));
        if (!s.comm.some((id) => COMM_OPTION_MAP[id].phase === 'insert')) s.patientLine = '（身體縮了一下）……要開始了嗎？';
      }
      let next = Math.min(1, c.depth + delta);
      if (c.resistancePlanned && !c.resistanceDone && c.depth < CFG.insertion.resistanceAt && next >= CFG.insertion.resistanceAt) {
        next = CFG.insertion.resistanceAt;
        c.pos = 'resistance';
        s.patientLine = '嗯……有點卡卡的、不太舒服。';
        out.push(ev('insert', 'system', 'resistance', '模擬事件：推進時感到阻力', '網頁中的阻力是教學情境事件，不代表真實組織阻力。遇到不明阻力時不可強行推進。'));
      }
      c.depth = next;
      c.maxDepth = Math.max(c.maxDepth, next);
      if (!c.urineReturned && c.depth >= CFG.insertion.urineAt) {
        c.urineReturned = true;
        s.anxiety = Math.max(0, s.anxiety - 1);
        out.push(ev('insert', 'action', 'urine', '模擬事件：見尿液流出'));
      }
      if (c.depth >= 1 && c.pos !== 'resistance') {
        c.pos = 'inserted';
        out.push(ev('insert', 'action', 'inserted', '導尿管已置入至末端（分叉處，模擬）'));
      }
      return done();
    }
    case 'withdraw': {
      const c = s.catheter;
      if (c.pos === 'none' || c.balloonMl > 0) return done();
      c.depth = Math.max(0, c.depth - a.delta);
      if (c.pos === 'inserted') c.pos = 'inserting';
      if (c.depth === 0) {
        c.pos = 'at-meatus';
        out.push(ev('insert', 'action', 'withdrawn', '導尿管退回尿道口'));
      }
      return done();
    }
    case 'resistanceChoice': {
      const c = s.catheter;
      if (c.pos !== 'resistance') return done();
      if (a.choice === 'force') {
        if (c.forced) {
          out.push(blocked('insert', '已安全中止：請選擇停止並尋求協助。'));
          return done();
        }
        c.forced = true;
        s.pain = 3;
        s.anxiety = 4;
        s.patientLine = '啊——！好痛！停一下！';
        out.push(ev('insert', 'error', 'safety-stop', '安全中止：遇到阻力仍選擇強行推進', '強行推進可能造成尿道損傷或假通道。遇到不明阻力應停止、安撫病人並尋求臨床指導。'));
        return done();
      }
      if (a.choice === 'withdraw-out') {
        c.pos = 'at-meatus';
        c.depth = 0;
        out.push(ev('insert', 'action', 'withdraw-out', '停止推進並將導尿管退出'));
        out.push(ev('insert', 'action', 'help', '尋求臨床教師協助評估'));
        c.helpRequests += 1;
        c.resistanceDone = true;
        return done();
      }
      c.pos = 'help';
      c.helpRequests += 1;
      s.patientLine = '好，我慢慢呼吸……';
      out.push(ev('insert', 'remediation', 'help', '停止推進、安撫病人，並尋求臨床教師協助'));
      return done();
    }
    case 'requestHelp': {
      const c = s.catheter;
      if (c.pos === 'none' || c.pos === 'inserted') {
        out.push(ev(step, 'action', 'help', '尋求臨床教師協助'));
        return done();
      }
      c.pos = 'help';
      c.helpRequests += 1;
      out.push(ev('insert', 'remediation', 'help', '主動暫停並尋求臨床教師協助'));
      return done();
    }
    case 'teacherResume': {
      const c = s.catheter;
      if (c.pos !== 'help') return done();
      c.resistanceDone = true;
      c.pos = c.depth >= 1 ? 'inserted' : c.depth > 0 ? 'inserting' : 'at-meatus';
      out.push(ev('insert', 'system', 'teacher', '模擬臨床教師：已協助評估，可繼續緩慢推進'));
      return done();
    }

    /* ---------------- 水球（BalloonSafetyGate） ---------------- */
    case 'balloonTool': {
      const c = s.catheter;
      if (s.items[a.tool] === 'cart') out.push(...gloveTouch(s, 'balloon', `戴著無菌手套到工作車拿取${EQUIPMENT_MAP[a.tool].name}`, HOTSPOTS.cart.why));
      if (a.tool !== 'syringe') {
        out.push(ev('balloon', 'error', 'balloon-wrong-tool', `選擇${EQUIPMENT_MAP[a.tool].name}打水球`, '依教案，打尿管水球使用已抽好蒸餾水的 10 mL 空針。'));
        return done();
      }
      c.balloonTool = 'syringe';
      if (s.items.syringe === 'cart') s.items.syringe = 'table';
      out.push(ev('balloon', 'action', 'balloon-tool', '拿起已抽好蒸餾水的 10 mL 空針'));
      return done();
    }
    case 'syringePort': {
      const c = s.catheter;
      if (c.balloonTool !== 'syringe') {
        out.push(blocked('balloon', '請先選擇打水球的工具。'));
        return done();
      }
      if (!balloonGateOpen(s)) {
        c.balloonBlocked += 1;
        out.push(ev('balloon', 'error', 'balloon-gate', `尚未達到模擬定位條件就準備打水球（${!c.urineReturned ? '尚未見尿' : '尚未置入至導尿管末端'}）`, '水球若在尿道內撐開會造成嚴重損傷。依教案須見尿並置入至末端後才打水球。'));
        return done();
      }
      c.syringePort = a.port;
      if (a.port === 'drain') out.push(ev('balloon', 'error', 'wrong-port', '空針接到引流管腔', '分叉中一端是引流管腔（接尿袋）、另一端是水球管腔；打水要接水球管腔。'));
      else out.push(ev('balloon', 'action', 'balloon-port', '空針接上水球管腔'));
      return done();
    }
    case 'inflate': {
      const c = s.catheter;
      if (!balloonGateOpen(s)) {
        c.balloonBlocked += 1;
        out.push(ev('balloon', 'error', 'balloon-gate', '尚未達到模擬定位條件，系統阻擋打水球', '請先完成置入並確認見尿。'));
        return done();
      }
      if (c.syringePort !== 'balloon') {
        out.push(blocked('balloon', c.syringePort === 'drain' ? '目前空針接在引流管腔，請改接水球管腔。' : '請先把空針接到水球管腔。'));
        return done();
      }
      c.balloonMl = a.ml;
      out.push(ev('balloon', 'action', 'inflate', `打入水球 ${a.ml} mL 蒸餾水`));
      if (a.ml < CFG.balloon.minMl || a.ml > CFG.balloon.maxMl) out.push(ev('balloon', 'error', 'balloon-volume', `水球容量 ${a.ml} mL 不符本教案要求（${CFG.balloon.label}）`, '水量不足水球可能無法固定；過多可能造成不適。實際容量依產品標示與院內 SOP。'));
      return done();
    }
    case 'deflate': {
      const c = s.catheter;
      if (!c.balloonMl || c.positioned) return done();
      c.balloonMl = 0;
      out.push(ev('balloon', 'action', 'deflate', '抽回水球內的水'));
      return done();
    }
    case 'pullBack': {
      const c = s.catheter;
      if (c.pos !== 'inserted') {
        out.push(blocked('balloon', '導尿管尚未置入至末端。'));
        return done();
      }
      if (!c.balloonMl) {
        out.push(ev('balloon', 'error', 'pull-no-balloon', '水球未打水就回拉導尿管', '水球沒有撐開時回拉，導尿管會滑出；應先打水球再輕拉至定位。'));
        return done();
      }
      if (c.positioned) return done();
      if (a.rate > CFG.insertion.maxSafeRate) out.push(ev('balloon', 'error', 'pull-fast', '回拉動作過快、過猛', '輕拉至感覺卡住即可，用力拉扯可能造成損傷。'));
      c.pulled = Math.min(CFG.insertion.seatPull, c.pulled + a.delta);
      if (c.pulled >= CFG.insertion.seatPull) {
        c.positioned = true;
        c.pulled = CFG.insertion.seatPull;
        out.push(ev('balloon', 'action', 'positioned', '輕拉導尿管至卡住，完成定位（模擬：水球卡在膀胱頸處）'));
      }
      return done();
    }

    /* ---------------- 尿袋（DrainageBagConnector） ---------------- */
    case 'capOff': {
      if (s.bag.capOff) return done();
      if (s.items.bag === 'cart') out.push(...gloveTouch(s, 'connect', '戴著無菌手套到工作車拿尿袋', HOTSPOTS.cart.why));
      if (s.items.bag === 'cart') s.items.bag = 'table';
      s.bag.capOff = true;
      if (a.method === 'tip') {
        s.bag.connectorContaminated = true;
        out.push(contaminate(s, 'connector', '取下保護蓋時手指碰到接頭尖端', 'connect', '接頭是進入封閉引流系統的入口，碰觸後即受污染，應更換新的尿袋。'));
      } else out.push(ev('connect', 'action', 'cap-off', '取下尿袋接頭保護蓋'));
      return done();
    }
    case 'connectBag': {
      if (!s.bag.capOff) {
        out.push(blocked('connect', '請先取下尿袋接頭的保護蓋。'));
        return done();
      }
      if (s.catheter.pos !== 'inserted' && s.items.catheter !== 'field') {
        out.push(blocked('connect', '導尿管尚未準備好。'));
        return done();
      }
      if (s.bag.connected) return done();
      const sterile = !s.bag.connectorContaminated && glovesSterileNow(s) && openRecords(s, 'catheter').length === 0;
      out.push(...markUsed(s, ['gloves', 'connector'], 'connect', '連接尿袋'));
      s.bag.connected = true;
      s.bag.connectedSterile = sterile;
      out.push(ev('connect', 'action', 'connected', '尿袋接頭與導尿管引流端完成連接'));
      if (!sterile) out.push(ev('connect', 'error', 'connect-not-sterile', '連接尿袋時未遵守無菌技術', s.gloves.status !== 'sterile' ? '連接時應仍戴著無菌手套。' : '接頭或手套已受污染。'));
      if (s.catheter.pos === 'inserted') s.patientLine = '尿流出來了……肚子鬆多了。';
      return done();
    }
    case 'tapeCatheter': {
      if (s.tape.site) return done();
      if (s.catheter.pos !== 'inserted') {
        out.push(blocked('connect', '導尿管尚未置入。'));
        return done();
      }
      s.tape.site = a.site;
      if (s.items.tape === 'cart') s.items.tape = 'table';
      out.push(...gloveTouch(s, 'connect', '尿袋連接前就拿紙膠固定', '紙膠不是無菌的。'));
      out.push(ev('connect', 'action', 'tape', `以紙膠固定導尿管於${a.site === 'thigh' ? '大腿' : '下腹部'}`));
      return done();
    }
    case 'hangBag': {
      if (!s.bag.connected) {
        out.push(blocked('connect', '請先把尿袋連接到導尿管。'));
        return done();
      }
      s.bag.hang = a.site;
      const label = { bedFrame: '床緣掛勾', abdomen: '病人腹部上', rail: '床頭高處欄杆' }[a.site];
      out.push(ev('connect', 'action', 'hang', `尿袋固定於${label}`));
      if (a.site !== 'bedFrame') out.push(ev('connect', 'error', 'bag-height', '尿袋位置高於或接近膀胱高度', '尿袋應低於膀胱，利用重力引流、避免尿液逆流（固定細節依院內 SOP）。此項為形成性回饋，不影響教案第 12 項評分。'));
      return done();
    }

    /* ---------------- 廢棄物與結束 ---------------- */
    case 'dispose': {
      if (s.disposal[a.waste]) return done();
      s.disposal[a.waste] = a.bin;
      const w = WASTE[a.waste];
      out.push(ev('disposal', 'action', 'dispose', `${w.name} → ${a.bin === 'infectious' ? '感染性垃圾桶' : '一般垃圾桶'}`));
      if (w.correct === 'infectious' && a.bin !== 'infectious') out.push(ev('disposal', 'error', 'waste-wrong', `${w.name}丟入一般垃圾桶`, `${w.reason}屬感染性廢棄物，應丟入感染性垃圾桶。`));
      if (w.correct === 'general' && a.bin !== 'general') out.push(ev('disposal', 'system', 'waste-advisory', `${w.name}可丟一般垃圾桶`, '未污染的包裝放進感染性垃圾桶不影響評分，但會增加醫療廢棄物處理量。'));
      return done();
    }
    case 'wrapUp':
      if (s.wrapUp.includes(a.id)) return done();
      s.wrapUp = [...s.wrapUp, a.id];
      if (a.id === 'cover') s.anxiety = Math.max(0, s.anxiety - 1);
      out.push(ev('disposal', 'action', `wrap-${a.id}`, { cover: '協助病人穿好衣物、蓋好被單', curtain: '告知病人已完成並拉開隔簾', tidy: '整理工作車與操作環境' }[a.id]));
      return done();
  }
};

/** 單項重練：把指定階段之前的步驟預先完成（分數僅供參考） */
export function createFocusState(focus: StepId): CTState {
  const s = createInitialState({ resistance: true });
  const idx = STEP_IDS.indexOf(focus);
  const before = (id: StepId) => STEP_IDS.indexOf(id) < idx;
  if (before('greet')) {
    s.comm = ['b-intro', 'b-reassure', 'b-explain', 'b-privacy'];
    s.curtain = true;
    s.anxiety = 1;
    s.patientLine = '好，你慢慢來。';
  }
  if (before('hygieneBefore')) s.hygiene.before = { done: true, areas: HAND_AREAS.map((h) => h.id), beforeContact: true };
  if (before('prep')) {
    s.kit = { onTable: true, flaps: ['far', 'left', 'right', 'near'], jelly: true, iodine: true, swabsLeft: 6 };
    Object.assign(s.items, { kit: 'table', catheter: 'field', jelly: 'table', iodine: 'table', syringe: 'table', bag: 'table', tape: 'table', gloves: 'table', mask: 'worn' });
    s.maskOn = true;
    s.catheter.peeled = true;
  }
  if (before('gloves')) {
    s.gloves = { status: 'sterile', progress: STERILE_GLOVE_DECISIONS.length, donningClean: true, everSterile: true, removedCount: 0, donningStarted: true };
    s.items.gloves = 'worn';
    s.contactStarted = true;
  }
  if (before('disinfect')) {
    s.strokes = [0, 1, 2].map(() => ({ zones: ['meatus', 'glans', 'shaft'] as MeatusZone[], startAtMeatus: true, outward: true, backtrack: false, sterileOk: true, afterDrape: false }));
    s.kit.swabsLeft = 3;
  }
  if (before('drape')) s.drape = { placed: true, offset: 0, inwardDrag: false, sterileGloves: true, beforeDisinfect: false, liftCount: 0 };
  if (before('lubricate')) s.catheter.lube = [[0, 0.55]];
  if (before('insert')) Object.assign(s.catheter, { pos: 'inserted', depth: 1, maxDepth: 1, urineReturned: true, resistanceDone: true });
  if (before('balloon')) Object.assign(s.catheter, { balloonTool: 'syringe', syringePort: 'balloon', balloonMl: 10, positioned: true, pulled: CFG.insertion.seatPull });
  if (before('connect')) {
    s.bag = { capOff: true, connectorContaminated: false, connected: true, connectedSterile: true, hang: 'bedFrame', spareUsed: 0 };
    s.tape.site = 'thigh';
  }
  if (before('disposal')) {
    s.gloves = { ...s.gloves, status: 'none', progress: 0, removedCount: 1 };
    s.items.gloves = 'table';
    for (const w of availableWaste(s)) s.disposal[w] = WASTE[w].correct;
    s.wrapUp = ['cover', 'curtain', 'tidy'];
  }
  s.activeStep = focus;
  s.visited = Object.fromEntries(STEP_IDS.filter((id) => STEP_IDS.indexOf(id) <= idx).map((id) => [id, true]));
  return s;
}
