import { useState } from 'react';
import { navigate } from '../../../router';
import { MOOD_LABEL, PatientAvatar } from '../../history/components/PatientAvatar';
import { PrimaryButton, QualityTag, ReviewBadge } from '../../history/components/Shell';
import { Card, CareShell, SkillChip } from '../components/CareShell';
import { DialoguePlayer } from '../components/DialoguePlayer';
import { EMOTION_LABEL, getScene, THEATER_SCENES } from '../cases/theaterScenes';
import { nodeView } from '../engine/dialogue';
import type { DialogueScenario, DialogueState } from '../types';
import { isDone, logCareStart, recordCare, useCareProgress } from '../progress';

const CRUMB = { label: 'CARE ISLAND', to: '/care' };
const NURSE: Record<string, string> = { N: 'Naming 命名', U: 'Understanding 理解', R: 'Respecting 尊重', S: 'Supporting 支持', E: 'Exploring 探索' };

/** 02 同理心對話劇場（Game 2） */
export function TheaterPage({ sceneId }: { sceneId?: string }) {
  const { progress, refresh } = useCareProgress();
  const scene = sceneId ? getScene(sceneId) : undefined;
  if (scene) return <ScenePlay key={scene.id} scene={scene} onDone={refresh} />;
  return (
    <CareShell crumbs={[CRUMB, { label: '02 同理心對話劇場' }]}>
      <h1 className="text-2xl font-black text-slate-800 md:text-3xl">🎭 同理心對話劇場｜Game 2</h1>
      <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-slate-600">四幕情緒場景。每一幕：觀察情緒線索 → 選擇回應 → 看見病人的反應 → 對話依你的回應發展。結束後回顧整段互動與 NURSE 觀念——不是一個情緒分數，而是看見你的說法如何改變對話。</p>
      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        {THEATER_SCENES.map((s) => {
          const e = EMOTION_LABEL[s.emotion!];
          return (
            <button key={s.id} type="button" onClick={() => navigate(`/care/theater/${s.id}`)} className="flex items-center gap-4 rounded-3xl bg-white/90 p-4 text-left shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-xl">
              <span className="relative">
                <PatientAvatar look={s.patient} mood={s.patient.baselineMood} size={88} />
                <span className="absolute -bottom-1 -right-1 rounded-full px-2 py-0.5 text-[11px] font-black text-white" style={{ background: e.color }}>
                  {e.icon} {e.label}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-black tracking-widest text-slate-400">{s.code}</span>
                <span className="block text-lg font-black text-slate-800">{s.title}</span>
                <span className="mt-1 block text-[13px] text-slate-600">{s.summary}</span>
                {isDone(progress, 'scene', s.id) && <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">✓ 已演出</span>}
              </span>
            </button>
          );
        })}
      </section>
      <Card className="mt-6">
        <p className="text-[12px] font-black tracking-widest text-rose-600">💗 NURSE 速查</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-5">
          {Object.entries(NURSE).map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-rose-50 px-3 py-2 text-center">
              <p className="text-xl font-black text-rose-600">{k}</p>
              <p className="text-[12px] font-bold text-slate-700">{v}</p>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => navigate('/care/tools/nurse')} className="mt-3 text-[13px] font-bold text-teal-700 underline">
          看 NURSE 教學卡 →
        </button>
      </Card>
    </CareShell>
  );
}

function ScenePlay({ scene, onDone }: { scene: DialogueScenario; onDone: () => void }) {
  const [run, setRun] = useState(0);
  const [result, setResult] = useState<DialogueState | null>(null);
  const [startLogged] = useState(() => logCareStart(`scene:${scene.id}`, `劇場 ${scene.title}`));
  void startLogged;
  const e = EMOTION_LABEL[scene.emotion!];
  const idx = THEATER_SCENES.findIndex((s) => s.id === scene.id);
  const nextScene = THEATER_SCENES[idx + 1];
  return (
    <CareShell crumbs={[CRUMB, { label: '02 同理心對話劇場', to: '/care/theater' }, { label: scene.code }]} wide>
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full px-3 py-1 text-[12px] font-black text-white" style={{ background: e.color }}>
          {e.icon} {e.label}
        </span>
        <h1 className="text-xl font-black text-slate-800 md:text-2xl">{scene.title}</h1>
        <span className="ml-auto">
          <ReviewBadge review={scene.review} />
        </span>
      </header>
      <p className="mb-4 rounded-2xl bg-white/80 px-4 py-2 text-[13.5px] text-slate-600 ring-1 ring-orange-100">🎬 {scene.candidateBrief.join(' ')}</p>
      {!result ? (
        <DialoguePlayer
          key={run}
          scenario={scene}
          mode="theater"
          onEnd={(st, sec) => {
            setResult(st);
            const best = st.turns.filter((t) => t.quality === 'best').length;
            recordCare('scene', scene.id, `劇場 ${scene.title}`, { score: best, max: st.turns.length, durationSec: sec, detail: st.turns.map((t) => `${t.nodeId}:${t.optionId}`).join(',') });
            onDone();
          }}
        />
      ) : (
        <SceneDebrief scene={scene} st={result} />
      )}
      {result && (
        <div className="mt-4 flex flex-wrap gap-2">
          <PrimaryButton
            tone="ghost"
            onClick={() => {
              logCareStart(`scene:${scene.id}`, `劇場 ${scene.title}`);
              setResult(null);
              setRun((r) => r + 1);
            }}
          >
            ↺ 換一種回應再演一次
          </PrimaryButton>
          {nextScene ? (
            <PrimaryButton tone="orange" onClick={() => navigate(`/care/theater/${nextScene.id}`)}>
              下一幕：{EMOTION_LABEL[nextScene.emotion!].label} →
            </PrimaryButton>
          ) : (
            <PrimaryButton tone="orange" onClick={() => navigate('/care/workshop')}>
              前往衛教互動工坊 →
            </PrimaryButton>
          )}
          <PrimaryButton tone="ghost" onClick={() => navigate('/care/theater')}>
            回劇場大廳
          </PrimaryButton>
        </div>
      )}
    </CareShell>
  );
}

/** 劇場回顧：線索 → 你的選擇 → 病人反應 → 後續；NURSE 觀念整理（不給單一情緒分數） */
function SceneDebrief({ scene, st }: { scene: DialogueScenario; st: DialogueState }) {
  const used = [...new Set(st.turns.flatMap((t) => t.skills.filter((s) => s.startsWith('NURSE-')).map((s) => s.slice(6))))];
  const flags: string[] = [];
  return (
    <div className="animate-fade-up space-y-4">
      <Card>
        <p className="text-[12px] font-black tracking-widest text-rose-600">🎞️ 這一幕的互動回顧</p>
        <div className="mt-3 flex flex-wrap items-center gap-1 text-[12px] font-bold text-slate-600">
          病人的狀態變化：
          <span className="rounded-full bg-slate-100 px-2 py-0.5">{MOOD_LABEL[scene.patient.baselineMood]}</span>
          {st.turns.map((t, i) => (
            <span key={i} className="flex items-center gap-1">
              → <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-800">{MOOD_LABEL[t.replyMood]}</span>
            </span>
          ))}
        </div>
        <ol className="mt-4 space-y-4">
          {st.turns.map((t, i) => {
            const n = scene.nodes[t.nodeId];
            const cues = nodeView(n, flags).cues;
            n.responseOptions.find((o) => o.id === t.optionId)?.setFlags?.forEach((f) => flags.push(f));
            return (
              <li key={i} className="grid gap-3 rounded-2xl bg-orange-50/40 p-3 ring-1 ring-orange-100 md:grid-cols-4">
                <div>
                  <p className="text-[11px] font-black text-slate-400">① 情緒線索</p>
                  <p className="mt-1 text-[13px] text-slate-700">{t.patientLine}</p>
                  <ul className="mt-1 space-y-0.5 text-[12px] text-rose-700">
                    {cues.map((c) => (
                      <li key={c.text}>• {c.text}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400">② 你的回應</p>
                  <p className="mt-1 text-[13px] text-slate-800">{t.text}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <QualityTag q={t.quality} />
                    {t.skills.map((s) => (
                      <SkillChip key={s}>{s}</SkillChip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400">③ 病人的反應</p>
                  <p className="mt-1 text-[13px] text-slate-700">{t.reply}</p>
                  <p className="mt-1 text-[11px] font-bold text-orange-700">（{MOOD_LABEL[t.replyMood]}）</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400">④ 後續與觀念</p>
                  <p className="mt-1 text-[13px] text-slate-700">{n.responseOptions.find((o) => o.id === t.optionId)?.feedback}</p>
                  {i < st.turns.length - 1 && <p className="mt-1 text-[12px] text-slate-500">→ 對話因此走向：「{st.turns[i + 1].patientLine.slice(0, 26)}…」</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
      <Card>
        <p className="text-[12px] font-black tracking-widest text-teal-700">💗 NURSE 觀念整理</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-5">
          {Object.entries(NURSE).map(([k, v]) => (
            <div key={k} className={`rounded-2xl px-3 py-2 text-center ring-1 ${used.includes(k) ? 'bg-teal-50 ring-teal-300' : 'bg-white ring-slate-100'}`}>
              <p className={`text-xl font-black ${used.includes(k) ? 'text-teal-700' : 'text-slate-300'}`}>{k}</p>
              <p className="text-[12px] font-bold text-slate-600">{v}</p>
              <p className="text-[10px] text-slate-400">{used.includes(k) ? '本幕有使用' : '本幕未使用'}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-slate-500">NURSE 不需要五個都用；每一幕都有不只一種適當的回應。可以換一種回應再演一次，看看病人的反應與對話走向有什麼不同。本回顧只根據選擇的說法，無法反映語氣與非語言表現。</p>
      </Card>
    </div>
  );
}
