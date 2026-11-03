import type { DialogueScenario, ReviewMeta } from '../types';
import { LOOK } from '../data/looks';
import { cue, endNode, ev, node, opt } from './build';

const DRAFT: ReviewMeta = { status: 'draft', note: '原創教學情境（非正式考題、非 SP 劇本），待臨床教師審核。' };
const LIC = { publicApproved: true, note: '本平台原創教學示範情境，非正式考題。' };

function vp(look: (typeof LOOK)[keyof typeof LOOK], fullName: string, background: string, ice: DialogueScenario['patient']['ice'], baselineMood: DialogueScenario['patient']['baselineMood']) {
  return { ...look, fullName, background, ice, baselineMood };
}

/**
 * Game 2：同理心對話劇場（四種情緒）
 * 每一幕兩個回合：第二回合的病人反應取決於第一回合的回應（建立連結或情緒升高後修復）。
 */
export const THEATER_SCENES: DialogueScenario[] = [
  {
    id: 'th-anxious',
    code: 'SCENE 1',
    emotion: 'anxious',
    title: '焦慮：明天的檢查',
    summary: '吳小姐明天要做第一次胃鏡，來門診確認注意事項，坐立不安。',
    patient: vp(LOOK.youngF, '吳怡君', '29 歲上班族，明天第一次做胃鏡。', { ideas: '胃鏡會很痛、很可怕', concerns: '怕檢查出不好的東西，也怕做的時候失控', expectations: '希望有人告訴她會怎麼進行' }, 'anxious'),
    candidateBrief: ['你是門診實習醫師，吳小姐明天要做胃鏡，來確認注意事項。'],
    tasks: ['辨識情緒線索並回應'],
    timeLimitSec: 180,
    startNode: 't1',
    nodes: {
      t1: node({
        dialogueId: 't1',
        stage: 'respond',
        message: '「醫師，我明天要做胃鏡……我查了網路，有人說會吐到不行，我昨天整晚都睡不著。」',
        mood: 'anxious',
        emotionCues: [cue('verbal', '「整晚都睡不著」'), cue('nonverbal', '一直摳指甲、說話很快'), cue('context', '第一次做侵入性檢查，看了網路經驗談')],
        task: '回應吳小姐的情緒',
        communicationSkills: ['NURSE', '情緒線索'],
        feedbackRules: { guidedHint: ['她說了一個很具體的感受。', '先回應「睡不著」背後的情緒，再提供資訊。', '試試：「聽起來您很緊張……」＋邀請她多說。'], why: '焦慮時病人聽不進資訊，先讓她感到被理解。' },
        responseOptions: [
          opt({ id: 'a', text: '「第一次做胃鏡，會緊張到睡不著是很正常的。您最擔心的是哪個部分？」', quality: 'best', skills: ['NURSE-U', 'NURSE-E'], evidence: [ev('emotionRecognition', 'shown', '察覺「睡不著」背後的焦慮'), ev('empathy', 'shown', '理解＋探索')], feedback: 'Understanding＋Exploring：讓她知道緊張是正常的，並邀請她說出具體擔心。', reply: '「我怕做到一半一直吐、不能呼吸……還有，萬一真的檢查出什麼……」', replyMood: 'worried', setFlags: ['connected'] }),
          opt({ id: 'b', text: '「網路上的經驗不準啦，每個人都做過，沒那麼可怕。」', quality: 'poor', skills: ['錯誤保證'], evidence: [ev('empathy', 'missed', '否定病人的感受與資訊來源')], feedback: '否定她查到的資訊，也沒有回應她的焦慮。她會覺得自己的擔心被看輕。', reply: '「可是她們都說很痛苦啊……」（音量變大）', replyMood: 'upset', setFlags: ['escalated'] }),
          opt({ id: 'c', text: '「我先跟您講一下注意事項：前一天晚上十點後禁食……」', quality: 'ok', skills: ['資訊提供'], evidence: [ev('emotionRecognition', 'missed', '直接進入衛教，沒有回應焦慮')], feedback: '資訊是需要的，但她現在太焦慮，可能記不住。先回應情緒會更有效。', reply: '「嗯……」（沒有在聽，一直看手機上的文章）', replyMood: 'anxious', setFlags: ['skipped'] }),
        ],
        nextNodeConditions: [{ to: 't2' }],
      }),
      t2: node({
        dialogueId: 't2',
        stage: 'respond',
        message: '「我怕做到一半一直吐、不能呼吸……還有，萬一真的檢查出什麼……」',
        mood: 'worried',
        variants: [
          { when: { any: ['escalated'] }, message: '「你們醫生都說不可怕，可是又不是你們在做！」（雙手抱胸）', mood: 'upset', emotionCues: [cue('verbal', '「又不是你們在做」'), cue('nonverbal', '雙手抱胸、音量變大')] },
          { when: { any: ['skipped'] }, message: '「醫師……對不起，你剛剛說幾點以後不能吃？我腦袋一片空白。」', mood: 'confused', emotionCues: [cue('verbal', '「腦袋一片空白」'), cue('nonverbal', '眼神飄移')] },
        ],
        emotionCues: [cue('verbal', '「不能呼吸」「萬一檢查出什麼」'), cue('nonverbal', '聲音發抖')],
        task: '繼續回應，並適時提供資訊',
        communicationSkills: ['NURSE', '修復關係', '分段說明'],
        feedbackRules: { guidedHint: ['她的情緒仍然很強。', '如果剛剛的回應讓她更不安，先承認並修復。', '「您說得對，做檢查的是您……」'], why: '情緒升高時，承認與修復比繼續說服更有效。' },
        responseOptions: [
          opt({ id: 'a', text: '「您說得對，要做檢查的是您。可以跟我說說，您最怕的是哪個時刻？我們一起看看有什麼方法可以讓您舒服一點。」', quality: 'best', skills: ['NURSE-R', 'NURSE-E', 'NURSE-S', '修復'], evidence: [ev('empathy', 'shown', '承認病人的觀點並提供支持')], feedback: '承認＋探索＋支持：把焦點放回她身上，並準備提供具體資訊。', reply: '「……就是管子放進去的時候。如果真的很難受可以停嗎？」', replyMood: 'worried' }),
          opt({ id: 'b', text: '「擔心吐和擔心結果，這兩件事都讓您很不安。我們一件一件來：先說檢查時會怎麼幫您，結果的部分等報告出來我們再一起看。」', quality: 'best', skills: ['NURSE-N', 'NURSE-S', '分段說明'], evidence: [ev('empathy', 'shown', '命名兩種擔心並提供支持'), ev('clarity', 'shown', '把資訊分段')], feedback: '命名＋支持，並把資訊分段，讓她知道接下來會發生什麼。', reply: '「好……那可以先說檢查的時候嗎？」', replyMood: 'calm' }),
          opt({ id: 'c', text: '「放輕鬆就好了，大家都是這樣過來的。」', quality: 'poor', skills: ['淡化情緒'], evidence: [ev('empathy', 'missed', '淡化情緒')], feedback: '「放輕鬆」是要求，不是同理；病人會更覺得不被理解。', reply: '「……」（沉默，低頭看手機）', replyMood: 'upset' }),
        ],
        nextNodeConditions: [{ to: 'end' }],
      }),
      end: endNode('end', 'respond', '（場景結束）', 'neutral'),
    },
    demoPath: [],
    license: LIC,
    review: DRAFT,
  },
  {
    id: 'th-angry',
    code: 'SCENE 2',
    emotion: 'angry',
    title: '生氣：等了兩個小時',
    summary: '李先生等了兩個小時，才發現抽血單沒有開到，非常生氣。',
    patient: vp(LOOK.midM, '李志明', '58 歲，請假來回診，等了兩小時後被告知要重新抽血。', { ideas: '醫院流程很亂、沒有人在乎他的時間', concerns: '下午要回去上班，又要再請假', expectations: '有人承認錯誤並幫他快點處理' }, 'angry'),
    candidateBrief: ['你是門診實習醫師，李先生剛被告知抽血單漏開，需要重新抽血。'],
    tasks: ['回應病人的不滿，並一起找下一步'],
    timeLimitSec: 180,
    startNode: 't1',
    nodes: {
      t1: node({
        dialogueId: 't1',
        stage: 'respond',
        message: '「我等了兩個小時，現在才跟我說單子沒開？你們到底在做什麼！我下午還要上班！」',
        mood: 'angry',
        emotionCues: [cue('verbal', '「你們到底在做什麼」'), cue('nonverbal', '站著不坐下、指著時鐘'), cue('context', '請假來看診、等候兩小時')],
        task: '回應李先生的憤怒',
        communicationSkills: ['NURSE', '道歉', '不防衛'],
        feedbackRules: { guidedHint: ['他的生氣有合理的原因。', '先承認事實與情緒，不要急著解釋或辯解。', '「讓您等了兩個小時，真的很抱歉……」'], why: '生氣的病人需要先被聽見；解釋原因放在之後。' },
        responseOptions: [
          opt({ id: 'a', text: '「讓您等了兩個小時，結果還要重新抽血，換作是我也會很生氣。真的很抱歉。」', quality: 'best', skills: ['NURSE-N', 'NURSE-U', '道歉'], evidence: [ev('emotionRecognition', 'shown', '承認憤怒的合理性'), ev('empathy', 'shown', '理解＋真誠道歉')], feedback: '承認事實與情緒並道歉，不防衛。', reply: '「……（坐下）我不是要罵你，只是我真的趕時間。」', replyMood: 'worried', setFlags: ['connected'] }),
          opt({ id: 'b', text: '「先生，請您冷靜一點，這邊還有其他病人。」', quality: 'poor', skills: ['要求冷靜'], evidence: [ev('empathy', 'missed', '要求病人冷靜，忽略憤怒原因')], feedback: '要求冷靜常讓憤怒升高；他的不滿沒有被承認。', reply: '「冷靜？換你等兩個小時看看！」', replyMood: 'angry', setFlags: ['escalated'] }),
          opt({ id: 'c', text: '「今天病人比較多，抽血單是另一個單位開的，不是我們這邊。」', quality: 'poor', skills: ['解釋／防衛'], evidence: [ev('empathy', 'missed', '以解釋與推責回應情緒')], feedback: '先解釋原因或推給別的單位，會像在辯解。', reply: '「所以是我的錯嗎？我不管是誰開的！」', replyMood: 'angry', setFlags: ['escalated'] }),
        ],
        nextNodeConditions: [{ to: 't2' }],
      }),
      t2: node({
        dialogueId: 't2',
        stage: 'engage',
        message: '「……我不是要罵你，只是我真的趕時間。現在到底要怎麼辦？」',
        mood: 'worried',
        variants: [{ when: { any: ['escalated'] }, message: '「我要客訴！你們每次都這樣！」（聲音更大）', mood: 'angry', emotionCues: [cue('verbal', '「每次都這樣」'), cue('nonverbal', '聲音更大，周圍病人在看')] }],
        emotionCues: [cue('verbal', '「我真的趕時間」'), cue('nonverbal', '坐下，看手錶')],
        task: '修復或推進：一起找出可行的下一步',
        communicationSkills: ['修復', '共同解決問題'],
        feedbackRules: { guidedHint: ['他想知道接下來怎麼辦。', '如果他更生氣，先承認「每次都這樣」背後的經驗。', '提供具體、可行的選項，讓他參與決定。'], why: '情緒被承認後，病人需要的是具體的解決方式。' },
        responseOptions: [
          opt({ id: 'a', text: '「您說『每次都這樣』，聽起來之前也有不好的經驗，這次又讓您失望了。我現在就去確認能不能讓您優先抽血，您希望我也幫您寫請假證明嗎？」', quality: 'best', skills: ['NURSE-E', 'NURSE-S', '具體行動'], evidence: [ev('empathy', 'shown', '回應「每次都這樣」並提供具體支持'), ev('engagement', 'shown', '提供選擇')], feedback: '回應情緒線索＋具體可行的行動＋讓病人選擇。', reply: '「……好，如果可以快一點就好。證明也麻煩你。」', replyMood: 'neutral' }),
          opt({ id: 'b', text: '「我現在就去確認能不能讓您優先抽血，大概 10 分鐘內給您答覆，這樣可以嗎？」', quality: 'best', skills: ['具體行動', '設定期待'], evidence: [ev('engagement', 'shown', '提出具體方案並徵詢同意')], feedback: '具體、有時間的承諾，並徵詢他的同意。', reply: '「好，那你快一點。」', replyMood: 'neutral' }),
          opt({ id: 'c', text: '「客訴的話要到一樓服務台。」', quality: 'poor', skills: ['轉介／推開'], evidence: [ev('empathy', 'missed', '把病人推開，問題沒有被處理')], feedback: '把病人推給其他單位，問題沒有被處理。', reply: '「好，我就去！」（轉身離開）', replyMood: 'angry' }),
        ],
        nextNodeConditions: [{ to: 'end' }],
      }),
      end: endNode('end', 'engage', '（場景結束）', 'neutral'),
    },
    demoPath: [],
    license: LIC,
    review: DRAFT,
  },
  {
    id: 'th-afraid',
    code: 'SCENE 3',
    emotion: 'afraid',
    title: '害怕：手術前',
    summary: '王伯伯被建議開刀，說話很小聲，問了幾次「會不會醒不過來」。',
    patient: vp(LOOK.oldM, '王福來', '71 歲，外科建議手術，第一次接受全身麻醉。', { ideas: '年紀大了麻醉很危險', concerns: '醒不過來，太太一個人怎麼辦', expectations: '希望知道風險，也希望有人陪他做決定' }, 'worried'),
    candidateBrief: ['你是實習醫師，外科醫師已建議王伯伯接受手術，他想再跟你聊聊。'],
    tasks: ['辨識害怕並回應，不給錯誤保證'],
    timeLimitSec: 180,
    startNode: 't1',
    nodes: {
      t1: node({
        dialogueId: 't1',
        stage: 'respond',
        message: '「醫師……我這個年紀，麻醉下去，會不會就醒不過來了？」（聲音很小）',
        mood: 'worried',
        emotionCues: [cue('verbal', '「會不會就醒不過來」'), cue('nonverbal', '聲音很小、手在發抖'), cue('context', '高齡、第一次全身麻醉')],
        task: '回應王伯伯的害怕',
        communicationSkills: ['NURSE', '不給錯誤保證'],
        feedbackRules: { guidedHint: ['這是很深的恐懼。', '不要立刻說「不會啦」；你無法保證。', '命名害怕，並探索背後的原因。'], why: '錯誤保證會破壞信任；探索害怕才能找到真正的擔心。' },
        responseOptions: [
          opt({ id: 'a', text: '「這是一個很重要、也很讓人害怕的問題。伯伯，可以跟我說說，您最放不下的是什麼嗎？」', quality: 'best', skills: ['NURSE-N', 'NURSE-E'], evidence: [ev('emotionRecognition', 'shown', '辨識深層的害怕'), ev('empathy', 'shown', '命名＋探索')], feedback: '承認問題的重要性，並探索害怕背後的牽掛。', reply: '「我太太身體不好……如果我怎麼了，她一個人怎麼辦。」', replyMood: 'worried', setFlags: ['connected'] }),
          opt({ id: 'b', text: '「不會啦，現在麻醉很安全，您放心。」', quality: 'poor', skills: ['錯誤保證'], evidence: [ev('empathy', 'missed', '以保證取代理解'), ev('safety', 'missed', '無法保證的承諾')], safetyFlags: ['給予無法保證的承諾（「不會啦」）'], feedback: '你無法保證「不會」；錯誤保證也讓病人不敢說出真正的擔心。', reply: '「……喔，好。」（仍然低著頭）', replyMood: 'worried', setFlags: ['closed'] }),
          opt({ id: 'c', text: '「全身麻醉的嚴重併發症機率是……」（開始說明統計數字）', quality: 'ok', skills: ['資訊提供'], evidence: [ev('emotionRecognition', 'missed', '以統計回應情緒')], feedback: '資訊在之後很重要，但此刻他需要的是被理解；數字可能讓他更害怕。', reply: '「……」（看起來更緊張）', replyMood: 'anxious', setFlags: ['closed'] }),
        ],
        nextNodeConditions: [{ to: 't2' }],
      }),
      t2: node({
        dialogueId: 't2',
        stage: 'engage',
        message: '「我太太身體不好……如果我怎麼了，她一個人怎麼辦。」',
        mood: 'worried',
        variants: [{ when: { any: ['closed'] }, message: '「……那我回去再想想好了。」（準備起身）', mood: 'worried', emotionCues: [cue('verbal', '「回去再想想」'), cue('nonverbal', '準備起身、迴避眼神')] }],
        emotionCues: [cue('verbal', '「她一個人怎麼辦」'), cue('context', '照顧者角色')],
        task: '支持，並把決定與病人的牽掛連結',
        communicationSkills: ['NURSE-S', '共享決策'],
        feedbackRules: { guidedHint: ['他的害怕和太太有關。', '如果他想離開，邀請他留下來說說。', '提供支持，並讓麻醉科與家人參與。'], why: '把病人的牽掛納入計畫，決定才會是他自己的。' },
        responseOptions: [
          opt({ id: 'a', text: '「您一直在照顧太太，難怪最放不下的是她。手術前我們可以安排麻醉科醫師跟您和家人詳細說明風險，也一起想想太太這段時間的照顧，您覺得好嗎？」', quality: 'best', skills: ['NURSE-R', 'NURSE-S', 'SDM'], evidence: [ev('empathy', 'shown', '尊重照顧者角色並支持'), ev('engagement', 'shown', '邀請家人與專科參與決定')], feedback: '尊重＋支持＋具體的下一步，讓決定與他的牽掛連結。', reply: '「好……有人可以跟我太太一起講，我比較放心。」', replyMood: 'calm' }),
          opt({ id: 'b', text: '「伯伯，等一下。在您回去想之前，可以跟我說說，您最擔心的是什麼嗎？」', quality: 'best', skills: ['NURSE-E', '修復'], evidence: [ev('emotionRecognition', 'shown', '察覺迴避，邀請留下來說')], feedback: '察覺迴避並修復，給病人說出擔心的機會。', reply: '「……其實我是怕我太太沒人照顧。」', replyMood: 'worried' }),
          opt({ id: 'c', text: '「那您回去考慮好再告訴我們。」', quality: 'poor', skills: ['結束對話'], evidence: [ev('empathy', 'missed', '讓病人帶著未被處理的害怕離開')], feedback: '病人帶著未說出的害怕離開，決定可能被延誤。', reply: '「好……」（離開）', replyMood: 'worried' }),
        ],
        nextNodeConditions: [{ to: 'end' }],
      }),
      end: endNode('end', 'engage', '（場景結束）', 'neutral'),
    },
    demoPath: [],
    license: LIC,
    review: DRAFT,
  },
  {
    id: 'th-sad',
    code: 'SCENE 4',
    emotion: 'sad',
    title: '悲傷：一個人回診',
    summary: '黃奶奶來量血壓回診，提到先生上個月過世，說著說著就哭了。',
    patient: vp(LOOK.oldF, '黃秀英', '78 歲，高血壓規則回診，先生上個月過世。', { ideas: '血壓不重要了', concerns: '一個人生活、沒有人說話', expectations: '沒有特別的期待，只是照常回診' }, 'sad'),
    candidateBrief: ['你是門診實習醫師，黃奶奶來高血壓回診。'],
    tasks: ['回應悲傷，給予空間'],
    timeLimitSec: 180,
    startNode: 't1',
    nodes: {
      t1: node({
        dialogueId: 't1',
        stage: 'respond',
        message: '「血壓喔……最近都沒在量。我先生上個月走了，以前都是他幫我量的……」（眼眶泛紅）',
        mood: 'sad',
        emotionCues: [cue('verbal', '「以前都是他幫我量的」'), cue('nonverbal', '眼眶泛紅、聲音哽咽'), cue('context', '喪偶一個月、獨居')],
        task: '回應黃奶奶的悲傷',
        communicationSkills: ['NURSE', '沉默與陪伴'],
        feedbackRules: { guidedHint: ['血壓不是她現在最重要的事。', '先停下來，給她空間。', '命名或表達遺憾，然後安靜陪伴。'], why: '悲傷時最需要的是被陪伴，而不是被導回正題。' },
        responseOptions: [
          opt({ id: 'a', text: '（停下來，遞上面紙）「奶奶，很遺憾聽到爺爺走了。這一個月一定很不容易。」（安靜等待）', quality: 'best', skills: ['NURSE-N', 'NURSE-U', '沉默'], evidence: [ev('emotionRecognition', 'shown', '察覺悲傷並停下來'), ev('empathy', 'shown', '表達遺憾並給予空間')], feedback: '表達遺憾、承認處境，並用沉默陪伴。', reply: '「……謝謝你。（擦眼淚）家裡突然好安靜。」', replyMood: 'sad', setFlags: ['connected'] }),
          opt({ id: 'b', text: '「節哀順變。那我們先量一下血壓好了。」', quality: 'poor', skills: ['轉移話題'], evidence: [ev('empathy', 'missed', '一句客套後立即轉回正題')], feedback: '客套後立刻回到正題，她會覺得悲傷不該在這裡出現。', reply: '「……好。」（低頭，不再說話）', replyMood: 'sad', setFlags: ['closed'] }),
          opt({ id: 'c', text: '「奶奶不要難過，爺爺也會希望您好好照顧自己。」', quality: 'ok', skills: ['安慰'], evidence: [ev('empathy', 'missed', '「不要難過」否定了悲傷')], feedback: '出於善意，但「不要難過」在要求她停止悲傷。先允許悲傷存在。', reply: '「我知道……可是……」（哭得更厲害）', replyMood: 'sad', setFlags: ['closed'] }),
        ],
        nextNodeConditions: [{ to: 't2' }],
      }),
      t2: node({
        dialogueId: 't2',
        stage: 'engage',
        message: '「……謝謝你。家裡突然好安靜。」',
        mood: 'sad',
        variants: [{ when: { any: ['closed'] }, message: '（安靜地坐著，沒有再說話）', mood: 'sad', emotionCues: [cue('nonverbal', '沉默、迴避眼神'), cue('context', '話題被轉開後不再分享')] }],
        emotionCues: [cue('verbal', '「家裡突然好安靜」'), cue('context', '獨居、失去照顧者')],
        task: '探索支持系統，再回到血壓的照顧',
        communicationSkills: ['NURSE-E', '支持系統', '共同計畫'],
        feedbackRules: { guidedHint: ['她現在一個人生活。', '如果她沉默了，可以溫和地重新打開話題。', '探索支持系統，再一起想血壓怎麼量。'], why: '照顧悲傷的病人，也包括了解她的生活與支持，計畫才可行。' },
        responseOptions: [
          opt({ id: 'a', text: '「現在家裡平常有誰會來陪您，或可以幫忙的人嗎？量血壓的部分，我們也一起想個您自己做得到的方法。」', quality: 'best', skills: ['NURSE-E', 'NURSE-S', '共同計畫'], evidence: [ev('exploring', 'shown', '探索支持系統'), ev('engagement', 'shown', '一起擬定可行的計畫')], feedback: '探索支持系統，並把血壓照顧調整成她做得到的方式。', reply: '「女兒週末會回來……血壓計我不太會用，以前都是他弄的。」', replyMood: 'calm' }),
          opt({ id: 'b', text: '「奶奶，剛剛我好像太快把話題轉開了。爺爺的事，您願意多說一點嗎？」', quality: 'best', skills: ['修復', 'NURSE-E'], evidence: [ev('empathy', 'shown', '承認自己轉移話題並修復')], feedback: '承認並修復，讓她知道悲傷可以在這裡被說出來。', reply: '「……他以前每天早上都會幫我量血壓。」（開始說起先生）', replyMood: 'sad' }),
          opt({ id: 'c', text: '「血壓還是要每天量喔，不然會中風。」', quality: 'poor', skills: ['警告式衛教'], evidence: [ev('empathy', 'missed', '以警告取代支持')], feedback: '在悲傷時使用警告式衛教，會加重壓力與孤單感。', reply: '「……好。」', replyMood: 'sad' }),
        ],
        nextNodeConditions: [{ to: 'end' }],
      }),
      end: endNode('end', 'engage', '（場景結束）', 'neutral'),
    },
    demoPath: [],
    license: LIC,
    review: DRAFT,
  },
];

export const getScene = (id: string) => THEATER_SCENES.find((s) => s.id === id);
export const EMOTION_LABEL = { anxious: { label: '焦慮', icon: '😰', color: '#f59e0b' }, angry: { label: '生氣', icon: '😠', color: '#dc2626' }, afraid: { label: '害怕', icon: '😨', color: '#7c3aed' }, sad: { label: '悲傷', icon: '😢', color: '#0ea5e9' } } as const;
