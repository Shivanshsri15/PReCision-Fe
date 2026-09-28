import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type {
  EventsSnapshot,
  IndexCompletedEvent,
  IndexedFile,
  IndexFailedEvent,
  IndexJobSummary,
} from '../../types/events';
import { indexKey } from '../../utils/keys';

const MAX_TRACKED_FILES = 300;

export type IndexJobStatus = 'running' | 'completed' | 'failed';

export interface IndexJob extends IndexJobSummary {
  status: IndexJobStatus;
  files: IndexedFile[];
  fileCount?: number;
  chunkCount?: number;
  error?: string;
}

/** Live and recently finished index jobs, keyed by `owner/repo@branch`. */
type IndexJobsState = Record<string, IndexJob>;

const initialState: IndexJobsState = {};

const jobKey = (job: Pick<IndexJobSummary, 'owner' | 'repo' | 'branch'>) => indexKey(job.owner, job.repo, job.branch);

const indexJobsSlice = createSlice({
  name: 'indexJobs',
  initialState,
  reducers: {
    snapshotReceived(state, action: PayloadAction<EventsSnapshot>) {
      const live = new Set<string>();
      for (const job of action.payload.indexing ?? []) {
        const key = jobKey(job);
        live.add(key);
        state[key] = { ...job, status: 'running' };
      }
      for (const [key, job] of Object.entries(state)) {
        if (job.status === 'running' && !live.has(key)) delete state[key];
      }
    },
    indexJobUpdated(state, action: PayloadAction<IndexJobSummary & { file?: IndexedFile }>) {
      const { file, ...summary } = action.payload;
      const key = jobKey(summary);
      const existing = state[key];
      const restart = !existing || existing.status !== 'running' || existing.startedAt !== summary.startedAt;
      const files = restart ? [] : existing.files;
      if (file) {
        files.push(file);
        if (files.length > MAX_TRACKED_FILES) files.shift();
      }
      state[key] = { ...summary, status: 'running', files };
    },
    indexJobCompleted(state, action: PayloadAction<IndexCompletedEvent>) {
      const key = jobKey(action.payload);
      state[key] = { ...action.payload, status: 'completed', files: state[key]?.files ?? [] };
    },
    indexJobFailed(state, action: PayloadAction<IndexFailedEvent>) {
      const key = jobKey(action.payload);
      state[key] = { ...action.payload, status: 'failed', files: state[key]?.files ?? [] };
    },
  },
});

export const { snapshotReceived, indexJobUpdated, indexJobCompleted, indexJobFailed } = indexJobsSlice.actions;

export const selectIndexJob = (state: RootState, key: string | null) => (key ? state.indexJobs[key] : undefined);

export default indexJobsSlice.reducer;
