import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ApiError } from '../../api/client';
import type { AnalysisStartedEvent, AnalyzeParams } from '../../services/reviewApi';
import type { AnalysisResult, PostedReview, ReviewRun } from '../../types/review';
import { prKey } from '../../utils/keys';
import { isPipelineStepId, PIPELINE_STEPS, type PipelineStepId, type StepStatus } from './pipeline';

export type AnalysisStatus = 'idle' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface StepState {
  status: StepStatus;
  startedAt?: number;
  finishedAt?: number;
}

interface AnalysisState {
  prKey: string | null;
  params: AnalyzeParams | null;
  status: AnalysisStatus;
  steps: Record<PipelineStepId, StepState>;
  startedAt: number | null;
  finishedAt: number | null;
  meta: AnalysisStartedEvent | null;
  runId: string | null;
  review: PostedReview | null;
  error: ApiError | null;
}

const idleSteps = () =>
  Object.fromEntries(PIPELINE_STEPS.map((step) => [step.id, { status: 'idle' }])) as Record<
    PipelineStepId,
    StepState
  >;

const initialState: AnalysisState = {
  prKey: null,
  params: null,
  status: 'idle',
  steps: idleSteps(),
  startedAt: null,
  finishedAt: null,
  meta: null,
  runId: null,
  review: null,
  error: null,
};

/** Starts every idle step whose dependencies have all finished. */
function advance(steps: Record<PipelineStepId, StepState>, at: number) {
  for (const step of PIPELINE_STEPS) {
    if (steps[step.id].status !== 'idle') continue;
    if (step.dependsOn.every((dep) => steps[dep].status === 'done')) {
      steps[step.id] = { status: 'running', startedAt: at };
    }
  }
}

function finishStep(steps: Record<PipelineStepId, StepState>, id: PipelineStepId, at: number) {
  steps[id] = { ...steps[id], status: 'done', startedAt: steps[id].startedAt ?? at, finishedAt: at };
  advance(steps, at);
}

const withTimestamp = <T>(payload: T) => ({ payload: { ...payload, at: Date.now() } });

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    analysisBegan: {
      reducer(_, action: PayloadAction<{ params: AnalyzeParams; at: number }>): AnalysisState {
        const { params, at } = action.payload;
        const steps = idleSteps();
        advance(steps, at);
        return {
          ...initialState,
          prKey: prKey(params.owner, params.repo, params.number),
          params,
          status: 'running',
          startedAt: at,
          steps,
        };
      },
      prepare: (params: AnalyzeParams) => withTimestamp({ params }),
    },
    analysisMetaReceived: {
      reducer(state, action: PayloadAction<{ meta: AnalysisStartedEvent; at: number }>) {
        state.meta = action.payload.meta;
        finishStep(state.steps, 'fetch', action.payload.at);
      },
      prepare: (meta: AnalysisStartedEvent) => withTimestamp({ meta }),
    },
    analysisStepFinished: {
      reducer(state, action: PayloadAction<{ node: string; at: number }>) {
        const { node, at } = action.payload;
        if (isPipelineStepId(node)) finishStep(state.steps, node, at);
      },
      prepare: (node: string) => withTimestamp({ node }),
    },
    analysisResultReceived(state, action: PayloadAction<{ result: AnalysisResult; run: ReviewRun }>) {
      state.runId = action.payload.result.runId;
    },
    analysisReviewReceived(state, action: PayloadAction<PostedReview>) {
      state.review = action.payload;
    },
    analysisSucceeded: {
      reducer(state, action: PayloadAction<{ at: number }>) {
        const { at } = action.payload;
        state.status = 'succeeded';
        state.finishedAt = at;
        for (const step of PIPELINE_STEPS) {
          if (state.steps[step.id].status !== 'done') {
            state.steps[step.id] = { ...state.steps[step.id], status: 'done', finishedAt: at };
          }
        }
      },
      prepare: () => withTimestamp({}),
    },
    analysisFailed: {
      reducer(state, action: PayloadAction<{ error: ApiError; cancelled: boolean; at: number }>) {
        const { error, cancelled, at } = action.payload;
        state.status = cancelled ? 'cancelled' : 'failed';
        state.error = cancelled ? null : error;
        state.finishedAt = at;
        for (const step of PIPELINE_STEPS) {
          if (state.steps[step.id].status === 'running') {
            state.steps[step.id] = { ...state.steps[step.id], status: 'failed', finishedAt: at };
          }
        }
      },
      prepare: (error: ApiError, cancelled: boolean) => withTimestamp({ error, cancelled }),
    },
    analysisCleared() {
      return initialState;
    },
  },
});

export const {
  analysisBegan,
  analysisMetaReceived,
  analysisStepFinished,
  analysisResultReceived,
  analysisReviewReceived,
  analysisSucceeded,
  analysisFailed,
  analysisCleared,
} = analysisSlice.actions;

export default analysisSlice.reducer;
