import type { PullRequest } from '../../types/github';
import type { RepoIndexStatus } from '../../types/repoIndex';
import type { RunStatus } from '../../types/review';
import { INDEX_STATUS_META, PR_STATE_META, prDisplayState, RUN_STATUS_META } from '../../utils/status';
import { Badge } from './Badge';

export function RunStatusBadge({ status }: { status: RunStatus }) {
  const meta = RUN_STATUS_META[status];
  return (
    <Badge tone={meta.tone} dot pulse={status === 'running'}>
      {meta.label}
    </Badge>
  );
}

export function IndexStatusBadge({ status }: { status?: RepoIndexStatus }) {
  const meta = INDEX_STATUS_META[status ?? 'missing'];
  return (
    <Badge tone={meta.tone} dot pulse={status === 'indexing' || status === 'pending'}>
      {meta.label}
    </Badge>
  );
}

export function PrStateBadge({ pr }: { pr: PullRequest }) {
  const meta = PR_STATE_META[prDisplayState(pr)];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
