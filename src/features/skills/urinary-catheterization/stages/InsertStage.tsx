import { useEffect, useRef, useState } from 'react';
import { useDropZone, Draggable } from '../../../training/components/DragDrop';
import { lubeFromTip, POS_LABEL } from '../engine';
import { CATHETER_RUBRIC_CONFIG as CFG } from '../rubricConfig';
import { MaleModel, MODEL, svgPoint } from '../ui/MaleModel';
import { DropArea, GloveBadge, ReviewNote, type StageProps } from '../ui/shared';

const TRACK = { x: 120, top: 46, bottom: 262 };
const LEN = TRACK.bottom - TRACK.top;

/**
 * CatheterInsertionSimulator
 * 1) 把導尿管尖端拖到尿道口 → 2) 進入放大的置入視圖，以拖曳／按住／鍵盤緩慢推進
 * 推進速度、方向偏離、模擬阻力、見尿與到達末端都由引擎事件判斷；進度不代表真實長度或解剖位置。
 */
export function InsertStage(props: StageProps) {
  const { state, dispatch, mode } = props;
  const c = state.catheter;
  const modelSvg = useRef<SVGSVGElement>(null);

  useDropZone('ct-insert-model', (p, x, y) => {
    if (p.kind !== 'ct-catheter' || !modelSvg.current) return;
    const q = svgPoint(modelSvg.current, x, y);
    const d = Math.hypot(q.x - MODEL.meatus.x, q.y - MODEL.meatus.y);
    const target = d <= 26 ? 'meatus' : state.drape.placed ? 'drape-edge' : q.y > 120 ? 'thigh' : 'bed';
    dispatch({ type: 'catheterToMeatus', target });
  });

  if (c.pos === 'none') {
    const ready = state.items.catheter === 'field';
    return (
      <div className="space-y-3">
        <StatusRow state={state} />
        <div className="grid gap-3 md:grid-cols-[1fr_13rem]">
          <DropArea id="ct-insert-model" title="男性導尿模型" sub="把導尿管尖端拖到尿道口">
            <div className="mx-auto aspect-[32/30] w-full max-w-lg">
              <MaleModel svgRef={modelSvg} tint={[...new Set(state.strokes.flatMap((s) => s.zones))]} drape={state.drape.placed ? { offset: state.drape.offset } : null} highlightMeatus={mode.showHints} />
            </div>
          </DropArea>
          <div className="space-y-2">
            <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
              <p className="text-[11px] font-bold text-slate-500">無菌區內的導尿管</p>
              {ready ? (
                <Draggable payload={{ kind: 'ct-catheter', id: 'catheter' }} preview={<div className="h-3 w-24 rounded-full bg-amber-400 shadow-xl ring-2 ring-amber-600" />}>
                  <div className="mt-1 flex flex-col items-center rounded-xl bg-amber-50 p-2 ring-1 ring-amber-200">
                    <svg viewBox="0 0 120 30" className="w-full">
                      <path d="M8 15 H90 L112 5 M90 15 L112 25" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" fill="none" />
                      {c.lube.length > 0 && <rect x="4" y="9" width={Math.max(6, lubeFromTip(c.lube) * 100)} height="12" rx="6" fill="#86efac" opacity="0.7" />}
                    </svg>
                    <span className="text-[11px] font-bold text-amber-900">按住拖曳尖端到尿道口</span>
                  </div>
                </Draggable>
              ) : (
                <p className="mt-1 text-[12px] text-slate-500">導尿管尚未放進無菌區。</p>
              )}
            </div>
            <ReviewNote>{CFG.insertion.review.note}</ReviewNote>
          </div>
        </div>
      </div>
    );
  }

  return <InsertionView {...props} />;
}

function StatusRow({ state }: { state: StageProps['state'] }) {
  const c = state.catheter;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <GloveBadge state={state} />
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">潤滑：由尖端 {Math.round(lubeFromTip(c.lube) * 100)}%</span>
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${c.pos === 'resistance' || c.pos === 'help' ? 'bg-rose-100 text-rose-800' : c.pos === 'inserted' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>{POS_LABEL[c.pos]}</span>
    </div>
  );
}

