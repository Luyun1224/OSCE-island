import { NARRATION, type NarrationPhase, type StepId } from '../caseData';
import { GLOVE_DECISIONS, type WSAction } from '../engine';

/**
 * 正確示範（Demonstration）腳本
 * 以真實互動引擎的動作序列重播正確操作，畫面與練習模式使用同一套模擬診間。
 * 每個章節可另外指定 videoUrl，日後有實拍示範影片時會優先顯示。
 */
export type DemoFrame =
  | { kind: 'act'; action: WSAction; ms: number }
  | { kind: 'say'; text: string; ms: number }
  | { kind: 'patient'; phase: NarrationPhase; ms: number }
  | { kind: 'highlight'; id: string; ms: number };

export interface DemoChapter {
  id: string;
  title: string;
  stepId: StepId | null;
  keyPoints: string[];
  commonMistakes: string[];
  frames: DemoFrame[];
  videoUrl?: string;
}

const act = (action: WSAction, ms = 450): DemoFrame => ({ kind: 'act', action, ms });
const say = (text: string, ms = 3600): DemoFrame => ({ kind: 'say', text, ms });
const patient = (phase: NarrationPhase, ms = 5200): DemoFrame => ({ kind: 'patient', phase, ms });

const goodOption = (phase: NarrationPhase) => NARRATION.find((n) => n.phase === phase)!.options.find((o) => o.quality === 'good')!;
export const patientLine = (phase: NarrationPhase) => goodOption(phase).text;
export const narrateAction = (phase: NarrationPhase): WSAction => ({ type: 'narrate', phase, optionId: goodOption(phase).id });

/** 畫格對應的引擎動作（說明字幕與標示不改變狀態） */
export const frameAction = (f: DemoFrame): WSAction | null => (f.kind === 'act' ? f.action : f.kind === 'patient' ? narrateAction(f.phase) : null);

/** 由內而外的消毒螺旋，切成多段以呈現塗抹過程 */
function disinfectionFrames(): DemoFrame[] {
  const pts = Array.from({ length: 96 }, (_, i) => {
    const a = i * 0.42;
    const r = 0.25 + i * 0.042;
    return { x: Math.cos(a) * r * 1.15, y: Math.sin(a) * r };
  });
  const frames: DemoFrame[] = [];
  for (let i = 0; i < pts.length - 1; i += 6) frames.push(act({ type: 'disinfectStroke', points: pts.slice(i, i + 7) }, 170));
  return frames;
}

/** 一針完整流程；detailed 時加上逐步解說 */
function stitchFrames(x: number, n: number, detailed: boolean): DemoFrame[] {
  const f: DemoFrame[] = [];
  const note = (text: string, ms?: number) => detailed && f.push(say(text, ms));
  note(`第 ${n} 針：沿著傷口規劃位置，${n === 1 ? '從傷口一端約 1 公分處開始' : '與前一針相距約 1 公分'}。`);
  f.push(act({ type: 'pickPoint', point: { x, y: 0.6 } }, detailed ? 900 : 500));
  note('進針點與出針點位於傷口兩側同一條垂直線上，離傷口距離相同。');
  f.push(act({ type: 'pickPoint', point: { x, y: -0.6 } }, detailed ? 900 : 500));
  note('針尖與皮膚垂直（90°）進針，兩側咬合深度才會一致，皮緣輕微外翻。', 4000);
  f.push(act({ type: 'setAngle', angle: 90 }, 300), act({ type: 'confirmAngle' }, 500));
  note('順著縫針的弧度旋轉手腕，讓針自然從對側垂直穿出，不要直線推針。', 3800);
  for (let i = 1; i <= 12; i++) f.push(act({ type: 'passProgress', progress: i / 12 }, detailed ? 160 : 90));
  f.push(act({ type: 'passComplete', drift: 0 }, 600));
  note('拉出縫線，保留適當線尾準備打結。');
  f.push(act({ type: 'pullThrough' }, 600));
  const throws: [('cw' | 'ccw'), 1 | -1, string][] = [
    ['cw', 1, '第 1 個結：縫線繞持針器一圈 → 夾住線尾 → 朝跨越傷口方向拉緊。'],
    ['ccw', -1, '第 2 個結：繞線方向與拉線方向都和上一個結相反，形成平整的方結。'],
    ['cw', 1, '第 3 個結：再交替一次方向，結就不容易鬆脫。'],
  ];
  for (const [wrap, pull, text] of throws) {
    note(text, 3800);
    f.push(act({ type: 'knotThrow', wrap, pull }, detailed ? 900 : 450));
  }
  note('換剪刀剪線，結放在傷口一側、不要壓在傷口線上。');
  f.push(act({ type: 'selectTool', tool: 'scissors' }, 500), act({ type: 'cutSuture' }, 700), act({ type: 'selectTool', tool: 'holder' }, 400));
  return f;
}

