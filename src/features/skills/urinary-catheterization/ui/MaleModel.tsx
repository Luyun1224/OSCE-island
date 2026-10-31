import type { ReactNode, Ref, SVGProps } from 'react';
import type { MeatusZone } from '../engine';

/**
 * 男性導尿訓練模型（俯視示意，考生位於下方）
 * 簡化幾何，僅供教學操作定位，不代表真實解剖比例。
 */
export const MODEL = {
  w: 320,
  h: 300,
  meatus: { x: 160, y: 228 },
  glans: { cx: 160, cy: 214, rx: 27, ry: 23 },
  shaft: { x: 137, y: 96, w: 46, h: 112 },
};

export function zoneAt(x: number, y: number): MeatusZone | null {
  const m = MODEL.meatus;
  if (Math.hypot(x - m.x, y - m.y) <= 10) return 'meatus';
  const g = MODEL.glans;
  if (((x - g.cx) / g.rx) ** 2 + ((y - g.cy) / g.ry) ** 2 <= 1) return 'glans';
  const s = MODEL.shaft;
  if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return 'shaft';
  return null;
}

export const distFromMeatus = (x: number, y: number) => Math.hypot(x - MODEL.meatus.x, y - MODEL.meatus.y);

export function MaleModel({
  tint = [],
  drape,
  catheter,
  children,
  highlightMeatus,
  svgRef,
  svgProps,
}: {
  svgRef?: Ref<SVGSVGElement>;
  svgProps?: SVGProps<SVGSVGElement>;
  /** 已消毒的部位 */
  tint?: MeatusZone[];
  drape?: { offset: number } | null;
  /** 導尿管外露部分：'inserted' 顯示由尿道口延伸的管路，connected 時連到尿袋 */
  catheter?: { state: 'none' | 'tip' | 'inserted'; connected?: boolean; taped?: boolean };
  children?: ReactNode;
  highlightMeatus?: boolean;
}) {
  const g = MODEL.glans;
  const s = MODEL.shaft;
  const m = MODEL.meatus;
  const iodine = '#c2833a';
  return (
    <svg ref={svgRef} viewBox={`0 0 ${MODEL.w} ${MODEL.h}`} className="h-full w-full touch-none select-none" aria-label="男性導尿訓練模型（俯視示意）" {...svgProps}>
      <defs>
        <linearGradient id="ct-skin" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6d6bd" />
          <stop offset="1" stopColor="#ecc3a3" />
        </linearGradient>
        <mask id="ct-drape-hole">
          <rect width={MODEL.w} height={MODEL.h} fill="white" />
          <circle cx={m.x + (drape?.offset ?? 0)} cy={g.cy - 6} r="46" fill="black" />
        </mask>
      </defs>
      <rect width={MODEL.w} height={MODEL.h} rx="18" fill="#e0f2fe" />
      {/* 下腹與骨盆模型 */}
      <path d="M30 18 Q160 -6 290 18 L292 128 Q160 150 28 128 Z" fill="url(#ct-skin)" stroke="#c99a76" strokeWidth="1.5" />
      <text x="160" y="40" textAnchor="middle" fontSize="10" fill="#a8785a">下腹部</text>
      {/* 大腿 */}
      <path d="M36 118 Q74 104 118 122 L112 300 L44 300 Z" fill="url(#ct-skin)" stroke="#c99a76" strokeWidth="1.5" />
      <path d="M284 118 Q246 104 202 122 L208 300 L276 300 Z" fill="url(#ct-skin)" stroke="#c99a76" strokeWidth="1.5" />
      <text x="78" y="196" textAnchor="middle" fontSize="10" fill="#a8785a">右大腿</text>
      <text x="242" y="196" textAnchor="middle" fontSize="10" fill="#a8785a">左大腿</text>
      {/* 陰莖模型 */}
      <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="20" fill="#efc4a2" stroke="#b9845f" strokeWidth="1.5" />
      {tint.includes('shaft') && <rect x={s.x + 2} y={s.y + 30} width={s.w - 4} height={s.h - 28} rx="18" fill={iodine} opacity="0.45" />}
      <ellipse cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fill="#e9b291" stroke="#b9845f" strokeWidth="1.5" />
      {tint.includes('glans') && <ellipse cx={g.cx} cy={g.cy} rx={g.rx - 2} ry={g.ry - 2} fill={iodine} opacity="0.5" />}
      <ellipse cx={m.x} cy={m.y} rx="3.5" ry="6" fill="#7c2d12" />
      {tint.includes('meatus') && <circle cx={m.x} cy={m.y} r="8" fill={iodine} opacity="0.55" />}
      {highlightMeatus && <circle cx={m.x} cy={m.y} r="14" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" className="animate-pulse" />}
      {/* 洞巾 */}
      {drape && (
        <g mask="url(#ct-drape-hole)">
          <rect x="10" y="60" width="300" height="236" rx="8" fill="#4ade80" opacity="0.88" stroke="#15803d" strokeWidth="2" />
          <path d="M10 140 h300 M10 220 h300 M110 60 v236 M210 60 v236" stroke="#22c55e" strokeWidth="1" />
        </g>
      )}
      {/* 導尿管外露部分 */}
      {catheter && catheter.state !== 'none' && (
        <g>
          <path d={`M${m.x} ${m.y + 2} C ${m.x} 260, ${m.x + 30} 274, ${catheter.connected ? 300 : m.x + 60} ${catheter.connected ? 292 : 286}`} fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
          {catheter.state === 'tip' && <circle cx={m.x} cy={m.y + 4} r="5" fill="#fbbf24" stroke="#b45309" />}
          {catheter.taped && <rect x="216" y="264" width="34" height="14" rx="2" fill="#f8fafc" stroke="#94a3b8" transform="rotate(-18 233 271)" />}
        </g>
      )}
      {children}
    </svg>
  );
}

/** 指標座標 → SVG 座標 */
export function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const r = pt.matrixTransform(svg.getScreenCTM()!.inverse());
  return { x: r.x, y: r.y };
}
