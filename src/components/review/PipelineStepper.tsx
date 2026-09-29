import clsx from 'clsx';
import { Check, Circle, Loader2, X } from 'lucide-react';
import type { StepState } from '../../features/reviews/analysisSlice';
import { PARALLEL_AGENT_IDS, PIPELINE_STEPS, type PipelineStep, type PipelineStepId } from '../../features/reviews/pipeline';
import { useNow } from '../../hooks/useNow';
import { formatDuration } from '../../utils/format';

interface PipelineStepperProps {
  steps: Record<PipelineStepId, StepState>;
}

const STATUS_TEXT: Record<StepState['status'], string> = {
  idle: 'Waiting',
  running: 'Running…',
  done: 'Done',
  failed: 'Stopped',
};

function StepIcon({ status }: { status: StepState['status'] }) {
  const base = 'flex size-7 shrink-0 items-center justify-center rounded-full';
  if (status === 'done') return <span className={clsx(base, 'bg-emerald-500 text-white')}><Check className="size-4" /></span>;
  if (status === 'running') return <span className={clsx(base, 'bg-brand-100 text-brand-600')}><Loader2 className="size-4 animate-spin" /></span>;
  if (status === 'failed') return <span className={clsx(base, 'bg-red-100 text-red-600')}><X className="size-4" /></span>;
  return <span className={clsx(base, 'bg-slate-100 text-slate-300')}><Circle className="size-4" /></span>;
}

function StepCard({ step, state, now, stacked }: { step: PipelineStep; state: StepState; now: number; stacked?: boolean }) {
  const elapsed = state.startedAt ? (state.finishedAt ?? now) - state.startedAt : null;

  return (
    <div
      className={clsx(
        'flex gap-3 rounded-xl border p-4 transition-colors',
        stacked ? 'flex-col items-center text-center' : 'items-center',
        state.status === 'running' ? 'border-brand-300 bg-brand-50/60 shadow-sm' : 'border-slate-200 bg-white',
        state.status === 'failed' && 'border-red-200 bg-red-50/50',
      )}
    >
      <StepIcon status={state.status} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{step.label}</p>
        <p className="text-xs text-slate-500">{state.status === 'idle' || state.status === 'running' ? step.description : STATUS_TEXT[state.status]}</p>
      </div>
      <span className={clsx('text-xs tabular-nums', state.status === 'running' ? 'text-brand-600' : 'text-slate-400')}>
        {elapsed !== null ? formatDuration(elapsed) : STATUS_TEXT[state.status]}
      </span>
    </div>
  );
}

const Connector = () => <div className="mx-auto h-4 w-px bg-slate-200" />;

/** Live view of the review graph: sequential steps with the four review agents in parallel. */
export function PipelineStepper({ steps }: PipelineStepperProps) {
  const running = Object.values(steps).some((step) => step.status === 'running');
  const now = useNow(running);
  const visible = PIPELINE_STEPS.filter((step) => !step.hidden);
  const firstParallel = visible.findIndex((step) => PARALLEL_AGENT_IDS.includes(step.id));
  const before = visible.slice(0, firstParallel);
  const parallel = visible.filter((step) => PARALLEL_AGENT_IDS.includes(step.id));
  const after = visible.slice(firstParallel + parallel.length);

  return (
    <div>
      {before.map((step) => (
        <div key={step.id}>
          <StepCard step={step} state={steps[step.id]} now={now} />
          <Connector />
        </div>
      ))}

      <div className="rounded-xl border border-dashed border-slate-300 p-3">
        <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Parallel domain agents</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {parallel.map((step) => (
            <StepCard key={step.id} step={step} state={steps[step.id]} now={now} stacked />
          ))}
        </div>
      </div>

      {after.map((step) => (
        <div key={step.id}>
          <Connector />
          <StepCard step={step} state={steps[step.id]} now={now} />
        </div>
      ))}
    </div>
  );
}
