import type { SkillCase } from '../../training/types';

/**
 * 傷口縫合 SkillCase
 * 依據《傷口縫合.pdf》：考生指引、評分表、考官指引、道具耗材及診間示意圖。
 * 情境內容逐字依教案，不新增教案未提供的檢查結果或診斷。
 */

export type StepId = 'prep' | 'gloves' | 'disinfect' | 'drape' | 'suture' | 'dressing' | 'disposal';

export const WOUND_SUTURING_CASE: SkillCase = {
  skillId: 'wound-suturing',
  title: '傷口縫合',
  englishTitle: 'Wound Suturing',
  scenario: {
    stationTitle: '單項技能操作｜傷口縫合',
    setting: '急診',
    stationMinutes: 8,
    patient: '蘇先生，20 歲，未婚學生',
    background:
      '某天晚上帶女朋友到山上看夜景，遇上一群小混混。小混混言語挑釁，雙方因而起了口角。混亂中對方有人取出利刃攻擊，蘇先生伸出手格擋，因此手被利刃劃傷。小混混見血一哄而散，蘇先生則自行抵達急診就醫。',
    tasks: [
      '傷口已清洗乾淨，並已完成局部麻醉。請執行消毒、鋪單、縫合、覆蓋傷口。',
      '請至少縫三針，縫完不必拆線。',
      '請假想病人在場，對模具作應有之解釋。',
    ],
    sourceNote: '情境、任務與評分規準取自《傷口縫合.pdf》考生指引、評分表與考官指引。本站無須重新執行清創或局部麻醉。',
  },
  steps: [
    {
      id: 'prep',
      order: 1,
      title: '器材準備',
      englishTitle: 'Preparation',
      goal: '打開無菌包布建立無菌區，並以不破壞無菌的方式將縫針縫線等無菌物品置入。',
      hints: [
        { label: '方向', text: '先建立無菌區，再把「無菌物品」放進去；非無菌物品放在無菌區外的清潔檯面。' },
        { label: '做法', text: '打開包布時先開離身體最遠的一角，最後開靠近自己的一角。置入無菌物品時，撕開外包裝讓內容物落入，手與外包裝都不越過或碰觸無菌區。消毒溶液可在戴手套前先倒在無菌區內的棉棒上。' },
        { label: '原因', text: '「準備妥當」是東西都到位；「維持無菌」是到位的過程沒有污染。兩者都要做到，教案第 2 項才算完全做到。' },
      ],
      why: [
        { title: '為什麼先開遠側那一角？', text: '若先開近側，之後開遠側時手臂必須越過已打開的無菌面，衣袖與手臂上的微生物可能掉落在無菌區。' },
        { title: '為什麼不能用手直接拿出縫線？', text: '戴無菌手套前雙手不是無菌的，碰到縫線或無菌區內面就會污染，縫線會直接接觸傷口組織。' },
      ],
      rubricItems: [2],
    },
    {
      id: 'gloves',
      order: 2,
      title: '穿戴無菌手套',
      englishTitle: 'Sterile Gloving',
      goal: '以閉合原則戴上兩隻無菌手套，全程只讓裸手碰觸手套的反折內面。',
      hints: [
        { label: '方向', text: '裸手只能碰手套「會貼著皮膚」的部位；戴好的手只能碰手套「外表面」。' },
        { label: '做法', text: '第一隻：裸手捏住反折袖口內面拉上。第二隻：已戴手套的四指伸入第二隻反折袖口下方撐開後套入。' },
        { label: '原因', text: '無菌對無菌、非無菌對非無菌。裸手 ↔ 手套內面；手套外面 ↔ 手套外面。' },
      ],
      why: [
        { title: '為什麼一般檢診手套不行？', text: '檢診手套為清潔等級而非滅菌，用於縫合會把非無菌表面帶進傷口與無菌區。' },
        { title: '戴好手套後要注意什麼？', text: '雙手保持在腰部以上、視線範圍內；碰到檯燈、病人衣物、消毒瓶等非無菌物就視為污染，需要更換。' },
      ],
      rubricItems: [3],
    },
    {
      id: 'disinfect',
      order: 3,
      title: '消毒',
      englishTitle: 'Skin Antisepsis',
      goal: '以滅菌棉棒沾消毒溶液，從傷口由內而外環狀消毒，範圍大於洞巾的洞。',
      hints: [
        { label: '方向', text: '從最乾淨的地方（傷口）開始，往較不乾淨的外圍移動。' },
        { label: '做法', text: '由傷口邊緣開始畫圈，一圈比一圈大，不要回到已消毒的中心；最外圈要超過洞巾開口的範圍。' },
        { label: '原因', text: '往回擦會把外圍的菌帶回傷口；範圍太小時，洞巾開口邊緣就會露出未消毒的皮膚。' },
      ],
      why: [
        { title: '為什麼要大於洞巾的洞？', text: '洞巾開口內的皮膚就是操作區，縫合時器械與縫線會接觸到開口邊緣，必須都已消毒。' },
      ],
      rubricItems: [4],
    },
    {
      id: 'drape',
      order: 4,
      title: '無菌鋪單',
      englishTitle: 'Draping',
      goal: '以無菌方式鋪上洞巾，讓開口對準傷口，過程不破壞無菌區。',
      hints: [
        { label: '方向', text: '鋪單前確認雙手仍是無菌狀態，洞巾一次放到位。' },
        { label: '做法', text: '持洞巾外緣，讓開口對準傷口後放下；若需調整只能往外移，不能從外往傷口方向拖。' },
        { label: '原因', text: '洞巾接觸皮膚後，邊緣已接觸未消毒區域；往內拖等於把外圍的菌帶進開口。' },
      ],
      why: [{ title: '洞巾的功能是什麼？', text: '把消毒過的操作區與周圍未消毒的皮膚、衣物隔開，擴大可安全放置器械的無菌面。' }],
      rubricItems: [5],
    },
    {
      id: 'suture',
      order: 5,
      title: '縫合',
      englishTitle: 'Suturing',
      goal: '以持針器夾針，垂直進針、垂直出針，每針打三個結，至少縫三針，針距約一公分。',
      hints: [
        { label: '方向', text: '先規劃好三針的位置：沿著傷口平均分布，每針相距約一公分，兩側離傷口的距離相同。' },
        { label: '做法', text: '進針時針尖與皮膚垂直，順著針的弧度旋轉手腕讓針從對側垂直穿出；打結時每個結的繞線方向與拉線方向要交替。' },
        { label: '原因', text: '垂直進出針讓兩側皮緣對合、輕微外翻，癒合疤痕較平整；交替方向形成方結，不易鬆脫。' },
      ],
      why: [
        { title: '為什麼要順著針的弧度？', text: '縫針是弧形的，直線推針會讓出針角度偏斜、撕扯組織，兩側咬合深度也會不一致。' },
        { title: '為什麼結要打在一側？', text: '結壓在傷口線上會刺激傷口、影響癒合與拆線；放在一側較乾淨也容易處理。' },
      ],
      rubricItems: [6, 7, 8],
    },
    {
      id: 'dressing',
      order: 6,
      title: '覆蓋傷口',
      englishTitle: 'Dressing',
      goal: '移除洞巾後，以滅菌紗布完整覆蓋傷口，再以紙膠帶黏妥。',
      hints: [
        { label: '方向', text: '先覆蓋、再固定。' },
        { label: '做法', text: '紗布要完整蓋住整條傷口與縫線；紙膠帶跨越紗布邊緣黏在皮膚上，至少兩條。' },
        { label: '原因', text: '覆蓋可吸收滲液並保護傷口；膠帶沒有跨到皮膚上，紗布容易滑動脫落。' },
      ],
      why: [{ title: '為什麼不用棉棒或洞巾覆蓋？', text: '棉棒是消毒工具；洞巾已接觸周圍皮膚並沾到血液，屬於用過的物品，不應留在傷口上。' }],
      rubricItems: [9],
    },
    {
      id: 'disposal',
      order: 7,
      title: '廢棄物處理',
      englishTitle: 'Waste Disposal',
      goal: '尖銳物丟入廢棄針筒收集盒，感染性廢棄物丟入紅色感染性垃圾桶。',
      hints: [
        { label: '方向', text: '先處理最危險的尖銳物，再處理沾到血液或體液的物品。' },
        { label: '做法', text: '縫針 → 收集盒；沾血或接觸傷口的棉棒、洞巾、手套 → 紅筒；未污染的外包裝 → 一般垃圾桶。' },
        { label: '原因', text: '針放錯桶可能刺傷清潔人員；感染性廢棄物放進一般垃圾會造成環境與職業暴露風險。' },
      ],
      why: [
        { title: '外包裝為什麼放一般垃圾？', text: '未接觸血液、體液的包裝紙屬一般廢棄物；放進紅筒雖無立即安全風險，但會增加醫療廢棄物處理量。此項不影響教案評分。' },
      ],
      rubricItems: [10],
    },
  ],
  limitations: [
    '本關卡以「簡化幾何模擬 ＋ 觀念提示 ＋ 操作紀錄」呈現，無法模擬真實器械手勢、施力、組織張力與皮緣外翻。',
    '進出針角度由選定角度與穿針軌跡推算，打結以手勢方向代表，非真實物理模擬。',
    '口述為選項式模擬，無法評估實際語氣與表達。',
    '數位評量僅為「模擬練習評量」，不等同現場 OSCE 實作成績；整體表現 1–5 分需由教師評估。',
  ],
};

