import { useEffect, useState } from 'react';
import type { AuscPoint } from '../caseData';
import { AUSC_LABEL } from '../caseData';
import { chestFinding, tooDeep, type Attempt, type AWState } from '../engine';

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

/** 頭頸側面示意：布捲位置與頭部後仰程度 */
export function HeadSideView({ state }: { state: AWState }) {
  const h = state.head;
  const tilt = h.extension === 'neutral' ? 0 : h.extension === 'moderate' ? -14 : -32;
  const lift = h.towel === 'occiput' ? -10 : 0;
  const shoulder = h.towel === 'shoulder' ? -12 : 0;
  return (
    <svg viewBox="0 0 260 160" className="h-full w-full">
      <rect width="260" height="160" rx="16" fill="#f1f5f9" />
      <Note />
      <rect x="0" y="122" width="260" height="38" fill="#cbd5e1" />
      {h.towel === 'shoulder' && <rect x="118" y="104" width="50" height="18" rx="9" fill="#6ee7b7" stroke="#047857" />}
      <path d={`M120 ${116 + shoulder} L250 ${116 + shoulder} L250 ${92 + shoulder} L130 ${92 + shoulder} Z`} fill="#bfdbfe" stroke="#60a5fa" />
      {h.towel === 'occiput' && <rect x="44" y="104" width="46" height="18" rx="9" fill="#6ee7b7" stroke="#047857" />}
      <g transform={`translate(${96} ${100 + lift}) rotate(${tilt} 30 0)`}>
        <path d="M30 4 L30 -14 L-4 -18 L-4 4 Z" fill={skin} />
        <ellipse cx="-16" cy="-18" rx="40" ry="30" fill={skin} stroke="#c99a76" strokeWidth="1.5" />
        <path d="M-50 -30 Q-58 -20 -54 -8" fill="none" stroke="#c99a76" strokeWidth="3" />
        <circle cx="-38" cy="-30" r="3" fill="#1f2937" />
        <path d="M-56 -14 L-50 -12" stroke="#9f1239" strokeWidth="3" />
      </g>
      <text x="252" y="150" textAnchor="end" fontSize="9" fill="#475569">
        布捲：{h.towel === 'occiput' ? '枕部' : h.towel === 'shoulder' ? '肩下' : '未放'}・頭部：{{ neutral: '平躺', moderate: '適度後仰', hyper: '過度後仰' }[h.extension]}
      </text>
    </svg>
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
            <ellipse cx="110" cy="190" rx="100" ry="40" fill="#db7f7f" />
            <path d="M74 52 Q110 30 146 52" fill="#f8b4b4" stroke="#e57373" strokeWidth="3" />
            <path d="M110 70 L82 150 Q110 160 138 150 Z" fill="#1f0a0a" />
            <path d="M110 70 L84 150 M110 70 L136 150" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="110" cy="176" rx="24" ry="8" fill="#3f0d0d" />
            <text x="110" y="64" textAnchor="middle" fontSize="9" fill="#fecaca">
              會厭
            </text>
            <text x="164" y="116" fontSize="9" fill="#fecaca">
              聲帶
            </text>
            <text x="110" y="198" textAnchor="middle" fontSize="9" fill="#fecaca">
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
  const deep = tooDeep(attempt);
  return (
    <svg viewBox="0 0 240 220" className="h-full w-full">
      <rect width="240" height="220" rx="16" fill="#f8fafc" />
      <Note />
      <path d="M30 40 Q60 30 90 40 L96 70" fill="none" stroke="#c99a76" strokeWidth="3" />
      <text x="34" y="34" fontSize="9" fill="#64748b">
        口
      </text>
      {/* 氣管（前）與食道（後） */}
      <path d="M100 80 L110 190 M124 80 L134 190" stroke="#60a5fa" strokeWidth="3" fill="none" />
      <path d="M134 80 L144 200 M156 80 L166 200" stroke="#f59e0b" strokeWidth="3" fill="none" />
      <path d="M110 190 L92 212 M134 190 L150 212" stroke="#60a5fa" strokeWidth="3" fill="none" />
      <text x="70" y="140" fontSize="9" fill="#2563eb">
        氣管
      </text>
      <text x="170" y="140" fontSize="9" fill="#b45309">
        食道
      </text>
      <text x="80" y="214" fontSize="8" fill="#2563eb">
        右支氣管
      </text>
      {reveal && loc !== 'none' && (
        <path
          d={loc === 'esophagus' ? 'M40 44 Q90 40 140 90 L150 180' : deep ? 'M40 44 Q86 40 112 90 L120 186 L104 206' : 'M40 44 Q86 40 112 90 L118 168'}
          fill="none"
          stroke="#0f172a"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.75"
        />
      )}
      <text x="120" y="66" textAnchor="middle" fontSize="11" fontWeight="800" fill={!reveal ? '#475569' : loc === 'trachea' && !deep ? '#047857' : loc === 'none' ? '#64748b' : '#b91c1c'}>
        {loc === 'none' ? '尚未插管' : !reveal ? '位置待確認（完成確認後顯示）' : loc === 'esophagus' ? '食道插管（模擬）' : deep ? '過深：右側主支氣管（模擬）' : '氣管內（模擬）'}
      </text>
      {loc !== 'none' && attempt.depth !== null && (
        <text x="234" y="30" textAnchor="end" fontSize="9" fill="#475569">
          嘴角刻度 {attempt.depth} cm
        </text>
      )}
    </svg>
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
