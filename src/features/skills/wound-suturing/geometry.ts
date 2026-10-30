import { MODEL } from './caseData';

/** 模型座標（cm）：傷口沿 x 軸，中心為原點；y 為垂直傷口方向 */
export interface Pt {
  x: number;
  y: number;
}

export const HALF_WOUND = MODEL.woundLength / 2;

/** 點到傷口線段的距離 */
export function distToWound(p: Pt) {
  const cx = Math.max(-HALF_WOUND, Math.min(HALF_WOUND, p.x));
  return Math.hypot(p.x - cx, p.y);
}

/* ---------------- 消毒 ---------------- */

export interface DisinfectionAnalysis {
  started: boolean;
  /** 起點距傷口距離 */
  startDist: number;
  /** 由外往內回擦的次數 */
  inwardReturns: number;
  /** 是否由內而外 */
  insideOut: boolean;
  /** 各方向最小涵蓋半徑（以傷口中心計） */
  coverageRadius: number;
  /** 範圍是否大於洞巾開口 */
  coversDrapeHole: boolean;
}

const SECTORS = 12;

export function analyzeDisinfection(strokes: Pt[][]): DisinfectionAnalysis {
  const pts = strokes.flat();
  if (pts.length < 4) {
    return { started: pts.length > 0, startDist: 0, inwardReturns: 0, insideOut: false, coverageRadius: 0, coversDrapeHole: false };
  }
  const startDist = distToWound(pts[0]);
  const sector = (p: Pt) => {
    const a = (Math.atan2(p.y, p.x) + Math.PI * 2) % (Math.PI * 2);
    return Math.min(SECTORS - 1, Math.floor((a / (Math.PI * 2)) * SECTORS));
  };
  // 往回擦：在同一方向上已擦到較外圍後，又回到比該方向最外圈內縮 1.2 cm 以上的位置
  // （以方向分區判斷，畫圓經過線狀傷口兩端時距離自然變化不會被誤判）
  const far = new Array(SECTORS).fill(0);
  let inwardReturns = 0;
  let inReturn = false;
  let maxR = 0;
  for (const p of pts) {
    const i = sector(p);
    const r = Math.hypot(p.x, p.y);
    if (!inReturn && far[i] > 2 && r < far[i] - 1.2) {
      inwardReturns++;
      inReturn = true;
    } else if (r >= far[i] - 0.3) {
      inReturn = false;
    }
    far[i] = Math.max(far[i], r);
    maxR = Math.max(maxR, r);
  }
  const coverageRadius = Math.min(...far);
  return {
    started: true,
    startDist,
    inwardReturns,
    insideOut: startDist <= 1 && inwardReturns === 0 && maxR >= 2.5,
    coverageRadius,
    coversDrapeHole: coverageRadius > MODEL.drapeHoleRadius,
  };
}

/* ---------------- 縫合 ---------------- */

export interface StitchGeom {
  entry: Pt;
  exit: Pt;
  entryAngle: number;
  exitAngle: number;
}

export const isPerpendicular = (deg: number) => Math.abs(deg - 90) <= MODEL.perpendicularTolerance;

export const stitchX = (s: { entry: Pt; exit: Pt }) => (s.entry.x + s.exit.x) / 2;

/** 每針與傷口的對位：進出針是否在同一條垂直線上、兩側咬合距離是否相近 */
export function stitchAlignment(s: { entry: Pt; exit: Pt }) {
  const skew = Math.abs(s.entry.x - s.exit.x);
  const biteDiff = Math.abs(Math.abs(s.entry.y) - Math.abs(s.exit.y));
  return { skew, biteDiff, aligned: skew <= 0.3, symmetric: biteDiff <= 0.3 };
}

/** 相鄰針距（依沿傷口位置排序） */
export function stitchSpacings(stitches: { entry: Pt; exit: Pt }[]) {
  const xs = stitches.map(stitchX).sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < xs.length; i++) gaps.push(xs[i] - xs[i - 1]);
  return gaps;
}

export const spacingOk = (gap: number) => gap >= MODEL.spacingRange[0] && gap <= MODEL.spacingRange[1];

/** 合法的進出針位置：在傷口長度範圍內、離傷口不太近也不太遠 */
export function validBite(p: Pt) {
  return Math.abs(p.x) <= HALF_WOUND + 0.3 && Math.abs(p.y) >= 0.2 && Math.abs(p.y) <= 1.6;
}

/**
 * 角度定義：針與皮膚表面的夾角，90° 為垂直。
 * 穿針軌跡偏離程度 → 出針角度：順著針的弧度旋轉越準確，出針越接近入針角度；直線推針會讓出針角度變斜。
 */
export function exitAngleFrom(entryAngle: number, drift: number) {
  return Math.round(Math.max(20, Math.min(90, entryAngle - drift * 120)));
}
