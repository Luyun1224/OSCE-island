import type { CommunicationLesson, ReviewMeta } from '../types';
import { LOOK } from './looks';

const DRAFT: ReviewMeta = { status: 'draft', note: 'CARE-6 為本平台自行整理之教學架構（參考 Calgary–Cambridge 指引），非官方西醫師 OSCE 國考 SOP；內容待臨床教師審核。' };

/**
 * CARE-6 六個單元
 * 同理心不是單一步驟：每個單元都說明同理心在該階段如何展現（empathyNote）。
 */
export const CARE6: CommunicationLesson[] = [
  {
    id: 'connect',
    order: 1,
    letter: 'C',
    title: '建立連結',
    englishTitle: 'Connect',
    icon: '🤝',
    color: '#f97362',
    goal: '讓病人知道你是誰、為什麼來，並感到被尊重與安全。',
    empathyNote: '同理從第一句話開始：注意病人的姿勢與表情，先關心他現在是否舒適，再進入正題。',
    lessons: [
      {
        title: '開場的四件事',
        body: '開場不是形式，而是讓病人願意說出真正擔心的基礎。',
        bullets: ['問候並自我介紹（姓名、身分）', '確認病人身分與希望的稱呼', '說明這次談話的目的與大約時間', '確認環境：隱私、病人是否舒適、是否希望家屬在場'],
      },
      {
        title: '先看見人，再處理問題',
        body: '病人坐立不安、緊握檢查單、眼眶泛紅，都是情緒線索。開場時簡短回應這些線索，比急著講正事更能建立信任。',
        good: '「我看您一直拿著報告，是不是有點擔心？我們等一下一起看。」',
        bad: '（直接低頭看電腦）「好，報告出來了，我跟你講結果。」',
      },
    ],
    compare: [
      { context: '病人進入診間', good: '「林小姐您好，我是今天負責看診的實習醫師陳醫師。想先跟您確認一下全名和出生年月日，可以嗎？」', poor: '「林小姐喔？坐。」', why: '自我介紹與身分確認同時建立信任與病人安全；省略會讓病人不知道在跟誰說話。' },
      { context: '說明談話目的', good: '「今天大約 10 分鐘，我們會一起看檢查結果，也討論接下來怎麼做。您有特別想先問的嗎？」', poor: '「我很快講一下就好。」', why: '說明目的與時間能降低不確定感，並邀請病人提出自己的議程。' },
    ],
    activities: [
      {
        kind: 'choice',
        id: 'care-connect-a1',
        title: '短情境：第一次見面',
        intro: '你是實習醫師，要和一位第一次見面的病人談話。選擇你的說法，看看病人的反應。',
        patient: LOOK.midF,
        steps: [
          {
            id: 's1',
            prompt: '陳太太走進診間，在椅子邊緣坐下，雙手握著包包。你的第一句話：',
            mood: 'anxious',
            options: [
              { id: 'a', text: '「陳太太您好，我是實習醫師王醫師，今天由我先跟您聊聊。想先確認您的全名和出生年月日？」', quality: 'best', feedback: '自我介紹＋身分確認，清楚又安全。', reply: '「好，我是陳美玲，民國六十三年……」', replyMood: 'neutral' },
              { id: 'b', text: '「您好，請坐。椅子可以坐進來一點，比較舒服。我是實習醫師王醫師。」', quality: 'best', feedback: '先照顧病人的舒適也是很好的開場，接著別忘了確認身分。', reply: '（往椅背坐進去）「謝謝醫師。」', replyMood: 'calm' },
              { id: 'c', text: '「哪裡不舒服？」', quality: 'poor', feedback: '沒有自我介紹與身分確認，病人不知道你是誰，也可能認錯病人。', reply: '「呃……你是醫師嗎？」', replyMood: 'confused' },
            ],
            takeaway: '開場可以有不同順序，但自我介紹、確認身分、讓病人感到舒適都不能省略。',
          },
          {
            id: 's2',
            prompt: '接下來，你想讓陳太太知道這次談話怎麼進行：',
            mood: 'neutral',
            options: [
              { id: 'a', text: '「今天大約 10 分鐘，我們會先聽聽您的狀況，再一起討論接下來的安排。您有沒有特別想先問的事？」', quality: 'best', feedback: '說明目的與時間，並邀請病人提出議程。', reply: '「其實我最想知道上次的報告……」', replyMood: 'worried' },
              { id: 'b', text: '「我們今天會談一下您的狀況。」', quality: 'ok', feedback: '有說明目的，但可以加上時間與邀請病人提出想討論的事。', reply: '「喔，好。」', replyMood: 'neutral' },
              { id: 'c', text: '「我先問完我的問題，你等一下再問。」', quality: 'poor', feedback: '把病人的需要往後推，病人可能因此不敢說出最在意的事。', reply: '「……好。」（低頭）', replyMood: 'upset' },
            ],
          },
        ],
      },
    ],
    takeaways: ['自我介紹＋確認身分＋說明目的', '注意舒適與隱私', '邀請病人說出今天最想討論的事'],
    tools: ['calgary'],
    review: DRAFT,
  },
  {
    id: 'assess',
    order: 2,
    letter: 'A',
    title: '評估需求與觀點',
    englishTitle: 'Assess',
    icon: '🔍',
    color: '#f59e0b',
    goal: '了解病人已經知道什麼、怎麼想、擔心什麼、期待什麼（ICE）。',
    empathyNote: '真誠的好奇就是同理：不急著糾正病人的想法，先理解他為什麼這樣想。',
    lessons: [
      {
        title: '先問，再說（Ask before tell）',
        body: '在說明之前，先了解病人已知的資訊與想法，才能從病人的起點開始說明，也能發現誤解。',
        bullets: ['「您目前對這個檢查了解多少？」', '「您自己覺得可能是什麼原因？」（Ideas）', '「您最擔心的是什麼？」（Concerns）', '「您希望今天能得到什麼幫助？」（Expectations）'],
      },
      {
        title: '開放式提問與等待',
        body: '開放式問題讓病人用自己的話說；問完後留一點沉默，病人常在這時說出真正的擔心。',
        good: '「可以多說一點您的擔心嗎？」（然後安靜等待）',
        bad: '「您擔心嗎？不擔心吧？」',
      },
    ],
    compare: [
      { context: '病人說「我上網查了一些」', good: '「您查到了什麼？我想知道您目前的想法。」', poor: '「網路上的不要看啦。」', why: '直接否定會讓病人覺得被批評，也錯失了解誤解的機會。' },
      { context: '了解期待', good: '「今天您最希望我們幫您解決哪一件事？」', poor: '「就照我說的做就好。」', why: '了解期待才能共同擬定計畫，避免雙方各說各話。' },
    ],
    activities: [
      {
        kind: 'choice',
        id: 'care-assess-a1',
        title: '短情境：病人的想法',
        intro: '王伯伯被告知血糖偏高，需要開始調整生活與藥物。說明之前，先了解他的觀點。',
        patient: LOOK.oldM,
        steps: [
          {
            id: 's1',
            prompt: '在開始說明之前，你想先了解王伯伯的想法：',
            patientLine: '「醫師說我血糖高，我也不知道怎麼辦。」',
            mood: 'worried',
            options: [
              { id: 'a', text: '「王伯伯，您之前有聽過血糖高大概是怎麼一回事嗎？」', quality: 'best', feedback: '先了解病人已知的資訊（Ask before tell）。', reply: '「我隔壁的老張也有，後來腳都爛了……」', replyMood: 'anxious' },
              { id: 'b', text: '「您自己覺得血糖為什麼會高呢？」', quality: 'best', feedback: '探索病人的想法（Ideas），同樣是好的起點。', reply: '「應該是我愛吃甜的吧……我隔壁的老張也有，後來腳都爛了。」', replyMood: 'anxious' },
              { id: 'c', text: '「血糖高就是糖尿病，空腹血糖大於 126 就算。」', quality: 'poor', feedback: '直接給專業定義，沒有了解病人的起點，也錯過他的擔心。', reply: '「喔……（聽不太懂）」', replyMood: 'confused' },
            ],
            takeaway: '先問、再說：病人的起點決定你要從哪裡開始說明。',
          },
          {
            id: 's2',
            prompt: '王伯伯提到鄰居「腳都爛了」。你接著：',
            mood: 'anxious',
            options: [
              { id: 'a', text: '「聽起來您很擔心自己也會變成那樣。可以多說一點您擔心的部分嗎？」', quality: 'best', feedback: '辨識並探索病人的擔心（Concerns）。', reply: '「對啊，我一個人住，怕以後不能走……」', replyMood: 'worried' },
              { id: 'b', text: '「那是他沒控制好，您不會啦。」', quality: 'poor', feedback: '急著保證，沒有了解擔心的內容，也可能是錯誤保證。', reply: '「真的嗎……」（仍然皺眉）', replyMood: 'worried' },
              { id: 'c', text: '「我們先不談那個，先講飲食。」', quality: 'poor', feedback: '轉移話題會讓病人覺得擔心不被重視。', reply: '「喔。」', replyMood: 'upset' },
            ],
          },
        ],
      },
    ],
    takeaways: ['先了解病人已知什麼（Ask before tell）', '探索 ICE：想法、擔心、期待', '開放式提問後留白等待'],
    tools: ['calgary', 'spikes'],
    review: DRAFT,
  },
  {
    id: 'respond',
    order: 3,
    letter: 'R',
    title: '回應情緒',
    englishTitle: 'Respond',
    icon: '💗',
    color: '#e11d48',
    goal: '辨識情緒線索，並以同理回應，而不是急著解決或保證。',
    empathyNote: '本階段是同理心最集中的地方，但不是唯一的地方。先回應情緒，病人才聽得進資訊。',
    lessons: [
      {
        title: '辨識情緒線索',
        body: '情緒很少直接說出來，常藏在語言、非語言與情境中。',
        bullets: ['語言：「我很怕」「我不知道怎麼辦」「你們都這樣」', '非語言：沉默、哭泣、握拳、避免眼神接觸', '情境：等待很久、家族病史、經濟壓力、照顧責任'],
      },
      {
        title: 'NURSE：回應情緒的五種方式',
        body: '不需要五個都用，選擇適合當下的一兩個即可。',
        bullets: ['Naming 命名：「聽起來您很擔心。」', 'Understanding 理解：「換作是我也會很不安。」', 'Respecting 尊重：「您一直很努力照顧家人。」', 'Supporting 支持：「接下來我們會一起處理。」', 'Exploring 探索：「可以多說一點您擔心的部分嗎？」'],
      },
    ],
    compare: [
      { context: '病人說「我好怕是癌症」', good: '「聽起來您真的很害怕。可以跟我說說，是什麼讓您特別擔心嗎？」', poor: '「不會啦，不要想太多。」', why: '未經證實的保證可能錯誤，也讓病人覺得擔心被打發。命名＋探索讓病人被理解。' },
      { context: '病人抱怨等太久', good: '「讓您等了一個多小時，真的很抱歉，換作是我也會很煩躁。」', poor: '「今天病人很多，大家都在等。」', why: '先承認情緒與事實，再說明原因；直接解釋會像在辯解。' },
    ],
    activities: [
      {
        kind: 'choice',
        id: 'care-respond-a1',
        title: '短情境：說不出口的擔心',
        intro: '張先生來回診，看起來心神不寧。練習辨識並回應情緒。',
        patient: LOOK.youngM,
        steps: [
          {
            id: 's1',
            prompt: '張先生一直抖腳，看著手機。他說：',
            patientLine: '「醫師，我等一下還要回公司……我太太最近要生了，我不能出事。」',
            mood: 'anxious',
            options: [
              { id: 'a', text: '「太太快生了，又要顧工作，聽起來壓力真的很大。您最擔心的是什麼？」', quality: 'best', feedback: 'Naming＋Exploring：命名情緒並探索擔心。', reply: '「我怕如果要住院，家裡沒人可以照顧她……」', replyMood: 'worried' },
              { id: 'b', text: '「您一直很照顧家人。我們今天會把需要做的事講清楚，讓您好安排。」', quality: 'best', feedback: 'Respecting＋Supporting：肯定與支持也是適當的回應。', reply: '「謝謝……其實我最怕的是要住院。」', replyMood: 'calm' },
              { id: 'c', text: '「那我們快一點。請問您哪裡不舒服？」', quality: 'poor', feedback: '忽略了情緒線索，病人的真正擔心沒有被聽見。', reply: '「就……胸口悶悶的。」（仍然抖腳）', replyMood: 'anxious' },
            ],
            takeaway: '同一個情緒可以有不同的適當回應；重點是讓病人感到被理解。',
          },
        ],
      },
    ],
    takeaways: ['先回應情緒，再提供資訊', '避免未經證實的保證', 'NURSE 不必全用，選適合的一兩個'],
    tools: ['nurse'],
    review: DRAFT,
  },
  {
    id: 'explain',
    order: 4,
    letter: 'E',
    title: '清楚說明',
    englishTitle: 'Explain',
    icon: '💡',
    color: '#0ea5e9',
    goal: '依病人想知道的程度，分段、用日常語言說明，並誠實面對不確定性。',
    empathyNote: '說明時的同理：注意病人是否跟得上、是否需要停下來；壞消息之前先預告。',
    lessons: [
      {
        title: '分段與確認（Chunk and check）',
        body: '一次說一小段，停下來確認病人的理解或感受，再繼續。',
        bullets: ['先問病人想知道多少（資訊偏好）', '用日常語言，避免術語或立刻解釋術語', '一次 2–3 個重點', '停下來：「到這裡有沒有什麼想問的？」'],
      },
      {
        title: '誠實面對不確定性',
        body: '結果未明時，不給錯誤保證，也不用嚇人的數字；說清楚「目前知道什麼、還不知道什麼、接下來怎麼確認」。',
        good: '「目前還不能確定是什麼，需要再做一個檢查才知道。我知道等待很難熬，我們會盡快安排。」',
        bad: '「應該沒事啦，大部分都是好的。」',
      },
    ],
    compare: [
      { context: '說明檢查結果', good: '「這次的照片有一個地方看得不夠清楚，所以需要再做一個比較仔細的檢查。」', poor: '「BI-RADS 0，需要 additional imaging。」', why: '術語讓病人無法理解，也容易造成更大的恐慌。' },
      { context: '病人問「會不會是癌症」', good: '「這是很重要的問題。目前的資訊還不能回答，下一個檢查就是為了弄清楚這件事。」', poor: '「不會啦。」', why: '不確定時給保證，若結果不好會失去信任，也是安全問題。' },
    ],
    activities: [
      {
        kind: 'choice',
        id: 'care-explain-a1',
        title: '短情境：說明一個需要追蹤的結果',
        intro: '吳小姐的抽血報告有一項需要追蹤。練習分段、清楚、誠實地說明。',
        patient: LOOK.youngF,
        steps: [
          {
            id: 's1',
            prompt: '在說明之前，你先：',
            patientLine: '「醫師，報告怎麼樣？」',
            mood: 'worried',
            options: [
              { id: 'a', text: '「報告大部分都正常，有一項需要再追蹤。您希望我先講重點，還是比較詳細地說明？」', quality: 'best', feedback: '先預告＋確認資訊偏好。', reply: '「先講重點好了。」', replyMood: 'neutral' },
              { id: 'b', text: '「我們一項一項看。第一項是白血球，正常值是……」', quality: 'ok', feedback: '逐項說明可能造成資訊過量，病人最在意的事被埋在細節裡。', reply: '「嗯……所以有問題嗎？」', replyMood: 'confused' },
              { id: 'c', text: '「有一項紅字，可能是肝的問題。」', quality: 'poor', feedback: '沒有預告也沒有脈絡，「紅字」「肝的問題」會引發不必要的恐慌。', reply: '「肝？很嚴重嗎？」', replyMood: 'anxious' },
            ],
          },
          {
            id: 's2',
            prompt: '說明完需要再追蹤後，你：',
            mood: 'neutral',
            options: [
              { id: 'a', text: '「到這裡我講得清楚嗎？您有沒有什麼想問的？」', quality: 'best', feedback: 'Chunk and check：停下來確認。', reply: '「那我要多久再來抽？」', replyMood: 'calm' },
              { id: 'b', text: '「我們先停一下。聽到要再追蹤，您現在的感覺怎麼樣？」', quality: 'best', feedback: '確認病人的感受，也是分段說明的好方式。', reply: '「有點緊張，不過還好。那我要多久再來抽？」', replyMood: 'calm' },
              { id: 'c', text: '「另外，膽固醇也偏高，飲食要注意，還有運動、睡眠……」', quality: 'poor', feedback: '一次加入太多新資訊，病人無法吸收。', reply: '「……」（表情茫然）', replyMood: 'confused' },
            ],
          },
        ],
      },
    ],
    takeaways: ['先確認病人想知道多少', '分段、日常語言、一次 2–3 個重點', '誠實面對不確定，不給錯誤保證'],
    tools: ['spikes', 'teachback'],
    review: DRAFT,
  },
  {
    id: 'engage',
    order: 5,
    letter: 'E',
    title: '病人參與',
    englishTitle: 'Engage',
    icon: '🧭',
    color: '#14b8a6',
    goal: '邀請病人參與決定，確認理解（Teach-back），一起擬定可行的下一步。',
    empathyNote: '尊重病人的價值觀與生活情境：計畫要對病人可行，而不只是醫學上正確。',
    lessons: [
      {
        title: '共享決策（SDM）三步驟',
        body: '當有不只一個合理選項時，和病人一起決定。',
        bullets: ['告知有選擇：「接下來有幾種做法」', '說明選項的好處與限制', '了解病人的偏好與生活考量，再一起決定'],
      },
      {
        title: 'Teach-back：確認理解',
        body: '「您懂了嗎？」通常只會得到「懂了」。請病人用自己的話說一次，才知道真正帶走了什麼。',
        good: '「為了確定我剛剛講得清楚，可以請您說說，回家後您會怎麼跟家人說明下一步嗎？」',
        bad: '「這樣清楚嗎？清楚吧？」',
      },
    ],
    compare: [
      { context: '安排下一步', good: '「下週二或週四都可以做檢查，哪一天比較方便您安排照顧孩子？」', poor: '「就排週二，到時候來。」', why: '把病人的生活考量納入計畫，執行率更高，也讓病人有掌控感。' },
      { context: '確認理解', good: '「請您用自己的話說說看，回家要注意什麼？」', poor: '「有問題嗎？沒問題就好。」', why: '封閉式確認無法發現誤解；teach-back 把責任放在「我有沒有說清楚」。' },
    ],
    activities: [
      {
        kind: 'choice',
        id: 'care-engage-a1',
        title: '短情境：一起決定下一步',
        intro: '李先生需要安排一項進一步檢查。練習讓病人參與並確認理解。',
        patient: LOOK.midM,
        steps: [
          {
            id: 's1',
            prompt: '說明完檢查目的後，你想讓李先生參與安排：',
            patientLine: '「我工作很忙，一定要做嗎？」',
            mood: 'worried',
            options: [
              { id: 'a', text: '「工作真的很難請假。這個檢查是為了確認原因，我們看看哪個時段對您最方便？」', quality: 'best', feedback: '理解病人考量，同時保持必要的醫療建議，並邀請參與。', reply: '「如果可以排早上，我可以先請半天。」', replyMood: 'calm' },
              { id: 'b', text: '「您擔心的是請假，還是檢查本身？」', quality: 'best', feedback: '先釐清病人的顧慮，再一起找方法。', reply: '「主要是請假……也有點怕痛。」', replyMood: 'worried' },
              { id: 'c', text: '「一定要做，不做出事我們不負責。」', quality: 'poor', feedback: '威脅式說法破壞信任，病人可能因此逃避。', reply: '「……」（雙手交叉）', replyMood: 'upset' },
            ],
          },
          {
            id: 's2',
            prompt: '最後，確認李先生帶走的訊息：',
            mood: 'neutral',
            options: [
              { id: 'a', text: '「為了確定我說清楚了，可以請您說說，接下來要做什麼、什麼時候做嗎？」', quality: 'best', feedback: 'Teach-back：請病人用自己的話復述。', reply: '「下週二早上來做檢查，前一天晚上十點後不要吃東西。」', replyMood: 'calm' },
              { id: 'b', text: '「這樣您懂了嗎？」', quality: 'poor', feedback: '封閉式確認，病人說「懂了」不代表真的理解。', reply: '「懂了懂了。」', replyMood: 'neutral' },
              { id: 'c', text: '「我把重點寫在這張單子上，您回去再看。」', quality: 'ok', feedback: '書面資料很有幫助，但仍需要當場確認理解。', reply: '「好，謝謝。」', replyMood: 'neutral' },
            ],
            takeaway: '病人說「我懂了」不算數；請他用自己的話說一次。',
          },
        ],
      },
    ],
    takeaways: ['有選項時一起決定（SDM）', '把病人的生活考量納入計畫', 'Teach-back：請病人用自己的話復述'],
    tools: ['teachback', 'calgary'],
    review: DRAFT,
  },
  {
    id: 'end',
    order: 6,
    letter: 'E',
    title: '摘要與結束',
    englishTitle: 'End',
    icon: '🏁',
    color: '#7c3aed',
    goal: '摘要重點、確認下一步與追蹤、說明何時需要提早就醫，並給病人最後提問的機會。',
    empathyNote: '結束時的同理：肯定病人的努力，讓病人知道之後有問題時可以找誰。',
    lessons: [
      {
        title: '好的結尾包含',
        body: '結尾是病人帶走訊息的最後機會。',
        bullets: ['摘要今天的重點與下一步', '說明追蹤時間與聯絡方式', '安全網：哪些狀況要提早回來或就醫', '「今天還有沒有其他想問的？」', '感謝與支持'],
      },
    ],
    compare: [
      { context: '結束談話', good: '「今天我們確認了需要再做一個檢查，時間是下週二。如果這段期間有任何問題，可以打電話到門診。您還有其他想問的嗎？」', poor: '「好，那就這樣。」', why: '摘要與安全網讓病人知道接下來發生什麼、遇到問題時怎麼辦。' },
    ],
    activities: [
      {
        kind: 'choice',
        id: 'care-end-a1',
        title: '短情境：結束談話',
        intro: '和黃奶奶的衛教即將結束，練習一個完整的結尾。',
        patient: LOOK.oldF,
        steps: [
          {
            id: 's1',
            prompt: '談話快結束了，你：',
            patientLine: '「好，那我知道了。」',
            mood: 'calm',
            options: [
              { id: 'a', text: '「我們今天講了兩件事：每天早上量血壓並記下來、兩週後回診看紀錄。如果頭很痛或手腳無力，要馬上就醫。奶奶還有想問的嗎？」', quality: 'best', feedback: '摘要＋追蹤＋安全網＋最後提問機會。', reply: '「沒有了，謝謝醫師，你講得很清楚。」', replyMood: 'relieved' },
              { id: 'b', text: '「那就兩週後回來。」', quality: 'ok', feedback: '有追蹤時間，但缺少摘要、安全網與提問機會。', reply: '「好……那如果中間不舒服呢？」', replyMood: 'worried' },
              { id: 'c', text: '「好，下一位。」', quality: 'poor', feedback: '沒有任何結尾，病人可能帶著疑問離開。', reply: '（站起來，看起來還想問什麼）', replyMood: 'confused' },
            ],
          },
        ],
      },
    ],
    takeaways: ['摘要＋下一步', '安全網：何時需要提早就醫', '最後提問的機會與支持'],
    tools: ['calgary'],
    review: DRAFT,
  },
];

export const getLesson = (id: string) => CARE6.find((l) => l.id === id);
export const CARE6_DISCLAIMER = 'CARE-6 是本平台參考 Calgary–Cambridge 指引自行整理的教學架構，用於學習與練習，並非官方西醫師 OSCE 國考 SOP。';
