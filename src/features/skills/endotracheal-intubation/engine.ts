import type { DomainReducer } from '../../training/interactionEngine';
import type { NewEvent } from '../../training/types';
import { AUSC_LABEL, EQUIPMENT_MAP, REQUIRED_AUSC, STEP_IDS, TUBE_SIZE, TUBES, type AuscPoint, type ItemId, type StepId } from './caseData';
import { AIRWAY_CONFIG as CFG } from './rubricConfig';

/**
 * AIRWAY QUEST 互動引擎（純函式 reducer）
 *  - AirwayEquipmentTray：器材取用、喉頭鏡組裝與燈泡檢查、管徑選擇、cuff 檢查、潤滑、通條
 *  - VentilationSimulation：面罩方向／位置／密合、擠壓時間點 → 案例規則決定胸廓起伏與給氣速度
 *  - LaryngoscopeInteraction：持握手、上提方式 → 案例規則決定教學示意視野
 *  - IntubationSimulation／TubePositionState：管路位置（氣管／食道）、深度、嘗試次數
 *  - PlacementVerification：胸廓、五點聽診、（補充）波形二氧化碳
 *  - AirwaySafetyEvents：安全事件與安全中止
 * 所有「結果」皆由案例規則依學員操作決定，不使用隨機生理數據。
 */
export type Zone = 'cart' | 'tray';
export type MaskZone = 'correct' | 'eyes' | 'low';
export type Grip = 'one' | 'two' | 'fingertip';
export type TubeLocation = 'none' | 'trachea' | 'esophagus';

export interface Attempt {
  location: TubeLocation;
  depth: number | null;
  depthRead: boolean;
  styletRemoved: boolean;
  cuffInflated: boolean;
  syringeRemoved: boolean;
  bagConnected: boolean;
  postBreaths: number;
  chestObserved: boolean;
  /** 觀察胸廓之前是否已先做其他處置（聽診、監測、固定） */
  otherBeforeChest: boolean;
  ausc: AuscPoint[];
  auscNoVent: AuscPoint[];
  wrongAusc: AuscPoint[];
  capno: boolean;
  confirmed: boolean;
}

export interface AWState {
  activeStep: StepId;
  visited: Partial<Record<StepId, boolean>>;
  items: Record<ItemId, Zone>;
  glovesOn: boolean;
  handRub: boolean;
  scope: { assembled: boolean; lightChecked: boolean };
  tube: { size: ItemId | null; cuffChecked: boolean; lubed: boolean; stylet: 'none' | 'inside' | 'protruding' };
  mask: { placed: MaskZone | null; apexToHead: boolean; grip: Grip | null };
  /** 插管前（第一次嘗試前）每次擠壓的時間（秒） */
  preBreaths: number[];
  preRise: number;
  head: { towel: null | 'occiput' | 'shoulder'; extension: 'neutral' | 'moderate' | 'hyper'; confirmed: boolean; confirmedSniffing: boolean };
  scopeUse: { hand: null | 'left' | 'right'; inserted: boolean; lift: null | 'lift' | 'lever'; view: 'none' | 'poor' | 'glottis'; usedLeftLift: boolean };
  attempts: number;
  attempt: Attempt;
  firstSuccessAttempt: number | null;
  /** 拔管後需重新給氧 */
  needReox: boolean;
  reoxBreaths: number;
  secured: { bite: boolean; tied: boolean; esophagealBlocked: number };
  verbal: string[];
  /** 最後一次被確認／固定時的嘗試資料（評分用） */
  final: Attempt | null;
  safetyHold: boolean;
}

export type AWAction =
  | { type: 'setStep'; step: StepId }
  | { type: 'placeItem'; item: ItemId; zone: Zone }
  | { type: 'wearGloves' }
  | { type: 'handRub' }
  | { type: 'assembleScope' }
  | { type: 'checkLight' }
  | { type: 'selectTube'; item: ItemId }
  | { type: 'checkCuff'; method: 'syringe' | 'squeeze' }
  | { type: 'lubeTube' }
  | { type: 'insertStylet'; protruding: boolean }
  | { type: 'placeMask'; zone: MaskZone; apexToHead: boolean }
  | { type: 'removeMask' }
  | { type: 'setGrip'; grip: Grip }
  | { type: 'squeezeMask'; at: number }
  | { type: 'placeTowel'; where: 'occiput' | 'shoulder' }
  | { type: 'setExtension'; level: 'neutral' | 'moderate' | 'hyper' }
  | { type: 'confirmPosition' }
  | { type: 'selectHand'; hand: 'left' | 'right' }
  | { type: 'insertBlade' }
  | { type: 'lift'; how: 'lift' | 'lever' }
  | { type: 'intubate'; target: 'glottis' | 'esophagus' }
  | { type: 'setDepth'; cm: number }
  | { type: 'readDepth' }
  | { type: 'removeStylet'; held: boolean }
  | { type: 'inflateCuff' }
  | { type: 'deflateCuff' }
  | { type: 'removeSyringe' }
  | { type: 'connectBag' }
  | { type: 'squeezeTube' }
  | { type: 'observeChest' }
  | { type: 'auscultate'; point: AuscPoint }
  | { type: 'attachCapno' }
  | { type: 'confirmPlacement' }
  | { type: 'removeTube' }
  | { type: 'abort' }
  | { type: 'placeBite' }
  | { type: 'secureTube' }
  | { type: 'verbal'; id: string };

