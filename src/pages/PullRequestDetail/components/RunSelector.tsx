import { Select } from '../../../components/ui/Input';
import type { ReviewRun } from '../../../types/review';
import { RUN_STATUS_META } from '../../../utils/status';
import { relativeTime, shortSha } from '../../../utils/format';

interface RunSelectorProps {
  runs: ReviewRun[];
  value: string | undefined;
  onChange: (runId: string) => void;
}

export function RunSelector({ runs, value, onChange }: RunSelectorProps) {
  if (!runs.length) return null;

  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      Run
      <Select value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-auto text-xs">
        {runs.map((run, index) => (
          <option key={run._id} value={run._id}>
            {index === 0 ? 'Latest · ' : ''}
            {shortSha(run.headSha)} · {relativeTime(run.createdAt)} · {RUN_STATUS_META[run.status].label}
          </option>
        ))}
      </Select>
    </label>
  );
}
