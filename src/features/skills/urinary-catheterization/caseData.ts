import type { SkillCase } from '../../training/types';

/**
 * CATHETER QUEST｜導尿管置入：教學資料（與評分邏輯分開）
 * 情境、任務、道具耗材取自《技術操作－導尿管置放.pdf》；
 * 階段提示與觀念說明為教學示範文字，正式教學前需由臨床教師依院內 SOP 審核。
 */
export type StepId =
  | 'greet'
  | 'hygieneBefore'
  | 'prep'
  | 'gloves'
  | 'disinfect'
  | 'drape'
  | 'lubricate'
  | 'insert'
  | 'balloon'
  | 'connect'
  | 'disposal'
  | 'hygieneAfter';

export const CATHETER_CASE: SkillCase = {
  skillId: 'urinary-catheterization',
  title: '導尿管置入',
  englishTitle: 'Urinary Catheterization',
  scenario: {
    stationTitle: 'CATHETER QUEST｜單項技能操作',
    setting: '急診',
    stationMinutes: 8,
    patient: '楊大偉先生，65 歲男性',
    background: '楊大偉，65 歲男性，尿滯留至急診，經評估後準備接受導尿管放置。',
    tasks: [
      '單項技能操作，評分內容包含置放導尿管前的準備、部位消毒、導尿管的置入與固定，以及廢棄物的處理。',
      '請將模具假想為真實病人，於導尿過程中，說明操作的步驟。',
    ],
    sourceNote: '情境、任務、道具與 14 項評分規準取自《技術操作－導尿管置放.pdf》。本關卡使用男性導尿模型；女性導尿不在本次範圍。',
  },
  limitations: [
    '網頁模擬無法呈現真實組織阻力或觸覺回饋；置入進度、阻力與見尿皆為「教學模擬事件」，不代表導尿管已到達正確解剖位置。',
    '手部衛生、消毒範圍與方向、固定位置等細節以示意呈現，實施細節須依院內感染管制規範與臨床教師指導。',
    '潤滑範圍（前二分之一，20–25 cm 左右）與水球容量（5–10 cc）為本教案的評分要求，不代表所有導尿管型號與病人皆適用；實際操作請依產品說明與院內 SOP。',
    '口述為選項式模擬，無法評估實際語氣與表情；整體表現（1–5 分）由教師評估。',
    '本模擬為醫學生學習工具，不是臨床操作授權或臨床決策系統。',
  ],
  steps: [
    {
      id: 'greet',
      order: 1,
      title: '說明與安撫',
      englishTitle: 'Introduce & Reassure',
      goal: '向楊先生說明來意、安撫情緒，並用聽得懂的話解釋接下來要做的導尿。',
      hints: [
        { label: '方向', text: '先讓病人知道你是誰、為什麼來，再說明要做什麼。' },
        { label: '做法', text: '說明來意 → 回應他的擔心 → 用日常用語解釋導尿的目的與過程，並注意隱私（拉上隔簾）。' },
        { label: '原因', text: '尿滯留的病人通常很不舒服又緊張；被告知、被尊重能降低焦慮，也比較能配合。' },
      ],
      why: [
        { title: '只有一種正確說法嗎？', text: '沒有。重點是涵蓋「來意、安撫、技術說明」三件事，語氣溫和、不催促。系統提供多種合適說法，選項只是練習情境。' },
      ],
      rubricItems: [1],
    },
    {
      id: 'hygieneBefore',
      order: 2,
      title: '操作前手部衛生',
      englishTitle: 'Hand Hygiene (Before)',
      goal: '接觸病人與無菌物品前，以乾洗手液完成手部衛生，搓揉到所有部位。',
      hints: [
        { label: '方向', text: '先取足量乾洗手液，再依序搓揉手的各個部位。' },
        { label: '做法', text: '掌心、手背、指縫、指背、拇指、指尖都要搓到，搓揉至乾。' },
        { label: '原因', text: '指尖、拇指與指縫最容易漏掉，也最常接觸病人與器材。' },
      ],
      why: [{ title: '為什麼一定要在導尿前？', text: '導尿是侵入性操作，手部是傳播病原最常見的途徑；接觸病人前執行手部衛生可降低導尿管相關感染風險。' }],
      rubricItems: [2],
    },
    {
      id: 'prep',
      order: 3,
      title: '器材準備',
      englishTitle: 'Equipment Preparation',
      goal: '打開導尿包建立無菌區，備妥導尿管、潤滑劑、消毒棉枝與消毒液；過程注意無菌操作。',
      hints: [
        { label: '方向', text: '先把導尿包放上工作台並打開，再把無菌物品放進去。' },
        { label: '做法', text: '導尿包由遠側往近側打開；導尿管撕開外包裝讓它落入無菌區；潤滑劑擠入、消毒液倒在棉枝上，瓶口與管口都不碰無菌區。' },
        { label: '原因', text: '非無菌的瓶子、手或手臂越過無菌區都會造成污染；先備齊物品，戴上無菌手套後就不必再碰非無菌物。' },
      ],
      why: [
        { title: '為什麼要先備物再戴手套？', text: '撕包裝、倒溶液都需要碰觸非無菌的外包裝與瓶身；戴上無菌手套後再做，手套就被污染了。' },
        { title: '消毒液由護理人員提供可以嗎？', text: '教案備註：若考場消毒液一般由護理人員協助提供則不予扣分，評分標準依考場報備。' },
      ],
      rubricItems: [3],
    },
    {
      id: 'gloves',
      order: 4,
      title: '無菌手套',
      englishTitle: 'Sterile Gloving',
      goal: '以閉合原則戴上無菌手套；戴上後雙手只接觸無菌區內的物品。',
      hints: [
        { label: '方向', text: '裸手只碰手套反折的內面；戴手套的手只碰另一隻手套的外表面。' },
        { label: '做法', text: '攤開內包裝紙 → 裸手捏反折內面戴第一隻 → 戴手套的四指伸入第二隻反折下方 → 整理反折不碰皮膚。' },
        { label: '原因', text: '手套外表面之後會接觸導尿管與尿道口，任何非無菌接觸都可能把細菌帶進膀胱。' },
      ],
      why: [{ title: '手套污染了怎麼辦？', text: '應立即脫下並更換新的無菌手套，不能用擦拭或消毒取代更換。' }],
      rubricItems: [4],
    },
    {
      id: 'disinfect',
      order: 5,
      title: '消毒',
      englishTitle: 'Disinfection',
      goal: '以沾消毒液的棉枝消毒尿道口與周圍，維持無菌技術；先消毒，再鋪洞巾。',
      hints: [
        { label: '方向', text: '從尿道口開始，向外擴大消毒範圍。' },
        { label: '做法', text: '每支棉枝只使用一次、一個方向，不回到已消毒的中心。' },
        { label: '原因', text: '由內往外可避免把周圍皮膚的菌帶回尿道口。消毒細部動作與藥劑依院內感染管制規範。' },
      ],
      why: [{ title: '為什麼先消毒後鋪洞巾？', text: '本教案評分第 7 項要求「先消毒後鋪洞巾」。洞巾鋪上後再伸手消毒，容易碰到洞巾邊緣或把未消毒區域帶進開口。' }],
      rubricItems: [5, 7],
    },
    {
      id: 'drape',
      order: 6,
      title: '鋪洞巾',
      englishTitle: 'Sterile Draping',
      goal: '戴無菌手套持洞巾，讓開口對準操作部位一次放下，不從外往內拖動。',
      hints: [
        { label: '方向', text: '確認已完成消毒、手套仍是無菌。' },
        { label: '做法', text: '把導尿包內的洞巾拖到模型上，讓開口對準尿道口。' },
        { label: '原因', text: '洞巾接觸皮膚後邊緣已不再無菌；往內拖等於把外圍的菌帶進開口。' },
      ],
      why: [{ title: '洞巾的功能？', text: '把消毒過的操作部位與周圍未消毒區域隔開，擴大可放置導尿管的無菌面。' }],
      rubricItems: [6, 7],
    },
    {
      id: 'lubricate',
      order: 7,
      title: '潤滑',
      englishTitle: 'Lubrication',
      goal: '在導尿管前段塗抹潤滑劑，達到本教案規準要求的範圍。',
      hints: [
        { label: '方向', text: '潤滑劑要先擠在導尿包內，再從導尿管尖端開始塗抹。' },
        { label: '做法', text: '從尖端沿著導尿管往後拖曳塗抹；本教案規準為「前半段（前二分之一，20–25 cm 左右）」。' },
        { label: '原因', text: '只塗尖端時，後段管身在尿道內摩擦較大，病人較不舒服。實際範圍依使用產品說明與院內 SOP。' },
      ],
      why: [{ title: '這個範圍適用所有導尿管嗎？', text: '不一定。20–25 cm 是本教案的評分要求；不同型號、病人與院內 SOP 可能不同，正式教學前由臨床教師確認。' }],
      rubricItems: [8],
    },
    {
      id: 'insert',
      order: 8,
      title: '置入導尿管',
      englishTitle: 'Catheter Insertion',
      goal: '將導尿管對準尿道口，緩慢、受控地置入至導尿管末端；遇到阻力應停止並尋求協助。',
      hints: [
        { label: '方向', text: '先把導尿管尖端移到尿道口，再沿軸線慢慢推進。' },
        { label: '做法', text: '小幅度、穩定地推進；見尿後依教案繼續置入至導尿管末端（分叉處）。' },
        { label: '原因', text: '快速或強行推進可能造成尿道損傷；有不明阻力時要停止，而不是用力推。' },
      ],
      why: [
        { title: '見尿了就可以打水球嗎？', text: '本教案要求先置入至導尿管末端再打水球，避免水球在尿道內撐開造成傷害。實際做法依院內 SOP 與臨床教師指導。' },
        { title: '遇到阻力怎麼辦？', text: '停止推進、不要強行置入，安撫病人並尋求臨床指導。網頁中的阻力是教學模擬事件，不代表真實組織阻力。' },
      ],
      rubricItems: [9],
    },
    {
      id: 'balloon',
      order: 9,
      title: '水球與定位',
      englishTitle: 'Balloon & Positioning',
      goal: '確認模擬定位條件後，以空針將蒸餾水打入水球管腔，再輕拉導尿管至定位。',
      hints: [
        { label: '方向', text: '先確認已見尿且置入至末端，才能打水球。' },
        { label: '做法', text: '選擇已抽好蒸餾水的 10 mL 空針，接到水球管腔（不是引流管腔），打入教案要求的量後，輕拉至卡住。' },
        { label: '原因', text: '水球在尿道內撐開會造成嚴重傷害；系統會阻擋未達模擬定位條件的打水動作。' },
      ],
      why: [{ title: '容量為什麼是 5–10 cc？', text: '這是本教案評分規準的要求；實際容量依導尿管產品標示與院內 SOP。' }],
      rubricItems: [10],
    },
    {
      id: 'connect',
      order: 10,
      title: '尿袋連接與固定',
      englishTitle: 'Drainage Bag & Securing',
      goal: '以無菌技術連接尿管與尿袋，再分別固定尿管與尿袋。',
      hints: [
        { label: '方向', text: '連接前接頭端不能碰到任何非無菌物。' },
        { label: '做法', text: '取下尿袋接頭保護蓋 → 接頭吸附到導尿管引流端 → 紙膠固定尿管 → 尿袋掛好。' },
        { label: '原因', text: '接頭是細菌進入封閉引流系統的入口；固定可避免牽扯尿道與管路脫出。' },
      ],
      why: [{ title: '尿袋為什麼要低於膀胱？', text: '利用重力引流、避免尿液逆流回膀胱。固定位置細節依院內 SOP。' }],
      rubricItems: [11, 12],
    },
    {
      id: 'disposal',
      order: 11,
      title: '廢棄物處理',
      englishTitle: 'Waste Disposal',
      goal: '脫除手套，把感染性廢棄物全數丟入感染性垃圾桶，並整理環境、照顧病人舒適。',
      hints: [
        { label: '方向', text: '先分辨哪些物品接觸過病人、體液或消毒液。' },
        { label: '做法', text: '用過的棉枝、洞巾、手套、集尿碗、空針 → 感染性垃圾桶；未污染的外包裝 → 一般垃圾桶。' },
        { label: '原因', text: '感染性廢棄物丟進一般垃圾，會造成環境污染與清潔人員職業暴露。分類細節依院內規範。' },
      ],
      why: [{ title: '外包裝放錯會扣分嗎？', text: '教案第 13 項只看感染性廢棄物是否丟入感染性垃圾桶；外包裝放進紅筒不扣分，但會增加醫療廢棄物量。' }],
      rubricItems: [13],
    },
    {
      id: 'hygieneAfter',
      order: 12,
      title: '操作後手部衛生',
      englishTitle: 'Hand Hygiene (After)',
      goal: '脫除手套後，再次完成手部衛生。',
      hints: [
        { label: '方向', text: '先脫手套，再做手部衛生。' },
        { label: '做法', text: '同操作前：取乾洗手液，搓揉所有部位至乾。' },
        { label: '原因', text: '手套可能有微小破損，脫手套時手也可能接觸污染面。' },
      ],
      why: [{ title: '戴了手套還要洗手？', text: '是的。手套不能取代手部衛生。' }],
      rubricItems: [14],
    },
  ],
};

