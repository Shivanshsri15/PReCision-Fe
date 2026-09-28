import clsx from 'clsx';
import { GitCompareArrows } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchRun } from '../../features/reviews/reviewsThunks';
import { selectIsRunFull, selectRunFindings } from '../../features/reviews/selectors';
import type { Finding, ReviewRun } from '../../types/review';
import { findingKey } from '../../utils/findings';
import { shortDate, shortSha } from '../../utils/format';
import { compareRuns } from '../../utils/runCompare';
import { Button } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import { Label, Select } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { FindingCard } from './FindingCard';

interface RunCompareProps {
  /** Completed runs, newest first. */
  runs: ReviewRun[];
}

const runLabel = (run: ReviewRun) =>
  `${run.repo} #${run.pullNumber} · ${shortSha(run.headSha)} (${shortDate(run.createdAt)})`;

const samePr = (a: ReviewRun, b: ReviewRun) =>
  a.owner === b.owner && a.repo === b.repo && a.pullNumber === b.pullNumber;

type Bucket = 'newFindings' | 'resolved' | 'unchanged';

const BUCKETS: Array<{ id: Bucket; label: string; className: string }> = [
  { id: 'newFindings', label: 'New findings', className: 'border-red-200 bg-red-50 text-red-600' },
  { id: 'resolved', label: 'Resolved', className: 'border-emerald-200 bg-emerald-50 text-emerald-600' },
  { id: 'unchanged', label: 'Unchanged', className: 'border-slate-200 bg-slate-50 text-slate-700' },
];

export function RunCompare({ runs }: RunCompareProps) {
  const dispatch = useAppDispatch();
  const [firstId, setFirstId] = useState(
    () => (runs.find((run) => runs.some((other) => other._id !== run._id && samePr(run, other))) ?? runs[0])?._id ?? '',
  );
  const first = runs.find((run) => run._id === firstId) ?? runs[0];
  const candidates = useMemo(() => (first ? runs.filter((run) => run._id !== first._id && samePr(run, first)) : []), [runs, first]);
  const [secondId, setSecondId] = useState('');
  const second = candidates.find((run) => run._id === secondId) ?? candidates[0];

  const [compared, setCompared] = useState<{ baseId: string; targetId: string } | null>(null);
  const [bucket, setBucket] = useState<Bucket>('newFindings');

  const baseFull = useAppSelector((state) => selectIsRunFull(state, compared?.baseId));
  const targetFull = useAppSelector((state) => selectIsRunFull(state, compared?.targetId));
  const baseFindings = useAppSelector((state) => selectRunFindings(state, compared?.baseId));
  const targetFindings = useAppSelector((state) => selectRunFindings(state, compared?.targetId));
  const ready = Boolean(compared && baseFull && targetFull);
  const result = useMemo(() => (ready ? compareRuns(baseFindings, targetFindings) : null), [ready, baseFindings, targetFindings]);

  const compare = () => {
    if (!first || !second) return;
    const [base, target] = new Date(first.createdAt) < new Date(second.createdAt) ? [first, second] : [second, first];
    void dispatch(fetchRun(base._id));
    void dispatch(fetchRun(target._id));
    setCompared({ baseId: base._id, targetId: target._id });
  };

  if (runs.length < 2) {
    return (
      <Card className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <GitCompareArrows className="size-4 text-brand-600" /> Compare Runs
        </h3>
        <p className="mt-1 text-sm text-slate-500">Analyze the same pull request at least twice to compare runs.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Compare Runs" subtitle="What changed between two analyses of the same pull request" />
      <div className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="compare-first">Run 1</Label>
          <Select
            id="compare-first"
            value={first?._id}
            onChange={(event) => {
              setFirstId(event.target.value);
              setSecondId('');
              setCompared(null);
            }}
          >
            {runs.map((run) => (
              <option key={run._id} value={run._id}>
                {runLabel(run)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="compare-second">Run 2</Label>
          <Select
            id="compare-second"
            value={second?._id ?? ''}
            disabled={!candidates.length}
            onChange={(event) => {
              setSecondId(event.target.value);
              setCompared(null);
            }}
          >
            {!candidates.length && <option value="">No other run for this PR</option>}
            {candidates.map((run) => (
              <option key={run._id} value={run._id}>
                {runLabel(run)}
              </option>
            ))}
          </Select>
        </div>
        <Button icon={GitCompareArrows} onClick={compare} disabled={!second}>
          Compare
        </Button>
      </div>

      {compared && !result && (
        <div className="flex justify-center pb-6">
          <Spinner className="text-brand-600" />
        </div>
      )}

      {result && (
        <div className="border-t border-slate-100 p-5">
          <p className="mb-3 text-xs font-medium text-slate-500">Comparison result (older → newer)</p>
          <div className="grid grid-cols-3 gap-3">
            {BUCKETS.map(({ id, label, className }) => (
              <button
                key={id}
                type="button"
                onClick={() => setBucket(id)}
                className={clsx('rounded-xl border px-4 py-3 text-center transition', className, bucket === id ? 'ring-2 ring-brand-500/40' : 'opacity-80 hover:opacity-100')}
              >
                <p className="text-xs font-medium">{label}</p>
                <p className="text-2xl font-bold">{result[id].length}</p>
              </button>
            ))}
          </div>
          <FindingList findings={result[bucket]} />
        </div>
      )}
    </Card>
  );
}

function FindingList({ findings }: { findings: Finding[] }) {
  if (!findings.length) return <p className="mt-4 text-center text-sm text-slate-500">Nothing in this group.</p>;
  return (
    <div className="mt-4 space-y-2">
      {findings.map((finding, index) => (
        <FindingCard key={findingKey(finding, index)} finding={finding} compact />
      ))}
    </div>
  );
}
