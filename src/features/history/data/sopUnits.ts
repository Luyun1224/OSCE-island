import type { PatientLook, ReviewMeta, SopUnit } from '../types';

/**
 * 問診 SOP 學院：六個教學單元
 * 架構：Calgary–Cambridge Guide ＋ OPQRST 症狀分析 ＋ ICE 病人觀點。
 * 所有情境與人物皆為「教學示範」虛構情境，非正式考題；內容需經教師審核。
 */
const DRAFT: ReviewMeta = { status: 'draft', note: '教材草稿，待臨床教師審核' };

const MR_LIN: PatientLook = { name: '林先生', age: 62, sex: 'M', hair: 'short', hairColor: '#9ca3af', shirt: '#60a5fa', glasses: true };
const MRS_ZHANG: PatientLook = { name: '張太太', age: 45, sex: 'F', hair: 'bun', hairColor: '#3f2a1d', shirt: '#f9a8d4' };
const MR_HUANG: PatientLook = { name: '黃先生', age: 55, sex: 'M', hair: 'short', hairColor: '#374151', shirt: '#86efac' };

export const SOP_UNITS: SopUnit[] = [
  /* ================================================================ */
  {
    id: 'u1-opening',
    order: 1,
    title: '建立關係與問診開場',
    englishTitle: 'Initiating the Session',
    icon: '🤝',
    frameworks: ['Calgary–Cambridge：Initiating the session'],
    summary: '自我介紹、確認身分、說明目的並取得同意，再用開放式問題邀請病人說明來意。',
    lessons: [
      {
        title: '為什麼開場這麼重要？',
        body: '問診的前一分鐘決定病人是否願意把話說完整。清楚的身分、尊重的態度與明確的目的，會讓病人更願意提供關鍵資訊。',
      },
      {
        title: '開場五步驟',
        body: '依序完成，但語氣要自然，不必像背稿。',
        bullets: [
          '問候並自我介紹：姓名＋身分／職級（例如「實習醫學生王小明」）',
          '確認病人身分：請病人自己說出全名，再加第二種辨識（如出生年月日）',
          '說明問診目的與大約時間，並取得同意',
          '留意舒適與隱私：座位、環境、是否需要家屬陪同',
          '以開放式問題邀請病人說明來意',
        ],
      },
      {
        title: '好的開場聽起來像這樣',
        body: '同一個目的，不同說法會帶來很不一樣的病人反應。',
        good: '「林先生您好，我是實習醫學生王小明，今天先由我了解您的狀況，大約十分鐘，可以嗎？方便請您說一下全名和出生年月日嗎？」',
        bad: '「你哪裡不舒服？」（沒有自我介紹、沒有確認身分，也沒有取得同意）',
      },
    ],
    takeaways: ['先讓病人知道你是誰、要做什麼', '身分確認由病人主動說出，不用「是不是林先生？」這種封閉式確認', '開場問題用開放式，讓病人先說'],
    activities: [
      {
        kind: 'choice',
        id: 'u1-dialogue',
        title: '虛擬診間：開場對話',
        intro: '林先生坐在診間，看起來有點緊張。選擇你要說的話，觀察他的反應。',
        patient: MR_LIN,
        steps: [
          {
            id: 'greet',
            prompt: '你走進診間，林先生抬頭看你。你要怎麼開始？',
            mood: 'worried',
            options: [
              { id: 'a', quality: 'best', text: '「林先生您好，我是實習醫學生王小明，今天由我先了解您的狀況。」', reply: '王醫學生你好。（點點頭，坐正了一些）', replyMood: 'calm', feedback: '清楚說出姓名與真實身分，病人知道是誰在和他說話，信任感從這裡開始。' },
              { id: 'b', quality: 'ok', text: '「你好，我是醫生。」', reply: '喔……你好。', replyMood: 'neutral', feedback: '少了姓名，而且實習醫學生不應自稱醫師。完整的自我介紹需要姓名＋身分。' },
              { id: 'c', quality: 'poor', text: '「哪裡不舒服？」', reply: '呃……（愣了一下，不確定你是誰）', replyMood: 'confused', feedback: '直接切入問題，病人不知道你的身分，也還沒準備好，容易造成緊張與防衛。' },
            ],
            takeaway: '自我介紹＝姓名＋身分（職級）。',
          },
          {
            id: 'identify',
            prompt: '接下來要確認病人身分。',
            mood: 'calm',
            options: [
              { id: 'a', quality: 'best', text: '「為了確認身分，方便請您說一下全名和出生年月日嗎？」', reply: '林志明，民國 52 年 3 月 8 日。', replyMood: 'calm', feedback: '由病人主動說出全名，再加第二種辨識資料，是避免認錯病人的標準做法。' },
              { id: 'b', quality: 'ok', text: '「您是林先生對吧？」', reply: '對。', replyMood: 'neutral', feedback: '封閉式確認容易出錯：同姓病人很多，緊張或重聽的病人也常直接說「對」。' },
              { id: 'c', quality: 'poor', text: '（跳過，直接開始問病情）', reply: '……（等你開口）', replyMood: 'neutral', feedback: '未確認身分是病人安全的重大漏洞，也是 OSCE 常見的失分點。' },
            ],
            takeaway: '病人自己說出全名＋第二辨識（如出生年月日）。',
          },
          {
            id: 'consent',
            prompt: '在詢問病情前，你要怎麼說明？',
            mood: 'calm',
            options: [
              { id: 'a', quality: 'best', text: '「接下來我會問您一些身體狀況的問題，大約十分鐘，過程中有任何不舒服都可以告訴我，可以嗎？」', reply: '好，沒問題。', replyMood: 'relieved', feedback: '說明目的、預估時間，並給病人表達的空間，同時取得同意。' },
              { id: 'b', quality: 'ok', text: '「我要開始問囉。」', reply: '……好。', replyMood: 'neutral', feedback: '有告知但沒說明目的與時間，病人仍不清楚接下來會發生什麼。' },
              { id: 'c', quality: 'poor', text: '「你先把健保卡跟之前的報告都拿出來。」', reply: '（手忙腳亂地翻包包）呃，等一下……', replyMood: 'anxious', feedback: '一開始就下指令，容易讓病人覺得被催促，也沒有取得同意。' },
            ],
          },
          {
            id: 'open',
            prompt: '準備好了，邀請林先生說明來意。',
            mood: 'calm',
            options: [
              { id: 'a', quality: 'best', text: '「今天是什麼原因來看診呢？」', reply: '最近常常覺得胸口悶悶的……（停頓）晚上也睡不太好。', replyMood: 'worried', feedback: '開放式問題讓病人用自己的話描述，你同時得到兩個線索：胸悶與睡眠問題。' },
              { id: 'b', quality: 'ok', text: '「你是胸痛嗎？」', reply: '呃……不算痛，是悶。', replyMood: 'neutral', feedback: '預設了答案，只能得到「是／不是」，可能錯過病人真正想說的事。' },
              { id: 'c', quality: 'poor', text: '「你這應該是壓力大吧？」', reply: '（皺眉）我也不知道……', replyMood: 'upset', feedback: '還沒聽病人說就先下結論，屬於誘導性且帶評價的說法，會讓病人不願多說。' },
            ],
            takeaway: '第一個問題用開放式，先聽病人說。',
          },
        ],
      },
    ],
    review: DRAFT,
  },

  /* ================================================================ */
  {
    id: 'u2-open-questions',
    order: 2,
    title: '主訴與開放式問診',
    englishTitle: 'Chief Complaint & Open Questions',
    icon: '💬',
    frameworks: ['Calgary–Cambridge：Gathering information', '開放式 → 聚焦 → 封閉式（問診漏斗）'],
    summary: '用開放式問題讓病人說出主訴，依病人的線索聚焦追問，最後用封閉式問題確認細節，並避免誘導。',
    lessons: [
      {
        title: '什麼是主訴（Chief Complaint）？',
        body: '病人此次就醫最主要的問題，用病人的話描述並加上時間，例如「咳嗽兩週」「頭暈一個月」。主訴是整個問診的主軸。',
      },
      {
        title: '問診漏斗：由寬到窄',
        body: '先開放、再聚焦、最後封閉式確認，像漏斗一樣逐步縮小範圍。',
        bullets: [
          '開放式：「可以多說一些……嗎？」讓病人自由描述',
          '聚焦式：「您剛提到晚上咳得比較厲害，可以再說說嗎？」跟著病人的線索走',
          '封閉式：「有沒有發燒？」用於確認特定事實或篩檢危險徵象',
          '促進技巧：點頭、適度沉默、「然後呢？」「還有嗎？」',
        ],
      },
      {
        title: '避免誘導性提問',
        body: '問句中暗示了期待的答案，病人容易順著回答，資訊就失真了。',
        good: '「有沒有發燒？」',
        bad: '「你應該沒有發燒吧？」',
      },
      {
        title: '一次只問一件事',
        body: '連珠炮式的問題（「有沒有發燒、咳嗽、胸痛、頭痛？」）讓病人難以逐一回答，也容易漏掉資訊。',
      },
    ],
    takeaways: ['主訴＝病人的話＋時間', '先開放、跟著線索聚焦、最後封閉式確認', '不誘導、不連珠炮'],
    activities: [
      {
        kind: 'choice',
        id: 'u2-question-game',
        title: '問句選擇遊戲',
        intro: '張太太說：「醫生，我最近一直咳嗽。」選擇你的問法，看看你能得到多少資訊。',
        patient: MRS_ZHANG,
        steps: [
          {
            id: 'open',
            prompt: '張太太的主訴是咳嗽。你的第一個問題是？',
            patientLine: '醫生，我最近一直咳嗽。',
            mood: 'worried',
            options: [
              { id: 'a', quality: 'best', text: '「可以跟我多說一些咳嗽的情形嗎？」', reply: '咳了大概兩個禮拜，一開始只是喉嚨癢，後來晚上咳得比較厲害，有時候會咳出黃黃的痰。', replyMood: 'calm', feedback: '一個開放式問題就得到：時間（兩週）、演變、夜間加重、痰的性質。' },
              { id: 'b', quality: 'ok', text: '「咳多久了？」', reply: '兩個禮拜。', replyMood: 'neutral', feedback: '問題本身有用，但封閉式只拿到單一資訊；太早使用會讓問診變成一問一答。' },
              { id: 'c', quality: 'poor', text: '「你是不是感冒沒好好休息？」', reply: '呃……可能吧。', replyMood: 'neutral', feedback: '誘導性提問，暗示了答案，病人順著回答，你什麼新資訊都沒拿到。' },
            ],
          },
          {
            id: 'focus',
            prompt: '病人提到「晚上咳得比較厲害」與「黃痰」。下一步？',
            mood: 'calm',
            options: [
              { id: 'a', quality: 'best', text: '「您提到晚上咳得比較厲害，可以再多說一點嗎？」', reply: '躺下來就一直咳，有時候會咳醒，要坐起來才比較好。', replyMood: 'calm', feedback: '跟著病人給的線索聚焦，取得「躺下加重、坐起改善」這個重要特徵。' },
              { id: 'b', quality: 'ok', text: '「痰是什麼顏色？」', reply: '黃色的，剛剛有說。', replyMood: 'neutral', feedback: '重複問病人已經說過的資訊，會讓病人覺得你沒有在聽。' },
              { id: 'c', quality: 'poor', text: '「有沒有發燒、胸痛、喘、體重減輕、盜汗？」', reply: '啊？你剛剛問什麼……', replyMood: 'confused', feedback: '一次丟出多個封閉式問題，病人無法逐一回答，資訊反而遺漏。' },
            ],
          },
          {
            id: 'closed',
            prompt: '聽完描述後，你想確認是否有發燒。怎麼問最好？',
            mood: 'calm',
            options: [
              { id: 'a', quality: 'best', text: '「這段期間有沒有發燒？」', reply: '前幾天有一點點，量起來 37.8 度，這兩天沒有了。', replyMood: 'calm', feedback: '這時使用中性的封閉式問題很恰當，病人給出了具體答案。' },
              { id: 'b', quality: 'poor', text: '「你應該沒有發燒吧？」', reply: '……應該沒有吧。', replyMood: 'neutral', feedback: '誘導式問法讓病人傾向否認，前幾天的低燒因此被漏掉了。' },
              { id: 'c', quality: 'ok', text: '「你有沒有覺得身體哪裡怪怪的？」', reply: '嗯……也還好，就是咳嗽。', replyMood: 'neutral', feedback: '此時需要確認特定事實，太寬的問題反而得不到需要的資訊。' },
            ],
            takeaway: '開放式用來展開，封閉式用來確認；兩者都不能帶有預設答案。',
          },
        ],
      },
      {
        kind: 'sort',
        id: 'u2-question-types',
        title: '問句類型辨識',
        intro: '把每個問句拖到它所屬的類型（手機可先點卡片、再點類型）。',
        bins: [
          { id: 'open', label: '開放式', hint: '讓病人自由描述', color: '#0d9488' },
          { id: 'closed', label: '封閉式', hint: '確認特定事實', color: '#2563eb' },
          { id: 'leading', label: '誘導式', hint: '暗示了答案', color: '#ea580c' },
        ],
        cards: [
          { id: 'q1', text: '「可以描述一下那種痛的感覺嗎？」', bin: 'open', explain: '讓病人用自己的話描述感受。' },
          { id: 'q2', text: '「痛的時候會不會冒冷汗？」', bin: 'closed', explain: '確認單一特定症狀，答案是「會／不會」。' },
          { id: 'q3', text: '「你不會喝很多酒吧？」', bin: 'leading', explain: '「不會……吧」暗示期待的答案，病人容易低報。' },
          { id: 'q4', text: '「後來呢？」', bin: 'open', explain: '促進式提問，鼓勵病人繼續說下去。' },
          { id: 'q5', text: '「這是吃了油膩食物之後才痛的，對嗎？」', bin: 'leading', explain: '先替病人說出原因，再要病人確認。' },
          { id: 'q6', text: '「平常一天抽幾根菸？」', bin: 'closed', explain: '詢問特定數量的事實。' },
          { id: 'q7', text: '「還有其他讓您擔心的事情嗎？」', bin: 'open', explain: '開放式邀請，常用於探索病人擔憂或結束前的確認。' },
          { id: 'q8', text: '「你應該有按時吃藥吧？」', bin: 'leading', explain: '帶有期待與評價，病人可能不敢說實話。' },
        ],
      },
    ],
    review: DRAFT,
  },

  /* ================================================================ */
  {
    id: 'u3-opqrst',
    order: 3,
    title: 'OPQRST 症狀探索',
    englishTitle: 'Symptom Analysis with OPQRST',
    icon: '🧭',
    frameworks: ['OPQRST', '症狀分析通用要素'],
    summary: '用 O-P-Q-R-S-T 六個面向完整描述一個症狀；也要知道哪些主訴不適合硬套 OPQRST。',
    lessons: [
      {
        title: 'OPQRST 六個面向',
        body: '把一個症狀「描述完整」，鑑別診斷才有依據。',
        bullets: [
          'O｜Onset 發生：什麼時候開始？突然還是漸進？當時在做什麼？',
          'P｜Provocation / Palliation 誘發與緩解：什麼會加重？什麼會改善？',
          'Q｜Quality 性質：刺痛、悶痛、絞痛、燒灼感？',
          'R｜Region / Radiation 部位與轉移：哪裡最痛？會延伸到別處嗎？',
          'S｜Severity 嚴重度：0–10 分幾分？影響睡眠或工作嗎？',
          'T｜Timing 時間型態：持續或間歇？每次多久？有規律嗎？',
        ],
      },
      {
        title: '別忘了相關症狀',
        body: 'OPQRST 之外，還要問與主訴相關的伴隨症狀（例如腹痛時的噁心嘔吐、發燒、排便改變），以及症狀對生活的影響。',
      },
      {
        title: 'OPQRST 不是萬用公式',
        body: 'OPQRST 最適合分析疼痛類症狀。其他主訴要用符合臨床情境的問診架構，不能一律硬套。',
        bullets: [
          '頭暈：先區分天旋地轉（眩暈）、快要昏倒、走路不穩，再問誘發因素與伴隨症狀',
          '心悸：跳得快／亂／很用力？發作與結束方式？是否伴隨胸痛、暈厥？',
          '咳嗽：時間、痰的量與性質、有無咳血、夜間或姿勢變化、全身症狀',
          '體重減輕：減了多少、多久、飲食與食慾、伴隨症狀',
        ],
      },
    ],
    takeaways: ['六個面向缺一不可，但順序可依對話自然調整', '問完 OPQRST 還要問相關伴隨症狀', '非疼痛主訴改用適合的架構'],
    activities: [
      {
        kind: 'sort',
        id: 'u3-board',
        title: 'OPQRST 線索盤',
        intro: '把問句卡片放進對應的 OPQRST 區塊。',
        bins: [
          { id: 'O', label: 'O 發生', hint: 'Onset', color: '#0d9488' },
          { id: 'P', label: 'P 誘發／緩解', hint: 'Provocation / Palliation', color: '#0284c7' },
          { id: 'Q', label: 'Q 性質', hint: 'Quality', color: '#7c3aed' },
          { id: 'R', label: 'R 部位／轉移', hint: 'Region / Radiation', color: '#db2777' },
          { id: 'S', label: 'S 嚴重度', hint: 'Severity', color: '#ea580c' },
          { id: 'T', label: 'T 時間型態', hint: 'Timing', color: '#65a30d' },
        ],
        cards: [
          { id: 'c1', text: '「這個痛是什麼時候開始的？」', bin: 'O', explain: '詢問起始時間，屬於 Onset。' },
          { id: 'c2', text: '「開始的時候是突然痛，還是慢慢出現？」', bin: 'O', explain: '急性或漸進發生是 Onset 的重要特徵。' },
          { id: 'c3', text: '「做什麼事情會讓它更痛？」', bin: 'P', explain: '誘發／加重因素。' },
          { id: 'c4', text: '「休息或吃藥之後會比較好嗎？」', bin: 'P', explain: '緩解因素。' },
          { id: 'c5', text: '「可以形容一下是什麼樣的痛嗎？刺痛、悶痛還是絞痛？」', bin: 'Q', explain: '疼痛性質。' },
          { id: 'c6', text: '「痛起來像被壓著，還是燒灼感？」', bin: 'Q', explain: '同樣是描述性質。' },
          { id: 'c7', text: '「可以指給我看最痛的位置嗎？」', bin: 'R', explain: '部位。' },
          { id: 'c8', text: '「這個痛會跑到其他地方嗎？」', bin: 'R', explain: '轉移或延伸痛（Radiation）。' },
          { id: 'c9', text: '「0 分是不痛、10 分是最痛，現在大概幾分？」', bin: 'S', explain: '以數字量表評估嚴重度。' },
          { id: 'c10', text: '「痛到會影響睡覺或工作嗎？」', bin: 'S', explain: '功能影響也是嚴重度的重要指標。' },
          { id: 'c11', text: '「是一直痛，還是一陣一陣的？」', bin: 'T', explain: '持續或間歇的時間型態。' },
          { id: 'c12', text: '「每次大概痛多久？一天會發生幾次？」', bin: 'T', explain: '發作時間長度與頻率。' },
        ],
      },
      {
        kind: 'choice',
        id: 'u3-next-question',
        title: '下一個合理的追問',
        intro: '根據病人已經說過的內容，判斷下一個最有價值的問題。',
        steps: [
          {
            id: 'abd',
            prompt: '王先生（40 歲）上腹痛：「昨晚吃完宵夜後開始痛，現在大概 6 分，是悶悶的痛。」他已經提供了哪些面向？下一個問題選？',
            patientLine: '昨晚吃完宵夜後開始痛，現在大概 6 分，是悶悶的痛。',
            mood: 'pained',
            options: [
              { id: 'a', quality: 'best', text: '「這個痛會不會延伸到背部或其他地方？」', reply: '好像有一點往背後跑。', replyMood: 'pained', feedback: 'O、S、Q 已知，R（轉移）尚未問到，而上腹痛延伸到背部是需要注意的線索。' },
              { id: 'b', quality: 'best', text: '「是一直痛，還是一陣一陣的？」', reply: '一直痛，沒有停過。', replyMood: 'pained', feedback: 'T 也還沒問到，同樣是合理的下一步。OPQRST 的順序可以彈性調整。' },
              { id: 'c', quality: 'poor', text: '「什麼時候開始痛的？」', reply: '昨晚吃完宵夜啊，剛剛說過了。', replyMood: 'upset', feedback: 'Onset 病人已經說了，重複詢問顯示沒有專心聽。' },
              { id: 'd', quality: 'poor', text: '「你是不是胃潰瘍？」', reply: '我不知道，所以才來看醫生啊。', replyMood: 'upset', feedback: '過早下診斷且屬誘導性問題，也沒有蒐集到新資訊。' },
            ],
            takeaway: '先在腦中盤點「哪些面向已知、哪些未知」，再決定下一題。',
          },
          {
            id: 'palp',
            prompt: '李小姐（30 歲）主訴：「最近常常心悸。」以下哪一種追問方式最合適？',
            patientLine: '最近常常心悸，心臟怦怦跳。',
            mood: 'anxious',
            options: [
              { id: 'a', quality: 'best', text: '「心悸的時候是跳得很快、跳得亂，還是很用力？每次大概多久、怎麼開始和結束？」', reply: '突然就跳很快，大概幾分鐘，然後又突然停下來。', replyMood: 'anxious', feedback: '心悸要描述型態、規則與否、發作與結束方式，這比硬套 OPQRST 更有鑑別價值。' },
              { id: 'b', quality: 'poor', text: '「心悸的位置在哪裡？會延伸到哪裡？」', reply: '呃……就是心臟啊？', replyMood: 'confused', feedback: '把疼痛的 R（部位／轉移）硬套在心悸上，問題不適合。' },
              { id: 'c', quality: 'ok', text: '「0 到 10 分，心悸有多嚴重？」', reply: '嗯……6 分吧？', replyMood: 'neutral', feedback: '嚴重度可以問，但對心悸的鑑別幫助有限；更重要的是發作型態與是否伴隨暈厥、胸痛。' },
            ],
            takeaway: 'OPQRST 主要用於疼痛；其他主訴改用符合臨床情境的問診架構。',
          },
        ],
      },
    ],
    review: DRAFT,
  },

  /* ================================================================ */
  {
    id: 'u4-history',
    order: 4,
    title: '相關病史拼圖',
    englishTitle: 'Past, Drug, Family & Social History',
    icon: '🧩',
    frameworks: ['過去病史', '手術史', '藥物史', '過敏史', '家族史', '社會史', '系統回顧'],
    summary: '認識各類相關病史，並依主訴判斷哪些需要優先詢問。',
    lessons: [
      {
        title: '七塊病史拼圖',
        body: '每一塊都可能藏著關鍵線索，但不需要每次都問到鉅細靡遺。',
        bullets: [
          '過去病史：慢性病、重大疾病、住院經驗',
          '手術史：開過什麼刀、何時、為什麼；包含重要的侵入性處置',
          '藥物史：處方藥、成藥、中草藥、保健食品，以及服藥順從性',
          '過敏史：對什麼過敏、過敏時出現什麼反應',
          '家族史：一等親的重大疾病、遺傳性疾病',
          '社會史：職業、菸酒檳榔、居住與照顧狀況、旅遊史（依情境加問）',
          '系統回顧：與主訴相關的器官系統症狀',
        ],
      },
      {
        title: '聚焦式問診的關鍵',
        body: 'OSCE 的時間有限。先想「這個主訴可能的原因有哪些？」，再挑出最能幫助鑑別的病史優先詢問。',
      },
    ],
    takeaways: ['藥物史要包含成藥、中草藥與保健食品', '過敏史要問「過敏時會怎樣」', '依主訴決定優先順序，而不是背清單'],
    activities: [
      {
        kind: 'sort',
        id: 'u4-puzzle',
        title: '病史分類拼圖',
        intro: '這些問題分別屬於哪一類病史？',
        bins: [
          { id: 'pmh', label: '過去病史', color: '#0d9488' },
          { id: 'surg', label: '手術史', color: '#0284c7' },
          { id: 'med', label: '藥物史', color: '#7c3aed' },
          { id: 'allergy', label: '過敏史', color: '#db2777' },
          { id: 'family', label: '家族史', color: '#ea580c' },
          { id: 'social', label: '社會史', color: '#65a30d' },
          { id: 'ros', label: '系統回顧', color: '#64748b' },
        ],
        cards: [
          { id: 'h1', text: '「以前有沒有高血壓、糖尿病或其他慢性病？」', bin: 'pmh', explain: '慢性病屬於過去病史。' },
          { id: 'h2', text: '「之前有住過院嗎？是什麼原因？」', bin: 'pmh', explain: '住院經驗屬於過去病史。' },
          { id: 'h3', text: '「請問以前有沒有開過刀？」', bin: 'surg', explain: '手術史。' },
          { id: 'h4', text: '「有做過心導管或內視鏡這類的處置嗎？」', bin: 'surg', explain: '重要侵入性處置一併記錄在手術／處置史。' },
          { id: 'h5', text: '「目前有固定吃哪些藥？」', bin: 'med', explain: '處方用藥。' },
          { id: 'h6', text: '「有沒有吃中藥、成藥或保健食品？」', bin: 'med', explain: '常被遺漏，但可能影響診斷與用藥安全。' },
          { id: 'h7', text: '「有沒有對什麼藥物過敏？過敏時會怎樣？」', bin: 'allergy', explain: '過敏原＋反應型態。' },
          { id: 'h8', text: '「家人有沒有人有心臟病或中風？」', bin: 'family', explain: '家族史。' },
          { id: 'h9', text: '「平常有抽菸、喝酒或吃檳榔嗎？」', bin: 'social', explain: '物質使用屬於社會史。' },
          { id: 'h10', text: '「目前的工作是做什麼？」', bin: 'social', explain: '職業屬於社會史，也可能與職業暴露有關。' },
          { id: 'h11', text: '「最近有沒有發燒或畏寒？」', bin: 'ros', explain: '全身性症狀的系統回顧。' },
          { id: 'h12', text: '「有沒有咳嗽或喘的情形？」', bin: 'ros', explain: '呼吸系統的系統回顧。' },
        ],
      },
      {
        kind: 'multipick',
        id: 'u4-priority',
        title: '優先詢問哪些病史？',
        intro: '在有限時間內，選出最需要優先釐清的病史。',
        scenario: '72 歲女性，在家中跌倒後右手腕疼痛而就醫。意識清楚，生命徵象穩定。除了跌倒經過與手腕的症狀，請選出 3 項最優先詢問的相關病史。',
        pick: 3,
        options: [
          { id: 'a', text: '藥物史：降血壓藥、安眠藥、抗凝血劑', priority: 'high', explain: '降壓藥與安眠藥會增加跌倒風險；抗凝血劑影響出血與後續處置。' },
          { id: 'b', text: '跌倒前的症狀：頭暈、心悸、胸痛、是否失去意識', priority: 'high', explain: '要區分是單純絆倒，還是暈厥等內科原因造成的跌倒。' },
          { id: 'c', text: '過去病史：骨質疏鬆、心律不整、中風', priority: 'high', explain: '與骨折風險及跌倒原因直接相關。' },
          { id: 'd', text: '社會史：獨居或有人照顧', priority: 'medium', explain: '影響出院安排與再跌倒預防，重要但可稍後詢問。' },
          { id: 'e', text: '家族史：父母親的慢性病', priority: 'low', explain: '對此次跌倒的評估幫助有限。' },
          { id: 'f', text: '過敏史', priority: 'medium', explain: '開立藥物前一定要確認，但對找出跌倒原因幫助較小。' },
        ],
        takeaway: '先問「最能改變判斷與處置」的病史；其他項目在時間允許時補齊。',
      },
    ],
    review: DRAFT,
  },

  /* ================================================================ */
  {
    id: 'u5-red-flags',
    order: 5,
    title: '臨床線索與問診優先順序',
    englishTitle: 'Clinical Reasoning & Red Flags',
    icon: '🚨',
    frameworks: ['危險徵象（Red flags）', '臨床推理'],
    summary: '從病人的話中辨識危險徵象，決定先問什麼；遇到可能危及生命的情況，先求救、先評估，不必等問完。',
    lessons: [
      {
        title: '問診不只是蒐集資訊',
        body: '每個答案都在幫你調整「可能的診斷」與「接下來最該問的問題」。重要的是判斷哪些資訊會改變處置。',
      },
      {
        title: '危險徵象優先',
        body: '某些線索代表需要立即評估：',
        bullets: [
          '胸痛合併冒冷汗、喘、臉色蒼白',
          '突然發生、「這輩子最痛」的頭痛',
          '意識改變、單側無力或說話不清',
          '大量出血、生命徵象不穩定',
        ],
      },
      {
        title: '病人安全永遠第一',
        body: '出現危險徵象時，先請求協助、量測生命徵象、啟動必要評估，同時聚焦詢問關鍵資訊。不需要把所有病史問完才行動。',
      },
      {
        title: '也不要過度反應',
        body: '生命徵象穩定、沒有危險徵象時，啟動急救反而延誤正確評估。重點是篩檢紅旗，再依優先順序問診。',
      },
    ],
    takeaways: ['看到紅旗：先求救、先評估、再聚焦問診', '沒有紅旗：依鑑別價值排序問題', '把病人安全放在完整問診之前'],
    activities: [
      {
        kind: 'choice',
        id: 'u5-detective',
        title: '臨床線索偵探',
        intro: '根據病人提供的資訊，選擇你此刻最優先的行動或問題。',
        steps: [
          {
            id: 'chest',
            prompt: '58 歲男性，胸口悶痛約 30 分鐘，正在冒冷汗、臉色蒼白。你正在問診。',
            patientLine: '胸口好悶……一直冒冷汗。',
            mood: 'pained',
            options: [
              { id: 'a', quality: 'best', text: '暫停完整問診：立即請求協助、測量生命徵象並安排心電圖，同時聚焦詢問胸痛性質與危險因子。', reply: '（護理師與學長趕來協助，開始量測生命徵象）', replyMood: 'pained', feedback: '胸痛合併冒冷汗、蒼白是危險徵象，需要立即評估。聚焦問診可以與評估同時進行。' },
              { id: 'b', quality: 'ok', text: '先詢問胸痛有沒有延伸到左手或下巴。', reply: '好像……左手也有點麻。', replyMood: 'pained', feedback: '問題本身很有價值，但此刻應該先啟動評估與求救，再同步問診。' },
              { id: 'c', quality: 'poor', text: '繼續依序詢問過去病史與家族史，全部問完再處理。', reply: '（臉色越來越差）', replyMood: 'pained', feedback: '病人可能正處於急性冠心症，照表操課會延誤處置。' },
            ],
            takeaway: '危險徵象出現時，不必等問完所有問題才行動。',
          },
          {
            id: 'cough',
            prompt: '35 歲女性，咳嗽三週，沒有發燒，生命徵象穩定，精神還不錯。',
            patientLine: '咳了快三個禮拜都沒好。',
            mood: 'worried',
            options: [
              { id: 'a', quality: 'best', text: '詢問咳嗽與痰的性質，並篩檢危險徵象：有無咳血、體重減輕、夜間盜汗、喘。', reply: '痰是白白的，沒有咳血，體重也沒變。', replyMood: 'calm', feedback: '病人穩定時，先描述症狀並篩檢紅旗，是最有效率的順序。' },
              { id: 'b', quality: 'poor', text: '立即啟動急救流程。', reply: '（病人一臉疑惑）我只是咳嗽而已……', replyMood: 'confused', feedback: '生命徵象穩定、沒有危險徵象，過度反應會浪費資源，也會讓病人不安。' },
              { id: 'c', quality: 'ok', text: '先詢問家族史。', reply: '家人都很健康啊。', replyMood: 'neutral', feedback: '可以問，但對三週咳嗽的鑑別，症狀描述與紅旗篩檢更優先。' },
            ],
          },
          {
            id: 'headache',
            prompt: '45 歲男性：「剛剛搬東西時突然頭痛，是這輩子最痛的一次。」說完後嘔吐一次。',
            patientLine: '這輩子從來沒這麼痛過……',
            mood: 'pained',
            options: [
              { id: 'a', quality: 'best', text: '立即通知上級醫師、啟動緊急評估（生命徵象、意識與神經學評估），同時確認發作時間。', reply: '（醫療團隊開始緊急評估）', replyMood: 'pained', feedback: '突然發生的劇烈頭痛合併嘔吐是危險徵象，需要立即評估是否有顱內出血。' },
              { id: 'b', quality: 'ok', text: '先問以前有沒有偏頭痛病史。', reply: '以前偶爾會頭痛，但完全不是這樣。', replyMood: 'pained', feedback: '病史有參考價值，但不應延後緊急評估。' },
              { id: 'c', quality: 'poor', text: '給止痛藥，請他回家觀察。', reply: '（病人勉強起身，看起來很不舒服）', replyMood: 'pained', feedback: '可能錯過致命的疾病，病人安全受到威脅。' },
            ],
          },
          {
            id: 'numb',
            prompt: '60 歲男性糖尿病患者，雙腳麻木三個月，生命徵象穩定，情緒平穩。',
            patientLine: '腳麻麻的大概三個月了。',
            mood: 'calm',
            options: [
              { id: 'a', quality: 'best', text: '釐清麻木的分布與進展，以及是否有無力、傷口或跌倒。', reply: '兩腳都麻，從腳趾開始，最近腳底有一個小傷口。', replyMood: 'worried', feedback: '描述症狀並找出需要處理的併發症（例如足部傷口），是最有價值的下一步。' },
              { id: 'b', quality: 'best', text: '詢問血糖控制情形與目前用藥。', reply: '最近比較少量血糖，藥有時候會忘記吃。', replyMood: 'neutral', feedback: '與主訴高度相關，也是合理的優先問題。' },
              { id: 'c', quality: 'poor', text: '先詢問小時候的預防接種紀錄。', reply: '這個……我不記得耶。', replyMood: 'confused', feedback: '與目前主訴關聯很低，浪費寶貴的問診時間。' },
            ],
            takeaway: '同一時間可能有多個好問題，關鍵是挑出「最能幫助判斷與處置」的。',
          },
        ],
      },
    ],
    review: DRAFT,
  },

  /* ================================================================ */
  {
    id: 'u6-ice-summary',
    order: 6,
    title: '病人觀點、摘要與結束',
    englishTitle: 'ICE, Summary & Closing',
    icon: '📝',
    frameworks: ['ICE：Ideas / Concerns / Expectations', 'Calgary–Cambridge：Explanation & Closing'],
    summary: '探索病人的想法、擔憂與期待，給予同理回應；整理重要陽性與陰性病史，核對理解後再說明下一步。',
    lessons: [
      {
        title: 'ICE：了解病人的觀點',
        body: '病人帶著自己的想法來看診，沒有被聽見的擔憂常常是不滿與不遵從的原因。',
        bullets: [
          'Ideas 想法：「您覺得可能是什麼原因？」',
          'Concerns 擔憂：「您最擔心的是什麼？」',
          'Expectations 期待：「今天希望我們幫您做些什麼？」',
        ],
      },
      {
        title: '回應焦慮：先同理，再說明',
        body: '說出你觀察到的情緒、表示理解，再一起釐清。避免空泛的保證（「不會啦」「不用擔心」），在還沒有資訊之前，這種保證反而讓病人更不安。',
      },
      {
        title: '摘要：重要陽性與陰性',
        body: '用簡短幾句整理：主訴與時間、重要的陽性發現、重要的陰性發現、病人的擔憂。摘要後請病人確認或補充。',
      },
      {
        title: '結束前',
        body: '確認病人還有沒有其他問題，並說明接下來的檢查與處理方向。',
      },
    ],
    takeaways: ['ICE 三問', '先同理再說明，不給空泛保證', '摘要包含重要陽性與陰性，並請病人核對'],
    activities: [
      {
        kind: 'choice',
        id: 'u6-empathy',
        title: '同理回應：黃先生的擔憂',
        intro: '黃先生頭痛兩週，你已經問完症狀。現在要探索他的想法與擔憂。',
        patient: MR_HUANG,
        steps: [
          {
            id: 'ideas',
            prompt: '你想了解黃先生自己怎麼看這個頭痛。',
            mood: 'worried',
            options: [
              { id: 'a', quality: 'best', text: '「您自己覺得可能是什麼原因造成的呢？」', reply: '我是怕……會不會是腦瘤。我爸爸以前就是頭痛開始的。', replyMood: 'anxious', feedback: '開放式探索 Ideas，病人說出了真正的擔憂與背景。' },
              { id: 'b', quality: 'poor', text: '「應該是壓力，你不要想太多。」', reply: '……（沉默，眉頭深鎖）', replyMood: 'upset', feedback: '還沒探索就給結論，病人的擔憂被壓下去了，之後也不會再說。' },
              { id: 'c', quality: 'ok', text: '「你有在擔心什麼嗎？」', reply: '嗯……有一點吧。', replyMood: 'worried', feedback: '方向對了，但問法偏封閉，病人可能只回答「有／沒有」。' },
            ],
          },
          {
            id: 'concern',
            prompt: '黃先生說擔心是腦瘤，因為父親有類似經驗。你怎麼回應？',
            mood: 'anxious',
            options: [
              { id: 'a', quality: 'best', text: '「聽起來您很擔心，尤其爸爸有過類似的經驗，一定讓您很不安。我們一起把可能的原因釐清。」', reply: '對……謝謝你願意聽我說。', replyMood: 'relieved', feedback: '說出觀察到的情緒、理解背景、表達一起處理的態度，這是同理回應的核心。' },
              { id: 'b', quality: 'poor', text: '「腦瘤機率很低啦，不用擔心。」', reply: '你又還沒檢查，怎麼知道？', replyMood: 'upset', feedback: '空泛保證沒有根據，反而讓病人覺得不被重視。' },
              { id: 'c', quality: 'poor', text: '「這個不是我現在要問的。」', reply: '……（低頭不語）', replyMood: 'upset', feedback: '忽略病人的擔憂，會破壞信任關係。' },
            ],
          },
          {
            id: 'expect',
            prompt: '最後了解黃先生的期待。',
            mood: 'relieved',
            options: [
              { id: 'a', quality: 'best', text: '「您今天希望我們幫您做些什麼呢？」', reply: '我想知道需不需要做腦部檢查，這樣比較安心。', replyMood: 'calm', feedback: '知道病人的期待，才能在說明時直接回應，並討論檢查是否需要。' },
              { id: 'b', quality: 'ok', text: '「我們會幫你安排很多檢查。」', reply: '很多檢查？要做什麼？', replyMood: 'worried', feedback: '沒有先了解期待就給承諾，可能與病人需求或臨床判斷不一致。' },
            ],
            takeaway: 'ICE 的答案，會直接影響你最後怎麼說明病情。',
          },
        ],
      },
      {
        kind: 'summary',
        id: 'u6-summary',
        title: '病史摘要挑戰',
        intro: '從下面的資訊中，挑出應該放進摘要的內容。',
        context: '黃先生，55 歲。你在問診中得到以下資訊（其中有些不正確或與主訴無關）。請組合一段給病人核對的摘要。',
        facts: [
          { id: 'f1', text: '兩週來兩側太陽穴緊繃感頭痛，下午較明顯', type: 'positive', key: true, explain: '主訴與特徵，摘要的核心。' },
          { id: 'f2', text: '最近工作壓力大、睡眠不足', type: 'positive', key: true, explain: '可能的誘發因素。' },
          { id: 'f3', text: '沒有嘔吐、視力模糊或肢體無力', type: 'negative', key: true, explain: '重要的陰性發現，排除部分危險徵象。' },
          { id: 'f4', text: '沒有發燒', type: 'negative', key: true, explain: '重要陰性發現。' },
          { id: 'f5', text: '擔心是腦瘤（父親曾罹患腦瘤）', type: 'concern', key: true, explain: '病人的擔憂，摘要時說出來代表你有聽見。' },
          { id: 'f6', text: '平常喜歡吃辣', type: 'irrelevant', key: false, explain: '與頭痛無關，放進摘要會模糊重點。' },
          { id: 'f7', text: '小學時曾經手骨折', type: 'irrelevant', key: false, explain: '與此次主訴無關。' },
          { id: 'f8', text: '頭痛已經持續半年', type: 'incorrect', key: false, explain: '與病人說的「兩週」不符，摘要出錯會讓病人失去信任。' },
          { id: 'f9', text: '頭痛時常常會嘔吐', type: 'incorrect', key: false, explain: '病人說沒有嘔吐，這是錯誤資訊。' },
        ],
        closing: {
          id: 'close',
          prompt: '摘要完成後，你要怎麼結束這段問診？',
          mood: 'calm',
          options: [
            { id: 'a', quality: 'best', text: '「我剛剛整理的內容正確嗎？還有沒有想補充或想問的？接下來我會說明可能的原因和檢查的安排。」', reply: '對，就是這樣。我想問的是……需要照片子嗎？', replyMood: 'calm', feedback: '核對理解、邀請補充、預告下一步，病人有機會提出問題。' },
            { id: 'b', quality: 'ok', text: '「好，接下來幫您安排檢查。」', reply: '喔……好。（似乎還有話想說）', replyMood: 'neutral', feedback: '有說明下一步，但沒有核對摘要，也沒讓病人提問。' },
            { id: 'c', quality: 'poor', text: '「好，今天就到這裡。」', reply: '啊？那我到底……', replyMood: 'confused', feedback: '突然結束，病人的問題與擔憂都沒被處理。' },
          ],
        },
      },
    ],
    review: DRAFT,
  },
];

export const getUnit = (id: string) => SOP_UNITS.find((u) => u.id === id) ?? null;
