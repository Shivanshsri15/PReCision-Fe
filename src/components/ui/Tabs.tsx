import clsx from 'clsx';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

export interface TabItem<T extends string = string> {
  id: T;
  label: ReactNode;
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

const Count = ({ value, active }: { value: number; active: boolean }) => (
  <span
    className={clsx(
      'ml-1.5 rounded-full px-1.5 py-px text-[11px] font-semibold',
      active ? 'bg-white/25 text-current' : 'bg-slate-100 text-slate-500',
    )}
  >
    {value}
  </span>
);

/** State-driven tabs (filter chips / segmented control). */
export function Tabs<T extends string>({ items, active, onChange, variant = 'pills', className }: TabsProps<T>) {
  return (
    <div role="tablist" className={clsx('flex flex-wrap items-center gap-1', variant === 'underline' && 'border-b border-slate-200', className)}>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={clsx(
              'inline-flex items-center text-sm font-medium transition-colors',
              variant === 'pills'
                ? clsx('h-8 rounded-lg px-3', isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100')
                : clsx('-mb-px border-b-2 px-3 py-2.5', isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'),
            )}
          >
            {item.label}
            {item.count !== undefined && <Count value={item.count} active={isActive && variant === 'pills'} />}
          </button>
        );
      })}
    </div>
  );
}

export interface RouteTabItem {
  to: string;
  label: ReactNode;
  count?: number;
  end?: boolean;
}

/** Route-driven underline tabs for nested pages. */
export function RouteTabs({ items, className }: { items: RouteTabItem[]; className?: string }) {
  return (
    <nav className={clsx('flex gap-1 overflow-x-auto border-b border-slate-200', className)}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            clsx(
              '-mb-px inline-flex items-center whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800',
            )
          }
        >
          {item.label}
          {item.count !== undefined && <Count value={item.count} active={false} />}
        </NavLink>
      ))}
    </nav>
  );
}
