import type { NewEvent } from '../../training/types';
import type { DomainResult } from '../../training/interactionEngine';
import {
  EQUIPMENT_MAP,
  HOTSPOTS,
  NARRATION,
  WASTE,
  BINS,
  type BinId,
  type HotspotId,
  type ItemId,
  type NarrationPhase,
  type NarrationQuality,
  type StepId,
  type ToolId,
  type WasteId,
  type Zone,
} from './caseData';
import { exitAngleFrom, isPerpendicular, stitchAlignment, stitchSpacings, spacingOk, validBite, type Pt } from './geometry';

/* ================================================================== */
/* 狀態                                                                 */
/* ================================================================== */

export type Flap = 'far' | 'left' | 'right' | 'near';
const FLAP_RANK: Record<Flap, number> = { far: 3, left: 2, right: 2, near: 1 };
export const FLAP_LABEL: Record<Flap, string> = { far: '遠側', left: '左側', right: '右側', near: '近側' };

export type PlaceMethod = 'peel-drop' | 'hand-transfer' | 'with-wrapper';

export interface GloveDecision {
  id: string;
  title: string;
  prompt: string;
  options: { id: string; text: string; correct: boolean; why: string }[];
}

/** 無菌手套穿戴的決策點（閉合原則：裸手 ↔ 內面；手套 ↔ 外面） */
export const GLOVE_DECISIONS: GloveDecision[] = [
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
      { id: 'outer-palm', text: '抓住手套掌心的外表面', correct: false, why: '手套外表面之後會接觸無菌區與傷口，裸手一碰就污染了。' },
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

export interface ThrowRecord {
  wrap: 'cw' | 'ccw';
  /** 拉線方向：+1 往傷口上側、-1 往下側 */
  pull: 1 | -1;
  /** 與前一個結方向交替（方結） */
  alternated: boolean;
}

export interface StitchRecord {
  id: number;
  entry: Pt;
  exit: Pt;
  entryAngle: number;
  exitAngle: number;
  throws: ThrowRecord[];
  knotSide: 1 | -1;
}

export type SuturePhase = 'load' | 'entry' | 'exit' | 'angle' | 'pass' | 'pull' | 'tie' | 'cut';

export interface SutureWork {
  phase: SuturePhase;
  entry: Pt | null;
  exit: Pt | null;
  entryAngle: number;
  passProgress: number;
  exitAngle: number | null;
  throws: ThrowRecord[];
  /** 本針是否已記錄過「非無菌狀態下縫合」 */
  breachLogged: boolean;
}

export interface WSState {
  activeStep: StepId;
  visited: Record<StepId, boolean>;
  maskOn: boolean;
  items: Record<ItemId, Zone>;
  flapsOpened: Flap[];
  fieldContaminated: boolean;
  gloves: {
    status: 'none' | 'sterile' | 'exam';
    progress: number;
    donningClean: boolean;
    contaminated: boolean;
    everSterile: boolean;
  };
  disinfection: { strokes: Pt[][]; afterDrape: boolean; swabWet: boolean };
  drape: { center: Pt | null; removed: boolean };
  tool: ToolId | 'fingers' | null;
  needleLoaded: boolean;
  needleDisposed: boolean;
  stitches: StitchRecord[];
  work: SutureWork;
  nextStitchId: number;
  dressing: { gauze: Pt | null; tapes: Pt[] };
  disposal: Partial<Record<WasteId, BinId>>;
  narration: Partial<Record<NarrationPhase, { optionId: string; quality: NarrationQuality; timely: boolean }>>;
  knotPractice: number;
}

const newWork = (loaded = false): SutureWork => ({
  phase: loaded ? 'entry' : 'load',
  entry: null,
  exit: null,
  entryAngle: 90,
  passProgress: 0,
  exitAngle: null,
  throws: [],
  breachLogged: false,
});

export function createInitialState(): WSState {
  return {
    activeStep: 'prep',
    visited: { prep: true, gloves: false, disinfect: false, drape: false, suture: false, dressing: false, disposal: false },
    maskOn: false,
    items: { mask: 'supply', sterileWrap: 'supply', needleSuture: 'supply', swabs: 'supply', gauze: 'supply', antiseptic: 'supply', sterileGloves: 'supply', examGloves: 'supply', tape: 'supply' },
    flapsOpened: [],
    fieldContaminated: false,
    gloves: { status: 'none', progress: 0, donningClean: true, contaminated: false, everSterile: false },
    disinfection: { strokes: [], afterDrape: false, swabWet: false },
    drape: { center: null, removed: false },
    tool: null,
    needleLoaded: false,
    needleDisposed: false,
    stitches: [],
    work: newWork(),
    nextStitchId: 1,
    dressing: { gauze: null, tapes: [] },
    disposal: {},
    narration: {},
    knotPractice: 0,
  };
}

/**
 * 「練習單一階段」時的起始狀態：前面階段以正確方式預先完成，方便直接重練弱項。
 * 這類練習在報告中標示為單項練習，不代表完整流程表現。
 */
export function createFocusState(step: StepId): WSState {
  const s = createInitialState();
  const order: StepId[] = ['prep', 'gloves', 'disinfect', 'drape', 'suture', 'dressing', 'disposal'];
  const idx = order.indexOf(step);
  s.activeStep = step;
  s.visited[step] = true;
  if (idx > 0) {
    s.maskOn = true;
    s.flapsOpened = ['far', 'left', 'right', 'near'];
    s.items = { ...s.items, sterileWrap: 'field', needleSuture: 'field', swabs: 'field', gauze: 'field', antiseptic: 'clean', sterileGloves: 'clean', tape: 'clean', mask: 'clean' };
  }
  if (idx > 1) s.gloves = { status: 'sterile', progress: GLOVE_DECISIONS.length, donningClean: true, contaminated: false, everSterile: true };
  if (idx > 2) {
    const ring = (r: number) => Array.from({ length: 25 }, (_, i) => ({ x: Math.cos((i / 24) * Math.PI * 2) * r * 1.2, y: Math.sin((i / 24) * Math.PI * 2) * r }));
    s.disinfection = { strokes: [[{ x: 0, y: 0.3 }, ...ring(1), ...ring(2), ...ring(3.2), ...ring(3.8)]], afterDrape: false, swabWet: true };
  }
  if (idx > 3) s.drape = { center: { x: 0, y: 0 }, removed: false };
  if (idx > 4) {
    s.stitches = [-1, 0, 1].map((x, i) => ({
      id: i + 1,
      entry: { x, y: 0.6 },
      exit: { x, y: -0.6 },
      entryAngle: 90,
      exitAngle: 90,
      throws: [
        { wrap: 'cw', pull: 1, alternated: true },
        { wrap: 'ccw', pull: -1, alternated: true },
        { wrap: 'cw', pull: 1, alternated: true },
      ],
      knotSide: 1,
    }));
    s.nextStitchId = 4;
    s.drape.removed = true;
  }
  if (idx > 5) s.dressing = { gauze: { x: 0, y: 0 }, tapes: [{ x: -5, y: 0 }, { x: 5, y: 0 }] };
  return s;
}

/* ================================================================== */
/* 動作                                                                 */
/* ================================================================== */

export type WSAction =
  | { type: 'setStep'; step: StepId }
  | { type: 'wearMask' }
  | { type: 'openFlap'; flap: Flap }
  | { type: 'placeItem'; item: ItemId; zone: Zone; method?: PlaceMethod }
  | { type: 'touch'; hotspot: HotspotId }
  | { type: 'arrangeField' }
  | { type: 'gloveDecision'; optionId: string }
  | { type: 'wearExamGloves' }
  | { type: 'changeGloves' }
  | { type: 'rebuildField' }
  | { type: 'wetSwab' }
  | { type: 'disinfectStroke'; points: Pt[] }
  | { type: 'clearDisinfection' }
  | { type: 'placeDrape'; center: Pt }
  | { type: 'removeDrape' }
  | { type: 'selectTool'; tool: ToolId | 'fingers' }
  | { type: 'loadNeedle' }
  | { type: 'pickPoint'; point: Pt }
  | { type: 'setAngle'; angle: number }
  | { type: 'confirmAngle' }
  | { type: 'passProgress'; progress: number }
  | { type: 'passComplete'; drift: number }
  | { type: 'pullThrough' }
  | { type: 'knotThrow'; wrap: 'cw' | 'ccw'; pull: 1 | -1 }
  | { type: 'undoThrow' }
  | { type: 'cutSuture' }
  | { type: 'resetStitch' }
  | { type: 'removeLastStitch' }
  | { type: 'resetAllStitches' }
  | { type: 'knotPracticeDone' }
  | { type: 'placeGauze'; center: Pt }
  | { type: 'placeTape'; center: Pt }
  | { type: 'wrongDressing'; material: 'swabs' | 'drape' }
  | { type: 'resetDressing' }
  | { type: 'dispose'; waste: WasteId; bin: BinId }
  | { type: 'narrate'; phase: NarrationPhase; optionId: string };

/* ================================================================== */
/* 規則                                                                 */
/* ================================================================== */

export const sterileHands = (s: WSState) => s.gloves.status === 'sterile' && !s.gloves.contaminated;
export const fieldOpen = (s: WSState) => s.flapsOpened.length === 4;

/** 物理上不可行的動作：所有模式都會顯示 */
const blocked = (step: StepId, message: string): NewEvent => ({ stepId: step, kind: 'system', code: 'blocked', message });

function gloveContamination(s: WSState, step: StepId, message: string, why: string): DomainResult<WSState> {
  return {
    state: { ...s, gloves: { ...s.gloves, contaminated: true } },
    events: [{ stepId: step, kind: 'contamination', code: 'gloves-contaminated', message, why }],
  };
}

/** 縫合時若手套非無菌，每針記錄一次無菌破壞 */
function suturingSterilityCheck(s: WSState): { state: WSState; events: NewEvent[] } {
  if (sterileHands(s) || s.work.breachLogged) return { state: s, events: [] };
  const reason =
    s.gloves.status === 'none' ? '未戴無菌手套即進行縫合' : s.gloves.status === 'exam' ? '戴一般檢診手套進行縫合' : '手套已污染仍繼續縫合';
  return {
    state: { ...s, work: { ...s.work, breachLogged: true } },
    events: [{ stepId: 'suture', kind: 'contamination', code: 'suture-nonsterile', message: reason, why: '縫針與縫線會直接進入傷口組織，手套必須是無菌且未污染的。' }],
  };
}

function narrationTimely(s: WSState, phase: NarrationPhase) {
  switch (phase) {
    case 'intro':
      return s.disinfection.strokes.length === 0 && s.stitches.length === 0;
    case 'disinfect':
      return s.disinfection.strokes.length === 0 || s.activeStep === 'disinfect';
    case 'drape':
      return !s.drape.center || s.activeStep === 'drape';
    case 'suture':
      return s.stitches.length === 0 || s.activeStep === 'suture';
    case 'dressing':
      return !s.dressing.gauze || s.activeStep === 'dressing';
  }
}

export function woundSuturingReducer(s: WSState, a: WSAction): DomainResult<WSState> {
  const step = s.activeStep;
  switch (a.type) {
    case 'setStep': {
      const events: NewEvent[] = [];
      if (a.step === 'suture' && !s.visited.suture && !s.drape.center) {
        events.push({ stepId: 'suture', kind: 'order', code: 'suture-before-drape', message: '尚未鋪單即進入縫合', why: '鋪單後才有足夠的無菌操作面放置器械與縫線。' });
      }
      return { state: { ...s, activeStep: a.step, visited: { ...s.visited, [a.step]: true } }, events };
    }

    case 'wearMask': {
      if (s.maskOn) return { state: s };
      if (sterileHands(s)) return gloveContamination({ ...s, maskOn: true }, step, '戴無菌手套後才去拿口罩', HOTSPOTS['mask-adjust'].why);
      return { state: { ...s, maskOn: true, items: { ...s.items, mask: 'clean' } }, events: [{ stepId: step, kind: 'action', code: 'mask-on', message: '戴上口罩' }] };
    }

    case 'openFlap': {
      if (s.flapsOpened.includes(a.flap)) return { state: s };
      if (s.items.sterileWrap === 'supply') return { state: s, events: [blocked(step, '請先把無菌包布拿到操作台面上')] };
      const opened = [...s.flapsOpened, a.flap];
      const reachOver = s.flapsOpened.some((f) => FLAP_RANK[f] < FLAP_RANK[a.flap]);
      const next = { ...s, flapsOpened: opened };
      const events: NewEvent[] = [{ stepId: 'prep', kind: 'action', code: 'flap', message: `打開包布${FLAP_LABEL[a.flap]}` }];
      if (reachOver) {
        next.fieldContaminated = true;
        events.push({ stepId: 'prep', kind: 'contamination', code: 'field-breach', message: `打開${FLAP_LABEL[a.flap]}時手臂越過已打開的無菌面`, why: '應先開離身體最遠的一角、最後開近側，手臂才不會越過無菌區。' });
      }
      if (sterileHands(s)) {
        const g = gloveContamination(next, 'prep', '戴無菌手套後碰觸包布外側', '包布外側不是無菌面，應在戴手套前打開。');
        return { state: g.state, events: [...events, ...(g.events ?? [])] };
      }
      if (opened.length === 4) events.push({ stepId: 'prep', kind: 'action', code: 'field-ready', message: '無菌區建立完成（內含持針器、鑷子、剪刀、洞巾）' });
      return { state: next, events };
    }

    case 'placeItem': {
      const def = EQUIPMENT_MAP[a.item];
      if (a.item === 'sterileWrap') {
        return { state: { ...s, items: { ...s.items, sterileWrap: a.zone === 'supply' ? 'supply' : 'field' } }, events: [{ stepId: 'prep', kind: 'action', code: 'wrap-placed', message: '將無菌包布放到操作台面' }] };
      }
      if (a.zone === 'field') {
        if (!fieldOpen(s)) return { state: s, events: [blocked('prep', '無菌包布尚未完全打開，還沒有無菌區可以放置')] };
        if (s.items[a.item] === 'field') return { state: s };
        const next = { ...s, items: { ...s.items, [a.item]: 'field' as Zone } };
        if (!def.sterile) {
          return {
            state: { ...next, fieldContaminated: true },
            events: [{ stepId: 'prep', kind: 'contamination', code: 'field-breach', message: `把非無菌的「${def.name}」放進無菌區`, why: `${def.name}不是滅菌物品，放入無菌區會污染其他無菌物品。應放在無菌區外的清潔檯面。` }],
          };
        }
        const method = a.method ?? 'peel-drop';
        if (sterileHands(s)) {
          return gloveContamination(next, 'prep', `戴無菌手套後拆「${def.name}」外包裝`, '外包裝不是無菌的；應在戴手套前完成拆包置入，或請助手協助。');
        }
        if (method === 'peel-drop') {
          return { state: next, events: [{ stepId: 'prep', kind: 'action', code: 'peel-drop', message: `撕開「${def.name}」外包裝，讓內容物落入無菌區` }] };
        }
        return {
          state: { ...next, fieldContaminated: true },
          events: [
            {
              stepId: 'prep',
              kind: 'contamination',
              code: 'field-breach',
              message: method === 'hand-transfer' ? `用裸手拿出「${def.name}」放入無菌區` : `把「${def.name}」連同外包裝放進無菌區`,
              why: method === 'hand-transfer' ? '戴無菌手套前雙手不是無菌的，碰觸內容物即污染。應撕開外包裝讓內容物直接落入。' : '外包裝外側不是無菌的，不能放進無菌區。',
            },
          ],
        };
      }
      // 放到清潔檯面或放回備物檯
      if (s.items[a.item] === 'field') {
        if (sterileHands(s)) return { state: { ...s, items: { ...s.items, [a.item]: a.zone } } };
        return {
          state: { ...s, items: { ...s.items, [a.item]: a.zone }, fieldContaminated: true },
          events: [{ stepId: 'prep', kind: 'contamination', code: 'field-breach', message: `以裸手從無菌區取出「${def.name}」`, why: '裸手伸入無菌區會污染無菌面。' }],
        };
      }
      return { state: { ...s, items: { ...s.items, [a.item]: a.zone } } };
    }

    case 'touch': {
      const h = HOTSPOTS[a.hotspot];
      if (sterileHands(s)) return gloveContamination(s, step, `戴無菌手套後${h.prompt}`, h.why);
      if (s.gloves.status === 'none') return { state: s, events: [{ stepId: step, kind: 'action', code: `touch-${a.hotspot}`, message: `${h.prompt}（尚未戴無菌手套）` }] };
      return { state: s, events: [{ stepId: step, kind: 'action', code: `touch-${a.hotspot}`, message: h.prompt }] };
    }

    case 'arrangeField': {
      if (!fieldOpen(s)) return { state: s };
      if (sterileHands(s)) return { state: s, events: [{ stepId: step, kind: 'action', code: 'arrange-field', message: '以無菌手套整理無菌區內器械' }] };
      return {
        state: { ...s, fieldContaminated: true },
        events: [{ stepId: 'prep', kind: 'contamination', code: 'field-breach', message: '未戴無菌手套伸手整理無菌區', why: '無菌區內只能以無菌手套或無菌器械碰觸。' }],
      };
    }

    case 'gloveDecision': {
      if (s.gloves.status === 'sterile' && s.gloves.progress >= GLOVE_DECISIONS.length) return { state: s };
      const decision = GLOVE_DECISIONS[s.gloves.progress];
      const opt = decision.options.find((o) => o.id === a.optionId)!;
      const progress = s.gloves.progress + 1;
      const done = progress >= GLOVE_DECISIONS.length;
      const gloves = {
        ...s.gloves,
        status: done ? ('sterile' as const) : s.gloves.status === 'exam' ? ('exam' as const) : ('none' as const),
        progress,
        donningClean: s.gloves.donningClean && opt.correct,
        everSterile: s.gloves.everSterile || done,
        contaminated: s.gloves.contaminated || !opt.correct,
      };
      const events: NewEvent[] = [
        opt.correct
          ? { stepId: 'gloves', kind: 'action', code: `glove-${decision.id}`, message: `${decision.title}：${opt.text}` }
          : { stepId: 'gloves', kind: 'contamination', code: 'glove-donning-breach', message: `${decision.title}：${opt.text}`, why: opt.why },
      ];
      if (done) events.push({ stepId: 'gloves', kind: 'action', code: 'gloved', message: gloves.donningClean ? '完成穿戴無菌手套' : '完成穿戴無菌手套（過程中有污染）' });
      return { state: { ...s, gloves }, events };
    }

    case 'wearExamGloves':
      return {
        state: { ...s, gloves: { ...s.gloves, status: 'exam', progress: 0, contaminated: true } },
        events: [{ stepId: 'gloves', kind: 'error', code: 'exam-gloves', message: '戴上一般檢診手套', why: '一般檢診手套不是滅菌的，縫合需使用無菌手套。' }],
      };

    case 'changeGloves': {
      if (s.gloves.status === 'none' && s.gloves.progress === 0) return { state: s };
      const wasContaminated = s.gloves.contaminated;
      return {
        state: { ...s, gloves: { status: 'none', progress: 0, donningClean: true, contaminated: false, everSterile: s.gloves.everSterile } },
        events: [
          wasContaminated
            ? { stepId: step, kind: 'remediation', code: 'change-gloves', message: '察覺污染，脫下手套準備重新穿戴無菌手套' }
            : { stepId: step, kind: 'action', code: 'remove-gloves', message: '脫下手套' },
        ],
      };
    }

    case 'rebuildField': {
      if (!s.fieldContaminated) return { state: s };
      return {
        state: { ...s, fieldContaminated: false },
        events: [{ stepId: step, kind: 'remediation', code: 'rebuild-field', message: '察覺無菌區污染，更換污染物品並重新建立無菌區' }],
      };
    }

    case 'wetSwab': {
      if (s.items.swabs === 'supply') return { state: s, events: [blocked('disinfect', '滅菌棉棒還在備物檯，尚未準備')] };
      if (s.disinfection.swabWet) return { state: s };
      const next = { ...s, disinfection: { ...s.disinfection, swabWet: true } };
      if (sterileHands(s)) return gloveContamination(next, 'disinfect', '戴無菌手套後自己拿消毒溶液瓶倒消毒液', HOTSPOTS['antiseptic-bottle'].why);
      return { state: next, events: [{ stepId: 'disinfect', kind: 'action', code: 'wet-swab', message: '滅菌棉棒沾取消毒溶液' }] };
    }

    case 'disinfectStroke': {
      if (!s.disinfection.swabWet) return { state: s, events: [blocked('disinfect', '棉棒尚未沾消毒溶液')] };
      if (a.points.length < 2) return { state: s };
      const events: NewEvent[] = [];
      const afterDrape = !!s.drape.center && !s.drape.removed;
      if (afterDrape && !s.disinfection.afterDrape) {
        events.push({ stepId: 'disinfect', kind: 'order', code: 'disinfect-after-drape', message: '鋪單後才進行消毒', why: '應先消毒、待乾，再鋪上洞巾；鋪單後消毒無法確認洞巾下方範圍。' });
      }
      if (s.disinfection.strokes.length === 0) events.push({ stepId: 'disinfect', kind: 'action', code: 'disinfect-start', message: '開始消毒' });
      return { state: { ...s, disinfection: { ...s.disinfection, strokes: [...s.disinfection.strokes, a.points], afterDrape: s.disinfection.afterDrape || afterDrape } }, events };
    }

    case 'clearDisinfection':
      return {
        state: { ...s, disinfection: { ...s.disinfection, strokes: [] } },
        events: s.disinfection.strokes.length ? [{ stepId: 'disinfect', kind: 'action', code: 'disinfect-redo', message: '重新消毒（換一支新棉棒）' }] : [],
      };

    case 'placeDrape': {
      const events: NewEvent[] = [];
      let next: WSState = { ...s, drape: { center: a.center, removed: false } };
      if (s.drape.removed) return { state: s, events: [blocked('drape', '洞巾已移除')] };
      if (!fieldOpen(s)) return { state: s, events: [blocked('drape', '洞巾在無菌包布內，請先打開包布')] };
      if (s.drape.center) {
        const before = Math.hypot(s.drape.center.x, s.drape.center.y);
        const after = Math.hypot(a.center.x, a.center.y);
        if (after < before - 0.15) {
          events.push({ stepId: 'drape', kind: 'contamination', code: 'drape-inward', message: '洞巾放下後又往傷口方向拖移', why: '洞巾接觸皮膚後邊緣已不乾淨，往內拖會把未消毒區的菌帶入開口；只能往外調整或更換洞巾。' });
        } else {
          events.push({ stepId: 'drape', kind: 'action', code: 'drape-adjust', message: '向外調整洞巾位置' });
        }
      } else {
        if (s.disinfection.strokes.length === 0) {
          events.push({ stepId: 'drape', kind: 'order', code: 'drape-before-disinfect', message: '尚未消毒即鋪單', why: '洞巾開口內必須是已消毒的皮膚。' });
        }
        if (!sterileHands(s)) {
          const why = s.gloves.status === 'sterile' ? '手套已污染，鋪單會把污染帶到洞巾上。' : '洞巾是無菌物品，必須戴無菌手套拿取，才能不破壞無菌區。';
          events.push({ stepId: 'drape', kind: 'contamination', code: 'drape-nonsterile', message: s.gloves.status === 'sterile' ? '以已污染的手套鋪單' : '未戴無菌手套鋪單', why });
          next = { ...next, fieldContaminated: true };
        }
        events.push({ stepId: 'drape', kind: 'action', code: 'drape-placed', message: '鋪上洞巾' });
      }
      return { state: next, events };
    }

    case 'removeDrape':
      if (!s.drape.center || s.drape.removed) return { state: s };
      return { state: { ...s, drape: { ...s.drape, removed: true } }, events: [{ stepId: 'dressing', kind: 'action', code: 'drape-removed', message: '移除洞巾' }] };

    case 'selectTool':
      return { state: { ...s, tool: a.tool } };

    case 'loadNeedle': {
      if (s.needleDisposed) return { state: s, events: [blocked('suture', '縫針已丟棄，無法繼續縫合')] };
      if (s.items.needleSuture !== 'field') return { state: s, events: [blocked('suture', '縫針縫線尚未置入無菌區，無菌區內找不到縫針')] };
      if (s.needleLoaded) return { state: s };
      if (s.tool === 'fingers') {
        return { state: s, events: [{ stepId: 'suture', kind: 'error', code: 'needle-fingers', message: '用手指直接拿縫針', why: '應以持針器夾持縫針（約針體後 1/3 處），用手指操作容易針扎，也無法穩定控制進針角度。' }] };
      }
      if (s.tool !== 'holder') {
        return { state: s, events: [{ stepId: 'suture', kind: 'error', code: 'needle-wrong-tool', message: `用${s.tool === 'forceps' ? '鑷子' : s.tool === 'scissors' ? '剪刀' : '未選擇的工具'}夾持縫針`, why: '夾持縫針應使用持針器；鑷子用來輕夾皮緣，剪刀用來剪線。' }] };
      }
      const check = suturingSterilityCheck(s);
      return {
        state: { ...check.state, needleLoaded: true, work: { ...check.state.work, phase: check.state.work.phase === 'load' ? 'entry' : check.state.work.phase } },
        events: [...check.events, { stepId: 'suture', kind: 'action', code: 'needle-loaded', message: '以持針器夾持縫針' }],
      };
    }

    case 'pickPoint': {
      const w = s.work;
      if (w.phase !== 'entry' && w.phase !== 'exit') return { state: s };
      if (s.tool !== 'holder') return { state: s, events: [blocked('suture', '請先選擇持針器')] };
      if (!validBite(a.point)) return { state: s, events: [blocked('suture', '這個位置不在傷口兩側可縫合的範圍內')] };
      const check = suturingSterilityCheck(s);
      const base = check.state;
      if (w.phase === 'entry') {
        return { state: { ...base, work: { ...base.work, entry: a.point, phase: 'exit' } }, events: [...check.events, { stepId: 'suture', kind: 'action', code: 'entry', message: '選定進針點' }] };
      }
      if (Math.sign(a.point.y) === Math.sign(w.entry!.y)) return { state: s, events: [blocked('suture', '出針點需在傷口的另一側')] };
      return { state: { ...base, work: { ...base.work, exit: a.point, phase: 'angle' } }, events: check.events };
    }

    case 'setAngle':
      if (s.work.phase !== 'angle') return { state: s };
      return { state: { ...s, work: { ...s.work, entryAngle: Math.round(a.angle) } } };

    case 'confirmAngle': {
      if (s.work.phase !== 'angle') return { state: s };
      const events: NewEvent[] = [{ stepId: 'suture', kind: 'action', code: 'angle', message: `進針角度 ${s.work.entryAngle}°` }];
      if (!isPerpendicular(s.work.entryAngle)) {
        events.push({ stepId: 'suture', kind: 'error', code: 'angle-not-perpendicular', message: `第 ${s.stitches.length + 1} 針進針角度 ${s.work.entryAngle}°，未垂直皮膚`, why: '進針時針尖垂直皮膚，才能讓兩側咬合深度一致、皮緣輕微外翻。' });
      }
      return { state: { ...s, work: { ...s.work, phase: 'pass' } }, events };
    }

    case 'passProgress':
      if (s.work.phase !== 'pass') return { state: s };
      return { state: { ...s, work: { ...s.work, passProgress: Math.max(s.work.passProgress, Math.min(1, a.progress)) } } };

    case 'passComplete': {
      if (s.work.phase !== 'pass') return { state: s };
      const exitAngle = exitAngleFrom(s.work.entryAngle, a.drift);
      const events: NewEvent[] = [{ stepId: 'suture', kind: 'action', code: 'pass', message: `穿針完成，出針角度 ${exitAngle}°` }];
      if (!isPerpendicular(exitAngle)) {
        events.push({ stepId: 'suture', kind: 'error', code: 'exit-not-perpendicular', message: `第 ${s.stitches.length + 1} 針出針角度 ${exitAngle}°，未垂直皮膚`, why: '穿針時要順著針的弧度旋轉手腕，而不是直線推針；入針垂直、順弧旋轉，出針才會垂直。' });
      }
      return { state: { ...s, work: { ...s.work, passProgress: 1, exitAngle, phase: 'pull' } }, events };
    }

    case 'pullThrough':
      if (s.work.phase !== 'pull') return { state: s };
      return { state: { ...s, work: { ...s.work, phase: 'tie' } }, events: [{ stepId: 'suture', kind: 'action', code: 'pull', message: '拉出縫線，保留線尾準備打結' }] };

    case 'knotThrow': {
      if (s.work.phase !== 'tie') return { state: s };
      const prev = s.work.throws[s.work.throws.length - 1];
      const alternated = !prev || (prev.wrap !== a.wrap && prev.pull !== a.pull);
      const throws = [...s.work.throws, { wrap: a.wrap, pull: a.pull, alternated }];
      const events: NewEvent[] = [{ stepId: 'suture', kind: 'action', code: 'throw', message: `第 ${throws.length} 個結` }];
      if (!alternated) {
        events.push({ stepId: 'suture', kind: 'error', code: 'granny-knot', message: `第 ${s.stitches.length + 1} 針第 ${throws.length} 個結與前一結同方向`, why: '每個結的繞線方向與拉線方向都要和前一個相反，才會形成平整的方結；同方向容易形成祖母結而滑脫。' });
      }
      return { state: { ...s, work: { ...s.work, throws, phase: throws.length >= 3 ? 'cut' : 'tie' } }, events };
    }

    case 'undoThrow': {
      if (!s.work.throws.length || (s.work.phase !== 'tie' && s.work.phase !== 'cut')) return { state: s };
      return { state: { ...s, work: { ...s.work, throws: s.work.throws.slice(0, -1), phase: 'tie' } } };
    }

    case 'cutSuture': {
      if (s.work.phase !== 'cut') return { state: s };
      if (s.tool !== 'scissors') return { state: s, events: [blocked('suture', '剪線請選擇剪刀')] };
      const w = s.work;
      const stitch: StitchRecord = {
        id: s.nextStitchId,
        entry: w.entry!,
        exit: w.exit!,
        entryAngle: w.entryAngle,
        exitAngle: w.exitAngle ?? w.entryAngle,
        throws: w.throws,
        knotSide: w.throws[w.throws.length - 1]?.pull ?? 1,
      };
      const stitches = [...s.stitches, stitch];
      const events: NewEvent[] = [{ stepId: 'suture', kind: 'action', code: 'stitch-complete', message: `完成第 ${stitches.length} 針` }];
      const align = stitchAlignment(stitch);
      if (!align.aligned || !align.symmetric) {
        events.push({
          stepId: 'suture',
          kind: 'error',
          code: 'stitch-misaligned',
          message: `第 ${stitches.length} 針${!align.aligned ? '進出針不在同一條垂直線上' : ''}${!align.aligned && !align.symmetric ? '，且' : ''}${!align.symmetric ? '兩側離傷口距離不一致' : ''}`,
          why: '進出針點應位於傷口兩側同一條垂直線上、離傷口等距，皮緣才能對齊不錯位。',
        });
      }
      const gaps = stitchSpacings(stitches);
      const bad = gaps.filter((g) => !spacingOk(g));
      if (stitches.length >= 2 && bad.length && !stitchSpacings(s.stitches).filter((g) => !spacingOk(g)).length) {
        events.push({ stepId: 'suture', kind: 'error', code: 'spacing', message: `針距 ${bad.map((g) => g.toFixed(1)).join('、')} cm，未落在約一公分`, why: '針距約一公分可平均分散張力；太密影響血流，太疏則傷口對合不佳。' });
      }
      return { state: { ...s, stitches, nextStitchId: s.nextStitchId + 1, needleLoaded: true, work: newWork(true) }, events };
    }

    case 'resetStitch':
      return { state: { ...s, work: newWork(s.needleLoaded) }, events: [{ stepId: 'suture', kind: 'action', code: 'reset-stitch', message: '重設本針' }] };

    case 'removeLastStitch':
      if (!s.stitches.length) return { state: s };
      return { state: { ...s, stitches: s.stitches.slice(0, -1) }, events: [{ stepId: 'suture', kind: 'action', code: 'remove-stitch', message: `拆除第 ${s.stitches.length} 針重縫` }] };

    case 'resetAllStitches':
      return { state: { ...s, stitches: [], work: newWork(s.needleLoaded) }, events: [{ stepId: 'suture', kind: 'action', code: 'reset-all', message: '重設全部縫線' }] };

    case 'knotPracticeDone':
      return { state: { ...s, knotPractice: s.knotPractice + 1 } };

    case 'placeGauze': {
      if (s.drape.center && !s.drape.removed) return { state: s, events: [blocked('dressing', '洞巾還鋪在手上，請先移除洞巾')] };
      if (s.items.gauze === 'supply') return { state: s, events: [blocked('dressing', '滅菌紗布尚未準備')] };
      return { state: { ...s, dressing: { ...s.dressing, gauze: a.center } }, events: [{ stepId: 'dressing', kind: 'action', code: 'gauze', message: '以滅菌紗布覆蓋傷口' }] };
    }

    case 'placeTape': {
      if (s.items.tape === 'supply') return { state: s, events: [blocked('dressing', '紙膠帶尚未準備')] };
      const events: NewEvent[] = [{ stepId: 'dressing', kind: 'action', code: 'tape', message: '貼上紙膠帶' }];
      if (!s.dressing.gauze) events.push({ stepId: 'dressing', kind: 'order', code: 'tape-before-gauze', message: '尚未覆蓋紗布就先貼紙膠帶', why: '先以紗布覆蓋傷口，再用紙膠帶跨越紗布邊緣固定。' });
      return { state: { ...s, dressing: { ...s.dressing, tapes: [...s.dressing.tapes, a.center] } }, events };
    }

    case 'wrongDressing':
      return {
        state: s,
        events: [
          {
            stepId: 'dressing',
            kind: 'error',
            code: 'wrong-dressing',
            message: a.material === 'swabs' ? '嘗試用棉棒覆蓋傷口' : '嘗試以洞巾覆蓋傷口',
            why: a.material === 'swabs' ? '棉棒是消毒工具，不是覆蓋材料。教案要求以紗布覆蓋、紙膠帶黏妥。' : '洞巾已沾到血液，屬於用過的物品；覆蓋傷口應使用滅菌紗布。',
          },
        ],
      };

    case 'resetDressing':
      return { state: { ...s, dressing: { gauze: null, tapes: [] } } };

    case 'dispose': {
      if (s.disposal[a.waste]) return { state: s };
      const w = WASTE[a.waste];
      const next: WSState = { ...s, disposal: { ...s.disposal, [a.waste]: a.bin } };
      if (a.waste === 'needle') {
        next.needleDisposed = true;
        next.needleLoaded = false;
      }
      if (a.waste === 'glovesUsed') next.gloves = { ...s.gloves, status: 'none', progress: 0, contaminated: false };
      if (a.waste === 'drapeUsed') next.drape = { ...s.drape, removed: true };
      const events: NewEvent[] = [{ stepId: 'disposal', kind: 'action', code: `dispose-${a.waste}`, message: `「${w.name}」→ ${BINS[a.bin].name}` }];
      if (a.bin !== w.correct) {
        const minor = w.category === 'general';
        events.push({
          stepId: 'disposal',
          kind: minor ? 'action' : 'error',
          code: minor ? 'waste-advisory' : 'waste-wrong',
          message: `「${w.name}」丟入${BINS[a.bin].name}`,
          why: w.wrongWhy[a.bin],
        });
      }
      return { state: next, events };
    }

    case 'narrate': {
      const group = NARRATION.find((n) => n.phase === a.phase)!;
      const opt = group.options.find((o) => o.id === a.optionId)!;
      const timely = narrationTimely(s, a.phase);
      return {
        state: { ...s, narration: { ...s.narration, [a.phase]: { optionId: opt.id, quality: opt.quality, timely } } },
        events: [{ stepId: step, kind: 'narration', code: `narrate-${a.phase}`, message: `向病人說明（${group.title}）：${opt.text}`, why: opt.feedback }],
      };
    }
  }
}

/** 目前可以丟棄的物品（依實際使用過的器材產生） */
export function availableWaste(s: WSState): WasteId[] {
  const list: WasteId[] = [];
  if (s.items.needleSuture === 'field') list.push('needle', 'sutureWrapper');
  if (s.disinfection.strokes.length) list.push('usedSwabs');
  if (s.drape.center) list.push('drapeUsed');
  if (s.gloves.everSterile) list.push('glovesUsed');
  if (s.items.gauze === 'field') list.push('gauzeWrapper');
  return list;
}
