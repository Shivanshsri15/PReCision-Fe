import clsx from 'clsx';

const SIZES = { xs: 'size-5 text-[10px]', sm: 'size-7 text-xs', md: 'size-9 text-sm', lg: 'size-16 text-xl' };

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export function Avatar({ src, name, size = 'sm', className }: AvatarProps) {
  const classes = clsx('shrink-0 rounded-full ring-1 ring-slate-200', SIZES[size], className);
  if (src) return <img src={src} alt={name} className={clsx(classes, 'object-cover')} />;
  return (
    <span className={clsx(classes, 'inline-flex items-center justify-center bg-brand-100 font-semibold uppercase text-brand-700')}>
      {name.slice(0, 1) || '?'}
    </span>
  );
}
