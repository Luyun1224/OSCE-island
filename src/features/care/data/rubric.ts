import type { CommunicationRubric } from '../types';

/** 形成性回饋的九個分析面向（教學用，非正式 OSCE 評分項目） */
export const CARE_RUBRIC: CommunicationRubric = {
  id: 'care-formative-v1',
  title: 'CARE ISLAND 溝通表現分析面向',
  dimensions: [
    { id: 'opening', label: '開場與建立關係', description: '自我介紹、確認身分、說明目的、建立安全感', lessons: ['connect'], tools: ['calgary'] },
    { id: 'exploring', label: '探索病人需求', description: '開放式提問、了解病人已知的資訊、想法與擔心（ICE）', lessons: ['assess'], tools: ['calgary'] },
    { id: 'emotionRecognition', label: '情緒辨識', description: '察覺並回應語言、非語言與情境中的情緒線索', lessons: ['respond'], tools: ['nurse'] },
    { id: 'empathy', label: '同理回應', description: '命名、理解、尊重、支持、探索情緒，而非急著保證或轉移話題', lessons: ['respond'], tools: ['nurse', 'spikes'] },
    { id: 'clarity', label: '說明清楚度', description: '先確認需要多少資訊、分段說明、避免術語、誠實面對不確定性', lessons: ['explain'], tools: ['spikes', 'teachback'] },
    { id: 'engagement', label: '病人參與與共享決策', description: '邀請病人提問、討論選項與偏好、一起擬定下一步', lessons: ['engage'], tools: ['calgary'] },
    { id: 'teachBack', label: 'Teach-back 理解確認', description: '請病人用自己的話復述，並針對誤解再說明', lessons: ['engage'], tools: ['teachback'] },
    { id: 'closing', label: '摘要與結束', description: '摘要重點、安排追蹤、說明何時需要提早回來、確認還有沒有問題', lessons: ['end'], tools: ['calgary'] },
    { id: 'safety', label: '專業與安全溝通', description: '不給錯誤保證、不提供未經證實的資訊、尊重隱私與自主', lessons: ['explain', 'end'], tools: ['spikes'] },
  ],
  limitations: [
    '本分析只根據你在選項式對話中「選擇的說法」，無法觀察語氣、語速、眼神、姿勢、停頓等聲音與非語言表現，因此不是完整的溝通能力評估。',
    '各面向的「已展現／部分展現／待加強／未觀察」是學習回饋，不是正式 OSCE 分數，也不取代教師或 SP 的回饋。',
    '同一個情境常有不只一種適當的說法；報告中的「可參考說法」是其中一種，不是唯一標準答案。',
  ],
};
