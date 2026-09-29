import clsx from 'clsx';
import { AlertCircle, CheckCircle2, FileCode2, Info, Loader2, MinusCircle, Trash2, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectIndexJob } from '../../features/events/indexJobsSlice';
import { indexProgressClosed, selectIndexProgressKey } from '../../features/ui/uiSlice';
import { useNow } from '../../hooks/useNow';
import type { IndexedFileStatus } from '../../types/events';
import { formatDuration } from '../../utils/format';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

const FILE_STATUS: Record<IndexedFileStatus, { icon: typeof CheckCircle2; className: string; label: string }> = {
  indexed: { icon: CheckCircle2, className: 'text-emerald-500', label: 'Indexed' },
  skipped: { icon: MinusCircle, className: 'text-slate-400', label: 'Skipped' },
  failed: { icon: XCircle, className: 'text-red-500', label: 'Failed' },
  removed: { icon: Trash2, className: 'text-amber-500', label: 'Removed' },
};

/** Global live view of one branch's indexing job; closing it never stops the job. */
export function IndexProgressModal() {
  const dispatch = useAppDispatch();
  const key = useAppSelector(selectIndexProgressKey);
  const job = useAppSelector((state) => selectIndexJob(state, key));
  const record = useAppSelector((state) => (key ? state.repositories.indexRecords[key] : undefined));
  const listRef = useRef<HTMLUListElement>(null);

  const running = job ? job.status === 'running' : record?.status === 'indexing';
  const now = useNow(Boolean(key) && running, 1000);
  const fileCount = job?.files.length ?? 0;

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fileCount]);

  if (!key) return null;
  const close = () => dispatch(indexProgressClosed());

  const total = job?.total ?? 0;
  const processed = job?.processed ?? 0;
  const percent = total ? Math.min(100, Math.round((processed / total) * 100)) : 0;
  const elapsed = job ? now - Date.parse(job.startedAt) : 0;
  const files = job ? [...job.files].reverse() : [];
  const counts = (job?.files ?? []).reduce<Record<string, number>>((acc, file) => {
    acc[file.status] = (acc[file.status] ?? 0) + 1;
    return acc;
  }, {});
  const isSync = job?.kind === 'incremental';

  return (
    <Modal
      open
      onClose={close}
      title={isSync ? 'Syncing pushed changes' : 'Indexing repository'}
      description={key}
      footer={
        <Button variant={running ? 'secondary' : 'primary'} onClick={close}>
          {running ? 'Continue in background' : 'Done'}
        </Button>
      }
    >
      <div className="space-y-4">
        {running && (
          <p className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {isSync
              ? 'Only the files changed by the push are re-embedded.'
              : 'This is a one-time setup and can take a few minutes depending on the repository size.'}{' '}
            Feel free to close this and keep working; you'll get a notification when it's done.
          </p>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              {running ? (
                <Loader2 className="size-3.5 animate-spin text-brand-600" />
              ) : job?.status === 'failed' || record?.status === 'failed' ? (
                <AlertCircle className="size-3.5 text-red-500" />
              ) : (
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              )}
              {running
                ? total
                  ? `${processed} of ${total} files`
                  : 'Scanning the repository tree…'
                : job?.status === 'failed' || record?.status === 'failed'
                  ? 'Indexing failed'
                  : 'Indexing complete'}
            </span>
            <span className="tabular-nums text-slate-500">
              {job && formatDuration(elapsed)}
              {total > 0 && ` · ${percent}%`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={clsx(
                'h-full rounded-full transition-[width] duration-500',
                job?.status === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-brand-500 to-brand-700',
                running && !total && 'w-1/3 animate-pulse',
              )}
              style={total || !running ? { width: `${running ? percent : 100}%` } : undefined}
            />
          </div>
        </div>

        {(job?.error || (!job && record?.lastError)) && (
          <p className="flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="mt-px size-3.5 shrink-0" />
            <span className="line-clamp-4 min-w-0 [overflow-wrap:anywhere]">{job?.error ?? record?.lastError}</span>
          </p>
        )}

        {job?.status === 'completed' && (
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-xs">
            <div>
              <p className="text-slate-500">Files indexed</p>
              <p className="font-semibold text-slate-900">{job.fileCount ?? counts.indexed ?? 0}</p>
            </div>
            <div>
              <p className="text-slate-500">Chunks stored</p>
              <p className="font-semibold text-slate-900">{job.chunkCount ?? 0}</p>
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Files</p>
            <div className="flex gap-3 text-[11px] text-slate-500">
              {(Object.keys(FILE_STATUS) as IndexedFileStatus[])
                .filter((status) => counts[status])
                .map((status) => (
                  <span key={status} className="inline-flex items-center gap-1">
                    <span className={clsx('size-1.5 rounded-full bg-current', FILE_STATUS[status].className)} />
                    {counts[status]} {FILE_STATUS[status].label.toLowerCase()}
                  </span>
                ))}
            </div>
          </div>
          {files.length ? (
            <ul ref={listRef} className="max-h-64 space-y-0.5 overflow-y-auto rounded-lg border border-slate-200 p-1.5">
              {files.map((file, index) => {
                const meta = FILE_STATUS[file.status];
                const Icon = meta.icon;
                return (
                  <li
                    key={`${file.path}-${files.length - index}`}
                    className={clsx(
                      'flex items-center gap-2 rounded-md px-2 py-1 text-xs',
                      index === 0 && running && 'animate-toast-in bg-brand-50/60',
                    )}
                  >
                    <Icon className={clsx('size-3.5 shrink-0', meta.className)} aria-label={meta.label} />
                    <span className="min-w-0 flex-1 truncate font-mono text-slate-700" title={file.path}>
                      {file.path}
                    </span>
                    {file.chunks !== undefined && (
                      <span className="shrink-0 tabular-nums text-slate-400">{file.chunks} chunks</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center">
              <FileCode2 className="size-5 text-slate-300" />
              <p className="mt-2 text-xs text-slate-500">
                {running ? 'Files appear here as they are embedded.' : 'No file activity was recorded in this session.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
