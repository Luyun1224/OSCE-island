import { BODY_MODEL } from '../data/anatomyModel';
import type { BodyHit, LocateTask, Side, Surface } from '../types';

/** 點擊位置 → 部位、左右側、區域、最近體表標記（純函式，可單獨測試） */
export function identify(part: BodyHit['part'], p: { x: number; y: number; z: number }): BodyHit {
  const surface: Surface = p.z >= 0 ? 'front' : 'back';
  const side: Side = Math.abs(p.x) < 0.012 ? 'midline' : p.x < 0 ? 'right' : 'left';
  const regions = part === 'torso' ? BODY_MODEL.regions.filter((r) => r.surface === surface && p.x >= r.x[0] && p.x <= r.x[1] && p.y >= r.y[0] && p.y <= r.y[1]) : [];
  let nearest: BodyHit['nearest'];
  if (part === 'torso')
    for (const l of BODY_MODEL.landmarks.filter((x) => x.surface === surface)) {
      const d = Math.hypot(l.x - p.x, l.y - p.y);
      if (!nearest || d < nearest.distM) nearest = { landmark: l, distM: d };
    }
  return { surface, x: p.x, y: p.y, side, part, regions, nearest };
}

export const SIDE_LABEL: Record<Side, string> = { right: '病人右側', left: '病人左側', midline: '中線' };
export const PART_LABEL: Record<BodyHit['part'], string> = { head: '頭部', neck: '頸部', torso: '軀幹', arm: '上肢', leg: '下肢' };

export interface LocateResult {
  ok: boolean;
  sideOk: boolean;
  surfaceOk: boolean;
  distCm?: number;
  message: string;
}

const sideHint = (view: Surface) => (view === 'back' ? '從背後看時，病人的右側在你的右手邊' : '面對病人時，病人的右側在你的左手邊');

export function checkTask(task: LocateTask, hit: BodyHit): LocateResult {
  const surfaceOk = hit.surface === task.view && hit.part === 'torso';
  const sideOk = task.side === 'midline' ? hit.side === 'midline' || Math.abs(hit.x) < 0.02 : hit.side === task.side;
  if (task.target.kind === 'region') {
    const ok = hit.regions.some((r) => r.id === task.target.id);
    const msg = ok ? '位置正確。' : !surfaceOk ? `請在${task.view === 'front' ? '身體前側' : '背側'}尋找。` : !sideOk ? `左右側不正確：目標在${SIDE_LABEL[task.side]}（${sideHint(task.view)}）。` : '不在目標區域內，參考體表標記線再試一次。';
    return { ok, sideOk, surfaceOk, message: msg };
  }
  const l = BODY_MODEL.landmarks.find((x) => x.id === task.target.id)!;
  const d = hit.surface === l.surface ? Math.hypot(l.x - hit.x, l.y - hit.y) : Infinity;
  const ok = surfaceOk && d <= l.tolerance;
  const cm = Number.isFinite(d) ? Math.round(d * 1000) / 10 : undefined;
  const msg = ok ? `位置正確（距標記約 ${cm} cm）。` : !surfaceOk ? `請在${l.surface === 'front' ? '身體前側' : '背側'}尋找。` : !sideOk ? `左右側不正確：目標在${SIDE_LABEL[task.side]}（${sideHint(task.view)}）。` : `相距約 ${cm} cm。${l.name}：${l.definition}`;
  return { ok, sideOk, surfaceOk, distCm: cm, message: msg };
}
