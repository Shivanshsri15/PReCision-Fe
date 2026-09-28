import clsx from 'clsx';
import type { SeverityCounts as Counts } from '../../types/review';
import { SEVERITIES, SEVERITY_META, totalFindings } from '../../utils/severity';

/** Three large High/Medium/Low tiles. */
export function SeverityCounts({ counts }: { counts: Counts }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {SEVERITIES.map((severity) => (
        <div key={severity} className={clsx('rounded-xl border px-4 py-3 text-center', SEVERITY_META[severity].panel)}>
          <p className={clsx('text-2xl font-bold', SEVERITY_META[severity].text)}>{counts[severity]}</p>
          <p className="text-xs font-medium text-slate-600">{SEVERITY_META[severity].label}</p>
        </div>
      ))}
    </div>
  );
}

/** Compact "3 high · 4 medium" summary for tables. */
export function SeverityInline({ counts }: { counts?: Counts }) {
  if (!counts) return <span className="text-slate-400">—</span>;
  if (!totalFindings(counts)) return <span className="text-slate-500">0 findings</span>;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 text-xs font-medium">
      {SEVERITIES.filter((severity) => counts[severity] > 0).map((severity) => (
        <span key={severity} className={SEVERITY_META[severity].text}>
          {counts[severity]} {severity}
        </span>
      ))}
    </span>
  );
}
