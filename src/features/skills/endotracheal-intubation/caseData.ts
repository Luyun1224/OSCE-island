import type { SkillCase } from '../../training/types';

/**
 * AIRWAY QUEST｜氣管內管插管：教學資料（與評分邏輯分開）
 * 情境、任務、道具耗材取自《氣管插管(1).pdf》。
 * 標記 source: 'supplement' 的內容為「現行臨床安全補充」，不屬於原教案，也不計入 14 項評分。
 * 教案未提供血液氣體分析數值，本關卡不顯示任何檢驗數據。
 */
export type StepId = 'prep' | 'bvm' | 'position' | 'laryngoscopy' | 'intubate' | 'tubeCare' | 'confirm' | 'secure';

export const AIRWAY_CASE: SkillCase = {
  skillId: 'endotracheal-intubation',
  title: '氣管內管插管',
  englishTitle: 'Endotracheal Intubation',
  scenario: {
    stationTitle: 'AIRWAY QUEST｜單項技能操作',
    setting: '急診',
    stationMinutes: 8,
    patient: '60 歲陳先生｜緊急氣管內管插管',
    background: '60 歲陳先生，身高體重約 165 公分 70 公斤，因呼吸喘被送至急診室，血中氣體分析（blood gas）報告符合插管條件。',
    tasks: ['請進行氣管內管插管之緊急處置', '請在進行中同步說明步驟', '假設您已穿妥隔離衣、護目鏡'],
    sourceNote: '情境、任務、道具與 14 項評分規準取自《氣管插管(1).pdf》。教案未提供血液氣體分析的實際數值，本模擬不編造檢驗結果。',
  },
  limitations: [
    '本模擬以教學示意模型呈現，不是真實解剖影像；拖曳距離、點選位置與碰撞結果都不代表真實插管技巧或臨床操作能力。',
    '喉頭鏡視野、胸廓起伏、聽診與二氧化碳波形皆由「案例規則」依你的操作決定，不是隨機或真實的生理監測。',
    '喉頭鏡持握、上提力道、頭部擺位手法等需在實體插管模型上由臨床教師評核。',
    '教案中的數值（通氣速度 10–12 次/分、內徑 7.0 或 7.5、嘴角刻度約 20–22 cm）為本教案評分參數，不代表所有臨床情境通用；實際處置依現行指引與臨床教師指導。',
    '僅憑胸廓起伏、聽診或插管深度數字，無法完全確認氣管內管位置；現行臨床建議以持續波形呼氣末二氧化碳監測輔助確認（本關卡另列為「現行臨床安全補充」）。',
    '本系統是醫學生模擬學習工具，不能取代臨床教師指導、實體模型訓練、臨床操作資格認定或真實病人處置判斷。',
  ],
  steps: [
    {
      id: 'prep',
      order: 1,
      title: '器材準備與檢查',
      englishTitle: 'Equipment Preparation',
      goal: '備齊喉頭鏡、氣管內管、通條、10 mL 空針、咬口器與固定帶；組裝喉頭鏡並檢查燈泡；選擇適當的氣管內管，用空針確認 cuff 完整並於管端塗抹潤滑液。',
      hints: [
        { label: '方向', text: '先把教案列出的六項物品放到器材盤，再逐一檢查。' },
        { label: '做法', text: '葉片接上握把並打開，確認燈泡會亮；氣管內管選內徑 7.0 或 7.5（本教案）；以 10 mL 空針打氣確認 cuff 完整後抽回；管端塗潤滑液；如使用通條，前端不要超出管尖。' },
        { label: '原因', text: '插管開始後沒有時間回頭找器材；燈泡不亮或 cuff 破損會讓插管失敗或無法有效通氣。' },
      ],
      why: [
        { title: '為什麼一定要檢查 cuff？', text: 'cuff 破損時無法密封呼吸道，通氣會漏氣、也較難保護呼吸道。插管前用空針打氣檢查，比插進去才發現容易處理。' },
        { title: '通條前端為什麼不能超出管尖？', text: '【現行臨床安全補充】超出管尖的通條可能損傷呼吸道組織。細節請依臨床教師指導。' },
      ],
      rubricItems: [1, 2, 3, 4],
    },
    {
      id: 'bvm',
      order: 2,
      title: '插管前通氣',
      englishTitle: 'Bag-Valve-Mask Ventilation',
      goal: '面罩尖端朝頭側、避免壓到眼睛，維持密合；以袋瓣罩給氧，觀察胸廓起伏並控制給氣速度。',
      hints: [
        { label: '方向', text: '先確認面罩方向，再確認位置與密合，最後才開始擠壓。' },
        { label: '做法', text: '面罩尖端放在鼻樑、朝向頭側，下緣蓋住口與下巴之間；單手或雙手固定皆可。擠壓後看胸廓是否起伏，本教案要求速度 10–12 次/分。' },
        { label: '原因', text: '面罩倒放或壓到眼睛會漏氣並造成傷害；給氣太快可能讓空氣進入胃部。' },
      ],
      why: [{ title: '10–12 次/分適用所有情況嗎？', text: '這是本教案的評分參數。實際給氣頻率依病人狀況與現行急救指引，由臨床教師確認。' }],
      rubricItems: [5, 6],
    },
    {
      id: 'position',
      order: 3,
      title: '頭部擺位',
      englishTitle: 'Sniffing Position',
      goal: '將頭部擺成教案指定的 sniffing position。',
      hints: [
        { label: '方向', text: 'sniffing position 是「頸部微向前、頭部適度後仰」的嗅物姿勢。' },
        { label: '做法', text: '本模擬以「布捲墊在枕部＋頭部適度後仰」示意；過度後仰或把布捲墊在肩下都不是本教案要求的擺位。' },
        { label: '原因', text: '適當擺位讓口、咽、喉的軸線較接近一直線，較容易看到聲門。實際擺位手法由臨床教師在模型上指導。' },
      ],
      why: [{ title: '為什麼不是越後仰越好？', text: '過度後仰不一定改善視野。本教案要求的是 sniffing position，細節依臨床教師示範。' }],
      rubricItems: [7],
    },
    {
      id: 'laryngoscopy',
      order: 4,
      title: '喉頭鏡操作',
      englishTitle: 'Laryngoscopy',
      goal: '以左手持喉頭鏡，以適當上提方式顯露聲門；不可以牙齒為支點撬動。',
      hints: [
        { label: '方向', text: '教案要求：左手持喉頭鏡，並以「適當上提」的方式插管。' },
        { label: '做法', text: '選擇左手持握，置入葉片後沿著握把方向向前上方提起（教學示意），不要往後撬。' },
        { label: '原因', text: '以上排牙齒當支點往後撬可能造成牙齒損傷，視野也不會比較好。實際手法以實體模型由臨床教師指導。' },
      ],
      why: [{ title: '這裡的喉頭鏡畫面是真的嗎？', text: '不是。這是教學示意圖，只呈現「適當上提後可看到聲門」的概念；真實技巧需在實體模型練習。' }],
      rubricItems: [8],
    },
    {
      id: 'intubate',
      order: 5,
      title: '置入氣管內管',
      englishTitle: 'Tube Insertion',
      goal: '在看得到聲門的情況下，將氣管內管通過聲門；並讀取嘴角刻度確認深度。',
      hints: [
        { label: '方向', text: '只有在看得到聲門時才放管；看不到就重新調整或停止並給氧。' },
        { label: '做法', text: '把管尖拖到聲門之間；放好後讀取嘴角刻度，本教案為約 20–22 cm。' },
        { label: '原因', text: '盲目放管容易進入食道。深度太深可能進入單側支氣管，太淺 cuff 可能位於聲門附近。' },
      ],
      why: [{ title: '刻度 20–22 cm 就代表位置正確嗎？', text: '不是。深度數字只是確認項目之一，必須搭配胸廓、聽診，現行臨床並建議以波形二氧化碳監測確認。' }],
      rubricItems: [8, 9, 14],
    },
    {
      id: 'tubeCare',
      order: 6,
      title: '通條與 cuff',
      englishTitle: 'Stylet & Cuff',
      goal: '如有使用通條，插管後將通條移除；以空針將 cuff 充氣。',
      hints: [
        { label: '方向', text: '管子放好後，先固定住管子再處理通條與 cuff。' },
        { label: '做法', text: '一手扶住管子、另一手移除通條；以 10 mL 空針將 cuff 充氣，之後移除空針。' },
        { label: '原因', text: '沒扶住管子就拔通條可能讓管子移位；cuff 未充氣會漏氣。充氣量依產品與院內規範（教案未指定）。' },
      ],
      why: [{ title: 'cuff 要打多少？', text: '教案只要求「將 cuff 充氣」，沒有指定量。實際充氣與壓力確認方式依產品與院內規範，由臨床教師確認。' }],
      rubricItems: [10],
    },
    {
      id: 'confirm',
      order: 7,
      title: '插管後確認',
      englishTitle: 'Placement Verification',
      goal: '插管後優先接上 Ambu bag 壓袋並觀察兩側胸廓起伏；於壓袋通氣同時聽診胃部、雙側肺尖及雙側肺底共五點。',
      hints: [
        { label: '方向', text: '順序：接 Ambu bag → 壓袋 → 看胸廓 → 邊壓袋邊聽五點。' },
        { label: '做法', text: '五點：胃部（上腹）、右肺尖、左肺尖、右肺底、左肺底。發現異常要判斷：食道插管就拔管重新給氧，太深就調整深度。' },
        { label: '原因', text: '單一方法都可能誤判；多種確認方式合併判斷，才能及早發現食道插管或單側插管。' },
      ],
      why: [
        { title: '只聽診就夠了嗎？', text: '不夠。胸廓起伏與聽診都可能誤判；【現行臨床安全補充】建議以持續波形呼氣末二氧化碳監測輔助確認位置。' },
        { title: '胃部聽到氣過水聲代表什麼？', text: '在本案例規則中，表示管子可能在食道，應立即處理，不可直接固定。' },
      ],
      rubricItems: [11, 12, 14],
    },
    {
      id: 'secure',
      order: 8,
      title: '固定與結束',
      englishTitle: 'Securing the Tube',
      goal: '確認位置後放置咬口器，以膠（布）帶固定氣管內管，並再次確認刻度。',
      hints: [
        { label: '方向', text: '只有在確認位置之後才固定。' },
        { label: '做法', text: '放置咬口器（bite），以固定帶固定氣管內管，固定後再看一次嘴角刻度。' },
        { label: '原因', text: '固定不確實容易移位或滑脫；把食道插管固定起來會延誤處置。' },
      ],
      why: [{ title: '固定方式有標準嗎？', text: '教案要求「有用膠（布）帶固定氣管內管」。實際固定方式依院內規範。' }],
      rubricItems: [13],
    },
  ],
};

