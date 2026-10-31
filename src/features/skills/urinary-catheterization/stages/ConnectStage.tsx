import type { ReactNode } from 'react';
import { Draggable, useDropZone, useDropState } from '../../../training/components/DragDrop';
import { CTIcon } from '../ui/Icons';
import { MaleModel } from '../ui/MaleModel';
import { GloveBadge, Pill, type StageProps } from '../ui/shared';

function Zone({ id, className, label, show }: { id: string; className: string; label: string; show: boolean }) {
  const { active, over } = useDropState(id);
  if (!show) return null;
  return (
    <div data-drop={id} className={`absolute flex items-center justify-center rounded-xl border-2 border-dashed text-[10px] font-bold transition ${over ? 'border-blue-500 bg-blue-200/70 text-blue-900' : active ? 'border-blue-400 bg-white/50 text-blue-800' : 'border-transparent text-transparent'} ${className}`}>
      {label}
    </div>
  );
}

function HangSpot({ id, label, sub, icon, chosen }: { id: string; label: string; sub?: string; icon: ReactNode; chosen: boolean }) {
  const { active, over } = useDropState(id);
  return (
    <div data-drop={id} className={`flex items-center gap-2 rounded-xl p-2 ring-1 transition ${chosen ? 'bg-emerald-50 ring-emerald-300' : over ? 'bg-blue-50 ring-blue-400' : active ? 'bg-white ring-blue-200' : 'bg-white ring-slate-200'}`}>
      <span className="text-xl">{icon}</span>
      <span className="text-[12px] font-bold text-slate-700">
        {label}
        {sub && <span className="block text-[10px] font-normal text-slate-400">{sub}</span>}
      </span>
      {chosen && <span className="ml-auto text-[11px] font-bold text-emerald-700">尿袋在這裡</span>}
    </div>
  );
}

