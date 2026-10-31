import { useMemo, useState, type ReactNode } from 'react';

export interface CommChoice {
  id: string;
  text: string;
  /** 引導模式顯示的回饋 */
  feedback: string;
  quality: 'good' | 'fair' | 'poor';
  /** 病人回應 */
  reply: string;
}

export interface CommSection {
  id: string;
  title: string;
  note: string;
  options: CommChoice[];
}

/**
 * PatientCommunication：選項式病人溝通（技能共用）
 * - 同一情境有多種合適說法，不把單一句子當成唯一正確答案
 * - 可在同一階段說多句話；引導模式立即顯示回饋，其他模式只記錄
 */
export function PatientCommunication({
  sections,
  initial,
  chosen,
  guided,
  onChoose,
  patient,
  lastReply,
}: {
  sections: CommSection[];
  initial?: string;
  chosen: string[];
  guided: boolean;
  onChoose: (id: string) => void;
  patient?: ReactNode;
  lastReply?: string | null;
}) {
  const [tab, setTab] = useState(initial ?? sections[0].id);
  const section = sections.find((s) => s.id === tab) ?? sections[0];
  // 固定打散順序，避免合適選項總在最前面
  const options = useMemo(() => [...section.options].sort((a, b) => (a.id.charCodeAt(a.id.length - 1) % 5) - (b.id.charCodeAt(b.id.length - 1) % 5)), [section]);
  return (
    <div className="space-y-3">
      {(patient || lastReply) && (
        <div className="flex items-center gap-3 rounded-2xl bg-orange-50/80 p-3">
          {patient}
          {lastReply && <p className="relative rounded-2xl bg-white px-3 py-2 text-[13px] leading-relaxed text-slate-700 shadow-sm">{lastReply}</p>}
        </div>
      )}
      {sections.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {sections.map((s) => {
            const n = s.options.filter((o) => chosen.includes(o.id)).length;
            return (
              <button key={s.id} type="button" onClick={() => setTab(s.id)} className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${tab === s.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {n ? `✓${n} ` : ''}
                {s.title}
              </button>
            );
          })}
        </div>
      )}
      <p className="text-[11px] text-slate-500">{section.note}（可以說不只一句，沒有唯一正確的說法）</p>
      <div className="space-y-2">
        {options.map((o) => {
          const picked = chosen.includes(o.id);
          const tone = o.quality === 'good' ? 'border-emerald-400 bg-emerald-50' : o.quality === 'fair' ? 'border-amber-400 bg-amber-50' : 'border-rose-300 bg-rose-50';
          return (
            <button
              key={o.id}
              type="button"
              disabled={picked}
              onClick={() => onChoose(o.id)}
              className={`w-full rounded-2xl border-2 px-4 py-2.5 text-left text-[13px] leading-relaxed text-slate-700 transition ${picked ? (guided ? tone : 'border-blue-400 bg-blue-50') : 'border-slate-200 bg-white hover:border-blue-300'}`}
            >
              {o.text}
              {picked && guided && <span className="mt-1 block text-[12px] font-bold text-slate-600">→ {o.feedback}</span>}
              {picked && !guided && <span className="mt-1 block text-[11px] font-bold text-blue-700">已說</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
