import { CheckCircle2, CircleDot, ExternalLink } from 'lucide-react';
import type { PostedComment } from '../../types/review';
import { Card, CardHeader } from '../ui/Card';
import { SeverityBadge } from '../ui/SeverityBadge';

interface PostedCommentsCardProps {
  comments: PostedComment[];
  reviewUrl?: string;
}

/** Comments this run posted to GitHub and whether they have since been resolved. */
export function PostedCommentsCard({ comments, reviewUrl }: PostedCommentsCardProps) {
  const resolved = comments.filter((comment) => comment.resolved).length;

  return (
    <Card>
      <CardHeader
        title="GitHub comments"
        subtitle={`${comments.length - resolved} open · ${resolved} resolved`}
        action={
          reviewUrl && (
            <a href={reviewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              Open review <ExternalLink className="size-3.5" />
            </a>
          )
        }
      />
      <ul className="space-y-2 p-5">
        {comments.map((comment, index) => (
          <li key={`${comment.file}:${comment.line ?? 0}:${index}`} className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
            {comment.resolved ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-label="Resolved" />
            ) : (
              <CircleDot className="mt-0.5 size-4 shrink-0 text-amber-500" aria-label="Open" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={comment.severity} />
                <code className="truncate font-mono text-xs text-slate-600">
                  {comment.file}
                  {comment.line ? `:${comment.line}` : ''}
                </code>
              </div>
              <p className={comment.resolved ? 'mt-1.5 text-sm text-slate-400 line-through' : 'mt-1.5 text-sm text-slate-700'}>
                {comment.issue}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
