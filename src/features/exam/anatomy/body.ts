import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, Vector3 } from 'three';

/**
 * 教學示意人體（程式建模）
 * 以「體型剖面表」產生連續曲面（非 sphere／capsule 拼湊）。尺寸參考成人（身高約 1.70 m）平均比例，
 * 只用於體表定位教學；不是解剖精確模型。若日後取得授權的 3D 人體模型，需重新校正 landmarks 座標。
 * 座標：公尺；y 向上；模型面向 +z；x < 0 為病人右側。
 */
export const SUPER = 2.5;

type Row = [number, number, number];
/** 軀幹剖面：[高度 y, 半寬 w, 半厚 d] */
const TORSO: Row[] = [
  [0.8, 0.158, 0.098],
  [0.88, 0.17, 0.104],
  [0.95, 0.168, 0.104],
  [1.0, 0.156, 0.1],
  [1.06, 0.143, 0.097],
  [1.12, 0.148, 0.1],
  [1.2, 0.158, 0.107],
  [1.28, 0.166, 0.111],
  [1.35, 0.173, 0.107],
  [1.41, 0.18, 0.094],
  [1.445, 0.15, 0.074],
  [1.47, 0.07, 0.055],
];
/** 頭部剖面 */
const HEAD: Row[] = [
  [1.535, 0.05, 0.052],
  [1.57, 0.056, 0.07],
  [1.6, 0.066, 0.085],
  [1.66, 0.075, 0.095],
  [1.7, 0.077, 0.094],
  [1.735, 0.064, 0.08],
  [1.757, 0.035, 0.045],
  [1.765, 0.004, 0.005],
];

function cr(table: Row[], y: number, k: 1 | 2) {
  if (y <= table[0][0]) return table[0][k];
  const n = table.length;
  if (y >= table[n - 1][0]) return table[n - 1][k];
  let i = 0;
  while (table[i + 1][0] < y) i++;
  const p0 = table[Math.max(0, i - 1)][k];
  const p1 = table[i][k];
  const p2 = table[i + 1][k];
  const p3 = table[Math.min(n - 1, i + 2)][k];
  const t = (y - table[i][0]) / (table[i + 1][0] - table[i][0]);
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

export const torsoW = (y: number) => cr(TORSO, y, 1);
export const torsoD = (y: number) => cr(TORSO, y, 2);
export const TORSO_RANGE: [number, number] = [TORSO[0][0], TORSO[TORSO.length - 1][0]];

/** 軀幹前／後表面上某點的 z（|x| 超出寬度時回傳邊緣） */
export function surfaceZ(x: number, y: number, back = false) {
  const w = torsoW(y);
  const d = torsoD(y);
  const r = Math.min(0.999, Math.abs(x) / w);
  const z = d * Math.pow(1 - Math.pow(r, SUPER), 1 / SUPER);
  return back ? -z : z;
}

export function surfacePoint(x: number, y: number, back = false, lift = 0.002): [number, number, number] {
  return [x, y, surfaceZ(x, y, back) + (back ? -lift : lift)];
}

const SKIN = new Color('#e9bc9c');
const SHORTS = new Color('#7aa7c7');
const HAIR = new Color('#3b2f2a');

function finish(pos: number[], col: number[], idx: number[]) {
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** 由剖面表產生封閉曲面（超橢圓截面） */
function stacked(table: Row[], rings: number, radial: number, color: (x: number, y: number, z: number) => Color, bump?: (x: number, y: number) => number) {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const y0 = table[0][0];
  const y1 = table[table.length - 1][0];
  for (let r = 0; r <= rings; r++) {
    const y = y0 + ((y1 - y0) * r) / rings;
    const w = cr(table, y, 1);
    const d = cr(table, y, 2);
    for (let s = 0; s < radial; s++) {
      const a = (s / radial) * Math.PI * 2;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      const x = w * Math.sign(c) * Math.pow(Math.abs(c), 2 / SUPER);
      let z = d * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / SUPER);
      if (bump && z > 0) z += bump(x, y);
      pos.push(x, y, z);
      const cc = color(x, y, z);
      col.push(cc.r, cc.g, cc.b);
    }
  }
  for (let r = 0; r < rings; r++)
    for (let s = 0; s < radial; s++) {
      const a = r * radial + s;
      const b = r * radial + ((s + 1) % radial);
      const c = (r + 1) * radial + s;
      const d = (r + 1) * radial + ((s + 1) % radial);
      idx.push(a, c, b, b, c, d);
    }
  // 底部封口
  const base = pos.length / 3;
  pos.push(0, y0, 0);
  const cc = color(0, y0, 0);
  col.push(cc.r, cc.g, cc.b);
  for (let s = 0; s < radial; s++) idx.push(base, s, (s + 1) % radial);
  return finish(pos, col, idx);
}

/** 沿曲線掃掠、半徑可變的管狀曲面（四肢） */
function sweep(points: [number, number, number][], radii: number[], segs: number, radial: number, color: (y: number) => Color, flatten = 1) {
  const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)));
  const frames = curve.computeFrenetFrames(segs, false);
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const rAt = (t: number) => {
    const f = t * (radii.length - 1);
    const i = Math.min(radii.length - 2, Math.floor(f));
    const u = f - i;
    const s = u * u * (3 - 2 * u);
    return radii[i] * (1 - s) + radii[i + 1] * s;
  };
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const p = curve.getPointAt(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = rAt(t);
    for (let s = 0; s < radial; s++) {
      const a = (s / radial) * Math.PI * 2;
      const v = new Vector3().addScaledVector(N, Math.cos(a) * r).addScaledVector(B, Math.sin(a) * r * flatten).add(p);
      pos.push(v.x, v.y, v.z);
      const c = color(v.y);
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < segs; i++)
    for (let s = 0; s < radial; s++) {
      const a = i * radial + s;
      const b = i * radial + ((s + 1) % radial);
      const c = (i + 1) * radial + s;
      const d = (i + 1) * radial + ((s + 1) % radial);
      idx.push(a, c, b, b, c, d);
    }
  for (const [end, t] of [[0, 0], [segs, 1]] as const) {
    const p = curve.getPointAt(t);
    const center = pos.length / 3;
    pos.push(p.x, p.y, p.z);
    const c = color(p.y);
    col.push(c.r, c.g, c.b);
    for (let s = 0; s < radial; s++) idx.push(center, end * radial + ((s + 1) % radial), end * radial + s);
  }
  return finish(pos, col, idx);
}