const ALL: ItemId[] = ['handle', 'blade', 'ett65', 'ett70', 'ett75', 'ett80', 'stylet', 'syringe', 'bite', 'ties', 'bvm', 'oralAirway', 'towel', 'stethoscope', 'drapeCloth', 'lube', 'gloves', 'handRub'];

export const newAttempt = (): Attempt => ({
  location: 'none',
  depth: null,
  depthRead: false,
  styletRemoved: false,
  cuffInflated: false,
  syringeRemoved: false,
  bagConnected: false,
  postBreaths: 0,
  chestObserved: false,
  otherBeforeChest: false,
  ausc: [],
  auscNoVent: [],
  wrongAusc: [],
  capno: false,
  confirmed: false,
});

export function createInitialState(): AWState {
  return {
    activeStep: 'prep',
    visited: { prep: true },
    items: Object.fromEntries(ALL.map((i) => [i, 'cart'])) as Record<ItemId, Zone>,
    glovesOn: false,
    handRub: false,
    scope: { assembled: false, lightChecked: false },
    tube: { size: null, cuffChecked: false, lubed: false, stylet: 'none' },
    mask: { placed: null, apexToHead: true, grip: null },
    preBreaths: [],
    preRise: 0,
    head: { towel: null, extension: 'neutral', confirmed: false, confirmedSniffing: false },
    scopeUse: { hand: null, inserted: false, lift: null, view: 'none', usedLeftLift: false },
    attempts: 0,
    attempt: newAttempt(),
    firstSuccessAttempt: null,
    needReox: false,
    reoxBreaths: 0,
    secured: { bite: false, tied: false, esophagealBlocked: 0 },
    verbal: [],
    final: null,
    safetyHold: false,
  };
}

/* ---------------- 案例規則 ---------------- */
export const maskSealed = (s: AWState) => s.mask.placed === 'correct' && s.mask.apexToHead && !!s.mask.grip && s.mask.grip !== 'fingertip';
export const tooDeep = (a: Attempt) => a.depth !== null && a.depth > CFG.caseRequirement.depth.max;
export const tooShallow = (a: Attempt) => a.depth !== null && a.depth < CFG.caseRequirement.depth.min;

export function chestFinding(a: Attempt) {
  if (a.location === 'esophagus') return { rise: 'none' as const, text: '胸廓沒有起伏，上腹部隨壓袋鼓起' };
  if (a.location === 'trachea' && tooDeep(a)) return { rise: 'right' as const, text: '右側胸廓起伏，左側起伏明顯較少' };
  if (a.location === 'trachea' && !a.cuffInflated) return { rise: 'weak' as const, text: '胸廓起伏不明顯，口部有漏氣聲（cuff 未充氣）' };
  if (a.location === 'trachea') return { rise: 'both' as const, text: '兩側胸廓明顯且規律起伏' };
  return { rise: 'none' as const, text: '尚未插管' };
}

export function auscFinding(a: Attempt, p: AuscPoint): string {
  if (!REQUIRED_AUSC.includes(p)) return '此處不是教案要求的五點聽診位置';
  if (a.location === 'esophagus') return p === 'epigastrium' ? '聽到氣過水聲（咕嚕聲）' : '幾乎聽不到呼吸音';
  if (p === 'epigastrium') return '沒有氣過水聲';
  if (tooDeep(a) && (p === 'leftApex' || p === 'leftBase')) return '呼吸音明顯減弱';
  if (!a.cuffInflated) return '呼吸音微弱，伴隨口部漏氣聲';
  return '呼吸音清楚，左右對稱';
}

export const capnoFinding = (a: Attempt) => (a.location === 'trachea' ? '每次通氣都出現持續、規律的方形波形' : a.location === 'esophagus' ? '沒有持續的二氧化碳波形' : '未插管');

