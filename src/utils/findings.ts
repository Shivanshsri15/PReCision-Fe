import type { DomainKey, FinalReport, Finding, Severity } from '../types/review';
import { DOMAIN_ORDER } from './domains';
import { SEVERITY_RANK } from './severity';

export type FindingSort = 'severity' | 'file' | 'domain';

export interface FindingFilters {
  severity: Severity | 'all';
  domain: DomainKey | 'all';
  query: string;
  sort: FindingSort;
}

export const DEFAULT_FINDING_FILTERS: FindingFilters = {
  severity: 'all',
  domain: 'all',
  query: '',
  sort: 'severity',
};

/**
 * Findings of a report with their domain attached. Older runs stored findings
 * without `domain`, so fall back to the per-domain reports.
 */
export function getReportFindings(report?: Partial<FinalReport>): Finding[] {
  if (!report) return [];
  const findings = report.findings ?? [];
  if (findings.every((finding) => finding.domain)) return findings;

  const fromDomains = DOMAIN_ORDER.flatMap((domain) =>
    (report.domainReports?.[domain]?.findings ?? []).map((finding) => ({ ...finding, domain })),
  );
  return fromDomains.length ? fromDomains : findings;
}

export function filterFindings(findings: Finding[], filters: FindingFilters): Finding[] {
  const query = filters.query.trim().toLowerCase();
  const filtered = findings.filter(
    (finding) =>
      (filters.severity === 'all' || finding.severity === filters.severity) &&
      (filters.domain === 'all' || finding.domain === filters.domain) &&
      (!query ||
        [finding.issue, finding.file, finding.suggestion ?? ''].some((text) =>
          text.toLowerCase().includes(query),
        )),
  );
  return sortFindings(filtered, filters.sort);
}

export function sortFindings(findings: Finding[], sort: FindingSort): Finding[] {
  const bySeverity = (a: Finding, b: Finding) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
  const byLocation = (a: Finding, b: Finding) =>
    a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0);
  const byDomain = (a: Finding, b: Finding) =>
    DOMAIN_ORDER.indexOf(a.domain ?? 'quality') - DOMAIN_ORDER.indexOf(b.domain ?? 'quality');

  const comparators: Record<FindingSort, Array<(a: Finding, b: Finding) => number>> = {
    severity: [bySeverity, byLocation],
    file: [byLocation, bySeverity],
    domain: [byDomain, bySeverity, byLocation],
  };
  return [...findings].sort((a, b) => {
    for (const compare of comparators[sort]) {
      const result = compare(a, b);
      if (result) return result;
    }
    return 0;
  });
}

export function countBySeverity(findings: Finding[]): Record<Severity | 'all', number> {
  return findings.reduce(
    (acc, finding) => {
      acc[finding.severity] += 1;
      acc.all += 1;
      return acc;
    },
    { all: 0, high: 0, medium: 0, low: 0 },
  );
}

export function groupFindingsByFile(findings: Finding[]): Map<string, Finding[]> {
  const groups = new Map<string, Finding[]>();
  for (const finding of findings) {
    groups.set(finding.file, [...(groups.get(finding.file) ?? []), finding]);
  }
  return groups;
}

export const findingLocation = (finding: Finding) =>
  finding.line ? `${finding.file}:${finding.line}` : finding.file;

export const findingKey = (finding: Finding, index: number) =>
  `${finding.domain ?? 'x'}:${finding.file}:${finding.line ?? 0}:${index}`;
