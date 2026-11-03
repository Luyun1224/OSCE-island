import { useState } from 'react';
import { BodyViewer, type Marker, type Overlay, type View } from '../anatomy/BodyViewer';
import { checkTask, type LocateResult } from '../anatomy/identify';
import { HitCard } from '../components/HitCard';
import type { BodyHit, LocateTask } from '../types';

export interface LocateSummary {
  firstTry: number;
  total: number;
  sideErrors: number;
}

/** Game 2：人體定位挑戰（3D 模型可旋轉、縮放；支援正面／側面／背面） */
export function LocateGame({ tasks, onDone }: { tasks: LocateTask[]; onDone: (s: LocateSummary) => void }) {
  const [i, setI] = useState(0);
  const [view, setView] = useState<View>('front');
  const [guides, setGuides] = useState(true);
  const [hit, setHit] = useState<BodyHit | null>(null);
  const [marker, setMarker] = useState<Marker | null>(null);
  const [res, setRes] = useState<LocateResult | null>(null);
  const [tries, setTries] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [stats, setStats] = useState({ firstTry: 0, sideErrors: 0 });
  const [done, setDone] = useState(false);
  const t = tasks[i];

  const onHit = (h: BodyHit, p: [number, number, number]) => {
    if (done || res?.ok) return;
    const r = checkTask(t, h);
    setHit(h);
    setMarker({ point: p, ok: r.ok });
    setRes(r);
    setTries((n) => n + 1);
    if (r.ok && tries === 0) setStats((s) => ({ ...s, firstTry: s.firstTry + 1 }));
    if (!r.sideOk && h.part === 'torso' && h.surface === t.view) setStats((s) => ({ ...s, sideErrors: s.sideErrors + 1 }));
    if (!r.ok && tries >= 1) setReveal(true);
  };
  const next = () => {
    if (i + 1 >= tasks.length) {
      setDone(true);
      onDone({ firstTry: stats.firstTry, total: tasks.length, sideErrors: stats.sideErrors });
      return;
    }
    setI(i + 1);
    setHit(null);
    setMarker(null);
    setRes(null);
    setTries(0);
    setReveal(false);
  };
  const overlays: Overlay[] = guides ? ['lines'] : [];

  if (done)
    return (
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
        <p className="text-lg font-black text-slate-800">完成！第一次就點對：{stats.firstTry} / {tasks.length}</p>
        <p className="mt-1 text-[13px] text-slate-600">左右側錯誤 {stats.sideErrors} 次{stats.sideErrors ? '：記得病人的右側在你面對病人時的左手邊。' : '。'}</p>
        <p className="mt-2 text-[12px] text-slate-400">正確點擊模型上的位置，代表理解體表定位；不等同已具備實際身體檢查操作能力。</p>
      </div>
    );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['front', 'side', 'back'] as View[]).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} className={`rounded-full px-3 py-1.5 text-[12.5px] font-bold ${view === v ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
              {v === 'front' ? '正面' : v === 'side' ? '側面（左）' : '背面'}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-1.5 text-[12.5px] font-bold text-slate-600">
            <input type="checkbox" checked={guides} onChange={(e) => setGuides(e.target.checked)} />
            顯示體表參考線
          </label>
        </div>
        <BodyViewer view={view} overlays={overlays} marker={marker} onHit={onHit} highlightRegions={reveal && t.target.kind === 'region' ? [t.target.id] : []} highlightLandmarks={reveal && t.target.kind === 'landmark' ? [t.target.id] : []} />
        <p className="text-[11.5px] text-slate-400">拖曳旋轉、滾輪或雙指縮放；點擊模型選擇位置。</p>
      </div>
      <div className="space-y-3">
        <div className="rounded-3xl bg-emerald-700 p-4 text-white shadow">
          <p className="text-[11px] font-black tracking-widest text-emerald-200">
            第 {i + 1} / {tasks.length} 題
          </p>
          <p className="mt-1 text-lg font-black">{t.prompt}</p>
          {t.view === 'back' && view !== 'back' && <p className="mt-1 text-[12px] text-emerald-100">提示：這一題需要轉到背面。</p>}
        </div>
        {res && (
          <div className={`rounded-3xl p-4 text-[13.5px] ${res.ok ? 'bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300' : 'bg-rose-50 text-rose-900 ring-2 ring-rose-200'}`}>
            <p className="font-black">{res.ok ? '✓ 正確' : '✗ 再試一次'}</p>
            <p className="mt-0.5">{res.message}</p>
            {(res.ok || reveal) && <p className="mt-1 text-slate-700">💡 {t.why}</p>}
            {reveal && !res.ok && <p className="mt-1 font-bold text-orange-700">已在模型上標示正確位置。</p>}
          </div>
        )}
        {hit && <HitCard hit={hit} />}
        {(res?.ok || reveal) && (
          <button type="button" onClick={next} className="w-full rounded-2xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow">
            {i + 1 >= tasks.length ? '完成 →' : '下一題 →'}
          </button>
        )}
      </div>
    </div>
  );
}
