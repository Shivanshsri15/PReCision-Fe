import clsx from 'clsx';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileDiff,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ShieldCheck,
  WrapText,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { DiffFileTree } from '../../../components/review/DiffFileTree';
import { DiffViewer } from '../../../components/review/DiffViewer';
import { FindingCard } from '../../../components/review/FindingCard';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SkeletonRows } from '../../../components/ui/Skeleton';
import { fetchPullFiles } from '../../../features/pullRequests/pullRequestsThunks';
import { selectPullFiles } from '../../../features/pullRequests/selectors';
import { selectRunFindings } from '../../../features/reviews/selectors';
import { useResizableWidth } from '../../../hooks/useResizableWidth';
import { findingKey, groupFindingsByFile, sortFindings } from '../../../utils/findings';
import { usePrDetail } from '../context';

const PREFS_KEY = 'precision.diff.prefs';

interface DiffPrefs {
  wrap: boolean;
  showFiles: boolean;
  showFindings: boolean;
}

function readPrefs(): DiffPrefs {
  try {
    return { wrap: false, showFiles: true, showFindings: true, ...JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? '{}') };
  } catch {
    return { wrap: false, showFiles: true, showFindings: true };
  }
}

function ResizeHandle({ onPointerDown, onDoubleClick, active }: { onPointerDown: (event: PointerEvent<HTMLElement>) => void; onDoubleClick: () => void; active: boolean }) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      title="Drag to resize · double-click to reset"
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      className="group hidden w-3 shrink-0 cursor-col-resize items-center justify-center lg:flex"
    >
      <span className={clsx('h-10 w-1 rounded-full transition-colors', active ? 'bg-brand-500' : 'bg-slate-200 group-hover:bg-brand-400')} />
    </div>
  );
}

const iconButton =
  'inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40';