export const STEP_IDS = WOUND_SUTURING_CASE.steps.map((s) => s.id as StepId);
export const getStep = (id: string) => WOUND_SUTURING_CASE.steps.find((s) => s.id === id)!;

/* ------------------------------------------------------------------ */
/* 器材（依道具、耗材清單）                                               */
/* ------------------------------------------------------------------ */

export type ItemId = 'mask' | 'sterileWrap' | 'needleSuture' | 'swabs' | 'gauze' | 'antiseptic' | 'sterileGloves' | 'examGloves' | 'tape';

/** supply：備物檯；field：無菌區；clean：操作台面清潔側（無菌區外） */
export type Zone = 'supply' | 'field' | 'clean';

export interface EquipmentDef {
  id: ItemId;
  name: string;
  english: string;
  sterile: boolean;
  purpose: string;
  /** 放置提示（僅引導模式顯示） */
  tip?: string;
  /** 準備時應放置的位置；mask 為穿戴，sterileWrap 為開包建立無菌區 */
  target: Zone | 'wear' | 'open';
  /** 是否為本站必要器材 */
  required: boolean;
}

export const EQUIPMENT: EquipmentDef[] = [
  { id: 'sterileWrap', name: '無菌包布（縫合包）', english: 'Sterile wrap / suture set', sterile: true, purpose: '打開後的內面即為無菌區。本模擬設定包內含持針器、鑷子、剪刀與洞巾（各院縫合包配置可能不同）。', target: 'open', required: true },
  { id: 'needleSuture', name: '縫針縫線', english: 'Needle & suture', sterile: true, purpose: '縫合傷口。', tip: '教案要求「拆好縫針外包裝置入無菌區」。', target: 'field', required: true },
  { id: 'swabs', name: '滅菌大棉棒', english: 'Sterile swab sticks', sterile: true, purpose: '沾取消毒溶液進行皮膚消毒。', target: 'field', required: true },
  { id: 'gauze', name: '滅菌 4×4 吋紗布', english: 'Sterile 4×4 gauze', sterile: true, purpose: '縫合後覆蓋傷口。', target: 'field', required: true },
  { id: 'antiseptic', name: '消毒溶液', english: 'Antiseptic solution', sterile: false, purpose: '皮膚消毒。', tip: '瓶身外部不是無菌的，應放在無菌區外。', target: 'clean', required: true },
  { id: 'sterileGloves', name: '無菌手套', english: 'Sterile gloves', sterile: true, purpose: '縫合全程穿戴。', tip: '外包裝不是無菌的，放在無菌區外，戴手套時再打開。', target: 'clean', required: true },
  { id: 'tape', name: '3M 紙膠', english: 'Paper tape', sterile: false, purpose: '固定紗布。', tip: '非無菌，放在無菌區外。', target: 'clean', required: true },
  { id: 'examGloves', name: '一般檢診手套', english: 'Exam gloves (non-sterile)', sterile: false, purpose: '清潔等級手套。', tip: '適合非無菌操作；不適合用於縫合。', target: 'supply', required: false },
  { id: 'mask', name: '口罩', english: 'Mask', sterile: false, purpose: '戴於口鼻。', tip: '無菌操作前戴上，降低飛沫污染操作區。', target: 'wear', required: false },
];