/** DrainageBagConnector：保護蓋 → 接頭吸附連接 → 固定尿管 → 固定尿袋（四件事分別完成） */
export function ConnectStage({ state, dispatch, mode }: StageProps) {
  const inserted = state.catheter.pos === 'inserted';
  const b = state.bag;
  useDropZone('ct-drain-port', (p) => p.kind === 'ct-connector' && dispatch({ type: 'connectBag' }));
  useDropZone('ct-tape-thigh', (p) => p.kind === 'ct-tape' && dispatch({ type: 'tapeCatheter', site: 'thigh' }));
  useDropZone('ct-tape-abdomen', (p) => p.kind === 'ct-tape' && dispatch({ type: 'tapeCatheter', site: 'abdomen' }));
  useDropZone('ct-hang-bedFrame', (p) => p.kind === 'ct-bag' && dispatch({ type: 'hangBag', site: 'bedFrame' }));
  useDropZone('ct-hang-abdomen', (p) => p.kind === 'ct-bag' && dispatch({ type: 'hangBag', site: 'abdomen' }));
  useDropZone('ct-hang-rail', (p) => p.kind === 'ct-bag' && dispatch({ type: 'hangBag', site: 'rail' }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <GloveBadge state={state} />
        <Pill ok={b.connected ? b.connectedSterile || !mode.immediateFeedback : null}>尿袋連接</Pill>
        <Pill ok={state.tape.site ? true : null}>固定尿管</Pill>
        <Pill ok={b.hang ? true : null}>固定尿袋</Pill>
      </div>
      {!inserted && <p className="rounded-2xl bg-amber-50 p-3 text-[13px] text-amber-900">導尿管尚未置入（模擬）。可以先準備尿袋，但固定需在置入後進行。</p>}
      <div className="grid gap-3 md:grid-cols-[1fr_15rem]">
        <div className="relative mx-auto aspect-[32/30] w-full max-w-lg rounded-3xl bg-white/80 p-2 ring-1 ring-slate-200">
          <MaleModel drape={state.drape.placed && !b.connected ? { offset: state.drape.offset } : null} catheter={{ state: inserted ? 'inserted' : 'none', connected: b.connected, taped: !!state.tape.site }} />
          <Zone id="ct-drain-port" className="left-[60%] top-[86%] h-[12%] w-[18%]" label="引流端" show={inserted && !b.connected} />
          <Zone id="ct-tape-thigh" className="left-[64%] top-[62%] h-[18%] w-[24%]" label="大腿" show={inserted && !state.tape.site} />
          <Zone id="ct-tape-abdomen" className="left-[34%] top-[6%] h-[16%] w-[32%]" label="下腹部" show={inserted && !state.tape.site} />
        </div>
        <div className="space-y-2">
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">尿袋（{state.items.bag === 'cart' ? '在工作車上' : '在工作台上'}）</p>
            {!b.capOff ? (
              <div className="mt-1 grid gap-1.5">
                <p className="text-[12px] text-slate-600">取下接頭保護蓋：</p>
                <button type="button" onClick={() => dispatch({ type: 'capOff', method: 'cap' })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-[12px] text-slate-700 hover:border-blue-400">
                  握住保護蓋取下，接頭端不碰任何東西
                </button>
                <button type="button" onClick={() => dispatch({ type: 'capOff', method: 'tip' })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-[12px] text-slate-700 hover:border-blue-400">
                  用手指捏住接頭尖端，把保護蓋拔下來
                </button>
              </div>
            ) : !b.connected ? (
              <Draggable payload={{ kind: 'ct-connector', id: 'connector' }} preview={<div className="rounded-xl bg-white p-1 shadow-xl ring-2 ring-blue-400"><CTIcon id="bag" size={52} /></div>}>
                <div className="mt-1 flex items-center gap-2 rounded-xl bg-yellow-50 p-2 ring-1 ring-yellow-200">
                  <CTIcon id="bag" size={36} />
                  <span className="text-[12px] font-bold text-yellow-900">按住接頭，拖到導尿管引流端</span>
                </div>
              </Draggable>
            ) : (
              <p className="mt-1 text-[12px] font-bold text-emerald-700">✓ 已連接成封閉引流系統</p>
            )}
            {b.connectorContaminated && !b.connected && (
              <button type="button" onClick={() => dispatch({ type: 'remedy', kind: 'replaceBag' })} className="mt-2 w-full rounded-xl bg-amber-500 px-3 py-1.5 text-[12px] font-bold text-white">
                ♻️ 接頭碰到了：更換新的尿袋
              </button>
            )}
          </div>
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">固定尿管</p>
            {state.tape.site ? (
              <p className="text-[12px] font-bold text-emerald-700">✓ 已以紙膠固定於{state.tape.site === 'thigh' ? '大腿' : '下腹部'}</p>
            ) : (
              <Draggable payload={{ kind: 'ct-tape', id: 'tape' }} preview={<CTIcon id="tape" size={52} />} disabled={!inserted}>
                <div className="mt-1 flex items-center gap-2 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
                  <CTIcon id="tape" size={32} />
                  <span className="text-[12px] font-bold text-slate-700">拖曳紙膠到模型上固定</span>
                </div>
              </Draggable>
            )}
            {mode.showHints && <p className="mt-1 text-[10px] text-slate-400">固定位置依院內 SOP。</p>}
          </div>
          <div className="space-y-1.5 rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">固定尿袋（拖曳尿袋到位置）</p>
            {b.connected && (
              <Draggable payload={{ kind: 'ct-bag', id: 'bag' }} preview={<CTIcon id="bag" size={56} />}>
                <div className="flex items-center gap-2 rounded-xl bg-yellow-50 p-1.5 ring-1 ring-yellow-200">
                  <CTIcon id="bag" size={28} />
                  <span className="text-[11px] font-bold text-yellow-900">尿袋</span>
                </div>
              </Draggable>
            )}
            <HangSpot id="ct-hang-bedFrame" icon="🛏️" label="床緣掛勾" sub={mode.showHints ? '低於膀胱高度' : undefined} chosen={b.hang === 'bedFrame'} />
            <HangSpot id="ct-hang-abdomen" icon="🧍" label="病人腹部上" chosen={b.hang === 'abdomen'} />
            <HangSpot id="ct-hang-rail" icon="🪝" label="床頭高處欄杆" chosen={b.hang === 'rail'} />
          </div>
        </div>
      </div>
    </div>
  );
}
