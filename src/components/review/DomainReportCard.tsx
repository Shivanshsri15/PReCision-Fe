import clsx from 'clsx';
import type { DomainKey, DomainReport } from '../../types/review';
import { DOMAIN_META } from '../../utils/domains';
import { pluralize } from '../../utils/format';
import { scoreTone } from '../../utils/severity';

interface DomainReportCardProps {
  domain: DomainKey;
  report?: DomainReport;
}

export function DomainReportCard({ domain, report }: DomainReportCardProps) {
  const meta = DOMAIN_META[domain];
  const Icon = meta.icon;
  const findings = report?.findings.length ?? 0;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2.5">
        <span className={clsx('flex size-8 items-center justify-center rounded-lg', meta.tone)}>
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
          {report ? (
            <p className={clsx('text-lg font-bold leading-tight', scoreTone(report.rating).text)}>
              {report.rating.toFixed(1)}
              <span className="text-xs font-medium text-slate-400">/5</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400">Not reported</p>
          )}
        </div>
      </div>

      <p className={clsx('mt-3 text-xs font-semibold', findings ? 'text-red-600' : 'text-emerald-600')}>
        {pluralize(findings, 'finding')}
      </p>
      {report?.summary && <p className="mt-1 line-clamp-3 text-xs text-slate-600">{report.summary}</p>}

      {report?.weakAreas && report.weakAreas.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
          {report.weakAreas.map((area) => (
            <li key={area} className="flex items-start gap-1.5 text-xs text-slate-600">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-400" />
              {area}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
