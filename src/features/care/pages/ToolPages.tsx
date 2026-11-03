import { useState } from 'react';
import { navigate } from '../../../router';
import { PrimaryButton, ReviewBadge } from '../../history/components/Shell';
import { ActivityRun } from '../components/ActivityRun';
import { Card, CareShell, SkillChip } from '../components/CareShell';
import { CARE6 } from '../data/care6';
import { FRAMEWORKS, getFramework } from '../data/frameworks';
import { isDone, logCareStart, recordCare, useCareProgress } from '../progress';

const CRUMB = { label: 'CARE ISLAND', to: '/care' };

/** 情境 → 建議工具（說明「不硬套同一個工具」） */
const MATCH: { situation: string; tools: string[]; why: string }[] = [
  { situation: '第一次門診、完整的會談', tools: ['Calgary–Cambridge'], why: '需要整場會談的骨架。' },
  { situation: '病人在等候區等太久而生氣', tools: ['NURSE'], why: '重點是承認並回應情緒，不需要告知壞消息的流程。' },
  { situation: '告知需要進一步檢查的異常結果', tools: ['SPIKES', 'NURSE'], why: '結果可能讓病人害怕：用 SPIKES 安排說明，情緒出現時用 NURSE。' },
  { situation: '出院前的用藥指導', tools: ['Teach-back'], why: '重點是確認病人回家能正確執行。' },
  { situation: '說明檢查結果後安排下一步', tools: ['SPIKES', 'Teach-back'], why: '先說明，再確認病人帶走了正確的訊息。' },
];

/** 04 困難溝通情境館：四種工具 */
export function ToolsPage() {
  const { progress } = useCareProgress();
  return (
    <CareShell crumbs={[CRUMB, { label: '04 困難溝通情境館' }]}>
      <h1 className="text-2xl font-black text-slate-800 md:text-3xl">🧰 困難溝通情境館</h1>
      <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-slate-600">四種常用的溝通工具，各有適合的時機。每個工具都有教學卡與小遊戲；重點不是背口訣，而是知道什麼時候用哪一個。</p>
      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        {FRAMEWORKS.map((f) => (
          <button key={f.id} type="button" onClick={() => navigate(`/care/tools/${f.id}`)} className="relative flex flex-col overflow-hidden rounded-3xl bg-white/90 p-5 text-left shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-xl">
            <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: f.color }} />
            <span className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: `${f.color}1a` }}>
                {f.icon}
              </span>
              <span>
                <span className="block text-xl font-black text-slate-800">{f.name}</span>
                <span className="block text-[13px] font-bold" style={{ color: f.color }}>
                  {f.subtitle}
                </span>
              </span>
              {isDone(progress, 'tool', f.id) && <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">✓ 小遊戲完成</span>}
            </span>
            <span className="mt-3 flex flex-wrap gap-1">
              {f.cards.map((c) => (
                <span key={c.title} className="rounded-lg bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-100">
                  {c.key} {c.title.split(' ')[0]}
                </span>
              ))}
            </span>
            <span className="mt-3 text-[13px] text-slate-600">適用：{f.whenToUse[0]}…</span>
          </button>
        ))}
      </section>
      <Card className="mt-6">
        <h2 className="text-lg font-black text-slate-800">🧭 哪個情境用哪個工具？</h2>
        <p className="mt-1 text-[13px] text-slate-500">工具可以組合，也不必每次都用；以下是常見的搭配。</p>
        <div className="mt-3 divide-y divide-orange-50">
          {MATCH.map((m) => (
            <div key={m.situation} className="grid gap-1 py-2 md:grid-cols-[1.2fr_1fr_1.6fr] md:items-center">
              <p className="text-[14px] font-bold text-slate-700">{m.situation}</p>
              <p className="flex flex-wrap gap-1">
                {m.tools.map((t) => (
                  <SkillChip key={t}>{t}</SkillChip>
                ))}
              </p>
              <p className="text-[13px] text-slate-500">{m.why}</p>
            </div>
          ))}
        </div>
      </Card>
    </CareShell>
  );
}

