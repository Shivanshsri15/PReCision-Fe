import { History } from 'lucide-react';
import { RunCompare } from '../../../components/review/RunCompare';
import { RunsTable } from '../../../components/review/RunsTable';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SkeletonRows } from '../../../components/ui/Skeleton';
import { pluralize } from '../../../utils/format';
import { usePrDetail } from '../context';

export function RunsTab() {
  const { runs, run, runsLoading, analyze } = usePrDetail();
  const completed = runs.filter((r) => r.status === 'completed');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Analysis runs" subtitle={pluralize(runs.length, 'run')} />
        <div className="mt-4">
          {runsLoading ? (
            <SkeletonRows rows={3} />
          ) : runs.length ? (
            <RunsTable runs={runs} showRepository={false} activeRunId={run?._id} />
          ) : (
            <EmptyState icon={History} title="No runs yet" action={<Button onClick={analyze}>Analyze PR</Button>} />
          )}
        </div>
      </Card>

      {completed.length > 0 && <RunCompare key={completed[0]._id} runs={completed} />}
    </div>
  );
}
