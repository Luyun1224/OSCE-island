import { useState } from 'react';
import { Draggable, useDropZone, type DragPayload } from '../../../training/components/DragDrop';
import { EQUIPMENT_MAP, REQUIRED_KIT, TUBE_SIZE, TUBES, type ItemId } from '../caseData';
import { trayItems } from '../engine';
import { AIRWAY_CONFIG as CFG } from '../rubricConfig';
import { AWIcon } from '../ui/Icons';
import { DropArea, Pill, SupplementNote, type StageProps } from '../ui/shared';

const preview = (id: string) => (
  <div className="rounded-2xl bg-white/95 p-1 shadow-xl ring-2 ring-indigo-400">
    <AWIcon id={id} size={52} />
  </div>
);

/** 器材準備與檢查（AirwayEquipmentTray 的操作區） */
export function PrepStage({ state, dispatch, mode, demo }: StageProps) {
  const [styletDepth, setStyletDepth] = useState(85);
  const tray = trayItems(state);
  const has = (i: ItemId) => tray.includes(i);
  const t = state.tube;

  useDropZone('aw-tray', (p: DragPayload) => p.kind === 'aw-item' && dispatch({ type: 'placeItem', item: p.id as ItemId, zone: 'tray' }));
  useDropZone('aw-handle', (p) => p.kind === 'aw-tool' && p.id === 'blade' && dispatch({ type: 'assembleScope' }));
  useDropZone('aw-pilot', (p) => p.kind === 'aw-tool' && p.id === 'syringe' && dispatch({ type: 'checkCuff', method: 'syringe' }));
  useDropZone('aw-tip', (p) => p.kind === 'aw-tool' && p.id === 'lube' && dispatch({ type: 'lubeTube' }));

  const tool = (id: ItemId, label: string, disabled?: boolean) => (
    <Draggable payload={{ kind: 'aw-tool', id }} preview={preview(id)} disabled={disabled || demo}>
      <div className="flex items-center gap-1.5 rounded-xl bg-white px-2 py-1 shadow-sm ring-1 ring-slate-200">
        <AWIcon id={id} size={26} />
        <span className="text-[11px] font-bold text-slate-700">{label}</span>
      </div>
    </Draggable>
  );

  return (
    <div className="space-y-3">
      <DropArea id="aw-tray" title="器材盤（操作區）" sub="從右側工作車拖曳器材到這裡；氣管內管拖進來即為選用的管徑" className="bg-white/70">
        <div className="flex min-h-[4.5rem] flex-wrap gap-1.5 pt-1">
          {tray.map((id) => (
            <div key={id} className="flex w-[4.6rem] flex-col items-center rounded-xl bg-white p-1 text-center shadow-sm ring-1 ring-slate-200">
              <AWIcon id={id} size={32} />
              <span className="text-[9.5px] font-bold leading-tight text-slate-700">{EQUIPMENT_MAP[id].name}</span>
            </div>
          ))}
          {!tray.length && <span className="text-[12px] text-slate-400">器材盤是空的</span>}
        </div>
      </DropArea>

      <div className="grid gap-3 md:grid-cols-2">
        {/* 喉頭鏡組裝與燈泡 */}
        <div className="rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
          <p className="text-[12px] font-black text-slate-700">① 喉頭鏡：組裝與燈泡檢查</p>
          <div className="mt-2 flex items-center gap-3">
            <DropArea id="aw-handle" title="握把" sub={state.scope.assembled ? '已組裝' : '把葉片拖到握把上'} className="flex-1 bg-slate-50">
              <div className="flex items-end justify-center gap-1 py-1">
                <AWIcon id="handle" size={52} />
                {state.scope.assembled && (
                  <svg viewBox="0 0 64 64" width="52" height="52">
                    <path d="M4 18 h14 v8 h-4 C 18 40, 34 52, 50 52 v6 C 28 58, 10 44, 8 26 h-4 z" fill="#cbd5e1" stroke="#334155" />
                    <circle cx="38" cy="50" r={state.scope.lightChecked ? 6 : 3} fill={state.scope.lightChecked ? '#fde047' : '#94a3b8'} className={state.scope.lightChecked ? 'animate-pulse' : ''} />
                  </svg>
                )}
              </div>
            </DropArea>
            <div className="space-y-1.5">
              {!state.scope.assembled && has('blade') && tool('blade', '喉頭鏡葉片')}
              {!has('handle') || !has('blade') ? <p className="text-[11px] text-slate-400">需要握把與葉片都在器材盤</p> : null}
              <button type="button" disabled={!state.scope.assembled} onClick={() => dispatch({ type: 'checkLight' })} className="rounded-xl bg-amber-500 px-3 py-1.5 text-[12px] font-bold text-white disabled:bg-slate-200 disabled:text-slate-500">
                {state.scope.lightChecked ? '💡 燈泡會亮' : '打開葉片檢查燈泡'}
              </button>
            </div>
          </div>
        </div>

        {/* 氣管內管 */}
        <div className="rounded-3xl bg-white/90 p-3 ring-1 ring-slate-200">
          <p className="text-[12px] font-black text-slate-700">② 氣管內管：管徑、cuff、潤滑、通條</p>
          {!t.size ? (
            <p className="mt-2 text-[12px] text-slate-500">從工作車把要使用的氣管內管（ID 6.5／7.0／7.5／8.0）拖到器材盤。</p>
          ) : (
            <>
              <svg viewBox="0 0 300 70" className="mt-1 w-full">
                <path d="M20 40 H250" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                <ellipse cx="44" cy="40" rx="18" ry={t.cuffChecked ? 13 : 8} fill="#bae6fd" opacity="0.8" />
                {t.lubed && <rect x="14" y="31" width="58" height="18" rx="9" fill="#86efac" opacity="0.6" />}
                <path d="M90 34 C 120 10, 160 10, 190 18" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <circle cx="194" cy="18" r="6" fill="#bae6fd" stroke="#0369a1" />
                <rect x="250" y="32" width="26" height="16" rx="3" fill="#94a3b8" />
                {t.stylet !== 'none' && <path d={`M276 40 H${t.stylet === 'protruding' ? 6 : 26}`} stroke="#737373" strokeWidth="2.5" />}
                <text x="140" y="64" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0f172a">
                  ID {TUBE_SIZE[t.size]!.toFixed(1)}
                </text>
                <text x="10" y="64" fontSize="9" fill="#64748b">
                  管端
                </text>
              </svg>
              <div className="mt-1 grid grid-cols-2 gap-1.5">
                <DropArea id="aw-pilot" title="pilot balloon" sub="拖空針到這裡打氣檢查" className="bg-sky-50">
                  <span className="text-[11px] font-bold text-sky-800">{t.cuffChecked ? '✓ cuff 完整（已抽回）' : '—'}</span>
                </DropArea>
                <DropArea id="aw-tip" title="管端" sub="拖潤滑液到這裡" className="bg-emerald-50">
                  <span className="text-[11px] font-bold text-emerald-800">{t.lubed ? '✓ 已塗潤滑液' : '—'}</span>
                </DropArea>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {has('syringe') && !t.cuffChecked && tool('syringe', '10 mL 空針')}
                {has('lube') && !t.lubed && tool('lube', '潤滑液')}
                {!t.cuffChecked && (
                  <button type="button" onClick={() => dispatch({ type: 'checkCuff', method: 'squeeze' })} className="rounded-xl bg-white px-2 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                    用手捏 pilot balloon 檢查
                  </button>
                )}
              </div>
              {has('stylet') && (
                <div className="mt-2 rounded-xl bg-slate-50 p-2">
                  <p className="text-[11px] font-bold text-slate-600">通條插入深度（拖曳滑桿，右側為管尖）</p>
                  <input type="range" min={40} max={110} value={styletDepth} onChange={(e) => setStyletDepth(Number(e.target.value))} className="w-full accent-slate-600" aria-label="通條插入深度" />
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>較淺</span>
                    {mode.showHints && <span>100 以上＝超出管尖</span>}
                    <span>較深</span>
                  </div>
                  <button type="button" onClick={() => dispatch({ type: 'insertStylet', protruding: styletDepth > 100 })} className="mt-1 rounded-lg bg-slate-700 px-3 py-1 text-[11px] font-bold text-white">
                    {t.stylet === 'none' ? '置入通條' : '重新放置通條'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/80 p-2">
        <button type="button" disabled={state.handRub} onClick={() => dispatch({ type: 'handRub' })} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 disabled:bg-emerald-50 disabled:text-emerald-700">
          {state.handRub ? '✓ 已手部衛生' : '🧴 乾性洗手液'}
        </button>
        <button type="button" disabled={state.glovesOn} onClick={() => dispatch({ type: 'wearGloves' })} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 disabled:bg-emerald-50 disabled:text-emerald-700">
          {state.glovesOn ? '✓ 已戴檢診手套' : '🧤 戴檢診手套'}
        </button>
        <span className="text-[10px] text-slate-400">（教案假設已穿隔離衣與護目鏡；手部衛生與手套不在 14 項評分中）</span>
      </div>

      {mode.showHints ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/80 p-2">
          <span className="text-[11px] font-bold text-slate-500">教案第 1 項物品</span>
          {REQUIRED_KIT.map((k) => (
            <Pill key={k.label} ok={k.ok(tray) ? true : null}>
              {k.label}
            </Pill>
          ))}
          <span className="text-[11px] text-slate-400">｜管徑要求：ID {CFG.caseRequirement.tubeSizes.map((x) => x.toFixed(1)).join(' 或 ')}</span>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500">系統不會替你補齊器材，也不會公布管徑是否正確；結束後回饋。</p>
      )}
      {TUBES.filter((x) => has(x)).length > 1 && <p className="text-[11px] text-slate-500">器材盤上有多支氣管內管，最後拖入的 ID {state.tube.size ? TUBE_SIZE[state.tube.size]!.toFixed(1) : ''} 為本次使用。</p>}
      <SupplementNote>{CFG.review.stylet.note}</SupplementNote>
    </div>
  );
}
