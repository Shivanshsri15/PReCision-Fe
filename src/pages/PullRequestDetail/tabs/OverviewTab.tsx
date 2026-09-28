import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { DomainReportCard } from '../../../components/review/DomainReportCard';
import { PostedCommentsCard } from '../../../components/review/PostedCommentsCard';
import { FindingCard } from '../../../components/review/FindingCard';
import { SeverityCounts } from '../../../components/review/SeverityCounts';
import { Card, CardHeader } from '../../../components/ui/Card';
import { ScoreRing } from '../../../components/ui/ScoreRing';
import { selectRunFindings } from '../../../features/reviews/selectors';
import { DOMAIN_ORDER } from '../../../utils/domains';
import { countBySeverity, findingKey } from '../../../utils/findings';
import { pluralize } from '../../../utils/format';
import { prPath } from '../../../utils/keys';
import { computeOverallScore } from '../../../utils/severity';
import { RunStateGate } from '../components/RunStateGate';
import { usePrDetail } from '../context';

const TOP_FINDINGS = 3;

export function OverviewTab() {
  return <RunStateGate>{(run) => <OverviewContent runId={run._id} />}</RunStateGate>;
}

function OverviewContent({ runId }: { runId: string }) {
  const { owner, repo, number, run, withRun, diffHref } = usePrDetail();
  const findings = useAppSelector((state) => selectRunFindings(state, runId));
  const report = run?.finalReport;
  const counts = report?.counts?.severity ?? countBySeverity(findings);
  const score = computeOverallScore(report);
  const base = prPath(owner, repo, number);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-900">AI Review</h3>
          <p className="mb-4 mt-0.5 text-sm text-slate-500">{pluralize(findings.length, 'finding')} detected</p>
          <SeverityCounts counts={counts} />
        </Card>

        <Card className="flex items-center gap-5 p-5">
          {score !== null && <ScoreRing score={score} caption="Code quality" />}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Overall Assessment</h3>
            <p className="mt-1.5 text-sm text-slate-600">{report?.overallSummary ?? 'No summary available.'}</p>
          </div>
        </Card>
      </div>

      {run?.postedComments && run.postedComments.length > 0 && (
        <PostedCommentsCard comments={run.postedComments} reviewUrl={run.reviewUrl} />
      )}

      <Card>
        <CardHeader title="Domain Reports" subtitle="Each agent reviews one concern and rates it out of 5" />
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {DOMAIN_ORDER.map((domain) => (
            <DomainReportCard key={domain} domain={domain} report={report?.domainReports?.[domain]} />
          ))}
        </div>
      </Card>

      {findings.length > 0 && (
        <Card>
          <CardHeader
            title="Top findings"
            subtitle="Highest severity first"
            action={
              <Link to={withRun(`${base}/findings`)} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
                All findings <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="space-y-3 p-5">
            {findings.slice(0, TOP_FINDINGS).map((finding, index) => (
              <FindingCard
                key={findingKey(finding, index)}
                finding={finding}
                diffHref={diffHref(finding)}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
