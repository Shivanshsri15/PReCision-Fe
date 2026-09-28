import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint: ReactNode;
  icon: LucideIcon;
  loading?: boolean;
}

export function StatCard({ label, value, hint, icon: Icon, loading }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      )}
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </Card>
  );
}
