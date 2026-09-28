import { History, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RunCompare } from '../../components/review/RunCompare';
import { RunsTable } from '../../components/review/RunsTable';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Select } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { SkeletonRows } from '../../components/ui/Skeleton';
import { fetchRecentRuns } from '../../features/reviews/reviewsThunks';
import { selectRecentRuns, selectRecentRunsEntry } from '../../features/reviews/selectors';
import type { RunStatus } from '../../types/review';
import { repoKey } from '../../utils/keys';
import { RUN_STATUS_META } from '../../utils/status';

export function ReviewHistoryPage() {
  const dispatch = useAppDispatch();
  const entry = useAppSelector(selectRecentRunsEntry);
  const runs = useAppSelector(selectRecentRuns);
  const [repoFilter, setRepoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<RunStatus | ''>('');

  useEffect(() => {
    void dispatch(fetchRecentRuns());
  }, [dispatch]);

  const repos = useMemo(() => [...new Set(runs.map((run) => repoKey(run.owner, run.repo)))].sort(), [runs]);
  const filtered = useMemo(
    () =>
      runs.filter(
        (run) =>
          (!repoFilter || repoKey(run.owner, run.repo) === repoFilter) && (!statusFilter || run.status === statusFilter),
      ),
    [runs, repoFilter, statusFilter],
  );
  const completed = useMemo(() => filtered.filter((run) => run.status === 'completed'), [filtered]);

  return (
    <>
      <PageHeader
        title="Review History"
        description="View and compare past analysis runs."
        actions={
          <Button variant="secondary" icon={RefreshCw} loading={entry.status === 'loading'} onClick={() => void dispatch(fetchRecentRuns())}>
            Refresh
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
            <Select value={repoFilter} onChange={(event) => setRepoFilter(event.target.value)} className="w-auto">
              <option value="">All repositories</option>
              {repos.map((repo) => (
                <option key={repo} value={repo}>
                  {repo}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as RunStatus | '')} className="w-auto">
              <option value="">All statuses</option>
              {(Object.keys(RUN_STATUS_META) as RunStatus[]).map((status) => (
                <option key={status} value={status}>
                  {RUN_STATUS_META[status].label}
                </option>
              ))}
            </Select>
          </div>

          {entry.status === 'loading' && !runs.length ? (
            <SkeletonRows rows={6} />
          ) : filtered.length ? (
            <RunsTable runs={filtered} />
          ) : (
            <EmptyState
              icon={History}
              title={runs.length ? 'No runs match these filters' : 'No analysis runs yet'}
              description={runs.length ? undefined : 'Runs appear here after you analyze a pull request.'}
            />
          )}
        </Card>

        {completed.length > 0 && <RunCompare key={`${repoFilter}|${statusFilter}`} runs={completed} />}
      </div>
    </>
  );
}
