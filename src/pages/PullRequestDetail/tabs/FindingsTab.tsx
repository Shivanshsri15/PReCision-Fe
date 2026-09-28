import { SearchX, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { FindingCard } from '../../../components/review/FindingCard';
import { FindingsFilterBar } from '../../../components/review/FindingsFilterBar';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { selectFilteredRunFindings, selectRunFindings } from '../../../features/reviews/selectors';
import { countBySeverity, DEFAULT_FINDING_FILTERS, findingKey } from '../../../utils/findings';
import { pluralize } from '../../../utils/format';
import { RunStateGate } from '../components/RunStateGate';
import { usePrDetail } from '../context';

export function FindingsTab() {
  return <RunStateGate>{(run) => <FindingsContent runId={run._id} />}</RunStateGate>;
}

function FindingsContent({ runId }: { runId: string }) {
  const { diffHref } = usePrDetail();
  const [filters, setFilters] = useState(DEFAULT_FINDING_FILTERS);
  const all = useAppSelector((state) => selectRunFindings(state, runId));
  const visible = useAppSelector((state) => selectFilteredRunFindings(state, runId, filters));
  const counts = useMemo(() => countBySeverity(all), [all]);

  if (!all.length) {
    return (
      <Card>
        <EmptyState icon={ShieldCheck} title="No findings" description="The reviewers did not report any issues on the changed lines." />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Findings</h2>
        <p className="text-sm text-slate-500">{pluralize(all.length, 'total finding')}</p>
      </div>

      <FindingsFilterBar filters={filters} counts={counts} onChange={setFilters} />

      {visible.length ? (
        <div className="space-y-3">
          {visible.map((finding, index) => (
            <FindingCard key={findingKey(finding, index)} finding={finding} diffHref={diffHref(finding)} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={SearchX} title="No findings match these filters" />
        </Card>
      )}
    </div>
  );
}
