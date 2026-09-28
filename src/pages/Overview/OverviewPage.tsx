import { ArrowRight, FolderGit2, History, SearchCode, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { AnalyzePrModal } from '../../components/review/AnalyzePrModal';
import { RunsTable } from '../../components/review/RunsTable';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { SkeletonRows } from '../../components/ui/Skeleton';
import { selectDisplayName } from '../../features/auth/selectors';
import { selectDashboard } from '../../features/dashboard/dashboardSlice';
import { fetchDashboardStats } from '../../features/dashboard/dashboardThunks';
import { fetchRecentRuns } from '../../features/reviews/reviewsThunks';
import { selectRecentRuns, selectRecentRunsEntry } from '../../features/reviews/selectors';
import { greeting } from '../../utils/format';
import { StatCard } from './components/StatCard';

const RECENT_LIMIT = 8;

export function OverviewPage() {
  const dispatch = useAppDispatch();
  const name = useAppSelector(selectDisplayName);
  const { stats, status } = useAppSelector(selectDashboard);
  const recentEntry = useAppSelector(selectRecentRunsEntry);
  const recentRuns = useAppSelector(selectRecentRuns).slice(0, RECENT_LIMIT);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchDashboardStats());
    void dispatch(fetchRecentRuns());
  }, [dispatch]);

  const statsLoading = !stats && status !== 'failed';

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${name.split(' ')[0]}`}
        description="Your codebase intelligence at a glance."
        actions={
          <Button icon={Sparkles} onClick={() => setAnalyzeOpen(true)}>
            Analyze PR
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Repositories"
          icon={FolderGit2}
          loading={statsLoading}
          value={stats?.repositories ?? 0}
          hint={`${stats?.indexedBranches ?? 0} indexed branches`}
        />
        <StatCard
          label="Reviews"
          icon={History}
          loading={statsLoading}
          value={stats?.reviews ?? 0}
          hint={`${stats?.completedReviews ?? 0} completed`}
        />
        <StatCard
          label="Findings"
          icon={SearchCode}
          loading={statsLoading}
          value={stats?.findings ?? 0}
          hint={
            <span className="font-medium text-red-600">
              {stats?.severity.high ?? 0} high severity
            </span>
          }
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Recent Reviews"
          subtitle="Latest analysis runs across your repositories"
          action={
            <Link to="/reviews" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <div className="mt-4">
          {recentEntry.status === 'loading' && !recentRuns.length ? (
            <SkeletonRows rows={4} />
          ) : recentRuns.length ? (
            <RunsTable runs={recentRuns} />
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No reviews yet"
              description="Index a repository, then analyze one of its pull requests."
              action={<Button onClick={() => setAnalyzeOpen(true)}>Analyze your first PR</Button>}
            />
          )}
        </div>
      </Card>

      {analyzeOpen && <AnalyzePrModal open onClose={() => setAnalyzeOpen(false)} />}
    </>
  );
}
