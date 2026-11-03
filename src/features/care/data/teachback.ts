import type { TeachBackTask } from '../types';
import { LOOK } from './looks';

/**
 * Game 3：衛教互動工坊（Teach-back 七步驟）
 * 一般高血壓新用藥衛教的教學示範（不指定藥名與劑量），待臨床教師審核。
 * 病人的復述依學生的說明方式而不同：說明越清楚，誤解越少，但仍可能有一個常見誤解。
 */
export const TEACHBACK_TASK: TeachBackTask = {
  id: 'tb-bp-med',
  title: '新的降血壓藥：王伯伯的用藥衛教',
  patient: { ...LOOK.oldM, fullName: '王福來', context: '71 歲，獨居，太太住在附近的女兒家。今天醫師開了一種新的降血壓藥（每天一次），由你負責衛教。' },
  keyPoints: [
    { id: 'k1', text: '每天早上固定時間吃一顆' },
    { id: 'k2', text: '血壓正常或頭暈時都不要自己停藥；頭暈先坐下休息，並打電話問門診' },
    { id: 'k3', text: '每天量血壓記在本子上，兩週後帶回來看' },
  ],
  infoPool: [
    { id: 'k1', text: '每天早上固定時間吃一顆', key: true, why: '用藥方式是病人回家第一件要做的事。' },
    { id: 'k2', text: '不要自己停藥；頭暈先坐下休息，並打電話問門診', key: true, why: '自行停藥是常見且有風險的誤解。' },
    { id: 'k3', text: '每天量血壓記錄，兩週後帶回來', key: true, why: '讓醫師評估藥效，也讓病人參與照顧。' },
    { id: 'x1', text: '這類藥物在血管上的作用機轉', key: false, why: '對醫療人員重要，但不是病人今天必須帶回家的訊息。' },
    { id: 'x2', text: '仿單上列出的所有可能副作用', key: false, why: '一次列出全部副作用容易造成恐懼與資訊過量；常見且需注意的再挑重點說。' },
    { id: 'x3', text: '其他種類降血壓藥的比較', key: false, why: '今天沒有要選藥，比較會分散注意力。' },
  ],
  maxPick: 3,
  steps: {
    ask: {
      prompt: '步驟 1：開始衛教前，先了解王伯伯已經知道什麼。',
      patientLine: '「醫師說要多吃一種藥，我是聽不太懂啦。」',
      options: [
        { id: 'a', text: '「伯伯，醫師剛剛跟您說的新藥，您記得哪些？您之前有吃過降血壓的藥嗎？」', quality: 'best', feedback: '先了解起點（已知與經驗），再決定從哪裡說起。', reply: '「以前沒吃過，只知道血壓高。我隔壁的說吃了就要吃一輩子……」', replyMood: 'worried' },
        { id: 'b', text: '「沒關係，我從頭跟您講。」', quality: 'ok', feedback: '願意從頭說很好，但不知道他已知什麼、有什麼誤解。', reply: '「好。」', replyMood: 'neutral' },
        { id: 'c', text: '「就是 ARB 啦，一天一顆。」', quality: 'poor', feedback: '用了術語，也沒有先了解病人的起點。', reply: '「A……什麼？」', replyMood: 'confused' },
      ],
    },
    explain: [
      { style: 'plain', text: '「這個藥是幫忙把血壓降下來的。每天早上起床吃一顆，最好每天差不多同一個時間。」', feedback: '日常語言、具體可執行。' },
      { style: 'jargon', text: '「這是一種 angiotensin receptor blocker，QD 服用，可以降低周邊血管阻力。」', feedback: '術語太多，病人無法理解，也記不住怎麼吃。' },
      { style: 'overload', text: '「這個藥會作用在血管，讓血管放鬆……副作用可能有頭暈、咳嗽、高血鉀、腎功能變化……還有其他類的降壓藥像是……」', feedback: '一次給太多資訊，重點會被淹沒，也可能引起恐懼。' },
    ],
    invite: {
      prompt: '步驟 4：說明完重點後，邀請王伯伯提問。',
      patientLine: '（王伯伯看著藥袋，沒有說話）',
      options: [
        { id: 'a', text: '「很多人第一次吃藥都會有些疑問，例如什麼時候吃、可不可以停。伯伯您有想到什麼想問的嗎？」', quality: 'best', feedback: '把提問「正常化」，並提示常見問題，病人比較敢開口。', reply: '「那……我要吃一輩子喔？」', replyMood: 'worried' },
        { id: 'b', text: '「有問題嗎？」', quality: 'ok', feedback: '封閉式的邀請，病人常回答「沒有」。', reply: '「沒有。」', replyMood: 'neutral' },
        { id: 'c', text: '（直接進入下一步，沒有邀請提問）', quality: 'poor', feedback: '病人沒有機會提出疑問。', reply: '（欲言又止）', replyMood: 'confused' },
      ],
    },
    teachBack: {
      prompt: '步驟 5：確認王伯伯真正理解。',
      patientLine: '「好，我知道了。」',
      options: [
        { id: 'a', text: '「為了確定我剛剛講清楚了，伯伯可以說說看，回家以後這個藥要怎麼吃、要注意什麼嗎？」', quality: 'best', feedback: 'Teach-back：以「我」開頭，請病人用自己的話說。', reply: '「好，我說說看……」', replyMood: 'neutral' },
        { id: 'b', text: '「伯伯您懂了嗎？」', quality: 'poor', feedback: '病人說「我懂了」不算數——你還不知道他帶走了什麼。', reply: '「懂了懂了。」', replyMood: 'neutral' },
        { id: 'c', text: '「我再講一次重點給您聽。」', quality: 'ok', feedback: '重複說明有幫助，但仍不知道病人理解了什麼。', reply: '「好……」', replyMood: 'neutral' },
      ],
    },
    close: {
      prompt: '步驟 7：結束衛教。',
      patientLine: '「好，這樣我知道了。」',
      options: [
        { id: 'a', text: '「我把三個重點寫在藥袋上了：早上一顆、不要自己停、量血壓記下來。兩週後回診。如果胸口痛、一邊手腳沒力或講話不清楚，要馬上就醫。還有想問的嗎？」', quality: 'best', feedback: '書面重點＋追蹤＋安全網＋最後提問。', reply: '「沒有了，謝謝你講得這麼清楚。」', replyMood: 'relieved' },
        { id: 'b', text: '「好，兩週後見。」', quality: 'ok', feedback: '有追蹤，但缺少書面重點與安全網。', reply: '「好。」', replyMood: 'neutral' },
        { id: 'c', text: '「藥袋上都有寫，自己看就好。」', quality: 'poor', feedback: '把理解的責任丟給病人；年長者可能看不清楚或看不懂。', reply: '「喔……」', replyMood: 'confused' },
      ],
    },
  },
  restatements: {
    plain: [
      { id: 'p1', text: '「每天早上起床吃一顆。」', error: null, explain: '正確。' },
      { id: 'p2', text: '「如果量起來血壓正常了，就可以先不要吃。」', error: 'stopWhenNormal', explain: '常見誤解：血壓正常是藥物在發揮作用，不代表可以停藥。' },
      { id: 'p3', text: '「每天量血壓寫在本子上，兩個禮拜後拿來給你們看。」', error: null, explain: '正確。' },
    ],
    jargon: [
      { id: 'j1', text: '「那個……降血壓的，一天吃一次吧？」', error: null, explain: '大致正確，但不確定。' },
      { id: 'j2', text: '「如果頭暈，就自己先停掉。」', error: 'stopWhenDizzy', explain: '誤解：頭暈時應先坐下休息並聯絡門診，不要自行停藥。' },
      { id: 'j3', text: '「血壓……要量嗎？我忘了。」', error: 'forgotBP', explain: '遺漏：每天量血壓並記錄。' },
    ],
    overload: [
      { id: 'o1', text: '「一天吃……兩次？還是一次？」', error: 'wrongFrequency', explain: '錯誤：每天早上一次。' },
      { id: 'o2', text: '「這個藥副作用很多，我有點怕，可能先不要吃好了。」', error: 'fearSideEffects', explain: '資訊過量引起恐懼，可能影響服藥意願。' },
      { id: 'o3', text: '「如果量起來血壓正常了，就可以先不要吃。」', error: 'stopWhenNormal', explain: '常見誤解：血壓正常不代表可以停藥。' },
    ],
  },
  reExplain: {
    stopWhenNormal: {
      prompt: '更正「血壓正常就可以不吃」：',
      options: [
        { id: 'a', text: '「這部分我剛剛沒講清楚。血壓正常，是因為藥正在發揮作用；自己停掉，血壓可能又會升高。要不要調整，我們兩週後看您的紀錄一起決定。」', quality: 'best', feedback: '承擔說明責任＋解釋原因＋把決定放在回診時一起做。' },
        { id: 'b', text: '「不行，不能停。」', quality: 'ok', feedback: '更正了，但沒有說明原因，病人不容易記住。' },
        { id: 'c', text: '「您剛剛沒在聽喔，我說過不能停。」', quality: 'poor', feedback: '責備病人，病人之後可能不敢說不懂。' },
      ],
    },
    stopWhenDizzy: {
      prompt: '更正「頭暈就自己停藥」：',
      options: [
        { id: 'a', text: '「這是我沒講清楚。如果頭暈，先坐下或躺下休息，起身時慢慢來；不要自己停藥，打電話到門診問我們怎麼處理。」', quality: 'best', feedback: '具體告訴病人頭暈時該怎麼做。' },
        { id: 'b', text: '「頭暈很正常，忍一下就好。」', quality: 'poor', feedback: '淡化症狀，也沒有給安全的處理方式。' },
      ],
    },
    forgotBP: {
      prompt: '補充「每天量血壓」：',
      options: [
        { id: 'a', text: '「還有一件事：每天早上吃藥前量一次血壓，寫在這本小本子上，兩週後帶來，我們一起看藥有沒有效。」', quality: 'best', feedback: '具體的時間、工具與目的。' },
        { id: 'b', text: '「血壓要記得量。」', quality: 'ok', feedback: '提醒了，但不夠具體。' },
      ],
    },
    wrongFrequency: {
      prompt: '更正「一天吃兩次」：',
      options: [
        { id: 'a', text: '「我剛剛講太多了，我們只記一個：每天早上吃一顆，就這樣。我幫您寫在藥袋上。」', quality: 'best', feedback: '縮減資訊、只講重點，並提供書面輔助。' },
        { id: 'b', text: '「是 QD，一天一次。」', quality: 'poor', feedback: '又用了術語。' },
      ],
    },
    fearSideEffects: {
      prompt: '回應「副作用很多，先不要吃」：',
      options: [
        { id: 'a', text: '「我剛剛一次講太多副作用，讓您擔心了。大部分人吃得很好；如果有不舒服，像是頭暈，先坐下休息並打電話給門診，我們會幫您處理，不要自己停藥。」', quality: 'best', feedback: '承認造成擔心、平衡說明，並給具體的處理方式。' },
        { id: 'b', text: '「副作用很少見啦，不用擔心。」', quality: 'ok', feedback: '想安撫是好的，但沒有告訴他不舒服時該怎麼做。' },
      ],
    },
  },
  finalRestatement: '「每天早上吃一顆，血壓正常也不能自己停；頭暈就先坐下，打電話問你們。每天量血壓寫下來，兩個禮拜後拿來。」',
  review: { status: 'draft', note: '一般衛教教學示範，不指定藥名與劑量；內容待臨床教師審核。' },
};

export const TEACHBACK_STEPS = ['了解已知', '日常語言說明', '避免資訊過量', '邀請提問', 'Teach-back', '找出誤解並再說明', '再確認與結束'];
