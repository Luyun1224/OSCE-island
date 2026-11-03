import { useMemo, useRef, useState } from 'react';
import { shuffle } from '../../history/components/Shell';
import { evaluateDdx, type Assign } from '../engine/evaluate';
import type { ClinicalCase, GameResult } from '../types';
import { Btn, EventList, Panel, Steps } from '../components/ui';

type Stage = 'select' | 'order' | 'evidence' | 'mnm' | 'feedback';
const LABELS = ['選擇可能診斷', '排出優先順序', '配置支持／反對證據', '不能漏掉的疾病', '推理回饋'];

/** Game 2：鑑別診斷擂台 */
export function DdxArena({ c, defer, onComplete }: { c: ClinicalCase; defer?: boolean; onComplete: (r: GameResult) => void }) {
  const [stage, setStage] = useState<Stage>('select');
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [assign, setAssign] = useState<Assign>({});
  const [tab, setTab] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<string[]>([]);
  const t0 = useRef(Date.now());
  const pool = useMemo(() => shuffle(c.differentials), [c]);
  const evidence = useMemo(() => c.evidence.filter((e) => e.role !== 'irrelevant'), [c]);
  const dx = (id: string) => c.differentials.find((d) => d.id === id)!;
  const top = order.slice(0, 3);
  const events = useMemo(() => evaluateDdx(c, selected, order, assign, flagged), [c, selected, order, assign, flagged]);

  const move = (i: number, d: -1 | 1) => setOrder((o) => {
    const n = [...o];
    const j = i + d;
    if (j < 0 || j >= n.length) return o;
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  });
  const setMark = (d: string, e: string, s: '+' | '-') =>
    setAssign((a) => {
      const cur = { ...(a[d] ?? {}) };
      if (cur[e] === s) delete cur[e];
      else cur[e] = s;
      return { ...a, [d]: cur };
    });
  const finish = () => onComplete({ game: 'ddx', events, durationSec: (Date.now() - t0.current) / 1000 });
  const idx = ['select', 'order', 'evidence', 'mnm', 'feedback'].indexOf(stage);

  return (
    <div className="space-y-4">
      <Steps labels={defer ? LABELS.slice(0, 4) : LABELS} current={idx} />

      {stage === 'select' && (
        <Panel>
          <p className="text-[15px] font-black text-slate-800">選出你認為需要考慮的診斷（至少 3 個）</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {pool.map((d) => {
              const on = selected.includes(d.id);
              return (
                <button key={d.id} type="button" aria-pressed={on} onClick={() => setSelected((s) => (on ? s.filter((x) => x !== d.id) : [...s, d.id]))} className={`rounded-2xl border-2 px-3 py-3 text-left text-[14px] font-bold ${on ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}`}>
                  {on ? '☑ ' : '☐ '}
                  {d.name}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <Btn
              disabled={selected.length < 3}
              onClick={() => {
                setOrder(selected);
                setStage('order');
              }}
            >
              下一步：排序（已選 {selected.length}）
            </Btn>
          </div>
        </Panel>
      )}

      {stage === 'order' && (
        <Panel>
          <p className="text-[15px] font-black text-slate-800">依可能性與急迫性排出優先順序（1 = 最優先）</p>
          <ol className="mt-3 space-y-2">
            {order.map((id, i) => (
              <li key={id} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[13px] font-black text-white">{i + 1}</span>
                <span className="flex-1 text-[14px] font-bold text-slate-800">{dx(id).name}</span>
                <button type="button" aria-label="上移" onClick={() => move(i, -1)} className="rounded-lg bg-slate-100 px-2 py-1 text-[12px]">
                  ▲
                </button>
                <button type="button" aria-label="下移" onClick={() => move(i, 1)} className="rounded-lg bg-slate-100 px-2 py-1 text-[12px]">
                  ▼
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <Btn tone="ghost" onClick={() => setStage('select')}>
              ← 修改選擇
            </Btn>
            <Btn
              onClick={() => {
                setTab(order[0]);
                setStage('evidence');
              }}
            >
              下一步：配置證據
            </Btn>
          </div>
        </Panel>
      )}

      {stage === 'evidence' && tab && (
        <Panel>
          <p className="text-[15px] font-black text-slate-800">為前三個診斷配置證據：＋ 支持、－ 反對</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {top.map((id, i) => {
              const n = Object.keys(assign[id] ?? {}).length;
              return (
                <button key={id} type="button" onClick={() => setTab(id)} className={`rounded-full px-3 py-1.5 text-[12.5px] font-bold ${tab === id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {i + 1}. {dx(id).name.slice(0, 12)}
                  {dx(id).name.length > 12 ? '…' : ''}（{n}）
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[14px] font-black text-indigo-800">{dx(tab).name}</p>
          <ul className="mt-2 space-y-1.5">
            {evidence.map((e) => {
              const m = assign[tab]?.[e.id];
              return (
                <li key={e.id} className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[13px] ring-1 ${m === '+' ? 'bg-emerald-50 ring-emerald-300' : m === '-' ? 'bg-rose-50 ring-rose-300' : 'bg-white ring-slate-100'}`}>
                  <span className="flex-1 text-slate-700">{e.text}</span>
                  <button type="button" aria-label={`支持：${e.text}`} aria-pressed={m === '+'} onClick={() => setMark(tab, e.id, '+')} className={`h-8 w-8 rounded-lg text-[16px] font-black ${m === '+' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    ＋
                  </button>
                  <button type="button" aria-label={`反對：${e.text}`} aria-pressed={m === '-'} onClick={() => setMark(tab, e.id, '-')} className={`h-8 w-8 rounded-lg text-[16px] font-black ${m === '-' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    －
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex gap-2">
            <Btn tone="ghost" onClick={() => setStage('order')}>
              ← 修改順序
            </Btn>
            <Btn disabled={top.some((id) => !Object.keys(assign[id] ?? {}).length)} onClick={() => setStage('mnm')}>
              下一步（每個診斷至少配置一項）
            </Btn>
          </div>
        </Panel>
      )}

      {stage === 'mnm' && (
        <Panel>
          <p className="text-[15px] font-black text-slate-800">🚩 哪些是本例「不能漏掉」、必須主動確認或排除的疾病？</p>
          <p className="text-[12.5px] text-slate-500">包含你沒有選入鑑別診斷的項目。</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {c.differentials.map((d) => {
              const on = flagged.includes(d.id);
              return (
                <button key={d.id} type="button" aria-pressed={on} onClick={() => setFlagged((f) => (on ? f.filter((x) => x !== d.id) : [...f, d.id]))} className={`rounded-2xl border-2 px-3 py-2.5 text-left text-[14px] font-bold ${on ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-200 bg-white text-slate-700'}`}>
                  {on ? '🚩 ' : '◻️ '}
                  {d.name}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <Btn onClick={() => (defer ? finish() : setStage('feedback'))}>確認</Btn>
          </div>
        </Panel>
      )}

      {stage === 'feedback' && (
        <div className="space-y-4">
          <Panel>
            <p className="text-[15px] font-black text-slate-800">🧠 推理回饋：每個診斷的理由</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {c.differentials.map((d) => {
                const pos = order.indexOf(d.id);
                return (
                  <div key={d.id} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <p className="flex flex-wrap items-center gap-1.5 text-[14px] font-black text-slate-800">
                      {d.name}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${d.likelihood === 'leading' ? 'bg-indigo-600 text-white' : d.likelihood === 'possible' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>{d.likelihood === 'leading' ? '最可能' : d.likelihood === 'possible' ? '需考慮' : '可能性低'}</span>
                      {d.mustNotMiss && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-red-700">🚩 不能漏掉</span>}
                      <span className="ml-auto text-[11px] font-bold text-slate-400">{pos >= 0 ? `你排第 ${pos + 1}` : '你未選入'}</span>
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{d.reasoning}</p>
                    <p className="mt-1 text-[12px] text-emerald-700">＋ {d.support.map((id) => c.evidence.find((e) => e.id === id)?.text).join('；') || '—'}</p>
                    <p className="text-[12px] text-rose-700">－ {d.against.map((id) => c.evidence.find((e) => e.id === id)?.text).join('；') || '—'}</p>
                    <p className="mt-1 text-[12px] text-indigo-700">➡ {d.nextStep}</p>
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel>
            <p className="mb-2 text-[13px] font-black text-indigo-700">你的決策回饋</p>
            <EventList events={events} />
            <div className="mt-3">
              <Btn onClick={finish}>完成 Game 2 →</Btn>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
