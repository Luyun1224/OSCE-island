import type { Activity } from '../../history/types';
import { LOOK } from './looks';

/**
 * Game 1：溝通 SOP 挑戰（分類 → 彈性排序 → 下一步行動）
 * 允許多條合理路徑：排序以階段範圍判定，選擇題可有多個「適當」選項，並說明理由。
 */
export const SOP_CHALLENGE: Activity[] = [
  {
    kind: 'sort',
    id: 'g1-sort',
    title: '第 1 關：這句話屬於 CARE-6 的哪個階段？',
    intro: '把醫師的說法拖到最主要的 CARE-6 階段。有些說法可以出現在不同階段，請依「主要功能」分類，解釋會說明理由。',
    bins: [
      { id: 'connect', label: 'C 建立連結', color: '#f97362' },
      { id: 'assess', label: 'A 評估需求', color: '#f59e0b' },
      { id: 'respond', label: 'R 回應情緒', color: '#e11d48' },
      { id: 'explain', label: 'E 清楚說明', color: '#0ea5e9' },
      { id: 'engage', label: 'E 病人參與', color: '#14b8a6' },
      { id: 'end', label: 'E 摘要結束', color: '#7c3aed' },
    ],
    cards: [
      { id: 'c1', text: '「您好，我是實習醫師陳醫師，想先確認您的全名。」', bin: 'connect', explain: '自我介紹與身分確認，是建立連結的第一步。' },
      { id: 'c2', text: '「我們到旁邊的會談室坐著談，比較安靜。」', bin: 'connect', explain: '安排隱私與舒適的環境。' },
      { id: 'a1', text: '「您目前對這次檢查了解多少？」', bin: 'assess', explain: '先了解病人已知的資訊（Ask before tell）。' },
      { id: 'a2', text: '「您自己最擔心的是什麼？」', bin: 'assess', explain: '探索擔心（ICE 的 C）。也具有回應情緒的效果，但主要功能是評估。' },
      { id: 'r1', text: '「聽起來這幾天您一直睡不好，很擔心。」', bin: 'respond', explain: 'NURSE 的 Naming：命名情緒。' },
      { id: 'r2', text: '「換作是我，也會很不安。」', bin: 'respond', explain: 'NURSE 的 Understanding。' },
      { id: 'x1', text: '「結果有一個地方看得不夠清楚，所以需要再檢查一次。」', bin: 'explain', explain: '用日常語言說明結果。' },
      { id: 'x2', text: '「您希望我先講重點，還是詳細一點？」', bin: 'explain', explain: '確認資訊偏好，讓說明符合病人需要（SPIKES 的 Invitation）。' },
      { id: 'g1', text: '「下週二或週四，哪一天比較方便您安排？」', bin: 'engage', explain: '讓病人參與安排（共享決策）。' },
      { id: 'g2', text: '「為了確定我說清楚了，可以請您說說回家要怎麼做嗎？」', bin: 'engage', explain: 'Teach-back 確認理解。' },
      { id: 'e1', text: '「今天我們談了兩件事……如果發燒請提早回診。」', bin: 'end', explain: '摘要＋安全網。' },
      { id: 'e2', text: '「今天還有沒有其他想問的？」', bin: 'end', explain: '結束前給最後提問的機會。' },
    ],
    drawCount: 9,
  },
  {
    kind: 'sequence',
    id: 'g1-seq',
    title: '第 2 關：排出一次會談的順序',
    intro: '把下列行為排成合理的順序。回應情緒可以在任何時候出現；說明前要先了解病人的起點。',
    phases: ['Connect', 'Assess', 'Explain', 'Engage', 'End'],
    cards: [
      { id: 's1', text: '自我介紹並確認身分', rank: [0, 0], note: 'Connect' },
      { id: 's2', text: '了解病人已知道什麼、最擔心什麼', rank: [1, 1], note: 'Assess：Ask before tell' },
      { id: 's3', text: '病人落淚時，停下來回應情緒', rank: [0, 4], note: 'Respond：任何時候都可能需要，所以放哪裡都合理' },
      { id: 's4', text: '確認病人想知道多少，再分段說明', rank: [2, 2], note: 'Explain' },
      { id: 's5', text: '一起決定下一步，並請病人復述', rank: [3, 3], note: 'Engage' },
      { id: 's6', text: '摘要、安全網、最後提問', rank: [4, 4], note: 'End' },
    ],
    takeaway: 'CARE-6 不是死板的步驟；回應情緒貫穿全程，其他階段則有合理的先後。',
  },
  {
    kind: 'choice',
    id: 'g1-next',
    title: '第 3 關：下一步該做什麼？',
    intro: '每一題都是會談中的一個時刻。可能有不只一個適當的下一步，選完可以點其他選項比較。',
    patient: LOOK.midF,
    steps: [
      {
        id: 'n1',
        prompt: '你剛自我介紹完，病人說：「醫師，我是不是得了什麼很嚴重的病？」下一步：',
        patientLine: '「醫師，我是不是得了什麼很嚴重的病？」',
        mood: 'anxious',
        options: [
          { id: 'a', text: '「聽起來您很擔心。可以先跟我說說，是什麼讓您覺得可能很嚴重嗎？」', quality: 'best', feedback: 'Respond＋Assess：回應情緒並了解病人的想法。', reply: '「因為醫院打電話叫我回來……」', replyMood: 'worried' },
          { id: 'b', text: '「這是很重要的問題。在回答之前，我想先了解您目前知道多少，可以嗎？」', quality: 'best', feedback: '承認問題的重要性並先評估（Ask before tell），同樣合理。', reply: '「只知道報告有問題……」', replyMood: 'worried' },
          { id: 'c', text: '「不會啦，放心。」', quality: 'poor', feedback: '尚未說明就給保證，是不安全的溝通。', reply: '「真的嗎？那為什麼叫我回來？」', replyMood: 'confused' },
        ],
        takeaway: '同一時刻可以有不同的合理路徑：先回應情緒或先了解起點都可以，但不要給沒有根據的保證。',
      },
      {
        id: 'n2',
        prompt: '你說明到一半，病人突然沉默、眼眶泛紅。下一步：',
        mood: 'worried',
        options: [
          { id: 'a', text: '（停下來，遞面紙，安靜等待）「這些消息一下子很難消化。」', quality: 'best', feedback: '停下說明、回應情緒，給病人空間。', reply: '「……對不起，我只是想到我的孩子。」', replyMood: 'worried' },
          { id: 'b', text: '「我說的這些，您現在的感覺是？」', quality: 'best', feedback: '探索病人的感受，也是適當的回應。', reply: '「我只是想到我的孩子……」', replyMood: 'worried' },
          { id: 'c', text: '「我把剩下的講完，您再一起問。」', quality: 'poor', feedback: '病人情緒高漲時繼續說明，資訊多半聽不進去。', reply: '（點頭，但目光空洞）', replyMood: 'confused' },
        ],
      },
      {
        id: 'n3',
        prompt: '下一步的檢查已安排好，談話快結束了。下一步：',
        mood: 'neutral',
        options: [
          { id: 'a', text: '「為了確定我說清楚了，您可以說說接下來要做什麼嗎？」', quality: 'best', feedback: 'Engage：先用 teach-back 確認理解，再進入結束。', reply: '「下週二來做超音波，結果出來醫師會打給我。」', replyMood: 'calm' },
          { id: 'b', text: '「我們今天講了……如果這段時間有任何問題可以打電話來。還有想問的嗎？」', quality: 'ok', feedback: '摘要與安全網很好，但還沒確認病人的理解。', reply: '「沒有了。」', replyMood: 'neutral' },
          { id: 'c', text: '「好，那就這樣，掰掰。」', quality: 'poor', feedback: '沒有確認理解、摘要或安全網。', reply: '「……喔。」', replyMood: 'confused' },
        ],
      },
    ],
  },
];