/** 依擠壓時間計算給氣速度（次/分） */
export function breathRate(times: number[]) {
  if (times.length < CFG.caseRule.minBreathsForRate) return null;
  const iv = times.slice(1).map((t, i) => t - times[i]);
  const mean = iv.reduce((a, b) => a + b, 0) / iv.length;
  return mean > 0 ? 60 / mean : null;
}
export const rateOk = (r: number | null) => r !== null && r >= CFG.caseRequirement.ventRate.min - CFG.caseRule.rateTolerance && r <= CFG.caseRequirement.ventRate.max + CFG.caseRule.rateTolerance;
export const trayItems = (s: AWState) => ALL.filter((i) => s.items[i] === 'tray');

const ev = (stepId: StepId | 'system', kind: NewEvent['kind'], code: string, message: string, why?: string, safety?: boolean): NewEvent => ({ stepId, kind, code, message, why, safety });
const blocked = (stepId: StepId, message: string) => ev(stepId, 'system', 'blocked', message);
const safetyEv = (stepId: StepId, code: string, message: string, why: string) => ev(stepId, 'error', code, message, why, true);

function clone(s: AWState): AWState {
  return { ...s, items: { ...s.items }, scope: { ...s.scope }, tube: { ...s.tube }, mask: { ...s.mask }, head: { ...s.head }, scopeUse: { ...s.scopeUse }, attempt: { ...s.attempt }, secured: { ...s.secured }, visited: { ...s.visited } };
}

