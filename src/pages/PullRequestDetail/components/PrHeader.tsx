import { CheckCheck, ChevronRight, ExternalLink, FileDiff, GitBranch, RotateCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { PrStateBadge } from '../../../components/ui/StatusBadge';
import { Toggle } from '../../../components/ui/Toggle';
import type { PullRequest } from '../../../types/github';
import type { ReviewRun } from '../../../types/review';
import { pluralize } from '../../../utils/format';
import { repoKey } from '../../../utils/keys';

interface PrHeaderProps {
  owner: string;
  repo: string;
  number: number;
  pr: PullRequest | null;
  postComments: boolean;
  onPostCommentsChange: (value: boolean) => void;
  onAnalyze: () => void;
  analyzing: boolean;
  /** Newest finished run of this PR. */
  latestRun?: ReviewRun;
  onMarkComplete: () => void;
  markingComplete: boolean;
}

export function PrHeader({
  owner,
  repo,
  number,
  pr,
  postComments,
  onPostCommentsChange,
  onAnalyze,
  analyzing,
  latestRun,
  onMarkComplete,
  markingComplete,
}: PrHeaderProps) {
  const isOpen = pr?.state === 'open';
  const isComplete = Boolean(latestRun?.markedComplete);
  const isRerun = Boolean(latestRun) && !isComplete;
  const label = isComplete ? 'Re-analyze' : isRerun ? 'Re-run analysis' : 'Analyze PR';
  const hint = isRerun
    ? 'Re-run reuses the cached context and re-checks the previous findings. Posting resolves the earlier comments.'
    : isComplete
      ? 'Starts a fresh review with full context retrieval, e.g. after new commits.'
      : 'Runs a fresh analysis with full context retrieval.';

  return (
    <div className="mb-6">
      <nav className="mb-3 flex items-center gap-1 text-xs text-slate-500">
        <Link to={`/pull-requests?repo=${encodeURIComponent(repoKey(owner, repo))}`} className="hover:text-slate-800">
          Pull Requests
        </Link>
        <ChevronRight className="size-3" />
        <span>
          {owner}/{repo}
        </span>
        <ChevronRight className="size-3" />
        <span className="font-medium text-slate-700">#{number}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {pr ? (
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              <span className="text-slate-400">#{number}</span> {pr.title}
            </h1>
          ) : (
            <Skeleton className="h-8 w-96 max-w-full" />
          )}

          {pr && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <PrStateBadge pr={pr} />
              <span className="inline-flex items-center gap-1.5">
                <Avatar src={pr.user.avatar_url} name={pr.user.login} size="xs" />
                {pr.user.login}
              </span>
              {pr.changed_files !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <FileDiff className="size-3.5 text-slate-400" />
                  {pluralize(pr.changed_files, 'file')} changed
                </span>
              )}
              {pr.additions !== undefined && (
                <span className="font-mono text-xs">
                  <span className="text-emerald-600">+{pr.additions}</span>{' '}
                  <span className="text-red-600">−{pr.deletions}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                <GitBranch className="size-3.5 text-slate-400" />
                <span className="rounded bg-slate-100 px-1.5 py-0.5">base: {pr.base.ref}</span>
                <span className="text-slate-400">←</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5">head: {pr.head.ref}</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            {pr && (
              <a
                href={pr.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                <ExternalLink className="size-4" /> GitHub
              </a>
            )}
            {isComplete ? (
              <Badge tone="green">
                <CheckCheck className="size-3.5" /> Review complete
              </Badge>
            ) : (
              latestRun && (
                <Button variant="secondary" icon={CheckCheck} onClick={onMarkComplete} loading={markingComplete} disabled={analyzing}>
                  Mark complete
                </Button>
              )
            )}
            <Button
              icon={latestRun ? RotateCcw : Sparkles}
              variant={isComplete ? 'secondary' : 'primary'}
              onClick={onAnalyze}
              loading={analyzing}
              disabled={!pr || markingComplete}
            >
              {analyzing ? 'Analyzing…' : label}
            </Button>
          </div>
          <Toggle
            checked={postComments && isOpen}
            onChange={onPostCommentsChange}
            disabled={!isOpen}
            label="Post comments to GitHub"
          />
          <p className="max-w-xs text-right text-xs text-slate-500">{hint}</p>
        </div>
      </div>
    </div>
  );
}
