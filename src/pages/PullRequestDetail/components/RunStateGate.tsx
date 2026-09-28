import { AlertTriangle, Loader2, Radio, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SkeletonRows } from '../../../components/ui/Skeleton';
import { useResumeAnalysis } from '../../../features/reviews/hooks';
import type { ReviewRun } from '../../../types/review';
import { usePrDetail } from '../context';

/** Renders loading / empty / failed / running states; children only get a completed run. */
export function RunStateGate({ children }: { children: (run: ReviewRun) => ReactNode }) {
  const { run, runLoading, runsLoading, analyze } = usePrDetail();
  const resume = useResumeAnalysis();

  if (runsLoading || (run && runLoading)) {
    return (
      <Card>
        <SkeletonRows rows={5} />
      </Card>
    );
  }

  if (!run) {
    return (
      <Card>
        <EmptyState
          icon={Sparkles}
          title="This pull request has not been analyzed yet"
          description="Run the multi-agent review to get findings, domain reports and an overall assessment."
          action={
            <Button icon={Sparkles} onClick={analyze}>
              Analyze PR
            </Button>
          }
        />
      </Card>
    );
  }

  if (run.status === 'running') {
    return (
      <Card>
        <EmptyState
          icon={Loader2}
          iconClassName="animate-spin"
          title="This run is still in progress"
          description="The analysis keeps running on the server. This page updates automatically when it finishes, or you can watch it live."
          action={
            <Button
              icon={Radio}
              onClick={() => resume({ owner: run.owner, repo: run.repo, number: run.pullNumber, postComments: false }, run._id)}
            >
              View live progress
            </Button>
          }
        />
      </Card>
    );
  }

  if (run.status === 'failed') {
    return (
      <Card>
        <EmptyState
          tone="error"
          icon={AlertTriangle}
          title="This run failed"
          description={run.error}
          action={<Button onClick={analyze}>Run again</Button>}
        />
      </Card>
    );
  }

  return <>{children(run)}</>;
}