export const getStep = (id: StepId) => CATHETER_CASE.steps.find((s) => s.id === id)!;
export const STEP_IDS = CATHETER_CASE.steps.map((s) => s.id as StepId);

/* ------------------------------------------------------------------ */
/* 道具與耗材（依教案第 7 頁「道具、耗材」）                                  */
/* ------------------------------------------------------------------ */
export type ItemId = 'kit' | 'catheter' | 'gloves' | 'examGloves' | 'mask' | 'iodine' | 'saline' | 'water' | 'syringe' | 'jelly' | 'gauze' | 'bag' | 'tape';

export interface Equipment {
  id: ItemId;
  name: string;
  english: string;
  /** 教案耗材表的編號與原文 */
  source: string;
  purpose: string;
  sterile: boolean;
  /** 器材準備是否需要 */
  required: boolean;
  tip?: string;
}

export const EQUIPMENT: Equipment[] = [
  { id: 'kit', name: '導尿包', english: 'Catheterization Kit', source: '6. 未打開之導尿包，內含：集尿碗一個、無菌洞巾、沖洗棉枝*6', purpose: '打開後內面即為無菌區，內含集尿碗、無菌洞巾與 6 支沖洗棉枝。', sterile: true, required: true, tip: '由離身體最遠的一角開始打開，最後才開近側。' },
  { id: 'catheter', name: '留置導尿管', english: 'Indwelling (Foley) Catheter', source: '7. 留置導尿管（依模型規格取合適操作之導尿管規格一種即可）', purpose: '依模型規格選用。尾端分叉為引流管腔與水球管腔。', sterile: true, required: true, tip: '撕開外包裝讓導尿管落入無菌區，手不越過無菌區。' },
  { id: 'gloves', name: '無菌手套', english: 'Sterile Gloves', source: '4. 各型號無菌手套', purpose: '無菌操作時穿戴。', sterile: true, required: true },
  { id: 'examGloves', name: '檢診手套', english: 'Exam Gloves (non-sterile)', source: '（診間常備物品，非本教案耗材）', purpose: '非無菌手套，用於一般接觸防護，不適用於無菌操作。', sterile: false, required: false, tip: '導尿是無菌操作，需要的是無菌手套。' },
  { id: 'mask', name: '外科手術口罩', english: 'Surgical Mask', source: '5. 外科手術口罩', purpose: '進行無菌操作時配戴。', sterile: false, required: false },
  { id: 'iodine', name: '優碘藥水', english: 'Povidone-iodine', source: '10. 優碘藥水一小罐（可用烏龍茶代替優碘）', purpose: '倒在導尿包內的沖洗棉枝上，用於消毒。', sterile: false, required: true, tip: '瓶口不碰觸無菌區，由上方倒入。' },
  { id: 'saline', name: '生理食鹽水', english: 'Normal Saline', source: '11. 生理食鹽水一小罐（可用自來水代替生理食鹽水）', purpose: '依院內 SOP 使用。', sterile: false, required: false },
  { id: 'water', name: '20 cc 蒸餾水', english: 'Distilled Water 20 mL amp', source: '12. 20 c.c. 蒸餾水一 amp', purpose: '備用蒸餾水。', sterile: false, required: false },
  { id: 'syringe', name: '10 mL 空針（已抽蒸餾水）', english: '10 mL Syringe (prefilled)', source: '13. 10 mL 空針一支，先抽好蒸餾水（打尿管水球用）', purpose: '打導尿管水球用。', sterile: false, required: true },
  { id: 'jelly', name: 'Jelly 潤滑劑', english: 'Lubricating Jelly', source: '14. Jelly（潤滑劑）', purpose: '擠入導尿包內，塗抹導尿管前段。', sterile: false, required: true, tip: '管口不碰觸無菌區。' },
  { id: 'gauze', name: '滅菌紗布包', english: 'Sterile Gauze (4×4 cm)', source: '9. 滅菌紗布包（4*4 cm*1）', purpose: '無菌紗布，依院內 SOP 使用。', sterile: true, required: false },
  { id: 'bag', name: '尿袋', english: 'Drainage Bag', source: '8. 尿袋（500 mL 或 2000 mL）', purpose: '連接導尿管引流端，形成封閉引流系統。', sterile: false, required: true, tip: '接頭有保護蓋，取下後接頭端不可碰觸任何物品。' },
  { id: 'tape', name: '3M 透氣紙膠', english: 'Paper Tape', source: '15. 3M 透氣紙膠一卷', purpose: '固定導尿管。', sterile: false, required: true },
];
export const EQUIPMENT_MAP = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e])) as Record<ItemId, Equipment>;