export const getStep = (id: StepId) => AIRWAY_CASE.steps.find((s) => s.id === id)!;
export const STEP_IDS = AIRWAY_CASE.steps.map((s) => s.id as StepId);

/* ------------------------------------------------------------------ */
/* 器材（依教案第 6 頁「道具、耗材」與評分項目 1）                             */
/* ------------------------------------------------------------------ */
export type ItemId = 'handle' | 'blade' | 'ett65' | 'ett70' | 'ett75' | 'ett80' | 'stylet' | 'syringe' | 'bite' | 'ties' | 'bvm' | 'oralAirway' | 'towel' | 'stethoscope' | 'drapeCloth' | 'lube' | 'gloves' | 'handRub';
export const TUBES: ItemId[] = ['ett65', 'ett70', 'ett75', 'ett80'];
export const TUBE_SIZE: Partial<Record<ItemId, number>> = { ett65: 6.5, ett70: 7.0, ett75: 7.5, ett80: 8.0 };

export interface Equipment {
  id: ItemId;
  name: string;
  english: string;
  source: string;
  purpose: string;
  tip?: string;
}

export const EQUIPMENT: Equipment[] = [
  { id: 'handle', name: '喉頭鏡握把', english: 'Laryngoscope Handle', source: '3. 喉頭鏡', purpose: '內含電池，與葉片組合後提供光源。', tip: '與葉片組合後打開，檢查燈泡會不會亮。' },
  { id: 'blade', name: '喉頭鏡葉片', english: 'Laryngoscope Blade', source: '3. 喉頭鏡', purpose: '扣上握把並打開即會亮燈，用來顯露聲門。' },
  { id: 'ett65', name: '氣管內管 ID 6.5', english: 'ETT ID 6.5', source: '15. ID 6.5、7.0、7.5、8.0 氣管內管各 1 支', purpose: '內徑 6.5 mm 的氣管內管。' },
  { id: 'ett70', name: '氣管內管 ID 7.0', english: 'ETT ID 7.0', source: '15. ID 6.5、7.0、7.5、8.0 氣管內管各 1 支', purpose: '內徑 7.0 mm 的氣管內管。' },
  { id: 'ett75', name: '氣管內管 ID 7.5', english: 'ETT ID 7.5', source: '15. ID 6.5、7.0、7.5、8.0 氣管內管各 1 支', purpose: '內徑 7.5 mm 的氣管內管。' },
  { id: 'ett80', name: '氣管內管 ID 8.0', english: 'ETT ID 8.0', source: '15. ID 6.5、7.0、7.5、8.0 氣管內管各 1 支', purpose: '內徑 8.0 mm 的氣管內管。' },
  { id: 'stylet', name: '通條（stylet）', english: 'Stylet', source: '5. 通條', purpose: '置入氣管內管內協助塑形；插管後需移除。', tip: '前端不超出管尖（現行臨床安全補充，待教師確認）。' },
  { id: 'syringe', name: '10 mL 空針', english: '10 mL Syringe', source: '4. 10 ml 空針筒', purpose: '檢查 cuff 是否完整，插管後為 cuff 充氣。' },
  { id: 'bite', name: '咬口器（bite）', english: 'Bite Block', source: '12. 固定繩 2 條、bite', purpose: '避免病人咬扁氣管內管。' },
  { id: 'ties', name: '固定繩／固定膠帶', english: 'Tube Ties / Tape', source: '12. 固定繩 2 條；評分項目 1、13：固定膠帶', purpose: '固定氣管內管。' },
  { id: 'bvm', name: '袋瓣罩（Ambu bag）', english: 'Bag-Valve-Mask', source: '2. 袋瓣罩（bag-valve-mask）1 具', purpose: '插管前以面罩給氧通氣；插管後接上氣管內管通氣。' },
  { id: 'oralAirway', name: '口咽呼吸道（oral airway）', english: 'Oropharyngeal Airway', source: '9. oral airway', purpose: '考場備品，依臨床判斷使用（不在 14 項評分中）。' },
  { id: 'towel', name: '布捲', english: 'Towel Roll', source: '6. 布捲', purpose: '協助頭部擺位。' },
  { id: 'stethoscope', name: '聽診器', english: 'Stethoscope', source: '10. 聽診器', purpose: '插管後聽診確認位置。' },
  { id: 'drapeCloth', name: '綠色布巾', english: 'Green Drape', source: '11. 綠色布巾', purpose: '考場備品（擺放器材用）。' },
  { id: 'lube', name: '氣管插管潤滑液', english: 'Lubricant', source: '13. 氣管插管潤滑液', purpose: '塗抹於氣管內管管端。' },
  { id: 'gloves', name: '檢診手套（S/M/L）', english: 'Exam Gloves', source: '14. 檢診手套（S、M、L）', purpose: '操作時配戴。' },
  { id: 'handRub', name: '乾性洗手液', english: 'Hand Rub', source: '8. 乾性洗手液', purpose: '操作前後手部衛生。' },
];
export const EQUIPMENT_MAP = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e])) as Record<ItemId, Equipment>;

