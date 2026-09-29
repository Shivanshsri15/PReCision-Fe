import clsx from 'clsx';
import { FileX2, Lightbulb } from 'lucide-react';
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
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
  /** Soft-wrap long lines instead of scrolling horizontally. */
  wrap?: boolean;
  className?: string;
}

const LINE_STYLES = {
  add: 'bg-emerald-50/70',
  del: 'bg-red-50/70',
  context: '',
  hunk: 'bg-brand-50/50 text-brand-700',
};

/** Renders the file's patch inside its own scroll container and keeps the focused line centred. */
export function DiffViewer({ file, findings, focusLine, onSelectLine, wrap = false, className }: DiffViewerProps) {
  const lines = useMemo(() => parsePatch(file.patch), [file.patch]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const focusRef = useRef<HTMLTableRowElement | null>(null);

  const findingsByLine = useMemo(() => {
    const map = new Map<number, Finding[]>();
    for (const finding of findings) {
      if (!finding.line) continue;
      map.set(finding.line, [...(map.get(finding.line) ?? []), finding]);
    }
    return map;
  }, [findings]);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, left: 0 });
  }, [file.filename]);

  useEffect(() => {
    const container = scrollRef.current;
    const row = focusRef.current;
    if (!container || !row) return;
    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    container.scrollTo({
      top: container.scrollTop + rowRect.top - containerRect.top - container.clientHeight / 2 + rowRect.height / 2,
      behavior: 'smooth',
    });
  }, [focusLine, file.filename, wrap]);

  if (!file.patch) {
    return (
      <div className={className}>
        <EmptyState icon={FileX2} title="No textual diff" description="GitHub does not provide a patch for binary or very large files." />
      </div>
    );
  }

  return (
    <div ref={scrollRef} className={clsx('overflow-auto overscroll-contain', className)}>
      <table className={clsx('border-collapse font-mono text-xs leading-5', wrap ? 'w-full table-fixed' : 'min-w-full')}>
        <colgroup>
          <col className="w-12" />
          <col className="w-12" />
          <col />
        </colgroup>
        <tbody>
          {lines.map((line, index) => {
            const lineFindings = line.newLine !== undefined && line.type !== 'del' ? findingsByLine.get(line.newLine) : undefined;
            const worst = lineFindings?.reduce((a, b) => (SEVERITY_RANK[b.severity] > SEVERITY_RANK[a.severity] ? b : a));
            const isFocused = focusLine !== null && line.newLine === focusLine && line.type !== 'del';

            if (line.type === 'hunk') {
              return (
                <tr key={index} className={LINE_STYLES.hunk}>
                  <td colSpan={3} className="sticky left-0 px-3 py-1 text-[11px]">
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
                  <td className="select-none border-r border-slate-100 px-2 text-right align-top text-slate-400">{line.oldLine ?? ''}</td>
                  <td
                    className={clsx(
                      'select-none border-r border-slate-100 px-2 text-right align-top text-slate-400',
                      line.newLine !== undefined && 'cursor-pointer hover:text-brand-600',
                    )}
                    onClick={() => line.newLine !== undefined && onSelectLine(line.newLine)}
                  >
                    {line.newLine ?? ''}
                  </td>
                  <td className={clsx('px-3 text-slate-800', wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre')}>
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
                      <div
                        className={clsx(
                          'sticky left-3 max-w-2xl rounded-lg border border-l-4 bg-white p-3 shadow-xs',
                          SEVERITY_META[finding.severity].panel,
                        )}
                      >
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
