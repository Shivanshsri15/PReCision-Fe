import { ChevronLeft, FileDiff, GitBranch, Sparkles, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { PipelineStepper } from '../../components/review/PipelineStepper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Toggle } from '../../components/ui/Toggle';
import { cancelActiveAnalysis } from '../../features/reviews/analysisController';
import { useStartAnalysis } from '../../features/reviews/hooks';
import { selectAnalysis } from '../../features/reviews/selectors';
import { useNow } from '../../hooks/useNow';
import { formatDuration, pluralize, shortSha } from '../../utils/format';
import { prKey, prPath } from '../../utils/keys';
import { AnalysisFailure, AnalysisSuccess } from './components/AnalysisOutcome';

const REDIRECT_DELAY_MS = 2500;

export function AnalyzingPage() {
  const params = useParams<{ owner: string; repo: string; number: string }>();
  const owner = params.owner ?? '';
  const repo = params.repo ?? '';
  const number = Number(params.number);
  const key = prKey(owner, repo, number);

  const navigate = useNavigate();
  const startAnalysis = useStartAnalysis();
  const analysis = useAppSelector(selectAnalysis);
  const [postComments, setPostComments] = useState(false);

  const isThisPr = analysis.prKey === key;
  const status = isThisPr ? analysis.status : 'idle';
  const now = useNow(status === 'running', 500);
  const elapsed = analysis.startedAt ? (analysis.finishedAt ?? now) - analysis.startedAt : 0;
  const resultHref = analysis.runId ? `${prPath(owner, repo, number)}?run=${analysis.runId}` : prPath(owner, repo, number);

  /** Only auto-open results when this page watched the run finish. */
  const watchedRunning = useRef(false);
  useEffect(() => {
    if (status === 'running') watchedRunning.current = true;
    if (status !== 'succeeded' || !watchedRunning.current) return;
    const timer = window.setTimeout(() => navigate(resultHref), REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status, navigate, resultHref]);

  const retry = () => startAnalysis({ owner, repo, number, postComments: analysis.params?.postComments ?? postComments });

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={prPath(owner, repo, number)} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ChevronLeft className="size-4" /> Back to pull request
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analyzing PR #{number}</h1>
            {status === 'running' && (
              <Badge tone="red" dot pulse>
                Live
              </Badge>
            )}
            {status === 'succeeded' && <Badge tone="green">Completed</Badge>}
            {(status === 'failed' || status === 'cancelled') && <Badge tone="red">{status === 'failed' ? 'Failed' : 'Cancelled'}</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {isThisPr && analysis.meta ? analysis.meta.title : `${owner}/${repo}`} · multi-agent AI pipeline
          </p>
          {isThisPr && analysis.meta && (
            <p className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <FileDiff className="size-3.5" /> {pluralize(analysis.meta.files, 'file')}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitBranch className="size-3.5" /> {analysis.meta.baseBranch} ← {shortSha(analysis.meta.headSha)}
              </span>
            </p>
          )}
        </div>
        {status !== 'idle' && (
          <div className="flex items-center gap-3">
            <span className="text-sm tabular-nums text-slate-500">{formatDuration(elapsed)}</span>
            {status === 'running' && (
              <Button variant="danger" size="sm" icon={Square} onClick={cancelActiveAnalysis}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>

      {status === 'idle' ? (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="Start a new analysis"
            description="Runs Input Guard, RAG retrieval, the Quality, Security and Performance agents, Bug Detection and the Report Assembler."
            action={
              <div className="flex flex-col items-center gap-4">
                <Toggle checked={postComments} onChange={setPostComments} label="Post comments to GitHub" />
                <Button icon={Sparkles} onClick={() => startAnalysis({ owner, repo, number, postComments })}>
                  Analyze PR
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <PipelineStepper steps={analysis.steps} />
          {status === 'succeeded' && <AnalysisSuccess resultHref={resultHref} />}
          {(status === 'failed' || status === 'cancelled') && <AnalysisFailure owner={owner} repo={repo} onRetry={retry} />}
        </div>
      )}
    </div>
  );
}
