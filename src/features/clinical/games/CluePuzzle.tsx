import { useMemo, useRef, useState } from 'react';
import { DragDropProvider, Draggable, useDropZone } from '../../training/components/DragDrop';
import { shuffle } from '../../history/components/Shell';
import { evaluateSummary } from '../engine/evaluate';
import type { ClinicalCase, ClinicalEvidence, DecisionEvent, EvidenceCategory, GameResult } from '../types';
import { Btn, EventList, Panel, Steps } from '../components/ui';

const CAT: Record<EvidenceCategory, { label: string; icon: string }> = {
  history: { label: '病史', icon: '📋' },
  vitals: { label: '生命徵象', icon: '📈' },
  exam: { label: '身體檢查', icon: '🩺' },
  lab: { label: '檢驗', icon: '🧪' },
};

/** Game 1：臨床線索拼圖（拖曳或點選卡片放進摘要板 → 選擇問題摘要） */
export function CluePuzzle({ c, defer, onComplete }: { c: ClinicalCase; defer?: boolean; onComplete: (r: GameResult) => void }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [tab, setTab] = useState<EvidenceCategory | 'all'>('all');
  const [stage, setStage] = useState<'pick' | 'pickFeedback' | 'pr' | 'prFeedback'>('pick');
  const [pr, setPr] = useState<string | null>(null);
  const t0 = useRef(Date.now());
  const cards = useMemo(() => shuffle(c.evidence), [c]);
  const prs = useMemo(() => shuffle(c.problemRepresentations), [c]);

  const toggle = (id: string) => setChosen((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));
  const pickEvents = useMemo(() => evaluateSummary(c, chosen, null), [c, chosen]);
  const all = (): DecisionEvent[] => evaluateSummary(c, chosen, pr);
  const finish = () => onComplete({ game: 'clues', events: all(), durationSec: (Date.now() - t0.current) / 1000 });

  return (
    <div className="space-y-4">
      <Steps labels={['挑選關鍵資訊', '組成問題摘要']} current={stage === 'pick' || stage === 'pickFeedback' ? 0 : 1} />
      {(stage === 'pick' || stage === 'pickFeedback') && (
        <DragDropProvider>
          <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
            <Panel>
              <p className="text-[15px] font-black text-slate-800">把關鍵資訊拖曳（或點選）到右側摘要板</p>
              <p className="mt-0.5 text-[12.5px] text-slate-500">保留重要陽性、陰性、時間特徵與嚴重度；無關資訊不放。最多建議 {c.summaryMaxCards} 張。</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(['all', 'history', 'vitals', 'exam', 'lab'] as const).map((k) => (
                  <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full px-3 py-1 text-[12px] font-bold ${tab === k ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {k === 'all' ? '全部' : `${CAT[k].icon} ${CAT[k].label}`}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {cards
                  .filter((e) => tab === 'all' || e.category === tab)
                  .map((e) => (
                    <Draggable key={e.id} payload={{ kind: 'evidence', id: e.id }} onTap={() => stage === 'pick' && toggle(e.id)} disabled={stage !== 'pick'} preview={<EvidenceChip e={e} />}>
                      <EvidenceChip e={e} on={chosen.includes(e.id)} reveal={stage === 'pickFeedback'} />
                    </Draggable>
                  ))}
              </div>
            </Panel>
            <SummaryBoard c={c} chosen={chosen} onDrop={(id) => stage === 'pick' && !chosen.includes(id) && setChosen((x) => [...x, id])} onRemove={(id) => stage === 'pick' && toggle(id)} />
          </div>
          {stage === 'pick' && (
            <div className="mt-3">
              <Btn disabled={chosen.length < 3} onClick={() => (defer ? setStage('pr') : setStage('pickFeedback'))}>
                確認摘要資訊（{chosen.length} 張）
              </Btn>
            </div>
          )}
          {stage === 'pickFeedback' && (
            <Panel className="mt-3">
              <p className="mb-2 text-[13px] font-black text-indigo-700">💡 即時回饋：你的摘要保留了哪些資訊？</p>
              <EventList events={pickEvents} />
              <div className="mt-3">
                <Btn onClick={() => setStage('pr')}>下一步：選擇問題摘要 →</Btn>
              </div>
            </Panel>
          )}
        </DragDropProvider>
      )}
      {(stage === 'pr' || stage === 'prFeedback') && (
        <Panel>
          <p className="text-[15px] font-black text-slate-800">哪一句最適合作為這位病人的問題摘要（problem representation）？</p>
          <div className="mt-3 space-y-2">
            {prs.map((p) => {
              const on = pr === p.id;
              const show = stage === 'prFeedback';
              return (
                <button key={p.id} type="button" disabled={show} onClick={() => setPr(p.id)} className={`w-full rounded-2xl border-2 px-3 py-2.5 text-left text-[14px] leading-relaxed ${on ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'} ${show && p.quality === 'best' ? 'ring-2 ring-emerald-400' : ''}`}>
                  {p.text}
                  {show && (on || p.quality === 'best') && <span className={`mt-1 block text-[12.5px] ${p.quality === 'best' ? 'text-emerald-700' : 'text-rose-700'}`}>{p.quality === 'best' ? '✓ ' : '△ '}{p.feedback}</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {stage === 'pr' ? (
              <Btn disabled={!pr} onClick={() => (defer ? finish() : setStage('prFeedback'))}>
                確認
              </Btn>
            ) : (
              <Btn onClick={finish}>完成 Game 1 →</Btn>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}

function EvidenceChip({ e, on, reveal }: { e: ClinicalEvidence; on?: boolean; reveal?: boolean }) {
  const key = e.role !== 'irrelevant' && e.role !== 'minor';
  return (
    <div className={`rounded-2xl px-3 py-2 text-[13px] leading-snug shadow-sm ring-1 transition ${on ? 'bg-indigo-50 ring-2 ring-indigo-400' : 'bg-white ring-slate-200 hover:ring-indigo-300'} ${reveal ? (key ? 'outline outline-2 outline-emerald-300' : 'opacity-60') : ''}`}>
      <span className="mr-1 text-[11px] font-bold text-slate-400">{CAT[e.category].icon}</span>
      {e.text}
      {on && <span className="ml-1 font-black text-indigo-600">✓</span>}
    </div>
  );
}

function SummaryBoard({ c, chosen, onDrop, onRemove }: { c: ClinicalCase; chosen: string[]; onDrop: (id: string) => void; onRemove: (id: string) => void }) {
  const { over, active } = useDropZone('summary-board', (p) => p.kind === 'evidence' && onDrop(p.id));
  return (
    <div data-drop="summary-board" className={`rounded-3xl border-2 bg-white/95 p-4 shadow-sm transition lg:sticky lg:top-2 lg:self-start ${over ? 'border-teal-500 bg-teal-50' : active ? 'border-dashed border-indigo-300' : 'border-transparent ring-1 ring-indigo-100'}`}>
      <p className="text-[12px] font-black tracking-widest text-teal-700">📝 問題摘要板</p>
      <p className={`text-[12px] ${chosen.length > c.summaryMaxCards ? 'font-bold text-orange-600' : 'text-slate-400'}`}>
        {chosen.length} / {c.summaryMaxCards} 張（點卡片可移除）
      </p>
      <div className="mt-2 min-h-[8rem] space-y-1.5">
        {chosen.length === 0 && <p className="py-6 text-center text-[13px] text-slate-400">把卡片拖到這裡</p>}
        {chosen.map((id) => {
          const e = c.evidence.find((x) => x.id === id)!;
          return (
            <button key={id} type="button" onClick={() => onRemove(id)} className="block w-full rounded-xl bg-indigo-50 px-2.5 py-1.5 text-left text-[12.5px] text-slate-700 ring-1 ring-indigo-100 hover:ring-rose-300">
              {CAT[e.category].icon} {e.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
