import { useRef, useState } from 'react';
import type { SutureWork, WSAction } from '../engine';

/**
 * 傷口截面圖（2D）：設定進針角度、沿針的弧度拖曳穿針、拉出縫線。
 * 角度定義為針與皮膚表面的夾角，90° 為垂直。
 * 弧線幾何：通過進針點 E 與出針點 X 的圓，於 E 點切線與皮膚夾角 = 進針角度。
 */
const U_MIN = -2.4;
const U_MAX = 2.4;

export function arcGeometry(dEntry: number, dExit: number, angleDeg: number) {
  const uE = -dEntry;
  const uX = dExit;
  const L = uX - uE;
  const t = (Math.max(15, Math.min(90, angleDeg)) * Math.PI) / 180;
  const R = L / (2 * Math.sin(t));
  const cu = (uE + uX) / 2;
  const cv = -R * Math.cos(t); // 圓心在皮膚上方（v 向下為正）
  const phiE = Math.PI / 2 + t;
  const phiX = Math.PI / 2 - t;
  return { uE, uX, L, R, cu, cv, phiE, phiX, depth: R - R * Math.cos(t) };
}

export function CrossSection({
  work,
  dispatch,
  showReference,
}: {
  work: SutureWork;
  dispatch: (a: WSAction) => void;
  showReference: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ mode: 'angle' | 'pass' | 'pull'; driftSum: number; n: number; start?: { u: number; v: number } } | null>(null);
  const [pullOffset, setPullOffset] = useState(0);

  const dEntry = Math.abs(work.entry?.y ?? 0.6);
  const dExit = Math.abs(work.exit?.y ?? 0.6);
  const g = arcGeometry(dEntry, dExit, work.entryAngle);
  const progress = work.phase === 'pass' ? work.passProgress : work.phase === 'angle' ? 0 : 1;
  const tipPhi = g.phiE - progress * (g.phiE - g.phiX);
  const pt = (phi: number) => ({ u: g.cu + g.R * Math.cos(phi), v: g.cv + g.R * Math.sin(phi) });
  const tip = pt(tipPhi);

  const toLocal = (e: React.PointerEvent) => {
    const p = svg.current!.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const r = p.matrixTransform(svg.current!.getScreenCTM()!.inverse());
    return { u: r.x, v: r.y };
  };

  const angleFromPointer = (u: number, v: number) => {
    // 可拖曳針身（皮膚上方）或針尖方向（組織內），兩者對稱
    const a = (Math.atan2(Math.abs(v), Math.abs(u - g.uE)) * 180) / Math.PI;
    return Math.max(30, Math.min(90, a));
  };

  const down = (e: React.PointerEvent) => {
    const p = toLocal(e);
    if (work.phase === 'angle') {
      drag.current = { mode: 'angle', driftSum: 0, n: 0 };
      dispatch({ type: 'setAngle', angle: angleFromPointer(p.u, p.v) });
    } else if (work.phase === 'pass') {
      if (Math.hypot(p.u - tip.u, p.v - tip.v) > 0.7) return;
      drag.current = { mode: 'pass', driftSum: 0, n: 0 };
    } else if (work.phase === 'pull') {
      drag.current = { mode: 'pull', driftSum: 0, n: 0, start: p };
    } else return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = toLocal(e);
    if (d.mode === 'angle') {
      dispatch({ type: 'setAngle', angle: angleFromPointer(p.u, p.v) });
    } else if (d.mode === 'pass') {
      const phi = Math.atan2(p.v - g.cv, p.u - g.cu);
      const prog = (g.phiE - phi) / (g.phiE - g.phiX);
      const r = Math.hypot(p.u - g.cu, p.v - g.cv);
      d.driftSum += Math.abs(r - g.R) / g.R;
      d.n += 1;
      if (prog > work.passProgress && prog - work.passProgress < 0.35) dispatch({ type: 'passProgress', progress: prog });
      if (prog >= 0.97) {
        dispatch({ type: 'passComplete', drift: d.n ? d.driftSum / d.n : 0 });
        drag.current = null;
      }
    } else if (d.mode === 'pull' && d.start) {
      const dist = Math.hypot(p.u - d.start.u, p.v - d.start.v);
      setPullOffset(Math.min(2, dist));
      if (dist > 1.4) {
        dispatch({ type: 'pullThrough' });
        drag.current = null;
        setPullOffset(0);
      }
    }
  };

  const up = () => {
    drag.current = null;
    setPullOffset(0);
  };

  // 已穿過的路徑（縫線）
  const traversed: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const phi = g.phiE - (i / 24) * progress * (g.phiE - g.phiX);
    const q = pt(phi);
    traversed.push(`${i ? 'L' : 'M'}${q.u.toFixed(3)} ${q.v.toFixed(3)}`);
  }
  // 針體：從針尖往後一段固定弧長
  const needleSweep = Math.min(2.2, (g.phiE - g.phiX) * 1.1);
  const needle: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const phi = tipPhi + (i / 20) * needleSweep;
    const q = pt(phi);
    needle.push(`${i ? 'L' : 'M'}${q.u.toFixed(3)} ${q.v.toFixed(3)}`);
  }
  const back = pt(tipPhi + needleSweep);

  const angleRad = (work.entryAngle * Math.PI) / 180;

  return (
    <div className="relative">
      <svg ref={svg} viewBox={`${U_MIN} -1.6 ${U_MAX - U_MIN} 3.9`} className="h-48 w-full touch-none select-none md:h-56" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <rect x={U_MIN} y={-1.6} width={U_MAX - U_MIN} height={1.6} fill="#f1f5f9" />
        {/* 皮膚分層 */}
        <rect x={U_MIN} y={0} width={U_MAX - U_MIN} height={0.12} fill="#e8b48f" />
        <rect x={U_MIN} y={0.12} width={U_MAX - U_MIN} height={0.55} fill="#f2c7a5" />
        <rect x={U_MIN} y={0.67} width={U_MAX - U_MIN} height={1.7} fill="#fbe7a6" />
        {[...Array(9)].map((_, i) => (
          <circle key={i} cx={U_MIN + 0.3 + i * 0.55} cy={1.3 + (i % 2) * 0.35} r={0.2} fill="#f8dc85" />
        ))}
        {/* 傷口裂縫 */}
        <path d="M-0.12 0 L0.12 0 L0.03 0.95 L-0.03 0.95 Z" fill="#8f1d1d" />
        <text x={U_MIN + 0.1} y={0.4} fontSize={0.14} fill="#9a5b3c">真皮</text>
        <text x={U_MIN + 0.1} y={1.05} fontSize={0.14} fill="#a16207">皮下組織</text>

        {showReference && work.entry && (
          <line x1={g.uE} y1={-1.2} x2={g.uE} y2={1.4} stroke="#16a34a" strokeWidth={0.02} strokeDasharray="0.08 0.06" />
        )}

        {/* 進出針點 */}
        <circle cx={g.uE} cy={0} r={0.06} fill="#2563eb" />
        <circle cx={g.uX} cy={0} r={0.06} fill="#16a34a" />

        {work.phase === 'angle' && (
          <g>
            <line x1={g.uE} y1={0} x2={g.uE - Math.cos(angleRad) * 1.3} y2={-Math.sin(angleRad) * 1.3} stroke="#475569" strokeWidth={0.06} strokeLinecap="round" />
            <line x1={g.uE} y1={0} x2={g.uE + Math.cos(angleRad) * 0.9} y2={Math.sin(angleRad) * 0.9} stroke="#475569" strokeWidth={0.03} strokeDasharray="0.06 0.05" />
            <path d={`M${g.uE + 0.45} 0 A0.45 0.45 0 0 1 ${g.uE + Math.cos(angleRad) * 0.45} ${Math.sin(angleRad) * 0.45}`} fill="none" stroke="#2563eb" strokeWidth={0.025} />
            <text x={g.uE + 0.55} y={0.35} fontSize={0.2} fontWeight={800} fill="#1d4ed8">
              {work.entryAngle}°
            </text>
          </g>
        )}

        {work.phase !== 'angle' && (
          <>
            <path d={traversed.join(' ')} fill="none" stroke="#1e3a8a" strokeWidth={0.035} />
            {work.phase === 'pass' && <path d={needle.join(' ')} fill="none" stroke="#64748b" strokeWidth={0.06} strokeLinecap="round" />}
            {work.phase === 'pass' && <circle cx={back.u} cy={back.v} r={0.09} fill="#475569" />}
            {work.phase === 'pass' && <circle cx={tip.u} cy={tip.v} r={0.22} fill="#3b82f6" opacity={0.25} className="animate-pulse" />}
            {work.phase === 'pull' && (
              <path d={`M${g.uX} 0 q 0.3 ${-0.5 - pullOffset * 0.3} ${0.6 + pullOffset * 0.4} ${-0.9 - pullOffset * 0.2}`} fill="none" stroke="#1e3a8a" strokeWidth={0.035} />
            )}
            {work.exitAngle !== null && (
              <text x={g.uX + 0.1} y={-0.15} fontSize={0.18} fontWeight={800} fill="#15803d">
                出針 {work.exitAngle}°
              </text>
            )}
          </>
        )}
      </svg>
      <p className="mt-1 text-center text-[11px] text-slate-500">
        {work.phase === 'angle' && '在截面圖上拖曳設定進針角度（針與皮膚的夾角），再按「確認角度」'}
        {work.phase === 'pass' && '按住藍色針尖，順著針的弧度拖曳，讓針從另一側穿出'}
        {work.phase === 'pull' && '在截面圖上往外拖曳，拉出縫線'}
        {(work.phase === 'tie' || work.phase === 'cut') && '縫線已穿過兩側皮緣'}
      </p>
      {work.phase === 'angle' && (
        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={30}
            max={90}
            value={work.entryAngle}
            onChange={(e) => dispatch({ type: 'setAngle', angle: Number(e.target.value) })}
            className="flex-1 accent-blue-700"
            aria-label="進針角度"
          />
          <button type="button" onClick={() => dispatch({ type: 'confirmAngle' })} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">
            確認角度 {work.entryAngle}°
          </button>
        </div>
      )}
    </div>
  );
}
