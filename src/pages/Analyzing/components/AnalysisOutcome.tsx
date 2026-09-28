import { AlertTriangle, ArrowRight, CheckCircle2, Database, ExternalLink, KeyRound, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { SeverityCounts } from '../../../components/review/SeverityCounts';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { IndexStatusBadge } from '../../../components/ui/StatusBadge';
import { indexBranch } from '../../../features/repositories/repositoriesThunks';
import { selectIndexRecord } from '../../../features/repositories/selectors';
import { selectAnalysis, selectRun } from '../../../features/reviews/selectors';
import { emptySeverityCounts } from '../../../utils/severity';
import { isIndexInFlight } from '../../../utils/status';

interface OutcomeProps {
  owner: string;
  repo: string;
  resultHref: string;
  onRetry: () => void;
}

export function AnalysisSuccess({ resultHref }: Pick<OutcomeProps, 'resultHref'>) {
  const { runId, review } = useAppSelector(selectAnalysis);
  const run = useAppSelector((state) => selectRun(state, runId));

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-5 text-emerald-500" />
        <h3 className="text-sm font-semibold text-slate-900">Review complete</h3>
      </div>
      <p className="mt-1 text-sm text-slate-600">{run?.finalReport?.overallSummary}</p>
      <div className="mt-4">
        <SeverityCounts counts={run?.finalReport?.counts?.severity ?? emptySeverityCounts()} />
      </div>

      {review && (
        <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
          {review.posted ? (
            <span className="flex flex-wrap items-center gap-2">
              Posted to GitHub: {review.inlineComments} inline comments, {review.summaryOnly} in the summary.
              {review.resolvedPrevious > 0 && ` Resolved ${review.resolvedPrevious} comments from the previous review.`}
              {review.url && (
                <a href={review.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-600">
                  Open review <ExternalLink className="size-3" />
                </a>
              )}
            </span>
          ) : (
            <span className="text-red-600">Could not post comments: {review.error}</span>
          )}
        </div>
      )}

      <Link to={resultHref} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">
        View results <ArrowRight className="size-4" />
      </Link>
    </Card>
  );
}

/** Explains a failed analysis and offers the matching fix (index the branch, add a key, retry). */
export function AnalysisFailure({ owner, repo, onRetry }: Omit<OutcomeProps, 'resultHref'>) {
  const dispatch = useAppDispatch();
  const { error, meta, status } = useAppSelector(selectAnalysis);
  const baseBranch = meta?.baseBranch;
  const record = useAppSelector((state) => (baseBranch ? selectIndexRecord(state, owner, repo, baseBranch) : undefined));

  const notIndexed = error?.status === 409;
  const missingKey = /gemini/i.test(error?.message ?? '');
  const indexing = isIndexInFlight(record?.status);
  const indexReady = record?.status === 'ready' || record?.status === 'partial';

  return (
    <Card className="border-red-200 p-5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-5 text-red-500" />
        <h3 className="text-sm font-semibold text-slate-900">{status === 'cancelled' ? 'Analysis cancelled' : 'Analysis failed'}</h3>
      </div>
      {error && <p className="mt-1 text-sm text-slate-600">{error.message}</p>}

      {notIndexed && baseBranch && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
          <Database className="size-4 text-slate-400" />
          <span className="text-sm text-slate-700">
            Base branch <code className="font-mono">{baseBranch}</code>
          </span>
          <IndexStatusBadge status={record?.status} />
          {!indexReady && (
            <Button size="sm" className="ml-auto" loading={indexing} onClick={() => void dispatch(indexBranch({ owner, repo, branch: baseBranch }))}>
              {indexing ? 'Indexing…' : 'Index now'}
            </Button>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {missingKey && (
          <Link to="/settings" className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
            <KeyRound className="size-4" /> Add Gemini key
          </Link>
        )}
        <Button icon={RotateCcw} onClick={onRetry} disabled={notIndexed && !indexReady}>
          Retry analysis
        </Button>
      </div>
    </Card>
  );
}
