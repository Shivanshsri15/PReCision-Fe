import { AlertTriangle, FileDiff, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo } from 'react';
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
import { findingKey, groupFindingsByFile, sortFindings } from '../../../utils/findings';
import { usePrDetail } from '../context';

export function DiffTab() {
  const { owner, repo, number, prKey, run } = usePrDetail();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const files = useAppSelector((state) => selectPullFiles(state, prKey));
  const findings = useAppSelector((state) => selectRunFindings(state, run?.status === 'completed' ? run._id : null));
  const byFile = useMemo(() => groupFindingsByFile(findings), [findings]);
  const findingCounts = useMemo(() => new Map([...byFile].map(([file, list]) => [file, list.length])), [byFile]);

  useEffect(() => {
    if (files.status === 'idle') void dispatch(fetchPullFiles({ owner, repo, number }));
  }, [dispatch, files.status, owner, repo, number]);

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

  const select = (file: string, line?: number) =>
    setSearchParams((current) => {
      current.set('file', file);
      if (line) current.set('line', String(line));
      else current.delete('line');
      return current;
    }, { replace: true });

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

  return (
    <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
      <Card className="self-start p-2 xl:sticky xl:top-20">
        <p className="px-2 pb-2 pt-1 text-xs font-semibold text-slate-500">Files ({files.items.length})</p>
        <DiffFileTree files={files.items} selected={selectedFile.filename} findingCounts={findingCounts} onSelect={(path) => select(path)} />
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
          <code className="truncate font-mono text-xs font-medium text-slate-800">{selectedFile.filename}</code>
          <span className="shrink-0 font-mono text-xs">
            <span className="text-emerald-600">+{selectedFile.additions}</span>{' '}
            <span className="text-red-600">−{selectedFile.deletions}</span>
          </span>
        </div>
        <DiffViewer
          file={selectedFile}
          findings={fileFindings}
          focusLine={focusLine}
          onSelectLine={(line) => select(selectedFile.filename, line)}
        />
      </Card>

      <Card className="self-start p-4 xl:sticky xl:top-20">
        <p className="mb-3 text-xs font-semibold text-slate-500">Findings ({fileFindings.length})</p>
        {fileFindings.length ? (
          <div className="max-h-[70vh] space-y-2 overflow-y-auto">
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
          <EmptyState
            className="py-6"
            icon={ShieldCheck}
            title={run ? 'No findings in this file' : 'Not analyzed yet'}
          />
        )}
      </Card>
    </div>
  );
}
