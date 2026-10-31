import { HAND_AREAS, STERILE_GLOVE_DECISIONS } from '../../../training/sterile';
import { COMM_OPTION_MAP, type StepId } from '../caseData';
import type { CTAction } from '../engine';
import { CATHETER_RUBRIC_CONFIG as CFG } from '../rubricConfig';

/**
 * CATHETER QUEST 正確示範腳本
 * 以練習用的同一個互動引擎重播正確操作；畫面與練習模式相同。
 * 各章可指定 videoUrl，日後有實拍示範影片時會優先顯示。
 * 臨床細節（消毒手法、潤滑範圍、水球容量等）依本教案與院內 SOP，需臨床教師審核。
 */
export type DemoFrame =
  | { kind: 'act'; action: CTAction; ms: number }
  | { kind: 'say'; text: string; ms: number }
  | { kind: 'patient'; optionId: string; ms: number }
  | { kind: 'highlight'; id: string; ms: number }
  | { kind: 'hand'; areas: string[]; ms: number };

export interface DemoChapter {
  id: string;
  title: string;
  stepId: StepId;
  keyPoints: string[];
  commonMistakes: string[];
  frames: DemoFrame[];
  videoUrl?: string;
}

const act = (action: CTAction, ms = 500): DemoFrame => ({ kind: 'act', action, ms });
const say = (text: string, ms = 3600): DemoFrame => ({ kind: 'say', text, ms });
const patient = (optionId: string, ms = 5200): DemoFrame => ({ kind: 'patient', optionId, ms });
const step = (s: StepId): DemoFrame => act({ type: 'setStep', step: s }, 300);

export const studentLine = (optionId: string) => COMM_OPTION_MAP[optionId].text;

/** 畫格對應的引擎動作（字幕、標示、手部動畫不改變狀態） */
export const frameAction = (f: DemoFrame): CTAction | null => (f.kind === 'act' ? f.action : f.kind === 'patient' ? { type: 'comm', optionId: f.optionId } : null);

function handFrames(phase: 'before' | 'after'): DemoFrame[] {
  const f: DemoFrame[] = [say('按壓乾洗手液，取足量於掌心。', 2600)];
  const done: string[] = [];
  for (const h of HAND_AREAS) {
    done.push(h.id);
    f.push({ kind: 'hand', areas: [...done], ms: 0 }, say(`${h.title}：${h.desc}。`, 2600));
  }
  f.push(say('所有部位都搓到後，持續搓揉至乾。', 2800), act({ type: 'hygiene', phase, areas: HAND_AREAS.map((h) => h.id) }, 1200));
  return f;
}

const gloveFrames = (): DemoFrame[] =>
  STERILE_GLOVE_DECISIONS.flatMap((d) => {
    const o = d.options.find((x) => x.correct)!;
    return [say(`${d.title}：${o.text}。`, 3400), { kind: 'highlight', id: o.id, ms: 1600 } as DemoFrame, say(o.why, 3400), act({ type: 'gloveDecision', decision: d.id, option: o.id }, 700)];
  });

const advance = (from: number, to: number, ms = 260): DemoFrame[] => {
  const out: DemoFrame[] = [];
  for (let d = from; d < to - 1e-6; d += 0.04) out.push(act({ type: 'advance', delta: 0.04, rate: 0.12, deviation: 0 }, ms));
  return out;
};

