import type { PullRequest, PullRequestDisplayState } from '../types/github';
import type { RepoIndexStatus } from '../types/repoIndex';
import type { RunStatus } from '../types/review';

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'indigo' | 'violet' | 'slate';

export interface StatusMeta {
  label: string;
  tone: Tone;
}

export const RUN_STATUS_META: Record<RunStatus, StatusMeta> = {
  completed: { label: 'Completed', tone: 'green' },
  running: { label: 'Running', tone: 'blue' },
  failed: { label: 'Failed', tone: 'red' },
};

export const INDEX_STATUS_META: Record<RepoIndexStatus, StatusMeta> = {
  ready: { label: 'Indexed', tone: 'green' },
  partial: { label: 'Partial', tone: 'amber' },
  indexing: { label: 'Indexing', tone: 'blue' },
  pending: { label: 'Pending', tone: 'blue' },
  failed: { label: 'Failed', tone: 'red' },
  missing: { label: 'Not indexed', tone: 'slate' },
};

export const PR_STATE_META: Record<PullRequestDisplayState, StatusMeta> = {
  open: { label: 'Open', tone: 'green' },
  draft: { label: 'Draft', tone: 'slate' },
  merged: { label: 'Merged', tone: 'violet' },
  closed: { label: 'Closed', tone: 'red' },
};

export function prDisplayState(pr: PullRequest): PullRequestDisplayState {
  if (pr.merged_at) return 'merged';
  if (pr.state === 'closed') return 'closed';
  return pr.draft ? 'draft' : 'open';
}

export const isIndexInFlight = (status?: RepoIndexStatus) => status === 'indexing' || status === 'pending';
