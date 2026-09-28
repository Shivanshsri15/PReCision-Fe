import clsx from 'clsx';
import { Link } from 'react-router-dom';

export function Logo({ className, to = '/' }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={clsx('flex items-center gap-2.5', className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-extrabold text-white shadow-sm">
        P
      </span>
      <span className="text-[17px] font-bold tracking-tight text-slate-900">
        PRe<span className="text-brand-600">C</span>ision
      </span>
    </Link>
  );
}
