import { useEffect, useState } from 'react';
import type { AuscPoint } from '../caseData';
import { AUSC_LABEL } from '../caseData';
import { chestFinding, tooDeep, type Attempt, type AWState } from '../engine';
import { SagittalAirway } from './SagittalAirway';

/**
 * 教學示意圖（2D）：不是真實解剖影像，只呈現操作概念與案例規則的結果。
 */
export const SCHEMA_NOTE = '教學示意圖・非真實解剖影像';

function Note() {
  return (
    <text x="6" y="12" fontSize="8" fill="#94a3b8">
      {SCHEMA_NOTE}
    </text>
  );
}

const skin = '#f2c4a0';

/** 臉部俯視（站在病人頭側看）：面罩位置與方向 */
export function FaceTopView({ state, highlight }: { state: AWState; highlight?: boolean }) {
  const m = state.mask;
  const y = m.placed === 'eyes' ? 70 : m.placed === 'low' ? 132 : 104;
  const rise = state.preRise > 0;
  return (
    <svg viewBox="0 0 240 200" className="h-full w-full">
      <rect width="240" height="200" rx="16" fill="#f1f5f9" />
      <Note />
      <ellipse cx="120" cy="104" rx="62" ry="78" fill={skin} stroke="#c99a76" strokeWidth="1.5" />
      <path d="M62 70 Q120 10 178 70 Q160 40 120 38 Q80 40 62 70" fill="#525252" />
      <ellipse cx="96" cy="84" rx="9" ry="4" fill="#fff" stroke="#7c5a43" />
      <ellipse cx="144" cy="84" rx="9" ry="4" fill="#fff" stroke="#7c5a43" />
      <circle cx="96" cy="84" r="2.5" fill="#1f2937" />
      <circle cx="144" cy="84" r="2.5" fill="#1f2937" />
      <path d="M120 88 L112 112 Q120 116 128 112 Z" fill="#e9b291" stroke="#c99a76" />
      <path d="M106 130 Q120 138 134 130" fill="none" stroke="#9f1239" strokeWidth="3" />
      <text x="20" y="190" fontSize="9" fill="#64748b">
        頭頂 ↑ ／ 下巴 ↓
      </text>
      {m.placed && (
        <g transform={`translate(120 ${y}) rotate(${m.apexToHead ? 0 : 180})`} className={highlight ? 'animate-pulse' : ''}>
          <path d="M0 -40 C 26 -36, 40 10, 34 34 Q0 48 -34 34 C -40 10, -26 -36, 0 -40 Z" fill="#bfdbfe" fillOpacity="0.55" stroke="#1d4ed8" strokeWidth="2.5" />
          <circle cx="0" cy="4" r="9" fill="#1d4ed8" fillOpacity="0.5" />
          <text x="0" y="-26" textAnchor="middle" fontSize="8" fontWeight="800" fill="#1e3a8a">
            尖端
          </text>
        </g>
      )}
      {m.placed === 'eyes' && (
        <text x="120" y="22" textAnchor="middle" fontSize="11" fontWeight="800" fill="#dc2626">
          ⚠ 面罩壓到眼睛
        </text>
      )}
      {m.grip && (
        <text x="234" y="190" textAnchor="end" fontSize="9" fill="#1e3a8a">
          {{ one: '單手固定', two: '雙手固定', fingertip: '只按中央' }[m.grip]}
          {rise ? '・胸廓有起伏' : ''}
        </text>
      )}
    </svg>
  );
}

/** 頭頸側面示意：布捲位置與頭部後仰程度，疊上口軸／咽軸／喉軸 */
export function HeadSideView({ state }: { state: AWState }) {
  const h = state.head;
  const pose = h.towel === 'occiput' && h.extension === 'moderate' ? 'sniff' : h.extension === 'hyper' ? 'hyper' : 'neutral';
  return (
    <div className="relative h-full w-full">
      <SagittalAirway pose={pose} axes labels={false} />
      <div className="pointer-events-none absolute right-2 top-2 rounded-xl bg-white/90 px-2 py-1 text-[10px] font-bold leading-relaxed shadow">
        <p className="text-blue-600">— 口軸</p>
        <p className="text-green-600">— 咽軸</p>
        <p className="text-red-600">— 喉軸</p>
      </div>
      <p className="pointer-events-none absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-600">
        布捲：{h.towel === 'occiput' ? '枕部' : h.towel === 'shoulder' ? '肩下' : '未放'}・頭部：{{ neutral: '平躺', moderate: '適度後仰', hyper: '過度後仰' }[h.extension]}
      </p>
    </div>
  );
}

