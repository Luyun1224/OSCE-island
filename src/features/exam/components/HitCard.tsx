import { PART_LABEL, SIDE_LABEL } from '../anatomy/identify';
import type { BodyHit } from '../types';

/** 點擊資訊：部位、左右側、區域、最近體表標記、相關檢查 */
export function HitCard({ hit }: { hit: BodyHit }) {
  const near = hit.nearest && hit.nearest.distM <= hit.nearest.landmark.tolerance * 2.5 ? hit.nearest : undefined;
  return (
    <div className="space-y-2 rounded-3xl bg-white/95 p-4 text-[13px] shadow-sm ring-1 ring-emerald-100">
      <p className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-black text-white">{PART_LABEL[hit.part]}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">{hit.surface === 'front' ? '前側' : '背側'}</span>
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800">{SIDE_LABEL[hit.side]}</span>
      </p>
      {hit.regions.map((r) => (
        <div key={r.id} className="rounded-2xl bg-slate-50 px-3 py-2" style={{ boxShadow: `inset 4px 0 0 ${r.color}` }}>
          <p className="font-black text-slate-800">{r.name}</p>
          <p className="text-slate-600">相關構造：{r.contents.join('、')}</p>
          <p className="text-slate-500">相關檢查：{r.examAreas.join('、')}</p>
        </div>
      ))}
      {near && (
        <div className="rounded-2xl bg-emerald-50 px-3 py-2">
          <p className="font-black text-emerald-900">
            📍 體表標記：{near.landmark.name}
            <span className="ml-1 text-[11px] font-bold text-emerald-700">（約 {Math.round(near.distM * 1000) / 10} cm）</span>
          </p>
          <p className="text-emerald-900">{near.landmark.definition}</p>
          <p className="text-emerald-800">相關檢查：{near.landmark.examAreas.join('、')}</p>
          <p className="mt-1 text-[11px] text-amber-700">📝 {near.landmark.review.status === 'draft' ? '位置待教師確認' : '已審核'}</p>
        </div>
      )}
      {hit.part === 'torso' && !hit.regions.length && !near && <p className="text-slate-500">此處不在目前定義的教學區域內。</p>}
      {hit.part !== 'torso' && <p className="text-slate-500">本階段的體表定位以軀幹為主；四肢與頭頸部標記將隨各系統關卡加入。</p>}
    </div>
  );
}
