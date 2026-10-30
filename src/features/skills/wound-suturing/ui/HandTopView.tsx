import { forwardRef, type ReactNode } from 'react';
import { HALF_WOUND, type Pt } from '../geometry';

/**
 * 手背俯視圖（2D SVG）
 * 單位為公分，座標與縫合模型一致：傷口沿 x 軸、中心為原點，+y 朝手指方向（畫面上方）。
 * 子元素以模型座標繪製（已處理 y 軸翻轉）。
 */
export const VIEW = { minX: -10, maxX: 10, minY: -9, maxY: 9.6 };

export function clientToModel(svg: SVGSVGElement, clientX: number, clientY: number): Pt {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
  return { x: p.x, y: -p.y };
}

export const HandTopView = forwardRef<
  SVGSVGElement,
  {
    children?: ReactNode;
    className?: string;
    showRuler?: boolean;
    onPointerDown?: (e: React.PointerEvent<SVGSVGElement>) => void;
    onPointerMove?: (e: React.PointerEvent<SVGSVGElement>) => void;
    onPointerUp?: (e: React.PointerEvent<SVGSVGElement>) => void;
    onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
  }
>(function HandTopView({ children, className, showRuler, ...handlers }, ref) {
  const w = VIEW.maxX - VIEW.minX;
  const h = VIEW.maxY - VIEW.minY;
  return (
    <svg ref={ref} viewBox={`${VIEW.minX} ${-VIEW.maxY} ${w} ${h}`} className={`touch-none select-none ${className ?? ''}`} {...handlers}>
      <defs>
        <radialGradient id="skin" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#f6d2b4" />
          <stop offset="100%" stopColor="#e8b48f" />
        </radialGradient>
        <pattern id="steril" width="0.6" height="0.6" patternUnits="userSpaceOnUse">
          <rect width="0.6" height="0.6" fill="#7fbfa9" />
          <path d="M0 0.6 L0.6 0" stroke="#6aae97" strokeWidth="0.08" />
        </pattern>
      </defs>
      <rect x={VIEW.minX} y={-VIEW.maxY} width={w} height={h} fill="#dbe7ee" />
      <g transform="scale(1,-1)">
        {/* 前臂與袖口 */}
        <path d="M-5.2 -8 L-4.8 -5.6 L4.8 -5.6 L5.2 -8 Z" fill="#e8b48f" />
        <rect x="-6" y="-8.5" width="12" height="1.6" rx="0.4" fill="#6b8fb5" />
        {/* 手背 */}
        <path
          d="M-4.8 -5.6 C -5.6 -2, -5.8 2, -5.2 4.6 L -5.6 7.8 L -3.9 8 L -3.5 5.2 L -2.2 8.6 L -0.6 8.5 L -0.9 5.4 L 0.6 8.8 L 2.2 8.6 L 1.4 5.3 L 3.1 8.2 L 4.6 7.6 L 3.4 4.6 C 5.0 3.6, 5.6 1, 5.2 -1 L 7.8 1.8 L 8.6 0.8 L 5.6 -3.6 C 5.2 -4.8, 5 -5.4, 4.8 -5.6 Z"
          fill="url(#skin)"
          stroke="#c98f68"
          strokeWidth="0.08"
        />
        {/* 指節 */}
        {[-3.9, -1.5, 0.9, 3].map((x) => (
          <ellipse key={x} cx={x} cy={4.8} rx={0.7} ry={0.35} fill="#d9a07a" opacity={0.5} />
        ))}
        {/* 傷口：線狀撕裂傷 */}
        <path d={`M${-HALF_WOUND} 0 Q -1 0.18 0 0.05 Q 1 -0.12 ${HALF_WOUND} 0`} stroke="#8f1d1d" strokeWidth="0.32" strokeLinecap="round" fill="none" />
        <path d={`M${-HALF_WOUND + 0.2} 0 Q -1 0.12 0 0.04 Q 1 -0.08 ${HALF_WOUND - 0.2} 0`} stroke="#d14b4b" strokeWidth="0.12" strokeLinecap="round" fill="none" />
        {showRuler && (
          <g opacity={0.85}>
            <line x1={-HALF_WOUND - 0.5} y1={-2.2} x2={HALF_WOUND + 0.5} y2={-2.2} stroke="#1e3a8a" strokeWidth="0.04" />
            {Array.from({ length: 2 * HALF_WOUND + 2 }, (_, i) => i - HALF_WOUND - 0.5)
              .filter((v) => Number.isInteger(v))
              .map((v) => (
                <g key={v}>
                  <line x1={v} y1={-2.2} x2={v} y2={-2.55} stroke="#1e3a8a" strokeWidth="0.05" />
                  <text x={v} y={2.95} transform="scale(1,-1)" textAnchor="middle" fontSize="0.42" fill="#1e3a8a">
                    {v}
                  </text>
                </g>
              ))}
            <text x={HALF_WOUND + 0.9} y={2.3} transform="scale(1,-1)" fontSize="0.4" fill="#1e3a8a">
              cm
            </text>
          </g>
        )}
        {children}
      </g>
    </svg>
  );
});

/** 將模型座標中的文字正確顯示（抵銷 y 翻轉） */
export function ModelText({ x, y, children, size = 0.5, color = '#0f172a', anchor = 'middle' }: { x: number; y: number; children: ReactNode; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={-y} transform="scale(1,-1)" fontSize={size} fill={color} textAnchor={anchor} fontWeight={700} style={{ paintOrder: 'stroke' }} stroke="#fff" strokeWidth={size * 0.18}>
      {children}
    </text>
  );
}
