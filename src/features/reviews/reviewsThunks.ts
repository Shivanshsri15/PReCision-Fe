import { createApiThunk, createAppAsyncThunk } from '../../app/createAppThunk';
import { toApiError } from '../../api/client';
import { reviewApi, type AnalyzeParams, type RunsQuery } from '../../services/reviewApi';
import type { AnalysisResult, ReviewRun } from '../../types/review';
import { fetchDashboardStats } from '../dashboard/dashboardThunks';
import type { PullArg, RepoArg } from '../pullRequests/pullRequestsThunks';
import {
  analysisBegan,
  analysisFailed,
  analysisMetaReceived,
  analysisResultReceived,
  analysisReviewReceived,
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

/**
 * Streams a PR analysis, mirroring pipeline events into the analysis slice.
 * On success the new run is stored and dependent data is refreshed.
 */
export const analyzePr = createAppAsyncThunk<AnalysisResult, AnalyzeParams>(
  'analysis/analyzePr',
  async (params, { dispatch, getState, signal, rejectWithValue }) => {
    dispatch(analysisBegan(params));
    try {
      const result = await reviewApi.analyzeStream(
        params,
        {
          onStarted: (meta) => dispatch(analysisMetaReceived(meta)),
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
      return rejectWithValue(apiError);
    }
  },
  {
    condition: (params, { getState }) => {
      const { status, params: active } = getState().analysis;
      return !(
        status === 'running' &&
        active?.owner === params.owner &&
        active.repo === params.repo &&
        active.number === params.number
      );
    },
  },
);
