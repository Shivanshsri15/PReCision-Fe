import type { FinalReport, Severity, SeverityCounts } from '../types/review';

export const SEVERITIES: Severity[] = ['high', 'medium', 'low'];

export const SEVERITY_RANK: Record<Severity, number> = { high: 3, medium: 2, low: 1 };

export const SEVERITY_META: Record<Severity, { label: string; badge: string; panel: string; dot: string; text: string }> = {
  high: {
    label: 'High',
    badge: 'bg-red-50 text-red-700 ring-red-200',
    panel: 'border-red-200 bg-red-50/60',
    dot: 'bg-red-500',
    text: 'text-red-600',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    panel: 'border-amber-200 bg-amber-50/60',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
  },
  low: {
    label: 'Low',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
    panel: 'border-blue-200 bg-blue-50/60',
    dot: 'bg-blue-500',
    text: 'text-blue-600',
  },
};

export const emptySeverityCounts = (): SeverityCounts => ({ high: 0, medium: 0, low: 0 });

export const totalFindings = (counts?: SeverityCounts) =>
  counts ? counts.high + counts.medium + counts.low : 0;

/**
 * Overall assessment on a 1–5 scale: the mean of the domain ratings when the
 * reviewers produced them, otherwise a severity-weighted penalty from 5.
 */
export function computeOverallScore(report?: Partial<FinalReport>): number | null {
  if (!report) return null;
  const ratings = Object.values(report.domainReports ?? {})
    .map((domain) => domain?.rating)
    .filter((rating): rating is NonNullable<typeof rating> => typeof rating === 'number');
  if (ratings.length) {
    return Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10;
  }
  const counts = report.counts?.severity;
  if (!counts) return null;
  const penalty = counts.high * 0.8 + counts.medium * 0.4 + counts.low * 0.1;
  return Math.round(Math.max(1, 5 - penalty) * 10) / 10;
}

export function scoreTone(score: number): { stroke: string; text: string; label: string } {
  if (score >= 4) return { stroke: 'stroke-emerald-500', text: 'text-emerald-600', label: 'Healthy' };
  if (score >= 3) return { stroke: 'stroke-amber-500', text: 'text-amber-600', label: 'Needs attention' };
  return { stroke: 'stroke-red-500', text: 'text-red-600', label: 'At risk' };
}
