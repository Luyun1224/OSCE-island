import { useRef, useState } from 'react';
import { Draggable, useDropZone } from '../../../training/components/DragDrop';
import { EQUIPMENT_MAP, type ItemId } from '../caseData';
import { balloonGateOpen } from '../engine';
import { CATHETER_RUBRIC_CONFIG as CFG } from '../rubricConfig';
import { CTIcon } from '../ui/Icons';
import { DropArea, Pill, ReviewNote, type StageProps } from '../ui/shared';

function Port({ id, label, sub, active }: { id: 'balloon' | 'drain'; label: string; sub: string; active: boolean }) {
  return (
    <DropArea id={`ct-port-${id}`} title={label} sub={sub} className={`flex-1 ${active ? 'bg-blue-50' : 'bg-white/70'}`}>
      <div className="flex justify-center py-1">
        <svg viewBox="0 0 80 40" className="h-10">
          {id === 'drain' ? <rect x="10" y="10" width="60" height="20" rx="10" fill="#fbbf24" stroke="#b45309" /> : <path d="M10 14 h44 l10 -6 v24 l-10 -6 h-44 z" fill="#fde68a" stroke="#b45309" />}
          {id === 'balloon' && (
            <text x="34" y="24" textAnchor="middle" fontSize="8" fill="#92400e">
              閥
            </text>
          )}
          {active && <rect x="62" y="12" width="16" height="16" rx="2" fill="#93c5fd" />}
        </svg>
      </div>
    </DropArea>
  );
}

/**
 * BalloonSafetyGate：未見尿、未置入至末端時，所有水球操作都會被阻擋並記錄
 * 打水量以空針刻度拖曳，教案容量要求保留在 rubricConfig。
 */