/** 評分項目 1 要求的六項物品 */
export const REQUIRED_KIT: { label: string; ok: (tray: ItemId[]) => boolean }[] = [
  { label: '喉頭鏡', ok: (t) => t.includes('handle') && t.includes('blade') },
  { label: '氣管內管', ok: (t) => TUBES.some((x) => t.includes(x)) },
  { label: 'stylet', ok: (t) => t.includes('stylet') },
  { label: '10cc 空針', ok: (t) => t.includes('syringe') },
  { label: '咬口器', ok: (t) => t.includes('bite') },
  { label: '固定膠帶', ok: (t) => t.includes('ties') },
];

/* ------------------------------------------------------------------ */
/* 聽診位置（教案：胃部、雙側肺尖、雙側肺底共五點）                              */
/* ------------------------------------------------------------------ */
export type AuscPoint = 'epigastrium' | 'rightApex' | 'leftApex' | 'rightBase' | 'leftBase' | 'neck' | 'precordium' | 'rightUpperQuadrant';
export const REQUIRED_AUSC: AuscPoint[] = ['epigastrium', 'rightApex', 'leftApex', 'rightBase', 'leftBase'];
export const AUSC_LABEL: Record<AuscPoint, string> = {
  epigastrium: '胃部（上腹）',
  rightApex: '右肺尖',
  leftApex: '左肺尖',
  rightBase: '右肺底',
  leftBase: '左肺底',
  neck: '頸部',
  precordium: '心前區',
  rightUpperQuadrant: '右上腹',
};