/** 單一工具：教學卡（可翻面看例句）＋使用時機＋小遊戲 */
export function ToolPage({ toolId }: { toolId: string }) {
  const f = getFramework(toolId);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [playing, setPlaying] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  if (!f)
    return (
      <CareShell crumbs={[CRUMB, { label: '找不到工具' }]}>
        <p>找不到這個工具。</p>
      </CareShell>
    );
  return (
    <CareShell crumbs={[CRUMB, { label: '04 困難溝通情境館', to: '/care/tools' }, { label: f.name }]}>
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: `${f.color}1a` }}>
          {f.icon}
        </span>
        <div>
          <h1 className="text-2xl font-black text-slate-800 md:text-3xl">{f.name}</h1>
          <p className="text-[14px] font-bold" style={{ color: f.color }}>
            {f.subtitle}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {f.stages.map((s) => {
            const l = CARE6.find((x) => x.id === s)!;
            return (
              <SkillChip key={s} tone="coral">
                {l.letter} {l.englishTitle}
              </SkillChip>
            );
          })}
          <ReviewBadge review={f.review} />
        </div>
      </header>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-[12px] font-black tracking-widest text-teal-700">✅ 適合使用的時機</p>
          <ul className="mt-1 space-y-1 text-[14px] text-slate-700">
            {f.whenToUse.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <p className="text-[12px] font-black tracking-widest text-amber-700">⚠️ 它不能做什麼</p>
          <p className="mt-1 text-[14px] leading-relaxed text-slate-700">{f.whenNotEnough}</p>
        </Card>
      </div>

      <h2 className="mt-6 text-lg font-black text-slate-800">🃏 教學卡（點卡片看例句與常見誤用）</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {f.cards.map((c) => {
          const on = flipped[c.title];
          return (
            <button
              key={c.title}
              type="button"
              onClick={() => setFlipped((x) => ({ ...x, [c.title]: !on }))}
              className={`min-h-[9rem] rounded-3xl p-4 text-left shadow-sm ring-2 transition hover:-translate-y-0.5 ${on ? 'bg-teal-50 ring-teal-300' : 'bg-white ring-orange-100'}`}
              aria-pressed={on}
            >
              <span className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg font-black text-white" style={{ background: f.color }}>
                  {c.key}
                </span>
                <span className="text-[15px] font-black text-slate-800">{c.title}</span>
              </span>
              {!on ? (
                <span className="mt-2 block text-[13.5px] leading-relaxed text-slate-600">{c.meaning}</span>
              ) : (
                <span className="mt-2 block space-y-1.5 text-[13.5px] leading-relaxed">
                  <span className="block text-teal-800">💬 {c.example}</span>
                  {c.pitfall && <span className="block text-rose-700">⚠️ 常見誤用：{c.pitfall}</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">參考：{f.source}</p>

      <section className="mt-6">
        {!playing ? (
          <PrimaryButton
            tone="orange"
            onClick={() => {
              logCareStart(`tool:${f.id}`, `${f.name} 小遊戲`);
              setStartedAt(Date.now());
              setPlaying(true);
            }}
          >
            🎮 開始小遊戲：{f.miniGame.title.replace('小遊戲：', '')}
          </PrimaryButton>
        ) : (
          <ActivityRun
            activities={[f.miniGame]}
            onFinish={(rs) => recordCare('tool', f.id, `${f.name} 小遊戲`, { score: rs[0].score, max: rs[0].max, durationSec: (Date.now() - startedAt) / 1000 })}
            finishSlot={(_, retry) => (
              <div className="flex flex-wrap gap-2">
                <PrimaryButton
                  tone="ghost"
                  onClick={() => {
                    setStartedAt(Date.now());
                    retry();
                  }}
                >
                  ↺ 再玩一次
                </PrimaryButton>
                <PrimaryButton tone="orange" onClick={() => navigate('/care/tools')}>
                  看其他工具 →
                </PrimaryButton>
              </div>
            )}
          />
        )}
      </section>
    </CareShell>
  );
}
