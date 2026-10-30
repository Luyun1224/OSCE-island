import { useState } from 'react';
import type { SkillStep } from '../types';

/** HintSystem 的呈現：學習目標 → 逐層提示 → 為什麼？ */
export function HintPanel({ step, revealed, onReveal }: { step: SkillStep; revealed: number; onReveal: () => void }) {
  const [whyOpen, setWhyOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-blue-50 p-3">
        <p className="text-[11px] font-bold tracking-wider text-blue-500">學習目標</p>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{step.goal}</p>
      </div>

      <div className="space-y-2">
        {step.hints.slice(0, revealed).map((h, i) => (
          <div key={i} className="animate-fade-up rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-[11px] font-bold text-amber-600">提示 {i + 1}｜{h.label}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{h.text}</p>
          </div>
        ))}
        {revealed < step.hints.length && (
          <button type="button" onClick={onReveal} className="w-full rounded-xl border border-dashed border-amber-300 px-3 py-2 text-[12px] font-bold text-amber-700 hover:bg-amber-50">
            💡 {revealed === 0 ? '需要提示嗎？' : '顯示下一層提示'}（{revealed}/{step.hints.length}）
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {step.why.map((w, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button type="button" onClick={() => setWhyOpen(whyOpen === i ? null : i)} className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] font-bold text-slate-700">
              <span>❓ 為什麼？{w.title}</span>
              <span className="text-slate-400">{whyOpen === i ? '−' : '+'}</span>
            </button>
            {whyOpen === i && <p className="border-t border-slate-100 px-3 py-2 text-[12px] leading-relaxed text-slate-600">{w.text}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
