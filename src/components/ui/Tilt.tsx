import clsx from 'clsx';
import { useRef, type HTMLAttributes, type PointerEvent } from 'react';

interface TiltProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum rotation in degrees. */
  max?: number;
  /** Adds a soft light reflection that follows the pointer. */
  glare?: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Rotates its content in 3D towards the pointer. Styling-only; content stays fully interactive. */
export function Tilt({ max = 6, glare = false, className, children, onPointerMove, onPointerLeave, ...rest }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const node = ref.current;
    if (!node || event.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    node.style.setProperty('--tilt-x', `${(0.5 - y) * max * 2}deg`);
    node.style.setProperty('--tilt-y', `${(x - 0.5) * max * 2}deg`);
    node.style.setProperty('--glare-x', `${x * 100}%`);
    node.style.setProperty('--glare-y', `${y * 100}%`);
    node.dataset.tilting = 'true';
  };

  const leave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--tilt-x', '0deg');
    node.style.setProperty('--tilt-y', '0deg');
    delete node.dataset.tilting;
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={clsx('tilt group/tilt relative', className)}
      {...rest}
    >
      {children}
      {glare && <span aria-hidden className="tilt-glare pointer-events-none absolute inset-0 rounded-[inherit]" />}
    </div>
  );
}
