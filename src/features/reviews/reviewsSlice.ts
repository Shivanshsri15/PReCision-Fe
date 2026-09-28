import { createSlice } from '@reduxjs/toolkit';
import { initialAsyncState, type AsyncState } from '../../types/async';
import type { ReviewRun } from '../../types/review';
import { prKey, repoKey } from '../../utils/keys';
import { analysisResultReceived } from './analysisSlice';
import { fetchPrRuns, fetchRecentRuns, fetchRepoRuns, fetchRun, markRunComplete } from './reviewsThunks';

export interface RunListEntry extends AsyncState {
  ids: string[];
}

interface ReviewsState {
  runsById: Record<string, ReviewRun>;
  /** Runs whose `finalReport` is complete (not a summary projection). */
  fullRunIds: Record<string, true>;
  runLoading: Record<string, true>;
  recent: RunListEntry;
  byRepo: Record<string, RunListEntry>;
  byPr: Record<string, RunListEntry>;
}

const emptyList = (): RunListEntry => ({ ids: [], ...initialAsyncState() });

const initialState: ReviewsState = {
  runsById: {},
  fullRunIds: {},
  runLoading: {},
  recent: emptyList(),
  byRepo: {},
  byPr: {},
};

function upsertRuns(state: ReviewsState, runs: ReviewRun[], full: boolean): string[] {
  for (const run of runs) {
    const existing = state.runsById[run._id];
    if (full || !state.fullRunIds[run._id]) {
      state.runsById[run._id] = run;
    } else {
      state.runsById[run._id] = { ...run, finalReport: existing?.finalReport };
    }
    if (full) state.fullRunIds[run._id] = true;
  }
  return runs.map((run) => run._id);
}

const newestFirst = (state: ReviewsState, ids: string[]) =>
  [...new Set(ids)].sort(
    (a, b) =>
      new Date(state.runsById[b]?.createdAt ?? 0).getTime() -
      new Date(state.runsById[a]?.createdAt ?? 0).getTime(),
  );

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentRuns.pending, (state) => {
        state.recent.status = 'loading';
        state.recent.error = null;
      })
      .addCase(fetchRecentRuns.fulfilled, (state, action) => {
        state.recent = { ids: upsertRuns(state, action.payload, false), status: 'succeeded', error: null };
      })
      .addCase(fetchRecentRuns.rejected, (state, action) => {
        state.recent.status = 'failed';
        state.recent.error = action.payload ?? null;
      })
      .addCase(fetchRepoRuns.pending, (state, action) => {
        const key = repoKey(action.meta.arg.owner, action.meta.arg.repo);
        state.byRepo[key] = { ...(state.byRepo[key] ?? emptyList()), status: 'loading', error: null };
      })
      .addCase(fetchRepoRuns.fulfilled, (state, action) => {
        const key = repoKey(action.meta.arg.owner, action.meta.arg.repo);
        state.byRepo[key] = { ids: upsertRuns(state, action.payload, false), status: 'succeeded', error: null };
      })
      .addCase(fetchRepoRuns.rejected, (state, action) => {
        const key = repoKey(action.meta.arg.owner, action.meta.arg.repo);
        state.byRepo[key] = { ...(state.byRepo[key] ?? emptyList()), status: 'failed', error: action.payload ?? null };
      })
      .addCase(fetchPrRuns.pending, (state, action) => {
        const { owner, repo, number } = action.meta.arg;
        const key = prKey(owner, repo, number);
        state.byPr[key] = { ...(state.byPr[key] ?? emptyList()), status: 'loading', error: null };
      })
      .addCase(fetchPrRuns.fulfilled, (state, action) => {
        const { owner, repo, number } = action.meta.arg;
        state.byPr[prKey(owner, repo, number)] = {
          ids: upsertRuns(state, action.payload, true),
          status: 'succeeded',
          error: null,
        };
      })
      .addCase(fetchPrRuns.rejected, (state, action) => {
        const { owner, repo, number } = action.meta.arg;
        const key = prKey(owner, repo, number);
        state.byPr[key] = { ...(state.byPr[key] ?? emptyList()), status: 'failed', error: action.payload ?? null };
      })
      .addCase(fetchRun.pending, (state, action) => {
        state.runLoading[action.meta.arg] = true;
      })
      .addCase(fetchRun.fulfilled, (state, action) => {
        delete state.runLoading[action.meta.arg];
        upsertRuns(state, [action.payload], true);
      })
      .addCase(fetchRun.rejected, (state, action) => {
        delete state.runLoading[action.meta.arg];
      })
      .addCase(markRunComplete.fulfilled, (state, action) => {
        upsertRuns(state, [action.payload], true);
      })
      .addCase(analysisResultReceived, (state, action) => {
        const { run } = action.payload;
        upsertRuns(state, [run], true);
        const pr = prKey(run.owner, run.repo, run.pullNumber);
        const repo = repoKey(run.owner, run.repo);
        state.byPr[pr] = { ...(state.byPr[pr] ?? emptyList()), ids: newestFirst(state, [run._id, ...(state.byPr[pr]?.ids ?? [])]) };
        if (state.byRepo[repo]) {
          state.byRepo[repo].ids = newestFirst(state, [run._id, ...state.byRepo[repo].ids]);
        }
        state.recent.ids = newestFirst(state, [run._id, ...state.recent.ids]);
      });
  },
});

export default reviewsSlice.reducer;