export function BalloonStage({ state, dispatch, mode }: StageProps) {
  const c = state.catheter;
  const gate = balloonGateOpen(state);
  const [plunger, setPlunger] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const pullRef = useRef<{ y: number; t: number } | null>(null);
  useDropZone('ct-port-balloon', (p) => p.kind === 'ct-syringe' && dispatch({ type: 'syringePort', port: 'balloon' }));
  useDropZone('ct-port-drain', (p) => p.kind === 'ct-syringe' && dispatch({ type: 'syringePort', port: 'drain' }));

  const setFromPointer = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setPlunger(Math.round(f * 20) / 2);
  };

  return (
    <div className="space-y-3">
      <div className={`flex flex-wrap items-center gap-2 rounded-2xl p-3 ${gate ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-rose-50 ring-1 ring-rose-200'}`}>
        <span className="text-sm font-black">{gate ? '🔓 已達模擬定位條件，可進行水球操作' : '🔒 水球操作已鎖定'}</span>
        <Pill ok={c.urineReturned}>見尿（模擬）</Pill>
        <Pill ok={c.pos === 'inserted'}>置入至導尿管末端</Pill>
        {!gate && <span className="text-[12px] text-rose-800">水球在尿道內撐開會造成嚴重損傷；反覆點擊或拖曳也無法解鎖。</span>}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2 rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
          <p className="text-[12px] font-bold text-slate-500">① 選擇打水球的工具</p>
          <div className="grid grid-cols-3 gap-1.5">
            {(['syringe', 'water', 'jelly'] as ItemId[]).map((t) => (
              <button key={t} type="button" onClick={() => dispatch({ type: 'balloonTool', tool: t })} className={`flex flex-col items-center rounded-xl p-2 text-center ring-1 ${c.balloonTool === t ? 'bg-blue-50 ring-blue-400' : 'bg-white ring-slate-200'}`}>
                <CTIcon id={t} size={36} />
                <span className="text-[10px] font-bold leading-tight text-slate-700">{EQUIPMENT_MAP[t].name}</span>
              </button>
            ))}
          </div>
          <p className="pt-1 text-[12px] font-bold text-slate-500">② 把空針拖到導尿管尾端的正確管腔</p>
          {c.balloonTool === 'syringe' ? (
            <Draggable payload={{ kind: 'ct-syringe', id: 'syringe' }} preview={<CTIcon id="syringe" size={64} />}>
              <div className="flex items-center gap-2 rounded-xl bg-sky-50 p-2 ring-1 ring-sky-200">
                <CTIcon id="syringe" size={40} />
                <span className="text-[12px] font-bold text-sky-900">{c.syringePort === 'none' ? '按住拖曳到管腔' : `已接在${c.syringePort === 'balloon' ? '水球閥' : '引流端'}`}</span>
              </div>
            </Draggable>
          ) : (
            <p className="text-[12px] text-slate-400">先選擇工具</p>
          )}
          <div className="flex gap-2">
            <Port id="drain" label="引流端" sub="較粗・接尿袋" active={c.syringePort === 'drain'} />
            <Port id="balloon" label="水球閥" sub="側支" active={c.syringePort === 'balloon'} />
          </div>
        </div>

        <div className="space-y-2 rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
          <p className="text-[12px] font-bold text-slate-500">③ 推注射筒：拖曳設定要打入的水量（mL）</p>
          <div
            ref={bar}
            className="relative h-14 touch-none select-none rounded-xl bg-sky-50 ring-1 ring-sky-200"
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              setFromPointer(e.clientX);
            }}
            onPointerMove={(e) => e.buttons && setFromPointer(e.clientX)}
          >
            <div className="absolute inset-y-2 left-0 rounded-lg bg-sky-400/70" style={{ width: `${(plunger / 10) * 100}%` }} />
            <div className="absolute inset-y-1 w-1.5 -translate-x-1/2 rounded bg-sky-800" style={{ left: `${(plunger / 10) * 100}%` }} />
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i} className="absolute bottom-0 text-[9px] text-sky-800" style={{ left: `calc(${i * 10}% - 3px)` }}>
                {i % 2 === 0 ? i : '·'}
              </span>
            ))}
          </div>
          <p className="text-[13px] text-slate-700">
            準備打入：<b className="tabular-nums">{plunger} mL</b>
            {mode.showHints && <span className="text-slate-400">（教案要求 {CFG.balloon.minMl}–{CFG.balloon.maxMl} cc）</span>}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => dispatch({ type: 'inflate', ml: plunger })} className="flex-1 rounded-xl bg-blue-700 px-3 py-2 text-[13px] font-bold text-white">
              💧 完成打水
            </button>
            <button type="button" disabled={!c.balloonMl || c.positioned} onClick={() => dispatch({ type: 'deflate' })} className="rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-slate-600 ring-1 ring-slate-200 disabled:opacity-40">
              抽回
            </button>
          </div>
          <p className="text-[12px] text-slate-600">目前水球：{c.balloonMl ? `${c.balloonMl} mL` : '未打水'}</p>

          <p className="pt-1 text-[12px] font-bold text-slate-500">④ 輕拉導尿管至定位（向下拖曳）</p>
          <div
            className="relative h-28 touch-none select-none overflow-hidden rounded-xl bg-slate-900"
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              pullRef.current = { y: e.clientY, t: performance.now() };
            }}
            onPointerMove={(e) => {
              const p = pullRef.current;
              if (!p) return;
              const dy = e.clientY - p.y;
              if (dy < 4) return;
              const now = performance.now();
              const delta = dy / 900;
              dispatch({ type: 'pullBack', delta, rate: delta / Math.max(0.016, (now - p.t) / 1000) });
              pullRef.current = { y: e.clientY, t: now };
            }}
            onPointerUp={() => (pullRef.current = null)}
          >
            <div className="absolute left-1/2 top-2 h-8 w-24 -translate-x-1/2 rounded-full border border-dashed border-sky-400 text-center text-[10px] leading-8 text-sky-300">膀胱（示意）</div>
            <div className="absolute left-1/2 w-2 -translate-x-1/2 bg-amber-400" style={{ top: `${18 + (c.pulled / CFG.insertion.seatPull) * 26}px`, bottom: 0 }} />
            {c.balloonMl > 0 && <div className="absolute left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-sky-300/80" style={{ top: `${12 + (c.pulled / CFG.insertion.seatPull) * 26}px` }} />}
            <p className="absolute bottom-1 w-full text-center text-[10px] text-slate-400">{c.positioned ? '✓ 感覺卡住：已拉至定位（模擬）' : '按住向下輕拉'}</p>
          </div>
        </div>
      </div>
      <ReviewNote>{CFG.balloon.review.note}</ReviewNote>
    </div>
  );
}
