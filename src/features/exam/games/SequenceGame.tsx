import { useMemo, useState } from 'react';
import { DragDropProvider, Draggable, useDropZone } from '../../training/components/DragDrop';
import { shuffle } from '../../history/components/Shell';
import type { ExaminationSequence } from '../types';

export interface SequenceResult {
  score: number;
  max: number;
  violations: { before: string; after: string; why: string }[];
}

const TECH_ICON: Record<string, string> = { inspection: '👁️', palpation: '🖐️', percussion: '🥁', auscultation: '🩺' };

/** Game 1：檢查流程排序（拖曳到位置，或用 ▲▼ 調整）；依各系統規準判斷並說明理由 */
export function SequenceGame({ seq, onDone }: { seq: ExaminationSequence; onDone: (r: SequenceResult) => void }) {
  const initial = useMemo(() => {
    let o = shuffle(seq.actions.map((a) => a.id));
    if (o.every((id, i) => id === seq.actions[i].id)) o = [...o].reverse();
    return o;
  }, [seq]);
  const [order, setOrder] = useState<string[]>(initial);
  const [checked, setChecked] = useState(false);
  const act = (id: string) => seq.actions.find((a) => a.id === id)!;
  const pos = (id: string) => order.indexOf(id);
  const violations = seq.rules.filter((r) => pos(r.before) > pos(r.after));
  const inRank = (id: string) => pos(id) >= act(id).rank[0] && pos(id) <= act(id).rank[1];

  const moveTo = (id: string, to: number) =>
    setOrder((o) => {
      const n = o.filter((x) => x !== id);
      n.splice(to, 0, id);
      return n;
    });

  const check = () => {
    setChecked(true);
    const score = order.filter(inRank).length;
    onDone({ score, max: order.length, violations });
  };

  return (
    <DragDropProvider>
      <div className="space-y-3">
        <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-[13.5px] text-emerald-900 ring-1 ring-emerald-200">📋 {seq.scenario}</p>
        <p className="text-[12.5px] text-slate-500">拖曳卡片到想要的位置，或使用 ▲▼ 調整順序。</p>
        <ol className="space-y-1.5">
          {order.map((id, i) => (
            <Slot key={id} index={i} onDrop={(dragId) => !checked && moveTo(dragId, i)}>
              <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 ring-1 ${checked ? (inRank(id) ? 'bg-emerald-50 ring-emerald-300' : 'bg-rose-50 ring-rose-300') : 'bg-white ring-slate-200'}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[13px] font-black text-white">{i + 1}</span>
                <Draggable payload={{ kind: 'seq', id }} disabled={checked} className="min-w-0 flex-1" preview={<div className="rounded-xl bg-white px-3 py-2 text-[13px] shadow-xl ring-2 ring-emerald-400">{act(id).text}</div>}>
                  <span className="block text-[14px] text-slate-800">
                    {act(id).technique && <span className="mr-1">{TECH_ICON[act(id).technique!]}</span>}
                    {act(id).text}
                  </span>
                </Draggable>
                {!checked && (
                  <span className="flex shrink-0 gap-1">
                    <button type="button" aria-label="上移" onClick={() => i > 0 && moveTo(id, i - 1)} className="rounded-lg bg-slate-100 px-2 py-1 text-[12px]">
                      ▲
                    </button>
                    <button type="button" aria-label="下移" onClick={() => i < order.length - 1 && moveTo(id, i + 1)} className="rounded-lg bg-slate-100 px-2 py-1 text-[12px]">
                      ▼
                    </button>
                  </span>
                )}
                {checked && <span className="shrink-0 text-[12px] font-black">{inRank(id) ? '✓' : '✗'}</span>}
              </div>
            </Slot>
          ))}
        </ol>
        {!checked ? (
          <button type="button" onClick={check} className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-700">
            檢查順序
          </button>
        ) : (
          <div className="space-y-2 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-base font-black text-slate-800">{violations.length === 0 ? '✅ 順序合理' : `需要調整的地方（${violations.length}）`}</p>
            <ul className="space-y-1.5">
              {violations.map((v) => (
                <li key={v.before + v.after} className="rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-900">
                  「{act(v.before).text}」應在「{act(v.after).text}」之前：{v.why}
                </li>
              ))}
            </ul>
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[13px] text-emerald-900">📌 {seq.takeaway}</p>
            <details className="text-[13px] text-slate-600">
              <summary className="cursor-pointer font-bold text-emerald-700">查看一種參考順序</summary>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                {[...seq.actions].sort((a, b) => a.rank[0] - b.rank[0]).map((a) => (
                  <li key={a.id}>
                    {a.text}
                    {a.rank[0] !== a.rank[1] && <span className="text-[11px] text-orange-600">（位置有彈性）</span>}
                  </li>
                ))}
              </ol>
            </details>
            <button type="button" onClick={() => { setChecked(false); setOrder(shuffle(order)); }} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
              ↺ 再排一次
            </button>
          </div>
        )}
      </div>
    </DragDropProvider>
  );
}

function Slot({ index, onDrop, children }: { index: number; onDrop: (id: string) => void; children: React.ReactNode }) {
  const { over } = useDropZone(`slot-${index}`, (p) => p.kind === 'seq' && onDrop(p.id));
  return (
    <li data-drop={`slot-${index}`} className={`rounded-2xl transition ${over ? 'scale-[1.01] ring-2 ring-emerald-400' : ''}`}>
      {children}
    </li>
  );
}
