import { createApiThunk, createAppAsyncThunk, type ThunkContext } from '../../app/createAppThunk';
import type { RootState } from '../../app/store';
import { toApiError } from '../../api/client';
import {
  reviewApi,
  type AnalyzeParams,
  type AnalyzeStreamHandlers,
  type RunsQuery,
} from '../../services/reviewApi';
import type { AnalysisResult, ReviewRun } from '../../types/review';
import { fetchDashboardStats } from '../dashboard/dashboardThunks';
import type { PullArg, RepoArg } from '../pullRequests/pullRequestsThunks';
import {
  analysisBegan,
  analysisFailed,
  analysisMetaReceived,
  analysisResultReceived,
  analysisReviewReceived,
  analysisRunCreated,
  analysisStepFinished,
  analysisSucceeded,
} from './analysisSlice';

export const fetchRecentRuns = createApiThunk('reviews/fetchRecentRuns', (query?: RunsQuery) =>
  reviewApi.listRuns({ limit: 100, ...query }),
);

export const fetchRepoRuns = createApiThunk('reviews/fetchRepoRuns', ({ owner, repo }: RepoArg) =>
  reviewApi.listRuns({ owner, repo, limit: 200 }),
);

export const fetchPrRuns = createApiThunk('reviews/fetchPrRuns', ({ owner, repo, number }: PullArg) =>
  reviewApi.listPullRequestRuns(owner, repo, number),
);

export const fetchRun = createApiThunk('reviews/fetchRun', (runId: string) => reviewApi.getRun(runId), {
  condition: (runId, { getState }) => {
    const { fullRunIds, runLoading } = getState().reviews;
    return !fullRunIds[runId] && !runLoading[runId];
  },
});

/** Also refreshes the PR's runs, since marking complete resolves comments posted by earlier runs. */
export const markRunComplete = createApiThunk('reviews/markRunComplete', async (runId: string, { dispatch }) => {
  const run = await reviewApi.markComplete(runId);
  void dispatch(fetchPrRuns({ owner: run.owner, repo: run.repo, number: run.pullNumber }));
  return run;
});

type StreamOpener = (handlers: AnalyzeStreamHandlers, signal: AbortSignal) => Promise<AnalysisResult>;

/** Mirrors an analysis event stream into the analysis slice, then refreshes dependent data. */
async function followAnalysis(
  params: AnalyzeParams,
  open: StreamOpener,
  { dispatch, getState, signal }: ThunkContext,
): Promise<AnalysisResult> {
  dispatch(analysisBegan(params));
  try {
    const result = await open(
      {
        onStarted: (meta) => dispatch(analysisMetaReceived(meta)),
        onRun: (event) => dispatch(analysisRunCreated(event)),
        onStep: (node) => dispatch(analysisStepFinished(node)),
        onResult: (analysis) => {
          const meta = getState().analysis.meta;
          const now = new Date().toISOString();
          const run: ReviewRun = {
            _id: analysis.runId,
            owner: params.owner,
            repo: params.repo,
            pullNumber: params.number,
            status: 'completed',
            baseSha: '',
            headSha: meta?.headSha ?? '',
            baseBranch: meta?.baseBranch ?? '',
            createdAt: now,
            updatedAt: now,
            finalReport: analysis,
          };
          dispatch(analysisResultReceived({ result: analysis, run }));
        },
        onReview: (review) => dispatch(analysisReviewReceived(review)),
      },
      signal,
    );
    dispatch(analysisSucceeded());
    void dispatch(fetchPrRuns(params));
    void dispatch(fetchDashboardStats());
    return result;
  } catch (error) {
    const apiError = toApiError(error);
    dispatch(analysisFailed(apiError, signal.aborted));
    void dispatch(fetchPrRuns(params));
    throw apiError;
  }
}

const isFollowing = (state: RootState, params: AnalyzeParams) => {
  const { status, params: active } = state.analysis;
  return (
    status === 'running' &&
    active?.owner === params.owner &&
    active.repo === params.repo &&
    active.number === params.number
  );
};

/** Starts (or joins) the PR's background analysis and follows it live. */
export const analyzePr = createAppAsyncThunk<AnalysisResult, AnalyzeParams>(
  'analysis/analyzePr',
  async (params, api) => {
    try {
      return await followAnalysis(params, (handlers, signal) => reviewApi.analyzeStream(params, handlers, signal), api);
    } catch (error) {
      return api.rejectWithValue(toApiError(error));
    }
  },
  { condition: (params, { getState }) => !isFollowing(getState(), params) },
);

/** Re-attaches to a run that is still running on the server (e.g. after a page refresh). */
export const resumeAnalysis = createAppAsyncThunk<AnalysisResult, { params: AnalyzeParams; runId: string }>(
  'analysis/resume',
  async ({ params, runId }, api) => {
    try {
      return await followAnalysis(params, (handlers, signal) => reviewApi.attachStream(runId, handlers, signal), api);
    } catch (error) {
      return api.rejectWithValue(toApiError(error));
    }
  },
  { condition: ({ params }, { getState }) => !isFollowing(getState(), params) },
);