/** 喉頭鏡視野（教學示意）：poor＝只見舌頭與會厭；glottis＝可見聲門 */
export function LaryngoscopeView({ state, showTube, targets }: { state: AWState; showTube?: boolean; targets?: boolean }) {
  const v = state.scopeUse.view;
  const loc = state.attempt.location;
  return (
    <svg viewBox="0 0 220 220" className="h-full w-full">
      <defs>
        <clipPath id="aw-scope">
          <circle cx="110" cy="112" r="96" />
        </clipPath>
      </defs>
      <rect width="220" height="220" rx="16" fill="#0f172a" />
      <Note />
      <g clipPath="url(#aw-scope)">
        <circle cx="110" cy="112" r="96" fill={v === 'none' ? '#1e293b' : '#7f1d1d'} />
        {v === 'poor' && (
          <>
            <ellipse cx="110" cy="150" rx="90" ry="60" fill="#db7f7f" />
            <path d="M80 92 Q110 72 140 92" fill="none" stroke="#fca5a5" strokeWidth="6" />
            <text x="110" y="60" textAnchor="middle" fontSize="11" fill="#fecaca">
              只看到舌頭與會厭
            </text>
          </>
        )}
        {v === 'glottis' && (
          <>
            <defs>
              <radialGradient id="aw-light" cx="0.5" cy="0.45" r="0.6">
                <stop offset="0" stopColor="#f6a6a0" />
                <stop offset="0.7" stopColor="#c45a5a" />
                <stop offset="1" stopColor="#5b1414" />
              </radialGradient>
            </defs>
            <circle cx="110" cy="112" r="96" fill="url(#aw-light)" />
            {/* 葉片（上方）與會厭 */}
            <path d="M40 22 Q110 4 180 22 L176 34 Q110 20 44 34 Z" fill="#cbd5e1" stroke="#64748b" />
            <path d="M70 46 Q110 26 150 46 Q140 58 110 56 Q80 58 70 46 Z" fill="#f2a7a1" stroke="#c45a5a" strokeWidth="1.5" />
            {/* 喉腔：可見氣管軟骨環 */}
            <path d="M110 66 L80 146 Q110 158 140 146 Z" fill="#3a0d0d" />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M${96 - i * 3} ${96 + i * 13} Q110 ${100 + i * 13} ${124 + i * 3} ${96 + i * 13}`} stroke="#7f3b3b" strokeWidth="2" fill="none" />
            ))}
            {/* 真聲帶（白色）與假聲帶 */}
            <path d="M110 64 L82 146" stroke="#fdfdfd" strokeWidth="6" strokeLinecap="round" />
            <path d="M110 64 L138 146" stroke="#fdfdfd" strokeWidth="6" strokeLinecap="round" />
            <path d="M104 66 L70 146 M116 66 L150 146" stroke="#e98b8b" strokeWidth="5" strokeLinecap="round" />
            {/* 杓狀軟骨 */}
            <ellipse cx="88" cy="156" rx="13" ry="9" fill="#f2a7a1" stroke="#c45a5a" />
            <ellipse cx="132" cy="156" rx="13" ry="9" fill="#f2a7a1" stroke="#c45a5a" />
            {/* 食道開口（後方） */}
            <ellipse cx="110" cy="182" rx="26" ry="7" fill="#2a0909" />
            <text x="110" y="40" textAnchor="middle" fontSize="9" fill="#7f1d1d" fontWeight="700">
              會厭
            </text>
            <text x="168" y="108" fontSize="9" fill="#fff" fontWeight="700">
              聲帶
            </text>
            <text x="110" y="122" textAnchor="middle" fontSize="8" fill="#fecaca">
              氣管
            </text>
            <text x="110" y="202" textAnchor="middle" fontSize="9" fill="#fecaca">
              食道開口（後方）
            </text>
            {targets && <ellipse cx="110" cy="118" rx="20" ry="30" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="5 4" className="animate-pulse" />}
          </>
        )}
        {showTube && loc !== 'none' && <path d={loc === 'trachea' ? 'M200 210 Q140 170 112 112' : 'M200 210 Q150 200 112 178'} fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" opacity="0.9" />}
      </g>
      {v === 'none' && (
        <text x="110" y="116" textAnchor="middle" fontSize="12" fill="#94a3b8">
          尚未置入喉頭鏡
        </text>
      )}
      <circle cx="110" cy="112" r="96" fill="none" stroke="#334155" strokeWidth="6" />
    </svg>
  );
}

/** 氣管內管位置示意（矢狀面）：reveal=false 時只顯示「位置待確認」 */
export function TubePositionView({ attempt, reveal }: { attempt: Attempt; reveal: boolean }) {
  const loc = attempt.location;
  const variant = loc === 'none' ? 'none' : !reveal ? 'none' : loc === 'esophagus' ? 'esophagus' : tooDeep(attempt) ? 'deep' : 'trachea';
  return (
    <div className="relative h-full w-full">
      <SagittalAirway tube={variant} cuffInflated={attempt.cuffInflated} />
      <p className={`pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-[12px] font-black shadow ${variant === 'trachea' ? 'bg-emerald-100 text-emerald-800' : variant === 'none' ? 'bg-white text-slate-600' : 'bg-rose-100 text-rose-800'}`}>
        {loc === 'none' ? '尚未插管' : !reveal ? '管路位置待確認（完成確認後顯示）' : variant === 'esophagus' ? '食道插管（模擬）' : variant === 'deep' ? '過深：右主支氣管（模擬）' : '氣管內（模擬）'}
        {loc !== 'none' && attempt.depth !== null ? `・嘴角 ${attempt.depth} cm` : ''}
      </p>
    </div>
  );
}

/** 三種管路位置比較（依案例規則的結果） */
export const COMPARE = [
  { variant: 'trachea' as const, title: '✅ 正確：氣管內', tone: 'emerald', rows: ['胸廓：兩側對稱起伏', '聽診：兩側呼吸音對稱、胃部無聲', '（補充）ETCO₂：持續方形波形', '嘴角刻度：約 20–22 cm（本教案）'] },
  { variant: 'esophagus' as const, title: '❌ 食道插管', tone: 'rose', rows: ['胸廓：無起伏，上腹鼓起', '聽診：胃部氣過水聲、肺部幾乎無呼吸音', '（補充）ETCO₂：沒有持續波形', '處置：立即拔管、重新給氧、再插管'] },
  { variant: 'deep' as const, title: '⚠️ 過深：單側（右）', tone: 'amber', rows: ['胸廓：右側為主，左側起伏少', '聽診：左側呼吸音減弱', '嘴角刻度：超過教案範圍', '處置：cuff 放氣、退管調整深度、再確認'] },
];

export function AirwayComparison({ compact }: { compact?: boolean }) {
  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'md:grid-cols-3'}`}>
      {COMPARE.map((c) => (
        <div key={c.variant} className={`overflow-hidden rounded-2xl bg-white ring-2 ${c.tone === 'emerald' ? 'ring-emerald-300' : c.tone === 'rose' ? 'ring-rose-300' : 'ring-amber-300'}`}>
          <p className={`px-3 py-1.5 text-[12px] font-black ${c.tone === 'emerald' ? 'bg-emerald-50 text-emerald-800' : c.tone === 'rose' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-900'}`}>{c.title}</p>
          <div className="aspect-[58/43]">
            <SagittalAirway tube={c.variant} labels={false} />
          </div>
          {!compact && (
            <ul className="space-y-0.5 px-3 pb-2 text-[11px] leading-relaxed text-slate-600">
              {c.rows.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/** 胸廓觀察：依案例規則顯示兩側起伏 */
export function ChestView({ attempt, animate, preRise }: { attempt?: Attempt; animate: boolean; preRise?: boolean }) {
  const f = attempt ? chestFinding(attempt) : { rise: preRise ? ('both' as const) : ('none' as const), text: preRise ? '兩側胸廓起伏' : '胸廓沒有明顯起伏' };
  const [up, setUp] = useState(false);
  useEffect(() => {
    if (!animate) return;
    setUp(true);
    const id = window.setTimeout(() => setUp(false), 900);
    return () => window.clearTimeout(id);
  }, [animate]);
  const l = up && (f.rise === 'both' || f.rise === 'weak') ? (f.rise === 'weak' ? 3 : 8) : 0;
  const rr = up && (f.rise === 'both' || f.rise === 'right' || f.rise === 'weak') ? (f.rise === 'weak' ? 3 : 8) : 0;
  const belly = up && f.rise === 'none' && attempt?.location === 'esophagus' ? 8 : 0;
  return (
    <svg viewBox="0 0 240 200" className="h-full w-full">
      <rect width="240" height="200" rx="16" fill="#f1f5f9" />
      <Note />
      <path d={`M50 40 Q120 ${20 - Math.max(l, rr)} 190 40 L196 120 Q120 132 44 120 Z`} fill="#bfdbfe" stroke="#60a5fa" />
      <ellipse cx="88" cy={82 - rr} rx="30" ry="34" fill="#93c5fd" opacity="0.7" style={{ transition: 'cy 0.4s' }} />
      <ellipse cx="152" cy={82 - l} rx="30" ry="34" fill="#93c5fd" opacity="0.7" style={{ transition: 'cy 0.4s' }} />
      <text x="88" y="86" textAnchor="middle" fontSize="10" fill="#1e3a8a">
        右胸
      </text>
      <text x="152" y="86" textAnchor="middle" fontSize="10" fill="#1e3a8a">
        左胸
      </text>
      <ellipse cx="120" cy={150 - belly} rx="54" ry={26 + belly / 2} fill="#e0e7ff" stroke="#a5b4fc" />
      <text x="120" y="154" textAnchor="middle" fontSize="9" fill="#4338ca">
        上腹
      </text>
      <text x="120" y="192" textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">
        {f.text}
      </text>
    </svg>
  );
}

/** 聽診位置：五個教案位置與三個非教案位置 */
export const AUSC_SPOTS: Record<AuscPoint, { x: number; y: number }> = {
  rightApex: { x: 84, y: 56 },
  leftApex: { x: 156, y: 56 },
  rightBase: { x: 74, y: 118 },
  leftBase: { x: 166, y: 118 },
  epigastrium: { x: 120, y: 156 },
  neck: { x: 120, y: 22 },
  precordium: { x: 136, y: 92 },
  rightUpperQuadrant: { x: 82, y: 166 },
};

export function AuscultationMap({ checked, wrong, labels, onPick, results }: { checked: AuscPoint[]; wrong: AuscPoint[]; labels: boolean; onPick?: (p: AuscPoint) => void; results?: Partial<Record<AuscPoint, string>> }) {
  return (
    <svg viewBox="0 0 240 200" className="h-full w-full">
      <rect width="240" height="200" rx="16" fill="#f1f5f9" />
      <Note />
      <path d="M104 8 h32 v22 h-32 Z" fill={skin} />
      <path d="M44 30 Q120 18 196 30 L204 134 Q120 146 36 134 Z" fill={skin} stroke="#c99a76" />
      <path d="M40 134 Q120 146 200 134 L196 196 L44 196 Z" fill="#efc9aa" stroke="#c99a76" />
      <path d="M120 30 V134" stroke="#c99a76" strokeDasharray="3 3" />
      {(Object.keys(AUSC_SPOTS) as AuscPoint[]).map((p) => {
        const sp = AUSC_SPOTS[p];
        const done = checked.includes(p);
        const bad = wrong.includes(p);
        return (
          <g key={p} onClick={() => onPick?.(p)} className={onPick ? 'cursor-pointer' : ''} role="button" aria-label={`聽診 ${labels ? AUSC_LABEL[p] : '此位置'}`}>
            <circle cx={sp.x} cy={sp.y} r="13" fill={done ? '#22c55e' : bad ? '#f97316' : '#ffffff'} fillOpacity={done || bad ? 0.85 : 0.55} stroke="#334155" strokeDasharray={done || bad ? '0' : '3 2'} />
            {(labels || done || bad) && (
              <text x={sp.x} y={sp.y + 24} textAnchor="middle" fontSize="8" fontWeight="700" fill="#334155" pointerEvents="none">
                {AUSC_LABEL[p]}
              </text>
            )}
            {results?.[p] && (
              <title>{results[p]}</title>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** 波形二氧化碳（現行臨床安全補充）：依案例規則顯示 */
export function CapnoView({ attempt }: { attempt: Attempt }) {
  const on = attempt.capno;
  const trachea = attempt.location === 'trachea';
  const wave = trachea ? 'M8 70 h16 l4 -40 h34 l6 40 h16 l4 -40 h34 l6 40 h16 l4 -40 h34 l6 40 h20' : 'M8 70 h16 l6 -14 h10 l6 14 h40 l4 -4 h6 l4 4 h120';
  return (
    <svg viewBox="0 0 240 110" className="h-full w-full">
      <rect width="240" height="110" rx="12" fill="#020617" />
      <text x="10" y="16" fontSize="9" fill="#67e8f9">
        ETCO₂ 波形（教學示意・案例規則）
      </text>
      {on ? <path d={wave} fill="none" stroke="#facc15" strokeWidth="2.5" /> : <text x="120" y="64" textAnchor="middle" fontSize="11" fill="#64748b">未連接</text>}
      {on && (
        <text x="232" y="102" textAnchor="end" fontSize="9" fill={trachea ? '#86efac' : '#fca5a5'}>
          {trachea ? '持續規律的方形波形' : '沒有持續波形'}
        </text>
      )}
    </svg>
  );
}
