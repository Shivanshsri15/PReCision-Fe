import clsx from 'clsx';
import { Check, ChevronRight, Copy, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Finding } from '../../types/review';
import { DOMAIN_META } from '../../utils/domains';
import { findingLocation } from '../../utils/findings';
import { SEVERITY_META } from '../../utils/severity';
import { Badge } from '../ui/Badge';
import { SeverityBadge } from '../ui/SeverityBadge';

interface FindingCardProps {
  finding: Finding;
  /** Link to the finding in the diff viewer. */
  diffHref?: string;
  compact?: boolean;
  active?: boolean;
  onSelect?: () => void;
}

export function FindingCard({ finding, diffHref, compact = false, active = false, onSelect }: FindingCardProps) {
  const [copied, setCopied] = useState(false);
  const domain = finding.domain ? DOMAIN_META[finding.domain] : null;

  const copy = async () => {
    const text = [
      `[${finding.severity.toUpperCase()}] ${findingLocation(finding)}`,
      finding.issue,
      finding.suggestion ? `Suggestion: ${finding.suggestion}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article
      onClick={onSelect}
      className={clsx(
        'rounded-xl border border-l-4 bg-white transition-shadow',
        SEVERITY_META[finding.severity].panel,
        compact ? 'p-3' : 'p-4',
        onSelect && 'cursor-pointer hover:shadow-md',
        active && 'ring-2 ring-brand-500/40',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={finding.severity} />
        {domain && <Badge colorClassName={domain.badge}>{domain.label}</Badge>}
        <code className="truncate font-mono text-xs text-slate-500">{findingLocation(finding)}</code>
        {!compact && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void copy();
            }}
            aria-label="Copy finding"
            className="ml-auto rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-600"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          </button>
        )}
      </div>

      <p className={clsx('mt-2 font-medium text-slate-900', compact ? 'text-xs' : 'text-sm')}>{finding.issue}</p>

      {finding.suggestion && (
        <p className={clsx('mt-2 flex items-start gap-1.5 text-slate-600', compact ? 'text-[11px]' : 'text-xs')}>
          <Lightbulb className="mt-px size-3.5 shrink-0 text-amber-500" />
          {finding.suggestion}
        </p>
      )}

      {diffHref && !compact && (
        <Link
          to={diffHref}
          onClick={(event) => event.stopPropagation()}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          View in diff <ChevronRight className="size-3.5" />
        </Link>
      )}
    </article>
  );
}