export const DEMO_CHAPTERS: DemoChapter[] = [
  {
    id: 'greet',
    title: '說明與安撫',
    stepId: 'greet',
    keyPoints: ['說明身分與來意', '回應病人的不舒服與擔心', '用聽得懂的話解釋導尿過程與感受', '保護隱私：拉上隔簾、只露出操作部位'],
    commonMistakes: ['一進來就開始操作，沒有說明', '使用 Foley、aseptic 等術語', '語氣不耐煩、催促病人'],
    frames: [
      step('greet'),
      say('楊先生因尿滯留下腹脹痛，又要接受私密部位的操作，通常非常緊張。先建立信任。', 4200),
      patient('b-intro'),
      patient('b-reassure'),
      patient('b-explain', 5600),
      patient('b-privacy'),
      patient('b-consent'),
      say('說法不只一種，重點是涵蓋「來意、安撫、解釋技術」，並且語氣溫和。', 4000),
      act({ type: 'wearMask' }, 900),
    ],
  },
  {
    id: 'hygieneBefore',
    title: '操作前手部衛生',
    stepId: 'hygieneBefore',
    keyPoints: ['接觸病人與無菌物品前執行', '掌心、手背、指縫、指背、拇指、指尖都要搓到', '搓揉至乾'],
    commonMistakes: ['已經開始碰病人或拆包才洗手', '漏掉指尖、拇指與指縫'],
    frames: [step('hygieneBefore'), ...handFrames('before')],
  },
  {
    id: 'prep',
    title: '器材準備',
    stepId: 'prep',
    keyPoints: ['導尿包放上工作台，由遠側往近側打開', '導尿管撕開外包裝落入無菌區，手不越過', '潤滑劑、優碘由上方倒入，瓶口不碰無菌區', '空針、尿袋、紙膠先放工作台備用'],
    commonMistakes: ['先開近側，手臂越過無菌面', '用手把導尿管拿進無菌區', '把瓶子拿進導尿包裡倒', '戴上無菌手套後才去拆包、倒溶液'],
    frames: [
      step('prep'),
      say('從工作車取導尿包放上工作台面。', 2800),
      act({ type: 'placeItem', item: 'kit', zone: 'table' }, 900),
      say('只碰外層包布的外面，先打開離身體最遠的一角。', 3400),
      act({ type: 'openFlap', flap: 'far' }, 700),
      say('再打開左右兩側。', 2200),
      act({ type: 'openFlap', flap: 'left' }, 600),
      act({ type: 'openFlap', flap: 'right' }, 700),
      say('最後打開近側，手臂就不會越過已打開的無菌面。', 3200),
      act({ type: 'openFlap', flap: 'near' }, 900),
      say('撕開導尿管外包裝，讓導尿管直接落入無菌區。', 3400),
      act({ type: 'placeItem', item: 'catheter', zone: 'field', method: 'peel-drop' }, 1000),
      say('潤滑劑由上方擠入導尿包內，管口不碰觸無菌區。', 3400),
      act({ type: 'pour', what: 'jelly', method: 'above' }, 900),
      say('優碘由上方倒在沖洗棉枝上，瓶口同樣不碰觸無菌區。', 3600),
      act({ type: 'pour', what: 'iodine', method: 'above' }, 900),
      say('打水球的空針、尿袋與紙膠先放在工作台備用，戴上無菌手套後就不必再碰工作車。', 4400),
      act({ type: 'placeItem', item: 'syringe', zone: 'table' }, 500),
      act({ type: 'placeItem', item: 'bag', zone: 'table' }, 500),
      act({ type: 'placeItem', item: 'tape', zone: 'table' }, 900),
    ],
  },
  {
    id: 'gloves',
    title: '無菌手套',
    stepId: 'gloves',
    keyPoints: ['裸手只碰手套反折的內面', '戴手套的手只碰另一隻手套的外表面', '戴好後雙手只接觸無菌區內的物品'],
    commonMistakes: ['裸手抓手套外表面', '整理反折時碰到手腕皮膚', '戴好後扶床欄、拉隔簾、到工作車拿東西'],
    frames: [step('gloves'), say('以閉合原則穿戴無菌手套。', 2600), ...gloveFrames(), say('戴好後，床欄、病人衣物、工作車、口罩、隔簾都不能再碰。', 4000)],
  },
  {
    id: 'disinfect',
    title: '消毒',
    stepId: 'disinfect',
    keyPoints: ['從尿道口開始', '由內往外，不回到已消毒的中心', '每支棉枝只用一次', '先消毒，後鋪洞巾（教案第 7 項）'],
    commonMistakes: ['由外往內擦', '同一支棉枝來回擦', '先鋪洞巾才消毒'],
    frames: [
      step('disinfect'),
      patient('d-cold'),
      say('取一支沾好優碘的棉枝，從尿道口開始，向外擴大消毒範圍。', 3800),
      act({ type: 'swabStroke', zones: ['meatus', 'glans', 'shaft'], startAtMeatus: true, outward: true, backtrack: false }, 1400),
      say('用過的棉枝不再回到中心；換一支新的棉枝，再由內往外。', 3600),
      act({ type: 'swabStroke', zones: ['meatus', 'glans', 'shaft'], startAtMeatus: true, outward: true, backtrack: false }, 1400),
      act({ type: 'swabStroke', zones: ['meatus', 'glans', 'shaft'], startAtMeatus: true, outward: true, backtrack: false }, 1200),
      say(`本示範依教學示意規則；${CFG.disinfect.review.note}`, 4600),
    ],
  },
  {
    id: 'drape',
    title: '鋪洞巾',
    stepId: 'drape',
    keyPoints: ['確認已完成消毒、手套仍無菌', '持洞巾，開口對準尿道口一次放下', '接觸皮膚後不從外往內拖動調整'],
    commonMistakes: ['未消毒就先鋪洞巾', '放歪後把洞巾往內拖'],
    frames: [
      step('drape'),
      patient('d-drape'),
      say('消毒完成後，從導尿包取出無菌洞巾，開口對準尿道口一次放下。', 3800),
      act({ type: 'placeDrape', offset: 0 }, 1400),
      say('先消毒、後鋪洞巾，是本教案特別要求的順序。', 3400),
    ],
  },
  {
    id: 'lubricate',
    title: '潤滑',
    stepId: 'lubricate',
    keyPoints: ['從導尿管尖端開始塗抹', `本教案規準：${CFG.lubrication.label}`, '潤滑劑取自導尿包內'],
    commonMistakes: ['只塗尖端一小段', '直接拿潤滑劑管口碰導尿管'],
    frames: [
      step('lubricate'),
      say('從導尿管尖端開始，沿著管身往後塗抹潤滑劑。', 3400),
      ...[0.12, 0.24, 0.36, 0.48, 0.56].map((to, i, arr) => act({ type: 'lubricate', from: i ? arr[i - 1] : 0, to }, 500)),
      say(`本教案要求塗到${CFG.lubrication.label}；實際範圍依產品說明與院內 SOP。`, 4400),
    ],
  },
  {
    id: 'insert',
    title: '置入導尿管',
    stepId: 'insert',
    keyPoints: ['尖端對準尿道口', '小幅度、緩慢、受控地推進', '遇到不明阻力：停止、安撫病人、尋求臨床指導', '見尿後依教案繼續置入至導尿管末端'],
    commonMistakes: ['推得太快', '遇到阻力用力推過去', '一見尿就停止，接著打水球'],
    frames: [
      step('insert'),
      patient('i-breath'),
      patient('i-tell'),
      say('把導尿管尖端移到尿道口。', 2600),
      act({ type: 'catheterToMeatus', target: 'meatus' }, 1000),
      say('沿著軸線，緩慢、穩定地推進。', 3000),
      ...advance(0, 0.36),
      say('模擬情境：推進時感到阻力。正確做法是停止推進，不可強行推過去。', 4400),
      ...advance(0.36, 0.4),
      say('停下來，請病人深呼吸放鬆，並尋求臨床教師協助評估。', 4000),
      act({ type: 'resistanceChoice', choice: 'stop-help' }, 1800),
      say('（模擬）臨床教師評估後，確認可以繼續緩慢推進。', 3400),
      act({ type: 'teacherResume' }, 900),
      ...advance(0.4, 0.76),
      say('見尿了。依本教案，繼續緩慢置入至導尿管末端（分叉處）。', 4000),
      ...advance(0.76, 1.01),
      say('網頁中的阻力與見尿都是教學模擬事件，不代表真實組織阻力或解剖位置。', 4200),
    ],
  },
  {
    id: 'balloon',
    title: '水球與定位',
    stepId: 'balloon',
    keyPoints: ['確認見尿且已置入至末端，才打水球', '使用已抽好蒸餾水的 10 mL 空針', '接水球閥，不是引流端', `打入 ${CFG.balloon.minMl}–${CFG.balloon.maxMl} cc（本教案），再輕拉至卡住`],
    commonMistakes: ['還沒置入到位就打水球', '空針接到引流端', '水球未打水就回拉'],
    frames: [
      step('balloon'),
      say('先確認兩個條件：已見尿、已置入至導尿管末端。條件未達成時，系統會鎖住水球操作。', 4800),
      say('拿起已抽好蒸餾水的 10 mL 空針。', 2800),
      act({ type: 'balloonTool', tool: 'syringe' }, 900),
      say('導尿管尾端分叉：較粗的是引流端，側支有閥的是水球管腔。空針接水球閥。', 4400),
      act({ type: 'syringePort', port: 'balloon' }, 1000),
      say(`打入本教案要求的水量：${CFG.balloon.minMl}–${CFG.balloon.maxMl} cc 蒸餾水。`, 3400),
      act({ type: 'inflate', ml: 10 }, 1200),
      say('輕輕回拉導尿管，直到感覺卡住，表示水球位於定位（模擬）。', 3800),
      ...[0.02, 0.02, 0.02, 0.02].map((d) => act({ type: 'pullBack', delta: d, rate: 0.1 }, 450)),
      say(`容量依導尿管產品標示與院內 SOP；${CFG.balloon.review.note}`, 4000),
    ],
  },
  {
    id: 'connect',
    title: '尿袋連接與固定',
    stepId: 'connect',
    keyPoints: ['取保護蓋時不碰接頭尖端', '手套仍無菌時連接，形成封閉引流系統', '紙膠固定導尿管', '尿袋固定在低於膀胱的位置'],
    commonMistakes: ['手指碰到接頭尖端', '只連接不固定', '尿袋放在病人腹部上'],
    frames: [
      step('connect'),
      say('握住保護蓋取下，接頭端不碰觸任何東西。', 3400),
      act({ type: 'capOff', method: 'cap' }, 900),
      say('把尿袋接頭接上導尿管的引流端。', 3000),
      act({ type: 'connectBag' }, 1200),
      say('以紙膠將導尿管固定於大腿，避免拉扯尿道（固定位置依院內 SOP）。', 3800),
      act({ type: 'tapeCatheter', site: 'thigh' }, 1000),
      say('尿袋掛在床緣，低於膀胱高度，利用重力引流、避免逆流。', 3800),
      act({ type: 'hangBag', site: 'bedFrame' }, 1200),
      patient('a-done', 5600),
    ],
  },
  {
    id: 'disposal',
    title: '廢棄物處理',
    stepId: 'disposal',
    keyPoints: ['脫除手套', '棉枝、洞巾、手套、集尿碗、空針 → 感染性垃圾桶', '未污染的外包裝 → 一般垃圾桶', '整理環境、照顧病人舒適與隱私'],
    commonMistakes: ['用過的棉枝、手套丟一般垃圾', '做完就離開，沒有協助病人整理衣物'],
    frames: [
      step('disposal'),
      say('操作完成，脫除手套。', 2400),
      act({ type: 'removeGloves' }, 900),
      say('接觸過病人、體液或消毒液的物品，全部丟入感染性垃圾桶。', 3800),
      ...(['swabs', 'drape', 'tray', 'gloves', 'syringe'] as const).map((w) => act({ type: 'dispose', waste: w, bin: 'infectious' }, 550)),
      say('沒有污染的外包裝丟一般垃圾桶。', 3000),
      act({ type: 'dispose', waste: 'catheterWrap', bin: 'general' }, 550),
      act({ type: 'dispose', waste: 'gloveWrap', bin: 'general' }, 900),
      patient('a-cover'),
      act({ type: 'wrapUp', id: 'cover' }, 500),
      act({ type: 'wrapUp', id: 'curtain' }, 500),
      act({ type: 'wrapUp', id: 'tidy' }, 900),
    ],
  },
  {
    id: 'hygieneAfter',
    title: '操作後手部衛生',
    stepId: 'hygieneAfter',
    keyPoints: ['脫手套後一定要再做手部衛生', '手套不能取代手部衛生'],
    commonMistakes: ['覺得戴過手套就不用洗手'],
    frames: [step('hygieneAfter'), ...handFrames('after'), say('示範完成！接下來可以用引導練習模式自己操作一次。', 4000)],
  },
];

/** 章節開始前的狀態：套用之前所有章節的動作（可直接跳到任一章節） */
export function actionsBefore(chapterIndex: number): CTAction[] {
  return DEMO_CHAPTERS.slice(0, chapterIndex).flatMap((c) => c.frames.map(frameAction).filter((a): a is CTAction => a !== null));
}
