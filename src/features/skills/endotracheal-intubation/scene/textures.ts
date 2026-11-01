import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';

/**
 * 程式產生的 PBR 貼圖（建築與布料用）：base color、roughness、normal
 * 只用於地板、牆面、床墊布料等建築／軟裝材質；病人與醫療器械不以此代替正式資產。
 */
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function heightField(n: number, seed: number, kind: 'speckle' | 'weave' | 'paint') {
  const r = rand(seed);
  const h = new Float32Array(n * n);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      let v = r() * 0.25;
      if (kind === 'weave') v += 0.5 + 0.25 * Math.sin((x / n) * Math.PI * 2 * 64) * Math.sin((y / n) * Math.PI * 2 * 64);
      if (kind === 'speckle') v += r() > 0.985 ? 0.6 : 0.3;
      if (kind === 'paint') v += 0.4 + 0.08 * Math.sin((x + y) * 0.07);
      h[y * n + x] = v;
    }
  return h;
}

function canvas(n: number, draw: (img: ImageData) => void) {
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(n, n);
  draw(img);
  ctx.putImageData(img, 0, 0);
  return c;
}

export interface PBRSet {
  map: Texture;
  roughnessMap: Texture;
  normalMap: Texture;
}

const cache = new Map<string, PBRSet>();

export function proceduralPBR(key: string, opts: { base: [number, number, number]; vary: number; kind: 'speckle' | 'weave' | 'paint'; repeat: number; rough: [number, number]; strength: number }): PBRSet {
  const hit = cache.get(key);
  if (hit) return hit;
  const n = 256;
  const h = heightField(n, key.length * 977 + 13, opts.kind);
  const at = (x: number, y: number) => h[((y + n) % n) * n + ((x + n) % n)];
  const mk = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new CanvasTexture(c);
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(opts.repeat, opts.repeat);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = SRGBColorSpace;
    return t;
  };
  const map = mk(
    canvas(n, (img) => {
      for (let i = 0; i < n * n; i++) {
        const d = (h[i] - 0.5) * opts.vary;
        img.data[i * 4] = Math.max(0, Math.min(255, opts.base[0] * (1 + d)));
        img.data[i * 4 + 1] = Math.max(0, Math.min(255, opts.base[1] * (1 + d)));
        img.data[i * 4 + 2] = Math.max(0, Math.min(255, opts.base[2] * (1 + d)));
        img.data[i * 4 + 3] = 255;
      }
    }),
    true,
  );
  const roughnessMap = mk(
    canvas(n, (img) => {
      for (let i = 0; i < n * n; i++) {
        const v = 255 * (opts.rough[0] + (opts.rough[1] - opts.rough[0]) * h[i]);
        img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
        img.data[i * 4 + 3] = 255;
      }
    }),
    false,
  );
  const normalMap = mk(
    canvas(n, (img) => {
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          const dx = (at(x + 1, y) - at(x - 1, y)) * opts.strength;
          const dy = (at(x, y + 1) - at(x, y - 1)) * opts.strength;
          const len = Math.hypot(dx, dy, 1);
          const i = (y * n + x) * 4;
          img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
          img.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
          img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
          img.data[i + 3] = 255;
        }
    }),
    false,
  );
  const set = { map, roughnessMap, normalMap };
  cache.set(key, set);
  return set;
}
