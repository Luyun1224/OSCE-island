import type { ReactNode } from 'react';

export function Modal({ children, onClose, wide }: { children: ReactNode; onClose?: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/45 p-3 backdrop-blur-sm sm:items-center" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`max-h-[88vh] w-full animate-fade-up overflow-y-auto rounded-3xl bg-white shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-md'}`}>{children}</div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <Modal onClose={onCancel}>
      <div className="p-6">
        <h3 className="text-lg font-black text-slate-800">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            取消
          </button>
          <button type="button" onClick={onConfirm} className={`rounded-xl px-4 py-2 text-sm font-bold text-white ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-700 hover:bg-blue-800'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export type ToastTone = 'info' | 'warn' | 'good' | 'error';

const TONE: Record<ToastTone, string> = {
  info: 'border-sky-200 bg-white text-slate-700',
  warn: 'border-amber-300 bg-amber-50 text-amber-900',
  good: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  error: 'border-rose-300 bg-rose-50 text-rose-900',
};

export interface ToastMessage {
  id: number;
  tone: ToastTone;
  title: string;
  body?: string;
}

export function ToastStack({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-16 z-[80] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <button
          type="button"
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto animate-fade-up rounded-2xl border px-4 py-3 text-left shadow-lg ${TONE[t.tone]}`}
        >
          <p className="text-sm font-bold">{t.title}</p>
          {t.body && <p className="mt-1 text-[12px] leading-relaxed opacity-90">{t.body}</p>}
        </button>
      ))}
    </div>
  );
}