/* ------------------------------------------------------------------ */
/* 同步口述（教案：請在進行中同步說明步驟）                                     */
/* ------------------------------------------------------------------ */
export const VERBAL_SECTIONS = [
  {
    id: 'prep',
    title: '準備器材',
    note: '口述你正在準備與檢查的器材。',
    options: [
      { id: 'v-prep', text: '我現在準備插管器材：喉頭鏡、氣管內管、通條、10 mL 空針、咬口器和固定帶，並檢查喉頭鏡燈泡與 cuff。', quality: 'good' as const, feedback: '完整說明器材與檢查項目。', reply: '（考官點頭記錄）' },
      { id: 'v-prep2', text: '我先準備一下東西。', quality: 'fair' as const, feedback: '太籠統，考官無法知道你檢查了什麼。', reply: '（考官：請說明你準備了哪些？）' },
    ],
  },
  {
    id: 'bvm',
    title: '給氧通氣',
    note: '說明面罩與通氣。',
    options: [
      { id: 'v-bvm', text: '插管前先以袋瓣罩面罩給氧，面罩尖端朝頭側、避開眼睛，觀察胸廓起伏並控制給氣速度。', quality: 'good' as const, feedback: '說明重點完整。', reply: '（考官記錄）' },
      { id: 'v-bvm2', text: '先壓一壓。', quality: 'fair' as const, feedback: '未說明目的與觀察重點。', reply: '（考官：壓的目的是？）' },
    ],
  },
  {
    id: 'intubate',
    title: '插管',
    note: '說明擺位、喉頭鏡與置管。',
    options: [
      { id: 'v-int', text: '將頭部擺成 sniffing position，左手持喉頭鏡上提顯露聲門，看見聲門後置入氣管內管，確認嘴角刻度。', quality: 'good' as const, feedback: '流程說明清楚。', reply: '（考官記錄）' },
      { id: 'v-int2', text: '現在插進去。', quality: 'fair' as const, feedback: '未說明如何確認看得到聲門。', reply: '（考官：你怎麼確認位置？）' },
    ],
  },
  {
    id: 'confirm',
    title: '確認位置',
    note: '說明確認步驟。',
    options: [
      { id: 'v-con', text: '移除通條、cuff 充氣，接上 Ambu bag 壓袋，觀察兩側胸廓起伏，並聽診胃部、雙側肺尖與雙側肺底。', quality: 'good' as const, feedback: '確認步驟完整。', reply: '（考官記錄）' },
      { id: 'v-con2', text: '應該有進去了。', quality: 'poor' as const, feedback: '沒有說明任何確認方法。', reply: '（考官：依據是什麼？）' },
    ],
  },
  {
    id: 'secure',
    title: '固定',
    note: '說明固定。',
    options: [
      { id: 'v-sec', text: '確認位置後放置咬口器，以固定帶固定氣管內管，並再次確認嘴角刻度。', quality: 'good' as const, feedback: '說明完整。', reply: '（考官記錄）' },
    ],
  },
];
export const VERBAL_OPTION_IDS = VERBAL_SECTIONS.flatMap((s) => s.options.map((o) => o.id));
