import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { Tone } from '../../utils/status';

const TONES: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  indigo: 'bg-brand-50 text-brand-700 ring-brand-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
};

interface BadgeProps {
  tone?: Tone;
  /** Overrides the tone with explicit color classes. */
  colorClassName?: string;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = 'slate', colorClassName, dot, pulse, className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        colorClassName ?? TONES[tone],
        className,
      )}
    >
      {dot && <span className={clsx('size-1.5 rounded-full bg-current', pulse && 'animate-pulse')} />}
      {children}
    </span>
  );
}
