import { AlertTriangle, GitPullRequest, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput, Select } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { SkeletonRows } from '../../components/ui/Skeleton';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { fetchPulls } from '../../features/pullRequests/pullRequestsThunks';
import { selectFilteredPulls, selectPullTabCounts, selectRepoPulls } from '../../features/pullRequests/selectors';
import { useRepositoriesBootstrap } from '../../features/repositories/hooks';
import { selectRepoOptions, selectRepositoriesState } from '../../features/repositories/selectors';
import { fetchRepoRuns } from '../../features/reviews/reviewsThunks';
import { selectLatestRunByPr, selectRepoRunsEntry } from '../../features/reviews/selectors';
import type { PullRequestTab } from '../../types/github';
import { splitRepoKey } from '../../utils/keys';
import { PullRequestsTable } from './components/PullRequestsTable';

export function PullRequestsPage() {
  useRepositoriesBootstrap();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<PullRequestTab>('open');
  const [query, setQuery] = useState('');

  const repoOptions = useAppSelector(selectRepoOptions);
  const { reposStatus } = useAppSelector(selectRepositoriesState);
  const selectedKey = searchParams.get('repo') ?? repoOptions[0]?.key ?? '';
  const repo = splitRepoKey(selectedKey);

  const pullsEntry = useAppSelector((state) => selectRepoPulls(state, selectedKey));
  const pulls = useAppSelector((state) => selectFilteredPulls(state, selectedKey, tab, query));
  const counts = useAppSelector((state) => selectPullTabCounts(state, selectedKey));
  const runsEntry = useAppSelector((state) => selectRepoRunsEntry(state, selectedKey));
  const latestRuns = useAppSelector((state) => selectLatestRunByPr(state, selectedKey));

  useEffect(() => {
    const target = splitRepoKey(selectedKey);
    if (!target) return;
    if (pullsEntry.status === 'idle') void dispatch(fetchPulls(target));
    if (runsEntry.status === 'idle') void dispatch(fetchRepoRuns(target));
  }, [dispatch, selectedKey, pullsEntry.status, runsEntry.status]);

  const refresh = () => {
    if (!repo) return;
    void dispatch(fetchPulls(repo));
    void dispatch(fetchRepoRuns(repo));
  };

  const tabs: TabItem<PullRequestTab>[] = [
    { id: 'open', label: 'Open', count: counts.open },
    { id: 'closed', label: 'Closed', count: counts.closed },
    { id: 'merged', label: 'Merged', count: counts.merged },
    { id: 'all', label: 'All', count: counts.all },
  ];

  return (
    <>
      <PageHeader
        title="Pull Requests"
        description="Review and analyze pull requests with AI."
        actions={
          <Button variant="secondary" icon={RefreshCw} loading={pullsEntry.status === 'loading'} onClick={refresh} disabled={!repo}>
            Refresh
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <Select
            aria-label="Repository"
            value={selectedKey}
            onChange={(event) => setSearchParams({ repo: event.target.value })}
            className="w-full sm:w-64"
            disabled={!repoOptions.length}
          >
            {!repoOptions.length && <option>{reposStatus === 'loading' ? 'Loading repositories…' : 'No repositories'}</option>}
            {repoOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.key}
                {option.indexed ? ' — indexed' : ''}
              </option>
            ))}
          </Select>
          <SearchInput value={query} onChange={setQuery} placeholder="Search pull requests…" className="w-full sm:w-64" />
          <Tabs items={tabs} active={tab} onChange={setTab} className="sm:ml-auto" />
        </div>

        {pullsEntry.status === 'loading' && !pullsEntry.items.length ? (
          <SkeletonRows rows={6} />
        ) : pullsEntry.status === 'failed' ? (
          <EmptyState
            tone="error"
            icon={AlertTriangle}
            title="Could not load pull requests"
            description={pullsEntry.error?.message}
            action={<Button onClick={refresh}>Try again</Button>}
          />
        ) : pulls.length && repo ? (
          <PullRequestsTable owner={repo.owner} repo={repo.repo} pulls={pulls} latestRuns={latestRuns} />
        ) : (
          <EmptyState
            icon={GitPullRequest}
            title={repo ? 'No pull requests here' : 'Select a repository'}
            description={repo ? 'Nothing matches this tab or search.' : 'Choose a repository to see its pull requests.'}
          />
        )}
      </Card>
    </>
  );
}
