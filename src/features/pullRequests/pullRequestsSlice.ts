import { createSlice } from '@reduxjs/toolkit';
import { initialAsyncState, type AsyncState } from '../../types/async';
import type { PullRequest, PullRequestFile } from '../../types/github';
import { prKey, repoKey } from '../../utils/keys';
import { fetchPull, fetchPullFiles, fetchPulls, type PullArg, type RepoArg } from './pullRequestsThunks';

export interface RepoPullsEntry extends AsyncState {
  items: PullRequest[];
}

export interface PullDetailEntry extends AsyncState {
  pr: PullRequest | null;
}

export interface PullFilesEntry extends AsyncState {
  items: PullRequestFile[];
}

interface PullRequestsState {
  byRepo: Record<string, RepoPullsEntry>;
  details: Record<string, PullDetailEntry>;
  files: Record<string, PullFilesEntry>;
}

const initialState: PullRequestsState = { byRepo: {}, details: {}, files: {} };

const toRepoKey = ({ owner, repo }: RepoArg) => repoKey(owner, repo);
const toPrKey = ({ owner, repo, number }: PullArg) => prKey(owner, repo, number);

const pullRequestsSlice = createSlice({
  name: 'pullRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPulls.pending, (state, action) => {
        const key = toRepoKey(action.meta.arg);
        state.byRepo[key] = { items: state.byRepo[key]?.items ?? [], status: 'loading', error: null };
      })
      .addCase(fetchPulls.fulfilled, (state, action) => {
        state.byRepo[toRepoKey(action.meta.arg)] = { items: action.payload, status: 'succeeded', error: null };
      })
      .addCase(fetchPulls.rejected, (state, action) => {
        const key = toRepoKey(action.meta.arg);
        state.byRepo[key] = { items: state.byRepo[key]?.items ?? [], status: 'failed', error: action.payload ?? null };
      })
      .addCase(fetchPull.pending, (state, action) => {
        const key = toPrKey(action.meta.arg);
        state.details[key] = { pr: state.details[key]?.pr ?? null, ...initialAsyncState(), status: 'loading' };
      })
      .addCase(fetchPull.fulfilled, (state, action) => {
        state.details[toPrKey(action.meta.arg)] = { pr: action.payload, status: 'succeeded', error: null };
      })
      .addCase(fetchPull.rejected, (state, action) => {
        const key = toPrKey(action.meta.arg);
        state.details[key] = { pr: state.details[key]?.pr ?? null, status: 'failed', error: action.payload ?? null };
      })
      .addCase(fetchPullFiles.pending, (state, action) => {
        const key = toPrKey(action.meta.arg);
        state.files[key] = { items: state.files[key]?.items ?? [], status: 'loading', error: null };
      })
      .addCase(fetchPullFiles.fulfilled, (state, action) => {
        state.files[toPrKey(action.meta.arg)] = { items: action.payload, status: 'succeeded', error: null };
      })
      .addCase(fetchPullFiles.rejected, (state, action) => {
        const key = toPrKey(action.meta.arg);
        state.files[key] = { items: state.files[key]?.items ?? [], status: 'failed', error: action.payload ?? null };
      });
  },
});

export default pullRequestsSlice.reducer;
