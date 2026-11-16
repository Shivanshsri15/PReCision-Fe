import { ArrowRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside
        className="fixed bottom-3 right-3 z-40 sm:bottom-6 sm:right-6"
        aria-label="Demo guide"
        data-demo-step={stepId}
      >
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-xl shadow-slate-900/10 backdrop-blur hover:bg-white"
          aria-expanded={false}
          title="Expand guide"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
            Step {stepIndex + 1}/{total}
          </span>
          <span className="max-w-[10rem] truncate">{title}</span>
          <ChevronUp className="size-4 shrink-0 text-slate-400" />
        </button>
      </aside>
    );
  }

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
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-expanded
            aria-label="Collapse guide"
            title="Collapse"
          >
            <ChevronDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Exit demo"
            title="Exit demo"
          >
            <X className="size-4" />
          </button>
        </div>
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