export const airwayReducer: DomainReducer<AWState, AWAction> = (prev, a) => {
  const s = clone(prev);
  const step = s.activeStep;
  const out: NewEvent[] = [];
  const done = () => ({ state: s, events: out });
  const at = s.attempt;

  switch (a.type) {
    case 'setStep':
      s.activeStep = a.step;
      s.visited[a.step] = true;
      return done();

    /* ---------------- 器材盤 ---------------- */
    case 'placeItem': {
      if (s.items[a.item] === a.zone) return done();
      s.items[a.item] = a.zone;
      out.push(ev('prep', 'action', a.zone === 'tray' ? 'tray' : 'untray', `${EQUIPMENT_MAP[a.item].name}${a.zone === 'tray' ? '放到器材盤' : '放回工作車'}`));
      if (a.zone === 'tray' && TUBES.includes(a.item)) return airwayReducer(s, { type: 'selectTube', item: a.item });
      return done();
    }
    case 'wearGloves':
      if (s.glovesOn) return done();
      s.glovesOn = true;
      out.push(ev('prep', 'action', 'gloves', '戴上檢診手套'));
      return done();
    case 'handRub':
      if (s.handRub) return done();
      s.handRub = true;
      out.push(ev('prep', 'action', 'handrub', '以乾性洗手液執行手部衛生'));
      return done();
    case 'assembleScope':
      if (s.items.handle !== 'tray' || s.items.blade !== 'tray') {
        out.push(blocked('prep', '請先把喉頭鏡握把與葉片都放到器材盤。'));
        return done();
      }
      if (s.scope.assembled) return done();
      s.scope.assembled = true;
      out.push(ev('prep', 'action', 'assemble', '將葉片扣上握把，組裝喉頭鏡'));
      return done();
    case 'checkLight':
      if (!s.scope.assembled) {
        out.push(blocked('prep', '請先組裝喉頭鏡。'));
        return done();
      }
      s.scope.lightChecked = true;
      out.push(ev('prep', 'action', 'light', '打開葉片：喉頭鏡燈泡會亮'));
      return done();
    case 'selectTube': {
      if (!TUBES.includes(a.item)) return done();
      s.items[a.item] = 'tray';
      if (s.tube.size === a.item) return done();
      const changed = !!s.tube.size;
      s.tube = { size: a.item, cuffChecked: false, lubed: false, stylet: 'none' };
      const size = TUBE_SIZE[a.item]!;
      out.push(ev('prep', 'action', 'tube', `選擇氣管內管 ID ${size.toFixed(1)}${changed ? '（更換）' : ''}`));
      if (!CFG.caseRequirement.tubeSizes.includes(size)) out.push(ev('prep', 'error', 'tube-size', `氣管內管 ID ${size.toFixed(1)} 不符合本教案要求`, `本教案（60 歲男性，165 公分 70 公斤）要求選擇內徑 ${CFG.caseRequirement.tubeSizes.map((x) => x.toFixed(1)).join(' 或 ')}。`));
      return done();
    }
    case 'checkCuff':
      if (!s.tube.size) {
        out.push(blocked('prep', '請先選擇氣管內管。'));
        return done();
      }
      if (a.method === 'squeeze') {
        out.push(ev('prep', 'error', 'cuff-squeeze', '只用手捏 pilot balloon 檢查 cuff', '教案要求「用空針確認」cuff 是否完整：打氣後觀察 cuff 是否膨起、不漏氣，再抽回。'));
        return done();
      }
      if (s.items.syringe !== 'tray') {
        out.push(blocked('prep', '請先把 10 mL 空針放到器材盤。'));
        return done();
      }
      s.tube.cuffChecked = true;
      out.push(ev('prep', 'action', 'cuff-check', '以 10 mL 空針打氣：cuff 膨起且不漏氣，確認完整後抽回'));
      return done();
    case 'lubeTube':
      if (!s.tube.size) {
        out.push(blocked('prep', '請先選擇氣管內管。'));
        return done();
      }
      if (s.items.lube !== 'tray') {
        out.push(blocked('prep', '請先把潤滑液放到器材盤。'));
        return done();
      }
      s.tube.lubed = true;
      out.push(ev('prep', 'action', 'lube', '於氣管內管管端塗抹潤滑液'));
      return done();
    case 'insertStylet':
      if (!s.tube.size || s.items.stylet !== 'tray') {
        out.push(blocked('prep', '請先選擇氣管內管並把通條放到器材盤。'));
        return done();
      }
      if (at.location !== 'none') return done();
      s.tube.stylet = a.protruding ? 'protruding' : 'inside';
      out.push(ev('prep', 'action', 'stylet', a.protruding ? '置入通條（前端超出管尖）' : '置入通條（前端未超出管尖）'));
      if (a.protruding) out.push(safetyEv('prep', 'stylet-protrude', '通條前端超出管尖', '【現行臨床安全補充】通條前端超出管尖可能損傷呼吸道組織，應調整到管尖之內。'));
      s.safetyHold = false;
      return done();

    /* ---------------- 袋瓣罩通氣 ---------------- */
    case 'placeMask':
      if (s.items.bvm !== 'tray') s.items.bvm = 'tray';
      if (at.location !== 'none') {
        out.push(blocked('bvm', '目前已插管，請改用「接上 Ambu bag」通氣。'));
        return done();
      }
      s.mask = { ...s.mask, placed: a.zone, apexToHead: a.apexToHead };
      out.push(ev('bvm', 'action', 'mask', `放置面罩（${a.apexToHead ? '尖端朝頭側' : '尖端朝腳側'}，${{ correct: '覆蓋口鼻', eyes: '位置偏高', low: '位置偏低' }[a.zone]}）`));
      if (!a.apexToHead) out.push(ev('bvm', 'error', 'mask-upside', '面罩方向放反', '面罩尖端應朝頭側（放在鼻樑），寬的一端蓋住口與下巴之間，才能密合。'));
      if (a.zone === 'eyes') out.push(safetyEv('bvm', 'mask-eyes', '面罩壓到眼睛', '面罩邊緣壓迫眼睛可能造成傷害；教案要求避免壓到眼睛。'));
      if (a.zone === 'low') out.push(ev('bvm', 'error', 'mask-low', '面罩位置偏低，沒有蓋住鼻子', '面罩需同時覆蓋口鼻才能密合。'));
      return done();
    case 'removeMask':
      if (!s.mask.placed) return done();
      s.mask = { placed: null, apexToHead: true, grip: null };
      out.push(ev('bvm', 'action', 'mask-off', '移開面罩'));
      return done();
    case 'setGrip':
      if (!s.mask.placed) {
        out.push(blocked('bvm', '請先放置面罩。'));
        return done();
      }
      s.mask.grip = a.grip;
      out.push(ev('bvm', 'action', 'grip', { one: '單手固定面罩', two: '雙手固定面罩', fingertip: '只用指尖按住面罩中央' }[a.grip]));
      if (a.grip === 'fingertip') out.push(ev('bvm', 'error', 'grip-weak', '面罩沒有確實密合', '只按中央無法讓面罩邊緣貼合臉部；教案接受單手或雙手固定。'));
      return done();
    case 'squeezeMask': {
      if (!s.mask.placed) {
        out.push(blocked('bvm', '請先放置面罩並固定。'));
        return done();
      }
      const rise = maskSealed(s);
      if (s.attempts === 0) {
        s.preBreaths = [...s.preBreaths, a.at];
        if (rise) s.preRise += 1;
      } else if (s.needReox) {
        s.reoxBreaths += 1;
        if (s.reoxBreaths === 2) out.push(ev('bvm', 'remediation', 'reox', '拔管後重新以袋瓣罩給氧'));
      }
      out.push(ev('bvm', 'action', 'squeeze', `擠壓袋瓣罩（${rise ? '胸廓起伏' : '胸廓沒有明顯起伏'}）`));
      if (!rise && !s.mask.grip) out.push(ev('bvm', 'error', 'no-grip', '面罩尚未固定就擠壓', '先以單手或雙手固定面罩，讓面罩密合。'));
      return done();
    }

    /* ---------------- 頭部擺位 ---------------- */
    case 'placeTowel':
      if (s.items.towel === 'cart') s.items.towel = 'tray';
      s.head.towel = a.where;
      out.push(ev('position', 'action', 'towel', `布捲墊在${a.where === 'occiput' ? '枕部（後腦）' : '肩膀下方'}`));
      return done();
    case 'setExtension':
      s.head.extension = a.level;
      out.push(ev('position', 'action', 'extension', `頭部${{ neutral: '維持平躺', moderate: '適度後仰', hyper: '過度後仰' }[a.level]}`));
      return done();
    case 'confirmPosition': {
      const ok = s.head.towel === 'occiput' && s.head.extension === 'moderate';
      s.head.confirmed = true;
      s.head.confirmedSniffing = ok;
      out.push(ev('position', 'action', 'position', ok ? '完成頭部擺位' : '完成頭部擺位（姿勢與 sniffing position 不同）'));
      if (!ok) out.push(ev('position', 'error', 'position-wrong', '擺位不是 sniffing position', '本模擬以「布捲墊於枕部＋頭部適度後仰」示意 sniffing position；實際擺位依臨床教師示範。'));
      return done();
    }

    /* ---------------- 喉頭鏡 ---------------- */
    case 'selectHand':
      s.scopeUse.hand = a.hand;
      out.push(ev('laryngoscopy', 'action', 'hand', `以${a.hand === 'left' ? '左' : '右'}手持喉頭鏡`));
      if (a.hand === 'right') out.push(ev('laryngoscopy', 'error', 'right-hand', '以右手持喉頭鏡', '教案要求以左手把持喉頭鏡；右手負責置入氣管內管。'));
      return done();
    case 'insertBlade':
      if (!s.scope.assembled) {
        out.push(blocked('laryngoscopy', '喉頭鏡尚未組裝。'));
        return done();
      }
      if (!s.scopeUse.hand) {
        out.push(blocked('laryngoscopy', '請先選擇持喉頭鏡的手。'));
        return done();
      }
      if (at.location !== 'none') {
        out.push(blocked('laryngoscopy', '目前已有氣管內管；如需重新插管請先拔管並重新給氧。'));
        return done();
      }
      s.scopeUse.inserted = true;
      s.scopeUse.view = 'poor';
      s.scopeUse.lift = null;
      out.push(ev('laryngoscopy', 'action', 'blade', '置入喉頭鏡葉片'));
      if (s.attempts === 0 && s.preBreaths.length === 0) out.push(ev('laryngoscopy', 'order', 'no-preox', '插管前沒有先以袋瓣罩給氧', '教案第 6 項要求插管前先以袋瓣罩吹氣給氧。'));
      if (s.needReox && s.reoxBreaths < 2) out.push(safetyEv('laryngoscopy', 'no-reox', '前一次插管失敗後，沒有重新給氧就再次嘗試', '插管失敗或拔管後，應先以袋瓣罩重新給氧再嘗試（現行臨床安全觀念）。'));
      return done();
    case 'lift':
      if (!s.scopeUse.inserted) {
        out.push(blocked('laryngoscopy', '請先置入葉片。'));
        return done();
      }
      s.scopeUse.lift = a.how;
      if (a.how === 'lift') {
        s.scopeUse.view = 'glottis';
        if (s.scopeUse.hand === 'left') s.scopeUse.usedLeftLift = true;
        out.push(ev('laryngoscopy', 'action', 'lift', '沿握把方向向前上方提起：看見聲門（教學示意）'));
      } else {
        s.scopeUse.view = 'poor';
        out.push(safetyEv('laryngoscopy', 'teeth-lever', '以上排牙齒為支點往後撬動喉頭鏡', '以牙齒為支點撬動可能造成牙齒損傷，視野也不會改善；教案要求適當上提。'));
      }
      return done();

    /* ---------------- 置管（IntubationSimulation） ---------------- */
    case 'intubate': {
      if (!s.tube.size) {
        out.push(blocked('intubate', '請先選擇並準備氣管內管。'));
        return done();
      }
      if (!s.scopeUse.inserted) {
        out.push(blocked('intubate', '請先置入喉頭鏡。'));
        return done();
      }
      if (at.location !== 'none') return done();
      if (s.tube.stylet === 'protruding') {
        if (s.safetyHold) {
          out.push(blocked('intubate', '安全中止中：請先調整通條。'));
          return done();
        }
        s.safetyHold = true;
        out.push(ev('intubate', 'error', 'safety-stop', '安全中止：通條前端超出管尖', '【現行臨床安全補充】通條超出管尖可能損傷呼吸道。模擬已阻止置管，請回到器材準備重新放置通條。', true));
        return done();
      }
      s.attempts += 1;
      s.needReox = false;
      s.reoxBreaths = 0;
      const blind = s.scopeUse.view !== 'glottis';
      s.attempt = { ...newAttempt(), location: a.target === 'glottis' && !blind ? 'trachea' : 'esophagus' };
      out.push(ev('intubate', 'action', 'intubate', `第 ${s.attempts} 次置入氣管內管`));
      if (blind) out.push(safetyEv('intubate', 'blind', '在看不到聲門的情況下置管', '看不到聲門時應重新調整或停止並給氧，盲目置管容易進入食道。'));
      return done();
    }
    case 'setDepth':
      if (at.location === 'none') return done();
      if (at.cuffInflated) {
        out.push(blocked(step, 'cuff 充氣中無法調整深度：請先將 cuff 放氣。'));
        return done();
      }
      s.attempt.depth = Math.round(a.cm * 2) / 2;
      s.attempt.depthRead = false;
      out.push(ev(step, 'action', 'depth', `調整氣管內管深度`));
      return done();
    case 'readDepth':
      if (at.location === 'none' || at.depth === null) {
        out.push(blocked(step, '請先放置氣管內管並調整深度。'));
        return done();
      }
      s.attempt.depthRead = true;
      out.push(ev(step, 'action', 'depth-read', `確認嘴角刻度：${at.depth} cm`));
      if (tooDeep(at) || tooShallow(at)) out.push(ev(step, 'error', 'depth-off', `嘴角刻度 ${at.depth} cm 不在本教案範圍`, `本教案要求嘴角刻度約 ${CFG.caseRequirement.depth.min}–${CFG.caseRequirement.depth.max} cm；太深可能進入單側支氣管，太淺 cuff 可能位於聲門附近。`));
      return done();

    /* ---------------- 通條與 cuff ---------------- */
    case 'removeStylet':
      if (at.location === 'none' || s.tube.stylet === 'none' || at.styletRemoved) {
        out.push(blocked('tubeCare', s.tube.stylet === 'none' ? '本次沒有使用通條。' : '目前沒有需要移除的通條。'));
        return done();
      }
      s.attempt.styletRemoved = true;
      out.push(ev('tubeCare', 'action', 'stylet-out', held(a.held)));
      if (!a.held) out.push(ev('tubeCare', 'error', 'stylet-unheld', '移除通條時沒有扶住氣管內管', '應一手固定管子再移除通條，避免管子跟著被拉出或移位。'));
      return done();
    case 'inflateCuff':
      if (at.location === 'none') {
        out.push(blocked('tubeCare', '尚未插管。'));
        return done();
      }
      if (s.items.syringe !== 'tray') {
        out.push(blocked('tubeCare', '請先把 10 mL 空針放到器材盤。'));
        return done();
      }
      s.attempt.cuffInflated = true;
      s.attempt.syringeRemoved = false;
      out.push(ev('tubeCare', 'action', 'cuff-in', '以空針將 cuff 充氣'));
      return done();
    case 'deflateCuff':
      if (!at.cuffInflated) return done();
      s.attempt.cuffInflated = false;
      out.push(ev(step, 'action', 'cuff-out', '將 cuff 放氣'));
      return done();
    case 'removeSyringe':
      if (!at.cuffInflated || at.syringeRemoved) return done();
      s.attempt.syringeRemoved = true;
      out.push(ev('tubeCare', 'action', 'syringe-off', '移除空針'));
      return done();

    /* ---------------- 插管後確認（PlacementVerification） ---------------- */
    case 'connectBag':
      if (at.location === 'none') {
        out.push(blocked('confirm', '尚未插管。'));
        return done();
      }
      if (at.bagConnected) return done();
      s.attempt.bagConnected = true;
      s.scopeUse.inserted = false;
      out.push(ev('confirm', 'action', 'bag', '移除喉頭鏡，氣管內管接上 Ambu bag'));
      return done();
    case 'squeezeTube': {
      if (!at.bagConnected) {
        out.push(blocked('confirm', '請先接上 Ambu bag。'));
        return done();
      }
      s.attempt.postBreaths += 1;
      out.push(ev('confirm', 'action', 'bag-squeeze', '擠壓 Ambu bag 通氣'));
      return done();
    }
    case 'observeChest': {
      if (!at.bagConnected || at.postBreaths === 0) {
        out.push(blocked('confirm', '請先接上 Ambu bag 並壓袋，才能觀察胸廓起伏。'));
        return done();
      }
      if (!at.chestObserved) s.attempt.otherBeforeChest = at.ausc.length > 0 || at.capno || at.wrongAusc.length > 0;
      s.attempt.chestObserved = true;
      const f = chestFinding(at);
      out.push(ev('confirm', 'action', 'chest', `觀察胸廓：${f.text}`));
      return done();
    }
    case 'auscultate': {
      const p = a.point;
      if (s.items.stethoscope !== 'tray') s.items.stethoscope = 'tray';
      if (at.location === 'none') {
        out.push(blocked('confirm', '尚未插管。'));
        return done();
      }
      if (!REQUIRED_AUSC.includes(p)) {
        if (!at.wrongAusc.includes(p)) s.attempt.wrongAusc = [...at.wrongAusc, p];
        out.push(ev('confirm', 'error', 'ausc-wrong', `在${AUSC_LABEL[p]}聽診`, '教案要求的五點為胃部、雙側肺尖與雙側肺底。'));
        return done();
      }
      const vent = at.bagConnected && at.postBreaths > 0;
      if (!vent) {
        if (!at.auscNoVent.includes(p)) s.attempt.auscNoVent = [...at.auscNoVent, p];
        out.push(ev('confirm', 'error', 'ausc-novent', `在${AUSC_LABEL[p]}聽診，但沒有同時壓袋通氣`, '教案要求「於壓袋通氣同時」聽診。'));
        return done();
      }
      if (!at.ausc.includes(p)) s.attempt.ausc = [...at.ausc, p];
      out.push(ev('confirm', 'action', 'ausc', `聽診${AUSC_LABEL[p]}：${auscFinding(at, p)}`));
      return done();
    }
    case 'attachCapno':
      if (!at.bagConnected) {
        out.push(blocked('confirm', '請先接上 Ambu bag。'));
        return done();
      }
      if (at.capno) return done();
      s.attempt.capno = true;
      out.push(ev('confirm', 'action', 'capno', `【現行臨床安全補充】連接波形二氧化碳監測：${capnoFinding(at)}`));
      return done();
    case 'confirmPlacement': {
      if (at.location === 'none') return done();
      const checked = at.chestObserved || at.ausc.length > 0;
      if (!checked) {
        out.push(blocked('confirm', '還沒有任何確認動作（胸廓、聽診）。'));
        return done();
      }
      s.attempt.confirmed = true;
      s.final = { ...s.attempt };
      if (at.location === 'trachea') {
        if (s.firstSuccessAttempt === null) s.firstSuccessAttempt = s.attempts;
        out.push(ev('confirm', 'action', 'confirmed', '判斷管路位置正確'));
        if (tooDeep(at)) out.push(safetyEv('confirm', 'mainstem-missed', '深度過深（單側通氣）未調整就判斷位置正確', '一側呼吸音減弱、嘴角刻度超過教案範圍時，應將 cuff 放氣、調整深度後重新確認。'));
      } else {
        out.push(safetyEv('confirm', 'esophageal-missed', '食道插管被判斷為位置正確', '胃部氣過水聲、胸廓沒有起伏是食道插管的警訊，應立即拔管並重新給氧。這是安全關鍵錯誤。'));
      }
      return done();
    }
    case 'removeTube':
    case 'abort': {
      const had = at.location !== 'none';
      s.attempt = newAttempt();
      s.scopeUse = { ...s.scopeUse, inserted: false, view: 'none', lift: null };
      s.tube.stylet = s.tube.stylet === 'none' ? 'none' : 'inside';
      s.needReox = had || a.type === 'abort';
      s.reoxBreaths = 0;
      s.safetyHold = false;
      out.push(ev(step, 'remediation', a.type, a.type === 'abort' ? '停止插管，改以袋瓣罩給氧並尋求協助' : '拔除氣管內管，準備重新給氧'));
      return done();
    }

    /* ---------------- 固定 ---------------- */
    case 'placeBite':
      if (at.location === 'none') {
        out.push(blocked('secure', '尚未插管。'));
        return done();
      }
      if (s.items.bite !== 'tray') s.items.bite = 'tray';
      s.secured.bite = true;
      out.push(ev('secure', 'action', 'bite', '放置咬口器'));
      return done();
    case 'secureTube': {
      if (at.location === 'none') {
        out.push(blocked('secure', '尚未插管。'));
        return done();
      }
      if (!at.chestObserved && at.ausc.length === 0) {
        if (!at.chestObserved) s.attempt.otherBeforeChest = true;
        out.push(safetyEv('secure', 'secure-unconfirmed', '尚未確認管路位置就準備固定', '插管後應先接 Ambu bag 壓袋、觀察胸廓並聽診，確認位置後才固定。'));
      }
      if (at.location === 'esophagus') {
        s.secured.esophagealBlocked += 1;
        out.push(ev('secure', 'error', 'safety-stop', '安全中止：管路其實位於食道，不可固定', '依本案例規則，管路位於食道（若接上 Ambu bag 壓袋，會看到胸廓沒有起伏、胃部有氣過水聲）。固定食道內的管子會延誤通氣。請拔管、重新給氧後再插管，必要時尋求協助。', true));
        return done();
      }
      if (s.items.ties !== 'tray') s.items.ties = 'tray';
      s.secured.tied = true;
      s.attempt.confirmed = true;
      s.final = { ...s.attempt };
      if (s.firstSuccessAttempt === null) s.firstSuccessAttempt = s.attempts;
      out.push(ev('secure', 'action', 'secured', '以固定帶固定氣管內管'));
      if (tooDeep(at)) out.push(safetyEv('secure', 'mainstem-secured', '深度過深的氣管內管被固定', '固定前應確認兩側呼吸音對稱，並將深度調整到教案範圍。'));
      return done();
    }
    case 'verbal':
      if (s.verbal.includes(a.id)) return done();
      s.verbal = [...s.verbal, a.id];
      out.push(ev(step, 'narration', 'verbal', '同步口述操作步驟'));
      return done();
  }
};