/** 診間中的固定設備（教案耗材 1、2、3、16、17） */
export const FIXTURES = [
  { id: 'maleModel', name: '男性導尿模具', source: '1. 男性導尿模具' },
  { id: 'manikin', name: '半身安妮', source: '2. 半身安妮（作為假想病患之上半身）' },
  { id: 'handRub', name: '乾洗手液', source: '3. 乾洗手液' },
  { id: 'bins', name: '感染性／一般垃圾桶', source: '16. 感染性垃圾桶、一般垃圾桶各一' },
  { id: 'cart', name: '換藥（工作）車', source: '17. 換藥（工作）車（桌面大小需可放置導尿前備物）' },
] as const;

/* ------------------------------------------------------------------ */
/* 診間中的非無菌物（戴無菌手套後碰觸會造成污染）                              */
/* ------------------------------------------------------------------ */
export type HotspotId = 'bedrail' | 'gown' | 'cart' | 'mask' | 'curtain';
export const HOTSPOTS: Record<HotspotId, { label: string; icon: string; why: string }> = {
  bedrail: { label: '扶一下床欄', icon: '🛏️', why: '床欄不是無菌的。' },
  gown: { label: '整理病人衣物', icon: '👕', why: '病人衣物與被單不是無菌的。' },
  cart: { label: '從工作車下層拿東西', icon: '🛒', why: '工作車與其上的外包裝不是無菌的。' },
  mask: { label: '調整口罩', icon: '😷', why: '口罩外側會接觸呼吸道飛沫，不是無菌的。' },
  curtain: { label: '拉一下隔簾', icon: '🪟', why: '隔簾不是無菌的。' },
};

