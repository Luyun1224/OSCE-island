import { useEffect, useRef, useState } from 'react';
import { HAND_AREAS, type HandAreaId } from '../sterile';

/** 手部示意圖上的搓揉部位位置（左：掌面；右：手背） */
const SPOT: Record<HandAreaId, { x: number; y: number; r: number }> = {
  palms: { x: 82, y: 138, r: 22 },
  between: { x: 82, y: 86, r: 14 },
  thumbs: { x: 38, y: 128, r: 13 },
  tips: { x: 84, y: 42, r: 14 },
  backs: { x: 238, y: 138, r: 22 },
  fingerBacks: { x: 238, y: 74, r: 16 },
};

function Hand({ x, back }: { x: number; back?: boolean }) {
  const skin = back ? '#f1c7a6' : '#f6d6bd';
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="-34" y="100" width="68" height="78" rx="22" fill={skin} stroke="#c99a76" strokeWidth="1.5" />
      {[-24, -8, 8, 24].map((fx, i) => (
        <rect key={fx} x={fx - 7} y={[44, 30, 32, 48][i]} width="14" height="72" rx="7" fill={skin} stroke="#c99a76" strokeWidth="1.5" />
      ))}
      <rect x={back ? 26 : -60} y="104" width="40" height="15" rx="7.5" fill={skin} stroke="#c99a76" strokeWidth="1.5" transform={`rotate(${back ? -35 : 35} ${back ? 30 : -30} 112)`} />
      <rect x="-30" y="178" width="60" height="18" rx="6" fill={skin} stroke="#c99a76" strokeWidth="1.5" />
      {back && [-24, -8, 8, 24].map((fx) => <path key={fx} d={`M${fx - 4} 104 q4 -4 8 0`} stroke="#c99a76" fill="none" />)}
      <text x="0" y="214" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">
        {back ? '手背面' : '掌面'}
      </text>
    </g>
  );
}

/**
 * HandHygiene：可操作的乾洗手互動（技能共用）
 * 取乾洗手液 → 在手部示意圖上「按住」各部位搓揉 → 完成後送出搓揉到的部位，由技能引擎判斷完整性。
 * 依 WHO 乾洗手步驟示意；實施細節依院內感染管制規範。
 */
