import { useEffect, useState } from 'react';
import type { StepState } from '../../features/reviews/analysisSlice';
import { PIPELINE_STEPS, type PipelineStepId } from '../../features/reviews/pipeline';

const idleSteps = () =>
  Object.fromEntries(PIPELINE_STEPS.map((step) => [step.id, { status: 'idle' as const }])) as Record<
    PipelineStepId,
    StepState
  >;

/** Finish order that mirrors the real graph (parallel agents mid-run). */
const FINISH_ORDER: PipelineStepId[] = [
  'fetch',
  'inputGuard',
  'retriever',
  'qualityReview',
  'securityReview',
  'performanceReview',
  'bugDetection',
  'joinNode',
  'assembler',
];

function advance(steps: Record<PipelineStepId, StepState>, at: number) {
  for (const step of PIPELINE_STEPS) {
    if (steps[step.id].status !== 'idle') continue;
    if (step.dependsOn.every((dep) => steps[dep].status === 'done')) {
      steps[step.id] = { status: 'running', startedAt: at };
    }
  }
}

function finish(steps: Record<PipelineStepId, StepState>, id: PipelineStepId, at: number) {
  steps[id] = {
    ...steps[id],
    status: 'done',
    startedAt: steps[id].startedAt ?? at,
    finishedAt: at,
  };
  advance(steps, at);
}

/**
 * Drives PipelineStepper with timed local transitions. No network.
 * `tickMs` is delay between finishing successive nodes.
 */
export function useFakePipeline(active: boolean, tickMs = 700) {
  const [steps, setSteps] = useState(idleSteps);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setSteps(idleSteps());
      setDone(false);
      return;
    }

    const start = Date.now();
    const initial = idleSteps();
    advance(initial, start);
    setSteps({ ...initial });
    setDone(false);

    let i = 0;
    const timers: number[] = [];

    const schedule = () => {
      if (i >= FINISH_ORDER.length) {
        setDone(true);
        return;
      }
      const id = FINISH_ORDER[i]!;
      i += 1;
      timers.push(
        window.setTimeout(() => {
          setSteps((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(next) as PipelineStepId[]) {
              next[key] = { ...next[key] };
            }
            finish(next, id, Date.now());
            return next;
          });
          schedule();
        }, tickMs),
      );
    };

    schedule();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active, tickMs]);

  return { steps, done };
}
