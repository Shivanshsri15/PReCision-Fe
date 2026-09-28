import clsx from 'clsx';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { dismissToast, selectToasts, type Toast as ToastModel } from '../../features/ui/uiSlice';

const TOAST_TTL_MS = 5000;

const ICONS = {
  success: { icon: CheckCircle2, className: 'text-emerald-500' },
  error: { icon: XCircle, className: 'text-red-500' },
  info: { icon: Info, className: 'text-brand-500' },
};

function ToastItem({ toast }: { toast: ToastModel }) {
  const dispatch = useAppDispatch();
  const { icon: Icon, className } = ICONS[toast.tone];

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(dismissToast(toast.id)), TOAST_TTL_MS);
    return () => window.clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className="animate-toast-in pointer-events-auto flex w-80 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg">
      <Icon className={clsx('mt-0.5 size-4 shrink-0', className)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{toast.title}</p>
        {toast.message && <p className="mt-0.5 break-words text-xs text-slate-500">{toast.message}</p>}
      </div>
      <button type="button" aria-label="Dismiss" onClick={() => dispatch(dismissToast(toast.id))} className="text-slate-400 hover:text-slate-600">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useAppSelector(selectToasts);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
