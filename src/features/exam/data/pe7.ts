import type { Activity, PhysicalExamSOP, ReviewMeta } from '../types';

export const PE7_NOTE = 'PE-7 是本平台整理的身體檢查教學架構，不是國考官方 SOP；各器官系統的操作順序可能不同，請依教師審核的各系統 SOP。';
export const PE7_REVIEW: ReviewMeta = { status: 'draft', note: 'PE-7 教學內容待臨床教師審核。' };

export const PE7: PhysicalExamSOP[] = [
  { id: 'task', order: 1, title: '確認考站任務、病況與安全', icon: '📋', color: '#0f766e', points: ['閱讀考生指引：要檢查哪個系統、有無特殊限制', '快速確認病人是否穩定、是否有疼痛或不適', '確認環境安全（床欄、地面、器材）'], pitfalls: ['沒看清楚任務就開始做全身檢查', '忽略病人明顯不適'], observability: 'web' },
  { id: 'identity', order: 2, title: '自我介紹、確認身分及取得同意', icon: '🤝', color: '#16a34a', points: ['自我介紹（姓名、身分）', '以兩種方式確認病人身分', '說明要做什麼檢查、為什麼、大約多久', '取得同意，並告知隨時可以喊停'], pitfalls: ['未取得同意就碰觸病人', '只問「可以嗎」而沒有說明要做什麼'], observability: 'web' },
  { id: 'prepare', order: 3, title: '手部衛生、器材及環境準備', icon: '🧼', color: '#0ea5e9', points: ['接觸病人前執行手部衛生', '準備並檢查器材（聽診器清潔、溫暖）', '維護隱私：拉簾、只暴露必要部位', '安排合適體位與照明'], pitfalls: ['跳過手部衛生', '過度暴露病人身體'], observability: 'teacher' },
  { id: 'technique', order: 4, title: '選擇適合的檢查手法', icon: '🖐️', color: '#8b5cf6', points: ['依系統與目的選擇視、觸、叩、聽', '各系統的教學順序不同（例：腹部常採視→聽→叩→觸）', '疼痛部位最後檢查、先輕後深'], pitfalls: ['所有系統都用同一順序', '一開始就直接按壓疼痛處'], observability: 'web' },
  { id: 'perform', order: 5, title: '依部位及正確次序執行檢查', icon: '🔍', color: '#f59e0b', points: ['依體表標記定位，系統性地涵蓋所有區域', '左右比較', '觀察病人表情，詢問是否不舒服'], pitfalls: ['只檢查一側', '定位錯誤（左右顛倒）'], observability: 'teacher' },
  { id: 'findings', order: 6, title: '整理正常與異常發現', icon: '🗂️', color: '#ef4444', points: ['區分正常、異常與需進一步評估的發現', '關鍵陽性與關鍵陰性都要記錄', '描述位置、性質，不直接跳到診斷'], pitfalls: ['只報告異常、忽略重要陰性', '用單一發現推定診斷'], observability: 'web' },
  { id: 'complete', order: 7, title: '完成檢查、病人照護及結果報告', icon: '✅', color: '#64748b', points: ['協助病人整理衣物、恢復舒適體位', '感謝病人、再次手部衛生', '以結構化方式報告發現'], pitfalls: ['檢查完直接離開', '報告沒有條理'], observability: 'teacher' },
];

/** PE-7 小遊戲 */
export const PE7_GAMES: Activity[] = [
  {
    kind: 'sequence',
    id: 'pe7-seq',
    title: '排出 PE-7 的順序',
    intro: '把一次身體檢查的七個階段排成合理順序。',
    phases: PE7.map((s) => `${s.order}`),
    cards: PE7.map((s) => ({ id: s.id, text: s.title, rank: [s.order - 1, s.order - 1] as [number, number], note: s.points[0] })),
    takeaway: '準備（1–3）→ 檢查（4–5）→ 整理與結束（6–7）。',
  },
  {
    kind: 'choice',
    id: 'pe7-choice',
    title: '情境判斷',
    intro: '選出最適當的做法；可點其他選項比較。',
    patient: { name: '張先生', age: 52, sex: 'M', hair: 'short', hairColor: '#57534e', shirt: '#86efac' },
    steps: [
      {
        id: 's1',
        prompt: '你走進考站，病人躺在床上。在碰觸病人之前，你應該：',
        mood: 'neutral',
        options: [
          { id: 'a', text: '自我介紹、確認身分、說明要做的檢查並取得同意，然後手部衛生。', quality: 'best', feedback: '同意與手部衛生都在接觸病人之前。', reply: '「好，請檢查。」', replyMood: 'calm' },
          { id: 'b', text: '先掀開衣服看腹部，再自我介紹。', quality: 'poor', feedback: '未經同意就暴露病人身體，侵犯隱私與自主權。', reply: '「欸？你是誰？」', replyMood: 'upset' },
          { id: 'c', text: '直接開始聽診，邊聽邊說明。', quality: 'poor', feedback: '缺少身分確認、同意與手部衛生。', reply: '「……」', replyMood: 'confused' },
        ],
      },
      {
        id: 's2',
        prompt: '檢查中病人皺眉說「那邊有點痛」。你：',
        mood: 'pained',
        options: [
          { id: 'a', text: '停下來詢問疼痛位置與程度，說明會先檢查其他部位、最後輕輕檢查疼痛處。', quality: 'best', feedback: '尊重病人感受，並調整檢查策略。', reply: '「好，謝謝你。」', replyMood: 'calm' },
          { id: 'b', text: '「忍一下就好」，繼續用力按壓。', quality: 'poor', feedback: '忽略疼痛可能造成傷害，也破壞信任。', reply: '「好痛！」', replyMood: 'pained' },
          { id: 'c', text: '跳過該區域，不再檢查。', quality: 'ok', feedback: '避免了疼痛，但可能漏掉重要發現；應最後、輕柔地檢查並觀察反應。', reply: '「嗯。」', replyMood: 'neutral' },
        ],
      },
    ],
  },
];