export interface BodyGeometries {
  torso: BufferGeometry;
  head: BufferGeometry;
  neck: BufferGeometry;
  arms: BufferGeometry[];
  legs: BufferGeometry[];
  feet: BufferGeometry[];
}

export function buildBody(detail = 1): BodyGeometries {
  const rad = Math.round(48 * detail);
  const torso = stacked(TORSO, Math.round(70 * detail), rad, (_x, y) => (y < 0.885 ? SHORTS : SKIN));
  const head = stacked(HEAD, Math.round(30 * detail), Math.round(40 * detail), (_x, y, z) => (y > 1.705 || (y > 1.6 && z < -0.03) ? HAIR : SKIN), (x, y) => {
    // 鼻樑與下巴的微小起伏
    const nose = Math.exp(-((x * x) / 0.00018) - ((y - 1.645) * (y - 1.645)) / 0.0009) * 0.016;
    const chin = Math.exp(-((x * x) / 0.0012) - ((y - 1.565) * (y - 1.565)) / 0.0003) * 0.006;
    return nose + chin;
  });
  const neck = sweep(
    [
      [0, 1.43, -0.005],
      [0, 1.5, 0],
      [0, 1.56, 0.005],
    ],
    [0.06, 0.052, 0.05],
    8,
    Math.round(24 * detail),
    () => SKIN,
  );
  const arm = (sx: number) =>
    sweep(
      [
        [sx * 0.168, 1.415, -0.005],
        [sx * 0.205, 1.31, -0.012],
        [sx * 0.228, 1.13, -0.018],
        [sx * 0.243, 0.99, 0.0],
        [sx * 0.252, 0.865, 0.02],
        [sx * 0.256, 0.76, 0.03],
      ],
      [0.056, 0.047, 0.039, 0.036, 0.029, 0.03, 0.018],
      48,
      Math.round(20 * detail),
      () => SKIN,
    );
  const leg = (sx: number) =>
    sweep(
      [
        [sx * 0.085, 0.92, 0.0],
        [sx * 0.093, 0.7, 0.008],
        [sx * 0.096, 0.5, 0.012],
        [sx * 0.096, 0.3, -0.004],
        [sx * 0.095, 0.08, -0.01],
      ],
      [0.092, 0.075, 0.055, 0.05, 0.034],
      48,
      Math.round(22 * detail),
      (y) => (y > 0.79 && y < 0.9 ? SHORTS : SKIN),
    );
  const foot = (sx: number) =>
    sweep(
      [
        [sx * 0.095, 0.06, -0.035],
        [sx * 0.097, 0.04, 0.05],
        [sx * 0.1, 0.025, 0.14],
      ],
      [0.036, 0.034, 0.024],
      12,
      Math.round(16 * detail),
      () => SKIN,
      0.6,
    );
  return { torso, head, neck, arms: [arm(-1), arm(1)], legs: [leg(-1), leg(1)], feet: [foot(-1), foot(1)] };
}

/** 在前／後表面上，於矩形範圍內產生貼合曲面的薄片（區域高亮用） */
export function surfacePatch(x: [number, number], y: [number, number], back: boolean, lift = 0.0025, nx = 14, ny = 12) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= ny; j++)
    for (let i = 0; i <= nx; i++) {
      const yy = y[0] + ((y[1] - y[0]) * j) / ny;
      const w = torsoW(yy) * 0.985;
      const xx = Math.max(-w, Math.min(w, x[0] + ((x[1] - x[0]) * i) / nx));
      pos.push(...surfacePoint(xx, yy, back, lift));
    }
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i;
      const b = a + 1;
      const c = a + nx + 1;
      const d = c + 1;
      // 前側面向 +z、背側面向 -z
      if (back) idx.push(a, c, b, b, c, d);
      else idx.push(a, b, c, b, d, c);
    }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
