import { useMemo } from 'react';
import { GLOVE_DECISIONS } from '../engine';
import { EquipmentIcon } from '../ui/EquipmentIcon';
import { GloveBadge, RoomHotspots, type StageProps } from '../ui/shared';

/** 依決策點呈現手套示意圖，標出相關部位 */
function GloveDiagram({ decision }: { decision: string }) {
  const cuffInner = decision === 'first' || decision === 'second' || decision === 'adjust';
  return (
    <svg viewBox="0 0 220 150" className="h-36 w-full">
      <rect x="10" y="10" width="200" height="130" rx="10" fill="#fefce8" stroke="#eab308" />
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${40 + i * 80} 22)`}>
          <path d="M10 108 V58 l-6 -30 a5 5 0 0 1 10 -2 l6 26 V12 a5 5 0 0 1 10 0 v34 V6 a5 5 0 0 1 10 0 v40 V12 a5 5 0 0 1 10 0 v44 l8 -14 a5 5 0 0 1 9 4 l-12 30 v32 z" fill="#fde68a" stroke="#a16207" strokeWidth="1.4" />
          {/* 反折袖口 */}
          <rect x="4" y="96" width="56" height="16" rx="3" fill={cuffInner ? '#fbbf24' : '#fcd34d'} stroke="#a16207" strokeWidth="1.2" />
          {cuffInner && (
            <text x="32" y="107" textAnchor="middle" fontSize="7" fontWeight="700" fill="#78350f">
              反折
            </text>
          )}
        </g>
      ))}
      <text x="110" y="146" textAnchor="middle" fontSize="8" fill="#a16207">
        {decision === 'open' ? '內包裝紙已攤開於清潔檯面' : '手套掌面朝上，袖口已反折'}
      </text>
    </svg>
  );
}

export function GlovesStage({ state, dispatch, demoHighlight }: StageProps) {
  const g = state.gloves;
  const done = g.status === 'sterile' && g.progress >= GLOVE_DECISIONS.length;
  const decision = GLOVE_DECISIONS[Math.min(g.progress, GLOVE_DECISIONS.length - 1)];
  // 選項順序固定打散，避免正確答案總在第一個
  const options = useMemo(() => [...decision.options].sort((a, b) => (a.id.length * 7) % 5 - (b.id.length * 7) % 5), [decision]);
  const notStarted = g.progress === 0 && g.status !== 'exam';

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RoomHotspots ids={['mask-adjust', 'supply-table']} dispatch={dispatch} gloved={g.status === 'sterile'} />
        <GloveBadge state={state} />
      </div>

      {notStarted && (
        <div className="grid flex-1 grid-cols-1 content-center gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-white/90 p-4 text-center shadow-sm ring-1 ring-slate-200">
            <EquipmentIcon id="sterileGloves" size={72} />
            <p className="mt-2 text-base font-black text-slate-800">無菌手套</p>
            <p className="text-[12px] text-slate-500">{state.items.sterileGloves === 'supply' ? '目前在備物檯' : '已放在清潔檯面'}</p>
            <p className="mt-3 text-[12px] text-slate-500">撕開外包裝後開始穿戴 ↓</p>
          </div>
          <div className="rounded-3xl bg-white/90 p-4 text-center shadow-sm ring-1 ring-slate-200">
            <EquipmentIcon id="examGloves" size={72} />
            <p className="mt-2 text-base font-black text-slate-800">一般檢診手套</p>
            <p className="text-[12px] text-slate-500">備物檯上的手套盒</p>
            <button type="button" onClick={() => dispatch({ type: 'wearExamGloves' })} className="mt-3 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              戴上檢診手套
            </button>
          </div>
        </div>
      )}

      {g.status === 'exam' && (
        <div className="rounded-2xl bg-white/90 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
          目前戴著一般檢診手套。若要改戴無菌手套，請先按下方工具列的「脫下 / 更換手套」。
        </div>
      )}

      {!done && g.status !== 'exam' && (
        <div className="flex-1 rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-wider text-blue-600">
              步驟 {g.progress + 1} / {GLOVE_DECISIONS.length}｜{decision.title}
            </p>
            <div className="flex gap-1">
              {GLOVE_DECISIONS.map((d, i) => (
                <span key={d.id} className={`h-1.5 w-6 rounded-full ${i < g.progress ? 'bg-blue-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
          <GloveDiagram decision={decision.id} />
          <p className="text-sm font-bold text-slate-800">{decision.prompt}</p>
          <div className="mt-3 grid gap-2">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => dispatch({ type: 'gloveDecision', optionId: o.id })}
                className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 active:scale-[0.99] ${demoHighlight === o.id ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200' : 'border-slate-200'}`}
              >
                {demoHighlight === o.id && <span className="mb-1 block text-[11px] font-black text-emerald-700">✓ 正確做法</span>}
                {o.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {done && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-white/90 p-6 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-5xl">🧤</div>
          <p className="mt-2 text-lg font-black text-slate-800">已戴上無菌手套</p>
          <p className="mt-1 max-w-sm text-[13px] text-slate-500">雙手保持在腰部以上、視線範圍內，只碰觸無菌區與消毒過的操作區。</p>
        </div>
      )}
    </div>
  );
}
