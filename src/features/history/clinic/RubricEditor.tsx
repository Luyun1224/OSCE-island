import { useState } from 'react';
import { ConfirmDialog } from '../../training/components/Dialogs';
import { HQShell, PrimaryButton, ReviewBadge } from '../components/Shell';
import type { CasePackage } from '../types';
import { applyOverrides, exportRubric, loadOverrides, saveOverrides, type RubricOverride } from './rubricOverrides';

/** 規準審核介面：檢視題目對應、修改判準文字、標記審核狀態並匯出 */
export function RubricEditor({ c }: { c: CasePackage }) {
  const [overrides, setOverrides] = useState<Record<string, RubricOverride>>(() => loadOverrides(c.id));
  const [reviewer, setReviewer] = useState('');
  const [confirm, setConfirm] = useState(false);
  const merged = applyOverrides(c);

  const update = (id: string, patch: RubricOverride) => {
    const next = { ...overrides, [id]: { ...overrides[id], ...patch, levels: { ...overrides[id]?.levels, ...patch.levels } } };
    setOverrides(next);
    saveOverrides(c.id, next);
  };

  const sub = (id: string) => c.subItems.find((s) => s.id === id)?.label ?? id;
  const questionsFor = (subs: string[]) => [...c.questions, ...c.statements].filter((q) => q.covers?.some((x) => subs.includes(x)));

  return (
    <HQShell crumbs={[{ label: 'HISTORY QUEST', to: '/history' }, { label: '03 虛擬病人診間', to: '/history/clinic' }, { label: c.code, to: `/history/clinic/${c.id}` }, { label: '規準審核' }]}>
      <header className="rounded-[2rem] bg-white/90 p-5 shadow-sm ring-1 ring-violet-100 md:p-7">
        <p className="text-[12px] font-black tracking-[0.25em] text-violet-600">教師專區｜RUBRIC REVIEW</p>
        <h1 className="mt-1 text-2xl font-black text-slate-800">
          {c.code} 評分規準審核
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
          檢視每一項規準對應的問句與說明、修改判準文字並標記審核。修改內容儲存在此瀏覽器，可匯出 JSON 交由管理者更新案例檔。
          <b>計分規則以案例檔中的對應設定為準</b>，修改文字不會改變計分。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="審核者姓名" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <PrimaryButton tone="teal" onClick={() => exportRubric(c)}>
            ⬇ 匯出審核結果（JSON）
          </PrimaryButton>
          <PrimaryButton tone="ghost" onClick={() => setConfirm(true)}>
            還原為案例檔內容
          </PrimaryButton>
        </div>
      </header>

      <section className="mt-4 rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200">
        <h2 className="text-base font-black text-amber-900">待教案作者補充／教師確認</h2>
        <ul className="mt-2 space-y-1">
          {c.pending.map((p) => (
            <li key={p} className="text-[13px] text-amber-900">
              • {p}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12px] text-amber-800">整體表現（1–5 分：{c.globalRating.labels.join('、')}）為獨立欄位，由教師評估，不與 30 分相加。</p>
      </section>

      <section className="mt-4 space-y-3">
        {merged.rubric.map((it) => {
          const subs = it.rule.type === 'count' ? it.rule.subs : [...it.rule.full, ...(it.rule.partial ?? [])];
          const qs = questionsFor(subs);
          return (
            <article key={it.id} className="rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-100 md:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-sm font-black text-white">{it.no}</span>
                <h2 className="flex-1 text-[15px] font-black text-slate-800">{it.title}</h2>
                <ReviewBadge review={it.review} />
                <button
                  type="button"
                  onClick={() => update(it.id, { review: it.review.status === 'reviewed' ? { status: 'draft' } : { status: 'reviewed', reviewer: reviewer || undefined, reviewedAt: new Date().toISOString() } })}
                  className={`rounded-full px-3 py-1 text-[12px] font-bold ${it.review.status === 'reviewed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-600 text-white'}`}
                >
                  {it.review.status === 'reviewed' ? '取消審核' : '標記為已審核'}
                </button>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {it.levels.map((l) => (
                  <label key={l.score} className="block">
                    <span className="text-[11px] font-bold text-slate-500">{l.score} 分</span>
                    <textarea value={l.text} onChange={(e) => update(it.id, { levels: { [l.score]: e.target.value } })} rows={2} className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-[13px] text-slate-700" />
                  </label>
                ))}
              </div>
              <div className="mt-2 text-[12px] text-slate-600">
                <p>
                  <b>計分規則：</b>
                  {it.rule.type === 'count'
                    ? `子要項 ${it.rule.subs.map(sub).join('、')}；涵蓋 ${it.rule.full} 項得 2 分${it.rule.partial !== undefined ? `、${it.rule.partial} 項得 1 分` : ''}`
                    : `做到「${it.rule.full.map(sub).join('／')}」得 2 分${it.rule.partial?.length ? `；做到「${it.rule.partial.map(sub).join('／')}」得 1 分` : ''}`}
                </p>
                <p className="mt-1">
                  <b>對應問句與說明：</b>
                  {qs.map((q) => q.text).join('　')}
                </p>
              </div>
              <label className="mt-2 block">
                <span className="text-[11px] font-bold text-slate-500">對應說明／待確認事項</span>
                <input value={it.mappingNote ?? ''} onChange={(e) => update(it.id, { mappingNote: e.target.value })} className="mt-0.5 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-[13px]" placeholder="例如：只問一般手術史是否給分" />
              </label>
            </article>
          );
        })}
      </section>
      {confirm && (
        <ConfirmDialog
          title="還原規準？"
          message="會清除此瀏覽器中對本案例規準的所有修改與審核標記。"
          confirmLabel="還原"
          danger
          onConfirm={() => {
            setOverrides({});
            saveOverrides(c.id, {});
            setConfirm(false);
          }}
          onCancel={() => setConfirm(false)}
        />
      )}
    </HQShell>
  );
}
