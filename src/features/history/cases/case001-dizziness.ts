import type { CasePackage, ReviewMeta } from '../types';

/**
 * Case 001：50 歲陳小姐頭暈
 * 依據《50歲陳小姐頭暈.pdf》：考生指引、相關檢查報告、評分表、考官指引、SP 指引（劇本）。
 * 管理者已確認本案例內容可公開呈現（2026-10-31）。
 * SP 回答一律取自 SP 劇本；劇本未提供明確答案者以 null 標示「待教案作者補充」，不自行編造。
 */
const PENDING: ReviewMeta = { status: 'draft', note: '題目對應與評分規則待教師審核' };

export const CASE_001: CasePackage = {
  id: 'case-001',
  code: 'CASE 001',
  title: '50 歲陳小姐頭暈',
  version: '2026.10',
  license: { publicApproved: true, approvedBy: '管理者', note: '管理者確認本案例內容可公開呈現（2026-10-31）' },
  patient: {
    name: '陳小姐',
    fullName: '陳詩詩',
    age: 50,
    sex: 'F',
    hair: 'long',
    hairColor: '#3b2a20',
    shirt: '#a7c7e7',
    birthday: '65 年 12 月 1 日',
    occupation: '上班族',
    setting: '門診',
    posture: '坐姿、愁容',
    baselineMood: 'dizzy',
    emotionIntensity: 4,
    behavior: ['表情、眼神：焦慮、愁容', '肢體動作：可以手撐頭表示頭暈', '對話：焦慮、話多，對頭暈貧血表達焦慮'],
  },
  candidate: {
    background: '50 歲陳詩詩小姐因頭暈、呼吸喘，在檢驗所檢查發現貧血，轉介至您的門診。',
    tasks: ['請進行對貧血的鑑別診斷有助的聚焦式病史詢問，並回答提問。', '必須告知病患初步診斷、進一步檢查之解釋、與治療重點。請留意時間分配運用。', '進行身體檢查不會得分。'],
    minutes: 8,
    notes: ['身體檢查不列入本站得分，本模擬不包含身體檢查操作。'],
  },
  openingLine: '（病人坐著，以手撐頭，面帶愁容。）',
  topics: [
    { id: 'opening', label: '開場及確認身分', icon: '👋', hint: '自我介紹要包含姓名與稱謂／職級；請病人說出全名確認身分。' },
    { id: 'cc', label: '主訴', icon: '🗣️', hint: '先用開放式問題了解主訴，再確認症狀是急性或慢性發生。' },
    { id: 'hpi', label: '現病史', icon: '📋', hint: '了解症狀演變與對生活的影響，也別忘了整體健康變化（體重、食慾）。' },
    { id: 'obgyn', label: '月經與生產史', icon: '🌸', hint: '女性貧血要考慮經血流失：週期、每次天數、每天棉墊量；也要問懷孕與產檢時是否貧血。' },
    { id: 'bleeding', label: '排便與失血', icon: '🩸', hint: '腸胃道失血是缺鐵的重要原因：黑便、血便、排便習慣改變。' },
    { id: 'pmh', label: '過去病史', icon: '🗂️', hint: '確認過去是否有貧血或其他疾病。' },
    { id: 'surgery', label: '手術史', icon: '🔪', hint: '某些手術（例如胃切除）會影響鐵的吸收。' },
    { id: 'medication', label: '藥物史', icon: '💊', hint: '抗凝血劑、NSAID 或止痛藥可能造成出血；也要問中藥、草藥。' },
    { id: 'family', label: '家族史', icon: '👪', hint: '遺傳性貧血（如海洋性貧血）也是小球性貧血的鑑別診斷。' },
    { id: 'explain', label: '病情說明及處置', icon: '🩺', hint: '說明初步診斷、進一步檢查、治療與用藥衛教，並回應病人的提問。', explanation: true },
  ],
  questions: [
    // 開場及確認身分
    { id: 'o_intro_full', topic: 'opening', text: '「您好，我是實習醫學生王小明。」', answer: '醫師你好。', mood: 'anxious', covers: ['R1.name', 'R1.title'], record: '自我介紹：姓名＋職級', note: '完整自我介紹＝姓名＋稱謂或職級。' },
    { id: 'o_intro_name', topic: 'opening', text: '「您好，我是王小明。」', answer: '你好。', mood: 'anxious', covers: ['R1.name'], record: '自我介紹：只說姓名', note: '只說了姓名，少了稱謂或職級。' },
    { id: 'o_intro_title', topic: 'opening', text: '「您好，我是醫師。」', answer: '醫師你好。', mood: 'anxious', covers: ['R1.title'], record: '自我介紹：只說職稱', note: '只說了稱謂，少了姓名。' },
    { id: 'o_id_full', topic: 'opening', text: '「請問是陳詩詩女士嗎？」', answer: '是，我是陳詩詩。', mood: 'anxious', covers: ['R2.full'], record: '身分確認：全名「陳詩詩」', note: '完整稱呼全名，才能確實確認身分。' },
    { id: 'o_id_partial', topic: 'opening', text: '「請問是陳小姐嗎？」', answer: '是。', mood: 'anxious', covers: ['R2.partial'], record: '身分確認：只稱呼陳小姐', note: '只稱呼「陳小姐」未確認全名，同姓病人很多。' },
    { id: 'o_birthday', topic: 'opening', text: '「妳的生日是？」', answer: '65 年 12 月 1 日。', mood: 'anxious', record: '生日：65 年 12 月 1 日' },
    { id: 'o_idno', topic: 'opening', text: '「妳的身分證號碼是？」', answer: '（病人說出身分證號碼。教案設定由 SP 以本身身分證號碼回答。）', mood: 'anxious', record: '身分證號碼：已核對' },

    // 主訴
    { id: 'c_main', topic: 'cc', text: '「請問妳這次來最主要是哪裡不舒服？」', answer: '我最近這一個月來頭暈愈來愈嚴重，體力愈來愈差，爬樓梯也會比較喘。', mood: 'dizzy', record: '主訴：頭暈、體力變差、爬樓梯喘，約一個月', note: '開放式問題讓病人說出主訴與時間。' },
    { id: 'c_onset', topic: 'cc', text: '「頭暈跟呼吸喘的症狀是突然發生，還是漸進發生的？」', answer: '本來還好，最近這一個月愈來愈嚴重。', mood: 'dizzy', covers: ['R3.onset'], record: '發生方式：漸進性，近一個月加重（慢性）', note: '急性或慢性發生，會大幅改變貧血的鑑別方向（例如急性出血 vs. 慢性失血）。' },

    // 現病史
    { id: 'h_story', topic: 'hpi', text: '「可以再多說一些最近的情況嗎？」', answer: '我家住 3 樓，本來爬樓梯都不會覺得喘，最近這一個月爬一層樓就氣喘吁吁，上班時精神也愈來愈差。聽同事建議到檢驗所抽血，才發現有貧血。', mood: 'anxious', record: '活動耐受度下降：爬一層樓即喘；上班精神變差；檢驗所發現貧血' },
    { id: 'h_weight', topic: 'hpi', text: '「最近體重有沒有下降？」', answer: '沒有。', mood: 'anxious', covers: ['R7.weight'], record: '體重下降：無', note: '體重下降可能提示慢性疾病或惡性腫瘤。' },
    { id: 'h_appetite', topic: 'hpi', text: '「最近食慾有沒有變差？」', answer: '沒有。', mood: 'anxious', covers: ['R7.appetite'], record: '食慾變差：無' },

    // 月經與生產史
    { id: 'm_cycle', topic: 'obgyn', text: '「生理期大概多久來一次？」', answer: '大概 28 天來一次。', mood: 'neutral', covers: ['R5.cycle'], record: '月經週期：約 28 天', note: '問了週期，接著要問每次天數與經血量。' },
    { id: 'm_duration', topic: 'obgyn', text: '「那每次大概持續幾天？」', answer: '每次來都大約 7 天。', mood: 'neutral', unlockAfter: ['m_cycle'], covers: ['R5.duration'], record: '經期長度：約 7 天' },
    { id: 'm_pads', topic: 'obgyn', text: '「量多的時候，一天大概要換幾片衛生棉？」', answer: null, mood: 'neutral', unlockAfter: ['m_cycle'], covers: ['R5.pads'], record: '每日棉墊使用量', note: '每天換幾片可以估計經血流失量，是評分要項之一。' },
    { id: 'p_preg', topic: 'obgyn', text: '「請問有懷孕過嗎？」', answer: '有生過一胎。', mood: 'neutral', covers: ['R4.preg'], record: '生產史：生過一胎' },
    { id: 'p_anemia', topic: 'obgyn', text: '「懷孕產檢的時候，有沒有檢驗出貧血？」', answer: '之前產檢都說沒問題。', mood: 'neutral', unlockAfter: ['p_preg'], covers: ['R4.anemia'], record: '產檢時貧血：無（產檢無特殊異常）', note: '過去懷孕時是否貧血，可以幫助判斷貧血是新發生或長期存在。' },
    { id: 'p_child', topic: 'obgyn', text: '「小孩現在幾歲？」', answer: '小孩已經 3 歲了。', mood: 'neutral', unlockAfter: ['p_preg'], record: '小孩年齡：3 歲' },

    // 排便與失血
    { id: 'b_stool', topic: 'bleeding', text: '「有沒有解黑便或血便？」', answer: '沒有。', mood: 'anxious', covers: ['R6.black'], record: '黑便／血便：無', note: '黑便或血便提示腸胃道出血。' },
    { id: 'b_habit', topic: 'bleeding', text: '「解便習慣有沒有改變？」', answer: '沒有，解便習慣都正常。', mood: 'anxious', covers: ['R6.habit'], record: '排便習慣改變：無' },

    // 過去病史與基本資料
    { id: 'x_anemia', topic: 'pmh', text: '「以前有沒有貧血的病史？」', answer: '沒有。', mood: 'anxious', covers: ['R8.anemia'], record: '過去貧血病史：無' },
    { id: 'x_general', topic: 'pmh', text: '「以前有沒有其他疾病？」', answer: '沒有，沒有什麼特殊病史。', mood: 'anxious', record: '其他過去病史：無特殊病史' },
    { id: 'x_job', topic: 'pmh', text: '「請問妳目前從事的工作性質是？」', answer: '一般上班族。', mood: 'neutral', record: '職業：一般上班族' },

    // 手術史
    { id: 's_any', topic: 'surgery', text: '「以前有沒有開過刀？」', answer: '沒有開過刀。', mood: 'neutral', record: '手術史：無', note: '一般手術史有問到，評分要項特別看是否詢問與貧血相關的胃切除手術。' },
    { id: 's_gastric', topic: 'surgery', text: '「有沒有做過胃切除手術？」', answer: '沒有。', mood: 'neutral', covers: ['R10.gastric'], record: '胃切除手術：無', note: '胃切除會影響鐵的吸收，是缺鐵性貧血的原因之一。' },

    // 藥物史
    { id: 'd_any', topic: 'medication', text: '「目前有沒有在服用任何藥物？」', answer: '沒有。', mood: 'neutral', covers: ['R11.any'], record: '目前用藥：無' },
    { id: 'd_otc', topic: 'medication', text: '「有沒有吃中藥、草藥或止痛藥？」', answer: '沒有。', mood: 'neutral', covers: ['R11.specific'], record: '中藥、草藥、止痛藥：無', note: '止痛藥（NSAID）可能造成腸胃道出血。' },
    { id: 'd_anticoag', topic: 'medication', text: '「有沒有在使用抗凝血劑之類的藥物？」', answer: null, mood: 'neutral', covers: ['R11.specific'], record: '抗凝血劑', note: '抗凝血劑會增加出血風險。' },

    // 家族史
    { id: 'f_anemia', topic: 'family', text: '「家人有沒有人有貧血？」', answer: '沒有。', mood: 'neutral', covers: ['R9.partial'], record: '家族貧血：無' },
    { id: 'f_thal', topic: 'family', text: '「家族中有沒有人有海洋性貧血之類的遺傳性貧血？」', answer: '沒有。', mood: 'neutral', covers: ['R9.full'], record: '家族遺傳性貧血（海洋性貧血）：無', note: '海洋性貧血也是小球性貧血，需要與缺鐵性貧血鑑別。' },
  ],
  statements: [
    { id: 'e_dx_ida', topic: 'explain', group: '初步診斷', text: '「根據抽血結果，您目前是缺鐵性貧血。」', covers: ['R12.ida'], feedback: '小球性貧血合併鐵蛋白、血清鐵偏低與總鐵結合能力上升，符合缺鐵性貧血。', source: 'case', mood: 'worried' },
    { id: 'e_dx_anemia', topic: 'explain', group: '初步診斷', text: '「您是貧血。」', incorrect: true, feedback: '只說「貧血」不夠具體，評分說明中只提貧血視為沒有做到。', source: 'case', mood: 'confused' },
    { id: 'e_dx_thal', topic: 'explain', group: '初步診斷', text: '「可能是海洋性貧血。」', incorrect: true, feedback: '海洋性貧血需要鑑別，但本案鐵蛋白與血清鐵明顯偏低，較符合缺鐵。', source: 'case', mood: 'confused' },
    { id: 'e_dx_macro', topic: 'explain', group: '初步診斷', text: '「可能是維生素 B12 缺乏造成的大球性貧血。」', incorrect: true, feedback: 'MCV 偏低屬於小球性貧血，不是大球性貧血。', source: 'case', mood: 'confused' },
    { id: 'e_workup', topic: 'explain', group: '進一步檢查', text: '「接下來會再安排抽血，檢查血球、網狀紅血球、鐵蛋白、血清鐵和總鐵結合能力，也會找出造成缺鐵的原因。」', feedback: '說明進一步檢查（CBC、reticulocyte、ferritin、iron、TIBC）並安排缺鐵原因的鑑別。', source: 'case', mood: 'neutral' },
    { id: 'e_iron', topic: 'explain', group: '治療', text: '「我會開立鐵劑幫您補充鐵質。」', covers: ['R13.iron'], feedback: '初步治療為開立鐵劑。', source: 'case', mood: 'neutral' },
    { id: 'e_diet', topic: 'explain', group: '治療', text: '「平常也可以多吃含鐵量較高的食物，例如紅肉、深綠色蔬菜。」', covers: ['R13.edu'], feedback: '飲食衛教。具體食物建議屬一般臨床衛教內容，需由臨床教師確認。', source: 'clinical', mood: 'neutral' },
    { id: 'e_empty', topic: 'explain', group: '鐵劑服用方式', text: '「鐵劑建議空腹服用。」', covers: ['R14.empty'], feedback: '原教案評分要求說明鐵劑須空腹使用。實際服用方式仍需依藥品與病人耐受性個別化建議。', source: 'case', mood: 'neutral' },
    { id: 'e_tea', topic: 'explain', group: '鐵劑服用方式', text: '「鐵劑不要和茶、咖啡一起吃；如果覺得味道不好，可以配果汁一起吃。」', covers: ['R13.edu'], feedback: '取自教案的病情說明例句。', source: 'case', mood: 'neutral' },
    { id: 'e_se_constip', topic: 'explain', group: '可能副作用', text: '「吃鐵劑可能會有便秘的情形。」', covers: ['R15.constip'], feedback: '便秘是鐵劑常見的副作用。', source: 'case', mood: 'neutral' },
    { id: 'e_se_gi', topic: 'explain', group: '可能副作用', text: '「有些人吃了會肚子痛或拉肚子。」', covers: ['R15.gi'], feedback: '腹痛、腹瀉等腸胃道不適。', source: 'case', mood: 'neutral' },
    { id: 'e_se_stool', topic: 'explain', group: '可能副作用', text: '「大便顏色可能會變黑，這是鐵劑造成的。」', covers: ['R15.stool'], feedback: '事先說明可以避免病人誤以為是出血。', source: 'case', mood: 'neutral' },
    { id: 'e_reassure', topic: 'explain', group: '回應病人', text: '「這個不難處理，不用太擔心。」', feedback: '取自教案的病情說明例句，可降低病人焦慮。', source: 'case', mood: 'relieved' },
    { id: 'e_empathy', topic: 'explain', group: '回應病人', text: '「我知道頭暈、喘讓您很擔心，我們會一起找出原因並好好治療。」', feedback: '同理回應病人的焦慮（屬整體表現，不在 15 項評分中）。', source: 'clinical', mood: 'calm' },
    { id: 'e_check', topic: 'explain', group: '回應病人', text: '「我剛剛說的這些，您有沒有什麼不清楚的地方？」', feedback: '確認病人理解並邀請提問。', source: 'clinical', mood: 'calm' },
  ],
  spPrompts: [
    { id: 'sp_dx', text: '醫生，那我目前的診斷是什麼？', afterQuestionCount: 9, answeredBy: ['e_dx_ida', 'e_dx_anemia', 'e_dx_thal', 'e_dx_macro'] },
    { id: 'sp_treat', text: '會好嗎？要怎麼治療？', afterStatements: ['e_dx_ida', 'e_dx_anemia', 'e_dx_thal', 'e_dx_macro'], answeredBy: ['e_iron', 'e_reassure', 'e_diet'] },
    { id: 'sp_how', text: '那鐵劑要怎麼吃？', afterStatements: ['e_iron'], answeredBy: ['e_empty', 'e_tea'] },
    { id: 'sp_side', text: '吃鐵劑會不會有什麼副作用？', afterStatements: ['e_iron'], answeredBy: ['e_se_constip', 'e_se_gi', 'e_se_stool'] },
  ],
  labs: {
    title: '陳詩詩女士　65 年 12 月 1 日',
    note: '相關檢查報告（黏貼固定於診間桌面上）',
    items: [
      { id: 'wbc', name: 'WBC', value: '9030', unit: '/μL', reference: '5000-10000', low: 5000, high: 10000, numeric: 9030, meaning: '白血球數，可反映感染、發炎或骨髓狀態。' },
      { id: 'hgb', name: 'HGB', value: '7.4', unit: 'g/dL', reference: '11-16', low: 11, high: 16, numeric: 7.4, meaning: '血紅素，用來判斷是否貧血以及貧血的程度。' },
      { id: 'plt', name: 'Platelet', value: '502', unit: 'x10^3/μL', reference: '150-378', low: 150, high: 378, numeric: 502, meaning: '血小板數目；過高或過低都需要評估原因。' },
      { id: 'mcv', name: 'MCV', value: '67.6', unit: 'fL', reference: '80-100', low: 80, high: 100, numeric: 67.6, meaning: '紅血球平均體積，可將貧血分為小球性、正球性與大球性，是貧血鑑別的第一步。' },
      { id: 'rdw', name: 'RDW', value: '22.8', unit: '%', reference: '11.5-14.5', low: 11.5, high: 14.5, numeric: 22.8, meaning: '紅血球大小分布寬度；數值高代表紅血球大小差異大。' },
      { id: 'ferritin', name: 'Ferritin', value: '2.20', unit: 'ng/mL', reference: '20-300', low: 20, high: 300, numeric: 2.2, meaning: '鐵蛋白，反映體內鐵的儲存量（發炎時可能偏高）。' },
      { id: 'fe', name: 'Fe', value: '20', unit: 'ug/dL', reference: '50-170', low: 50, high: 170, numeric: 20, meaning: '血清鐵，血液中的鐵含量。' },
      { id: 'tibc', name: 'TIBC', value: '463', unit: 'ug/dL', reference: '250-425', low: 250, high: 425, numeric: 463, meaning: '總鐵結合能力，間接反映血中運鐵蛋白的量。' },
    ],
  },
  subItems: [
    { id: 'R1.name', label: '說出自己的姓名' },
    { id: 'R1.title', label: '說出稱謂或職級' },
    { id: 'R2.full', label: '完整稱呼全名（陳詩詩女士）' },
    { id: 'R2.partial', label: '只稱呼陳女士／陳小姐' },
    { id: 'R3.onset', label: '症狀的急慢性' },
    { id: 'R4.preg', label: '懷孕史' },
    { id: 'R4.anemia', label: '產檢時是否貧血' },
    { id: 'R5.cycle', label: '月經週期' },
    { id: 'R5.duration', label: '經期長度（每次持續幾天）' },
    { id: 'R5.pads', label: '經血流失量（每天換幾塊棉墊）' },
    { id: 'R6.black', label: '解黑便或血便' },
    { id: 'R6.habit', label: '解便習慣改變' },
    { id: 'R7.weight', label: '體重下降' },
    { id: 'R7.appetite', label: '食慾變差' },
    { id: 'R8.anemia', label: '過去貧血病史' },
    { id: 'R9.full', label: '遺傳性貧血類型（如海洋性貧血）' },
    { id: 'R9.partial', label: '家族是否有貧血' },
    { id: 'R10.gastric', label: '胃切除手術史' },
    { id: 'R11.specific', label: '抗凝血藥、NSAID 或止痛藥' },
    { id: 'R11.any', label: '一般用藥' },
    { id: 'R12.ida', label: '正確的初步診斷（缺鐵性貧血）' },
    { id: 'R13.iron', label: '開立鐵劑' },
    { id: 'R13.edu', label: '相關衛教（飲食、服藥）' },
    { id: 'R14.empty', label: '鐵劑空腹使用' },
    { id: 'R15.constip', label: '便秘' },
    { id: 'R15.gi', label: '腹痛腹瀉' },
    { id: 'R15.stool', label: '大便顏色變黑' },
  ],
  rubric: [
    { id: 'R1', no: 1, title: '完整介紹自己', levels: [{ score: 2, text: '清楚說明自己姓名、稱謂或職級（實習醫師／實習醫學生 OOO）' }, { score: 1, text: '僅做到其中一項' }, { score: 0, text: '未進行自我介紹' }], rule: { type: 'count', subs: ['R1.name', 'R1.title'], full: 2, partial: 1 }, units: ['u1-opening'], review: PENDING },
    { id: 'R2', no: 2, title: '確實確認病人身份', levels: [{ score: 2, text: '完整稱呼（陳詩詩女士小姐）' }, { score: 1, text: '只稱呼陳女士／陳小姐、未確認全名' }, { score: 0, text: '未確認病人身份' }], rule: { type: 'tiers', full: ['R2.full'], partial: ['R2.partial'] }, units: ['u1-opening'], review: PENDING },
    { id: 'R3', no: 3, title: '確認頭暈及呼吸喘發生的急慢性', levels: [{ score: 2, text: '確認症狀為急性或慢性發生' }, { score: 0, text: '未確認症狀的急慢性或詢問方式明顯錯誤' }], rule: { type: 'tiers', full: ['R3.onset'] }, units: ['u3-opqrst', 'u2-open-questions'], review: PENDING },
    { id: 'R4', no: 4, title: '確認懷孕史及產檢時貧血存在情形', levels: [{ score: 2, text: '完整詢問' }, { score: 1, text: '部分詢問' }, { score: 0, text: '沒有詢問' }], rule: { type: 'count', subs: ['R4.preg', 'R4.anemia'], full: 2, partial: 1 }, units: ['u4-history'], mappingNote: '「完整詢問」對應懷孕史＋產檢時貧血兩個子要項。', review: PENDING },
    { id: 'R5', no: 5, title: '詢問生理期基本相關血液流失狀況', levels: [{ score: 2, text: '完整詢問生理期的週期、每次持續多久、每天約換幾塊棉墊' }, { score: 1, text: '上述三項要項只問到一項或者二項' }, { score: 0, text: '沒有詢問生理期情形' }], rule: { type: 'count', subs: ['R5.cycle', 'R5.duration', 'R5.pads'], full: 3, partial: 1 }, units: ['u4-history', 'u5-red-flags'], review: PENDING },
    { id: 'R6', no: 6, title: '確認排便變化（解黑便或血便、解便習慣改變）', levels: [{ score: 2, text: '完整確認二項排便變化：解黑便或血便、解便習慣改變' }, { score: 1, text: '上述二項要項僅問到其中一項' }, { score: 0, text: '沒有詢問排便變化' }], rule: { type: 'count', subs: ['R6.black', 'R6.habit'], full: 2, partial: 1 }, units: ['u4-history', 'u5-red-flags'], review: PENDING },
    { id: 'R7', no: 7, title: '確認整體健康情形變化（體重下降、食慾變差）', levels: [{ score: 2, text: '完整確認整體健康情形變化：體重下降、食慾變差' }, { score: 1, text: '上述二項要項只問到一項' }, { score: 0, text: '沒有詢問整體健康情形變化' }], rule: { type: 'count', subs: ['R7.weight', 'R7.appetite'], full: 2, partial: 1 }, units: ['u4-history', 'u5-red-flags'], review: PENDING },
    { id: 'R8', no: 8, title: '確認過去的貧血病史', levels: [{ score: 2, text: '正確詢問' }, { score: 0, text: '沒有詢問' }], rule: { type: 'tiers', full: ['R8.anemia'] }, units: ['u4-history'], review: PENDING },
    { id: 'R9', no: 9, title: '確認家族的貧血病史（如海洋性貧血）', levels: [{ score: 2, text: '完整詢問遺傳性貧血類型' }, { score: 1, text: '僅詢問有沒遺傳性貧血或只問貧血' }, { score: 0, text: '沒有詢問' }], rule: { type: 'tiers', full: ['R9.full'], partial: ['R9.partial'] }, units: ['u4-history'], review: PENDING },
    { id: 'R10', no: 10, title: '確認貧血相關手術史（胃切除手術）', levels: [{ score: 2, text: '完整詢問' }, { score: 0, text: '沒有詢問' }], rule: { type: 'tiers', full: ['R10.gastric'] }, units: ['u4-history'], mappingNote: '本模擬以「是否詢問胃切除手術」判定完整詢問；只問「有沒有開過刀」是否給分，待教師確認。', review: PENDING },
    { id: 'R11', no: 11, title: '確認目前藥物史（例如抗凝血劑、NSAID）', levels: [{ score: 2, text: '詢問病人用藥史有提及抗凝血藥、NSAID 或止痛藥任一項' }, { score: 1, text: '僅詢問過去有沒有用什麼藥' }, { score: 0, text: '沒有詢問或詢問的藥物皆非上述二項藥物' }], rule: { type: 'tiers', full: ['R11.specific'], partial: ['R11.any'] }, units: ['u4-history'], review: PENDING },
    { id: 'R12', no: 12, title: '給予正確的初步診斷', levels: [{ score: 2, text: '缺鐵性貧血' }, { score: 0, text: '未說出診斷或診斷為其他大球性貧血或只提貧血' }], rule: { type: 'tiers', full: ['R12.ida'] }, units: ['u6-ice-summary'], review: PENDING },
    { id: 'R13', no: 13, title: '給予正確的初步處置', levels: [{ score: 2, text: '完成（1）開立鐵劑及（2）給予相關衛教' }, { score: 1, text: '只做到 1 項' }, { score: 0, text: '沒有說出正確處置' }], rule: { type: 'count', subs: ['R13.iron', 'R13.edu'], full: 2, partial: 1 }, units: ['u6-ice-summary'], mappingNote: '「相關衛教」目前對應飲食衛教或服藥注意事項（不與茶、咖啡併服），待教師確認。', review: PENDING },
    { id: 'R14', no: 14, title: '正確說明鐵劑須空腹使用', levels: [{ score: 2, text: '空腹使用' }, { score: 0, text: '沒有說出空腹使用' }], rule: { type: 'tiers', full: ['R14.empty'] }, units: ['u6-ice-summary'], review: PENDING },
    { id: 'R15', no: 15, title: '正確說明鐵劑使用的可能副作用（1）便秘（2）腹痛腹瀉（3）大便顏色變黑', levels: [{ score: 2, text: '有說明上述 2 項（含）以上的可能副作用' }, { score: 1, text: '僅說明其中 1 項' }, { score: 0, text: '沒有說明鐵劑使用的可能副作用' }], rule: { type: 'count', subs: ['R15.constip', 'R15.gi', 'R15.stool'], full: 2, partial: 1 }, units: ['u6-ice-summary'], review: PENDING },
  ],
  globalRating: { labels: ['差', '待加強', '普通', '良好', '優秀'], separateFromTotal: true },
  teachingReference: [
    { title: '鑑別診斷', items: ['貧血的鑑別診斷', '缺鐵性貧血的原因鑑別'] },
    { title: '相關檢驗', items: ['安排抽血檢查：Check CBC、reticulocyte、ferritin、iron、TIBC'] },
    { title: '衛教', items: ['初步治療為開立鐵劑'] },
  ],
  pending: [
    '每天約換幾塊棉墊：評分表列為要項，但 SP 劇本未提供病人的具體回答。',
    '抗凝血劑：SP 劇本僅列「無服用中藥、草藥、止痛藥」，未明確說明抗凝血劑。',
    '身分證號碼：教案設定由 SP 以本身身分證號碼回答，虛擬病人不顯示號碼。',
    '鐵劑服用方式（空腹、與果汁併服）為原教案要求；正式衛教內容需由臨床教師依最新用藥指引與病人耐受性確認。',
  ],
  review: { status: 'draft', note: '題目對應與評分規則待教師審核' },
};

export const CASES = [CASE_001];
export const getCase = (id: string) => CASES.find((c) => c.id === id) ?? null;
