import { useRef, useState } from 'react';
import { Modal } from '../../../training/components/Dialogs';
import { INSTRUMENTS, MODEL, type ToolId } from '../caseData';
import { stitchSpacings, spacingOk, type Pt } from '../geometry';
import type { WSState } from '../engine';
import { CrossSection } from '../ui/CrossSection';
import { EquipmentIcon } from '../ui/EquipmentIcon';
import { HandTopView, clientToModel } from '../ui/HandTopView';
import { KnotGame, KnotPractice } from '../ui/KnotGame';
import { Suture3D } from '../ui/Suture3D';
import { GloveBadge, RoomHotspots, Stitches2D, type StageProps } from '../ui/shared';
import { IodineTrail } from './DisinfectStage';
import { DrapeShape } from './DrapeStage';

const TOOLS: { id: ToolId | 'fingers'; name: string }[] = [
  { id: 'holder', name: '持針器' },
  { id: 'forceps', name: '鑷子' },
  { id: 'scissors', name: '剪刀' },
  { id: 'fingers', name: '徒手' },
];

const PHASE_TEXT: Record<WSState['work']['phase'], string> = {
  load: '夾持縫針：選擇工具後點選縫針',
  entry: '選擇進針點：在傷口一側點選',
  exit: '選擇出針點：在傷口另一側點選',
  angle: '設定進針角度',
  pass: '穿針：沿針的弧度拖曳',
  pull: '拉出縫線',
  tie: '打結',
  cut: '剪線：選擇剪刀後剪斷縫線',
};

/** 手機版：2D 俯視縫合視圖 */
function Suture2D({ state, onPick, showRuler, showGuides }: { state: WSState; onPick: (p: Pt) => void; showRuler: boolean; showGuides: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const [zoomed, setZoomed] = useState(true);
  const w = state.work;
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-100">
      <div style={{ transform: zoomed ? 'scale(2.1)' : 'none', transformOrigin: '50% 50%' }} className="transition-transform">
        <HandTopView
          ref={svg}
          className="aspect-square w-full"
          showRuler={showRuler}
          onClick={(e) => {
            if (w.phase === 'entry' || w.phase === 'exit') onPick(clientToModel(svg.current!, e.clientX, e.clientY));
          }}
        >
          <IodineTrail strokes={state.disinfection.strokes} />
          {state.drape.center && !state.drape.removed && <DrapeShape center={state.drape.center} />}
          {showGuides && [-1, 0, 1].map((x) => <line key={x} x1={x} y1={-1.6} x2={x} y2={1.6} stroke="#16a34a" strokeWidth={0.03} strokeDasharray="0.1 0.08" />)}
          <Stitches2D stitches={state.stitches} showLabels />
          {w.entry && <circle cx={w.entry.x} cy={w.entry.y} r={0.12} fill="#2563eb" />}
          {w.exit && <circle cx={w.exit.x} cy={w.exit.y} r={0.12} fill="#16a34a" />}
          {w.entry && w.exit && <line x1={w.entry.x} y1={w.entry.y} x2={w.exit.x} y2={w.exit.y} stroke="#1e3a8a" strokeWidth={0.05} strokeDasharray="0.12 0.08" />}
        </HandTopView>
      </div>
      <button type="button" onClick={() => setZoomed((z) => !z)} className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700 shadow">
        {zoomed ? '縮小' : '🔍 放大傷口'}
      </button>
    </div>
  );
}