/* ------------------------------------------------------------------ */
/* 病人溝通（選項式；沒有唯一正確說法）                                        */
/* ------------------------------------------------------------------ */
export type CommPhase = 'before' | 'disinfect' | 'insert' | 'after';
export type CommTag = 'purpose' | 'reassure' | 'explain' | 'privacy' | 'consent' | 'comfort';
export type CommTone = 'warm' | 'neutral' | 'impatient' | 'jargon';

export interface CommOption {
  id: string;
  text: string;
  tags: CommTag[];
  tone: CommTone;
  reply: string;
  /** 病人焦慮程度變化（負數＝較放心） */
  anxiety: number;
  feedback: string;
}

export interface CommGroup {
  phase: CommPhase;
  title: string;
  note: string;
  options: CommOption[];
}

export const COMM_TAG_LABEL: Record<CommTag, string> = { purpose: '說明來意', reassure: '安撫', explain: '解釋技術', privacy: '隱私', consent: '確認意願', comfort: '舒適' };

export const COMMUNICATION: CommGroup[] = [
  {
    phase: 'before',
    title: '操作前說明',
    note: '教案第 1 項：說明來意、安撫病人、解釋要做的技術，且對話溫和。',
    options: [
      { id: 'b-intro', text: '楊先生您好，我是今天負責照顧您的醫學生，醫師評估後要幫您放導尿管，把膀胱裡的尿引流出來。', tags: ['purpose'], tone: 'warm', reply: '喔……好，我真的脹得很難受。', anxiety: -1, feedback: '清楚說明身分與來意。' },
      { id: 'b-intro2', text: '楊先生，我來幫您處理解不出小便的問題，等一下會放一條管子幫您把尿引流出來。', tags: ['purpose', 'explain'], tone: 'warm', reply: '管子？要放在哪裡？', anxiety: 0, feedback: '有說明來意與目的，可以再補充過程與感受。' },
      { id: 'b-reassure', text: '我知道您現在肚子脹很不舒服，也可能有點緊張，等一下我每一步都會先跟您說，有不舒服隨時告訴我。', tags: ['reassure'], tone: 'warm', reply: '好，你先跟我說我比較放心。', anxiety: -2, feedback: '回應病人的不適與擔心，並給予掌控感。' },
      { id: 'b-explain', text: '我會先幫您消毒，再把一條塗了潤滑劑的軟管從尿道口慢慢放進膀胱，過程可能會有點脹或想解尿的感覺。', tags: ['explain'], tone: 'warm', reply: '會不會很痛？', anxiety: 0, feedback: '用病人聽得懂的話說明步驟與可能的感受。' },
      { id: 'b-privacy', text: '我先幫您把隔簾拉上，只露出需要操作的部位，其他地方會幫您蓋好。', tags: ['privacy'], tone: 'warm', reply: '謝謝，這樣比較不會不好意思。', anxiety: -1, feedback: '主動保護隱私。' },
      { id: 'b-consent', text: '這樣說明您清楚嗎？有沒有什麼想問的？可以的話我們就開始。', tags: ['consent'], tone: 'warm', reply: '應該可以，你就慢慢來。', anxiety: -1, feedback: '確認理解與意願。' },
      { id: 'b-jargon', text: '等一下要執行 Foley catheterization，做 aseptic technique，balloon 打 10 cc。', tags: ['explain'], tone: 'jargon', reply: '……你說什麼？我聽不懂。', anxiety: 1, feedback: '有說明但都是專業術語，病人聽不懂。' },
      { id: 'b-rush', text: '別問那麼多，醫師說要插就插，很快就好。', tags: ['purpose'], tone: 'impatient', reply: '……（皺眉不說話）', anxiety: 2, feedback: '語氣不耐煩，未回應病人感受。' },
    ],
  },
  {
    phase: 'disinfect',
    title: '消毒與準備',
    note: '假想病人在場，說明正在做什麼。',
    options: [
      { id: 'd-cold', text: '現在要幫您消毒，藥水會有點涼涼的，請您放輕鬆。', tags: ['explain', 'reassure'], tone: 'warm', reply: '嗯，有點冰，還可以。', anxiety: -1, feedback: '預告感受，降低驚嚇。' },
      { id: 'd-drape', text: '我在您身上鋪一條無菌的布，請您手不要碰到這塊布喔。', tags: ['explain'], tone: 'warm', reply: '好，我手放旁邊。', anxiety: 0, feedback: '說明並請病人配合維持無菌。' },
      { id: 'd-silent', text: '（不說話，直接開始消毒）', tags: [], tone: 'neutral', reply: '欸？你在做什麼？', anxiety: 1, feedback: '沒有預告，病人容易緊張。' },
    ],
  },
  {
    phase: 'insert',
    title: '置入導尿管',
    note: '置入時病人最緊張，持續說明與安撫。',
    options: [
      { id: 'i-breath', text: '現在要放管子了，請您慢慢深呼吸、放鬆，會有點脹脹想尿尿的感覺，是正常的。', tags: ['explain', 'reassure'], tone: 'warm', reply: '（深呼吸）好……有點脹。', anxiety: -2, feedback: '引導放鬆並預告感受。' },
      { id: 'i-tell', text: '如果覺得很痛或不舒服，請馬上告訴我，我會先停下來。', tags: ['reassure', 'comfort'], tone: 'warm', reply: '好，我會跟你說。', anxiety: -1, feedback: '給病人可以喊停的空間。' },
      { id: 'i-hold', text: '忍一下，不要動！', tags: [], tone: 'impatient', reply: '（身體僵硬）……很痛耶。', anxiety: 2, feedback: '命令式語氣，病人更緊張。' },
    ],
  },
  {
    phase: 'after',
    title: '操作完成',
    note: '說明完成後的注意事項，照顧舒適。',
    options: [
      { id: 'a-done', text: '管子已經放好了，尿袋掛在床邊，翻身時注意不要拉扯到管子，有不舒服請按鈴。', tags: ['explain', 'comfort'], tone: 'warm', reply: '舒服多了，謝謝你。', anxiety: -2, feedback: '說明完成與照護重點。' },
      { id: 'a-cover', text: '我幫您把衣服穿好、被子蓋好，隔簾等一下再幫您拉開。', tags: ['privacy', 'comfort'], tone: 'warm', reply: '謝謝，你很細心。', anxiety: -1, feedback: '照顧隱私與舒適。' },
      { id: 'a-leave', text: '好了。（直接離開）', tags: [], tone: 'neutral', reply: '……那我現在可以動嗎？', anxiety: 1, feedback: '沒有說明，病人不知道接下來怎麼辦。' },
    ],
  },
];

