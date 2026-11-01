import { useId } from 'react';

/**
 * 頭頸部矢狀切面插管示意圖（原創教學插圖，非真實解剖影像）
 * 病人仰躺、臉朝上：上方為前側（臉、氣管），下方為後側（枕部、食道、頸椎），右方為足側。
 * 依狀態畫出：氣管內管（接頭、pilot balloon、cuff）、喉頭鏡、頭部擺位與三軸線。
 */
export type TubeVariant = 'none' | 'trachea' | 'esophagus' | 'deep';

const SKIN = '#f5d3b3';
const SKIN_EDGE = '#d9a77f';
const MUCOSA = '#f08c8c';
const MUCOSA_DARK = '#d9636b';
const AIR = '#fff1ee';

export function SagittalAirway({
  tube = 'none',
  cuffInflated = true,
  scope = false,
  pose = 'sniff',
  axes = false,
  labels = true,
  compact = false,
  title,
}: {
  tube?: TubeVariant;
  cuffInflated?: boolean;
  scope?: boolean;
  pose?: 'neutral' | 'sniff' | 'hyper';
  axes?: boolean;
  labels?: boolean;
  compact?: boolean;
  title?: string;
}) {
  const id = useId().replace(/:/g, '');
  const tilt = pose === 'neutral' ? 6 : pose === 'hyper' ? -10 : 0;
  // 氣管內管路徑（由口部進入）
  const tubePath =
    tube === 'esophagus'
      ? 'M206 18 L206 100 C 208 126, 236 142, 276 158 C 306 172, 322 200, 340 236 C 348 252, 380 262, 470 262'
      : tube === 'deep'
        ? 'M206 18 L206 100 C 208 126, 236 142, 276 158 C 312 172, 332 200, 356 212 C 366 216, 380 216, 552 216'
        : 'M206 18 L206 100 C 208 126, 236 142, 276 158 C 312 172, 332 200, 356 212 C 366 216, 380 216, 476 216';
  const tip = tube === 'esophagus' ? { x: 470, y: 262 } : tube === 'deep' ? { x: 552, y: 216 } : { x: 476, y: 216 };
  const cuff = tube === 'esophagus' ? { x: 448, y: 261 } : tube === 'deep' ? { x: 524, y: 216 } : { x: 448, y: 216 };
  const fs = compact ? 13 : 11;

  return (
    <svg viewBox="0 0 580 430" className="h-full w-full" role="img" aria-label={title ?? '插管矢狀切面示意圖'}>
      <defs>
        <linearGradient id={`${id}-skin`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fbe1c8" />
          <stop offset="1" stopColor={SKIN} />
        </linearGradient>
        <linearGradient id={`${id}-tube`} x1="0" x2="1">
          <stop offset="0" stopColor="#a7e3ea" />
          <stop offset="1" stopColor="#7fcfd9" />
        </linearGradient>
        <clipPath id={`${id}-in`}>
          <path d={HEAD_PATH} />
        </clipPath>
      </defs>
      <rect width="580" height="430" fill="#f8fafc" />
      {/* 枕頭／布捲 */}
      <rect x="10" y="378" width="560" height="44" rx="22" fill="#e2e8f0" />
      {pose !== 'neutral' && <ellipse cx="170" cy="384" rx="70" ry="22" fill="#a7f3d0" stroke="#34d399" />}

      <g transform={`rotate(${tilt} 420 300)`}>
        {/* 頭頸外形 */}
        <path d={HEAD_PATH} fill={`url(#${id}-skin)`} stroke={SKIN_EDGE} strokeWidth="2.5" strokeLinejoin="round" />
        <g clipPath={`url(#${id}-in)`}>
          {/* 顱底（淡色） */}
          <path d="M150 140 C 200 150, 250 170, 300 200 L 312 290 C 260 300, 200 300, 150 280 Z" fill="#f3dcc6" opacity="0.6" />
          {/* 頸椎 */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={318 + i * 40} y={300 - i * 1} width="32" height="30" rx="7" fill="#efe6d8" stroke="#cbbca6" />
          ))}
          {/* 鼻腔與鼻咽 */}
          <path d="M150 104 C 190 104, 240 112, 280 134 L 300 150 C 270 150, 230 132, 196 124 Z" fill={AIR} stroke={MUCOSA} strokeWidth="2" />
          {/* 口腔＋咽部＋喉部腔道 */}
          <path d="M200 104 C 226 112, 262 124, 292 146 C 318 166, 332 190, 344 206 L 364 200 L 580 200 L 580 234 L 366 234 L 352 244 L 580 250 L 580 276 L 346 270 C 330 262, 318 248, 312 232 C 300 206, 280 190, 252 180 C 230 170, 214 140, 200 104 Z" fill={AIR} />
          {/* 硬顎、軟顎 */}
          <path d="M196 118 L 252 128" stroke="#e8b89a" strokeWidth="9" strokeLinecap="round" />
          <path d="M252 128 C 272 134, 288 148, 292 164" stroke={MUCOSA} strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* 舌頭 */}
          <path d="M222 150 C 250 154, 282 168, 302 188 C 316 204, 320 222, 314 238 C 296 244, 262 236, 240 220 C 222 204, 214 178, 222 150 Z" fill={MUCOSA} stroke={MUCOSA_DARK} strokeWidth="1.5" />

          {/* 會厭 */}
          <path d="M322 232 C 316 214, 322 198, 338 190 C 334 204, 334 218, 330 232 Z" fill="#f6a6a6" stroke={MUCOSA_DARK} strokeWidth="1.5" />
          {/* 氣管（前）與軟骨環 */}
          <path d="M366 200 L 580 200 M366 234 L 580 234" stroke={MUCOSA_DARK} strokeWidth="2.5" />
          {Array.from({ length: 11 }, (_, i) => (
            <path key={i} d={`M${384 + i * 18} 200 v 34`} stroke="#f3c7c7" strokeWidth="5" opacity="0.8" />
          ))}
          {/* 聲帶 */}
          <path d="M360 200 L 372 214 M360 234 L 372 220" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          {/* 食道（後） */}
          <path d="M352 248 L 580 252 M352 270 L 580 276" stroke="#e7a072" strokeWidth="2.5" />
          {/* 甲狀軟骨（喉結） */}
          <path d="M372 194 C 384 184, 400 184, 410 194" stroke="#e8c7a5" strokeWidth="5" fill="none" />
          {/* 牙齒 */}
          <path d="M194 96 l8 0 l-2 14 l-5 0 Z" fill="#fff" stroke="#cbd5e1" />
          <path d="M214 100 l8 0 l-1 12 l-6 0 Z" fill="#fff" stroke="#cbd5e1" />
        </g>
        {/* 臉部五官 */}
        <path d="M118 96 C 126 88, 136 88, 144 94" stroke="#7c5a43" strokeWidth="2.5" fill="none" />
        <ellipse cx="100" cy="230" rx="22" ry="30" fill="#f0c3a0" stroke={SKIN_EDGE} strokeWidth="2" />
        <path d="M92 220 C 104 214, 110 236, 98 244" stroke={SKIN_EDGE} strokeWidth="2" fill="none" />

        {/* 喉頭鏡（示意） */}
        {scope && (
          <g>
            <rect x="238" y="-36" width="26" height="92" rx="8" fill="#94a3b8" stroke="#334155" strokeWidth="2" transform="rotate(14 251 10)" />
            <path d="M252 50 C 252 92, 268 140, 300 176 L 322 196" stroke="#cbd5e1" strokeWidth="7" fill="none" strokeLinecap="round" />
            <circle cx="314" cy="188" r="5" fill="#fde047" />
          </g>
        )}

        {/* 氣管內管 */}
        {tube !== 'none' && (
          <g>
            <path d={tubePath} stroke="#5fb9c6" strokeWidth="15" fill="none" strokeLinecap="round" />
            <path d={tubePath} stroke={`url(#${id}-tube)`} strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d={tubePath} stroke="#3b9aa8" strokeWidth="1.5" strokeDasharray="2 10" fill="none" opacity="0.6" />
            {/* cuff */}
            <ellipse cx={cuff.x} cy={cuff.y} rx="26" ry={cuffInflated ? 16 : 9} fill="#e0f2fe" fillOpacity="0.75" stroke="#7dd3fc" strokeWidth="1.5" />
            <circle cx={tip.x} cy={tip.y} r="4" fill="#3b9aa8" />
            {/* 15 mm 接頭 */}
            <rect x="196" y="2" width="20" height="22" rx="3" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
            {/* pilot line 與 pilot balloon */}
            <path d="M210 70 C 196 60, 176 46, 160 40" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <rect x="140" y="30" width="20" height="14" rx="7" fill="#fdba74" stroke="#c2410c" />
          </g>
        )}

        {/* 過深：冠狀面小圖顯示進入右主支氣管 */}
        {tube === 'deep' && (
          <g transform="translate(318 18)">
            <rect x="-6" y="-8" width="104" height="110" rx="10" fill="#fff" stroke="#cbd5e1" />
            <path d="M40 0 V48 L14 86 M56 0 V48 L82 86" stroke={MUCOSA_DARK} strokeWidth="3" fill="none" />
            <path d="M40 48 L 14 86 M56 48 L 82 86" stroke={MUCOSA_DARK} strokeWidth="3" />
            <path d="M48 0 V44 L 26 78" stroke="#5fb9c6" strokeWidth="8" fill="none" strokeLinecap="round" />
            <text x="46" y="100" textAnchor="middle" fontSize="9" fill="#b91c1c" fontWeight="800">
              進入右主支氣管
            </text>
            <text x="10" y="70" fontSize="8" fill="#64748b">右</text>
            <text x="78" y="70" fontSize="8" fill="#64748b">左</text>
          </g>
        )}

        {/* 頭部擺位三軸線（示意） */}
        {axes && (
          <g strokeWidth="2.5" strokeDasharray="7 5" fill="none">
            <path d={pose === 'sniff' ? 'M196 70 L 330 200' : pose === 'hyper' ? 'M196 70 L 300 230' : 'M196 70 L 350 160'} stroke="#2563eb" />
            <path d={pose === 'sniff' ? 'M260 150 L 360 216' : 'M270 140 L 340 250'} stroke="#16a34a" />
            <path d="M330 216 L 470 216" stroke="#dc2626" />
          </g>
        )}
      </g>

      {/* 標註 */}
      {labels && (
        <g fontSize={fs} fontWeight="700" fill="#334155">
          {tube !== 'none' && (
            <>
              <Leader x1={196} y1={12} x2={70} y2={12} text="此處接呼吸器（Ambu bag）" anchor="start" textX={14} />
              <Leader x1={140} y1={38} x2={96} y2={56} text="氣囊充氣處（pilot balloon）" anchor="start" textX={14} textY={62} />
              <Leader x1={cuff.x} y1={cuff.y - 16} x2={cuff.x - 10} y2={150} text="氣囊（cuff）" anchor="middle" textX={cuff.x - 10} textY={144} />
            </>
          )}
          <Leader x1={250} y1={190} x2={250} y2={300} text="舌頭" anchor="middle" textX={250} textY={316} light />
          <Leader x1={328} y1={214} x2={300} y2={330} text="會厭" anchor="middle" textX={300} textY={346} light />
          <text x="560" y="192" textAnchor="end" fill="#2563eb">
            氣管（前）
          </text>
          <text x="560" y="296" textAnchor="end" fill="#b45309">
            食道（後）
          </text>
          <text x="560" y="350" textAnchor="end" fill="#94a3b8" fontWeight="500">
            頸椎
          </text>
          <text x="10" y="424" fill="#94a3b8" fontSize="10" fontWeight="500">
            教學示意圖・非真實解剖影像
          </text>
        </g>
      )}
      {title && (
        <text x="290" y="424" textAnchor="middle" fontSize={compact ? 18 : 13} fontWeight="900" fill="#0f172a">
          {title}
        </text>
      )}
    </svg>
  );
}

