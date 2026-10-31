import type { ReactNode } from 'react';
import { STERILE_STATUS_LABEL, type ContaminationRecord, type SterileStatus } from '../sterile';

/** SterileFieldManager 的呈現：無菌狀態機 ＋ 污染紀錄（ContaminationEventTracker） */
export function SterileStatusCard({
  status,
  records,
  labels,
  revealUnrecognized,
  children,
}: {
  status: SterileStatus;
  records: ContaminationRecord[];
  labels: Record<string, string>;
  /** 引導模式才揭露尚未被學員察覺的污染 */
  revealUnrecognized: boolean;
  children?: ReactNode;
}) {
  const shownStatus: SterileStatus = !revealUnrecognized && status === 'contaminated' ? 'sterile' : status;
  const st = STERILE_STATUS_LABEL[shownStatus];
  const visible = records.filter((r) => revealUnrecognized || r.recognized);
  const ORDER: SterileStatus[] = ['idle', 'preparing', 'sterile', 'contaminated', 'recognized', 'remediated'];
  return (
    <div className="rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200">
      <p className="text-[11px] font-bold tracking-wider text-slate-400">無菌狀態</p>
      <p className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-black ${st.cls}`}>
        {st.icon} {st.label}
      </p>
      {revealUnrecognized && (
        <div className="mt-2 flex flex-wrap gap-0.5">
          {ORDER.map((s) => (
            <span key={s} className={`rounded px-1 py-0.5 text-[9px] font-bold ${s === shownStatus ? STERILE_STATUS_LABEL[s].cls : 'text-slate-300'}`}>
              {STERILE_STATUS_LABEL[s].label}
            </span>
          ))}
        </div>
      )}
      {visible.length > 0 && (
        <ul className="mt-2 space-y-1 text-[11px]">
          {visible.slice(-4).map((r) => (
            <li key={r.id} className={`rounded-lg px-2 py-1 ${r.remediated ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
              {r.remediated ? '✓' : '⚠'} {labels[r.source] ?? r.source}：{r.reason}
            </li>
          ))}
        </ul>
      )}
      {children && <div className="mt-2 grid gap-1.5">{children}</div>}
    </div>
  );
}
