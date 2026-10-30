import { useState } from 'react';
import { Modal } from '../../../training/components/Dialogs';
import { NARRATION, type NarrationPhase } from '../caseData';
import type { WSAction, WSState } from '../engine';

const DEFAULT_PHASE: Record<string, NarrationPhase> = {
  prep: 'intro',
  gloves: 'intro',
  disinfect: 'disinfect',
  drape: 'drape',
  suture: 'suture',
  dressing: 'dressing',
  disposal: 'dressing',
};

/**
 * 向病人說明（選項式模擬口述）
 * 引導模式：選擇後立即顯示說明品質，並可查看說明範例。
 * 自主 / 挑戰模式：只記錄選擇，不揭露適當與否。
 */
export function NarrationPanel({ state, dispatch, guided, onClose }: { state: WSState; dispatch: (a: WSAction) => void; guided: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<NarrationPhase>(DEFAULT_PHASE[state.activeStep]);
  const [showExample, setShowExample] = useState(false);
  const group = NARRATION.find((n) => n.phase === phase)!;
  const chosen = state.narration[phase];
  // 選項順序固定打散，避免適當選項總在第一個
  const options = [...group.options].sort((a, b) => a.text.length % 3 - b.text.length % 3);

  return (
    <Modal onClose={onClose} wide>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800">💬 向病人說明</h3>
            <p className="text-[12px] text-slate-500">假想蘇先生在場。選擇你此刻要對他說的話。</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-slate-400">
            ×
          </button>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {NARRATION.map((n) => (
            <button
              key={n.phase}
              type="button"
              onClick={() => {
                setPhase(n.phase);
                setShowExample(false);
              }}
              className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${phase === n.phase ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {state.narration[n.phase] ? '✓ ' : ''}
              {n.title}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {options.map((o) => {
            const picked = chosen?.optionId === o.id;
            const tone = o.quality === 'good' ? 'border-emerald-400 bg-emerald-50' : o.quality === 'jargon' ? 'border-amber-400 bg-amber-50' : 'border-rose-300 bg-rose-50';
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => dispatch({ type: 'narrate', phase, optionId: o.id })}
                className={`w-full rounded-2xl border-2 px-4 py-3 text-left text-[13px] leading-relaxed text-slate-700 transition ${picked ? (guided ? tone : 'border-blue-500 bg-blue-50') : 'border-slate-200 hover:border-blue-300'}`}
              >
                {o.text}
                {picked && guided && <span className="mt-1 block text-[12px] font-bold text-slate-600">→ {o.feedback}</span>}
                {picked && !guided && <span className="mt-1 block text-[11px] font-bold text-blue-700">已記錄</span>}
              </button>
            );
          })}
        </div>
        {guided && (
          <div className="mt-3">
            <button type="button" onClick={() => setShowExample((v) => !v)} className="text-[12px] font-bold text-blue-700">
              {showExample ? '隱藏' : '查看'}說明範例
            </button>
            {showExample && <p className="mt-1 rounded-xl bg-blue-50 p-3 text-[13px] text-slate-700">{group.options.find((o) => o.quality === 'good')!.text}</p>}
          </div>
        )}
        <p className="mt-3 text-[11px] text-slate-400">
          {group.scored ? '教案評分項目 1：口述消毒、鋪單、縫合、包紮其中三項以上為完全做到。' : '開場說明不在教案評分項目中，但有助於建立病人信任。'} 本版為選項式模擬，無法評估實際語氣。
        </p>
      </div>
    </Modal>
  );
}
