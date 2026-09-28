import type { Finding, RunComparison } from '../types/review';

/**
 * Line numbers shift between commits, so findings are matched on file plus a
 * normalized issue text rather than on exact location.
 */
const matchKey = (finding: Finding) =>
  `${finding.file}::${finding.issue.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}`;

/** Compares an older (`base`) run's findings with a newer (`target`) run's. */
export function compareRuns(base: Finding[], target: Finding[]): RunComparison {
  const baseKeys = new Set(base.map(matchKey));
  const targetKeys = new Set(target.map(matchKey));

  return {
    newFindings: target.filter((finding) => !baseKeys.has(matchKey(finding))),
    resolved: base.filter((finding) => !targetKeys.has(matchKey(finding))),
    unchanged: target.filter((finding) => baseKeys.has(matchKey(finding))),
  };
}