export function HandHygiene({
  title,
  showLabels,
  blockedReason,
  result,
  onSubmit,
  demoAreas,
}: {
  /** 示範模式：直接顯示已搓揉的部位 */
  demoAreas?: HandAreaId[];
  title: string;
  /** 引導模式顯示部位名稱與步驟 */
  showLabels: boolean;
  blockedReason?: string | null;
  result: { areas: HandAreaId[] } | null;
  onSubmit: (areas: HandAreaId[]) => void;
}) {
  const [dispensedState, setDispensed] = useState(false);
  const [progressState, setProgress] = useState<Record<string, number>>({});
  const dispensed = demoAreas ? true : dispensedState;
  const progress: Record<string, number> = demoAreas ? Object.fromEntries(demoAreas.map((a) => [a, 1])) : progressState;
  const [holding, setHolding] = useState<HandAreaId | null>(null);
  const timer = useRef<number>();
  const rubbed = HAND_AREAS.filter((h) => (progress[h.id] ?? 0) >= 1).map((h) => h.id);

  useEffect(() => {
    if (!holding) return;
    timer.current = window.setInterval(() => setProgress((p) => ({ ...p, [holding]: Math.min(1, (p[holding] ?? 0) + 0.1) })), 70);
    return () => window.clearInterval(timer.current);
  }, [holding]);

  const reset = () => {
    setDispensed(false);
    setProgress({});
  };

  if (result) {
    const missing = HAND_AREAS.filter((h) => !result.areas.includes(h.id));
    return (
      <div className="rounded-3xl bg-white/90 p-4 ring-1 ring-slate-200">
        <p className="text-sm font-black text-slate-800">✅ {title}已完成</p>
        <p className="mt-1 text-[13px] text-slate-600">
          搓揉部位 {result.areas.length}/{HAND_AREAS.length}
          {showLabels && missing.length > 0 && <span className="text-amber-700">（漏掉：{missing.map((m) => m.title).join('、')}）</span>}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blockedReason && <p className="rounded-2xl bg-amber-50 p-3 text-[13px] font-bold text-amber-900">⚠️ {blockedReason}</p>}
      <div className="grid gap-3 md:grid-cols-[10rem_1fr]">
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
          <svg viewBox="0 0 64 80" width="72" height="90" aria-hidden>
            <path d="M22 10 h14 v6 h8" fill="none" stroke="#475569" strokeWidth="3" />
            <rect x="20" y="16" width="20" height="8" fill="#94a3b8" />
            <path d="M16 24 h28 v40 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 z" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.5" />
            {dispensed && <circle cx="44" cy="22" r="3" fill="#60a5fa" className="animate-ping" />}
          </svg>
          <p className="text-[12px] font-bold text-slate-600">乾洗手液</p>
          <button type="button" disabled={dispensed || !!blockedReason} onClick={() => setDispensed(true)} className="w-full rounded-xl bg-blue-600 px-2 py-2 text-[12px] font-bold text-white disabled:bg-slate-200 disabled:text-slate-500">
            {dispensed ? '已取足量 ✓' : '👇 按壓取液'}
          </button>
        </div>
        <div className="rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
          <p className="text-[12px] font-bold text-slate-500">{dispensed ? '按住手上的部位進行搓揉（每個部位需按住約 1 秒）' : '先按壓取乾洗手液'}</p>
          <svg viewBox="0 0 320 220" className="mx-auto mt-1 w-full max-w-md touch-none select-none">
            <Hand x={82} />
            <Hand x={238} back />
            {HAND_AREAS.map((h) => {
              const sp = SPOT[h.id];
              const p = progress[h.id] ?? 0;
              return (
                <g
                  key={h.id}
                  onPointerDown={(e) => {
                    if (!dispensed) return;
                    (e.target as Element).setPointerCapture?.(e.pointerId);
                    setHolding(h.id);
                  }}
                  onPointerUp={() => setHolding(null)}
                  onPointerLeave={() => setHolding(null)}
                  onPointerCancel={() => setHolding(null)}
                  className={dispensed ? 'cursor-pointer' : 'cursor-not-allowed'}
                  role="button"
                  aria-label={`搓揉${h.title}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (dispensed && (e.key === 'Enter' || e.key === ' ')) setProgress((q) => ({ ...q, [h.id]: 1 }));
                  }}
                >
                  <circle cx={sp.x} cy={sp.y} r={sp.r} fill={p >= 1 ? '#60a5fa' : '#bfdbfe'} opacity={dispensed ? (p >= 1 ? 0.75 : 0.35 + p * 0.4) : 0.15} stroke="#2563eb" strokeDasharray={p >= 1 ? '0' : '3 2'} />
                  {p > 0 && p < 1 && <circle cx={sp.x} cy={sp.y} r={sp.r + 4} fill="none" stroke="#1d4ed8" strokeWidth="3" strokeDasharray={`${p * 2 * Math.PI * (sp.r + 4)} 999`} transform={`rotate(-90 ${sp.x} ${sp.y})`} />}
                  {(showLabels || p >= 1) && (
                    <text x={sp.x} y={sp.y + 4} textAnchor="middle" fontSize="9" fontWeight="800" fill="#1e3a8a" pointerEvents="none">
                      {h.title.replace('掌心對掌心', '掌心')}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {showLabels && (
            <ol className="mt-1 grid grid-cols-2 gap-1 text-[11px] text-slate-600 md:grid-cols-3">
              {HAND_AREAS.map((h, i) => (
                <li key={h.id} className={rubbed.includes(h.id) ? 'font-bold text-blue-700' : ''}>
                  {i + 1}. {h.title}：{h.desc}
                </li>
              ))}
            </ol>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-slate-500">已搓揉 {rubbed.length} 個部位</span>
            <div className="flex-1" />
            <button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600">
              重新開始
            </button>
            <button type="button" disabled={!dispensed || !!blockedReason} onClick={() => onSubmit(rubbed)} className="rounded-xl bg-emerald-600 px-4 py-1.5 text-[12px] font-bold text-white disabled:bg-slate-200 disabled:text-slate-500">
              搓揉至乾，完成手部衛生
            </button>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-slate-400">依 WHO 乾洗手步驟示意；實施細節（用量、時間）依院內感染管制規範，待教師審核。</p>
    </div>
  );
}
