import { useRef, useState } from 'react';
import type { ThrowRecord } from '../engine';

/**
 * 器械打結小遊戲（簡化手勢模擬）
 * 每個結三個動作：① 縫線繞持針器一圈（拖曳畫圈，方向即繞線方向）② 夾住線尾 ③ 朝跨越傷口方向拉緊
 * 方結原則：每個結的繞線方向與拉線方向都與前一個相反。
 * 限制：無法模擬實際拉線力道與結是否真正收緊，只呈現方向觀念。
 */
type Sub = 'wrap' | 'grab' | 'pull';
const C = { x: 50, y: 50 };

export function KnotGame({
  throws,
  onThrow,
  onUndo,
  onNotice,
  showQuality,
  required = 3,
}: {
  throws: ThrowRecord[];
  onThrow: (wrap: 'cw' | 'ccw', pull: 1 | -1) => void;
  onUndo?: () => void;
  onNotice: (msg: string) => void;
  showQuality: boolean;
  required?: number;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [sub, setSub] = useState<Sub>('wrap');
  const [wrap, setWrap] = useState<'cw' | 'ccw' | null>(null);
  const [acc, setAcc] = useState(0);
  const [pullVec, setPullVec] = useState<{ x: number; y: number } | null>(null);
  const g = useRef<{ last: number; acc: number } | null>(null);
  const pullStart = useRef<{ x: number; y: number } | null>(null);

  const done = throws.length >= required;
  // 線尾位置隨每個結交替（上 / 下）
  const tailTop = throws.length % 2 === 0;
  const tail = { x: 50, y: tailTop ? 14 : 86 };

  const local = (e: React.PointerEvent) => {
    const p = svg.current!.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const r = p.matrixTransform(svg.current!.getScreenCTM()!.inverse());
    return { x: r.x, y: r.y };
  };

  const down = (e: React.PointerEvent) => {
    if (done) return;
    const p = local(e);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (sub === 'wrap') {
      g.current = { last: Math.atan2(p.y - C.y, p.x - C.x), acc: 0 };
    } else if (sub === 'grab') {
      if (Math.hypot(p.x - tail.x, p.y - tail.y) < 12) setSub('pull');
      else onNotice('請點選線尾（虛線圓圈處）夾住線尾');
    } else if (sub === 'pull') {
      pullStart.current = p;
    }
  };

  const move = (e: React.PointerEvent) => {
    const p = local(e);
    if (sub === 'wrap' && g.current) {
      const a = Math.atan2(p.y - C.y, p.x - C.x);
      let d = a - g.current.last;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      g.current.acc += d;
      g.current.last = a;
      setAcc(g.current.acc);
      if (Math.abs(g.current.acc) >= Math.PI * 1.8) {
        setWrap(g.current.acc > 0 ? 'cw' : 'ccw');
        setSub('grab');
        g.current = null;
        setAcc(0);
      }
    } else if (sub === 'pull' && pullStart.current) {
      setPullVec({ x: p.x - pullStart.current.x, y: p.y - pullStart.current.y });
    }
  };

  const up = () => {
    if (sub === 'wrap') {
      if (g.current && Math.abs(g.current.acc) > 0.3) onNotice('繞線需要繞持針器一整圈');
      g.current = null;
      setAcc(0);
    } else if (sub === 'pull' && pullVec) {
      const len = Math.hypot(pullVec.x, pullVec.y);
      if (len > 18) {
        if (Math.abs(pullVec.x) > Math.abs(pullVec.y)) {
          onNotice('沿著傷口方向拉，結無法平貼；請朝跨越傷口的方向（上 / 下）拉緊');
        } else {
          onThrow(wrap!, pullVec.y < 0 ? 1 : -1);
          setSub('wrap');
          setWrap(null);
        }
      }
      pullStart.current = null;
      setPullVec(null);
    }
  };

  const arcPath = (() => {
    if (!acc) return '';
    const r = 16;
    const start = -Math.PI / 2;
    const end = start + acc;
    const large = Math.abs(acc) > Math.PI ? 1 : 0;
    const sweep = acc > 0 ? 1 : 0;
    return `M${C.x + r * Math.cos(start)} ${C.y + r * Math.sin(start)} A${r} ${r} 0 ${large} ${sweep} ${C.x + r * Math.cos(end)} ${C.y + r * Math.sin(end)}`;
  })();

  return (
    <div>
      <div className="flex items-start gap-3">
        <svg ref={svg} viewBox="0 0 100 100" className="h-52 w-52 shrink-0 touch-none select-none rounded-2xl bg-[#f6d2b4] md:h-56 md:w-56" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          {/* 傷口與縫線 */}
          <line x1="10" y1="50" x2="90" y2="50" stroke="#8f1d1d" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="38" r="1.6" fill="#1e3a8a" />
          <circle cx="50" cy="62" r="1.6" fill="#1e3a8a" />
          <path d={`M50 38 Q ${tailTop ? '46 26' : '54 74'} ${tail.x} ${tail.y}`} fill="none" stroke="#1e3a8a" strokeWidth="1.2" />
          <path d={`M50 62 Q 70 ${tailTop ? 80 : 20} 92 ${tailTop ? 92 : 8}`} fill="none" stroke="#1e3a8a" strokeWidth="1.2" />
          {/* 線尾目標 */}
          {sub === 'grab' && <circle cx={tail.x} cy={tail.y} r="8" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />}
          {/* 持針器 */}
          <g opacity={0.9}>
            <line x1="50" y1="50" x2="78" y2="74" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="50" cy="50" r="3" fill="#475569" />
          </g>
          {sub === 'wrap' && <circle cx={C.x} cy={C.y} r="16" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 2" />}
          {arcPath && <path d={arcPath} fill="none" stroke="#1e3a8a" strokeWidth="1.6" />}
          {wrap && sub !== 'wrap' && <circle cx={C.x} cy={C.y} r="7" fill="none" stroke="#1e3a8a" strokeWidth="1.4" />}
          {pullVec && <line x1="50" y1="50" x2={50 + pullVec.x} y2={50 + pullVec.y} stroke="#2563eb" strokeWidth="1.4" markerEnd="url(#arrow)" />}
          <defs>
            <marker id="arrow" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L6 3 L0 6 z" fill="#2563eb" />
            </marker>
          </defs>
          {done && (
            <g>
              <circle cx="50" cy="32" r="3.2" fill="#1e3a8a" />
              <text x="50" y="96" textAnchor="middle" fontSize="6" fontWeight="700" fill="#14532d">
                三個結完成
              </text>
            </g>
          )}
        </svg>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex gap-1.5">
            {Array.from({ length: required }, (_, i) => {
              const t = throws[i];
              return (
                <div key={i} className={`flex h-14 flex-1 flex-col items-center justify-center rounded-xl border-2 text-[11px] font-bold ${t ? (showQuality && !t.alternated ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-blue-500 bg-blue-50 text-blue-700') : 'border-dashed border-slate-300 text-slate-400'}`}>
                  <span>第 {i + 1} 結</span>
                  {t && (
                    <span className="text-[13px]">
                      {t.wrap === 'cw' ? '↻' : '↺'} {t.pull > 0 ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {!done && (
            <ol className="space-y-1 text-[12px]">
              {(['wrap', 'grab', 'pull'] as Sub[]).map((s, i) => (
                <li key={s} className={`rounded-lg px-2 py-1 ${sub === s ? 'bg-blue-600 font-bold text-white' : 'text-slate-500'}`}>
                  {i + 1}. {s === 'wrap' ? '在持針器周圍畫一圈繞線' : s === 'grab' ? '點選線尾，以持針器夾住' : '朝跨越傷口方向拖曳拉緊'}
                </li>
              ))}
            </ol>
          )}
          {showQuality && throws.length > 1 && (
            <p className={`rounded-lg px-2 py-1 text-[12px] font-bold ${throws.every((t) => t.alternated) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {throws.every((t) => t.alternated) ? '方向交替 → 方結' : '有結與前一結同方向 → 容易形成祖母結'}
            </p>
          )}
          {onUndo && throws.length > 0 && (
            <button type="button" onClick={onUndo} className="text-[12px] font-bold text-slate-500 underline-offset-2 hover:underline">
              ↶ 重打上一個結
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** 打結練習場：不影響評分，可無限次重複 */
export function KnotPractice({ onComplete, onNotice }: { onComplete: () => void; onNotice: (m: string) => void }) {
  const [throws, setThrows] = useState<ThrowRecord[]>([]);
  const [rounds, setRounds] = useState(0);
  const add = (wrap: 'cw' | 'ccw', pull: 1 | -1) => {
    const prev = throws[throws.length - 1];
    const next = [...throws, { wrap, pull, alternated: !prev || (prev.wrap !== wrap && prev.pull !== pull) }];
    setThrows(next);
    if (next.length === 3) {
      setRounds((r) => r + 1);
      onComplete();
    }
  };
  return (
    <div>
      <KnotGame throws={throws} onThrow={add} onUndo={() => setThrows((t) => t.slice(0, -1))} onNotice={onNotice} showQuality />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[12px] text-slate-500">已完成 {rounds} 組三個結</p>
        <button type="button" onClick={() => setThrows([])} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">
          再練一次
        </button>
      </div>
    </div>
  );
}
