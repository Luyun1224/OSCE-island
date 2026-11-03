import type { TechniqueLesson } from '../types';

const R = { status: 'draft' as const, note: '檢查手法教學內容待臨床教師審核；真實手法、力道與流暢度需由教師實體評核。' };

/** 四種基本檢查手法 */
export const TECHNIQUES: TechniqueLesson[] = [
  {
    id: 'inspection',
    title: '視診',
    english: 'Inspection',
    icon: '👁️',
    color: '#0ea5e9',
    purpose: '在接觸病人之前，系統性地觀察外觀、對稱性、顏色、輪廓與動作。',
    situations: ['每個系統檢查的起點', '腹部：輪廓、疤痕、膨隆、蠕動波、靜脈曲張', '胸部：呼吸型態、胸廓對稱、使用呼吸輔助肌'],
    concepts: ['充分但不過度暴露', '良好照明，從正面與側面（切線方向）觀察', '左右比較', '先整體、再局部'],
    errors: ['衣服沒有掀開就說「視診正常」', '只看一眼就跳過', '忽略病人表情與姿勢'],
    cautions: ['維護隱私，只暴露必要部位', '向病人說明要觀察的部位'],
    game: {
      kind: 'multipick',
      id: 'tech-insp',
      title: '小遊戲：腹部視診要觀察什麼？',
      intro: '選出腹部視診最重要的三項觀察。',
      scenario: '病人平躺，腹部已適當暴露，照明良好。',
      pick: 3,
      options: [
        { id: 'contour', text: '腹部輪廓（平坦、膨隆、凹陷）與對稱性', priority: 'high', explain: '膨隆與不對稱提示腹水、腫塊或腸阻塞。' },
        { id: 'scar', text: '皮膚：疤痕、紋路、靜脈曲張、皮疹', priority: 'high', explain: '手術疤痕提示可能的沾黏；靜脈曲張可能與門脈高壓相關。' },
        { id: 'move', text: '蠕動波與搏動', priority: 'high', explain: '可見蠕動波可能與阻塞相關；搏動需注意主動脈。' },
        { id: 'temp', text: '用手背感覺皮膚溫度', priority: 'low', explain: '這是觸診，不是視診。' },
        { id: 'sound', text: '腸音頻率', priority: 'low', explain: '這是聽診。' },
      ],
      takeaway: '視診不碰觸病人：輪廓、皮膚、動作。',
    },
    review: R,
  },
  {
    id: 'palpation',
    title: '觸診',
    english: 'Palpation',
    icon: '🖐️',
    color: '#16a34a',
    purpose: '以手評估壓痛、肌肉防禦、腫塊、器官大小與質地、溫度與搏動。',
    situations: ['腹部：淺觸診、深觸診、肝脾觸診', '心臟：心尖搏動', '淋巴結、甲狀腺、脈搏'],
    concepts: ['先淺後深', '疼痛部位最後檢查', '手要溫暖、動作輕柔', '邊做邊觀察病人表情'],
    errors: ['一開始就深壓疼痛處', '用指尖戳', '眼睛只看腹部、不看病人表情'],
    cautions: ['涉及疼痛時避免不必要的反覆刺激', '真實的力道與手感需由教師實體評核，網頁無法判斷'],
    game: {
      kind: 'choice',
      id: 'tech-palp',
      title: '小遊戲：觸診策略',
      intro: '選出適當的觸診策略。',
      steps: [
        {
          id: 's1',
          prompt: '病人說右下腹痛。你的腹部觸診順序：',
          mood: 'pained',
          options: [
            { id: 'a', text: '從離疼痛最遠的左上腹開始淺觸診，依序到右下腹；最後再深觸診。', quality: 'best', feedback: '先遠後近、先淺後深，可減少疼痛並觀察反應。', reply: '「這樣還好。」', replyMood: 'calm' },
            { id: 'b', text: '直接深壓右下腹確認是不是闌尾炎。', quality: 'poor', feedback: '造成不必要的疼痛，也讓後續檢查受肌肉防禦干擾。', reply: '「啊！好痛！」', replyMood: 'pained' },
            { id: 'c', text: '因為會痛，所以不做觸診。', quality: 'poor', feedback: '觸診是重要的檢查；應輕柔並最後檢查疼痛處。', reply: '「嗯？」', replyMood: 'confused' },
          ],
          takeaway: '先遠後近、先淺後深，眼睛看著病人的臉。',
        },
      ],
    },
    review: R,
  },
  {
    id: 'percussion',
    title: '叩診',
    english: 'Percussion',
    icon: '🥁',
    color: '#f59e0b',
    purpose: '以叩擊產生的聲音與觸感，判斷下方組織是含氣、實質或液體。',
    situations: ['肺部：清音、濁音、過度共鳴', '腹部：鼓音、濁音、肝臟大小、移動性濁音', '肋脊角叩擊痛'],
    concepts: ['中指遠端指節緊貼體表', '另一手中指以手腕帶動，快速叩擊後立即離開', '由共鳴區往濁音區叩，找出交界', '左右對稱比較'],
    errors: ['整隻手掌貼在體表', '用手臂而非手腕發力', '叩擊後手指停留在原處'],
    cautions: ['網頁互動只能練習位置與判讀，無法評估真實叩診手法品質', '有疼痛時說明並輕柔操作'],
    game: {
      kind: 'sort',
      id: 'tech-perc',
      title: '小遊戲：叩診音分類',
      intro: '把每個部位在一般成人預期出現的叩診音分類（教學典型情況）。',
      bins: [
        { id: 'tymp', label: '鼓音', color: '#f59e0b' },
        { id: 'dull', label: '濁音', color: '#64748b' },
        { id: 'res', label: '清音（共鳴音）', color: '#0ea5e9' },
      ],
      cards: [
        { id: '1', text: '腹部大部分區域（含氣腸道）', bin: 'tymp', explain: '腸道內的氣體產生鼓音。' },
        { id: '2', text: '右上腹肝臟上方', bin: 'dull', explain: '實質器官產生濁音，可用於估計肝臟大小。' },
        { id: '3', text: '正常肺野', bin: 'res', explain: '含氣肺組織為清音。' },
        { id: '4', text: '膀胱脹滿時的恥骨上區', bin: 'dull', explain: '液體產生濁音。' },
        { id: '5', text: '胃泡（左上腹 Traube 空間）', bin: 'tymp', explain: '胃內氣體產生鼓音。' },
      ],
    },
    review: R,
  },
  {
    id: 'auscultation',
    title: '聽診',
    english: 'Auscultation',
    icon: '🩺',
    color: '#8b5cf6',
    purpose: '以聽診器評估心音、呼吸音、腸音與血管雜音。',
    situations: ['心臟：四個瓣膜聽診區', '肺部：前胸、側胸與背部對稱位置', '腹部：腸音、血管雜音'],
    concepts: ['直接接觸皮膚，不隔著衣服', '膜面聽高頻、鐘面輕放聽低頻', '安靜環境、左右對稱比較', '腹部聽診通常在觸診與叩診之前'],
    errors: ['隔著衣服聽', '聽診頭沒有完全貼合', '每個位置停留太短'],
    cautions: ['先溫暖聽診頭', '聽診器清潔'],
    game: {
      kind: 'choice',
      id: 'tech-ausc',
      title: '小遊戲：聽診觀念',
      intro: '選出正確的聽診做法。',
      steps: [
        {
          id: 's1',
          prompt: '為什麼腹部檢查常在觸診之前先聽診？',
          mood: 'neutral',
          options: [
            { id: 'a', text: '觸診與叩診可能改變腸蠕動，先聽診較能反映原本的腸音。', quality: 'best', feedback: '這是常見的教學理由；實際順序仍依教師審核的 SOP。', reply: '', replyMood: 'neutral' },
            { id: 'b', text: '因為聽診比較快。', quality: 'poor', feedback: '順序不是依照快慢決定。', reply: '', replyMood: 'neutral' },
            { id: 'c', text: '任何系統都一定是先聽診。', quality: 'poor', feedback: '各系統不同：例如心肺常採視、觸、叩、聽。', reply: '', replyMood: 'neutral' },
          ],
        },
        {
          id: 's2',
          prompt: '聽心音時，低頻的聲音（例如部分心雜音）較適合用：',
          mood: 'neutral',
          options: [
            { id: 'a', text: '鐘面，輕放於皮膚上', quality: 'best', feedback: '鐘面輕放適合低頻聲音。', reply: '', replyMood: 'neutral' },
            { id: 'b', text: '鐘面，用力壓緊', quality: 'ok', feedback: '用力壓緊時皮膚繃緊，效果接近膜面。', reply: '', replyMood: 'neutral' },
            { id: 'c', text: '隔著衣服用膜面', quality: 'poor', feedback: '應直接接觸皮膚。', reply: '', replyMood: 'neutral' },
          ],
        },
      ],
    },
    review: R,
  },
];

export const getTechnique = (id: string) => TECHNIQUES.find((t) => t.id === id);
