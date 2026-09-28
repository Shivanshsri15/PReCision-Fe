import { AlertCircle, Database, ExternalLink, GitBranch, GitFork, GitPullRequest, Lock, RefreshCw, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { GithubIcon } from '../../../components/ui/GithubIcon';
import { IndexStatusBadge } from '../../../components/ui/StatusBadge';
import type { RepositoryCardModel } from '../../../features/repositories/selectors';
import { compactNumber, relativeTime } from '../../../utils/format';
import { isIndexInFlight } from '../../../utils/status';

interface RepositoryCardProps {
  card: RepositoryCardModel;
  onIndex: (card: RepositoryCardModel) => void;
}

export function RepositoryCard({ card, onIndex }: RepositoryCardProps) {
  const index = card.index;
  const inFlight = isIndexInFlight(index?.status);

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <GithubIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-slate-900">{card.name}</h3>
            {card.isPrivate && <Lock className="size-3.5 shrink-0 text-slate-400" aria-label="Private" />}
          </div>
          <p className="truncate text-xs text-slate-500">@{card.key}</p>
        </div>
        <IndexStatusBadge status={index?.status} />
      </div>

      <p className="mt-3 line-clamp-2 min-h-10 text-sm text-slate-600">{card.description ?? 'No description provided.'}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        {card.language && (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand-500" />
            {card.language}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5" /> {card.stars}
        </span>
        <span className="inline-flex items-center gap-1">
          <GitFork className="size-3.5" /> {card.forks}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-xs">
        <div>
          <p className="text-slate-500">Last indexed</p>
          <p className="font-medium text-slate-800">{inFlight ? 'Indexing now…' : relativeTime(index?.lastIndexedAt)}</p>
        </div>
        <div>
          <p className="text-slate-500">Chunks</p>
          <p className="inline-flex items-center gap-1 font-medium text-slate-800">
            <Database className="size-3 text-slate-400" />
            {index?.chunkCount !== undefined ? `${compactNumber(index.chunkCount)} · ${index.fileCount ?? 0} files` : '—'}
          </p>
        </div>
      </div>

      {card.branches.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.branches.map((branch) => (
            <span key={branch.branch} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200">
              <GitBranch className="size-3" />
              {branch.branch}
            </span>
          ))}
        </div>
      )}

      {index?.status === 'failed' && index.lastError && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-red-600">
          <AlertCircle className="mt-px size-3.5 shrink-0" />
          <span className="line-clamp-2">{index.lastError}</span>
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        <Button size="sm" variant={index ? 'secondary' : 'primary'} icon={RefreshCw} loading={inFlight} onClick={() => onIndex(card)}>
          {inFlight ? 'Indexing' : index ? 'Re-index' : 'Index branch'}
        </Button>
        <Link
          to={`/pull-requests?repo=${encodeURIComponent(card.key)}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
        >
          <GitPullRequest className="size-3.5" /> Pull requests
        </Link>
        <a
          href={card.htmlUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open on GitHub"
          className="ml-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ExternalLink className="size-4" />
        </a>
      </div>
    </Card>
  );
}
