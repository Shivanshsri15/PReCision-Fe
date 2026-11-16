import { ArrowRight, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { DemoStepId } from './useDemoTour';

interface DemoCoachProps {
  stepIndex: number;
  total: number;
  title: string;
  body: string;
  /** Hide Next while an auto-progress step is running. */
  showNext: boolean;
  nextLabel?: string;
  onNext: () => void;
  onSkip: () => void;
  stepId: DemoStepId;
}

export function DemoCoach({
  stepIndex,
  total,
  title,
  body,
  showNext,
  nextLabel = 'Next',
  onNext,
  onSkip,
  stepId,
}: DemoCoachProps) {
  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[360px]"
      aria-label="Demo guide"
      data-demo-step={stepId}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
          Step {stepIndex + 1} of {total}
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Exit demo"
        >
          <X className="size-4" />
        </button>
      </div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          Exit demo
        </button>
        {showNext ? (
          <Button size="sm" iconRight={ArrowRight} onClick={onNext}>
            {nextLabel}
          </Button>
        ) : (
          <span className="text-xs font-medium text-slate-400">Please wait…</span>
        )}
      </div>
    </aside>
  );
}
