import { FileCode2, MessageSquareText, Network } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardHeader } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import type { ReviewRun } from '../../../types/review';
import { formatDuration, pluralize, shortDate, shortSha } from '../../../utils/format';
import { RunStateGate } from '../components/RunStateGate';

export function ContextTab() {
  return <RunStateGate>{(run) => <ContextContent run={run} />}</RunStateGate>;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{children}</dd>
    </div>
  );
}

function ContextContent({ run }: { run: ReviewRun }) {
  const report = run.finalReport;
  const paths = report?.relatedContextPaths ?? [];
  const total = report?.relatedContextCount ?? paths.length;
  const blobUrl = (path: string) =>
    `https://github.com/${run.owner}/${run.repo}/blob/${encodeURIComponent(run.baseBranch)}/${path}`;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader
          title="Retrieved codebase context"
          subtitle={`${pluralize(total, 'chunk')} from the indexed ${run.baseBranch} branch informed this review`}
        />
        {paths.length ? (
          <ul className="divide-y divide-slate-100 p-2">
            {paths.map((path, index) => (
              <li key={`${path}-${index}`}>
                <a
                  href={blobUrl(path)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-700"
                >
                  <FileCode2 className="size-3.5 shrink-0 text-slate-400" />
                  {path}
                </a>
              </li>
            ))}
            {total > paths.length && (
              <li className="px-3 py-2 text-xs text-slate-500">+ {total - paths.length} more chunks</li>
            )}
          </ul>
        ) : (
          <EmptyState icon={Network} title="No related context was retrieved" description="The reviewers relied on the diff and base files only." />
        )}
      </Card>

      <div className="space-y-6">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Run details</h3>
          <dl className="grid grid-cols-2 gap-4">
            <Detail label="Base branch">{run.baseBranch}</Detail>
            <Detail label="Head commit">
              <code className="font-mono text-xs">{shortSha(run.headSha)}</code>
            </Detail>
            <Detail label="Started">{shortDate(run.createdAt)}</Detail>
            <Detail label="Duration">
              {formatDuration(new Date(run.updatedAt).getTime() - new Date(run.createdAt).getTime())}
            </Detail>
          </dl>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MessageSquareText className="size-4 text-brand-600" /> Prompt additions
          </h3>
          <p className="text-xs font-medium text-slate-500">Extra prompt</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{report?.extraPromptApplied || 'None'}</p>
          <p className="mt-4 text-xs font-medium text-slate-500">Bug detection addendum</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{report?.bugDetectionPromptAddendum || 'None'}</p>
        </Card>
      </div>
    </div>
  );
}
