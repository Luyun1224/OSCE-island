import { useMemo, useRef, useState } from 'react';
import { evaluateOptions, evaluateTimeline, managementByPhase, simulate } from '../engine/evaluate';
import type { ClinicalCase, DecisionEvent, GameResult, ManagementOption, Necessity } from '../types';
import { Btn, EventList, OptionToggle, Panel, Steps, VitalsMonitor } from '../components/ui';

type Phase = 'immediate' | 'investigate' | 'initial' | 'timeline' | 'outcome' | 'treatment' | 'monitor';
const ORDER: Phase[] = ['immediate', 'investigate', 'initial', 'timeline', 'outcome', 'treatment', 'monitor'];
const LABEL: Record<Phase, string> = { immediate: '立即處置／求援', investigate: '必要檢查', initial: '初步處置', timeline: '第一小時順序', outcome: '病人反應', treatment: '治療選項', monitor: '監測與追蹤' };
const PROMPT: Record<Exclude<Phase, 'timeline' | 'outcome'>, string> = {
  immediate: '病人剛到急診。你現在要立即做哪些事？（可複選）',
  investigate: '選擇要安排的檢查（可複選）。考慮：會不會改變處置？會不會延誤治療？',
  initial: '選擇初步處置（可複選）。',
  treatment: '病人對初步處置有反應後，接下來的治療選擇（可複選）：',
  monitor: '監測、去處與追蹤安排（可複選）：',
};
const NEC_TAG: Record<Necessity, { t: string; c: string }> = { essential: { t: '必要', c: 'bg-emerald-100 text-emerald-800' }, reasonable: { t: '合理', c: 'bg-sky-100 text-sky-800' }, unnecessary: { t: '非必要', c: 'bg-slate-200 text-slate-600' }, harmful: { t: '不適當', c: 'bg-red-100 text-red-700' } };

