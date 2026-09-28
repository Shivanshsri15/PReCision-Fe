import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const SIZES = { sm: 'size-4', md: 'size-5', lg: 'size-8' };

export function Spinner({ size = 'md', className }: { size?: keyof typeof SIZES; className?: string }) {
  return <Loader2 aria-label="Loading" className={clsx('animate-spin', SIZES[size], className)} />;
}

export function PageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner size="lg" className="text-brand-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
