import { GitBranch, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SeverityInline } from '../../../components/review/SeverityCounts';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { PrStateBadge, RunStatusBadge } from '../../../components/ui/StatusBadge';
import { Table, TD, TH, THead, TR } from '../../../components/ui/Table';
import { useStartAnalysis } from '../../../features/reviews/hooks';
import type { PullRequest } from '../../../types/github';
import type { ReviewRun } from '../../../types/review';
import { relativeTime } from '../../../utils/format';
import { prPath } from '../../../utils/keys';

interface PullRequestsTableProps {
  owner: string;
  repo: string;
  pulls: PullRequest[];
  latestRuns: Map<number, ReviewRun>;
}

export function PullRequestsTable({ owner, repo, pulls, latestRuns }: PullRequestsTableProps) {
  const navigate = useNavigate();
  const startAnalysis = useStartAnalysis();

  return (
    <Table>
      <THead>
        <tr>
          <TH>PR</TH>
          <TH>Title</TH>
          <TH>Author</TH>
          <TH>Status</TH>
          <TH>Latest review</TH>
          <TH>Updated</TH>
          <TH className="text-right">Actions</TH>
        </tr>
      </THead>
      <tbody>
        {pulls.map((pr) => {
          const run = latestRuns.get(pr.number);
          return (
            <TR key={pr.id} onClick={() => navigate(prPath(owner, repo, pr.number))}>
              <TD className="font-semibold text-brand-600">#{pr.number}</TD>
              <TD className="max-w-md">
                <p className="truncate font-medium text-slate-900">{pr.title}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
                  <GitBranch className="size-3" />
                  {pr.head.ref} → {pr.base.ref}
                </p>
              </TD>
              <TD>
                <span className="inline-flex items-center gap-2">
                  <Avatar src={pr.user.avatar_url} name={pr.user.login} size="xs" />
                  <span className="text-xs text-slate-600">{pr.user.login}</span>
                </span>
              </TD>
              <TD>
                <PrStateBadge pr={pr} />
              </TD>
              <TD>
                {run ? (
                  <span className="flex flex-col gap-1">
                    <RunStatusBadge status={run.status} />
                    <SeverityInline counts={run.finalReport?.counts?.severity} />
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Not reviewed</span>
                )}
              </TD>
              <TD className="whitespace-nowrap text-xs text-slate-500">{relativeTime(pr.updated_at)}</TD>
              <TD className="text-right">
                {pr.state === 'open' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Sparkles}
                    onClick={(event) => {
                      event.stopPropagation();
                      startAnalysis({ owner, repo, number: pr.number, postComments: false });
                    }}
                  >
                    Analyze
                  </Button>
                )}
              </TD>
            </TR>
          );
        })}
      </tbody>
    </Table>
  );
}