const [gOpen, gFirst, gSecond, gAdjust] = GLOVE_DECISIONS.map((d) => d.options.find((o) => o.correct)!);

export const DEMO_CHAPTERS: DemoChapter[] = [
  {
    id: 'intro',
    title: '情境與任務',
    stepId: 'prep',
    keyPoints: ['傷口已清洗並完成局部麻醉，本站不需清創或麻醉', '任務：消毒、鋪單、縫合（至少三針）、覆蓋傷口', '假想病人在場，適時說明'],
    commonMistakes: ['一開始就動手，沒有先向病人說明'],
    frames: [
      say('蘇先生，20 歲，手部被利刃劃傷後自行到急診。傷口已清洗乾淨並完成局部麻醉。', 4500),
      say('本站要完成：消毒、鋪單、至少縫三針、覆蓋傷口，並對病人做適當說明。考站時間 8 分鐘。', 4500),
      patient('intro'),
    ],
  },
  {
    id: 'prep',
    title: '器材準備',
    stepId: 'prep',
    keyPoints: ['先建立無菌區，再放入無菌物品', '包布先開遠側、最後開近側', '撕開外包裝讓內容物落入，手不越過無菌區', '非無菌物品（消毒瓶、紙膠、手套外包裝）放在無菌區外'],
    commonMistakes: ['先開近側，之後手臂越過無菌面', '用裸手拿出縫線', '把消毒瓶或紙膠放進無菌區'],
    frames: [
      act({ type: 'setStep', step: 'prep' }, 300),
      say('無菌操作前先戴上口罩。'),
      act({ type: 'wearMask' }, 700),
      say('把無菌包布放到操作台面，準備打開建立無菌區。'),
      act({ type: 'placeItem', item: 'sterileWrap', zone: 'field' }, 900),
      say('只捏包布外側的角，先打開離身體最遠的一角，手臂才不會越過已打開的無菌面。', 4200),
      act({ type: 'openFlap', flap: 'far' }, 900),
      say('接著打開左右兩側。', 2400),
      act({ type: 'openFlap', flap: 'left' }, 700),
      act({ type: 'openFlap', flap: 'right' }, 700),
      say('最後打開靠近自己的一角，無菌區建立完成：內含持針器、鑷子、剪刀與洞巾。', 4200),
      act({ type: 'openFlap', flap: 'near' }, 1200),
      say('縫針縫線：撕開外包裝，讓內容物直接落入無菌區——手和外包裝都不碰觸無菌區。這是教案第 2 項的關鍵。', 5200),
      act({ type: 'placeItem', item: 'needleSuture', zone: 'field', method: 'peel-drop' }, 900),
      say('滅菌大棉棒與 4×4 紗布也用同樣方式置入。'),
      act({ type: 'placeItem', item: 'swabs', zone: 'field', method: 'peel-drop' }, 700),
      act({ type: 'placeItem', item: 'gauze', zone: 'field', method: 'peel-drop' }, 900),
      say('消毒溶液、無菌手套（外包裝）與紙膠帶不是無菌的，放在無菌區外的清潔檯面。', 4200),
      act({ type: 'placeItem', item: 'antiseptic', zone: 'clean' }, 600),
      act({ type: 'placeItem', item: 'sterileGloves', zone: 'clean' }, 600),
      act({ type: 'placeItem', item: 'tape', zone: 'clean' }, 800),
      say('趁還沒戴手套，先把消毒溶液倒在無菌區內的棉棒上；戴上無菌手套後就不能再碰消毒瓶。', 4800),
      act({ type: 'wetSwab' }, 1200),
    ],
  },
  {
    id: 'gloves',
    title: '穿戴無菌手套',
    stepId: 'gloves',
    keyPoints: ['裸手只碰手套「會貼皮膚」的反折內面', '戴好的手只碰另一隻手套的外表面', '戴好後雙手保持在腰部以上、視線範圍內'],
    commonMistakes: ['裸手抓手套外表面', '戴手套的手碰到反折內面或手腕皮膚', '戴好後去調整檯燈或口罩'],
    frames: [
      act({ type: 'setStep', step: 'gloves' }, 300),
      say('閉合原則：無菌對無菌、非無菌對非無菌。'),
      { kind: 'highlight', id: gOpen.id, ms: 3200 },
      act({ type: 'gloveDecision', optionId: gOpen.id }, 600),
      say('第一隻：裸手捏住反折袖口的內面，這一面之後貼著皮膚，本來就不需要無菌。', 4200),
      { kind: 'highlight', id: gFirst.id, ms: 2600 },
      act({ type: 'gloveDecision', optionId: gFirst.id }, 600),
      say('第二隻：已戴手套的四指伸進反折「下方」——那是手套外表面，無菌碰無菌。', 4200),
      { kind: 'highlight', id: gSecond.id, ms: 2600 },
      act({ type: 'gloveDecision', optionId: gSecond.id }, 600),
      say('最後用手套手指翻好反折，不碰到手腕皮膚。', 3200),
      { kind: 'highlight', id: gAdjust.id, ms: 2400 },
      act({ type: 'gloveDecision', optionId: gAdjust.id }, 1200),
    ],
  },
  {
    id: 'disinfect',
    title: '消毒',
    stepId: 'disinfect',
    keyPoints: ['從傷口開始，由內而外畫圈', '不回到已消毒的中心', '範圍大於洞巾的開口'],
    commonMistakes: ['從外圍往傷口擦', '來回擦拭', '範圍太小，洞巾邊緣露出未消毒皮膚'],
    frames: [
      act({ type: 'setStep', step: 'disinfect' }, 300),
      patient('disinfect'),
      say('從傷口開始，一圈比一圈大，由內而外塗抹，不要回到已經消毒過的中心。', 4200),
      ...disinfectionFrames(),
      say('最外圈要超過虛線——也就是洞巾開口的範圍。這樣同時符合教案第 4 項的兩個條件。', 4800),
    ],
  },
  {
    id: 'drape',
    title: '無菌鋪單',
    stepId: 'drape',
    keyPoints: ['戴著無菌手套持洞巾外緣', '開口對準傷口，一次放到位', '需要調整只能往外，不能往傷口方向拖'],
    commonMistakes: ['未戴無菌手套拿洞巾', '放下後往內拖移調整位置'],
    frames: [
      act({ type: 'setStep', step: 'drape' }, 300),
      patient('drape'),
      say('戴著無菌手套持洞巾外緣，讓開口對準傷口後一次放下。', 3800),
      act({ type: 'placeDrape', center: { x: 0, y: 0 } }, 1500),
      say('洞巾接觸皮膚後邊緣已不乾淨；若要調整只能往外移，絕不從外往傷口方向拖。', 4500),
    ],
  },
  {
    id: 'suture',
    title: '縫合',
    stepId: 'suture',
    keyPoints: ['用持針器夾針，不用手指拿針', '垂直進針、順弧旋轉、垂直出針', '每針三個結，方向交替成方結', '至少三針，針距約一公分，結放在傷口一側'],
    commonMistakes: ['斜向進針或直線推針，出針角度歪斜', '每個結同方向（祖母結）', '針距忽大忽小'],
    frames: [
      act({ type: 'setStep', step: 'suture' }, 600),
      patient('suture'),
      say('選擇持針器，夾持縫針約針體後 1/3 處。', 3200),
      act({ type: 'selectTool', tool: 'holder' }, 500),
      act({ type: 'loadNeedle' }, 900),
      ...stitchFrames(-1, 1, true),
      say('第 2、3 針重複同樣的步驟：位置相距約 1 公分、垂直進出針、三個方向交替的結。', 4500),
      ...stitchFrames(0, 2, false),
      ...stitchFrames(1, 3, false),
      say('三針完成：針距約 1 公分、排列整齊，每針都有三個結。', 4200),
    ],
  },
  {
    id: 'dressing',
    title: '覆蓋傷口',
    stepId: 'dressing',
    keyPoints: ['先移除洞巾', '紗布完整蓋住傷口與縫線', '紙膠帶跨越紗布邊緣黏在皮膚上，至少兩條'],
    commonMistakes: ['洞巾沒拿掉就包紮', '膠帶只貼在紗布上，沒有黏到皮膚'],
    frames: [
      act({ type: 'setStep', step: 'dressing' }, 300),
      say('先移除沾血的洞巾。'),
      act({ type: 'removeDrape' }, 900),
      patient('dressing'),
      say('滅菌紗布完整覆蓋整條傷口與縫線。'),
      act({ type: 'placeGauze', center: { x: 0, y: 0 } }, 1200),
      say('紙膠帶跨越紗布邊緣黏到皮膚上固定，至少兩條。'),
      act({ type: 'placeTape', center: { x: -5, y: 0 } }, 900),
      act({ type: 'placeTape', center: { x: 5, y: 0 } }, 1400),
    ],
  },
  {
    id: 'disposal',
    title: '廢棄物處理',
    stepId: 'disposal',
    keyPoints: ['縫針 → 廢棄針筒收集盒', '沾血棉棒、洞巾、手套 → 紅色感染性垃圾桶', '未污染的外包裝 → 一般垃圾'],
    commonMistakes: ['縫針丟進垃圾桶，造成清潔人員針扎', '沾血物品丟一般垃圾'],
    frames: [
      act({ type: 'setStep', step: 'disposal' }, 300),
      say('先處理最危險的尖銳物：縫針丟入廢棄針筒收集盒。', 3800),
      act({ type: 'dispose', waste: 'needle', bin: 'sharps' }, 1000),
      say('沾到血液的棉棒、洞巾與手套，丟入紅色感染性垃圾桶。', 3800),
      act({ type: 'dispose', waste: 'usedSwabs', bin: 'infectious' }, 600),
      act({ type: 'dispose', waste: 'drapeUsed', bin: 'infectious' }, 600),
      act({ type: 'dispose', waste: 'glovesUsed', bin: 'infectious' }, 900),
      say('沒有污染的外包裝紙丟一般垃圾桶，減少醫療廢棄物。', 3600),
      act({ type: 'dispose', waste: 'sutureWrapper', bin: 'general' }, 600),
      act({ type: 'dispose', waste: 'gauzeWrapper', bin: 'general' }, 1200),
      say('示範完成！接下來可以用引導模式自己操作一次。', 4000),
    ],
  },
];

/** 章節開始前的狀態：套用之前所有章節的動作（可直接跳到任一章節） */
export function actionsBefore(chapterIndex: number): WSAction[] {
  return DEMO_CHAPTERS.slice(0, chapterIndex).flatMap((c) => c.frames.map(frameAction).filter((a): a is WSAction => a !== null));
}
