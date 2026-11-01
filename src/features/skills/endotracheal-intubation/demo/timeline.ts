import { demoStep, type DemoChapterDef } from '../../../training/components/DemonstrationPlayer';
import { REQUIRED_AUSC, AUSC_LABEL, type ItemId, type StepId } from '../caseData';
import type { AWAction } from '../engine';
import type { CameraPreset } from '../ui/CameraController';

/**
 * AIRWAY QUEST 正確示範時間軸（資料驅動）
 * 每個步驟：stepId、title、duration、narrationText／subtitles（由 cues 產生）、narrationAudio（選填）、
 * cameraPreset、animationAction、highlightedObjects（「#」開頭為畫面選項標示）、teachingPoints、safetyNotes、source。
 * 動畫動作直接驅動練習用的同一個引擎，畫面與練習一致。
 * 狀態：可替換的動畫原型，尚未經臨床教師核准（見 rubricConfig.review.demonstration）。
 */
type Ch = DemoChapterDef<AWAction, CameraPreset>;
const S = demoStep<AWAction, CameraPreset>;
const tray = (ids: ItemId[]): AWAction[] => ids.map((item) => ({ type: 'placeItem', item, zone: 'tray' }));

export const DEMO_TIMELINE: Ch[] = [
  {
    id: 'ch1',
    title: '01 器材準備與檢查',
    steps: [
      S({
        stepId: 'ch1-kit',
        practiceStepId: 'prep',
        title: '備齊插管器材',
        duration: 3000,
        cameraPreset: 'panorama',
        animationAction: [],
        cues: [
          { text: '插管前先把器材一次備齊，插管開始後就沒有時間回頭找。' },
          { text: '教案要求的物品有：喉頭鏡、氣管內管、通條、十毫升空針、咬口器與固定膠帶。', actions: tray(['handle', 'blade', 'stylet', 'syringe', 'bite', 'ties']) },
          { text: '另外準備袋瓣罩、潤滑液、聽診器與擺位用的布捲。', actions: tray(['bvm', 'lube', 'stethoscope', 'towel']) },
        ],
        highlightedObjects: ['器材盤', '喉頭鏡握把', '喉頭鏡葉片', '通條', '10 mL 空針', '咬口器', '固定帶'],
        teachingPoints: ['教案第 1 項：六項物品皆備齊才是完全做到', '缺兩項以上，或沒有準備喉頭鏡，為沒有做到'],
        safetyNotes: [],
        source: 'case',
      }),
      S({
        stepId: 'ch1-tube',
        practiceStepId: 'prep',
        title: '選擇氣管內管',
        duration: 2500,
        cameraPreset: 'panorama',
        animationAction: [],
        cues: [{ text: '本教案病人為六十歲男性，身高約一六五公分、體重約七十公斤，依教案選擇內徑七點零或七點五的氣管內管。', actions: tray(['ett75']) }],
        highlightedObjects: ['氣管內管'],
        teachingPoints: ['教案第 2 項：內徑 7.0 或 7.5', '管徑數值為本教案要求，實際選擇依病人與臨床指導'],
        safetyNotes: [],
        source: 'case',
      }),
      S({
        stepId: 'ch1-scope',
        practiceStepId: 'prep',
        title: '組裝喉頭鏡並檢查燈泡',
        duration: 2500,
        cameraPreset: 'panorama',
        animationAction: [],
        cues: [
          { text: '把葉片扣上握把，完成喉頭鏡組裝。', actions: [{ type: 'assembleScope' }] },
          { text: '打開葉片，確認燈泡會亮。燈泡不亮就無法看清聲門。', actions: [{ type: 'checkLight' }] },
        ],
        highlightedObjects: ['喉頭鏡握把', '喉頭鏡葉片'],
        teachingPoints: ['教案第 3 項：組裝與檢查燈泡兩項都要做到'],
        safetyNotes: [],
        source: 'case',
      }),
      S({
        stepId: 'ch1-cuff',
        practiceStepId: 'prep',
        title: 'cuff 檢查與潤滑',
        duration: 2500,
        cameraPreset: 'panorama',
        animationAction: [],
        cues: [
          { text: '用十毫升空針打氣，確認 cuff 膨起且不漏氣，確認完整後把氣抽回。', actions: [{ type: 'checkCuff', method: 'syringe' }] },
          { text: '在氣管內管管端塗抹潤滑液。', actions: [{ type: 'lubeTube' }] },
        ],
        highlightedObjects: ['10 mL 空針', '氣管內管'],
        teachingPoints: ['教案第 4 項：用空針確認 cuff 完整＋管端塗抹潤滑液'],
        safetyNotes: [],
        source: 'case',
      }),
      S({
        stepId: 'ch1-stylet',
        practiceStepId: 'prep',
        title: '置入通條',
        duration: 2500,
        cameraPreset: 'panorama',
        animationAction: [],
        cues: [
          { text: '如需使用通條，將通條置入氣管內管內。', actions: [{ type: 'insertStylet', protruding: false }] },
          { text: '依現行臨床安全觀念，通條前端不要超出管尖。' },
        ],
        highlightedObjects: ['通條'],
        teachingPoints: ['教案第 10 項：插管後要移除通條'],
        safetyNotes: ['通條前端不可超出管尖（現行臨床安全補充，待教師確認）'],
        source: 'case',
      }),
    ],
  },
  {
    id: 'ch2',
    title: '02 插管前通氣',
    steps: [
      S({
        stepId: 'ch2-mask',
        practiceStepId: 'bvm',
        title: '面罩方向與位置',
        duration: 2500,
        cameraPreset: 'airway',
        animationAction: [],
        cues: [
          { text: '面罩尖端朝向頭側，放在鼻樑上，寬的一端蓋住口與下巴之間，避免壓到眼睛。', actions: [{ type: 'placeMask', zone: 'correct', apexToHead: true }] },
          { text: '以單手或雙手固定面罩讓它密合，教案兩種方式都接受。', actions: [{ type: 'setGrip', grip: 'one' }] },
        ],
        highlightedObjects: ['袋瓣罩（Ambu bag）', '#grip-one'],
        teachingPoints: ['教案第 5 項：尖端朝頭側＋避免壓到眼睛', '單手或雙手操作皆可'],
        safetyNotes: ['面罩邊緣不可壓迫眼睛'],
        source: 'case',
      }),
      S({
        stepId: 'ch2-vent',
        practiceStepId: 'bvm',
        title: '給氧通氣與胸廓起伏',
        duration: 3000,
        cameraPreset: 'chest',
        animationAction: [],
        cues: [
          { text: '擠壓袋子，觀察胸廓是否明顯而規律地起伏。', actions: [{ type: 'squeezeMask', at: 0 }] },
          { text: '本教案要求給氣速度每分鐘十到十二次，大約每五到六秒一次。', actions: [{ type: 'squeezeMask', at: 5.5 }] },
          { text: '給氣不要太快，過快可能讓空氣進入胃部。', actions: [{ type: 'squeezeMask', at: 11 }] },
          { text: '確認有效通氣後，再準備插管。', actions: [{ type: 'squeezeMask', at: 16.5 }, { type: 'removeMask' }] },
        ],
        highlightedObjects: ['胸廓', '袋瓣罩（Ambu bag）'],
        teachingPoints: ['教案第 6 項：胸廓明顯規律起伏＋速度 10–12 次/分', '通氣頻率為本教案評分參數，實際依現行急救指引'],
        safetyNotes: [],
        source: 'case',
      }),
    ],
  },
  {
    id: 'ch3',
    title: '03 頭部擺位與喉頭鏡',
    steps: [
      S({
        stepId: 'ch3-sniff',
        practiceStepId: 'position',
        title: 'Sniffing position',
        duration: 2500,
        cameraPreset: 'airway',
        animationAction: [],
        cues: [
          { text: '將頭部擺成 sniffing position，也就是嗅物姿勢。', actions: [{ type: 'placeTowel', where: 'occiput' }] },
          { text: '本示意以布捲墊在枕部，並讓頭部適度後仰。', actions: [{ type: 'setExtension', level: 'moderate' }, { type: 'confirmPosition' }] },
        ],
        highlightedObjects: ['氣管插管訓練模型（安妮）', '#ext-moderate'],
        teachingPoints: ['教案第 7 項：只有 0／2 分', '實際擺位手法以實體模型由臨床教師示範'],
        safetyNotes: [],
        source: 'case',
      }),
      S({
        stepId: 'ch3-scope',
        practiceStepId: 'laryngoscopy',
        title: '喉頭鏡持握與上提',
        duration: 3000,
        cameraPreset: 'laryngoscope',
        animationAction: [],
        cues: [
          { text: '以左手持喉頭鏡。', actions: [{ type: 'selectHand', hand: 'left' }] },
          { text: '置入葉片後，沿著握把方向向前上方提起，顯露聲門。', actions: [{ type: 'insertBlade' }, { type: 'lift', how: 'lift' }] },
          { text: '不可以上排牙齒當支點往後撬。這個畫面是教學示意，真實技巧請在實體模型上由教師指導。' },
        ],
        highlightedObjects: ['喉頭鏡', '#hand-left', '#lift-lift'],
        teachingPoints: ['教案第 8 項：左手持喉頭鏡＋適當上提'],
        safetyNotes: ['以牙齒為支點撬動可能造成牙齒損傷'],
        source: 'case',
      }),
    ],
  },
  {
    id: 'ch4',
    title: '04 氣管內管置入',
    steps: [
      S({
        stepId: 'ch4-pass',
        practiceStepId: 'intubate',
        title: '通過聲門',
        duration: 2500,
        cameraPreset: 'laryngoscope',
        animationAction: [],
        cues: [
          { text: '看見聲門後，右手將氣管內管通過兩側聲帶之間。', actions: [{ type: 'intubate', target: 'glottis' }] },
          { text: '看不到聲門時不要盲目放管，應重新調整，或停止並以袋瓣罩給氧。' },
        ],
        highlightedObjects: ['氣管內管', '喉頭鏡'],
        teachingPoints: ['教案第 14 項：第一次插管位置即正確為完全做到'],
        safetyNotes: ['盲目置管容易進入食道'],
        source: 'case',
      }),
      S({
        stepId: 'ch4-depth',
        practiceStepId: 'intubate',
        title: '確認嘴角刻度',
        duration: 2500,
        cameraPreset: 'tube',
        animationAction: [],
        cues: [{ text: '讀取嘴角刻度，本教案的深度約為二十到二十二公分。', actions: [{ type: 'setDepth', cm: 21 }, { type: 'readDepth' }] }],
        highlightedObjects: ['氣管內管'],
        teachingPoints: ['教案第 9 項：確認深度並在 20–22 cm', '深度數字只是確認項目之一，不能單獨證明位置正確'],
        safetyNotes: [],
        source: 'case',
      }),
      S({
        stepId: 'ch4-cuff',
        practiceStepId: 'tubeCare',
        title: '移除通條與 cuff 充氣',
        duration: 2500,
        cameraPreset: 'airway',
        animationAction: [],
        cues: [
          { text: '一手固定氣管內管，另一手移除通條。', actions: [{ type: 'removeStylet', held: true }] },
          { text: '以空針將 cuff 充氣後移除空針。充氣量依產品與院內規範。', actions: [{ type: 'inflateCuff' }, { type: 'removeSyringe' }] },
        ],
        highlightedObjects: ['氣管內管', '10 mL 空針', '#stylet-held'],
        teachingPoints: ['教案第 10 項：移除通條＋cuff 充氣'],
        safetyNotes: ['移除通條時要扶住管子，避免移位'],
        source: 'case',
      }),
    ],
  },
  {
    id: 'ch5',
    title: '05 插管後確認',
    steps: [
      S({
        stepId: 'ch5-bag',
        practiceStepId: 'confirm',
        title: '接上 Ambu bag 並觀察胸廓',
        duration: 2500,
        cameraPreset: 'chest',
        animationAction: [],
        cues: [
          { text: '插管後優先接上 Ambu bag，壓袋通氣。', actions: [{ type: 'connectBag' }, { type: 'squeezeTube' }] },
          { text: '以視覺確認兩側胸廓有明顯且規律的起伏。', actions: [{ type: 'observeChest' }] },
        ],
        highlightedObjects: ['袋瓣罩（Ambu bag）', '胸廓'],
        teachingPoints: ['教案第 11 項：先接 Ambu bag、壓袋、看胸廓，再做其他處置'],
        safetyNotes: [],
        source: 'case',
      }),
      S({
        stepId: 'ch5-ausc',
        practiceStepId: 'confirm',
        title: '五點聽診',
        duration: 2500,
        cameraPreset: 'auscultation',
        animationAction: [],
        cues: [
          { text: '在壓袋通氣的同時，依序聽診五個位置。' },
          ...REQUIRED_AUSC.map((p) => ({ text: `${AUSC_LABEL[p]}。`, actions: [{ type: 'squeezeTube' }, { type: 'auscultate', point: p }] as AWAction[] })),
          { text: '胃部沒有氣過水聲，兩側呼吸音清楚且對稱。' },
        ],
        highlightedObjects: ['聽診器'],
        teachingPoints: ['教案第 12 項：胃部、雙側肺尖、雙側肺底共五點', '胃部有氣過水聲是食道插管的警訊'],
        safetyNotes: ['不得僅憑胸廓起伏、聽診或深度數字就認定位置完全正確'],
        source: 'case',
      }),
      S({
        stepId: 'ch5-capno',
        practiceStepId: 'confirm',
        title: '波形二氧化碳監測',
        duration: 3000,
        cameraPreset: 'panorama',
        animationAction: [],
        cues: [
          { text: '現行臨床安全補充：連接持續波形呼氣末二氧化碳監測。', actions: [{ type: 'attachCapno' }] },
          { text: '每次通氣都出現持續、規律的波形，是確認氣管內管位置的重要依據。這一項不在原教案的十四項評分中。' },
          { text: '綜合胸廓、聽診與波形，判斷位置正確。', actions: [{ type: 'confirmPlacement' }] },
        ],
        highlightedObjects: ['監視器（ETCO₂）'],
        teachingPoints: ['持續波形 ETCO₂ 是現行確認管路位置的重要工具', '此模組與教案評分分開呈現'],
        safetyNotes: ['沒有持續波形時，應懷疑管路不在氣管內'],
        source: 'supplement',
      }),
    ],
  },
  {
    id: 'ch6',
    title: '06 固定與結束',
    steps: [
      S({
        stepId: 'ch6-secure',
        practiceStepId: 'secure',
        title: '固定氣管內管',
        duration: 2500,
        cameraPreset: 'airway',
        animationAction: [],
        cues: [
          { text: '確認位置後，放置咬口器。', actions: [{ type: 'placeBite' }] },
          { text: '以固定帶固定氣管內管，固定後再確認一次嘴角刻度。', actions: [{ type: 'secureTube' }] },
        ],
        highlightedObjects: ['咬口器', '固定帶', '氣管內管'],
        teachingPoints: ['教案第 13 項：只有 0／2 分', '只有在確認位置之後才固定'],
        safetyNotes: ['不可固定位置未確認的管子'],
        source: 'case',
      }),
      S({
        stepId: 'ch6-summary',
        practiceStepId: 'secure',
        title: '重點摘要',
        duration: 3000,
        cameraPreset: 'panorama',
        animationAction: [],
        cues: [
          { text: '回顧整個流程：器材準備與檢查、插管前給氧、擺位、喉頭鏡、置管、移除通條與 cuff 充氣、插管後確認，最後固定。' },
          { text: '本示範為動畫原型，正式內容需經臨床教師審核。接下來，換你親自操作。' },
        ],
        highlightedObjects: [],
        teachingPoints: ['操作 → 錯誤辨識 → 示範複習 → 重新練習'],
        safetyNotes: [],
        source: 'case',
      }),
    ],
  },
];

/** 練習階段 → 示範章節 */
export const CHAPTER_OF: Record<StepId, number> = { prep: 0, bvm: 1, position: 2, laryngoscopy: 2, intubate: 3, tubeCare: 3, confirm: 4, secure: 5 };

export const DEMO_SUMMARY = [
  '備齊六項物品，選擇 ID 7.0／7.5，組裝喉頭鏡並檢查燈泡，用空針檢查 cuff 並潤滑管端',
  '面罩尖端朝頭側、避開眼睛，給氧並觀察胸廓起伏（教案 10–12 次/分）',
  'sniffing position；左手持喉頭鏡適當上提，不以牙齒為支點',
  '看見聲門才置管；確認嘴角刻度（教案約 20–22 cm）',
  '扶住管子移除通條，cuff 充氣',
  '優先接 Ambu bag 壓袋看胸廓，邊壓袋邊聽五點；（補充）持續波形 ETCO₂',
  '確認位置後放咬口器並固定，再確認刻度',
];