/** Game 3：臨床處置模擬器（模擬後果完全來自病例資料的規則） */
export function ManagementSim({ c, defer, onComplete }: { c: ClinicalCase; defer?: boolean; onComplete: (r: GameResult) => void }) {
  const [phase, setPhase] = useState<Phase>('immediate');
  const [chosen, setChosen] = useState<Record<string, string[]>>({});
  const [timeline, setTimeline] = useState<string[]>([]);
  const [showFb, setShowFb] = useState(false);
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const [lastEvents, setLastEvents] = useState<DecisionEvent[]>([]);
  const t0 = useRef(Date.now());

  const options = (p: Phase): { id: string; name: string; necessity: Necessity; rationale: string; safetyIfChosen?: string; safetyIfMissed?: string; result?: string }[] =>
    p === 'investigate' ? c.investigations : managementByPhase(c, p as ManagementOption['phase']);
  const allChosen = Object.values(chosen).flat();
  const sim = useMemo(() => simulate(c, allChosen), [c, allChosen.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const timelineItems = () => [...(chosen.investigate ?? []).filter((id) => c.investigations.find((i) => i.id === id && (i.beforeTreatment || i.mustNotDelay))), ...(chosen.initial ?? []).filter((id) => id === 'm-fluid' || id === 'm-abx')];
  const nextOf = (p: Phase): Phase | 'done' => {
    let n: Phase | 'done' = ORDER[ORDER.indexOf(p) + 1] ?? 'done';
    if (n === 'timeline' && !timelineItems().some((id) => id === 'm-abx')) n = 'outcome';
    return n;
  };
  const advance = (all: DecisionEvent[]) => {
    setShowFb(false);
    const n = nextOf(phase);
    if (n === 'done') onComplete({ game: 'manage', events: all, durationSec: (Date.now() - t0.current) / 1000 });
    else {
      if (n === 'timeline') setTimeline(timelineItems());
      setPhase(n);
    }
    window.scrollTo?.(0, 0);
  };

  const submit = () => {
    if (showFb) return advance(events);
    let ev: DecisionEvent[] = [];
    if (phase === 'immediate') ev = evaluateOptions(options('immediate'), chosen.immediate ?? [], ['recognition', 'priority'], 'immediate');
    if (phase === 'investigate') ev = evaluateOptions(options('investigate'), chosen.investigate ?? [], ['investigation'], 'investigation');
    if (phase === 'initial') ev = evaluateOptions(options('initial'), chosen.initial ?? [], ['priority', 'treatment'], 'initial');
    if (phase === 'timeline') ev = evaluateTimeline(c, timeline);
    if (phase === 'outcome') ev = sim.fired.map((f) => ({ game: 'manage', kind: 'outcome', ref: f.narrative, label: '模擬後果', quality: f.safety ? 'poor' : 'good', dims: ['priority'], note: `${f.narrative}（${f.source}）` }) as DecisionEvent);
    if (phase === 'treatment') ev = evaluateOptions(options('treatment'), chosen.treatment ?? [], ['treatment'], 'treatment');
    if (phase === 'monitor') ev = evaluateOptions(options('monitor'), chosen.monitor ?? [], ['followup'], 'monitor');
    const all = [...events, ...ev];
    setEvents(all);
    // 病人反應本身就是回饋；自主／挑戰模式不顯示即時回饋
    if (phase === 'outcome' || defer || !ev.length) return advance(all);
    setLastEvents(ev);
    setShowFb(true);
  };

  const toggle = (id: string) => setChosen((x) => {
    const cur = x[phase] ?? [];
    return { ...x, [phase]: cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id] };
  });
  const move = (i: number, d: -1 | 1) => setTimeline((o) => {
    const n = [...o];
    const j = i + d;
    if (j < 0 || j >= n.length) return o;
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  });
  const nameOf = (id: string) => c.investigations.find((x) => x.id === id)?.name ?? c.management.find((x) => x.id === id)?.name ?? id;
  const phaseIdx = ORDER.indexOf(phase);
  const showMonitorAfter = phaseIdx >= ORDER.indexOf('outcome');

  return (
    <div className="space-y-4">
      <Steps labels={ORDER.map((p) => LABEL[p])} current={phaseIdx} />
      <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-3">
          {phase !== 'timeline' && phase !== 'outcome' && (
            <Panel>
              <p className="text-[15px] font-black text-slate-800">{PROMPT[phase]}</p>
              <div className="mt-3 space-y-2">
                {options(phase).map((o) => (
                  <OptionToggle key={o.id} on={(chosen[phase] ?? []).includes(o.id)} onClick={() => !showFb && toggle(o.id)} disabled={showFb} tag={showFb ? <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${NEC_TAG[o.necessity].c}`}>{NEC_TAG[o.necessity].t}</span> : undefined}>
                    {o.name}
                    {phase === 'investigate' && showFb && (chosen.investigate ?? []).includes(o.id) && o.result && <span className="mt-1 block text-[12.5px] font-bold text-teal-700">結果：{o.result}</span>}
                  </OptionToggle>
                ))}
              </div>
            </Panel>
          )}
          {phase === 'investigate' && defer && (chosen.investigate ?? []).length > 0 && <p className="text-[12px] text-slate-500">檢查結果會在送出後顯示於右側。</p>}

          {phase === 'timeline' && (
            <Panel>
              <p className="text-[15px] font-black text-slate-800">⏱️ 第一小時：把你選的關鍵行動排出先後順序</p>
              <p className="text-[12.5px] text-slate-500">實際上許多事會同步進行；這裡請排出「開始的先後」。</p>
              <ol className="mt-3 space-y-2">
                {timeline.map((id, i) => (
                  <li key={id} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-[13px] font-black text-white">{i + 1}</span>
                    <span className="flex-1 text-[14px] font-bold text-slate-800">{nameOf(id)}</span>
                    <button type="button" aria-label="上移" disabled={showFb} onClick={() => move(i, -1)} className="rounded-lg bg-slate-100 px-2 py-1 text-[12px]">
                      ▲
                    </button>
                    <button type="button" aria-label="下移" disabled={showFb} onClick={() => move(i, 1)} className="rounded-lg bg-slate-100 px-2 py-1 text-[12px]">
                      ▼
                    </button>
                  </li>
                ))}
              </ol>
            </Panel>
          )}

          {phase === 'outcome' && (
            <Panel>
              <p className="text-[15px] font-black text-slate-800">📈 處置後 30–60 分鐘：病人的反應</p>
              <ul className="mt-2 space-y-2">
                {sim.fired.length === 0 && <li className="text-[13px] text-slate-500">病人狀態沒有明顯變化。</li>}
                {sim.fired.map((f) => (
                  <li key={f.narrative} className={`rounded-2xl px-3 py-2 text-[13.5px] ${f.safety ? 'bg-red-50 ring-2 ring-red-300' : 'bg-emerald-50'}`}>
                    {f.narrative}
                    {f.safety && <span className="mt-0.5 block font-bold text-red-700">⚠️ {f.safety}</span>}
                    <span className="mt-0.5 block text-[11px] text-slate-400">來源：{f.source}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {showFb && (
            <Panel>
              <p className="mb-2 text-[13px] font-black text-indigo-700">💡 即時回饋</p>
              <EventList events={lastEvents} />
            </Panel>
          )}

          <Btn tone={showFb ? 'indigo' : 'orange'} onClick={submit}>
            {showFb || phase === 'outcome' ? (nextOf(phase) === 'done' ? '完成 Game 3 →' : '下一步 →') : '確認決策'}
          </Btn>
        </div>

        <div className="order-first space-y-3 lg:sticky lg:top-2 lg:order-none lg:self-start">
          <VitalsMonitor s={showMonitorAfter ? sim.state : c.initialState} compareTo={showMonitorAfter ? c.initialState : undefined} title={showMonitorAfter ? '處置後' : '到院時'} />
          {(chosen.investigate ?? []).length > 0 && phaseIdx > ORDER.indexOf('investigate') && (
            <Panel>
              <p className="text-[12px] font-black tracking-widest text-teal-700">🧪 已安排的檢查</p>
              <ul className="mt-1 space-y-1 text-[12.5px] text-slate-700">
                {(chosen.investigate ?? []).map((id) => {
                  const i = c.investigations.find((x) => x.id === id)!;
                  return (
                    <li key={id}>
                      • {i.name}
                      {i.result && <span className="block pl-3 text-teal-700">{i.result}</span>}
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
