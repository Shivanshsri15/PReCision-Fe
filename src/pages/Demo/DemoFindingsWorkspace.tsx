import clsx from 'clsx';
import {
  ChevronDown,
  ChevronUp,
  FileDiff,
  GitPullRequest,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  SearchX,
  WrapText,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DiffFileTree } from '../../components/review/DiffFileTree';
import { DiffViewer } from '../../components/review/DiffViewer';
import { FindingCard } from '../../components/review/FindingCard';
import { FindingsFilterBar } from '../../components/review/FindingsFilterBar';
import { PostedCommentsCard } from '../../components/review/PostedCommentsCard';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { Toggle } from '../../components/ui/Toggle';
import type { Finding, PostedComment } from '../../types/review';
import {
  countBySeverity,
  DEFAULT_FINDING_FILTERS,
  filterFindings,
  findingKey,
  groupFindingsByFile,
  sortFindings,
  type FindingFilters,
} from '../../utils/findings';
import { pluralize } from '../../utils/format';
import type { DemoScenario } from './scenarios';

type DemoTab = 'findings' | 'diff';

const iconButton =
  'inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40';

export function DemoFindingsWorkspace({
  scenario,
  postComments,
}: {
  scenario: DemoScenario;
  postComments: boolean;
}) {
  const [tab, setTab] = useState<DemoTab>('findings');
  const [filters, setFilters] = useState<FindingFilters>(DEFAULT_FINDING_FILTERS);
  const [selectedFile, setSelectedFile] = useState(scenario.files[0]?.filename ?? '');
  const [focusLine, setFocusLine] = useState<number | null>(
    scenario.findings.find((f) => f.file === scenario.files[0]?.filename)?.line ?? null,
  );
  const [wrap, setWrap] = useState(false);
  const [showFiles, setShowFiles] = useState(true);
  const [showFindings, setShowFindings] = useState(true);
  /** Demo-only: let visitors flip the option after the run to see both outcomes. */
  const [commentsEnabled, setCommentsEnabled] = useState(postComments);

  const postedComments = useMemo<PostedComment[]>(
    () =>
      scenario.findings
        .filter((finding) => finding.line)
        .map((finding) => ({
          file: finding.file,
          line: finding.line,
          issue: finding.issue,
          severity: finding.severity,
          resolved: false,
        })),
    [scenario.findings],
  );

  const counts = useMemo(() => countBySeverity(scenario.findings), [scenario.findings]);
  const visible = useMemo(
    () => filterFindings(scenario.findings, filters),
    [scenario.findings, filters],
  );
  const byFile = useMemo(() => groupFindingsByFile(scenario.findings), [scenario.findings]);
  const findingCounts = useMemo(
    () => new Map([...byFile].map(([path, list]) => [path, list.length])),
    [byFile],
  );

  const file = scenario.files.find((f) => f.filename === selectedFile) ?? scenario.files[0];
  const fileFindings = useMemo(
    () => sortFindings(file ? byFile.get(file.filename) ?? [] : [], 'file'),
    [byFile, file],
  );

  const navigable = useMemo(
    () =>
      scenario.files.flatMap((f) =>
        sortFindings(byFile.get(f.filename) ?? [], 'file')
          .filter((finding) => finding.line)
          .map((finding) => ({ file: f.filename, line: finding.line! })),
      ),
    [scenario.files, byFile],
  );
  const currentIndex = navigable.findIndex(
    (item) => item.file === file?.filename && item.line === focusLine,
  );

  const selectFinding = useCallback((finding: Finding) => {
    setSelectedFile(finding.file);
    setFocusLine(finding.line ?? null);
    setTab('diff');
  }, []);

  const select = useCallback((path: string, line?: number) => {
    setSelectedFile(path);
    setFocusLine(line ?? null);
  }, []);

  const step = useCallback(
    (direction: 1 | -1) => {
      if (!navigable.length) return;
      let target: number;
      if (currentIndex !== -1) {
        target = (currentIndex + direction + navigable.length) % navigable.length;
      } else {
        const fileStart = navigable.findIndex((item) => item.file === file?.filename);
        target = fileStart !== -1 ? fileStart : direction === 1 ? 0 : navigable.length - 1;
      }
      const item = navigable[target]!;
      select(item.file, item.line);
    },
    [currentIndex, navigable, select, file?.filename],
  );

  useEffect(() => {
    if (tab !== 'diff') return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        target?.closest('input, textarea, select, [contenteditable]')
      ) {
        return;
      }
      if (event.key === 'n' || event.key === 'j') step(1);
      else if (event.key === 'p' || event.key === 'k') step(-1);
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, tab]);

  const tabs: TabItem<DemoTab>[] = [
    { id: 'findings', label: 'Findings', count: scenario.findings.length },
    { id: 'diff', label: 'Diff', count: scenario.files.length },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-700">
              <GitPullRequest className="size-3.5" />
              Open · {scenario.owner}/{scenario.repo}
            </div>
            <h1 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">
              #{scenario.pullNumber} {scenario.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{scenario.summary}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <Toggle
              checked={commentsEnabled}
              onChange={setCommentsEnabled}
              label="Post comments to GitHub"
              description="Show findings as PR review comments."
            />
          </div>
        </div>
      </header>

      <Tabs items={tabs} active={tab} onChange={setTab} />

      {tab === 'findings' ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Findings</h2>
            <p className="text-sm text-slate-500">
              {pluralize(scenario.findings.length, 'issue')} found · click one to open it in Diff
            </p>
          </div>

          {commentsEnabled ? (
            <PostedCommentsCard comments={postedComments} />
          ) : (
            <Card className="border-dashed bg-slate-50/60 p-4">
              <p className="text-sm font-medium text-slate-800">GitHub comments are off</p>
              <p className="mt-1 text-xs text-slate-500">
                Switch on <span className="font-medium">Post comments to GitHub</span> above to see how
                these findings would look as an inline review on the pull request.
              </p>
            </Card>
          )}

          <FindingsFilterBar filters={filters} counts={counts} onChange={setFilters} />

          {visible.length ? (
            <div className="space-y-3">
              {visible.map((finding, index) => (
                <FindingCard
                  key={findingKey(finding, index)}
                  finding={finding}
                  active={finding.file === selectedFile && finding.line === focusLine}
                  onSelect={() => selectFinding(finding)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={SearchX}
                title="Nothing matches"
                description="Clear a filter or search to see findings again."
              />
            </Card>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 lg:h-[min(36rem,calc(100svh-14rem))] lg:min-h-[24rem]">
          <Card className="flex flex-wrap items-center gap-2 px-2 py-1.5">
            <button
              type="button"
              className={iconButton}
              onClick={() => setShowFiles((v) => !v)}
              aria-label={showFiles ? 'Hide file tree' : 'Show file tree'}
              title={showFiles ? 'Hide file tree' : 'Show file tree'}
            >
              {showFiles ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </button>

            <code
              className="min-w-0 flex-1 truncate font-mono text-xs font-medium text-slate-800"
              title={file?.filename}
            >
              {file?.filename ?? 'No file'}
            </code>
            {file && (
              <span className="shrink-0 font-mono text-xs">
                <span className="text-emerald-600">+{file.additions}</span>{' '}
                <span className="text-red-600">−{file.deletions}</span>
              </span>
            )}

            <div className="mx-1 h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-0.5" title="Jump between findings (n / p)">
              <button
                type="button"
                className={iconButton}
                onClick={() => step(-1)}
                disabled={!navigable.length}
                aria-label="Previous finding"
              >
                <ChevronUp className="size-4" />
              </button>
              <span className="min-w-[5.5rem] text-center text-xs tabular-nums text-slate-500">
                {navigable.length
                  ? `${currentIndex === -1 ? '–' : currentIndex + 1} of ${navigable.length} findings`
                  : 'No findings'}
              </span>
              <button
                type="button"
                className={iconButton}
                onClick={() => step(1)}
                disabled={!navigable.length}
                aria-label="Next finding"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setWrap((v) => !v)}
              aria-pressed={wrap}
              title="Wrap long lines"
              className={clsx(iconButton, wrap && 'bg-brand-50 text-brand-700 hover:bg-brand-100')}
            >
              <WrapText className="size-4" />
            </button>
            <button
              type="button"
              className={iconButton}
              onClick={() => setShowFindings((v) => !v)}
              aria-label={showFindings ? 'Hide findings' : 'Show findings'}
            >
              {showFindings ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
            </button>
          </Card>

          {!file ? (
            <Card>
              <EmptyState icon={FileDiff} title="No changed files" />
            </Card>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
              {showFiles && (
                <Card className="max-h-48 shrink-0 overflow-auto p-2 lg:max-h-none lg:w-56">
                  <DiffFileTree
                    files={scenario.files}
                    selected={file.filename}
                    findingCounts={findingCounts}
                    onSelect={(path) => select(path)}
                  />
                </Card>
              )}

              <Card className="min-h-0 min-w-0 flex-1 overflow-hidden p-0">
                <DiffViewer
                  file={file}
                  findings={fileFindings}
                  focusLine={focusLine}
                  onSelectLine={(line) => setFocusLine(line)}
                  wrap={wrap}
                  className="h-full max-h-[22rem] lg:max-h-none"
                />
              </Card>

              {showFindings && (
                <Card className="flex max-h-64 shrink-0 flex-col gap-2 overflow-auto p-3 lg:max-h-none lg:w-72">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Issues in this file
                  </p>
                  {fileFindings.length ? (
                    fileFindings.map((finding, index) => (
                      <FindingCard
                        key={findingKey(finding, index)}
                        finding={finding}
                        compact
                        active={finding.line === focusLine}
                        onSelect={() => select(finding.file, finding.line)}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No issues flagged in this file.</p>
                  )}
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
