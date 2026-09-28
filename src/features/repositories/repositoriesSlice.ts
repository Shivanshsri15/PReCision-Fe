import { createSlice } from '@reduxjs/toolkit';
import type { ApiError } from '../../api/client';
import type { LoadStatus } from '../../types/async';
import type { GithubRepo } from '../../types/github';
import type { RepoIndexRecord } from '../../types/repoIndex';
import { indexKey } from '../../utils/keys';
import {
  fetchIndexedRepos,
  fetchIndexStatus,
  fetchRepos,
  indexBranch,
  REPOS_PER_PAGE,
} from './repositoriesThunks';

interface RepositoriesState {
  repos: GithubRepo[];
  reposStatus: LoadStatus;
  reposError: ApiError | null;
  page: number;
  hasMore: boolean;
  /** Keyed by `owner/repo@branch`. */
  indexRecords: Record<string, RepoIndexRecord>;
  indexedStatus: LoadStatus;
  /** Branches with a full-index request in flight. */
  indexingKeys: Record<string, true>;
}

const initialState: RepositoriesState = {
  repos: [],
  reposStatus: 'idle',
  reposError: null,
  page: 0,
  hasMore: true,
  indexRecords: {},
  indexedStatus: 'idle',
  indexingKeys: {},
};

const recordKey = (record: Pick<RepoIndexRecord, 'owner' | 'repo' | 'branch'>) =>
  indexKey(record.owner, record.repo, record.branch);

const repositoriesSlice = createSlice({
  name: 'repositories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepos.pending, (state) => {
        state.reposStatus = 'loading';
        state.reposError = null;
      })
      .addCase(fetchRepos.fulfilled, (state, action) => {
        const { page, repos } = action.payload;
        const existing = page === 1 ? [] : state.repos;
        const seen = new Set(existing.map((repo) => repo.id));
        state.repos = [...existing, ...repos.filter((repo) => !seen.has(repo.id))];
        state.page = page;
        state.hasMore = repos.length === REPOS_PER_PAGE;
        state.reposStatus = 'succeeded';
      })
      .addCase(fetchRepos.rejected, (state, action) => {
        state.reposStatus = 'failed';
        state.reposError = action.payload ?? null;
      })
      .addCase(fetchIndexedRepos.pending, (state) => {
        state.indexedStatus = 'loading';
      })
      .addCase(fetchIndexedRepos.fulfilled, (state, action) => {
        state.indexedStatus = 'succeeded';
        for (const record of action.payload) {
          state.indexRecords[recordKey(record)] = record;
        }
      })
      .addCase(fetchIndexedRepos.rejected, (state) => {
        state.indexedStatus = 'failed';
      })
      .addCase(fetchIndexStatus.fulfilled, (state, action) => {
        const key = recordKey(action.payload);
        if (action.payload.status === 'missing') {
          delete state.indexRecords[key];
        } else {
          state.indexRecords[key] = { ...state.indexRecords[key], ...action.payload };
        }
      })
      .addCase(indexBranch.pending, (state, action) => {
        const ref = action.meta.arg;
        const key = recordKey(ref);
        state.indexingKeys[key] = true;
        state.indexRecords[key] = {
          ...state.indexRecords[key],
          ...ref,
          status: 'indexing',
          lastError: undefined,
        };
      })
      .addCase(indexBranch.fulfilled, (state, action) => {
        const key = recordKey(action.meta.arg);
        delete state.indexingKeys[key];
        state.indexRecords[key] = { ...state.indexRecords[key], ...action.payload };
      })
      .addCase(indexBranch.rejected, (state, action) => {
        const key = recordKey(action.meta.arg);
        delete state.indexingKeys[key];
        state.indexRecords[key] = {
          ...state.indexRecords[key],
          status: 'failed',
          lastError: action.payload?.message,
        };
      });
  },
});

export default repositoriesSlice.reducer;
