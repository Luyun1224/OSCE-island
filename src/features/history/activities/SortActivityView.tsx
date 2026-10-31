import { useMemo, useState } from 'react';
import { DragDropProvider, Draggable, useDropZone } from '../../training/components/DragDrop';
import { PrimaryButton, shuffle } from '../components/Shell';
import type { ActivityResult, SortActivity, SortBin, SortCard } from '../types';

function Bin({
  bin,
  cards,
  checked,
  armed,
  onDrop,
  onTapBin,
  onTapCard,
}: {
  bin: SortBin;
  cards: SortCard[];
  checked: boolean;
  armed: boolean;
  onDrop: (cardId: string) => void;
  onTapBin: () => void;
  onTapCard: (id: string) => void;
}) {
  const { over, active } = useDropZone(`bin-${bin.id}`, (p) => p.kind === 'sort-card' && onDrop(p.id));
  return (
    <div
      data-drop={`bin-${bin.id}`}
      onClick={onTapBin}
      className={`flex min-h-[7rem] flex-col rounded-2xl border-2 bg-white/90 p-2 transition ${over ? 'scale-[1.02] border-teal-500 bg-teal-50' : armed ? 'cursor-pointer border-dashed border-orange-400' : active ? 'border-dashed border-slate-300' : 'border-transparent'}`}
      style={{ boxShadow: `inset 0 4px 0 ${bin.color}` }}
    >
      <p className="px-1 pt-1 text-[13px] font-black" style={{ color: bin.color }}>
        {bin.label}
      </p>
      {bin.hint && <p className="px-1 text-[10px] text-slate-400">{bin.hint}</p>}
      <div className="mt-1.5 space-y-1.5">
        {cards.map((c) => {
          const ok = c.bin === bin.id;
          return (
            <div
              key={c.id}
              onClick={(e) => {
                e.stopPropagation();
                if (checked) return;
                // 已選取題目卡時，點分類內任何位置都是「放入這個分類」
                if (armed) onTapBin();
                else onTapCard(c.id);
              }}
              className={`rounded-xl px-2 py-1.5 text-[12px] leading-snug ${checked ? (ok ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-300' : 'bg-rose-50 text-rose-900 ring-1 ring-rose-300') : 'cursor-pointer bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:ring-orange-300'}`}
            >
              {checked && <span className="mr-1">{ok ? '✓' : '✗'}</span>}
              {c.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 拖曳分類（滑鼠拖曳、手指拖曳，或「點卡片 → 點分類」） */
export function SortActivityView({ activity, onDone }: { activity: SortActivity; onDone: (r: ActivityResult) => void }) {
  const [round, setRound] = useState(0);
  const cards = useMemo(() => {
    const s = shuffle(activity.cards);
    return activity.drawCount ? s.slice(0, activity.drawCount) : s;
  }, [activity, round]); // round 變更時重新洗牌／抽題
  const [place, setPlace] = useState<Record<string, string>>({});
  const [armed, setArmed] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const pool = cards.filter((c) => !place[c.id]);
  const correct = cards.filter((c) => place[c.id] === c.bin);

  const put = (cardId: string, binId: string) => {
    setPlace((p) => ({ ...p, [cardId]: binId }));
    setArmed(null);
  };

  const reset = () => {
    setPlace({});
    setChecked(false);
    setArmed(null);
    setRound((r) => r + 1);
  };

  const finish = () =>
    onDone({
      activityId: activity.id,
      score: correct.length,
      max: cards.length,
      notes: cards.filter((c) => place[c.id] !== c.bin).map((c) => `${c.text} 應屬「${activity.bins.find((b) => b.id === c.bin)?.label}」：${c.explain}`),
    });

  return (
    <DragDropProvider>
      <div className="space-y-4">
        {!checked && (
          <div className="rounded-3xl bg-white/80 p-3 shadow-sm ring-1 ring-orange-100">
            <p className="mb-2 text-[12px] font-bold text-slate-500">
              題目卡（剩 {pool.length} 張）{armed && <span className="ml-2 text-orange-600">已選取，請點一個分類放入</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {pool.map((c) => (
                <Draggable
                  key={c.id}
                  payload={{ kind: 'sort-card', id: c.id }}
                  onTap={() => setArmed((a) => (a === c.id ? null : c.id))}
                  preview={<div className="max-w-[16rem] rounded-xl bg-white px-3 py-2 text-[13px] shadow-xl ring-2 ring-orange-400">{c.text}</div>}
                >
                  <div className={`max-w-[18rem] rounded-xl px-3 py-2 text-[13px] leading-snug shadow-sm ring-1 transition ${armed === c.id ? 'bg-orange-50 ring-2 ring-orange-400' : 'bg-white ring-slate-200 hover:ring-teal-300'}`}>{c.text}</div>
                </Draggable>
              ))}
              {pool.length === 0 && <p className="text-[13px] font-bold text-teal-700">全部放好了，可以檢查答案。</p>}
            </div>
          </div>
        )}

        <div className={`grid gap-2 ${activity.bins.length > 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
          {activity.bins.map((b) => (
            <Bin
              key={b.id}
              bin={b}
              cards={cards.filter((c) => place[c.id] === b.id)}
              checked={checked}
              armed={!!armed}
              onDrop={(id) => put(id, b.id)}
              onTapBin={() => armed && put(armed, b.id)}
              onTapCard={(id) => setPlace((p) => {
                const n = { ...p };
                delete n[id];
                return n;
              })}
            />
          ))}
        </div>

        {!checked ? (
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryButton disabled={pool.length > 0} onClick={() => setChecked(true)} tone="orange">
              檢查答案
            </PrimaryButton>
            <span className="text-[12px] text-slate-400">放錯了？點分類中的卡片可以拿回來。</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-base font-black text-slate-800">
                答對 {correct.length} / {cards.length}
              </p>
              <ul className="mt-2 space-y-1.5">
                {cards.map((c) => {
                  const ok = place[c.id] === c.bin;
                  return (
                    <li key={c.id} className={`rounded-xl px-3 py-2 text-[13px] ${ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                      <span className="font-bold">{ok ? '✓' : '✗'} {c.text}</span>
                      <span className="block text-[12px] opacity-90">
                        → {activity.bins.find((b) => b.id === c.bin)?.label}：{c.explain}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton onClick={finish} tone="orange">
                完成這個練習 →
              </PrimaryButton>
              <PrimaryButton onClick={reset} tone="ghost">
                ↺ 再玩一次{activity.drawCount ? '（重新抽題）' : ''}
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </DragDropProvider>
  );
}
