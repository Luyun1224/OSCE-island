import { useState } from 'react';
import { navigate } from '../../../router';
import { ConfirmDialog } from '../../training/components/Dialogs';
import { FormativeNote, HQShell, ScoreBar } from '../components/Shell';
import { LAB_GAMES, getGame } from '../data/labGames';
import { SOP_UNITS, getUnit } from '../data/sopUnits';
import { clearProgress, getBest, useProgress } from '../progress';
import { CASES, getCase } from '../cases/case001-dizziness';

/** 04 問診能力分析中心：練習歷程、弱項與建議 */
export function ReviewPage() {
  const { progress, refresh } = useProgress();
  const [confirm, setConfirm] = useState(false);

  // 弱項：未完成或最佳分數低於 70% 的單元；遊戲的弱項也對應到單元
  const weak = new Map<string, string>();
  for (const u of SOP_UNITS) {
    const b = getBest('unit', u.id, progress);
    if (!b) weak.set(u.id, '尚未完成');
    else if (b.score / b.max < 0.7) weak.set(u.id, `單元最佳分數 ${Math.round((b.score / b.max) * 100)}%`);
  }
  for (const g of LAB_GAMES) {
    const b = getBest('game', g.id, progress);
    if (b && b.score / b.max < 0.7) for (const u of g.relatedUnits) if (!weak.has(u)) weak.set(u, `遊戲 ${g.letter} 分數 ${Math.round((b.score / b.max) * 100)}%`);
  }
  const recent = progress.history.slice(0, 12);
  const latestNotes = progress.history.slice(0, 5).flatMap((h) => h.notes).slice(0, 8);

  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '04 問診能力分析中心' }]}>
      <header className="rounded-[2rem] bg-gradient-to-br from-violet-700 to-indigo-500 p-6 text-white shadow-glass md:p-8">
        <p className="text-[12px] font-black tracking-[0.25em] text-violet-100">04｜PERFORMANCE REVIEW CENTER</p>
        <h1 className="mt-1 text-3xl font-black">問診能力分析中心</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-violet-50">依你實際的練習紀錄整理進度、需要補強的觀念與建議重練的單元。紀錄只存在這個瀏覽器中。</p>
      </header>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-lg font-black text-slate-800">SOP 學院進度</h2>
          <div className="mt-3 space-y-2.5">
            {SOP_UNITS.map((u) => {
              const b = getBest('unit', u.id, progress);
              return (
                <button key={u.id} type="button" onClick={() => navigate(`/history/academy/${u.id}`)} className="block w-full rounded-2xl p-2 text-left hover:bg-slate-50">
                  <p className="text-[13px] font-bold text-slate-700">
                    {u.icon} 單元 {u.order}：{u.title} {b && <span className="text-[11px] font-medium text-slate-400">（{b.attempts} 次）</span>}
                  </p>
                  {b ? <ScoreBar score={b.score} max={b.max} /> : <p className="text-[12px] text-slate-400">尚未練習</p>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-lg font-black text-slate-800">訓練場成績</h2>
          <div className="mt-3 space-y-2.5">
            {LAB_GAMES.map((g) => {
              const b = getBest('game', g.id, progress);
              return (
                <button key={g.id} type="button" onClick={() => navigate(`/history/lab/${g.id}`)} className="block w-full rounded-2xl p-2 text-left hover:bg-slate-50">
                  <p className="text-[13px] font-bold text-slate-700">
                    {g.icon} 遊戲 {g.letter}：{g.title}
                  </p>
                  {b ? <ScoreBar score={b.score} max={b.max} /> : <p className="text-[12px] text-slate-400">尚未挑戰</p>}
                </button>
              );
            })}
          </div>

          <h2 className="mt-6 text-lg font-black text-slate-800">虛擬病人診間</h2>
          <div className="mt-2 space-y-2.5">
            {CASES.map((cs) => {
              const b = getBest('case', cs.id, progress);
              return (
                <button key={cs.id} type="button" onClick={() => navigate(`/history/clinic/${cs.id}`)} className="block w-full rounded-2xl p-2 text-left hover:bg-slate-50">
                  <p className="text-[13px] font-bold text-slate-700">
                    🩺 {cs.code}：{cs.title} {b && <span className="text-[11px] font-medium text-slate-400">（{b.attempts} 次，15 項規準）</span>}
                  </p>
                  {b ? <ScoreBar score={b.score} max={b.max} /> : <p className="text-[12px] text-slate-400">尚未問診</p>}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-3xl bg-orange-50 p-5 ring-1 ring-orange-200">
        <h2 className="text-lg font-black text-orange-900">🎯 建議重新練習</h2>
        {weak.size === 0 ? (
          <p className="mt-2 text-[14px] text-slate-700">所有單元都已達到 70% 以上，很棒！可以挑戰訓練場的遊戲，或回頭複習想加強的單元。</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {[...weak.entries()].map(([id, why]) => {
              const u = getUnit(id)!;
              return (
                <button key={id} type="button" onClick={() => navigate(`/history/academy/${id}`)} className="rounded-2xl bg-white px-4 py-2 text-left shadow-sm ring-1 ring-orange-200 hover:ring-orange-400">
                  <span className="block text-[14px] font-bold text-slate-800">
                    {u.icon} 單元 {u.order}：{u.title} →
                  </span>
                  <span className="text-[12px] text-orange-700">{why}</span>
                </button>
              );
            })}
          </div>
        )}
        {latestNotes.length > 0 && (
          <div className="mt-4">
            <p className="text-[13px] font-black text-orange-900">最近練習中需要補強的觀念</p>
            <ul className="mt-1 space-y-1">
              {latestNotes.map((n, i) => (
                <li key={i} className="text-[13px] leading-relaxed text-slate-700">
                  • {n}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">練習歷程</h2>
          {progress.history.length > 0 && (
            <button type="button" onClick={() => setConfirm(true)} className="text-[12px] font-bold text-slate-400 hover:text-rose-600">
              清除紀錄
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="mt-2 text-[13px] text-slate-500">還沒有練習紀錄。從 SOP 學院開始吧！</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {recent.map((h, i) => {
              const name =
                h.kind === 'unit' ? `單元 ${getUnit(h.id)?.order}：${getUnit(h.id)?.title}` : h.kind === 'game' ? `遊戲 ${getGame(h.id)?.letter}：${getGame(h.id)?.title}` : `${getCase(h.id)?.code}：${getCase(h.id)?.title}`;
              return (
                <li key={i} className="grid grid-cols-[1fr_8rem] items-center gap-3 py-2 text-[13px] md:grid-cols-[9rem_1fr_10rem]">
                  <span className="hidden text-slate-400 md:block">{new Date(h.at).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="font-bold text-slate-700">{name}</span>
                  <ScoreBar score={h.score} max={h.max} />
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3">
          <FormativeNote />
        </div>
      </section>

      {confirm && (
        <ConfirmDialog
          title="清除練習紀錄？"
          message="這會刪除此瀏覽器中 HISTORY QUEST 的所有練習紀錄，無法復原。"
          confirmLabel="清除"
          danger
          onConfirm={() => {
            clearProgress();
            refresh();
            setConfirm(false);
          }}
          onCancel={() => setConfirm(false)}
        />
      )}
    </HQShell>
  );
}