function InsertionView({ state, dispatch, mode }: StageProps) {
  const c = state.catheter;
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ y: number; acc: number; t: number; dev: number } | null>(null);
  const holdTimer = useRef<number>();
  const keyT = useRef(0);
  const [hold, setHold] = useState(false);
  const locked = c.pos === 'resistance' || c.pos === 'help';
  const tipY = TRACK.bottom - c.depth * LEN;

  // 按住推進：固定的安全速度
  useEffect(() => {
    if (!hold) return;
    holdTimer.current = window.setInterval(() => dispatch({ type: 'advance', delta: 0.03, rate: 0.12, deviation: 0 }), 250);
    return () => window.clearInterval(holdTimer.current);
  }, [hold, dispatch]);
  useEffect(() => {
    if (locked || c.pos === 'inserted') setHold(false);
  }, [locked, c.pos]);

  const flush = (now: number) => {
    const d = drag.current;
    if (!d || Math.abs(d.acc) < 0.012) return;
    const dt = Math.max(0.016, (now - d.t) / 1000);
    if (d.acc > 0) dispatch({ type: 'advance', delta: d.acc, rate: d.acc / dt, deviation: d.dev });
    else dispatch({ type: 'withdraw', delta: -d.acc });
    d.acc = 0;
    d.t = now;
    d.dev = 0;
  };

  return (
    <div className="space-y-3">
      <StatusRow state={state} />
      <div className="grid gap-3 md:grid-cols-[1fr_15rem]">
        <div className="relative rounded-3xl bg-slate-900 p-2 ring-1 ring-slate-700">
          <p className="absolute left-4 top-3 text-[11px] font-bold tracking-wider text-sky-300">置入放大視圖（示意）</p>
          <svg
            ref={svg}
            viewBox="0 0 240 300"
            className="mx-auto h-[26rem] max-h-[60vh] w-full touch-none select-none"
            tabIndex={0}
            aria-label="導尿管置入：按住導尿管向上拖曳推進，向下拖曳退出；或使用方向鍵上下"
            onKeyDown={(e) => {
              if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
              e.preventDefault();
              const now = performance.now();
              const dt = Math.max(0.03, (now - keyT.current) / 1000);
              keyT.current = now;
              if (e.key === 'ArrowUp') dispatch({ type: 'advance', delta: 0.025, rate: 0.025 / dt, deviation: 0 });
              else dispatch({ type: 'withdraw', delta: 0.025 });
            }}
            onPointerDown={(e) => {
              if (locked) return;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              const p = svgPoint(svg.current!, e.clientX, e.clientY);
              drag.current = { y: p.y, acc: 0, t: performance.now(), dev: 0 };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              const p = svgPoint(svg.current!, e.clientX, e.clientY);
              d.acc += (d.y - p.y) / LEN;
              d.y = p.y;
              d.dev = Math.max(d.dev, Math.abs(p.x - TRACK.x) / 70);
              flush(performance.now());
            }}
            onPointerUp={() => {
              flush(performance.now() + 1);
              drag.current = null;
            }}
            onPointerCancel={() => (drag.current = null)}
          >
            {/* 示意：膀胱與通道（非真實解剖） */}
            <ellipse cx={TRACK.x} cy="34" rx="70" ry="28" fill="#1e3a5f" stroke="#38bdf8" strokeDasharray="4 3" />
            <text x={TRACK.x} y="30" textAnchor="middle" fontSize="10" fill="#7dd3fc">
              膀胱（示意）
            </text>
            {c.urineReturned && <ellipse cx={TRACK.x} cy="40" rx="40" ry="10" fill="#facc15" opacity="0.35" />}
            <rect x={TRACK.x - 12} y={TRACK.top} width="24" height={LEN + 10} rx="12" fill="#334155" />
            <rect x={TRACK.x - 30} y={TRACK.bottom} width="60" height="22" rx="10" fill="#e9b291" />
            <text x={TRACK.x + 40} y={TRACK.bottom + 14} fontSize="9" fill="#94a3b8">
              尿道口
            </text>
            {/* 導尿管 */}
            <line x1={TRACK.x} x2={TRACK.x} y1={tipY} y2="300" stroke="#fbbf24" strokeWidth="10" strokeLinecap="round" />
            <circle cx={TRACK.x} cy={tipY} r="6" fill="#fde68a" stroke="#b45309" />
            {c.urineReturned &&
              [0, 1, 2].map((i) => (
                <circle key={i} cx={TRACK.x + 22 + i * 6} cy={292 - i * 5} r="3" fill="#facc15" className="animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            {/* 進度 */}
            <rect x="214" y={TRACK.top} width="10" height={LEN} rx="5" fill="#1e293b" />
            <rect x="214" y={TRACK.bottom - c.depth * LEN} width="10" height={c.depth * LEN} rx="5" fill={c.fastEvents ? '#f59e0b' : '#22c55e'} />
            {mode.showHints && <line x1="208" x2="230" y1={TRACK.bottom - CFG.insertion.urineAt * LEN} y2={TRACK.bottom - CFG.insertion.urineAt * LEN} stroke="#facc15" strokeDasharray="3 2" />}
            <text x="219" y={TRACK.top - 6} textAnchor="middle" fontSize="8" fill="#94a3b8">
              末端
            </text>
            {/* 戴手套的手（拖曳把手） */}
            {!locked && c.pos !== 'inserted' && (
              <g transform={`translate(${TRACK.x - 26} ${Math.min(270, tipY + 40)})`} className="cursor-grab">
                <rect width="52" height="26" rx="10" fill="#fef08a" stroke="#a16207" />
                <text x="26" y="17" textAnchor="middle" fontSize="9" fontWeight="700" fill="#713f12">
                  ↑ 拖曳
                </text>
              </g>
            )}
          </svg>
          <p className="px-2 pb-1 text-center text-[11px] text-slate-400">進度僅表示模擬流程，不代表導尿管實際長度或解剖位置。</p>
        </div>

        <div className="space-y-2">
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-400">模擬置入進度</p>
            <p className="text-2xl font-black tabular-nums text-slate-800">{Math.round(c.depth * 100)}%</p>
            <p className="text-[12px] text-slate-600">{c.urineReturned ? '💧 見尿液流出（模擬事件）' : '尚未見尿'}</p>
            {mode.showHints && c.urineReturned && c.pos !== 'inserted' && <p className="mt-1 text-[12px] font-bold text-blue-700">依教案繼續緩慢置入至導尿管末端（分叉處）。</p>}
          </div>
          {state.patientLine && <p className="rounded-2xl bg-orange-50 p-3 text-[13px] text-slate-700">🧓 {state.patientLine}</p>}

          {c.pos === 'resistance' && (
            <div className="rounded-2xl bg-rose-50 p-3 ring-2 ring-rose-300">
              <p className="text-sm font-black text-rose-800">⚠️ 推進時感到阻力（模擬事件）</p>
              <p className="mt-1 text-[12px] text-rose-900">你要怎麼做？</p>
              <div className="mt-2 grid gap-1.5">
                <button type="button" onClick={() => dispatch({ type: 'resistanceChoice', choice: 'stop-help' })} className="rounded-xl bg-white px-3 py-2 text-left text-[12px] font-bold text-slate-700 ring-1 ring-slate-200">
                  停止推進，安撫病人深呼吸放鬆，並尋求臨床教師協助
                </button>
                <button type="button" onClick={() => dispatch({ type: 'resistanceChoice', choice: 'force' })} className="rounded-xl bg-white px-3 py-2 text-left text-[12px] font-bold text-slate-700 ring-1 ring-slate-200">
                  加大力量，強行推過去
                </button>
                <button type="button" onClick={() => dispatch({ type: 'resistanceChoice', choice: 'withdraw-out' })} className="rounded-xl bg-white px-3 py-2 text-left text-[12px] font-bold text-slate-700 ring-1 ring-slate-200">
                  停止並把導尿管退出，請臨床教師評估
                </button>
              </div>
            </div>
          )}
          {c.pos === 'help' && (
            <div className="rounded-2xl bg-sky-50 p-3 ring-2 ring-sky-300">
              <p className="text-sm font-black text-sky-900">⏸ 已暫停，等待臨床教師協助</p>
              <p className="mt-1 text-[12px] text-sky-900">實際臨床中遇到不明阻力或無法確認位置時，應停止操作並尋求指導。</p>
              <button type="button" onClick={() => dispatch({ type: 'teacherResume' })} className="mt-2 w-full rounded-xl bg-sky-700 px-3 py-2 text-[12px] font-bold text-white">
                （模擬）臨床教師已評估：可繼續緩慢推進
              </button>
            </div>
          )}

          {!locked && c.pos !== 'inserted' && (
            <div className="grid gap-1.5">
              <button
                type="button"
                onPointerDown={() => setHold(true)}
                onPointerUp={() => setHold(false)}
                onPointerLeave={() => setHold(false)}
                className={`rounded-xl px-3 py-2.5 text-[13px] font-bold text-white shadow ${hold ? 'bg-emerald-800' : 'bg-emerald-600'}`}
              >
                ✋ 按住：緩慢推進
              </button>
              <button type="button" onClick={() => dispatch({ type: 'withdraw', delta: 0.05 })} className="rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-slate-600 ring-1 ring-slate-200">
                ↓ 稍微退出
              </button>
            </div>
          )}
          {c.pos === 'inserted' && <p className="rounded-2xl bg-emerald-50 p-3 text-[13px] font-bold text-emerald-800">✓ 已置入至導尿管末端（模擬）。下一步：水球與定位。</p>}
          {c.pos !== 'help' && (
            <button type="button" onClick={() => dispatch({ type: 'requestHelp' })} className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-[12px] font-bold text-rose-700">
              ✋ 停止操作，尋求臨床教師協助
            </button>
          )}
          <p className="text-[11px] text-slate-400">操作：按住畫面中的手向上拖曳推進、向下拖曳退出；鍵盤可用 ↑ ↓。拖得太快會提醒。</p>
        </div>
      </div>
    </div>
  );
}
