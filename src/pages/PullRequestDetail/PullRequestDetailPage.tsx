import { AlertTriangle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { RouteTabs } from '../../components/ui/Tabs';
import { fetchPull } from '../../features/pullRequests/pullRequestsThunks';
import { selectPullDetail } from '../../features/pullRequests/selectors';
import { useStartAnalysis } from '../../features/reviews/hooks';
import { fetchPrRuns, fetchRun, markRunComplete } from '../../features/reviews/reviewsThunks';
import {
  selectAnalysis,
  selectIsRunFull,
  selectIsRunLoading,
  selectPrRuns,
  selectPrRunsEntry,
  selectRunFindings,
} from '../../features/reviews/selectors';
import { prKey as toPrKey, prPath } from '../../utils/keys';
import { PrHeader } from './components/PrHeader';
import { RunSelector } from './components/RunSelector';
import type { PrDetailContext } from './context';

const RUNNING_POLL_MS = 8_000;

export function PullRequestDetailPage() {
  const params = useParams<{ owner: string; repo: string; number: string }>();
  const owner = params.owner ?? '';
  const repo = params.repo ?? '';
  const number = Number(params.number);
  const key = toPrKey(owner, repo, number);
  const basePath = prPath(owner, repo, number);

  const dispatch = useAppDispatch();
  const startAnalysis = useStartAnalysis();
  const [searchParams, setSearchParams] = useSearchParams();
  const [postComments, setPostComments] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  const detail = useAppSelector((state) => selectPullDetail(state, key));
  const runsEntry = useAppSelector((state) => selectPrRunsEntry(state, key));
  const runs = useAppSelector((state) => selectPrRuns(state, key));
  const analysis = useAppSelector(selectAnalysis);

  const requestedRunId = searchParams.get('run');
  const run = runs.find((r) => r._id === requestedRunId) ?? runs.find((r) => r.status === 'completed') ?? runs[0];
  const runFull = useAppSelector((state) => selectIsRunFull(state, run?._id));
  const runLoading = useAppSelector((state) => selectIsRunLoading(state, run?._id));
  const findingsCount = useAppSelector((state) => selectRunFindings(state, run?._id)).length;
  const latestRun = runs.find((r) => r.status === 'completed');
  const hasRunningRun = runs.some((r) => r.status === 'running');

  useEffect(() => {
    if (detail.status === 'idle') void dispatch(fetchPull({ owner, repo, number }));
  }, [dispatch, detail.status, owner, repo, number]);

  useEffect(() => {
    if (runsEntry.status === 'idle') void dispatch(fetchPrRuns({ owner, repo, number }));
  }, [dispatch, runsEntry.status, owner, repo, number]);

  useEffect(() => {
    if (run && !runFull) void dispatch(fetchRun(run._id));
  }, [dispatch, run, runFull]);

  // Fallback for when the event stream misses the run finishing.
  useEffect(() => {
    if (!hasRunningRun) return;
    const timer = window.setInterval(() => void dispatch(fetchPrRuns({ owner, repo, number })), RUNNING_POLL_MS);
    return () => window.clearInterval(timer);
  }, [dispatch, hasRunningRun, owner, repo, number]);

  const withRun = useCallback(
    (path: string) => (run ? `${path}${path.includes('?') ? '&' : '?'}run=${run._id}` : path),
    [run],
  );

  const diffHref = useCallback(
    (finding: { file: string; line?: number }) =>
      withRun(`${basePath}/diff?file=${encodeURIComponent(finding.file)}${finding.line ? `&line=${finding.line}` : ''}`),
    [withRun, basePath],
  );

  const analyze = useCallback(
    () => startAnalysis({ owner, repo, number, postComments: postComments && detail.pr?.state === 'open' }),
    [startAnalysis, owner, repo, number, postComments, detail.pr?.state],
  );

  const context = useMemo<PrDetailContext>(
    () => ({
      owner,
      repo,
      number,
      prKey: key,
      pr: detail.pr,
      runs,
      run,
      runLoading: Boolean(run) && (!runFull || runLoading),
      runsLoading: runsEntry.status === 'loading' && !runs.length,
      withRun,
      diffHref,
      analyze,
    }),
    [owner, repo, number, key, detail.pr, runs, run, runFull, runLoading, runsEntry.status, withRun, diffHref, analyze],
  );

  if (!Number.isInteger(number) || number <= 0) {
    return <EmptyState tone="error" icon={AlertTriangle} title="Invalid pull request" />;
  }

  if (detail.status === 'failed' && !detail.pr) {
    return (
      <Card>
        <EmptyState tone="error" icon={AlertTriangle} title="Could not load this pull request" description={detail.error?.message} />
      </Card>
    );
  }

  const analyzing = analysis.status === 'running' && analysis.prKey === key;
  const markComplete = () => {
    if (!latestRun) return;
    setMarkingComplete(true);
    void dispatch(markRunComplete(latestRun._id)).finally(() => setMarkingComplete(false));
  };

  return (
    <>
      <PrHeader
        owner={owner}
        repo={repo}
        number={number}
        pr={detail.pr}
        postComments={postComments}
        onPostCommentsChange={setPostComments}
        onAnalyze={analyze}
        analyzing={analyzing}
        latestRun={latestRun}
        onMarkComplete={markComplete}
        markingComplete={markingComplete}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <RouteTabs
          className="flex-1"
          items={[
            { to: withRun(basePath), label: 'Overview', end: true },
            { to: withRun(`${basePath}/findings`), label: 'Findings', count: run ? findingsCount : undefined },
            { to: withRun(`${basePath}/diff`), label: 'Diff' },
            { to: withRun(`${basePath}/context`), label: 'Context' },
            { to: withRun(`${basePath}/runs`), label: 'Runs', count: runs.length },
          ]}
        />
        <RunSelector
          runs={runs}
          value={run?._id}
          onChange={(runId) =>
            setSearchParams((current) => {
              current.set('run', runId);
              return current;
            })
          }
        />
      </div>

      <Outlet context={context} />
    </>
  );
}
