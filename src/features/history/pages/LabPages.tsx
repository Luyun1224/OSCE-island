import { useState } from 'react';
import { navigate } from '../../../router';
import { ActivityView } from '../activities/ActivityView';
import { FormativeNote, HQShell, PrimaryButton, ReviewBadge, ScoreBar } from '../components/Shell';
import { LAB_GAMES, getGame } from '../data/labGames';
import { getUnit } from '../data/sopUnits';
import { getBest, recordRun, useProgress } from '../progress';
import type { ActivityResult } from '../types';

/** 02 問診技巧訓練場：四種遊戲 */
export function LabPage() {
  const { progress } = useProgress();
  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '02 問診技巧訓練場' }]}>
      <header className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-400 p-6 text-white shadow-glass md:p-8">
        <p className="text-[12px] font-black tracking-[0.25em] text-orange-100">02｜INTERACTIVE TRAINING LAB</p>
        <h1 className="mt-1 text-3xl font-black">問診技巧訓練場</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-orange-50">每個遊戲都會說明背後的觀念，不只是答對答錯。可以反覆挑戰，分析中心會記錄你的進步。</p>
      </header>
      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        {LAB_GAMES.map((g) => {
          const best = getBest('game', g.id, progress);
          return (
            <article key={g.id} className="flex flex-col rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-3xl">{g.icon}</span>
                <div>
                  <p className="text-[11px] font-black tracking-widest text-orange-600">
                    GAME {g.letter}｜{g.englishTitle}
                  </p>
                  <h2 className="text-xl font-black text-slate-800">{g.title}</h2>
                </div>
              </div>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-600">{g.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {g.relatedUnits.map((u) => (
                  <span key={u} className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                    對應單元 {getUnit(u)?.order}
                  </span>
                ))}
                <ReviewBadge review={g.review} />
              </div>
              {best && (
                <div className="mt-3">
                  <p className="mb-1 text-[11px] text-slate-400">最佳分數（{best.attempts} 次）</p>
                  <ScoreBar score={best.score} max={best.max} />
                </div>
              )}
              <button type="button" onClick={() => navigate(`/history/lab/${g.id}`)} className="mt-4 rounded-2xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow hover:bg-orange-600">
                {best ? '再挑戰一次 →' : '開始遊戲 →'}
              </button>
            </article>
          );
        })}
      </section>
    </HQShell>
  );
}

export function GamePage({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  const [result, setResult] = useState<ActivityResult | null>(null);
  const [runKey, setRunKey] = useState(0);
  if (!game) {
    return (
      <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '找不到遊戲' }]}>
        <p className="text-slate-600">找不到這個遊戲。</p>
      </HQShell>
    );
  }
  const done = (r: ActivityResult) => {
    recordRun('game', game.id, [r]);
    setResult(r);
    window.scrollTo?.(0, 0);
  };
  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '02 訓練場', to: '/history/lab' }, { label: `遊戲 ${game.letter}` }]}>
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">{game.icon}</span>
        <div>
          <p className="text-[11px] font-black tracking-widest text-orange-600">
            GAME {game.letter}｜{game.englishTitle}
          </p>
          <h1 className="text-2xl font-black text-slate-800 md:text-3xl">{game.title}</h1>
        </div>
        <div className="ml-auto">
          <ReviewBadge review={game.review} />
        </div>
      </header>
      {!result ? (
        <>
          <p className="mb-4 rounded-2xl bg-white/90 p-4 text-[14px] text-slate-600 shadow-sm ring-1 ring-orange-100">{game.activity.intro}</p>
          <ActivityView key={runKey} activity={game.activity} onDone={done} />
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-[12px] font-black tracking-widest text-orange-600">遊戲結果</p>
            <div className="mt-2 max-w-md">
              <ScoreBar score={result.score} max={result.max} />
            </div>
            <FormativeNote />
          </div>
          {result.notes.length > 0 && (
            <div className="rounded-3xl bg-orange-50 p-5 ring-1 ring-orange-200">
              <p className="text-sm font-black text-orange-800">🌱 可以再加強的地方</p>
              <ul className="mt-2 space-y-1.5">
                {result.notes.slice(0, 8).map((n, i) => (
                  <li key={i} className="text-[13px] leading-relaxed text-slate-700">
                    • {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-3xl bg-teal-700 p-5 text-white">
            <p className="text-[12px] font-black tracking-widest text-teal-200">回到 SOP 學院複習</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {game.relatedUnits.map((id) => {
                const u = getUnit(id)!;
                return (
                  <button key={id} type="button" onClick={() => navigate(`/history/academy/${id}`)} className="rounded-2xl bg-white/15 px-3 py-2 text-left text-[13px] font-bold hover:bg-white/25">
                    單元 {u.order}：{u.title} →
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <PrimaryButton
              tone="orange"
              onClick={() => {
                setResult(null);
                setRunKey((k) => k + 1);
              }}
            >
              ↺ 再玩一次
            </PrimaryButton>
            <PrimaryButton tone="ghost" onClick={() => navigate('/history/lab')}>
              返回訓練場
            </PrimaryButton>
          </div>
        </div>
      )}
    </HQShell>
  );
}
