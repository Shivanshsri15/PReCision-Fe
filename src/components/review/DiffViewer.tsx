import clsx from 'clsx';
import { FileX2, Lightbulb } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef } from 'react';
import type { PullRequestFile } from '../../types/github';
import type { Finding } from '../../types/review';
import { parsePatch } from '../../utils/diff';
import { SEVERITY_META, SEVERITY_RANK } from '../../utils/severity';
import { EmptyState } from '../ui/EmptyState';
import { SeverityBadge } from '../ui/SeverityBadge';

interface DiffViewerProps {
  file: PullRequestFile;
  findings: Finding[];
  focusLine: number | null;
  onSelectLine: (line: number) => void;
}

const LINE_STYLES = {
  add: 'bg-emerald-50/70',
  del: 'bg-red-50/70',
  context: '',
  hunk: 'bg-brand-50/50 text-brand-700',
};

export function DiffViewer({ file, findings, focusLine, onSelectLine }: DiffViewerProps) {
  const lines = useMemo(() => parsePatch(file.patch), [file.patch]);
  const focusRef = useRef<HTMLTableRowElement | null>(null);

  const findingsByLine = useMemo(() => {
    const map = new Map<number, Finding[]>();
    for (const finding of findings) {
      if (!finding.line) continue;
      map.set(finding.line, [...(map.get(finding.line) ?? []), finding]);
    }
    return map;
  }, [findings]);

  useEffect(() => {
    focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusLine, file.filename]);

  if (!file.patch) {
    return <EmptyState icon={FileX2} title="No textual diff" description="GitHub does not provide a patch for binary or very large files." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-xs leading-5">
        <tbody>
          {lines.map((line, index) => {
            const lineFindings = line.newLine !== undefined && line.type !== 'del' ? findingsByLine.get(line.newLine) : undefined;
            const worst = lineFindings?.reduce((a, b) => (SEVERITY_RANK[b.severity] > SEVERITY_RANK[a.severity] ? b : a));
            const isFocused = focusLine !== null && line.newLine === focusLine && line.type !== 'del';

            if (line.type === 'hunk') {
              return (
                <tr key={index} className={LINE_STYLES.hunk}>
                  <td colSpan={3} className="px-3 py-1 text-[11px]">
                    {line.text}
                  </td>
                </tr>
              );
            }

            return (
              <Fragment key={index}>
                <tr
                  ref={isFocused ? focusRef : undefined}
                  className={clsx(
                    LINE_STYLES[line.type],
                    worst && SEVERITY_META[worst.severity].panel,
                    isFocused && 'outline outline-2 -outline-offset-2 outline-brand-400',
                  )}
                >
                  <td className="w-12 select-none border-r border-slate-100 px-2 text-right text-slate-400">{line.oldLine ?? ''}</td>
                  <td
                    className={clsx(
                      'w-12 select-none border-r border-slate-100 px-2 text-right text-slate-400',
                      line.newLine !== undefined && 'cursor-pointer hover:text-brand-600',
                    )}
                    onClick={() => line.newLine !== undefined && onSelectLine(line.newLine)}
                  >
                    {line.newLine ?? ''}
                  </td>
                  <td className="whitespace-pre px-3 text-slate-800">
                    <span className={clsx('mr-2 select-none', line.type === 'add' ? 'text-emerald-600' : line.type === 'del' ? 'text-red-500' : 'text-slate-300')}>
                      {line.type === 'add' ? '+' : line.type === 'del' ? '−' : ' '}
                    </span>
                    {line.text}
                  </td>
                </tr>
                {lineFindings?.map((finding, findingIndex) => (
                  <tr key={`${index}-f${findingIndex}`}>
                    <td colSpan={2} className="border-r border-slate-100" />
                    <td className="px-3 py-2 font-sans">
                      <div className={clsx('rounded-lg border border-l-4 bg-white p-3 shadow-xs', SEVERITY_META[finding.severity].panel)}>
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={finding.severity} />
                          <p className="text-xs font-medium text-slate-900">{finding.issue}</p>
                        </div>
                        {finding.suggestion && (
                          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-600">
                            <Lightbulb className="mt-px size-3 shrink-0 text-amber-500" />
                            {finding.suggestion}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
