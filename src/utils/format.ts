import { format, formatDistanceToNowStrict } from 'date-fns';

export function relativeTime(value?: string | number | Date | null): string {
  if (!value) return '—';
  return `${formatDistanceToNowStrict(new Date(value))} ago`;
}

export function shortDate(value?: string | Date | null): string {
  if (!value) return '—';
  return format(new Date(value), 'MMM d, yyyy HH:mm');
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export const shortSha = (sha?: string) => (sha ? sha.slice(0, 7) : '—');

export const pluralize = (count: number, word: string, plural = `${word}s`) =>
  `${count} ${count === 1 ? word : plural}`;

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 100) / 10);
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${Math.round(seconds % 60)}s`;
}
