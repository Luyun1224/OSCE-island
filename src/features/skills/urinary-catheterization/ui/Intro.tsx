import { lazy, Suspense } from 'react';
import { getTrainingModes } from '../../../training/modes';
import type { TrainingModeId } from '../../../training/types';
import { PatientAvatar } from '../../../history/components/PatientAvatar';
import { CATHETER_CASE, EQUIPMENT, FIXTURES, PATIENT_LOOK } from '../caseData';
import { createInitialState } from '../engine';
import { CATHETER_RUBRIC } from '../rubric';
import { CTIcon } from './Icons';

const Scene = lazy(() => import('../scene/CatheterizationScene'));
const sc = CATHETER_CASE.scenario;
const PREVIEW = createInitialState({ resistance: false });

export function ScenarioIntro({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-teal-50 via-slate-50 to-sky-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
        <button type="button" onClick={onBack} className="mt-2 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600 shadow-sm hover:bg-white">
          ← 技能訓練中心
        </button>
        <header className="mt-4">
          <p className="text-[11px] font-bold tracking-[0.25em] text-teal-700">{sc.stationTitle}</p>
          <h1 className="mt-1 text-3xl font-black text-slate-800">
            導尿管置入 <span className="text-lg font-bold text-slate-400">Urinary Catheterization Simulator</span>
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-bold">
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm">測驗場景：{sc.setting}</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm">測驗時間：{sc.stationMinutes} 分鐘</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm">單項技能操作</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm">評分 14 項・總分 28 分</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm">男性導尿模型</span>
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <section className="rounded-3xl bg-white/90 p-5 shadow-glass">
            <div className="flex items-center gap-3">
              <PatientAvatar look={PATIENT_LOOK} mood="anxious" size={84} />
              <div>
                <h2 className="text-[11px] font-bold tracking-widest text-slate-400">考生指引｜背景資料</h2>
                <p className="mt-1 text-base font-black text-slate-800">{sc.patient}</p>
              </div>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-700">{sc.background}</p>
            <h2 className="mt-5 text-[11px] font-bold tracking-widest text-slate-400">測驗任務</h2>
            <ol className="mt-2 space-y-2">
              {sc.tasks.map((t, i) => (
                <li key={t} className="flex gap-2 text-[14px] leading-relaxed text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[12px] font-bold text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <h2 className="mt-5 text-[11px] font-bold tracking-widest text-slate-400">本關卡的操作流程</h2>
            <div className="mt-2 flex flex-wrap gap-1">
              {CATHETER_CASE.steps.map((s) => (
                <span key={s.id} className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                  {s.order}. {s.title}
                </span>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-[12px] text-slate-500">{sc.sourceNote}</p>
          </section>

          <section className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-white/90 shadow-glass">
              <Suspense fallback={<div className="h-56 animate-pulse bg-sky-100" />}>
                <Scene state={PREVIEW} onPick={() => undefined} className="h-56" />
              </Suspense>
              <p className="px-4 py-2 text-[11px] text-slate-500">🏥 急診導尿訓練診間（可拖曳旋轉視角）</p>
            </div>
            <div className="rounded-3xl bg-white/90 p-5 shadow-glass">
              <h2 className="text-[11px] font-bold tracking-widest text-slate-400">道具與耗材（教案第 7 頁）</h2>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {EQUIPMENT.filter((e) => e.id !== 'examGloves').map((e) => (
                  <div key={e.id} className="flex flex-col items-center text-center">
                    <CTIcon id={e.id} size={32} />
                    <span className="text-[10px] leading-tight text-slate-600">{e.name}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">另有：{FIXTURES.map((f) => f.name).join('、')}</p>
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-3xl bg-white/90 p-5 shadow-glass">
          <h2 className="text-[11px] font-bold tracking-widest text-slate-400">評分規準（14 項，每項最高 2 分）</h2>
          <ol className="mt-2 grid gap-1 text-[13px] text-slate-700 md:grid-cols-2">
            {CATHETER_RUBRIC.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <span className="w-5 text-right font-bold text-slate-400">{r.id}.</span>
                <span className="flex-1">{r.title}</span>
                {r.allowedScores && <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">0／2 分</span>}
                {r.observability === 'proxy' && <span className="rounded-full bg-violet-100 px-1.5 text-[10px] font-bold text-violet-700">需教師實體評核</span>}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[11px] text-slate-500">另有整體表現 1–5 分，由教師評估，不與 28 分相加。</p>
        </section>

        <section className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/80 p-4">
          <h2 className="text-[12px] font-bold text-amber-800">數位模擬的限制與安全說明</h2>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[12px] leading-relaxed text-amber-900">
            {CATHETER_CASE.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onContinue} className="rounded-2xl bg-teal-700 px-6 py-3 text-base font-bold text-white shadow-lg hover:bg-teal-800">
            已閱讀，選擇訓練模式 →
          </button>
        </div>
      </div>
    </div>
  );
}

const MODE_STYLE: Record<TrainingModeId, { icon: string; color: string; title: string; desc: string }> = {
  guided: { icon: '🧭', color: '#0d9488', title: '引導練習模式', desc: '依提示逐步操作：每階段有訓練目標、操作原則、漸進式提示與「為什麼？」；錯誤會即時說明並提供補救，不限時。' },
  independent: { icon: '🛠️', color: '#1e40af', title: '自主練習模式', desc: '自行決定操作順序，系統不主動公布正確步驟；記錄器材選擇、污染、順序、安全事件與補救，結束後形成性回饋。' },
  challenge: { icon: '⏱️', color: '#dc2626', title: 'OSCE 模擬挑戰', desc: '8 分鐘倒數，不提供即時答案；病人依情境回應。可能傷害病人的操作仍會安全中止。結束後顯示模擬評核結果。' },
};

export function ModeSelect({ onSelect, onDemo, onBack }: { onSelect: (m: TrainingModeId) => void; onDemo: () => void; onBack: () => void }) {
  const modes = getTrainingModes(sc.stationMinutes);
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-teal-50 via-slate-50 to-sky-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
        <button type="button" onClick={onBack} className="mt-2 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600 shadow-sm hover:bg-white">
          ← 回到情境說明
        </button>
        <h1 className="mt-4 text-2xl font-black text-slate-800">選擇訓練模式</h1>
        <p className="mt-1 text-sm text-slate-500">建議先觀看正確示範，再依序挑戰三種練習模式。所有模式使用同一個模擬診間與相同的評分規準。</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <button type="button" onClick={onDemo} className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-5 text-left shadow-glass ring-2 ring-emerald-300 transition hover:-translate-y-1 hover:ring-emerald-400">
            <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">建議先看</span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">🎬</span>
            <span className="mt-3 text-lg font-black text-slate-800">正確示範模式</span>
            <span className="text-[11px] font-bold text-emerald-700">Demonstration</span>
            <span className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">以動畫完整播放 12 個階段的正確流程：病人說明、手部衛生、導尿包無菌準備、手套、消毒鋪單、潤滑、遇阻力的正確處置、水球定位、尿袋固定與廢棄物，附字幕與正確觀念。</span>
            <span className="mt-3 flex flex-wrap gap-1 text-[10px] font-bold">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">完整流程</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">字幕＋語音旁白</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">可暫停 / 倍速 / 跳章</span>
            </span>
            <span className="mt-4 rounded-xl bg-emerald-600 py-2 text-center text-sm font-bold text-white">觀看示範</span>
          </button>
          {(Object.keys(modes) as TrainingModeId[]).map((id) => {
            const m = modes[id];
            const st = MODE_STYLE[id];
            return (
              <button key={id} type="button" onClick={() => onSelect(id)} className="group flex flex-col rounded-3xl bg-white/90 p-5 text-left shadow-glass ring-2 ring-transparent transition hover:-translate-y-1 hover:ring-teal-300">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: `${st.color}1a` }}>
                  {st.icon}
                </span>
                <span className="mt-3 text-lg font-black text-slate-800">{st.title}</span>
                <span className="text-[11px] font-bold" style={{ color: st.color }}>
                  {m.englishTitle}
                </span>
                <span className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">{st.desc}</span>
                <span className="mt-3 flex flex-wrap gap-1 text-[10px] font-bold">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{m.showHints ? '漸進式提示' : '無提示'}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{m.immediateFeedback ? '即時回饋' : '結束後回饋'}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{m.timeLimitSec ? `${m.timeLimitSec / 60} 分鐘倒數` : '不限時'}</span>
                </span>
                <span className="mt-4 rounded-xl py-2 text-center text-sm font-bold text-white" style={{ background: st.color }}>
                  開始
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-5 text-center text-[12px] text-slate-500">數位評分一律為「模擬形成性評量」，僅作學習回饋，不等同正式 OSCE 實作成績。</p>
      </div>
    </div>
  );
}
