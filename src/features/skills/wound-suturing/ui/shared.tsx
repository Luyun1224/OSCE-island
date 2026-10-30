import type { TrainingModeConfig } from '../../../training/types';
import { HOTSPOTS, type HotspotId } from '../caseData';
import type { StitchRecord, WSAction, WSState } from '../engine';
import { stitchX, type Pt } from '../geometry';

export interface StageProps {
  state: WSState;
  dispatch: (a: WSAction) => void;
  mode: TrainingModeConfig;
  /** 該階段已解鎖的提示層數（引導模式） */
  hintLevel: number;
  isMobile: boolean;
}

const HOTSPOT_ICON: Record<HotspotId, string> = { lamp: '💡', sleeve: '👕', 'antiseptic-bottle': '🧴', 'supply-table': '🗄️', 'mask-adjust': '😷' };

/** 診間中的非無菌物件：戴無菌手套後碰觸會造成污染（引導模式會說明原因） */
export function RoomHotspots({ ids, dispatch, gloved }: { ids: HotspotId[]; dispatch: (a: WSAction) => void; gloved: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-bold text-slate-400">診間環境</span>
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => dispatch({ type: 'touch', hotspot: id })}
          className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:border-slate-300 hover:bg-white"
          title={gloved ? '戴著手套操作' : '徒手操作'}
        >
          {HOTSPOT_ICON[id]} {HOTSPOTS[id].prompt}
        </button>
      ))}
    </div>
  );
}

export function StatusPill({ ok, children }: { ok: boolean | null; children: React.ReactNode }) {
  const cls = ok === null ? 'bg-slate-100 text-slate-500' : ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>{children}</span>;
}

/** 手套狀態標籤 */
export function GloveBadge({ state }: { state: WSState }) {
  const g = state.gloves;
  const label = g.status === 'sterile' ? '無菌手套' : g.status === 'exam' ? '檢診手套' : g.progress > 0 ? '穿戴中' : '徒手';
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${g.status === 'sterile' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'}`}>
      🧤 {label}
    </span>
  );
}

/** 2D 縫線（俯視） */
export function Stitches2D({ stitches, showLabels }: { stitches: StitchRecord[]; showLabels?: boolean }) {
  return (
    <g>
      {stitches.map((s, i) => {
        const side: Pt = s.knotSide > 0 ? (s.entry.y > 0 ? s.entry : s.exit) : s.entry.y < 0 ? s.entry : s.exit;
        return (
          <g key={s.id}>
            <line x1={s.entry.x} y1={s.entry.y} x2={s.exit.x} y2={s.exit.y} stroke="#1e3a8a" strokeWidth={0.12} strokeLinecap="round" />
            <circle cx={s.entry.x} cy={s.entry.y} r={0.1} fill="#1e3a8a" />
            <circle cx={s.exit.x} cy={s.exit.y} r={0.1} fill="#1e3a8a" />
            <circle cx={side.x + 0.05} cy={side.y * 0.6} r={0.2} fill="#1e3a8a" />
            <path d={`M${side.x + 0.05} ${side.y * 0.6} l0.35 0.25 M${side.x + 0.05} ${side.y * 0.6} l0.35 -0.2`} stroke="#1e3a8a" strokeWidth={0.07} />
            {showLabels && (
              <text x={stitchX(s)} y={-(Math.max(s.entry.y, s.exit.y) + 0.45)} transform="scale(1,-1)" textAnchor="middle" fontSize={0.42} fontWeight={800} fill="#1e3a8a">
                {i + 1}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-2">
      <h3 className="text-sm font-black text-slate-800">{children}</h3>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}
