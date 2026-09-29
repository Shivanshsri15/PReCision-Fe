import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Tilt } from '../../../components/ui/Tilt';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint: ReactNode;
  icon: LucideIcon;
  loading?: boolean;
}

export function StatCard({ label, value, hint, icon: Icon, loading }: StatCardProps) {
  return (
    <Tilt max={8} glare className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-lg">
      <div className="depth-1 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="depth-2 flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/30">
          <Icon className="size-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="depth-2 mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      )}
      <div className="depth-1 mt-1 text-xs text-slate-500">{hint}</div>
    </Tilt>
  );
}