export function SutureStage({ state, dispatch, mode, hintLevel, isMobile, onNotice }: StageProps & { onNotice: (m: string) => void }) {
  const [practice, setPractice] = useState(false);
  const w = state.work;
  const showGuides = mode.showHints && hintLevel >= 2;
  const showRuler = mode.measuringAids;
  const gaps = stitchSpacings(state.stitches);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RoomHotspots ids={['lamp', 'sleeve', 'supply-table']} dispatch={dispatch} gloved={state.gloves.status === 'sterile'} />
        <GloveBadge state={state} />
      </div>

      {/* 工具列：器械選擇與縫針 */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/90 p-2 ring-1 ring-slate-200">
        <span className="px-1 text-[11px] font-bold text-slate-500">工具</span>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => dispatch({ type: 'selectTool', tool: t.id })}
            title={INSTRUMENTS.find((i) => i.id === t.id)?.purpose ?? '不使用器械，直接用手'}
            className={`flex items-center gap-1 rounded-xl border-2 px-2 py-1 text-[12px] font-bold transition ${state.tool === t.id ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <EquipmentIcon id={t.id} size={26} />
            {t.name}
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
        <button
          type="button"
          onClick={() => dispatch({ type: 'loadNeedle' })}
          disabled={state.needleLoaded}
          className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-[12px] font-bold text-white disabled:bg-emerald-100 disabled:text-emerald-800"
        >
          <EquipmentIcon id="needleSuture" size={24} />
          {state.needleLoaded ? '縫針已夾持' : '夾持縫針'}
        </button>
      </div>

      <div className="rounded-xl bg-blue-700 px-3 py-2 text-[13px] font-bold text-white">
        第 {state.stitches.length + 1} 針｜{PHASE_TEXT[w.phase]}
        {w.phase === 'tie' && `（${w.throws.length}/3）`}
      </div>

      <div className="grid flex-1 grid-cols-1 items-start gap-3 xl:grid-cols-[1.35fr_1fr]">
        <div className={isMobile ? '' : 'h-[24rem] xl:h-[30rem]'}>
          {isMobile ? (
            <Suture2D state={state} onPick={(p) => dispatch({ type: 'pickPoint', point: p })} showRuler={showRuler} showGuides={showGuides} />
          ) : (
            <Suture3D state={state} dispatch={dispatch} showRuler={showRuler} showGuides={showGuides} showMeasurements={mode.measuringAids} judge={mode.showHints} />
          )}
        </div>

        <div className="flex flex-col gap-3">
          {(w.phase === 'angle' || w.phase === 'pass' || w.phase === 'pull') && (
            <div className="rounded-2xl bg-white/95 p-3 ring-1 ring-slate-200">
              <p className="mb-1 text-[11px] font-bold text-slate-500">傷口截面（側視）</p>
              <CrossSection work={w} dispatch={dispatch} showReference={mode.showHints} />
            </div>
          )}
          {w.phase === 'tie' && (
            <div className="rounded-2xl bg-white/95 p-3 ring-1 ring-slate-200">
              <p className="mb-2 text-[11px] font-bold text-slate-500">器械打結</p>
              <KnotGame
                throws={w.throws}
                onThrow={(wrap, pull) => dispatch({ type: 'knotThrow', wrap, pull })}
                onUndo={() => dispatch({ type: 'undoThrow' })}
                onNotice={onNotice}
                showQuality={mode.showHints}
              />
            </div>
          )}
          {w.phase === 'cut' && (
            <div className="rounded-2xl bg-white/95 p-4 text-center ring-1 ring-slate-200">
              <p className="text-sm font-bold text-slate-700">三個結已完成，剪斷縫線</p>
              <p className="mt-1 text-[12px] text-slate-500">保留適當線頭，避免結鬆脫。</p>
              <div className="mt-3 flex justify-center gap-2">
                <button type="button" onClick={() => dispatch({ type: 'cutSuture' })} className="flex items-center gap-1 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">
                  <EquipmentIcon id="scissors" size={22} /> 剪線
                </button>
                <button type="button" onClick={() => dispatch({ type: 'undoThrow' })} className="rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-bold text-slate-600">
                  重打最後一個結
                </button>
              </div>
            </div>
          )}

          {/* 縫線紀錄與針距 */}
          <div className="rounded-2xl bg-white/95 p-3 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500">已完成 {state.stitches.length} 針{state.stitches.length < 3 ? '（至少三針）' : ''}</p>
              <button type="button" onClick={() => setPractice(true)} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100">
                🪢 打結練習場
              </button>
            </div>
            {state.stitches.length > 0 && (
              <table className="mt-2 w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] text-slate-400">
                    <th className="font-medium">針</th>
                    <th className="font-medium">進／出針角度</th>
                    <th className="font-medium">結</th>
                    {mode.measuringAids && <th className="font-medium">與前一針距</th>}
                  </tr>
                </thead>
                <tbody>
                  {state.stitches.map((s, i) => {
                    const sorted = [...state.stitches].sort((a, b) => (a.entry.x + a.exit.x) - (b.entry.x + b.exit.x));
                    const idx = sorted.indexOf(s);
                    const gap = idx > 0 ? gaps[idx - 1] : null;
                    return (
                      <tr key={s.id} className="border-t border-slate-100 text-slate-700">
                        <td className="py-1 font-bold">{i + 1}</td>
                        <td>
                          {s.entryAngle}° / {s.exitAngle}°
                        </td>
                        <td>{s.throws.length} 個</td>
                        {mode.measuringAids && <td className={gap === null ? 'text-slate-300' : !mode.showHints ? 'text-slate-700' : spacingOk(gap) ? 'text-emerald-700' : 'text-amber-700'}>{gap === null ? '—' : `${gap.toFixed(1)} cm`}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button type="button" onClick={() => dispatch({ type: 'resetStitch' })} className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50">
                重設本針
              </button>
              <button type="button" disabled={!state.stitches.length} onClick={() => dispatch({ type: 'removeLastStitch' })} className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                拆除上一針
              </button>
              <button type="button" disabled={!state.stitches.length} onClick={() => dispatch({ type: 'resetAllStitches' })} className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                全部重設
              </button>
            </div>
          </div>
          <p className="px-1 text-[11px] leading-relaxed text-slate-400">
            模擬限制：以點選位置、角度與手勢方向呈現縫合觀念，無法模擬器械握持、組織張力與皮緣外翻。模型傷口長 {MODEL.woundLength} cm（模型參數）。
          </p>
        </div>
      </div>

      {practice && (
        <Modal onClose={() => setPractice(false)} wide>
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">🪢 打結練習場</h3>
                <p className="text-[12px] text-slate-500">不影響本次評量，可重複練習繞線與拉線方向。</p>
              </div>
              <button type="button" onClick={() => setPractice(false)} className="text-2xl leading-none text-slate-400">
                ×
              </button>
            </div>
            <KnotPractice onComplete={() => dispatch({ type: 'knotPracticeDone' })} onNotice={onNotice} />
          </div>
        </Modal>
      )}
    </div>
  );
}