function Leader({ x1, y1, x2, y2, text, anchor, textX, textY, light }: { x1: number; y1: number; x2: number; y2: number; text: string; anchor: 'start' | 'middle' | 'end'; textX: number; textY?: number; light?: boolean }) {
  return (
    <g>
      <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={light ? '#94a3b8' : '#475569'} strokeWidth="1.2" strokeDasharray="2 3" />
      <text x={textX} y={(textY ?? y2) + 4} textAnchor={anchor} fill={light ? '#64748b' : '#334155'}>
        {text}
      </text>
    </g>
  );
}

/** 頭頸外形（臉朝上；左為頭頂、右為頸部） */
const HEAD_PATH =
  'M580 186 L 432 178 C 418 168, 406 166, 394 170 C 368 168, 336 160, 306 146 C 290 138, 278 128, 270 116 C 264 104, 256 96, 244 94 C 234 94, 226 98, 220 100 C 214 104, 206 106, 200 102 C 196 96, 192 92, 186 92 C 178 92, 172 76, 166 58 C 160 66, 154 82, 144 92 C 128 96, 110 102, 96 114 C 60 140, 40 190, 42 250 C 44 310, 80 360, 140 384 C 190 402, 250 394, 290 376 C 330 358, 380 344, 440 342 L 580 342 Z';