export function DiffTab() {
  const { owner, repo, number, prKey, run } = usePrDetail();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [prefs, setPrefs] = useState(readPrefs);
  const panelRef = useRef<HTMLDivElement>(null);

  const filesPanel = useResizableWidth({ storageKey: 'precision.diff.files', initial: 250, min: 180, max: 460 });
  const findingsPanel = useResizableWidth({ storageKey: 'precision.diff.findings', initial: 320, min: 240, max: 560, edge: 'left' });

  const files = useAppSelector((state) => selectPullFiles(state, prKey));
  const findings = useAppSelector((state) => selectRunFindings(state, run?.status === 'completed' ? run._id : null));
  const byFile = useMemo(() => groupFindingsByFile(findings), [findings]);
  const findingCounts = useMemo(() => new Map([...byFile].map(([file, list]) => [file, list.length])), [byFile]);

  useEffect(() => {
    if (files.status === 'idle') void dispatch(fetchPullFiles({ owner, repo, number }));
  }, [dispatch, files.status, owner, repo, number]);

  useEffect(() => {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const requestedFile = searchParams.get('file');
  const selectedFile =
    files.items.find((file) => file.filename === requestedFile) ??
    files.items.find((file) => byFile.has(file.filename)) ??
    files.items[0];
  const focusLine = Number(searchParams.get('line')) || null;
  const fileFindings = useMemo(
    () => sortFindings(selectedFile ? byFile.get(selectedFile.filename) ?? [] : [], 'file'),
    [byFile, selectedFile],
  );

  /** Every finding pinned to a diff line, in file-tree order, for previous/next navigation. */
  const navigable = useMemo(
    () =>
      files.items.flatMap((file) =>
        sortFindings(byFile.get(file.filename) ?? [], 'file')
          .filter((finding) => finding.line)
          .map((finding) => ({ file: file.filename, line: finding.line! })),
      ),
    [files.items, byFile],
  );
  const currentIndex = navigable.findIndex((item) => item.file === selectedFile?.filename && item.line === focusLine);

  const select = useCallback(
    (file: string, line?: number) =>
      setSearchParams(
        (current) => {
          current.set('file', file);
          if (line) current.set('line', String(line));
          else current.delete('line');
          return current;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      if (!navigable.length) return;
      let target: number;
      if (currentIndex !== -1) {
        target = (currentIndex + direction + navigable.length) % navigable.length;
      } else {
        const fileStart = navigable.findIndex((item) => item.file === selectedFile?.filename);
        target = fileStart !== -1 ? fileStart : direction === 1 ? 0 : navigable.length - 1;
      }
      const item = navigable[target];
      select(item.file, item.line);
    },
    [currentIndex, navigable, select, selectedFile?.filename],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.metaKey || event.ctrlKey || event.altKey || target?.closest('input, textarea, select, [contenteditable]')) return;
      if (event.key === 'n' || event.key === 'j') step(1);
      else if (event.key === 'p' || event.key === 'k') step(-1);
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  /** Bring the whole diff workspace into view when jumping to a line. */
  useEffect(() => {
    if (!focusLine || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [focusLine, selectedFile?.filename]);

  if (files.status === 'loading' && !files.items.length) {
    return (
      <Card>
        <SkeletonRows rows={8} />
      </Card>
    );
  }

  if (files.status === 'failed') {
    return (
      <Card>
        <EmptyState
          tone="error"
          icon={AlertTriangle}
          title="Could not load the diff"
          description={files.error?.message}
          action={<Button onClick={() => void dispatch(fetchPullFiles({ owner, repo, number }))}>Try again</Button>}
        />
      </Card>
    );
  }

  if (!selectedFile) {
    return (
      <Card>
        <EmptyState icon={FileDiff} title="No changed files" />
      </Card>
    );
  }

  const toggle = (key: keyof DiffPrefs) => setPrefs((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div ref={panelRef} className="scroll-mb-4 flex flex-col gap-3 lg:h-[calc(100vh-6.5rem)] lg:min-h-[30rem]">
      <Card className="flex flex-wrap items-center gap-2 px-2 py-1.5">
        <button
          type="button"
          className={iconButton}
          onClick={() => toggle('showFiles')}
          aria-label={prefs.showFiles ? 'Hide file tree' : 'Show file tree'}
          title={prefs.showFiles ? 'Hide file tree' : 'Show file tree'}
        >
          {prefs.showFiles ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
        </button>

        <code className="min-w-0 flex-1 truncate font-mono text-xs font-medium text-slate-800" title={selectedFile.filename}>
          {selectedFile.filename}
        </code>
        <span className="shrink-0 font-mono text-xs">
          <span className="text-emerald-600">+{selectedFile.additions}</span>{' '}
          <span className="text-red-600">−{selectedFile.deletions}</span>
        </span>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        <div className="flex items-center gap-0.5" title="Jump between findings (n / p)">
          <button type="button" className={iconButton} onClick={() => step(-1)} disabled={!navigable.length} aria-label="Previous finding">
            <ChevronUp className="size-4" />
          </button>
          <span className="min-w-[5.5rem] text-center text-xs tabular-nums text-slate-500">
            {navigable.length
              ? `${currentIndex === -1 ? '–' : currentIndex + 1} of ${navigable.length} findings`
              : 'No findings'}
          </span>
          <button type="button" className={iconButton} onClick={() => step(1)} disabled={!navigable.length} aria-label="Next finding">
            <ChevronDown className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => toggle('wrap')}
          aria-pressed={prefs.wrap}
          title="Wrap long lines"
          className={clsx(iconButton, prefs.wrap && 'bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-800')}
        >
          <WrapText className="size-4" />
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={() => toggle('showFindings')}
          aria-label={prefs.showFindings ? 'Hide findings' : 'Show findings'}
          title={prefs.showFindings ? 'Hide findings' : 'Show findings'}
        >
          {prefs.showFindings ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
        </button>
      </Card>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-0">
        {prefs.showFiles && (
          <>
            <Card
              className="flex max-h-72 shrink-0 flex-col overflow-hidden lg:max-h-none lg:w-[var(--panel-w)]"
              style={{ '--panel-w': `${filesPanel.width}px` } as CSSProperties}
            >
              <p className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">Files ({files.items.length})</p>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                <DiffFileTree files={files.items} selected={selectedFile.filename} findingCounts={findingCounts} onSelect={(path) => select(path)} />
              </div>
            </Card>
            <ResizeHandle onPointerDown={filesPanel.onPointerDown} onDoubleClick={filesPanel.reset} active={filesPanel.dragging} />
          </>
        )}

        <Card className="flex min-h-[24rem] min-w-0 flex-1 flex-col overflow-hidden lg:min-h-0">
          <DiffViewer
            file={selectedFile}
            findings={fileFindings}
            focusLine={focusLine}
            wrap={prefs.wrap}
            onSelectLine={(line) => select(selectedFile.filename, line)}
            className="max-h-[70vh] min-h-0 flex-1 lg:max-h-none"
          />
        </Card>

        {prefs.showFindings && (
          <>
            <ResizeHandle onPointerDown={findingsPanel.onPointerDown} onDoubleClick={findingsPanel.reset} active={findingsPanel.dragging} />
            <Card
              className="flex shrink-0 flex-col overflow-hidden lg:w-[var(--panel-w)]"
              style={{ '--panel-w': `${findingsPanel.width}px` } as CSSProperties}
            >
              <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">Findings in this file ({fileFindings.length})</p>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {fileFindings.length ? (
                  <div className="space-y-2">
                    {fileFindings.map((finding, index) => (
                      <FindingCard
                        key={findingKey(finding, index)}
                        finding={finding}
                        compact
                        active={finding.line === focusLine}
                        onSelect={() => select(selectedFile.filename, finding.line)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState className="py-6" icon={ShieldCheck} title={run ? 'No findings in this file' : 'Not analyzed yet'} />
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
