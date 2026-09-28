import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { PullRequest, PullRequestTab } from '../../types/github';
import { initialAsyncState } from '../../types/async';
import { prDisplayState } from '../../utils/status';
import type { PullDetailEntry, PullFilesEntry, RepoPullsEntry } from './pullRequestsSlice';

const EMPTY_PULLS: RepoPullsEntry = { items: [], ...initialAsyncState() };
const EMPTY_DETAIL: PullDetailEntry = { pr: null, ...initialAsyncState() };
const EMPTY_FILES: PullFilesEntry = { items: [], ...initialAsyncState() };

export const selectRepoPulls = (state: RootState, repoKey: string) =>
  state.pullRequests.byRepo[repoKey] ?? EMPTY_PULLS;

export const selectPullDetail = (state: RootState, prKey: string) =>
  state.pullRequests.details[prKey] ?? EMPTY_DETAIL;

export const selectPullFiles = (state: RootState, prKey: string) =>
  state.pullRequests.files[prKey] ?? EMPTY_FILES;

const matchesTab = (pr: PullRequest, tab: PullRequestTab) => {
  if (tab === 'all') return true;
  const state = prDisplayState(pr);
  if (tab === 'open') return state === 'open' || state === 'draft';
  return state === tab;
};

export const selectPullTabCounts = createSelector(
  [(state: RootState, repoKey: string) => selectRepoPulls(state, repoKey).items],
  (items): Record<PullRequestTab, number> => ({
    open: items.filter((pr) => matchesTab(pr, 'open')).length,
    closed: items.filter((pr) => matchesTab(pr, 'closed')).length,
    merged: items.filter((pr) => matchesTab(pr, 'merged')).length,
    all: items.length,
  }),
);

export const selectFilteredPulls = createSelector(
  [
    (state: RootState, repoKey: string) => selectRepoPulls(state, repoKey).items,
    (_: RootState, __: string, tab: PullRequestTab) => tab,
    (_: RootState, __: string, ___: PullRequestTab, query: string) => query,
  ],
  (items, tab, query) => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (pr) =>
        matchesTab(pr, tab) &&
        (!needle ||
          pr.title.toLowerCase().includes(needle) ||
          String(pr.number).includes(needle.replace('#', '')) ||
          pr.user.login.toLowerCase().includes(needle)),
    );
  },
);