export const EQUIPMENT_MAP = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e])) as Record<ItemId, EquipmentDef>;

/** 縫合包內器械（包布打開後即在無菌區內） */
export const INSTRUMENTS = [
  { id: 'holder', name: '持針器', purpose: '夾持縫針進行縫合與器械打結。' },
  { id: 'forceps', name: '鑷子', purpose: '輕夾皮緣、協助出針，避免用手指直接操作組織。' },
  { id: 'scissors', name: '剪刀', purpose: '打結完成後剪線，保留適當線頭。' },
  { id: 'drape', name: '洞巾', purpose: '鋪於消毒後的傷口周圍，開口對準傷口。' },
] as const;

export type ToolId = 'holder' | 'forceps' | 'scissors';

/* ------------------------------------------------------------------ */
/* 非無菌物件（戴無菌手套後碰觸即污染）                                     */
/* ------------------------------------------------------------------ */

export type HotspotId = 'lamp' | 'sleeve' | 'antiseptic-bottle' | 'supply-table' | 'mask-adjust';

export const HOTSPOTS: Record<HotspotId, { label: string; prompt: string; why: string }> = {
  lamp: { label: '檯燈', prompt: '調整檯燈角度', why: '檯燈握把不是無菌的。需要調整光線時，應請助手協助或在戴手套前先調好。' },
  sleeve: { label: '病人衣袖', prompt: '拉一下病人的衣袖', why: '病人衣物不是無菌的。戴無菌手套後的手只能碰觸無菌區與消毒過的操作區。' },
  'antiseptic-bottle': { label: '消毒溶液瓶', prompt: '自己拿起消毒溶液瓶', why: '瓶身外部不是無菌的。應在戴手套前倒好消毒溶液，或請助手倒入。' },
  'supply-table': { label: '備物檯', prompt: '到備物檯拿東西', why: '備物檯不屬於無菌區。戴手套後需要額外物品，應請助手以無菌方式遞送。' },
  'mask-adjust': { label: '口罩', prompt: '調整口罩', why: '口罩不是無菌的。口罩應在洗手、戴手套前戴好。' },
};

