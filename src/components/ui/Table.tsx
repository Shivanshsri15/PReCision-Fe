import clsx from 'clsx';
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('w-full text-left text-sm', className)} {...rest} />
    </div>
  );
}

export function THead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={clsx('border-y border-slate-100 bg-slate-50/70', className)} {...rest} />;
}

export function TH({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx('whitespace-nowrap px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500', className)}
      {...rest}
    />
  );
}

export function TR({ className, onClick, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      onClick={onClick}
      className={clsx('border-b border-slate-100 last:border-0', onClick && 'cursor-pointer hover:bg-slate-50', className)}
      {...rest}
    />
  );
}

export function TD({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={clsx('px-4 py-3 align-middle text-slate-700', className)} {...rest} />;
}
