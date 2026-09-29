import { useNavigate } from 'react-router-dom';
import type { ReviewRun } from '../../types/review';
import { relativeTime, shortSha } from '../../utils/format';
import { prPath } from '../../utils/keys';
import { RunStatusBadge } from '../ui/StatusBadge';
import { Table, TD, TH, THead, TR } from '../ui/Table';
import { SeverityInline } from './SeverityCounts';

interface RunsTableProps {
  runs: ReviewRun[];
  showRepository?: boolean;
  /** Highlights the run currently being viewed. */
  activeRunId?: string | null;
}

export function RunsTable({ runs, showRepository = true, activeRunId }: RunsTableProps) {
  const navigate = useNavigate();

  return (
    <Table>
      <THead>
        <tr>
          <TH>PR</TH>
          {showRepository && <TH>Repository</TH>}
          <TH>Commit</TH>
          <TH>Status</TH>
          <TH>Findings</TH>
          <TH className="text-right">Date</TH>
        </tr>
      </THead>
      <tbody>
        {runs.map((run) => (
          <TR
            key={run._id}
            className={run._id === activeRunId ? 'bg-brand-50/60' : undefined}
            onClick={() => navigate(`${prPath(run.owner, run.repo, run.pullNumber)}?run=${run._id}`)}
          >
            <TD className="font-semibold text-brand-600">#{run.pullNumber}</TD>
            {showRepository && (
              <TD>
                <span className="text-slate-500">{run.owner}/</span>
                <span className="font-medium text-slate-800">{run.repo}</span>
              </TD>
            )}
            <TD className="font-mono text-xs text-slate-500">{shortSha(run.headSha)}</TD>
            <TD>
              <RunStatusBadge status={run.status} />
            </TD>
            <TD>
              {run.status === 'failed' ? (
                <span className="line-clamp-1 max-w-56 text-xs text-red-600 [overflow-wrap:anywhere]" title={run.error}>
                  {run.error ?? 'Failed'}
                </span>
              ) : (
                <SeverityInline counts={run.finalReport?.counts?.severity} />
              )}
            </TD>
            <TD className="whitespace-nowrap text-right text-xs text-slate-500">{relativeTime(run.createdAt)}</TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
