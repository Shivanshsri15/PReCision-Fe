import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: 'default' | 'error';
  className?: string;
  iconClassName?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'default',
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div
        className={clsx(
          'mb-3 flex size-11 items-center justify-center rounded-xl',
          tone === 'error' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600',
        )}
      >
        <Icon className={clsx('size-5', iconClassName)} />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 line-clamp-6 max-w-md text-sm text-slate-500 [overflow-wrap:anywhere]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
