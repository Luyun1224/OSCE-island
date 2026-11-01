import { Draggable, useDropZone, useDropState } from '../../../training/components/DragDrop';
import { AIRWAY_CONFIG as CFG } from '../rubricConfig';
import { AWIcon } from '../ui/Icons';
import { Choice, ReviewNote, type StageProps } from '../ui/shared';
import { HeadSideView } from '../ui/views';

function Spot({ id, label, className }: { id: string; label: string; className: string }) {
  const { active, over } = useDropState(id);
  return (
    <div data-drop={id} className={`absolute flex items-center justify-center rounded-xl border-2 border-dashed text-[10px] font-bold ${over ? 'border-indigo-500 bg-indigo-200/70 text-indigo-900' : active ? 'border-indigo-400 bg-white/60 text-indigo-800' : 'border-transparent text-transparent'} ${className}`}>
      {label}
    </div>
  );
}

/** 頭部擺位：布捲位置＋頭部後仰程度（教學示意） */
export function PositionStage({ state, dispatch, demo, demoHighlight }: StageProps) {
  useDropZone('aw-occiput', (p) => p.kind === 'aw-towel' && dispatch({ type: 'placeTowel', where: 'occiput' }));
  useDropZone('aw-shoulder', (p) => p.kind === 'aw-towel' && dispatch({ type: 'placeTowel', where: 'shoulder' }));
  const h = state.head;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[1fr_15rem]">
        <div className="relative mx-auto aspect-[58/43] w-full max-w-xl">
          <HeadSideView state={state} />
          <Spot id="aw-occiput" label="枕部" className="left-[14%] top-[80%] h-[18%] w-[30%]" />
          <Spot id="aw-shoulder" label="肩下" className="left-[62%] top-[80%] h-[18%] w-[30%]" />
        </div>
        <div className="space-y-2">
          <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">① 布捲（拖到病人頭頸下）</p>
            <Draggable payload={{ kind: 'aw-towel', id: 'towel' }} preview={<AWIcon id="towel" size={56} />} disabled={demo}>
              <div className="mt-1 flex items-center gap-2 rounded-xl bg-emerald-50 p-1.5 ring-1 ring-emerald-200">
                <AWIcon id="towel" size={32} />
                <span className="text-[11px] font-bold text-emerald-900">{h.towel ? `已放在${h.towel === 'occiput' ? '枕部' : '肩下'}（可重新拖）` : '按住拖曳'}</span>
              </div>
            </Draggable>
          </div>
          <div className="space-y-1.5 rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold text-slate-500">② 頭部姿勢</p>
            {(
              [
                ['neutral', '維持平躺不調整'],
                ['moderate', '頭部適度後仰'],
                ['hyper', '頭部盡量往後仰到底'],
              ] as const
            ).map(([lv, t]) => (
              <Choice key={lv} id={`ext-${lv}`} demoHighlight={demoHighlight} active={h.extension === lv} onClick={() => dispatch({ type: 'setExtension', level: lv })}>
                {t}
              </Choice>
            ))}
          </div>
          <button type="button" onClick={() => dispatch({ type: 'confirmPosition' })} className="w-full rounded-xl bg-indigo-600 py-2 text-[13px] font-bold text-white">
            {h.confirmed ? '↻ 重新確認擺位' : '✓ 完成擺位'}
          </button>
        </div>
      </div>
      <ReviewNote>{CFG.review.technique.note}</ReviewNote>
    </div>
  );
}