const held = (h: boolean) => (h ? '一手固定氣管內管，另一手移除通條' : '直接把通條拉出');

/** 單項重練：把指定階段之前的步驟預先完成（分數僅供參考） */
export function createFocusState(focus: StepId): AWState {
  let s = createInitialState();
  const run = (acts: AWAction[]) => {
    for (const x of acts) s = airwayReducer(s, x).state;
  };
  const idx = STEP_IDS.indexOf(focus);
  const before = (id: StepId) => STEP_IDS.indexOf(id) < idx;
  if (before('prep'))
    run([
      ...(['handle', 'blade', 'ett75', 'stylet', 'syringe', 'bite', 'ties', 'bvm', 'lube', 'stethoscope', 'towel'] as ItemId[]).map((i) => ({ type: 'placeItem', item: i, zone: 'tray' }) as AWAction),
      { type: 'assembleScope' },
      { type: 'checkLight' },
      { type: 'checkCuff', method: 'syringe' },
      { type: 'lubeTube' },
      { type: 'insertStylet', protruding: false },
    ]);
  if (before('bvm')) run([{ type: 'placeMask', zone: 'correct', apexToHead: true }, { type: 'setGrip', grip: 'one' }, ...[0, 5.5, 11, 16.5].map((t) => ({ type: 'squeezeMask', at: t }) as AWAction), { type: 'removeMask' }]);
  if (before('position')) run([{ type: 'placeTowel', where: 'occiput' }, { type: 'setExtension', level: 'moderate' }, { type: 'confirmPosition' }]);
  if (before('laryngoscopy')) run([{ type: 'selectHand', hand: 'left' }, { type: 'insertBlade' }, { type: 'lift', how: 'lift' }]);
  if (before('intubate')) run([{ type: 'intubate', target: 'glottis' }, { type: 'setDepth', cm: 21 }, { type: 'readDepth' }]);
  if (before('tubeCare')) run([{ type: 'removeStylet', held: true }, { type: 'inflateCuff' }, { type: 'removeSyringe' }]);
  if (before('confirm')) run([{ type: 'connectBag' }, { type: 'squeezeTube' }, { type: 'observeChest' }, ...REQUIRED_AUSC.map((p) => ({ type: 'auscultate', point: p }) as AWAction), { type: 'confirmPlacement' }]);
  s = { ...s, activeStep: focus, visited: Object.fromEntries(STEP_IDS.filter((id) => STEP_IDS.indexOf(id) <= idx).map((id) => [id, true])) };
  return s;
}
