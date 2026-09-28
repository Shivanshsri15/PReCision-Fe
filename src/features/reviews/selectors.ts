import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { ReviewRun } from '../../types/review';
import { filterFindings, getReportFindings, type FindingFilters } from '../../utils/findings';
import type { RunListEntry } from './reviewsSlice';

const EMPTY_LIST: RunListEntry = { ids: [], status: 'idle', error: null };

const selectRunsById = (state: RootState) => state.reviews.runsById;

export const selectRun = (state: RootState, runId?: string | null): ReviewRun | undefined =>
  runId ? state.reviews.runsById[runId] : undefined;

export const selectIsRunFull = (state: RootState, runId?: string | null) =>
  Boolean(runId && state.reviews.fullRunIds[runId]);

export const selectIsRunLoading = (state: RootState, runId?: string | null) =>
  Boolean(runId && state.reviews.runLoading[runId]);

const resolveIds = (runsById: Record<string, ReviewRun>, ids: string[]) =>
  ids.map((id) => runsById[id]).filter((run): run is ReviewRun => Boolean(run));

export const selectRecentRunsEntry = (state: RootState) => state.reviews.recent;

export const selectRecentRuns = createSelector([selectRunsById, (state: RootState) => state.reviews.recent.ids], resolveIds);

export const selectPrRunsEntry = (state: RootState, prKey: string) => state.reviews.byPr[prKey] ?? EMPTY_LIST;

export const selectPrRuns = createSelector(
  [selectRunsById, (state: RootState, prKey: string) => selectPrRunsEntry(state, prKey).ids],
  resolveIds,
);

export const selectRepoRunsEntry = (state: RootState, repoKey: string) => state.reviews.byRepo[repoKey] ?? EMPTY_LIST;

/** Latest run per pull request number for one repository. */
export const selectLatestRunByPr = createSelector(
  [selectRunsById, (state: RootState, repoKey: string) => selectRepoRunsEntry(state, repoKey).ids],
  (runsById, ids) => {
    const latest = new Map<number, ReviewRun>();
    for (const run of resolveIds(runsById, ids)) {
      const current = latest.get(run.pullNumber);
      if (!current || new Date(run.createdAt) > new Date(current.createdAt)) {
        latest.set(run.pullNumber, run);
      }
    }
    return latest;
  },
);

export const selectRunFindings = createSelector(
  [(state: RootState, runId?: string | null) => selectRun(state, runId)?.finalReport],
  (report) => getReportFindings(report),
);

export const selectFilteredRunFindings = createSelector(
  [
    (state: RootState, runId: string | null | undefined) => selectRunFindings(state, runId),
    (_: RootState, __: string | null | undefined, filters: FindingFilters) => filters,
  ],
  filterFindings,
);

export const selectAnalysis = (state: RootState) => state.analysis;