export const COMM_OPTION_MAP = Object.fromEntries(COMMUNICATION.flatMap((g) => g.options.map((o) => [o.id, { ...o, phase: g.phase }]))) as Record<string, CommOption & { phase: CommPhase }>;

/* ------------------------------------------------------------------ */
/* 廢棄物（分類依教案第 13 項；細節依院內規範）                                */
/* ------------------------------------------------------------------ */
export type WasteId = 'swabs' | 'drape' | 'tray' | 'gloves' | 'syringe' | 'catheterWrap' | 'gloveWrap';
export type BinId = 'infectious' | 'general';

export const WASTE: Record<WasteId, { name: string; correct: BinId; icon: ItemId | 'swab' | 'drape' | 'tray'; reason: string }> = {
  swabs: { name: '用過的棉枝', correct: 'infectious', icon: 'swab', reason: '接觸病人皮膚與消毒液。' },
  drape: { name: '用過的洞巾', correct: 'infectious', icon: 'drape', reason: '接觸病人身體。' },
  tray: { name: '集尿碗／導尿包內盤', correct: 'infectious', icon: 'tray', reason: '盛裝過潤滑劑、消毒液或尿液。' },
  gloves: { name: '用過的手套', correct: 'infectious', icon: 'gloves', reason: '接觸病人與體液。' },
  syringe: { name: '打水球用過的空針', correct: 'infectious', icon: 'syringe', reason: '用過的醫療器材。' },
  catheterWrap: { name: '導尿管外包裝', correct: 'general', icon: 'catheter', reason: '未接觸病人或體液的包裝。' },
  gloveWrap: { name: '手套外包裝紙', correct: 'general', icon: 'gloves', reason: '未接觸病人或體液的包裝。' },
};

export const BINS: Record<BinId, { name: string; note: string }> = {
  infectious: { name: '感染性垃圾桶', note: '紅色・接觸病人或體液的物品' },
  general: { name: '一般垃圾桶', note: '未污染的包裝' },
};

/** 操作結束時的整理事項（形成性，不在 14 項評分中） */
export const WRAP_UP = [
  { id: 'cover', text: '協助病人穿好衣物、蓋好被單' },
  { id: 'curtain', text: '告知病人已完成，拉開隔簾' },
  { id: 'tidy', text: '整理工作車與操作環境' },
] as const;
export type WrapUpId = (typeof WRAP_UP)[number]['id'];

export const PATIENT_LOOK = { name: '楊大偉', age: 65, sex: 'M' as const, hair: 'short' as const, hairColor: '#a1a1aa', shirt: '#bfdbfe' };