/* ------------------------------------------------------------------ */
/* 向病人說明（選項式模擬口述）                                            */
/* ------------------------------------------------------------------ */

export type NarrationPhase = 'intro' | 'disinfect' | 'drape' | 'suture' | 'dressing';

/** good：適當；jargon：有口述但用語不適合病人；poor：未說明步驟或不恰當 */
export type NarrationQuality = 'good' | 'jargon' | 'poor';

export interface NarrationOption {
  id: string;
  text: string;
  quality: NarrationQuality;
  feedback: string;
}

export const NARRATION: { phase: NarrationPhase; title: string; scored: boolean; options: NarrationOption[] }[] = [
  {
    phase: 'intro',
    title: '告知接下來的操作',
    scored: false,
    options: [
      { id: 'intro-good', quality: 'good', text: '「蘇先生您好，我是今天幫您處理傷口的醫師。傷口已經清洗乾淨、也打過麻藥了，接下來我會幫您消毒、鋪上無菌布、縫合大約三針，最後包紮。過程中有任何不舒服請隨時告訴我。」', feedback: '自我介紹並說明整體流程，讓病人知道接下來會發生什麼。' },
      { id: 'intro-jargon', quality: 'jargon', text: '「等一下 prep 完 drape 好，就用 nylon 做 simple interrupted suture。」', feedback: '有說明流程，但英文術語病人聽不懂，建議改用日常用語。' },
      { id: 'intro-poor', quality: 'poor', text: '「好，手放著不要動，很快就好。」', feedback: '沒有說明要做什麼，病人無法預期接下來的處置。' },
    ],
  },
  {
    phase: 'disinfect',
    title: '消毒階段',
    scored: true,
    options: [
      { id: 'dis-good', quality: 'good', text: '「現在要幫您消毒傷口周圍，會有一點冰涼的感覺，請手保持不動。」', feedback: '說明動作與可能的感覺，並請病人配合。' },
      { id: 'dis-jargon', quality: 'jargon', text: '「現在用優碘做由內而外的 circular antisepsis。」', feedback: '有口述消毒，但用語過於專業。' },
      { id: 'dis-poor', quality: 'poor', text: '「不會痛啦，忍一下就好。」', feedback: '沒有說明正在進行的步驟，也不宜給予不確定的保證。' },
    ],
  },
  {
    phase: 'drape',
    title: '鋪單階段',
    scored: true,
    options: [
      { id: 'drape-good', quality: 'good', text: '「接下來會在您手上蓋一塊中間有洞的無菌布，保持傷口周圍乾淨，請不要用手去碰它。」', feedback: '說明目的並提醒病人避免碰觸無菌區。' },
      { id: 'drape-jargon', quality: 'jargon', text: '「現在鋪 fenestrated drape 維持 sterile field。」', feedback: '有口述鋪單，但用語過於專業。' },
      { id: 'drape-poor', quality: 'poor', text: '「（不說話，直接蓋上）」', feedback: '病人突然被蓋住手可能會緊張或伸手觸碰。' },
    ],
  },
  {
    phase: 'suture',
    title: '縫合階段',
    scored: true,
    options: [
      { id: 'sut-good', quality: 'good', text: '「現在開始縫合。因為已經打過麻藥，您可能會覺得有拉扯或壓迫感，但不應該會痛；如果會痛請馬上告訴我。」', feedback: '說明感受並建立回報管道，可及早發現麻醉不足。' },
      { id: 'sut-jargon', quality: 'jargon', text: '「現在用 needle holder 進針，打 instrument tie。」', feedback: '有口述縫合，但用語過於專業。' },
      { id: 'sut-poor', quality: 'poor', text: '「你不要看比較不會怕。」', feedback: '沒有說明步驟，也沒有確認病人的感受。' },
    ],
  },
  {
    phase: 'dressing',
    title: '包紮階段',
    scored: true,
    options: [
      { id: 'dre-good', quality: 'good', text: '「傷口縫好了，現在用紗布蓋住傷口，再用紙膠帶固定。」', feedback: '說明完成狀態與包紮方式。' },
      { id: 'dre-jargon', quality: 'jargon', text: '「現在做 dressing，4×4 gauze 加 tape。」', feedback: '有口述包紮，但用語過於專業。' },
      { id: 'dre-poor', quality: 'poor', text: '「好了，可以走了。」', feedback: '沒有說明包紮，病人也不知道傷口目前的狀態。' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 廢棄物                                                                */
/* ------------------------------------------------------------------ */

export type BinId = 'sharps' | 'infectious' | 'general';
export type WasteId = 'needle' | 'usedSwabs' | 'drapeUsed' | 'glovesUsed' | 'sutureWrapper' | 'gauzeWrapper';

export const BINS: Record<BinId, { name: string; note: string; color: string }> = {
  sharps: { name: '廢棄針筒收集盒', note: '尖銳物', color: '#f59e0b' },
  infectious: { name: '感染性垃圾桶（紅筒）', note: '沾血液 / 體液物品', color: '#dc2626' },
  general: { name: '一般性垃圾桶', note: '未污染物品', color: '#64748b' },
};

export const WASTE: Record<WasteId, { name: string; correct: BinId; category: 'sharps' | 'infectious' | 'general'; wrongWhy: Partial<Record<BinId, string>> }> = {
  needle: {
    name: '縫針（連殘線）',
    correct: 'sharps',
    category: 'sharps',
    wrongWhy: {
      infectious: '縫針可能刺穿垃圾袋，造成清潔與廢棄物處理人員針扎，屬職業安全風險。',
      general: '縫針可能刺穿垃圾袋造成針扎，且屬沾血尖銳物，不能進入一般垃圾。',
    },
  },
  usedSwabs: {
    name: '用過的消毒棉棒',
    correct: 'infectious',
    category: 'infectious',
    wrongWhy: { general: '已接觸傷口周圍皮膚與滲血，應視為感染性廢棄物。', sharps: '收集盒應專用於尖銳物，避免收集盒過快裝滿。' },
  },
  drapeUsed: {
    name: '沾血的洞巾',
    correct: 'infectious',
    category: 'infectious',
    wrongWhy: { general: '沾有血液的物品放進一般垃圾，可能造成環境污染與人員暴露。', sharps: '收集盒應專用於尖銳物。' },
  },
  glovesUsed: {
    name: '用過的無菌手套',
    correct: 'infectious',
    category: 'infectious',
    wrongWhy: { general: '縫合後的手套接觸過血液，應丟入感染性垃圾桶。', sharps: '收集盒應專用於尖銳物。' },
  },
  sutureWrapper: {
    name: '縫線外包裝紙',
    correct: 'general',
    category: 'general',
    wrongWhy: { infectious: '未污染的包裝紙可丟一般垃圾，放紅筒會增加醫療廢棄物量（不影響本站評分）。', sharps: '包裝紙不是尖銳物。' },
  },
  gauzeWrapper: {
    name: '紗布外包裝紙',
    correct: 'general',
    category: 'general',
    wrongWhy: { infectious: '未污染的包裝紙可丟一般垃圾，放紅筒會增加醫療廢棄物量（不影響本站評分）。', sharps: '包裝紙不是尖銳物。' },
  },
};

/* ------------------------------------------------------------------ */
/* 模型尺寸（數位模型參數，非病人檢查結果）                                  */
/* ------------------------------------------------------------------ */

export const MODEL = {
  /** 模型傷口長度（cm），傷口沿 x 軸，中心為原點 */
  woundLength: 4,
  /** 洞巾開口半徑（cm） */
  drapeHoleRadius: 3,
  /** 4×4 吋紗布邊長（cm） */
  gauzeSize: 10,
  /** 「約一公分」判定範圍（cm） */
  spacingRange: [0.8, 1.2] as [number, number],
  /** 「垂直」判定容許誤差（度） */
  perpendicularTolerance: 10,
};
