import type { Mood, PatientLook } from '../types';

const DEFAULT_LOOK: PatientLook = { name: '病人', age: 50, sex: 'F', hair: 'short', hairColor: '#3f3f46', shirt: '#93c5fd' };

/** 依情緒決定眉毛與嘴型 */
const FACE: Record<Mood, { brows: [string, string]; mouth: string; eyes?: 'dot' | 'arc' | 'squint' }> = {
  neutral: { brows: ['M41 41 L51 41', 'M69 41 L79 41'], mouth: 'M53 63 L67 63' },
  calm: { brows: ['M41 41 Q46 39 51 41', 'M69 41 Q74 39 79 41'], mouth: 'M52 62 Q60 67 68 62' },
  relieved: { brows: ['M41 40 Q46 38 51 40', 'M69 40 Q74 38 79 40'], mouth: 'M51 61 Q60 69 69 61', eyes: 'arc' },
  anxious: { brows: ['M41 42 L51 38', 'M69 38 L79 42'], mouth: 'M52 64 Q56 61 60 64 Q64 67 68 64' },
  worried: { brows: ['M41 42 L51 39', 'M69 39 L79 42'], mouth: 'M53 65 Q60 61 67 65' },
  confused: { brows: ['M41 40 L51 40', 'M69 37 L79 39'], mouth: 'M56 64 Q60 61 64 64' },
  upset: { brows: ['M41 38 L51 42', 'M69 42 L79 38'], mouth: 'M52 66 Q60 60 68 66' },
  pained: { brows: ['M41 38 L51 42', 'M69 42 L79 38'], mouth: 'M52 64 L56 62 L60 65 L64 62 L68 64', eyes: 'squint' },
  dizzy: { brows: ['M41 42 L51 39', 'M69 39 L79 42'], mouth: 'M54 65 Q60 62 66 65', eyes: 'squint' },
};

/** 低多邊形風格的虛擬病人頭像（SVG，依情緒變化表情） */
export function PatientAvatar({ look = DEFAULT_LOOK, mood = 'neutral', size = 140 }: { look?: PatientLook; mood?: Mood; size?: number }) {
  const f = FACE[mood];
  const skin = '#f2c4a0';
  const old = look.age >= 60;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-label={`${look.name}（${mood}）`}>
      <circle cx="60" cy="60" r="58" fill="#fff7ed" />
      {/* 椅背 */}
      <rect x="22" y="70" width="76" height="50" rx="14" fill="#cbd5e1" />
      {/* 身體 */}
      <path d="M30 120 Q32 86 60 84 Q88 86 90 120 Z" fill={look.shirt} />
      <path d="M52 84 L60 94 L68 84" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
      <rect x="54" y="70" width="12" height="16" rx="5" fill={skin} />
      {/* 長髮在頭後 */}
      {look.hair === 'long' && <path d="M36 50 Q34 82 44 86 L76 86 Q86 82 84 50 Z" fill={look.hairColor} />}
      {/* 頭 */}
      <ellipse cx="60" cy="50" rx="23" ry="25" fill={skin} />
      <ellipse cx="37" cy="52" rx="3.5" ry="5" fill={skin} />
      <ellipse cx="83" cy="52" rx="3.5" ry="5" fill={skin} />
      {/* 頭髮 */}
      {look.hair === 'short' && <path d="M37 46 Q36 24 60 24 Q84 24 83 46 Q78 34 60 33 Q44 33 37 46 Z" fill={look.hairColor} />}
      {look.hair === 'long' && <path d="M36 50 Q35 23 60 23 Q85 23 84 50 Q80 33 60 32 Q42 33 36 50 Z" fill={look.hairColor} />}
      {look.hair === 'bun' && (
        <>
          <circle cx="60" cy="21" r="8" fill={look.hairColor} />
          <path d="M37 46 Q36 25 60 25 Q84 25 83 46 Q78 35 60 34 Q44 34 37 46 Z" fill={look.hairColor} />
        </>
      )}
      {look.hair === 'bald' && <path d="M38 44 Q40 36 44 34 M82 44 Q80 36 76 34" stroke={look.hairColor} strokeWidth="4" fill="none" />}
      {/* 眉毛 */}
      <path d={f.brows[0]} stroke="#3f3f46" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d={f.brows[1]} stroke="#3f3f46" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* 眼睛 */}
      {(!f.eyes || f.eyes === 'dot') && (
        <>
          <circle cx="47" cy="49" r="2.6" fill="#1f2937" />
          <circle cx="73" cy="49" r="2.6" fill="#1f2937" />
        </>
      )}
      {f.eyes === 'arc' && <path d="M43 50 Q47 46 51 50 M69 50 Q73 46 77 50" stroke="#1f2937" strokeWidth="2.2" fill="none" strokeLinecap="round" />}
      {f.eyes === 'squint' && <path d="M43 48 L51 50 M77 48 L69 50" stroke="#1f2937" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
      {look.glasses && (
        <g stroke="#475569" strokeWidth="1.6" fill="none">
          <circle cx="47" cy="49" r="7" />
          <circle cx="73" cy="49" r="7" />
          <path d="M54 49 L66 49" />
        </g>
      )}
      {/* 臉頰與皺紋 */}
      <ellipse cx="44" cy="58" rx="4" ry="2.2" fill="#fca5a5" opacity="0.45" />
      <ellipse cx="76" cy="58" rx="4" ry="2.2" fill="#fca5a5" opacity="0.45" />
      {old && <path d="M50 33 Q60 31 70 33" stroke="#d6a585" strokeWidth="1.2" fill="none" />}
      {/* 嘴 */}
      <path d={f.mouth} stroke="#9f1239" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* 情緒符號 */}
      {(mood === 'anxious' || mood === 'pained') && <path d="M86 34 Q90 41 86 44 Q82 41 86 34 Z" fill="#7dd3fc" />}
      {mood === 'confused' && (
        <text x="92" y="30" fontSize="16" fontWeight="900" fill="#f97316">
          ?
        </text>
      )}
      {mood === 'upset' && <path d="M88 26 l6 -4 M90 32 l7 0 M88 37 l6 4" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />}
      {mood === 'relieved' && <path d="M90 30 l3 3 l6 -7" stroke="#10b981" strokeWidth="2.6" fill="none" strokeLinecap="round" />}
      {/* 以手撐頭（頭暈、疼痛） */}
      {(mood === 'dizzy' || mood === 'pained') && (
        <g>
          <path d="M92 120 Q96 88 84 66" stroke={look.shirt} strokeWidth="11" strokeLinecap="round" fill="none" />
          <ellipse cx="82" cy="60" rx="7" ry="8" fill={skin} />
        </g>
      )}
    </svg>
  );
}

export const MOOD_LABEL: Record<Mood, string> = {
  neutral: '平靜',
  calm: '放鬆',
  relieved: '安心',
  anxious: '焦慮',
  worried: '擔心',
  confused: '困惑',
  upset: '不悅',
  pained: '不舒服',
  dizzy: '頭暈',
};
