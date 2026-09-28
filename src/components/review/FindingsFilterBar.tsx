import type { DomainKey, Severity } from '../../types/review';
import { DOMAIN_META, DOMAIN_ORDER } from '../../utils/domains';
import type { FindingFilters, FindingSort } from '../../utils/findings';
import { SEVERITY_META, SEVERITIES } from '../../utils/severity';
import { SearchInput, Select } from '../ui/Input';
import { Tabs, type TabItem } from '../ui/Tabs';

interface FindingsFilterBarProps {
  filters: FindingFilters;
  counts: Record<Severity | 'all', number>;
  onChange: (filters: FindingFilters) => void;
}

const SORT_OPTIONS: Array<{ value: FindingSort; label: string }> = [
  { value: 'severity', label: 'Sort by: Severity' },
  { value: 'file', label: 'Sort by: File' },
  { value: 'domain', label: 'Sort by: Domain' },
];

export function FindingsFilterBar({ filters, counts, onChange }: FindingsFilterBarProps) {
  const update = (patch: Partial<FindingFilters>) => onChange({ ...filters, ...patch });

  const severityTabs: TabItem<Severity | 'all'>[] = [
    { id: 'all', label: 'All', count: counts.all },
    ...SEVERITIES.map((severity) => ({
      id: severity,
      label: (
        <span className="inline-flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${SEVERITY_META[severity].dot}`} />
          {SEVERITY_META[severity].label}
        </span>
      ),
      count: counts[severity],
    })),
  ];

  return (
    <div className="space-y-3">
      <Tabs items={severityTabs} active={filters.severity} onChange={(severity) => update({ severity })} />
      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={filters.query}
          onChange={(query) => update({ query })}
          placeholder="Search findings, files, suggestions…"
          className="w-full sm:w-80"
        />
        <Select value={filters.domain} onChange={(event) => update({ domain: event.target.value as DomainKey | 'all' })} className="w-auto">
          <option value="all">All domains</option>
          {DOMAIN_ORDER.map((domain) => (
            <option key={domain} value={domain}>
              {DOMAIN_META[domain].label}
            </option>
          ))}
        </Select>
        <Select value={filters.sort} onChange={(event) => update({ sort: event.target.value as FindingSort })} className="w-auto sm:ml-auto">
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
